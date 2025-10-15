// utils/brevoEmail.js
import axios from "axios";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Send email using Brevo REST API + EJS template
 */
export const sendEmail = async ({ toEmail, subject, templatePath, templateData }) => {
  try {
    // 1️⃣ Render EJS template to HTML
    const htmlContent = await ejs.renderFile(templatePath, templateData);

    // 2️⃣ Build the payload exactly as Brevo API expects
    const emailPayload = {
      sender: {
        name: "TravelTales Support",
        email: "noreply@traveltalesapp.in", // your verified Brevo sender email
      },
      to: [
        {
          email: toEmail,
        },
      ],
      subject: subject,
      htmlContent: htmlContent,
    };

    console.log("🟢 Sending email via Brevo REST API...");
    console.log("Payload:", emailPayload);

    // 3️⃣ Send POST request to Brevo API
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      emailPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY, // from .env (also set in Render)
        },
      }
    );

    console.log("✅ Email sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Email sending failed:",
      error.response?.data || error.message
    );
    throw new Error("Email could not be sent");
  }
};
