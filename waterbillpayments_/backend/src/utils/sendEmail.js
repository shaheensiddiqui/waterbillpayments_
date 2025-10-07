const nodemailer = require("nodemailer");

async function sendEmail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });

  const info = await transporter.sendMail({
    from: '"Municipal Water Dept" <no-reply@water.gov>',
    to,
    subject,
    html,
  });

  return info.messageId;
}

module.exports = sendEmail;
