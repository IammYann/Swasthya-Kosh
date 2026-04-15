# Email Notifications System

## Overview

The Email Notifications system sends automated emails to keep users engaged with the Svasthya Kosh app. It includes:

- **Budget Alerts**: Notifies users when spending approaches budget limits (70% and 90%)
- **Goal Achievements**: Celebrates when users achieve their health and financial goals
- **Daily Digests**: Daily summary emails of user's health and finance activity
- **Weekly Digests**: Comprehensive weekly summary delivered every Sunday

## Features

### 1. Budget Alerts
- **Trigger**: When a user logs an expense that brings their spending to 70%+ of monthly budget
- **Frequency**: Maximum one alert per category per 24 hours (prevents spam)
- **Customizable**: Users can disable budget alerts in preferences
- **Content**: Shows category name, amount spent, budget limit, percentage used

### 2. Goal Achievement Notifications
- **Trigger**: When a user's activity reaches their goal target
- **Conditions**:
  - Fitness goals: Total workouts, total steps, etc.
  - Financial goals: Savings amount reached
- **Content**: Congratulations message with goal name and type

### 3. Daily Digest
- **Scheduled Time**: 9:00 AM (UTC) every day
- **Content Includes**:
  - Workouts completed
  - Steps logged
  - Nutrition logs
  - Expenses logged
  - Life Score (if available)
  - Savings rate
- **Customizable**: Users can switch to weekly or disable digests

### 4. Weekly Digest
- **Scheduled Time**: 10:00 AM (UTC) every Sunday
- **Content Includes**:
  - Total workouts for the week
  - Total and average daily steps
  - Average life score
  - Budget adherence percentage
  - Total expenses and daily averages
  - Motivation message

## Getting Started

### Development Setup

1. **Install Mailhog** (local email testing tool):
   ```bash
   # On macOS with Homebrew
   brew install mailhog
   brew services start mailhog
   
   # On Windows, download from: https://github.com/mailhog/MailHog/releases
   # Run: MailHog.exe
   
   # On Linux
   go get github.com/mailhog/MailHog
   ```

2. **Mailhog Web Interface**: http://localhost:1025 (SMTP), http://localhost:8025 (Web UI)

3. **Verify .env Configuration**:
   ```env
   EMAIL_HOST=localhost
   EMAIL_PORT=1025
   EMAIL_SECURE=false
   ENABLE_EMAIL_SCHEDULER=true
   ```

4. **Server will automatically**:
   - Start email service on port 1025
   - Initialize digest schedulers
   - Send emails to Mailhog for capture

### Production Setup

For production, use a professional email service:

#### Gmail SMTP
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

**Get Gmail App Password**:
1. Enable 2-factor authentication on Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Generate and copy the 16-character password

#### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxx...
```

#### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@sandbox.mailgun.org
EMAIL_PASSWORD=your-mailgun-password
```

## API Endpoints

### Notifications Management

#### Get User Notifications
```http
GET /api/notifications
Query Parameters:
  - read: "true" | "false" (optional, filter by read status)

Response:
[
  {
    "id": "cuid123",
    "userId": "user456",
    "type": "budget_alert",
    "title": "Budget Alert: Food",
    "message": "You have spent 85% of your Food budget...",
    "read": false,
    "data": "{...}",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### Get Unread Count
```http
GET /api/notifications/count/unread

Response:
{
  "unreadCount": 3
}
```

#### Mark Notification as Read
```http
PATCH /api/notifications/:id/read

Response:
{
  "id": "cuid123",
  "read": true
}
```

#### Mark All as Read
```http
PATCH /api/notifications/read/all

Response:
{
  "success": true
}
```

#### Delete Notification
```http
DELETE /api/notifications/:id

Response:
{
  "success": true
}
```

### Email Preferences

#### Get Email Preferences
```http
GET /api/notifications/preferences/email

Response:
{
  "emailNotificationsEnabled": true,
  "budgetAlertsEnabled": true,
  "goalsNotificationsEnabled": true,
  "digestEmailFrequency": "weekly",
  "lastDigestEmailSentAt": "2024-01-14T10:00:00Z"
}
```

#### Update Email Preferences
```http
PATCH /api/notifications/preferences/email

Request Body:
{
  "emailNotificationsEnabled": true,
  "budgetAlertsEnabled": false,
  "goalsNotificationsEnabled": true,
  "digestEmailFrequency": "daily"  // "daily", "weekly", or "none"
}

Response:
{
  "emailNotificationsEnabled": true,
  "budgetAlertsEnabled": false,
  "goalsNotificationsEnabled": true,
  "digestEmailFrequency": "daily"
}
```

### Manual Triggers (Testing)

#### Trigger Budget Alerts Check
```http
POST /api/notifications/check/budget-alerts

Response:
{
  "alerts": [...],
  "count": 2
}
```

#### Trigger Goal Achievements Check
```http
POST /api/notifications/check/goal-achievements

Response:
{
  "achievements": [...],
  "count": 1
}
```

#### Send Daily Digest Email
```http
POST /api/notifications/digest/daily

