"use server";

import { Event, EventRegistration } from '@/services/eventService';
import { formatDate, formatTime } from '@/utils/dateUtils';
import nodemailer from 'nodemailer';

// In a real implementation, we would use SendGrid, AWS SES, or similar email service
// For this example, we'll just define the structure and the functions

interface EmailTemplateData {
  event: Event;
  registration?: EventRegistration;
  confirmationCode?: string;
  waitlistPosition?: number;
}

interface AdminInviteEmailData {
  email: string;
  role: 'admin' | 'moderator';
  inviteToken: string;
  inviterName?: string;
  inviterEmail: string;
  expiresAt: string;
}

const SENDER_EMAIL = process.env.EMAIL_FROM || 'events@rehoboth-church.org';
const SENDER_NAME = 'Rehoboth Church Events';

// Create reusable transporter object using Gmail SMTP
const createEmailTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email configuration missing. Emails will be logged to console only.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Gmail app password
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates if needed
    }
  });
};

// Simulate sending an email - in production, this would use a real email service like SendGrid
async function sendEmail(to: string, subject: string, htmlContent: string) {
  try {
    console.log(`Attempting to send email to ${to}`);
    console.log(`Subject: ${subject}`);
    
    const transporter = createEmailTransporter();
    
    if (!transporter) {
      console.log('No email transporter available. Email content:');
      console.log(htmlContent);
      return true; // Return true for development to not break the flow
    }

    // Verify transporter configuration
    await transporter.verify();
    console.log('SMTP server is ready to send emails');

    // Send the email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || SENDER_EMAIL,
      to: to,
      subject: subject,
      html: htmlContent,
    });

    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Log email content for debugging
    console.log('Failed email content:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${htmlContent}`);
    
    return false;
  }
}

// Registration confirmation email
export async function sendRegistrationConfirmation(
  data: EmailTemplateData
): Promise<boolean> {
  const { event, registration, confirmationCode } = data;
  
  if (!event || !registration) {
    console.error('Missing event or registration data for confirmation email');
    return false;
  }
  
  const subject = `Registration Confirmed: ${event.title}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">Your registration for ${event.title} has been confirmed!</h2>
      
      <p>Dear ${registration.attendee_name},</p>
      
      <p>Thank you for registering for our upcoming event. Your registration has been confirmed.</p>
      
      <div style="background-color: #f7fafc; border-radius: 4px; padding: 16px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Event Details</h3>
        <p><strong>Event:</strong> ${event.title}</p>
        <p><strong>Date:</strong> ${formatDate(event.start_datetime)}</p>
        <p><strong>Time:</strong> ${formatTime(event.start_datetime)} - ${formatTime(event.end_datetime)}</p>
        <p><strong>Location:</strong> ${event.location_name || 'TBA'}</p>
        ${event.location_address ? `<p><strong>Address:</strong> ${event.location_address}</p>` : ''}
        <p><strong>Confirmation Code:</strong> <span style="font-family: monospace; font-weight: bold; font-size: 1.2em;">${confirmationCode}</span></p>
      </div>
      
      <p>Please keep this confirmation for your records. If you need to make changes to your registration, please contact us at ${event.contact_email || 'events@rehoboth-church.org'}.</p>
      
      <p style="margin-top: 32px;">We look forward to seeing you there!</p>
      
      <p>Blessings,<br>Rehoboth Christian Church</p>
    </div>
  `;
  
  return await sendEmail(registration.attendee_email, subject, htmlContent);
}

// Waitlist notification email
export async function sendWaitlistNotification(
  data: EmailTemplateData
): Promise<boolean> {
  const { event, registration, waitlistPosition } = data;
  
  if (!event || !registration) {
    console.error('Missing event or registration data for waitlist email');
    return false;
  }
  
  const subject = `Waitlist Notification: ${event.title}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">You've been added to the waitlist for ${event.title}</h2>
      
      <p>Dear ${registration.attendee_name},</p>
      
      <p>Thank you for your interest in our event. The event has reached its capacity, so you have been placed on our waitlist.</p>
      
      <div style="background-color: #f7fafc; border-radius: 4px; padding: 16px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Event Details</h3>
        <p><strong>Event:</strong> ${event.title}</p>
        <p><strong>Date:</strong> ${formatDate(event.start_datetime)}</p>
        <p><strong>Time:</strong> ${formatTime(event.start_datetime)} - ${formatTime(event.end_datetime)}</p>
        <p><strong>Location:</strong> ${event.location_name || 'TBA'}</p>
        ${waitlistPosition ? `<p><strong>Waitlist Position:</strong> ${waitlistPosition}</p>` : ''}
      </div>
      
      <p>We will notify you if a spot becomes available. If you have any questions, please contact us at ${event.contact_email || 'events@rehoboth-church.org'}.</p>
      
      <p style="margin-top: 32px;">Thank you for your understanding!</p>
      
      <p>Blessings,<br>Rehoboth Christian Church</p>
    </div>
  `;
  
  return await sendEmail(registration.attendee_email, subject, htmlContent);
}

