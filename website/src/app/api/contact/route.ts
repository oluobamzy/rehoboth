import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { ContactService, type ContactMessageSubmission } from '@/services/contactService';

// Initialize email transporter
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASSWORD;
const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
const emailPort = parseInt(process.env.EMAIL_PORT || '587');
const emailFrom = process.env.EMAIL_FROM || 'notifications@rehobothchurch.org';

let transporter: nodemailer.Transporter | null = null;

// Initialize the email transporter if credentials are provided
if (emailUser && emailPass) {
  transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
} else {
  console.warn('⚠️ Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD in environment variables.');
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { name, email, subject, message } = body as ContactMessageSubmission;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Save message to database
    let savedMessage;
    try {
      savedMessage = await ContactService.submitMessage({ name, email, subject, message });
      console.log('Contact message saved to database:', savedMessage.id);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: "Failed to save message. Please try again." },
        { status: 500 }
      );
    }

    // Send email notifications if email service is configured
    if (transporter) {
      try {
        // Email to church admin
        const adminEmailOptions = {
          from: emailFrom,
          to: process.env.CONTACT_EMAIL || 'rehobothchrisitianchurch2022@gmail.com',
          replyTo: email,
          subject: `New Contact Form Message: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
                New Contact Form Submission
              </h2>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong style="color: #374151;">Name:</strong> ${name}</p>
                <p><strong style="color: #374151;">Email:</strong> ${email}</p>
                <p><strong style="color: #374151;">Subject:</strong> ${subject}</p>
                <p><strong style="color: #374151;">Message ID:</strong> ${savedMessage.id}</p>
                <p><strong style="color: #374151;">Submitted:</strong> ${new Date(savedMessage.submitted_at).toLocaleString()}</p>
              </div>
              
              <div style="background-color: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h3 style="color: #374151; margin-top: 0;">Message:</h3>
                <p style="line-height: 1.6; color: #4b5563;">${message.replace(/\n/g, '<br>')}</p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e;">
                  <strong>Action Required:</strong> Please respond to this message promptly. 
                  You can manage all contact messages in your admin dashboard.
                </p>
              </div>
            </div>
          `,
        };

        // Auto-responder to the sender
        const autoReplyOptions = {
          from: emailFrom,
          to: email,
          subject: 'Thank you for contacting Rehoboth Christian Church',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0;">Rehoboth Christian Church</h1>
                <p style="color: #6b7280; margin: 5px 0;">414 Pleasant Park Road, Rehoboth, MA 02769</p>
              </div>
              
              <h2 style="color: #374151;">Thank you for reaching out to us!</h2>
              
              <p style="line-height: 1.6; color: #4b5563;">Dear ${name},</p>
              
              <p style="line-height: 1.6; color: #4b5563;">
                We have received your message about "<strong>${subject}</strong>" and greatly appreciate you taking 
                the time to contact us. Your message is important to us, and we will get back to you as soon as possible.
              </p>
              
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
                <h3 style="color: #2563eb; margin-top: 0;">Your Message Summary:</h3>
                <p style="margin: 5px 0; color: #374151;"><strong>Reference ID:</strong> ${savedMessage.id.substring(0, 8).toUpperCase()}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Subject:</strong> ${subject}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #374151; margin-top: 0;">Contact Information:</h3>
                <p style="margin: 5px 0; color: #4b5563;">📧 <strong>Email:</strong> rehobothchrisitianchurch2022@gmail.com</p>
                <p style="margin: 5px 0; color: #4b5563;">📞 <strong>Phone:</strong> (613) 400-4966</p>
                <p style="margin: 5px 0; color: #4b5563;">📍 <strong>Address:</strong> 414 Pleasant Park Road, Rehoboth, MA 02769</p>
              </div>
              
              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #166534; margin-top: 0;">Service Times:</h3>
                <p style="margin: 5px 0; color: #166534;">🕒 <strong>Sunday:</strong> 3:00 PM - 6:00 PM</p>
                <p style="margin: 5px 0; color: #166534;">🕒 <strong>Wednesday:</strong> 7:00 PM - 9:00 PM (Prayer Service)</p>
                <p style="margin: 5px 0; color: #166534;">🕒 <strong>Saturday:</strong> 7:00 PM - 9:00 PM (Youth Prayer & Choir)</p>
              </div>
              
              <p style="line-height: 1.6; color: #4b5563;">
                We look forward to connecting with you soon!
              </p>
              
              <p style="line-height: 1.6; color: #4b5563;">
                God bless you,<br>
                <strong>The Rehoboth Christian Church Team</strong>
              </p>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                  This is an automated response. Please do not reply directly to this email.
                </p>
              </div>
            </div>
          `,
        };

        // Send both emails
        await Promise.all([
          transporter.sendMail(adminEmailOptions),
          transporter.sendMail(autoReplyOptions)
        ]);

        console.log('Email notifications sent successfully');
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the API call if email fails - message is already saved
      }
    } else {
      console.warn('Email service not configured - message saved to database only');
    }

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: "Thank you for your message. We will get back to you soon!",
      messageId: savedMessage.id
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
