from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import pandas as pd
import json

# Add JobSpy to path
current_dir = os.path.dirname(os.path.abspath(__file__))
jobspy_path = os.path.join(current_dir, '..', 'JobSpy')
sys.path.append(jobspy_path)

try:
    from jobspy import scrape_jobs
except ImportError as e:
    print(f"Error importing JobSpy: {e}")
    scrape_jobs = None

app = Flask(__name__)
CORS(app)

def get_sample_jobs(query):
    """Return expanded sample jobs based on query with deep links"""
    # Format query for URLs
    q_encoded = query.replace(' ', '%20')
    q_plus = query.replace(' ', '+')
    
    companies = [
        ('Google', 'Mountain View, CA', f'https://www.google.com/about/careers/applications/jobs/results?q={q_encoded}'),
        ('Microsoft', 'Redmond, WA', f'https://jobs.careers.microsoft.com/global/en/search?q={q_encoded}'),
        ('Amazon', 'Seattle, WA', f'https://www.amazon.jobs/en/search?base_query={q_plus}'),
        ('Meta', 'Menlo Park, CA', f'https://www.metacareers.com/jobs?q={q_encoded}'),
        ('Apple', 'Cupertino, CA', f'https://jobs.apple.com/en-us/search?search={q_encoded}'),
        ('Netflix', 'Los Gatos, CA', f'https://jobs.netflix.com/search?q={q_encoded}'),
        ('Tesla', 'Austin, TX', f'https://www.tesla.com/careers/search/?query={q_encoded}'),
        ('Spotify', 'New York, NY', f'https://www.lifeatspotify.com/jobs?q={q_encoded}'),
        ('Adobe', 'San Jose, CA', f'https://careers.adobe.com/us/en/search-results?keywords={q_encoded}'),
        ('Salesforce', 'San Francisco, CA', f'https://careers.salesforce.com/en/search-results?keywords={q_encoded}'),
        ('Uber', 'San Francisco, CA', f'https://www.uber.com/global/en/careers/list/?keywords={q_encoded}'),
        ('Airbnb', 'San Francisco, CA', f'https://careers.airbnb.com/positions/?keyword={q_encoded}')
    ]
    
    sample_jobs = []
    for i, (company, location, url) in enumerate(companies):
        sample_jobs.append({
            'id': f'sample-{i+1}',
            'title': f'{query} - {company} Intern',
            'company': company,
            'company_logo': f'https://logo.clearbit.com/{company.lower()}.com',
            'location': location,
            'date_posted': f'{i+1} days ago',
            'salary': f'${40 + i}-60/hour',
            'description': f'Join {company} as a {query} intern. Work on cutting-edge technology and collaborate with world-class engineers on scalable systems.',
            'job_url': url,
            'site': 'Sample'
        })
        
    return sample_jobs

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        query = request.args.get('query', 'software engineer intern')
        location = request.args.get('location', 'United States')
        results_wanted = int(request.args.get('results_wanted', 20))
        
        print(f"🔍 Searching for: {query} in {location}")
        
        if not scrape_jobs:
            print("⚠️ JobSpy not loaded, returning sample data")
            jobs = get_sample_jobs(query)
            return jsonify({'data': jobs, 'count': len(jobs)})

        # Scrape jobs using JobSpy
        # Sites: Indeed, Glassdoor, ZipRecruiter
        # Handle "Worldwide" location which might fail on specific country scrapers
        scrape_location = location
        if not location or location.lower() == 'worldwide':
            scrape_location = 'Remote'
            
        # Smart Search Logic
        
        # 1. Keyword Expansion Map
        keyword_map = {
            'frontend': 'react, angular, vue, javascript, typescript',
            'backend': 'node.js, python, java, spring boot, django, flask',
            'fullstack': 'react, node.js, python, java, javascript',
            'python': 'django, flask, fastAPI, data science, machine learning',
            'java': 'spring boot, hibernate, kotlin',
            'data scientist': 'python, machine learning, ai, sql',
            'mobile': 'ios, android, react native, flutter, swift, kotlin'
        }
        
        search_terms = [query]
        
        # Check for keyword expansion
        for key, value in keyword_map.items():
            if key in query.lower():
                search_terms.append(f"{query}, {value}")
                
        print(f"🔍 Search strategy: {search_terms}")
        
        all_jobs_df = pd.DataFrame()
        
        # 2. Execute Search
        for term in search_terms:
            print(f"Attempting to scrape jobs for '{term}' in '{scrape_location}'...")
            
            try:
                jobs_df = scrape_jobs(
                    site_name=["indeed", "glassdoor", "zip_recruiter"],
                    search_term=term,
                    location=scrape_location,
                    results_wanted=40, # Increased to ensure we get enough after filtering
                    hours_old=168, # Relaxed to 7 days to find more jobs
                    country_indeed='usa'
                )
                
                if not jobs_df.empty:
                    all_jobs_df = pd.concat([all_jobs_df, jobs_df], ignore_index=True)
                    
                # If we found enough jobs with the primary term, stop
                if len(all_jobs_df) >= 50:
                    break
            except Exception as e:
                print(f"⚠️ Error scraping for term '{term}': {e}")
                continue
        
        # 3. Process and Rank Results
        if not all_jobs_df.empty:
            # Clean up company names
            all_jobs_df['company'] = all_jobs_df['company'].fillna('').astype(str).str.strip()
            
            # Filter out bad data (generic company names)
            # We normalize to alphanumeric only to catch variations like "Company." or " Company "
            all_jobs_df['company_clean'] = all_jobs_df['company'].str.lower().str.replace(r'[^a-z0-9]', '', regex=True)
            bad_companies = ['company', 'unknown', 'unknowncompany', 'employer', 'confidential', 'inc', 'corporation', 'llc']
            
            # Debug print
            print(f"Companies before filter: {all_jobs_df['company'].unique()[:10]}")
            
            all_jobs_df = all_jobs_df[~all_jobs_df['company_clean'].isin(bad_companies)]
            
            # Clean up Titles (remove "internship - " prefix)
            all_jobs_df['title'] = all_jobs_df['title'].str.replace(r'^internship\s*-\s*', '', case=False, regex=True)
            all_jobs_df['title'] = all_jobs_df['title'].str.replace(r'\s*-\s*intern$', '', case=False, regex=True)
            
            # Remove duplicates based on job_url
            all_jobs_df = all_jobs_df.drop_duplicates(subset=['job_url'])
            
            # Aggressive Deduplication: Title + Company
            # We ignore location because "Remote" vs "Remote, US" vs "Location not specified" causes duplicates
            all_jobs_df['norm_title'] = all_jobs_df['title'].astype(str).str.lower().str.strip()
            all_jobs_df['norm_company'] = all_jobs_df['company'].astype(str).str.lower().str.strip()
            
            # Create a simple dedup key
            all_jobs_df['dedup_key'] = all_jobs_df['norm_title'] + "_" + all_jobs_df['norm_company']
            
            # Keep the first occurrence (which is usually the most relevant/recent if we sorted, but we haven't sorted by date yet)
            # Let's sort by date first to keep the newest one
            if 'date_posted' in all_jobs_df.columns:
                all_jobs_df['date_posted'] = pd.to_datetime(all_jobs_df['date_posted'], errors='coerce')
                all_jobs_df = all_jobs_df.sort_values(by='date_posted', ascending=False)
                
            all_jobs_df = all_jobs_df.drop_duplicates(subset=['dedup_key'])
            
            print(f"✅ Scrape complete. Found {len(all_jobs_df)} unique jobs")
            jobs_df = all_jobs_df.head(50) # Limit to top 50
        else:
            print("⚠️ No jobs found via scraping")
            jobs_df = pd.DataFrame()
        
        # Convert DataFrame to list of dicts
        jobs_data = []
        if not jobs_df.empty:
            # Handle NaN values
            jobs_df = jobs_df.fillna('')
            
            for index, row in jobs_df.iterrows():
                # Better logo logic
                logo_url = None
                
                # 1. Try direct company logo from scraper
                if row.get('company_logo'):
                     logo_url = row.get('company_logo')
                
                # 2. Try to generate from company URL if available
                if not logo_url:
                    company_url = row.get('company_url') or row.get('company_url_direct')
                    if company_url:
                        try:
                            # Extract domain from URL (simple way)
                            from urllib.parse import urlparse
                            domain = urlparse(company_url).netloc.replace('www.', '')
                            if domain:
                                logo_url = f"https://logo.clearbit.com/{domain}"
                        except:
                            pass
                
                # 3. Fallback: Guess domain from company name
                # Only do this if we have a valid company name
                if not logo_url and row.get('company') and row.get('company').lower() not in bad_companies:
                    clean_company = str(row.get('company', '')).replace(' ', '').replace(',', '').replace('.', '').lower()
                    # Try Clearbit first
                    logo_url = f"https://logo.clearbit.com/{clean_company}.com"
                
                # 4. Final Fallback: UI Avatars (Generates initials)
                # This ensures we never have a broken or empty logo
                if not logo_url and row.get('company'):
                     safe_company = str(row.get('company', '')).replace(' ', '+')
                     logo_url = f"https://ui-avatars.com/api/?name={safe_company}&background=random&color=fff&size=128"

                # Map JobSpy fields to our frontend format
                job = {
                    'id': f"{row.get('site', 'job')}-{index}",
                    'title': row.get('title', 'Untitled'),
                    'company': row.get('company', 'Unknown Company'),
                    'company_logo': logo_url,
                    'location': row.get('location', 'Remote'),
                    'date_posted': str(row.get('date_posted', 'Recently')),
                    'salary': f"{row.get('min_amount', '')} - {row.get('max_amount', '')} {row.get('currency', '')}" if row.get('min_amount') else 'Competitive',
                    'description': row.get('description', 'No description available'),
                    'job_url': row.get('job_url', '#'),
                    'site': row.get('site', 'Unknown')
                }
                jobs_data.append(job)
        
        # If no jobs found, fallback to sample data
        if not jobs_data:
            print("⚠️ No jobs found via scraping, returning sample data")
            jobs_data = get_sample_jobs(query)
            
        return jsonify({'data': jobs_data, 'count': len(jobs_data)})
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        # Return sample data on error
        jobs = get_sample_jobs(request.args.get('query', 'software engineer'))
        return jsonify({'data': jobs, 'count': len(jobs)})

