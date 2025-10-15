// utils/sendWelcomeEmail.js
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { sendEmail } from "./brevoEmail.js"; // import Brevo API utility

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const sendWelcomeEmail = async (user) => {
  try {
    const templatePath = path.join(__dirname, "../emails/welcomeEmail.ejs");

    // Call Brevo API utility
    await sendEmail({
      toEmail: user.email,
      subject: "🎉 Welcome to TravelTales!",
      templatePath,
      templateData: {
        username: user.username,
      },
    });

    console.log(` Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error(" Welcome email failed via Brevo API:", error.message);
    throw new Error("Could not send welcome email via Brevo API");
  }
};
