import { transporter } from "./email.config.js";
import {
  RESET_PASSWORD_EMAIL_TEMPLATE,
  SUCCESS_RESETPASSWORD_EMAIL_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `http://localhost:5174/email-verification/${token}`;

  try {
    const response = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Test Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationLink}",
        verificationLink
      ),
    });

    console.log("Email::sendVerificationEmail: Email Sent Successfully");
    return true;
  } catch (error) {
    console.log(
      "Email::sendVerificationEmail: Error while sending verification mail"
    );
    // throw new Error("Email::sendVerificationEmail: Error :",error)
    return false;
  }
};

const sendRestPasswordEmail = async (email, token) => {
  const resetPasswordLink = `http://localhost:5174/reset-password/${token}`;
  try {
    const response = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      html: RESET_PASSWORD_EMAIL_TEMPLATE.replace(
        "{reset_link}",
        resetPasswordLink
      ),
    });

    console.log("sendRestPasswordEmail:: Email Sent Successfully");
    return true;
  } catch (error) {
    console.log("sendRestPasswordEmail:: Error: ", error);
    return false;
  }
};

const sendSuccessResetPasswordEmail = async (email) => {
  try {
    const response = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "SuccessFully Password Reset",
      html: SUCCESS_RESETPASSWORD_EMAIL_TEMPLATE,
    });

    console.log("sendSuccessResetPasswordEmail:: Email Sent Successfully");
    return true;
  } catch (error) {
    console.log("sendSuccessResetPasswordEmail:: Error: ", error);
    return false;
  }
};

export { sendVerificationEmail, sendRestPasswordEmail,sendSuccessResetPasswordEmail };
