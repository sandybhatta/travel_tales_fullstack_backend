import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

// __dirname fix for ES Module
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

// Function to send OTP email
export const sendOTPEmail = async (email, username, otp, type = "login") => {
  try {
    const templatePath = path.join(__dirname, "../emails/otp.ejs");

    const html = await ejs.renderFile(templatePath, {
      username,
      otp,
      expiresIn: 10,
    });

    const subject =
      type === "login"
        ? "Your TravelTales OTP for Login"
        : "🔐 Your TravelTales OTP for Password Reset";

    const mailOptions = {
      from: `"TravelTales Support" <${process.env.SMTP_USER}>`, // Must match verified Brevo sender
      to: email,
      bcc: process.env.SMTP_USER,                                   // optional log copy
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error.response || error);
    throw new Error("OTP email could not be sent via Brevo SMTP.");
  }
};
