import SibApiV3Sdk from 'sib-api-v3-sdk';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Brevo client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Send email using Brevo API + EJS template
 */
export const sendEmail = async ({ toEmail, subject, templatePath, templateData }) => {
  try {
    // Render dynamic HTML
    const htmlContent = await ejs.renderFile(templatePath, templateData);

    // Prepare message
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
      to: [{ email: toEmail }],
      sender: { name: 'TravelTales Support', email: 'noreply@traveltalesapp.in' }, // ✅ Use your domain email
      subject,
      htmlContent,
    });

    // Send via Brevo
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully:', result.messageId || result);
  } catch (error) {
    console.error('❌ Email sending failed:', error.response?.body || error);
    throw new Error('Email could not be sent');
  }
};
