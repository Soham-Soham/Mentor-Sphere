const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; text-align: center;">
    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: 30px auto;">
        <h1 style="color: #333333;">Email Verification</h1>
        <p style="color: #555555; font-size: 16px;">Thank you for registering with us! Please click the button below to verify your email address.</p>
        <p style="color: #555555; font-size: 16px;">Click the link below to verify your email. This link will expire in 1 hour.</p>
        <p><a href="{verificationLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 15px 25px; text-decoration: none; font-size: 16px; border-radius: 5px; margin-top: 20px;">Verify Email</a></p>
        <p style="color: #555555; font-size: 16px;">If you did not sign up for an account, please ignore this email.</p>
        <p style="color: #555555; font-size: 16px;">Best regards,<br>Your Company Name</p>
    </div>
</body>
</html>
`;

const RESET_PASSWORD_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333;">

  <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    
    <div style="text-align: center; padding-bottom: 20px;">
      <h1 style="font-size: 24px; color: #333;">Reset Your Password</h1>
    </div>
    
    <div style="font-size: 16px; line-height: 1.6; color: #555;">
      <p>Hello,</p>
      <p>We received a request to reset your password. To reset your password, click the button below:</p>
      
      <a href="{reset_link}" style="display: inline-block; padding: 12px 25px; font-size: 16px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; text-align: center; margin-top: 20px;">
        Reset Password
      </a>
      
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>Your Team</p>
    </div>
    
  </div>

</body>
</html>
`
const SUCCESS_RESETPASSWORD_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333;">

  <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    
    <div style="text-align: center; padding-bottom: 20px;">
      <h1 style="font-size: 24px; color: #333;">Your Password Has Been Successfully Reset</h1>
    </div>
    
    <div style="font-size: 16px; line-height: 1.6; color: #555;">
      <p>Hello,</p>
      <p>We wanted to let you know that your password has been successfully reset. You can now use your new password to log in to your account.</p>
      <p>If you did not initiate this change, please contact our support team immediately to secure your account.</p>
      
      <p>If you have any further questions, feel free to reach out to us.</p>
      
      <p>Best regards,<br>Your Team</p>
    </div>
    
  </div>

</body>
</html>
`
export {VERIFICATION_EMAIL_TEMPLATE,RESET_PASSWORD_EMAIL_TEMPLATE,SUCCESS_RESETPASSWORD_EMAIL_TEMPLATE};