import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send verification email to organization with 6-digit code
 */
export async function sendVerificationEmail(email, name, verificationCode) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'AidLink Kakuma <onboarding@resend.dev>',
      to: [email],
      subject: 'Verify Your AidLink Organization Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #172b49;
              margin: 0;
              padding: 0;
              background-color: #f8fafc;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            .card {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
            }
            .logo {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo h1 {
              color: #087c75;
              font-size: 28px;
              margin: 0;
            }
            h2 {
              color: #172b49;
              font-size: 24px;
              margin-top: 0;
              margin-bottom: 20px;
            }
            p {
              margin-bottom: 20px;
              color: #64748b;
            }
            .code-box {
              background: #f1f5f9;
              border: 2px dashed #087c75;
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
            }
            .code {
              font-size: 42px;
              font-weight: 700;
              letter-spacing: 8px;
              color: #087c75;
              font-family: 'Courier New', monospace;
            }
            .info-box {
              background: #fff7ed;
              border-left: 4px solid #ea580c;
              padding: 15px;
              border-radius: 4px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5eaf0;
              color: #94a3b8;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="logo">
                <h1>🤝 AidLink Kakuma</h1>
              </div>
              
              <h2>Welcome, ${name}!</h2>
              
              <p>Thank you for registering your organization with AidLink Kakuma. To complete your registration, please use the verification code below:</p>
              
              <div class="code-box">
                <p style="margin: 0 0 10px; font-size: 14px; color: #64748b;">Your Verification Code</p>
                <div class="code">${verificationCode}</div>
              </div>
              
              <p style="text-align: center;">Enter this code on the verification page to activate your account.</p>
              
              <div class="info-box">
                <strong>⏰ This code will expire in 10 minutes</strong><br>
                If you didn't create this account, you can safely ignore this email.
              </div>
              
              <div class="footer">
                <p>AidLink Kakuma - Community Aid Coordination Platform<br>
                Connecting communities with essential services</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Failed to send verification email:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }

    console.log('✅ Verification email sent:', data?.id);
    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error('❌ Email service error:', error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, name, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'AidLink Kakuma <onboarding@resend.dev>',
      to: [email],
      subject: 'Reset Your AidLink Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #172b49; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background: #087c75; color: white; text-decoration: none; border-radius: 6px; }
            .warning { background: #fff7ed; border-left: 4px solid #ea580c; padding: 12px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Password Reset Request</h2>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p><a href="${resetUrl}" class="button">Reset Password</a></p>
            <div class="warning">
              <strong>⚠️ This link expires in 1 hour</strong><br>
              If you didn't request this, please ignore this email.
            </div>
            <p style="font-size: 12px; color: #94a3b8;">Link: ${resetUrl}</p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      throw new Error(`Email sending failed: ${error.message}`);
    }

    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error('❌ Password reset email error:', error);
    throw error;
  }
}

/**
 * Send welcome email after verification
 */
export async function sendWelcomeEmail(email, name) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'AidLink Kakuma <onboarding@resend.dev>',
      to: [email],
      subject: 'Welcome to AidLink Kakuma!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #172b49; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .success { background: #e5f5f3; border-left: 4px solid #087c75; padding: 15px; margin: 20px 0; }
            ul { padding-left: 20px; }
            li { margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 style="color: #087c75;">🎉 Welcome to AidLink Kakuma!</h1>
            <div class="success">
              <strong>✅ Your email has been verified successfully!</strong>
            </div>
            <p>Hi ${name},</p>
            <p>Your organization account is now active. You can start:</p>
            <ul>
              <li>📋 Receiving and managing community reports</li>
              <li>🏥 Publishing your services and programs</li>
              <li>🚨 Creating emergency response guides</li>
              <li>🤝 Connecting with the community</li>
            </ul>
            <p>Log in to your dashboard to get started: <a href="${process.env.FRONTEND_URL}/login" style="color: #087c75;">Login Here</a></p>
            <p>Thank you for being part of AidLink Kakuma!</p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Failed to send welcome email:', error);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Welcome email error:', error);
    // Don't throw - welcome email is not critical
    return { success: false };
  }
}
