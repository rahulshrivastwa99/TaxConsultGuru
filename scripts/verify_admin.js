const fetch = require('node-fetch');

async function verify() {
  const API_URL = 'http://localhost:5000/api';
  
  try {
    console.log("Fetching pending CAs...");
    const casRes = await fetch(`${API_URL}/admin/pending-cas`);
    const cas = await casRes.json();
    console.log(`Found ${cas.length} pending CAs`);

    console.log("Fetching pending jobs...");
    const jobsRes = await fetch(`${API_URL}/admin/pending-jobs`);
    const jobs = await jobsRes.json();
    console.log(`Found ${jobs.length} pending jobs`);

    if (cas.length > 0) {
      console.log(`Verifying CA: ${cas[0].name}...`);
      const verifyRes = await fetch(`${API_URL}/admin/verify-ca/${cas[0]._id}`, { method: 'PATCH' });
      const verifyData = await verifyRes.json();
      console.log("Response:", verifyData.message);
    }

    if (jobs.length > 0) {
      console.log(`Approving Job: ${jobs[0].serviceName}...`);
      const approveRes = await fetch(`${API_URL}/admin/approve-job/${jobs[0]._id}`, { method: 'PATCH' });
      const approveData = await approveRes.json();
      console.log("Response:", approveData.message);
    }

    console.log("Verification complete!");
  } catch (error) {
    console.error("Verification failed:", error.message);
  }
}

verify();
