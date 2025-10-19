import SibApiV3Sdk from "sib-api-v3-sdk";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Brevo client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY; // Add BREVO_API_KEY in your .env

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Send verification email via Brevo API
 */
export async function sendEmail(email, username, token, message) {
  try {
    const templatePath = path.join(__dirname, "../emails/verifyEmail.ejs");
    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    // Render EJS template
    const htmlContent = await ejs.renderFile(templatePath, { username, verifyLink, message });

    // Brevo API email object
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
      to: [{ email }],
      sender: { name: "TravelTales Support", email: process.env.SMTP_USER },
      subject: `Verify your email, ${username}`,
      htmlContent,
      bcc: [{ email: process.env.SMTP_USER }], // optional log copy
    });

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Verification email sent via Brevo API: ${result.messageId || result}`);
  } catch (error) {
    console.error("❌ Email sending failed via Brevo API:", error);
    throw new Error("Email could not be sent via Brevo API");
  }
}
