import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
  });
};
