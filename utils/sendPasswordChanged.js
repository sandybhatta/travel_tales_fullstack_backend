import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

// __dirname support for ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Function to send password changed email
export const sendPasswordChangedEmail = async (name, email) => {
  try {
    const templatePath = path.join(__dirname, "../emails/passwordChanged.ejs");

    const html = await ejs.renderFile(templatePath, {
      name,
      time: new Date().toLocaleString(),
    });

    const mailOptions = {
      from: `"TravelTales Support" <${process.env.SMTP_USER}>`, // Must match verified Brevo sender
      to: email,
      bcc: process.env.SMTP_USER,                                   // optional log copy
      subject: "Your TravelTales Password Was Changed",
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password change email sent to ${email}`);
  } catch (err) {
    console.error("❌ Failed to send password change email:", err.message);
    throw new Error("Password change email failed to send via Brevo SMTP.");
  }
};
