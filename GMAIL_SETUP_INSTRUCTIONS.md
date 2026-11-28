# 📧 Gmail App Password Setup - Quick Guide

## Step 1: Enable 2-Factor Authentication

1. Go to: **https://myaccount.google.com/security**
2. Find "2-Step Verification"
3. Click "Get Started" or "Turn On"
4. Follow the prompts to verify your phone number
5. Enable 2FA

## Step 2: Generate App Password

1. Go to: **https://myaccount.google.com/apppasswords**
   - Or go to Google Account → Security → App Passwords
   
2. You may need to sign in again

3. Click **"Select app"** dropdown:
   - Choose "Mail"

4. Click **"Select device"** dropdown:
   - Choose "Other (Custom name)"
   - Type: **"AidLink Kakuma"**

5. Click **"Generate"**

6. **Copy the 16-character password** (shown like: `abcd efgh ijkl mnop`)
   - Save it somewhere safe
   - You'll need to paste it in the `.env` file

## Step 3: Update Your Server .env File

Open `server/.env` and add these lines:

```env
# Gmail SMTP Configuration (FREE email sending)
GMAIL_USER=uhuribhang211@gmail.com
GMAIL_APP_PASSWORD=paste_your_16_char_password_here
```

**Example**:
```env
GMAIL_USER=uhuribhang211@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

**Note**: Remove the spaces when pasting (or keep them, nodemailer handles both).

## Step 4: Restart Your Server

```bash
cd server
npm start
```

You should see:
```
✅ Gmail SMTP ready to send emails
✅ PostgreSQL database connected successfully
🚀 AidLink API running on port 3000
```

## Step 5: Test Registration

1. Go to your app
2. Register with **ANY email address** (try your personal email)
3. Check your inbox (and spam folder if needed)
4. You should receive the 6-digit verification code
5. Enter the code to complete registration

## ✅ Success!

Now any user can register and receive verification emails for FREE!

---

## 🔧 Troubleshooting

### "Invalid login" error
- Make sure 2FA is enabled on your Gmail account
- Double-check the app password (no typos)
- Try generating a new app password

### "Username and Password not accepted"
- Ensure you're using the APP PASSWORD, not your Gmail password
- Check that GMAIL_USER matches your Gmail address

### Email not received
- Check spam/junk folder
- Wait a few minutes (can take 1-2 minutes)
- Check Gmail's "Sent" folder to confirm it was sent

### Quota exceeded (500 emails/day limit)
- Gmail SMTP has a 500 emails/day limit
- If you exceed this, wait 24 hours or buy a domain ($10/year) for 3,000/month

---

## 📊 What You Get

✅ **Free** - No cost at all
✅ **500 emails/day** - Enough for most apps
✅ **Send to anyone** - No restrictions
✅ **Works immediately** - No DNS setup needed
✅ **Reliable** - Gmail's infrastructure

---

## 🚀 Next Steps After Testing

Once your app is live and working:

1. **Buy a domain** ($10-15/year)
   - Example: aidlinkkakuma.com
   
2. **Verify domain in Resend**
   - Add DNS records
   - Switch back to Resend
   
3. **Professional emails**
   - `noreply@aidlinkkakuma.com`
   - 3,000 emails/month FREE
   - Better deliverability

But for now, Gmail works perfectly! 🎉
