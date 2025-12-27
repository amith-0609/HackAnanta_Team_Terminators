// Quick test to verify backend connection
fetch('http://localhost:5001/api/jobs?query=internship')
    .then(res => res.json())
    .then(data => {
        console.log('✅ BACKEND IS WORKING! Got', data.jobs?.length || 0, 'jobs');
        console.log('Sample job:', data.jobs?.[0]);
    })
    .catch(err => {
        console.error('❌ BACKEND CONNECTION FAILED:', err);
    });
