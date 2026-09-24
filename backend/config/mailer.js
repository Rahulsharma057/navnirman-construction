const nodemailer = require("nodemailer");

// Email is optional — if SMTP isn't configured, we skip silently rather
// than breaking the contact form (a customer's enquiry must still save).
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
};

const sendMail = async ({ to, subject, text, html }) => {
  const t = getTransporter();
  if (!t || !to) return; // not configured / no recipient — skip quietly

  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
  } catch (err) {
    // never let a notification failure break the actual request
    console.error("Email notification failed:", err.message);
  }
};

module.exports = { sendMail };
