import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { _config } from "../config/config.js";
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const emailHelper = async (options) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: _config.SMTP_HOST,
      port: _config.SMTP_PORT,
      service: _config.SMTP_SERVICE,
      secure:false,
      auth: {
        user: _config.SMTP_USER,
        pass: _config.SMTP_PASS,
      },
    });

    const { email, subject, template, data } = options;

    const templatePath = path.join(__dirname, "../mails", template);

    // Render HTML with EJS
    const html = await ejs.renderFile(templatePath, data);

    // Mail options
    const mailOptions = {
      from: _config.SMTP_USER,
      to: email,
      subject,
      html,  // Include the rendered HTML here
    };

    // Send mail
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Error while sending email: ${error.message}`);
  }
};

export default emailHelper;
