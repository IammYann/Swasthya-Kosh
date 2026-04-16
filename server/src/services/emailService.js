import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'localhost',
  port: process.env.EMAIL_PORT || 1025, // Mailhog default
  secure: process.env.EMAIL_SECURE === 'true',
  auth: process.env.EMAIL_USER && process.env.EMAIL_PASSWORD ? {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  } : undefined
});

// Verify transporter connection
if (process.env.NODE_ENV === 'development') {
  transporter.verify((err, success) => {
    if (err) {
      console.error('Email transporter error:', err.message);
      console.log('Email service running in demo mode (emails will not be sent)');
    } else if (success) {
      console.log('Email service connected successfully');
    }
  });
}

/**
 * Send email with retry logic
 */
export async function sendEmail(to, subject, htmlContent, textContent) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@svasthya-kosh.app',
      to,
      subject,
      html: htmlContent,
      text: textContent,
      replyTo: process.env.EMAIL_REPLY_TO || 'support@svasthya-kosh.app'
    });

    console.log('Email sent:', {
      to,
      subject,
      messageId: info.messageId,
      response: info.response
    });

    return info;
  } catch (error) {
    console.error('Failed to send email:', {
      to,
      subject,
      error: error.message
    });
    throw error;
  }
}

/**
 * Email templates
 */
