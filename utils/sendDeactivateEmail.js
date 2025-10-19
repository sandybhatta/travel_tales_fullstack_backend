import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

// Get __dirname (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nodemailer transporter using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // Brevo SMTP host
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,                     // true only if port=465
  auth: {
    user: process.env.SMTP_USER,     // Brevo SMTP login
    pass: process.env.SMTP_PASSWORD, // Brevo SMTP password
  },
});

// Function to send account deactivation email
export const sendDeactivateEmail = async (email, username) => {
  try {
    const templatePath = path.join(__dirname, "../emails/accountDeactivated.ejs");

    const loginUrl = `${process.env.CLIENT_URL}/login`;

    // Render EJS template
    const html = await ejs.renderFile(templatePath, {
      username,
      loginUrl,
    });

    const mailOptions = {
      from: `"TravelTales Support" <${process.env.SMTP_USER}>`, // Must match verified Brevo sender
      to: email,
      subject: "Your Account is Deactivated",
      html,
    };

    // Send the mail
    await transporter.sendMail(mailOptions);
    console.log(`✅ Deactivation email sent to ${email}`);
  } catch (err) {
    console.error("❌ Failed to send deactivation email:", err.message);
    throw new Error("Deactivation email failed via Brevo SMTP.");
  }
};
