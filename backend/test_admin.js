const axios = require('axios');

async function testAdmin() {
  const email = `admin_${Date.now()}@example.com`;
  
  console.log(`Testing with email: ${email}`);
  
  try {
    console.log("1. Registering Admin...");
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: "Admin User",
      email: email,
      password: "password123",
      role: "admin"
    });
    console.log("Registration Response:", regRes.status, regRes.data);

    console.log("\n2. Logging in Admin...");
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: email,
      password: "password123",
      role: "admin"
    });
    console.log("Login Response:", loginRes.status, loginRes.data);
    
    if (loginRes.data.token) {
        console.log("\nSUCCESS: Admin logged in without OTP.");
    }

  } catch (error) {
    console.error("ERROR:", error.response ? error.response.data : error.message);
  }
}

testAdmin();