@app.route('/api/parse-resume', methods=['POST'])
def parse_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file provided'}), 400
            
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if file and file.filename.lower().endswith('.pdf'):
            import PyPDF2
            import io
            import re
            
            # Read PDF from memory
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.read()))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + " "
                
            # Extract skills using regex
            # Common tech skills
            skills_db = [
                'python', 'java', 'javascript', 'typescript', 'react', 'node.js', 'aws', 'azure',
                'docker', 'kubernetes', 'sql', 'mongodb', 'graphql', 'html', 'css', 'git',
                'machine learning', 'data science', 'ai', 'c++', 'c#', 'go', 'rust', 'ruby',
                'php', 'swift', 'kotlin', 'flutter', 'react native', 'next.js', 'vue', 'angular',
                'django', 'flask', 'spring boot', 'fastapi', 'tensorflow', 'pytorch', 'pandas',
                'numpy', 'scikit-learn', 'nlp', 'opencv', 'linux', 'bash', 'jenkins', 'terraform'
            ]
            
            found_skills = []
            text_lower = text.lower()
            
            for skill in skills_db:
                # Simple check: if skill is in text
                # For short words like 'go' or 'ai', we need word boundaries
                if len(skill) <= 3:
                    if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                        found_skills.append(skill)
                else:
                    if skill in text_lower:
                        found_skills.append(skill)
            
            # Remove duplicates and sort
            found_skills = sorted(list(set(found_skills)))
            
            print(f"✅ Parsed resume. Found skills: {found_skills}")
            return jsonify({'skills': found_skills, 'text_preview': text[:200]})
            
        else:
            return jsonify({'error': 'Only PDF files are supported for now'}), 400

    except Exception as e:
        print(f"❌ Error parsing resume: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'Job Scraper API'})

if __name__ == '__main__':
    print("🚀 Starting Job Scraper server on http://localhost:5002")
    app.run(host='0.0.0.0', port=5002, debug=True)