Response:
{
  "success": true,
  "message": "Daily digest email sent",
  "data": {
    "workoutCount": 1,
    "totalSteps": 8500,
    "nutritionLogs": 3,
    "expenseCount": 2,
    "totalExpenses": "500.00 NPR",
    "savingsRate": 20,
    "lifeScore": 62
  }
}
```

#### Send Weekly Digest Email
```http
POST /api/notifications/digest/weekly

Response:
{
  "success": true,
  "message": "Weekly digest email sent",
  "data": {
    "totalWorkouts": 5,
    "totalSteps": 75000,
    "avgDailySteps": 10714,
    "totalExpenses": "3500.00 NPR",
    "averageDailyExpenses": "500.00 NPR",
    "avgLifeScore": 60,
    "budgetAdhereance": 85
  }
}
```

## Database Schema

### User Fields (New)
```prisma
model User {
  // ... existing fields ...
  
  // Email notification preferences
  emailNotificationsEnabled   Boolean   @default(true)
  budgetAlertsEnabled         Boolean   @default(true)
  goalsNotificationsEnabled   Boolean   @default(true)
  digestEmailFrequency        String    @default("weekly")
  lastDigestEmailSentAt       DateTime?
  
  notifications Notification[]
}
```

### Notification Model
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      String   // "budget_alert", "goal_achieved", etc.
  title     String
  titleNp   String   // Nepali version
  message   String
  messageNp String   // Nepali version
  read      Boolean  @default(false)
  data      String?  // JSON stringified metadata
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([read])
}
```

## Email Templates

### Budget Alert Email
- Subject: "Budget Alert: {Category}"
- Shows: Spent amount, budget limit, percentage used
- Color-coded: Red if 90%+, Orange if 70-90%
- Includes actionable advice

### Goal Achievement Email
- Subject: "Goal Achieved!"
- Shows: Goal name and type
- Includes: Congratulations message and encouragement

### Daily Digest Email
- Subject: "Your Daily Summary"
- Health section: Workouts, steps, nutrition logs, life score
- Finance section: Expenses, savings rate
- Shows: Grid-based layout with metrics

### Weekly Digest Email
- Subject: "Your Weekly Summary"
- Health highlights: Total workouts, steps, average life score
- Finance overview: Total expenses, average daily expenses, budget adherence
- Includes: Weekly motivation message

## Architecture

### Services

#### emailService.js
- `sendEmail(to, subject, htmlContent, textContent)` - Sends email via configured SMTP
- `emailTemplates` - Pre-built email templates for all notification types

#### notificationService.js
- `checkBudgetAlerts(userId)` - Checks budgets and creates alert notifications/emails
- `checkGoalAchievements(userId)` - Checks goals and creates achievement notifications/emails
- `createDailyDigest(userId)` - Generates and sends daily digest email
- `createWeeklyDigest(userId)` - Generates and sends weekly digest email

#### digestScheduler.js
- `startAllSchedulers()` - Initializes cron jobs for daily/weekly digests
- `stopAllSchedulers()` - Gracefully stops schedulers on shutdown
- `scheduleDailyDigests()` - Daily at 9:00 AM UTC
- `scheduleWeeklyDigests()` - Every Sunday at 10:00 AM UTC

## Triggers

### Automatic Triggers
- **After creating expense transaction**: Checks budget alerts
- **After logging workout/health data**: Checks goal achievements
- **Scheduled (daily/weekly)**: Digest emails based on user preference

### Manual Triggers
- Testing endpoints available at `/api/notifications/digest/*` and `/api/notifications/check/*`

## Testing

### Local Development
1. Start Mailhog: `mailhog` (runs on :1025 SMTP, :8025 Web UI)
2. Log an expense transaction to trigger budget alert
3. View emails at http://localhost:8025

### Production Testing
1. Use test endpoints: `POST /api/notifications/digest/daily`
2. Check user's inbox for emails
3. Monitor server logs for email service errors

## Performance Considerations

- Budget checks run asynchronously after transactions (don't block response)
- Goal checks run asynchronously after health logging
- Digest emails sent to all eligible users during scheduled time windows
- Retry logic on query failures prevents cascading errors
- Email failures are logged but don't block user operations

## Troubleshooting

### Emails Not Sending
1. Check Mailhog is running: `curl http://localhost:1025`
2. Verify `.env` configuration
3. Check server logs for email service errors
4. Ensure `ENABLE_EMAIL_SCHEDULER=true` in .env

### High Latency
- Budget/goal checks happen asynchronously via `setImmediate()`
- Email sending handles errors gracefully
- Consider increasing connection pool if many scheduled digests fail

### Missing Emails
- Check user email preferences: `GET /api/notifications/preferences/email`
- Verify digest frequency is not set to "none"
- Check if budget/goals alerts are enabled in preferences
- Review server logs for query/email failures

## Future Enhancements

- SMS notifications for critical budget alerts
- Push notifications for mobile app
- Customizable email templates per user
- Batch email sending with improved performance
- Email preference center in UI
- Detailed email open/click tracking
- A/B testing for email subject lines
