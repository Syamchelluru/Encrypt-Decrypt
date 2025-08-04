import nodemailer from 'nodemailer'

const GMAIL_USER = process.env.GMAIL_USER!
const GMAIL_PASS = process.env.GMAIL_PASS!

if (!GMAIL_USER || !GMAIL_PASS) {
  throw new Error('Gmail credentials are not set in environment variables')
}

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS, // Use App Password, not regular password
  },
  secure: true,
})

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP configuration error:', error)
  } else {
    console.log('SMTP server is ready to send emails')
  }
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Send email function
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const mailOptions = {
      from: {
        name: 'Fix My Area',
        address: GMAIL_USER
      },
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// Send OTP email
export async function sendOTPEmail(email: string, otp: string, name?: string): Promise<boolean> {
  const subject = 'Your Fix My Area Verification Code'
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Fix My Area - Verification Code</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 10px;
        }
        .otp-code {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          font-size: 32px;
          font-weight: bold;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 30px 0;
          letter-spacing: 4px;
        }
        .message {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .warning {
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏘️ Fix My Area</div>
          <p>Civic Issue Reporting Platform</p>
        </div>
        
        <div class="message">
          <p>Hello${name ? ` ${name}` : ''},</p>
          <p>Thank you for using Fix My Area! To complete your verification, please use the following code:</p>
        </div>
        
        <div class="otp-code">
          ${otp}
        </div>
        
        <div class="message">
          <p>This verification code will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
        
        <div class="warning">
          <strong>Security Notice:</strong> Never share this code with anyone. Fix My Area will never ask for your verification code via phone or email.
        </div>
        
        <div class="footer">
          <p>This email was sent from Fix My Area</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>&copy; ${new Date().getFullYear()} Fix My Area. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Fix My Area - Verification Code
    
    Hello${name ? ` ${name}` : ''},
    
    Thank you for using Fix My Area! To complete your verification, please use the following code:
    
    ${otp}
    
    This verification code will expire in 10 minutes.
    
    If you didn't request this code, please ignore this email.
    
    Security Notice: Never share this code with anyone. Fix My Area will never ask for your verification code via phone or email.
    
    © ${new Date().getFullYear()} Fix My Area. All rights reserved.
  `

  return sendEmail({
    to: email,
    subject,
    html,
    text
  })
}

// Send welcome email
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const subject = 'Welcome to Fix My Area!'
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Fix My Area</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 10px;
        }
        .welcome-message {
          font-size: 18px;
          margin-bottom: 20px;
          text-align: center;
        }
        .features {
          margin: 30px 0;
        }
        .feature {
          display: flex;
          align-items: center;
          margin: 15px 0;
          padding: 15px;
          background-color: #f8fafc;
          border-radius: 8px;
        }
        .feature-icon {
          font-size: 24px;
          margin-right: 15px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          margin: 20px auto;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏘️ Fix My Area</div>
          <p>Civic Issue Reporting Platform</p>
        </div>
        
        <div class="welcome-message">
          <h2>Welcome, ${name}! 🎉</h2>
          <p>Thank you for joining Fix My Area. Together, we can make our communities better!</p>
        </div>
        
        <div class="features">
          <div class="feature">
            <div class="feature-icon">📍</div>
            <div>
              <strong>Report Issues</strong><br>
              Easily report civic issues in your area with photos and precise locations.
            </div>
          </div>
          
          <div class="feature">
            <div class="feature-icon">👍</div>
            <div>
              <strong>Vote & Support</strong><br>
              Upvote issues that matter to you and help prioritize community needs.
            </div>
          </div>
          
          <div class="feature">
            <div class="feature-icon">📊</div>
            <div>
              <strong>Track Progress</strong><br>
              Monitor the status of reported issues from pending to resolved.
            </div>
          </div>
          
          <div class="feature">
            <div class="feature-icon">🗺️</div>
            <div>
              <strong>Interactive Map</strong><br>
              View all issues in your area on an interactive map interface.
            </div>
          </div>
        </div>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="button">
            Start Exploring
          </a>
        </div>
        
        <div class="footer">
          <p>Ready to make a difference in your community?</p>
          <p>Start by reporting your first issue or exploring what others have shared.</p>
          <p>&copy; ${new Date().getFullYear()} Fix My Area. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject,
    html
  })
}

// Send issue status update email
export async function sendIssueStatusUpdateEmail(
  email: string, 
  name: string, 
  issueTitle: string, 
  oldStatus: string, 
  newStatus: string,
  issueId: string
): Promise<boolean> {
  const subject = `Issue Update: ${issueTitle}`
  
  const statusEmojis = {
    pending: '⏳',
    'in-progress': '🔄',
    resolved: '✅'
  }
  
  const statusColors = {
    pending: '#f59e0b',
    'in-progress': '#3b82f6',
    resolved: '#22c55e'
  }
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Issue Status Update</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 10px;
        }
        .status-update {
          background-color: #f8fafc;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 500;
          margin: 0 10px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          margin: 20px auto;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏘️ Fix My Area</div>
          <p>Issue Status Update</p>
        </div>
        
        <p>Hello ${name},</p>
        
        <p>Great news! There's an update on the issue you reported:</p>
        
        <div class="status-update">
          <h3>"${issueTitle}"</h3>
          
          <div style="margin: 20px 0;">
            <span class="status-badge" style="background-color: ${statusColors[oldStatus as keyof typeof statusColors]}; color: white;">
              ${statusEmojis[oldStatus as keyof typeof statusEmojis]} ${oldStatus.replace('-', ' ').toUpperCase()}
            </span>
            <span style="font-size: 20px; margin: 0 10px;">→</span>
            <span class="status-badge" style="background-color: ${statusColors[newStatus as keyof typeof statusColors]}; color: white;">
              ${statusEmojis[newStatus as keyof typeof statusEmojis]} ${newStatus.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </div>
        
        ${newStatus === 'resolved' ? 
          '<p>🎉 <strong>Congratulations!</strong> Your reported issue has been resolved. Thank you for helping make your community better!</p>' :
          '<p>Your issue is now being actively worked on. We\'ll keep you updated on any further progress.</p>'
        }
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/issue/${issueId}" class="button">
            View Issue Details
          </a>
        </div>
        
        <div class="footer">
          <p>Thank you for using Fix My Area to improve your community!</p>
          <p>&copy; ${new Date().getFullYear()} Fix My Area. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject,
    html
  })
}

export default transporter

