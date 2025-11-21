import { resend } from "./resend.config.js";

import {
  RESET_PASSWORD_EMAIL_TEMPLATE,
  SUCCESS_RESETPASSWORD_EMAIL_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";

const FROM_EMAIL = "mentorSphere <noreply@resend.dev>";  
// You can change to your domain later when you add a custom domain.

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.CORS_ORIGIN}/email-verification/${token}`;
  
  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationLink}",
        verificationLink
      ),
    });

    console.log("Email sent:", response);
    return true;

  } catch (error) {
    console.log("Email::sendVerificationEmail Error:", error);
    return false;
  }
};

const sendRestPasswordEmail = async (email, token) => {
  const resetPasswordLink = `${process.env.CORS_ORIGIN}/reset-password/${token}`;

  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset Password",
      html: RESET_PASSWORD_EMAIL_TEMPLATE.replace(
        "{reset_link}",
        resetPasswordLink
      ),
    });

    console.log("Reset password email sent:", response);
    return true;

  } catch (error) {
    console.log("sendRestPasswordEmail Error:", error);
    return false;
  }
};

const sendSuccessResetPasswordEmail = async (email) => {
  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Password Reset Successful",
      html: SUCCESS_RESETPASSWORD_EMAIL_TEMPLATE,
    });

    console.log("Success reset email sent:", response);
    return true;

  } catch (error) {
    console.log("sendSuccessResetPasswordEmail Error:", error);
    return false;
  }
};

export {
  sendVerificationEmail,
  sendRestPasswordEmail,
  sendSuccessResetPasswordEmail,
};
