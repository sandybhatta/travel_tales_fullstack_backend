import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// To get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Nodemailer transporter using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // Brevo SMTP host
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,                     // true only if port = 465
  auth: {
    user: process.env.SMTP_USER,     // Brevo SMTP login
    pass: process.env.SMTP_PASSWORD, // Brevo SMTP password
  },
});

// Function to send account reactivation email
export const sendReactivationEmail = async (email, username) => {
  try {
    // Template path
    const templatePath = path.join(__dirname, "../emails/accountReactivated.ejs");

    // Frontend login URL
    const loginUrl = `${process.env.CLIENT_URL}/login`;

    // Render EJS template
    const html = await ejs.renderFile(templatePath, {
      username,
      loginUrl,
    });

    // Mail options
    const mailOptions = {
      from: `"TravelTales Support" <${process.env.SMTP_USER}>`, // Must match verified Brevo sender
      to: email,
      bcc: process.env.SMTP_USER,                                   // optional log copy
      subject: "Your Account Has Been Reactivated - TravelTales",
      html,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Reactivation email sent to ${email}`);
  } catch (err) {
    console.error("❌ Failed to send reactivation email:", err.message);
    throw new Error("Reactivation email failed to send via Brevo SMTP.");
  }
};
