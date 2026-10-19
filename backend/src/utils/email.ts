import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("Email server configuration error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
  });
};
