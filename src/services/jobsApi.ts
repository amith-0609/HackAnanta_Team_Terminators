// RapidAPI Jobs API Integration (via Backend Proxy)
export const BACKEND_URL = 'http://localhost:5002';

export interface JobListing {
    id: string;
    title: string;
    role?: string; // Alternative to title for backwards compatibility
    company: string;
    location: string;
    datePosted: string;
    salary?: string;
    description: string;
    employmentType: string;
    experienceLevel?: string;
    url: string;
    companyLogo?: string;
    logo?: string; // Alternative to companyLogo for backwards compatibility
    tags?: string[]; // Skills/technologies
    match?: number; // Match percentage (calculated client-side)
    isNew?: boolean; // Whether the job is newly posted
}

export interface SearchParams {
    query?: string;
    location?: string;
    experienceLevels?: string;
    workplaceTypes?: string;
    datePosted?: string;
    employmentTypes?: string;
}

/**
 * Fetch job listings from RapidAPI via backend proxy
 */
export async function fetchJobs(params: SearchParams = {}): Promise<JobListing[]> {
    const {
        query = 'internship',
        location = 'Remote',
        experienceLevels = 'intern;entry;associate',
        workplaceTypes = 'remote;hybrid;onSite',
        datePosted = 'month',
        employmentTypes = 'intern;fulltime;parttime'
    } = params;

    // Use backend proxy to avoid CORS issues
    const url = new URL(`${BACKEND_URL}/api/jobs`);
    url.searchParams.append('query', query);
    url.searchParams.append('location', location);
    url.searchParams.append('experienceLevels', experienceLevels);
    url.searchParams.append('workplaceTypes', workplaceTypes);
    url.searchParams.append('datePosted', datePosted);
    url.searchParams.append('employmentTypes', employmentTypes);

    try {
        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Map the API response to our internal format
        return mapApiResponseToJobs(data);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        throw error;
    }
}

/**
 * Map RapidAPI response to our JobListing interface
 */
function mapApiResponseToJobs(apiResponse: any): JobListing[] {
    if (!apiResponse || !apiResponse.data || !Array.isArray(apiResponse.data)) {
        return [];
    }

    return apiResponse.data.map((job: any, index: number) => {
        // Extract tags from job description or use default tech stack
        const tags = extractTagsFromJob(job);

        // Determine if job is new (posted within last 7 days)
        // Handle both camelCase and snake_case
        const datePosted = job.datePosted || job.date_posted || new Date().toISOString();
        const isNew = isJobNew(datePosted);

        // Calculate a base match score (can be refined with user preferences later)
        const match = calculateBaseMatch(job);

        const logo = job.company_logo || job.companyLogo || job.logo || generatePlaceholderLogo(job.company);

        return {
            id: job.id || `job-${index}`,
            title: job.title || 'Untitled Position',
            role: job.title || 'Untitled Position', // Backwards compatibility
            company: job.company || 'Company',
            location: job.location || 'Location not specified',
            datePosted: datePosted,
            salary: job.salary || 'Not specified',
            description: job.description || job.snippet || 'No description available',
            employmentType: job.employmentType || job.employment_type || 'Internship',
            experienceLevel: job.experienceLevel || job.experience_level || 'Entry Level',
            url: job.job_url || job.url || job.jobUrl || '#',
            companyLogo: logo,
            logo: logo, // Backwards compatibility
            tags,
            match,
            isNew,
        };
    });
}

/**
 * Extract relevant tags/skills from job data
 */
function extractTagsFromJob(job: any): string[] {
    const tags: string[] = [];
    const text = `${job.title} ${job.description || ''} ${job.snippet || ''}`.toLowerCase();

    // Common tech skills to look for
    const skillKeywords = [
        'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Azure',
        'ML', 'Machine Learning', 'AI', 'Data Science', 'SQL', 'MongoDB', 'GraphQL',
        'Full Stack', 'Frontend', 'Backend', 'DevOps', 'Cloud', 'Docker', 'Kubernetes',
        'UI/UX', 'Design', 'Figma', 'Swift', 'iOS', 'Android', 'Mobile', 'Web',
        'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Django', 'Flask', 'Spring',
        'Angular', 'Vue', 'Next.js', 'Express', 'PostgreSQL', 'Redis', 'Git'
    ];

    skillKeywords.forEach(skill => {
        if (text.includes(skill.toLowerCase())) {
            tags.push(skill);
        }
    });

    // Limit to 5 most relevant tags
    return tags.slice(0, 5);
}

/**
 * Check if job was posted recently (within 7 days)
 */
function isJobNew(datePosted?: string): boolean {
    if (!datePosted) return false;

    try {
        const postDate = new Date(datePosted);
        const now = new Date();
        const daysDiff = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
    } catch {
        return false;
    }
}

/**
 * Calculate a base match score for a job (70-95 range)
 */
function calculateBaseMatch(job: any): number {
    let score = 70; // Base score

    // Boost for internship-specific roles
    if (job.title?.toLowerCase().includes('intern')) score += 10;

    // Boost for entry-level positions
    if (job.experienceLevel?.toLowerCase().includes('entry')) score += 5;

    // Boost for remote/hybrid
    if (job.location?.toLowerCase().includes('remote') ||
        job.location?.toLowerCase().includes('hybrid')) score += 5;

    // Boost for well-known companies (if logo is available)
    if (job.companyLogo && !job.companyLogo.includes('placeholder')) score += 5;

    return Math.min(95, score);
}

/**
 * Generate a placeholder logo URL based on company name
 */
function generatePlaceholderLogo(companyName?: string): string {
    if (!companyName) return 'https://via.placeholder.com/120';

    // Try to use UI Avatars for company initials
    const initials = companyName
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&size=120`;
}

/**
 * Search for specific internship opportunities
 */
export async function searchInternships(searchQuery: string, location: string = 'Worldwide'): Promise<JobListing[]> {
    return fetchJobs({
        query: searchQuery || 'internship',
        location,
        experienceLevels: 'intern;entry',
        employmentTypes: 'intern;fulltime;parttime',
        datePosted: 'month',
    });
}

/**
 * Get internships by specific technology or field
 */
export async function getInternshipsByField(field: string): Promise<JobListing[]> {
    return fetchJobs({
        query: `${field} internship`,
        experienceLevels: 'intern;entry',
        employmentTypes: 'intern',
        datePosted: 'month',
    });
}

/**
 * Parse resume to extract skills
 */
export async function parseResume(file: File): Promise<{ skills: string[], text: string }> {
    const formData = new FormData();
    formData.append('resume', file);

    try {
        const response = await fetch(`${BACKEND_URL}/api/parse-resume`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Resume parsing failed: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            skills: data.skills || [],
            text: data.text_preview || ''
        };
    } catch (error) {
        console.error('Error parsing resume:', error);
        throw error;
    }
}
