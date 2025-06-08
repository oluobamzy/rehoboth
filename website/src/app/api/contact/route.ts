import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Configure mail transporter
    // Note: In production, you should use environment variables for these values
    const transporter = nodemailer.createTransport({
      service: 'gmail',  // Update with your email service
      auth: {
        user: process.env.EMAIL_USER || 'church@example.com',
        pass: process.env.EMAIL_PASSWORD || 'your-password',
      },
    });

    // Email to church admin
    const mailOptions = {
      from: process.env.EMAIL_USER || 'church@example.com',
      to: process.env.CONTACT_EMAIL || 'admin@rehobothcchurch.org',
      replyTo: email,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h3>New Message from Contact Form</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    // Auto-responder to the sender
    const autoReplyOptions = {
      from: process.env.EMAIL_USER || 'church@example.com',
      to: email,
      subject: 'Thank you for contacting Rehoboth Christian Church',
      html: `
        <h3>Thank you for contacting Rehoboth Christian Church</h3>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>God bless you!</p>
        <p>Rehoboth Christian Church Team</p>
      `,
    };

    // Send emails
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(autoReplyOptions);

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
