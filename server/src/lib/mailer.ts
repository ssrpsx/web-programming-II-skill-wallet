import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "your-email@gmail.com";
const SMTP_PASS = process.env.SMTP_PASS || "your-app-password";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const sendEmailOtp = async (to: string, otp: string) => {
  try {
    await transporter.sendMail({
      from: `"SkillWallet Security" <${SMTP_USER}>`,
      to,
      subject: "Your 2FA Verification Code",
      text: `Your two-factor authentication code is: ${otp}. It will expire in 5 minutes.`,
      html: `<p>Your two-factor authentication code is: <strong>${otp}</strong>.</p><p>It will expire in 5 minutes.</p>`,
    });
    console.log(`Sent OTP to ${to}`);
  } catch (error) {
    console.error("Failed to send OTP email:", error);
  }
};
