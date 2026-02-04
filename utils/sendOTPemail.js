// utils/sendOTPEmail.js
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { sendEmail } from "./brevoEmail.js"; // import the shared Brevo API utility

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const sendOTPEmail = async (email, username, otp, type = "login") => {
  try {
    const templatePath = path.join(__dirname, "../emails/otp.ejs");

    const subject =
      type === "login"
        ? "Your TravelTales OTP for Login"
        : "🔐 Your TravelTales OTP for Password Reset";

    // Call the Brevo API utility
    await sendEmail({
      toEmail: email,
      subject,
      templatePath,
      templateData: {
        username,
        otp,
        expiresIn: 10,
      },
    });

    console.log(` OTP email sent to ${email}`);
  } catch (error) {
    console.error(" Email sending failed via Brevo API:", error.message);
    
    // FALLBACK FOR DEVELOPMENT: If email fails (e.g. IP restriction), log OTP to console
    console.log("\n==================================================================");
    console.log(" [DEV FALLBACK] Email failed. Use this OTP to login:");
    console.log(` OTP for ${email}: ${otp}`);
    console.log("==================================================================\n");

    // Do NOT throw error so the login flow continues
    // throw new Error("OTP email could not be sent via Brevo API.");
  }
};
