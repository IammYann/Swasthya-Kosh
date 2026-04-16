# Email Sending Setup Guide

## Overview

Your email notification system is now fully configured! You can send emails to your own account and have them tested directly from the Settings page.

## Quick Start - Testing Emails

1. **Go to Settings** → Navigate to the Settings page in your app
2. **Test Email Section** → Find the "Test Emails" section
3. **Click "Send Test Email"** → A test email will be sent to your account's email address
4. **Check your inbox** → Look for the test email to verify it works

## Email Configuration Options

### Option 1: Development Mode (Mailhog - Local Only)

**Current Default Setup**

Email service is configured to use Mailhog (local email testing tool) which captures emails without actually sending them.

- **Good for**: Development and testing without real email service
- **Bad for**: Actually receiving emails in your inbox

**Server Configuration (.env)**:

```
EMAIL_HOST="localhost"
EMAIL_PORT=1025
EMAIL_SECURE="false"
```

To view captured emails in development:

1. Run Mailhog: `MailHog.exe` (Windows) or `mailhog` (Mac/Linux)
2. Open: http://localhost:8025 in your browser
3. All emails sent during development will be captured there

### Option 2: Gmail SMTP (Recommended for Real Email Sending)

**To enable Gmail email sending:**

#### Step 1: Enable 2-Factor Authentication on Google Account

1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification (if not already enabled)

#### Step 2: Generate Google App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your OS)
3. Click "Generate"
4. Copy the 16-character password

#### Step 3: Update `.env` file

Edit `server/.env` and configure Gmail SMTP:

```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_SECURE="false"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-16-character-app-password"
EMAIL_FROM="noreply@svasthya-kosh.app"
EMAIL_REPLY_TO="support@svasthya-kosh.app"
```

#### Step 4: Restart Your Server

Kill the running server and restart:

```bash
npm run server
```

#### Step 5: Test It!

Go to Settings → Click "Send Test Email" → Check your Gmail inbox!

### Option 3: Other Email Services

#### SendGrid

```env
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT=587
EMAIL_SECURE="false"
EMAIL_USER="apikey"
EMAIL_PASSWORD="your-sendgrid-api-key"
```

#### Mailgun

```env
EMAIL_HOST="smtp.mailgun.org"
EMAIL_PORT=587
EMAIL_SECURE="false"
EMAIL_USER="postmaster@your-domain.mailgun.org"
EMAIL_PASSWORD="your-mailgun-password"
```

## Email Testing from Settings Page

### Available Test Options

1. **Send Test Email** (Green Button)
   - Sends a quick test email to verify the system works
   - Good for: Initial testing

2. **Send Daily Digest** (Blue Button)
   - Sends a sample daily digest email
   - Shows: Today's activity summary
   - Good for: Testing digest formatting

3. **Send Weekly Digest** (Purple Button)
   - Sends a sample weekly digest email
   - Shows: This week's activity summary
   - Good for: Testing weekly digest formatting

## Automatic Email Features

When enabled in Settings, you'll automatically receive:

### Budget Alerts

- **Trigger**: When spending hits 70% or 90% of budget
- **Frequency**: Max 1 per category per 24 hours
- **Content**: Budget status and recommendations

### Goal Achievement Notifications

- **Trigger**: When you reach a goal target
- **Content**: Congratulations and goal details

### Digest Emails

- **Daily**: 9:00 AM UTC
- **Weekly**: 10:00 AM UTC (Sundays)
- **Content**: Activity summary, life score, budget status

## Troubleshooting

### Not receiving emails?

**Check these things:**

1. **Email Notifications Enabled**
   - Go to Settings → Verify "Enable Email Notifications" is ON

2. **Email Configuration in .env**

   ```bash
   # Verify EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD are set correctly
   cat server/.env | grep EMAIL
   ```

3. **Server Logs**
   - Check server terminal for error messages when clicking "Send Test Email"
   - Look for messages like: "Email sent: {...}" or "Failed to send email: {...}"

4. **Gmail Issues**
   - If using Gmail, verify:
     - 2FA is enabled on your Google account
     - App Password was generated correctly (16 characters)
     - App Password has not changed
     - Less than 3 months have passed (Google invalidates old app passwords)

5. **Firewall/Security**
   - Ensure your network allows SMTP connections on port 587
   - Check if your email provider has login attempt notifications

### Emails appear in Mailhog but not Gmail?

Your `.env` is still configured for Mailhog. Follow the Gmail setup steps above to switch to real email sending.

## Email Preferences API Endpoints

### Get Email Preferences

```
GET /api/notifications/preferences/email
```

### Update Email Preferences

```
PATCH /api/notifications/preferences/email
Body: {
  "emailNotificationsEnabled": true,
  "budgetAlertsEnabled": true,
  "goalsNotificationsEnabled": true,
  "digestEmailFrequency": "daily" // or "weekly" or "none"
}
```

### Send Test Email

```
POST /api/notifications/send-test-email
```

### Send Daily Digest

```
POST /api/notifications/digest/daily
```

### Send Weekly Digest

```
POST /api/notifications/digest/weekly
```

## Next Steps

1. **Update `.env`** with your chosen email service
2. **Restart server**: Kill current process and run `npm run server`
3. **Go to Settings** in the app
4. **Click "Send Test Email"** to verify it works
5. **Check your inbox** for the test email

That's it! Your email system is now ready for automated notifications!
