import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send verification email to organization
 */
export async function sendVerificationEmail(email, name, verificationToken) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
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
            .button {
              display: inline-block;
              padding: 14px 32px;
              background-color: #087c75;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #065f5a;
            }
            .info-box {
              background: #f1f5f9;
              border-left: 4px solid #087c75;
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
            .link {
              color: #087c75;
              word-break: break-all;
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
              
              <p>Thank you for registering your organization with AidLink Kakuma. We're excited to have you join our community of humanitarian organizations serving the Kakuma Refugee Camp.</p>
              
              <p>To complete your registration and start managing your services, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <div class="info-box">
                <strong>⏰ This link will expire in 24 hours</strong><br>
                If you didn't create this account, you can safely ignore this email.
              </div>
              
              <p style="font-size: 14px; color: #94a3b8;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" class="link">${verificationUrl}</a>
              </p>
              
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
