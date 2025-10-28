// utils/sendPasswordChangedEmail.js
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { sendEmail } from "./brevoEmail.js"; // import the Brevo API utility

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const sendPasswordChangedEmail = async (name, email) => {
  try {
    const templatePath = path.join(__dirname, "../emails/passwordChanged.ejs");

    // Call Brevo API utility
    await sendEmail({
      toEmail: email,
      subject: "Your TravelTales Password Was Changed",
      templatePath,
      templateData: {
        name,
        time: new Date().toLocaleString(),
      },
    });

    console.log(` Password change email sent to ${email}`);
  } catch (err) {
    console.error(" Failed to send password change email via Brevo API:", err.message);
    throw new Error("Password change email failed via Brevo API.");
  }
};
