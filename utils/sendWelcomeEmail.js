import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

// For __dirname support in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Function to send welcome email
export const sendWelcomeEmail = async (user) => {
  try {
    const templatePath = path.join(__dirname, "../emails/welcomeEmail.ejs");

    const html = await ejs.renderFile(templatePath, {
      username: user.username,
    });

    const mailOptions = {
      from: `"TravelTales" <${process.env.SMTP_USER}>`, // Must match verified Brevo sender
      to: user.email,
      bcc: process.env.SMTP_USER,                        // optional log copy
      subject: "🎉 Welcome to TravelTales!",
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error("❌ Welcome email failed:", error);
    throw new Error("Could not send welcome email via Brevo SMTP");
  }
};