// Event reminder email (to be sent a day or two before the event)
export async function sendEventReminder(
  data: EmailTemplateData
): Promise<boolean> {
  const { event, registration } = data;
  
  if (!event || !registration) {
    console.error('Missing event or registration data for reminder email');
    return false;
  }
  
  const subject = `Reminder: ${event.title} is coming up!`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">Reminder: Your upcoming event is almost here!</h2>
      
      <p>Dear ${registration.attendee_name},</p>
      
      <p>This is a friendly reminder that you are registered for ${event.title}, which is coming up soon.</p>
      
      <div style="background-color: #f7fafc; border-radius: 4px; padding: 16px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Event Details</h3>
        <p><strong>Event:</strong> ${event.title}</p>
        <p><strong>Date:</strong> ${formatDate(event.start_datetime)}</p>
        <p><strong>Time:</strong> ${formatTime(event.start_datetime)} - ${formatTime(event.end_datetime)}</p>
        <p><strong>Location:</strong> ${event.location_name || 'TBA'}</p>
        ${event.location_address ? `<p><strong>Address:</strong> ${event.location_address}</p>` : ''}
      </div>
      
      <p>We look forward to seeing you there! If you can no longer attend, please let us know so we can offer your spot to someone on the waitlist.</p>
      
      <p style="margin-top: 32px;">Blessings,<br>Rehoboth Christian Church</p>
    </div>
  `;
  
  return await sendEmail(registration.attendee_email, subject, htmlContent);
}

// Waitlist promotion email (when someone cancels and a spot opens up)
export async function sendWaitlistPromotionNotification(
  data: EmailTemplateData
): Promise<boolean> {
  const { event, registration } = data;
  
  if (!event || !registration) {
    console.error('Missing event or registration data for waitlist promotion email');
    return false;
  }
  
  const subject = `Good news! You're now registered for ${event.title}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">Good news! A spot has opened up for you.</h2>
      
      <p>Dear ${registration.attendee_name},</p>
      
      <p>We're pleased to inform you that a spot has become available for ${event.title} and your registration has been moved from the waitlist to confirmed status.</p>
      
      <div style="background-color: #f7fafc; border-radius: 4px; padding: 16px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Event Details</h3>
        <p><strong>Event:</strong> ${event.title}</p>
        <p><strong>Date:</strong> ${formatDate(event.start_datetime)}</p>
        <p><strong>Time:</strong> ${formatTime(event.start_datetime)} - ${formatTime(event.end_datetime)}</p>
        <p><strong>Location:</strong> ${event.location_name || 'TBA'}</p>
        ${event.location_address ? `<p><strong>Address:</strong> ${event.location_address}</p>` : ''}
      </div>
      
      <p>Please let us know if you can no longer attend by contacting us at ${event.contact_email || 'events@rehoboth-church.org'}.</p>
      
      <p style="margin-top: 32px;">We look forward to seeing you there!</p>
      
      <p>Blessings,<br>Rehoboth Christian Church</p>
    </div>
  `;
  
  return await sendEmail(registration.attendee_email, subject, htmlContent);
}

// Admin invitation email
export async function sendAdminInvitation(
  data: AdminInviteEmailData
): Promise<boolean> {
  const { email, role, inviteToken, inviterName, inviterEmail, expiresAt } = data;
  
  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rehobothnewwebsite-h8fe3klga-rehoboth-churchs-projects.vercel.app'}/auth/invite?token=${inviteToken}`;
  const roleDisplayName = role === 'admin' ? 'Administrator' : 'Moderator';
  
  const subject = `You're invited to join Rehoboth Church as ${roleDisplayName}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #2d3748; margin-bottom: 8px;">Rehoboth Christian Church</h1>
        <p style="color: #718096; margin: 0;">Admin Panel Invitation</p>
      </div>
      
      <h2 style="color: #4a5568;">You've been invited to join our team!</h2>
      
      <p>Hello,</p>
      
      <p>You have been invited by ${inviterName || inviterEmail} to join the Rehoboth Christian Church admin team as a <strong>${roleDisplayName}</strong>.</p>
      
      <div style="background-color: #ebf8ff; border-left: 4px solid #3182ce; border-radius: 4px; padding: 16px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Invitation Details</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Role:</strong> ${roleDisplayName}</p>
        <p><strong>Invited by:</strong> ${inviterName || inviterEmail}</p>
        <p><strong>Expires:</strong> ${new Date(expiresAt).toLocaleDateString()} at ${new Date(expiresAt).toLocaleTimeString()}</p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${inviteUrl}" 
           style="display: inline-block; background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Accept Invitation
        </a>
      </div>
      
      <div style="background-color: #fffbeb; border-radius: 4px; padding: 16px; margin: 24px 0;">
        <h4 style="margin-top: 0; color: #92400e;">As a ${roleDisplayName}, you will be able to:</h4>
        <ul style="color: #92400e;">
          ${role === 'admin' ? `
            <li>Manage all website content (sermons, events, gallery)</li>
            <li>Manage user accounts and permissions</li>
            <li>Send admin invitations to new users</li>
            <li>Access donation records and reports</li>
            <li>Manage volunteer applications</li>
            <li>Send newsletters to church members</li>
          ` : `
            <li>Manage website content (sermons, events, gallery)</li>
            <li>Moderate volunteer applications</li>
            <li>View and respond to contact messages</li>
            <li>Assist with content management</li>
          `}
        </ul>
      </div>
      
      <p><strong>To accept this invitation:</strong></p>
      <ol>
        <li>Click the "Accept Invitation" button above</li>
        <li>Create your account password</li>
        <li>Start managing the church website</li>
      </ol>
      
      <p style="color: #718096; font-size: 14px; margin-top: 32px;">
        <strong>Note:</strong> This invitation will expire on ${new Date(expiresAt).toLocaleDateString()}. 
        If you don't accept by then, please contact ${inviterEmail} for a new invitation.
      </p>
      
      <p style="color: #718096; font-size: 14px;">
        If you're unable to click the button above, copy and paste this link into your browser:<br>
        <a href="${inviteUrl}" style="color: #3182ce; word-break: break-all;">${inviteUrl}</a>
      </p>
      
      <p style="margin-top: 32px;">God bless,<br>Rehoboth Christian Church Admin Team</p>
    </div>
  `;
  
  return await sendEmail(email, subject, htmlContent);
}

