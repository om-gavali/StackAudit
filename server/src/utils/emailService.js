const nodemailer = require('nodemailer');

const sendConfirmationEmail = async (email, companyName, savings, reportId) => {
  try {
    let transporter;

    // Use SMTP environment variables if provided
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Fallback: Create ethereal test account
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const appUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const reportUrl = `${appUrl}/report/${reportId}`;
    
    const mailOptions = {
      from: '"AI Spend Audit" <no-reply@aispendaudit.com>',
      to: email,
      subject: `Your AI Spend Audit for ${companyName} is ready! 🚀`,
      text: `Hi,\n\nYour AI Spend Audit for ${companyName} is ready. You can save up to $${savings}/month ($${savings * 12}/year) by optimizing your stack.\n\nView details: ${reportUrl}\n\nBest,\nAI Spend Audit Team`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #7c3aed, #db2777); line-height: 48px; text-align: center; color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 12px;">
              ✦
            </div>
            <h2 style="color: #0f172a; margin: 0; font-size: 22px; font-weight: 800; tracking: -0.025em;">AI Spend Audit</h2>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">Hi there,</p>
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">Thank you for auditing your stack with <strong>AI Spend Audit</strong>! We analyzed your current tooling bills for <strong>${companyName}</strong> and found a significant optimization opportunity.</p>
          
          <div style="background: linear-gradient(to right, #f8fafc, #f1f5f9); padding: 20px; border-radius: 10px; border-left: 4px solid #10b981; margin: 24px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Potential Monthly Savings</p>
            <h3 style="margin: 6px 0 0 0; color: #10b981; font-size: 32px; font-weight: 800;">$${savings} / month</h3>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569; font-weight: 500;">That's <strong>$${savings * 12} / year</strong> back in your budget!</p>
          </div>
          
          <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px;">To view the full interactive dashboard containing your custom spend breakdown, model comparison charts, and actionable instructions to secure these savings, click the link below:</p>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${reportUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #db2777); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25); transition: all 0.2s;">
              View Optimized Stack & Savings
            </a>
          </div>
          
          <p style="font-size: 14px; color: #94a3b8; line-height: 1.5; margin: 0;">If you did not generate this report, please disregard this email. The shareable report hides all of your company's private info by default.</p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          
          <div style="text-align: center; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0 0 4px 0;"><strong>AI Spend Audit Inc.</strong></p>
            <p style="margin: 0;">123 AI Boulevard, Suite 500 • San Francisco, CA 94107</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email confirmation successfully sent! Message ID: %s", info.messageId);
    let previewUrl = null;
    if (!process.env.SMTP_HOST) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("Ethereal Mail Preview Link: %s", previewUrl);
    }
    return { success: true, previewUrl };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendConfirmationEmail };
