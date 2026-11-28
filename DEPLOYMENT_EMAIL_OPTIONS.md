# Email Options for Production Deployment

## Current Situation
- **Deployed:** aidlinkkakuma.vercel.app
- **Issue:** Resend free tier only sends to uhuribhang211@gmail.com
- **Need:** Send emails to ALL users

---

## Option 1: Keep Resend with Console Codes (Current)

### Pros:
- ✅ Already working
- ✅ No extra cost
- ✅ No configuration needed

### Cons:
- ❌ Users can't get emails (except uhuribhang211@gmail.com)
- ❌ Not production-ready

### Setup:
Keep everything as is. Users check email, but codes appear in Vercel logs.

---

## Option 2: Buy Domain + Verify in Resend (RECOMMENDED)

### Pros:
- ✅ Emails work for EVERYONE
- ✅ Professional (emails from @aidlinkkakuma.com)
- ✅ Reliable delivery
- ✅ 100 emails/day free

### Cons:
- ❌ Costs $10-15/year
- ❌ DNS configuration required
- ❌ 24-48 hours verification wait

### Steps:

#### 1. Buy Domain
Choose one:
- **Namecheap:** aidlinkkakuma.com ($11/year)
- **GoDaddy:** aidlinkkakuma.org ($12/year)
- **Google Domains:** aidlinkkakuma.com ($12/year)

#### 2. Point Domain to Vercel

In your domain registrar DNS settings, add:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### 3. Add Domain to Vercel

Vercel Dashboard → Your Project → Settings → Domains
```
Add Domain: aidlinkkakuma.com
Add Domain: www.aidlinkkakuma.com
```

Wait for Vercel SSL certificate (automatic, ~5 minutes)

#### 4. Add Domain to Resend

Resend Dashboard → Domains → Add Domain
```
Domain: aidlinkkakuma.com
```

#### 5. Add DNS Records

Resend will show you these records. Add them to your domain registrar:

**TXT Record (Verification):**
```
Name: @ (or aidlinkkakuma.com)
Type: TXT
Value: resend-verification=xxxxxxxxxxxxxxxxx
```

**SPF Record:**
```
Name: @ (or aidlinkkakuma.com)
Type: TXT
Value: v=spf1 include:amazonses.com ~all
```

**DKIM Record:**
```
Name: resend._domainkey
Type: TXT
Value: [long value provided by Resend]
```

#### 6. Wait for Verification

- DNS propagation: 1-24 hours
- Resend verification: Automatic after DNS propagates

#### 7. Update Vercel Environment Variables

Backend environment variables:
```env
EMAIL_FROM=AidLink Kakuma <noreply@aidlinkkakuma.com>
FRONTEND_URL=https://aidlinkkakuma.com
```

Redeploy backend after updating env vars.

#### 8. Test

- Register with any email
- Should receive verification email ✅

---

## Option 3: Use Gmail SMTP (Free Alternative)

### Pros:
- ✅ Free
- ✅ Works immediately
- ✅ No domain needed
- ✅ 500 emails/day

### Cons:
- ❌ Less professional (from Gmail address)
- ❌ Requires Gmail App Password
- ❌ May hit spam filters

### Steps:

#### 1. Enable Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification (if not enabled)
3. Go to: https://myaccount.google.com/apppasswords
4. Generate app password for "Mail"
5. Copy the 16-character password

#### 2. Install Nodemailer

```bash
cd server
npm install nodemailer
```

#### 3. Create Gmail Email Service

Create `server/services/gmailService.js`:

```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // your gmail
    pass: process.env.GMAIL_APP_PASSWORD // app password
  }
});

export async function sendVerificationEmail(email, name, code) {
  await transporter.sendMail({
    from: `"AidLink Kakuma" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Verify Your AidLink Account',
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>Code expires in 10 minutes.</p>
    `
  });
}

export async function sendPasswordResetEmail(email, name, code) {
  await transporter.sendMail({
    from: `"AidLink Kakuma" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <h2>Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>Your reset code is: <strong>${code}</strong></p>
      <p>Code expires in 10 minutes.</p>
    `
  });
}

export async function sendWelcomeEmail(email, name) {
  await transporter.sendMail({
    from: `"AidLink Kakuma" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Welcome to AidLink!',
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Your account is now active.</p>
    `
  });
}
```

#### 4. Update authController.js

Change imports:
```javascript
// OLD
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService.js';

// NEW
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../services/gmailService.js';
```

#### 5. Update Vercel Environment Variables

```env
GMAIL_USER=uhuribhang211@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

#### 6. Deploy and Test

Should send emails to ANY address! ✅

---

## Option 4: Use SendGrid (Free 100 emails/day)

Similar to Gmail but more professional.

### Steps:

1. Sign up: https://sendgrid.com (free tier)
2. Verify sender email
3. Get API key
4. Install: `npm install @sendgrid/mail`
5. Create sendgridService.js
6. Update env vars

---

## 📊 Comparison Table

| Option | Cost | Setup Time | Professional | Emails/Day | Best For |
|--------|------|------------|--------------|------------|----------|
| **Console Codes** | Free | 0 min | ❌ | N/A | Development only |
| **Buy Domain + Resend** | $12/year | 1-2 days | ✅✅✅ | 100 | Production (RECOMMENDED) |
| **Gmail SMTP** | Free | 15 min | ⚠️ | 500 | Testing/MVP |
| **SendGrid** | Free | 30 min | ✅✅ | 100 | Production (alternative) |

---

## 🎯 My Recommendation

### For Production Launch:
**Option 2: Buy Domain + Resend**
- Professional
- Reliable
- Good brand identity
- Only $12/year

### For Quick Testing:
**Option 3: Gmail SMTP**
- Works immediately
- Free
- Good enough for initial users

---

## 🚀 Quick Start Guide

### If You Want to Launch NOW (Gmail):

```bash
# 1. Enable Gmail App Password (5 min)
# 2. Install nodemailer
cd server
npm install nodemailer

# 3. Create gmailService.js (copy from above)
# 4. Update imports in authController.js
# 5. Add Vercel env vars (GMAIL_USER, GMAIL_APP_PASSWORD)
# 6. Redeploy
# 7. Test - emails work! ✅
```

### If You Can Wait 1-2 Days (Buy Domain):

```bash
# 1. Buy domain ($12)
# 2. Point to Vercel
# 3. Add domain to Resend
# 4. Add DNS records
# 5. Wait for verification (24-48 hours)
# 6. Update env vars
# 7. Redeploy
# 8. Professional emails! ✅
```

---

## Need Help?

Let me know which option you choose and I'll help you set it up! 🚀
