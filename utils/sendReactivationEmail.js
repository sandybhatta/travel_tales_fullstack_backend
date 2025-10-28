// utils/sendReactivationEmail.js
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { sendEmail } from "./brevoEmail.js"; // import the Brevo API utility

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const sendReactivationEmail = async (email, username) => {
  try {
    const templatePath = path.join(__dirname, "../emails/accountReactivated.ejs");
    const loginUrl = `${process.env.CLIENT_LIVE_URL}/login`;

    // Use Brevo API utility
    await sendEmail({
      toEmail: email,
      subject: "Your Account Has Been Reactivated - TravelTales",
      templatePath,
      templateData: {
        username,
        loginUrl,
      },
    });

    console.log(` Reactivation email sent to ${email}`);
  } catch (err) {
    console.error(" Failed to send reactivation email via Brevo API:", err.message);
    throw new Error("Reactivation email failed via Brevo API.");
  }
};
