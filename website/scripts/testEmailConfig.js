require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');
const Stripe = require('stripe');

async function testConfigurations() {
  console.log('Testing configurations...\n');

  // Test Stripe configuration
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil'
    });
    const balance = await stripe.balance.retrieve();
    console.log('✅ Stripe configuration is working!');
    console.log('Available balance:', {
      pending: balance.pending.map(b => `${b.amount/100} ${b.currency}`),
      available: balance.available.map(b => `${b.amount/100} ${b.currency}`)
    });
  } catch (error) {
    console.error('❌ Stripe configuration error:', error.message);
  }

  console.log('\n-------------------\n');

  // Test email configuration
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify connection configuration
    await transporter.verify();
    console.log('✅ Email configuration is working!');

    // Send test email
    const testEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    console.log(`\nSending test email to ${testEmail}...`);
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: testEmail,
      subject: 'Test Email Configuration',
      text: 'If you received this email, your email configuration is working correctly!',
      html: `
        <h1>Email Configuration Test</h1>
        <p>If you received this email, your email configuration is working correctly!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
  }
}

testConfigurations().catch(console.error);
