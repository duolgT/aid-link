# Email Verification Setup Guide

This guide explains how to set up email verification for AidLink Kakuma using Resend.

## Overview

Organizations registering on AidLink will receive a verification email to confirm their email address before they can fully access the platform. This ensures that:
- Email addresses are valid and owned by the registrant
- Spam and fake registrations are reduced
- Communication channels are verified

## Prerequisites

1. A Resend account (free tier available)
2. MySQL database running
3. Backend and frontend servers configured

## Step 1: Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign up for a free account
2. Verify your email address
3. Navigate to **API Keys** in your dashboard
4. Click **Create API Key**
5. Give it a name (e.g., "AidLink Kakuma Development")
6. Copy the API key (starts with `re_`)

**Note**: Free tier includes 100 emails/day, which is sufficient for development and small-scale production.

## Step 2: Configure Backend Environment

Add the following to your `server/.env` file:

```env
# Resend Email Configuration
RESEND_API_KEY=re_your_actual_api_key_here
EMAIL_FROM=AidLink Kakuma <onboarding@resend.dev>
FRONTEND_URL=http://localhost:5174
```

**Important Notes**:
- Replace `re_your_actual_api_key_here` with your actual Resend API key
- For free tier, you can only send from `onboarding@resend.dev`
- To use a custom domain (e.g., `noreply@aidlink.org`), you need to verify your domain in Resend
- `FRONTEND_URL` should match where your frontend is running

## Step 3: Run Database Migration

The database schema needs to be updated to support email verification:

```bash
cd server
mysql -u root -p aidlink_kakuma < migrations/add_email_verification.sql
```

This adds three fields to the `organizations` table:
- `is_verified` (BOOLEAN) - Whether email is verified
- `verification_token` (VARCHAR) - Unique token for verification
- `verification_token_expires` (DATETIME) - Token expiration time

## Step 4: Test Email Verification Flow

### 4.1 Start Backend Server

```bash
cd server
npm start
```

Backend runs on http://localhost:3000

### 4.2 Start Frontend Server

```bash
cd client
npm run dev
```

Frontend runs on http://localhost:5174

### 4.3 Test Registration

1. Navigate to http://localhost:5174/register
2. Fill in organization details:
   - Name: Test Organization
   - Email: your-email@example.com (use a real email you can access)
   - Sector: Healthcare
   - Password: test123
3. Click "Create Account"
4. You should see: **"Check Your Email!"** message
5. Check your email inbox for verification email

### 4.4 Verify Email

1. Open the verification email
2. Click the **"Verify Email Address"** button
3. You'll be redirected to the verification page
4. After successful verification, you'll see **"Email Verified!"**
5. Automatically redirected to login page
6. You should receive a welcome email

## Email Templates

### 1. Verification Email
- **Subject**: Verify Your AidLink Organization Account
- **Contains**: Welcome message, verification button, link expires in 24 hours
- **Action**: Click to verify email

### 2. Welcome Email
- **Subject**: Welcome to AidLink Kakuma!
- **Sent**: After successful verification
- **Contains**: Getting started information, dashboard link

## API Endpoints

### Register Organization
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Test Organization",
  "email": "test@example.com",
  "password": "password123",
  "sector": "Healthcare"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Organization registered successfully. Please check your email to verify your account.",
  "data": {
    "organization": {
      "id": "uuid",
      "name": "Test Organization",
      "email": "test@example.com",
      "sector": "Healthcare",
      "is_verified": false
    },
    "token": "jwt_token",
    "emailSent": true
  }
}
```

### Verify Email
```http
GET /api/auth/verify-email/:token
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Email verified successfully! You can now log in.",
  "data": {
    "email": "test@example.com",
    "name": "Test Organization"
  }
}
```

### Resend Verification Email
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Verification email sent. Please check your inbox."
}
```

## Troubleshooting

### Emails Not Sending

**Problem**: Registration succeeds but no email received

**Solutions**:
1. Check `RESEND_API_KEY` is correctly set in `.env`
2. Check backend console for email errors
3. Check spam/junk folder
4. Verify you're using a valid email address
5. Check Resend dashboard for email logs

### "Invalid or Expired Token"

**Problem**: Verification link shows error

**Solutions**:
1. Token expires after 24 hours - request a new verification email
2. Token can only be used once
3. Check that the full link was copied (some email clients truncate URLs)

### Database Errors

**Problem**: Registration fails with database error

**Solutions**:
1. Run the migration script: `mysql -u root -p aidlink_kakuma < migrations/add_email_verification.sql`
2. Verify columns exist: `DESCRIBE organizations;`
3. Check MySQL connection in `server/.env`

### Email From Address Issues

**Problem**: Emails rejected or not delivered

**Solutions**:
1. Free tier: Use `onboarding@resend.dev` only
2. Custom domain: Verify domain in Resend dashboard first
3. Add SPF, DKIM records to your DNS

## Production Deployment

### 1. Update Environment Variables

```env
# Production environment
NODE_ENV=production
FRONTEND_URL=https://aidlink-kakuma.com
RESEND_API_KEY=re_your_production_key
EMAIL_FROM=AidLink Kakuma <noreply@yourdomain.com>
```

### 2. Verify Custom Domain (Optional)

For branded emails (not using resend.dev):
1. Add your domain in Resend dashboard
2. Add DNS records (SPF, DKIM, DMARC)
3. Wait for verification (usually a few minutes)
4. Update `EMAIL_FROM` in `.env`

### 3. Monitor Email Delivery

- Check Resend dashboard for delivery status
- Set up webhook for delivery events (optional)
- Monitor bounce and complaint rates

## Email Sending Limits

### Resend Free Tier
- **100 emails/day**
- **1 sending domain** (resend.dev)
- **Email logs** (30 days)

### Paid Plans
- **50,000+ emails/month**
- **Custom domains**
- **Dedicated IPs**
- **Priority support**

For production with many organizations, consider upgrading.

## Security Best Practices

1. **Never commit** `.env` file to version control
2. **Rotate API keys** regularly
3. **Use HTTPS** in production for verification links
4. **Set token expiration** (currently 24 hours)
5. **Rate limit** registration and resend endpoints
6. **Validate email** format on both frontend and backend

## Testing Checklist

- [ ] Registration sends verification email
- [ ] Verification link works and redirects to login
- [ ] Welcome email sent after verification
- [ ] Expired tokens show error
- [ ] Already verified accounts can't re-verify
- [ ] Resend verification works
- [ ] Error messages are user-friendly
- [ ] Email templates look good on mobile

## Support

If you encounter issues:
1. Check backend console logs
2. Check Resend dashboard for email logs
3. Verify database migration ran successfully
4. Test with curl/Postman to isolate frontend/backend issues

## Future Enhancements

- [ ] Password reset via email
- [ ] Email change verification
- [ ] Organization invitation system
- [ ] Email notifications for reports
- [ ] Digest emails for activities

---

**Last Updated**: January 2025
**Version**: 1.0
