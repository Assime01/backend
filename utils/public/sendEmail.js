const nodemailer = require('nodemailer');
const path = require('path');

const sendInvoiceEmail = async (to, subject, text, pdfPath) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Boutique" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    text,
    attachments: [
      {
        filename: path.basename(pdfPath),
        path: pdfPath,
      },
    ],
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendInvoiceEmail;
