import nodemailer from 'nodemailer';

/**
 * Send an email using Nodemailer.
 * Auto-creates a test Ethereal account if SMTP configuration is not fully provided in .env
 * @param {object} options - Email options (email, subject, message, html)
 */
const sendEmail = async (options) => {
  let transporter;

  const hasConfig =
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (hasConfig) {
    // Use configured SMTP credentials
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test SMTP service on the fly (Ethereal Email)
    console.log('No SMTP config found. Generating Ethereal test mail account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`Ethereal account created. User: ${testAccount.user}`);
    } catch (err) {
      console.error('Failed to create Ethereal SMTP transporter, using console log fallback.', err);
      // Terminal fallback
      console.log('=============== MOCK EMAIL SENT ===============');
      console.log(`To: ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Message: ${options.message}`);
      console.log('================================================');
      return;
    }
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || 'EventFlow <noreply@eventflow.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    
    // If using Ethereal, log the preview URL
    if (!hasConfig) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

export default sendEmail;
