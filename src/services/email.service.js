import transporter from '../config/email.js';
import logger from '../config/logger.js';

export const sendInquiryNotification = async (agentEmail, buyerName, listingTitle) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: agentEmail,
      subject: `New Inquiry for ${listingTitle}`,
      html: `
        <h2>New Inquiry Received</h2>
        <p>You have received a new inquiry from <strong>${buyerName}</strong> 
        for your listing: <strong>${listingTitle}</strong></p>
        <p>Login to your account to view and respond to the inquiry.</p>
      `,
    });

    logger.info(`Inquiry notification sent to ${agentEmail}`);
  } catch (error) {
    logger.error('Error sending inquiry notification:', error);
  }
};

export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Welcome to Real Estate API',
      html: `
        <h2>Welcome ${userName}!</h2>
        <p>Thank you for registering with our Real Estate platform.</p>
        <p>You can now browse thousands of property listings.</p>
      `,
    });

    logger.info(`Welcome email sent to ${userEmail}`);
  } catch (error) {
    logger.error('Error sending welcome email:', error);
  }
};