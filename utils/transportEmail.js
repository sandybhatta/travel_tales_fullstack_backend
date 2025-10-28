
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
 * Send verification email via Brevo REST API
 */
export async function sendEmail(email, username, token, message) {
  try {
    
    const templatePath = path.join(__dirname, "../emails/verifyEmail.ejs");
    const verifyLink = `${process.env.CLIENT_LIVE_URL}/verify-email?token=${token}`;

   
    const htmlContent = await ejs.renderFile(templatePath, {
      username,
      verifyLink,
      message,
    });

    
    const emailPayload = {
      sender: {
        name: "TravelTales Support",
        email: "noreply@traveltalesapp.in", 
      },
      to: [
        {
          email,
        },
      ],
      subject: `Verify your email, ${username}`,
      htmlContent,
    };

    console.log(" Sending verification email via HTTPS API...");
    console.log("Payload:", emailPayload);

   
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      emailPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY, 
        },
      }
    );

    console.log(
      ` Verification email sent via Brevo API: ${response.data.messageId || "Success"}`
    );
  } catch (error) {
    console.error(
      " Email sending failed via Brevo API:",
      error.response?.data || error.message
    );
    throw new Error("Email could not be sent via Brevo API");
  }
}
