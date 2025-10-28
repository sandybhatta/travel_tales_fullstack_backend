import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { sendEmail } from "./brevoEmail.js"; // <-- import from utils folder

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const sendDeactivateEmail = async (email, username) => {
  try {
    const templatePath = path.join(__dirname, "../emails/accountDeactivated.ejs");

    const loginUrl = `${process.env.CLIENT_LIVE_URL}/login`;

    // Call Brevo API utility
    await sendEmail({
      toEmail: email,
      subject: "Your Account is Deactivated",
      templatePath,
      templateData: {
        username,
        loginUrl,
      },
    });

    console.log(` Deactivation email sent to ${email}`);
  } catch (err) {
    console.error(" Failed to send deactivation email via Brevo API:", err.message);
    throw new Error("Deactivation email failed via Brevo API.");
  }
};
