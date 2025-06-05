"use server";

import { Event, EventRegistration } from '@/services/eventService';
import { formatDate, formatTime } from '@/utils/dateUtils';

// In a real implementation, we would use SendGrid, AWS SES, or similar email service
// For this example, we'll just define the structure and the functions

interface EmailTemplateData {
  event: Event;
  registration?: EventRegistration;
  confirmationCode?: string;
  waitlistPosition?: number;
}

const SENDER_EMAIL = 'events@rehoboth-church.org';
const SENDER_NAME = 'Rehoboth Church Events';

// Simulate sending an email - in production, this would use a real email service like SendGrid
async function sendEmail(to: string, subject: string, htmlContent: string) {
  try {
    console.log(`Sending email to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${htmlContent}`);
    
    // In production, this would call the email service API
    // For example, with SendGrid:
    /*
    const msg = {
      to,
      from: {
        email: SENDER_EMAIL,
        name: SENDER_NAME
      },
      subject,
      html: htmlContent,
    };
    
    return await sendgrid.send(msg);
    */
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
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
