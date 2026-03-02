require('dotenv').config(); // This loads your .env variables
const sendEmail = require('./utils/sendEmail'); // Imports your new Brevo setup

const runTest = async () => {
  try {
    console.log('Attempting to send test email via Brevo...');
    
    await sendEmail({
      email: 'sem04cse@gmail.com', // <-- REPLACE THIS with your actual receiving email
      subject: 'TaxConsultGuru: Brevo Integration Test',
      message: '<h1>Success!</h1><p>Rahul, if you are reading this, your Brevo backend integration is working perfectly.</p>'
    });
    
    console.log('✅ Test completed successfully!');
    process.exit(0); // Exits the script
  } catch (error) {
    console.error('❌ Test failed. Error details:', error);
    process.exit(1);
  }
};

runTest();