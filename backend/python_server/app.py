from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import json
import re
import xml.etree.ElementTree as ET

app = Flask(__name__)
CORS(app)

def fetch_rss_jobs(query):
    """Fetch real jobs from WeWorkRemotely RSS feed"""
    rss_jobs = []
    try:
        # WeWorkRemotely RSS Feed
        url = "https://weworkremotely.com/categories/remote-programming-jobs.rss"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            root = ET.fromstring(response.content)
            
            # Parse RSS items
            for item in root.findall('.//item'):
                title = item.find('title').text if item.find('title') is not None else 'N/A'
                description = item.find('description').text if item.find('description') is not None else 'No description'
                link = item.find('link').text if item.find('link') is not None else '#'
                pub_date = item.find('pubDate').text if item.find('pubDate') is not None else 'Recently'
                
                # Simple filter based on query
                if query.lower() in title.lower() or query.lower() in description.lower():
                    # Extract company from title (usually "Role: Company" or "Company: Role")
                    company = "WeWorkRemotely"
                    if ':' in title:
                        parts = title.split(':')
                        company = parts[0].strip()
                        title = parts[1].strip()
                    
                    rss_jobs.append({
                        'id': f'rss-{len(rss_jobs)}',
                        'title': title,
                        'company': company,
                        'company_logo': f'https://logo.clearbit.com/{company.replace(" ", "").lower()}.com',
                        'location': 'Remote',
                        'date_posted': pub_date[:16], # Truncate date
                        'salary': 'Competitive',
                        'description': BeautifulSoup(description, "html.parser").get_text()[:200] + "...", # Clean HTML
                        'job_url': link,
                        'site': 'WeWorkRemotely'
                    })
                    
                    if len(rss_jobs) >= 5: # Limit RSS results
                        break
    except Exception as e:
        print(f"Error fetching RSS: {e}")
        
    return rss_jobs

def scrape_indeed_jobs(query, location='United States', num_results=20):
    """Scrape jobs from Indeed"""
    jobs = []
    try:
        # Indeed search URL
        url = f"https://www.indeed.com/jobs?q={query.replace(' ', '+')}&l={location.replace(' ', '+')}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find job cards
        job_cards = soup.find_all('div', class_=re.compile('job_seen_beacon'))[:num_results]
        
        for idx, card in enumerate(job_cards):
            try:
                title_elem = card.find('h2', class_='jobTitle')
                company_elem = card.find('span', {'data-testid': 'company-name'})
                location_elem = card.find('div', {'data-testid': 'text-location'})
                snippet_elem = card.find('div', class_='job-snippet')
                
                job = {
                    'id': f'indeed-{idx}',
                    'title': title_elem.get_text(strip=True) if title_elem else 'N/A',
                    'company': company_elem.get_text(strip=True) if company_elem else 'N/A',
                    'company_logo': None,
                    'location': location_elem.get_text(strip=True) if location_elem else location,
                    'date_posted': 'Recently',
                    'salary': 'Not specified',
                    'description': snippet_elem.get_text(strip=True) if snippet_elem else 'No description',
                    'job_url': f"https://www.indeed.com{title_elem.find('a')['href']}" if title_elem and title_elem.find('a') else '#',
                    'site': 'Indeed'
                }
                jobs.append(job)
            except Exception as e:
                print(f"Error parsing job card: {e}")
                continue
                
    except Exception as e:
        print(f"Error scraping Indeed: {e}")
    
    return jobs

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
        
        # 1. Try to fetch real RSS jobs
        rss_jobs = fetch_rss_jobs(query)
        print(f"📰 Found {len(rss_jobs)} RSS jobs")
        
        # 2. Try to scrape Indeed
        indeed_jobs = scrape_indeed_jobs(query, location, results_wanted)
        print(f"🕷️ Found {len(indeed_jobs)} Indeed jobs")
        
        # 3. Get sample jobs
        sample_jobs = get_sample_jobs(query)
        
        # Combine all jobs: RSS -> Indeed -> Sample
        all_jobs = rss_jobs + indeed_jobs + sample_jobs
        
        print(f"✅ Returning {len(all_jobs)} total jobs")
        return jsonify({'data': all_jobs, 'count': len(all_jobs)})
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        # Return sample data on error
        jobs = get_sample_jobs(request.args.get('query', 'software engineer'))
        return jsonify({'data': jobs, 'count': len(jobs)})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'Job Scraper API'})

if __name__ == '__main__':
    print("🚀 Starting Job Scraper server on http://localhost:5002")
    app.run(host='0.0.0.0', port=5002, debug=True)