// Welcome email after admin account creation
export async function sendAdminWelcomeEmail(
  email: string,
  fullName: string,
  role: 'admin' | 'moderator'
): Promise<boolean> {
  const roleDisplayName = role === 'admin' ? 'Administrator' : 'Moderator';
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rehobothnewwebsite-h8fe3klga-rehoboth-churchs-projects.vercel.app'}/admin/dashboard`;
  
  const subject = `Welcome to Rehoboth Church Admin Team!`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #2d3748; margin-bottom: 8px;">Rehoboth Christian Church</h1>
        <p style="color: #718096; margin: 0;">Welcome to the Team!</p>
      </div>
      
      <h2 style="color: #4a5568;">Welcome aboard, ${fullName}! 🎉</h2>
      
      <p>We're excited to have you join the Rehoboth Christian Church admin team as a <strong>${roleDisplayName}</strong>.</p>
      
      <div style="background-color: #f0fff4; border-left: 4px solid #38a169; border-radius: 4px; padding: 16px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">✅ Your account is ready!</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Role:</strong> ${roleDisplayName}</p>
        <p style="margin-bottom: 0;"><strong>Status:</strong> Active</p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${adminUrl}" 
           style="display: inline-block; background-color: #38a169; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Access Admin Dashboard
        </a>
      </div>
      
      <div style="background-color: #ebf8ff; border-radius: 4px; padding: 16px; margin: 24px 0;">
        <h4 style="margin-top: 0; color: #2d3748;">Getting Started:</h4>
        <ul style="color: #2d3748;">
          <li>Explore the admin dashboard to familiarize yourself with the tools</li>
          <li>Review existing content (sermons, events, gallery)</li>
          <li>Check out the volunteer applications and messages</li>
          ${role === 'admin' ? '<li>You can invite additional team members from the Users section</li>' : ''}
          <li>Contact other team members if you need help getting started</li>
        </ul>
      </div>
      
      <p>If you have any questions or need assistance, don't hesitate to reach out to the church leadership.</p>
      
      <p style="margin-top: 32px;">Welcome to the team, and God bless!</p>
      
      <p>Rehoboth Christian Church Admin Team</p>
    </div>
  `;
  
  return await sendEmail(email, subject, htmlContent);
}
