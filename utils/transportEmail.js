import ejs from "ejs";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

// 👇 Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// transport smtp settings using Brevo
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // smtp-relay.brevo.com
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true only if port=465
  auth: {
    user: process.env.SMTP_USER, // Brevo SMTP login
    pass: process.env.SMTP_PASSWORD, // Brevo SMTP password
  },
});

// function to send verification email using Brevo SMTP
export async function sendEmail(email, username, token, message) {
  try {
    const templatePath = path.join(__dirname, "../emails/verifyEmail.ejs");

    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const html = await ejs.renderFile(templatePath, { username, verifyLink, message });

    await transport.sendMail({
      from: `TravelTales <${process.env.SMTP_USER}>`, // Must match your verified Brevo sender
      to: email,
      bcc: `${process.env.SMTP_USER}`, // optional log copy
      subject: `Verify your email, ${username}`,
      html,
    });

    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Email could not be sent via Brevo SMTP");
  }
}
