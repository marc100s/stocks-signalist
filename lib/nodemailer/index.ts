import nodemailer from "nodemailer";
import {
  NEWS_SUMMARY_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  EMAIL_VERIFICATION_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "./templates";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export const sendWelcomeEmail = async ({
  email,
  name,
  intro,
}: WelcomeEmailData) => {
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace("{{name}}", name).replace(
    "{{intro}}",
    intro
  );

  const mailOptions = {
    from: `"Signalist<signalist@ellipsi.net>"`,
    to: email,
    subject: "Welcome to Signalist!",
    text: `Hi ${name},\n\n${intro}\n\nBest regards,\nThe Signalist Team`,
    html: htmlTemplate,
  };
  await transporter.sendMail(mailOptions);
};

export const sendNewsSummaryEmail = async ({
  email,
  date,
  newsContent,
}: {
  email: string;
  date: string;
  newsContent: string;
}): Promise<void> => {
  const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE.replace(
    "{{date}}",
    date
  ).replace("{{newsContent}}", newsContent);

  const mailOptions = {
    from: `"Signalist News" <signalist@jsmastery.pro>`,
    to: email,
    subject: `📈 Market News Summary Today - ${date}`,
    text: `Today's market news summary from Signalist`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export const sendVerificationEmail = async ({
  email,
  name,
  verificationUrl,
}: {
  email: string;
  name: string;
  verificationUrl: string;
}): Promise<void> => {
  const htmlTemplate = EMAIL_VERIFICATION_TEMPLATE.replace(
    /{{name}}/g,
    name
  ).replace(/{{verificationUrl}}/g, verificationUrl);

  const mailOptions = {
    from: `"Signalist" <signalist@ellipsi.net>`,
    to: email,
    subject: "Verify Your Email - Signalist",
    text: `Hi ${name},\n\nPlease verify your email address by clicking this link: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nThe Signalist Team`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async ({
  email,
  name,
  resetUrl,
}: {
  email: string;
  name: string;
  resetUrl: string;
}): Promise<void> => {
  const htmlTemplate = PASSWORD_RESET_TEMPLATE.replace(
    /{{name}}/g,
    name
  ).replace(/{{resetUrl}}/g, resetUrl);

  const mailOptions = {
    from: `"Signalist" <signalist@ellipsi.net>`,
    to: email,
    subject: "Reset Your Password - Signalist",
    text: `Hi ${name},\n\nWe received a request to reset your password. Click this link to reset it: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.\n\nBest regards,\nThe Signalist Team`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};