export const emailTemplates = {
  budgetAlert: (userName, budgetCategory, spent, limit, percentUsed) => {
    const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Budget Alert</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hi <strong>${userName}</strong>,
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your spending on <strong>${budgetCategory}</strong> is approaching your limit.
          </p>
          
          <div style="background-color: #f0f8ff; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #333; font-size: 14px;">
              <strong>Category:</strong> ${budgetCategory}<br>
              <strong>Spent:</strong> ${spent}<br>
              <strong>Budget Limit:</strong> ${limit}<br>
              <strong>Used:</strong> <span style="color: ${percentUsed > 90 ? '#d32f2f' : '#ff9800'}; font-weight: bold;">${percentUsed}%</span>
            </p>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            ${percentUsed > 90 ? 'You have exceeded or are very close to your budget limit. Please review your spending.' : 'Consider reducing expenses in this category to stay within your budget.'}
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Log in to your account to view more details and manage your budgets.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
            This is an automated notification from Svasthya Kosh. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
    `;

    const textContent = `
Budget Alert

Hi ${userName},

Your spending on ${budgetCategory} is approaching your limit.

Category: ${budgetCategory}
Spent: ${spent}
Budget Limit: ${limit}
Used: ${percentUsed}%

${percentUsed > 90 ? 'You have exceeded or are very close to your budget limit. Please review your spending.' : 'Consider reducing expenses in this category to stay within your budget.'}

Log in to your account to view more details and manage your budgets.
    `;

    return { htmlContent, textContent };
  },

  goalAchieved: (userName, goalName, goalType) => {
    const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #4caf50; margin-bottom: 20px;">🎉 Goal Achieved!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hi <strong>${userName}</strong>,
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Congratulations! You have successfully achieved your <strong>${goalType}</strong> goal!
          </p>
          
          <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #333; font-size: 16px; font-weight: bold;">
              ${goalName}
            </p>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            This is a great achievement! Keep up the excellent work and continue pursuing your health and financial goals.
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            View your achievements and set new goals in your account.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
            This is an automated notification from Svasthya Kosh. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
    `;

    const textContent = `
Goal Achieved!

Hi ${userName},

Congratulations! You have successfully achieved your ${goalType} goal!

${goalName}

This is a great achievement! Keep up the excellent work and continue pursuing your health and financial goals.

View your achievements and set new goals in your account.
    `;

    return { htmlContent, textContent };
  },

  dailyDigest: (userName, digestData) => {
    const {
      workoutCount = 0,
      totalSteps = 0,
      nutritionLogs = 0,
      expenseCount = 0,
      totalExpenses = 0,
      savingsRate = 0,
      lifeScore = 0
    } = digestData;

    const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Your Daily Summary</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hi <strong>${userName}</strong>,
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Here's a summary of your activity today.
          </p>
          
          <h3 style="color: #333; margin-top: 25px; margin-bottom: 15px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Health Activity</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
              <p style="margin: 0; color: #999; font-size: 12px; text-transform: uppercase;">Workouts</p>
              <p style="margin: 10px 0 0 0; color: #333; font-size: 24px; font-weight: bold;">${workoutCount}</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
              <p style="margin: 0; color: #999; font-size: 12px; text-transform: uppercase;">Steps</p>
              <p style="margin: 10px 0 0 0; color: #333; font-size: 24px; font-weight: bold;">${totalSteps.toLocaleString()}</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
              <p style="margin: 0; color: #999; font-size: 12px; text-transform: uppercase;">Nutrition Logs</p>
              <p style="margin: 10px 0 0 0; color: #333; font-size: 24px; font-weight: bold;">${nutritionLogs}</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
              <p style="margin: 0; color: #999; font-size: 12px; text-transform: uppercase;">Life Score</p>
              <p style="margin: 10px 0 0 0; color: #4caf50; font-size: 24px; font-weight: bold;">${lifeScore}/100</p>
            </div>
          </div>
          
          <h3 style="color: #333; margin-top: 25px; margin-bottom: 15px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Finance Summary</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
              <p style="margin: 0; color: #999; font-size: 12px; text-transform: uppercase;">Expenses</p>
              <p style="margin: 10px 0 0 0; color: #333; font-size: 24px; font-weight: bold;">${expenseCount}</p>
              <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">Total: ${totalExpenses}</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
              <p style="margin: 0; color: #999; font-size: 12px; text-transform: uppercase;">Savings Rate</p>
              <p style="margin: 10px 0 0 0; color: ${savingsRate > 20 ? '#4caf50' : '#ff9800'}; font-size: 24px; font-weight: bold;">${savingsRate}%</p>
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Keep up the great work! Log more activities to improve your health and financial well-being.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
            This is an automated notification from Svasthya Kosh. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
    `;

    const textContent = `
Your Daily Summary

Hi ${userName},

Here's a summary of your activity today.

Health Activity:
- Workouts: ${workoutCount}
- Steps: ${totalSteps.toLocaleString()}
- Nutrition Logs: ${nutritionLogs}
- Life Score: ${lifeScore}/100

Finance Summary:
- Expenses: ${expenseCount}
- Total Expenses: ${totalExpenses}
- Savings Rate: ${savingsRate}%

Keep up the great work! Log more activities to improve your health and financial well-being.
    `;

    return { htmlContent, textContent };
  },

  weeklyDigest: (userName, weeklyData) => {
    const {
      totalWorkouts = 0,
      totalSteps = 0,
      avgDailySteps = 0,
      totalExpenses = 0,
      averageDailyExpenses = 0,
      avgLifeScore = 0,
      budgetAdhereance = 0
    } = weeklyData;

    const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Your Weekly Summary</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hi <strong>${userName}</strong>,
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Here's an overview of your activity this week.
          </p>
          
          <h3 style="color: #333; margin-top: 25px; margin-bottom: 15px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Health Highlights</h3>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
            <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;"><strong>Workouts This Week:</strong> <span style="color: #4caf50; font-weight: bold;">${totalWorkouts}</span></p>
            <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;"><strong>Total Steps:</strong> <span style="color: #4caf50; font-weight: bold;">${totalSteps.toLocaleString()}</span></p>
            <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;"><strong>Average Daily Steps:</strong> <span style="color: #4caf50; font-weight: bold;">${avgDailySteps.toLocaleString()}</span></p>
            <p style="margin: 0; color: #333; font-size: 14px;"><strong>Average Life Score:</strong> <span style="color: #4caf50; font-weight: bold;">${avgLifeScore}/100</span></p>
          </div>
          
          <h3 style="color: #333; margin-top: 25px; margin-bottom: 15px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Finance Overview</h3>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;"><strong>Total Expenses:</strong> <span style="color: #d32f2f; font-weight: bold;">${totalExpenses}</span></p>
            <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;"><strong>Average Daily Expenses:</strong> <span style="color: #d32f2f; font-weight: bold;">${averageDailyExpenses}</span></p>
            <p style="margin: 0; color: #333; font-size: 14px;"><strong>Budget Adherence:</strong> <span style="color: ${budgetAdhereance > 80 ? '#4caf50' : '#ff9800'}; font-weight: bold;">${budgetAdhereance}%</span></p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Great progress this week! Continue maintaining this momentum to achieve your health and financial goals.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
            This is an automated notification from Svasthya Kosh. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
    `;

    const textContent = `
Your Weekly Summary

Hi ${userName},

Here's an overview of your activity this week.

Health Highlights:
- Workouts This Week: ${totalWorkouts}
- Total Steps: ${totalSteps.toLocaleString()}
- Average Daily Steps: ${avgDailySteps.toLocaleString()}
- Average Life Score: ${avgLifeScore}/100

Finance Overview:
- Total Expenses: ${totalExpenses}
- Average Daily Expenses: ${averageDailyExpenses}
- Budget Adherence: ${budgetAdhereance}%

Great progress this week! Continue maintaining this momentum to achieve your health and financial goals.
    `;

    return { htmlContent, textContent };
  },

  welcome: (email) => {
    const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #00D4B4; margin-bottom: 20px;">🏔️ Welcome to Svasthya Kosh</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hello,
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for your interest in Svasthya Kosh! We're excited to help you take control of your health and wealth in one unified platform.
          </p>
          
          <div style="background: linear-gradient(135deg, rgba(0, 212, 180, 0.1) 0%, rgba(0, 212, 180, 0.05) 100%); border-left: 4px solid #00D4B4; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #333; font-size: 14px;">
              <strong>What You'll Get:</strong><br>
              ✓ Track your health and expenses together<br>
              ✓ AI-powered insights for better decisions<br>
              ✓ Life Score - your wellness in one number<br>
              ✓ Budget alerts and financial goals<br>
              ✓ Smart daily & weekly summaries
            </p>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            <strong>Ready to get started?</strong> Sign up now and join thousands of Nepali people taking control of their health and wealth.
          </p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://svasthya-kosh.app/register" style="display: inline-block; padding: 12px 30px; background-color: #00D4B4; color: #1a1a1a; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Create Your Account
            </a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Questions? We're here to help. Reply to this email or visit our support page.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
            Made for Nepal 🇳🇵 by Svasthya Kosh Team<br>
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
    `;

    const textContent = `
Welcome to Svasthya Kosh

Hello,

Thank you for your interest in Svasthya Kosh! We're excited to help you take control of your health and wealth in one unified platform.

What You'll Get:
✓ Track your health and expenses together
✓ AI-powered insights for better decisions
✓ Life Score - your wellness in one number
✓ Budget alerts and financial goals
✓ Smart daily & weekly summaries

Ready to get started? Sign up now and join thousands of Nepali people taking control of their health and wealth.

Create Your Account: https://svasthya-kosh.app/register

Questions? We're here to help. Reply to this email or visit our support page.

Made for Nepal 🇳🇵 by Svasthya Kosh Team
This is an automated message. Please do not reply to this email.
    `;

    return { htmlContent, textContent };
  }
};
