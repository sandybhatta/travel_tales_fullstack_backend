
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
 * Generic function to send an email via Brevo API
 */
export const sendEmail = async ({ toEmail, subject, templatePath, templateData }) => {
  try {
    const htmlContent = await ejs.renderFile(templatePath, templateData);

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
      to: [{ email: toEmail }],
      sender: { name: 'TravelTales Support', email: "sandipresponse256@gmail.com" },
      subject,
      htmlContent,
    });

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent:', result.messageId || result);
  } catch (error) {
    console.error('❌ Email sending failed via Brevo API:', error);
    throw new Error('Email could not be sent');
  }
};
