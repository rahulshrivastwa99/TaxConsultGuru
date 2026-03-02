const { BrevoClient } = require('@getbrevo/brevo');

const sendEmail = async (options) => {
  const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
  });

  // Safely capture the content whether your controllers send 'html', 'message', or 'text'
  const emailContent = options.html || options.message || options.text || "<p>No content provided.</p>";

  const emailData = {
    subject: options.subject || 'Notification from TaxConsultGuru',
    to: [{ email: options.email }],
    sender: { 
      name: process.env.BREVO_SENDER_NAME || 'TaxconsultGuru', 
      email: process.env.BREVO_SENDER_EMAIL 
    },
    htmlContent: emailContent
  };

  try {
    const data = await brevo.transactionalEmails.sendTransacEmail(emailData);
    console.log('✅ Email sent successfully via Brevo. Message ID: ' + data.messageId);
    return data;
  } catch (error) {
    // Better error logging to see exactly what Brevo is complaining about
    console.error('❌ Brevo API Error Details:', error.body || error.message);
    throw new Error('Failed to send email via Brevo API');
  }
};

module.exports = sendEmail;