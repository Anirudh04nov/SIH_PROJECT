const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send OTP email
const sendOTP = async (email, otp, type) => {
  try {
    const subject = type === 'registration' 
      ? 'Welcome to Learning World - Verify Your Account' 
      : 'Login to Learning World - Your OTP';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Learning World</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Adventure Awaits!</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #333; margin-top: 0;">${type === 'registration' ? 'Welcome to Learning World!' : 'Login to Your Account'}</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            ${type === 'registration' 
              ? 'Thank you for joining our amazing learning adventure! To complete your registration, please use the OTP below:'
              : 'To access your learning account, please use the OTP below:'
            }
          </p>
          
          <div style="background: white; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
            <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 5px; font-family: monospace;">${otp}</h1>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This OTP will expire in 10 minutes. Please don't share it with anyone.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              If you didn't request this ${type === 'registration' ? 'registration' : 'login'}, please ignore this email.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2024 Learning World. Making education fun and engaging!</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Verify OTP (placeholder for future use)
const verifyOTP = async (email, otp) => {
  // This would typically check against a database
  // For now, we'll handle this in the auth routes
  return true;
};

module.exports = { sendOTP, verifyOTP };
