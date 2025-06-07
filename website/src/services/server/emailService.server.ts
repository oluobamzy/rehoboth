// Server-side email service
// This file should only be imported in server components or API routes

import nodemailer from 'nodemailer';
import { Event, EventRegistration } from './eventService.server';

// Initialize email transporter
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASSWORD;
const emailHost = process.env.EMAIL_HOST || 'smtp.example.com';
const emailPort = parseInt(process.env.EMAIL_PORT || '587');
const emailFrom = process.env.EMAIL_FROM || 'noreply@rehobothchurch.org';

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
  console.warn('⚠️ Server: Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
}

/**
 * Send a registration confirmation email
 */
export async function sendRegistrationConfirmation(
  registration: EventRegistration,
  event: Event
): Promise<boolean> {
  try {
    if (!transporter) {
      console.warn('Server: Email service not configured');
      return false;
    }

    await transporter.sendMail({
      from: emailFrom,
      to: registration.attendee_email,
      subject: `Registration Confirmation: ${event.title}`,
      html: `
        <h1>Thank you for registering!</h1>
        <p>Dear ${registration.attendee_name},</p>
        <p>Your registration for <strong>${event.title}</strong> has been received.</p>
        <h2>Event Details:</h2>
        <ul>
          <li><strong>Date:</strong> ${new Date(event.start_datetime).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${new Date(event.start_datetime).toLocaleTimeString()} - ${new Date(event.end_datetime).toLocaleTimeString()}</li>
          <li><strong>Location:</strong> ${event.location_name || 'TBA'}</li>
          ${event.location_address ? `<li><strong>Address:</strong> ${event.location_address}</li>` : ''}
        </ul>
        <p>Registration status: <strong>${registration.registration_status}</strong></p>
        ${registration.payment_status === 'pending' && event.cost_cents > 0 ? 
          `<p><strong>Payment status:</strong> Payment pending. Please complete your payment to confirm your registration.</p>` : 
          ''
        }
        <p>If you have any questions or need to make changes to your registration, please contact us at ${event.contact_email || 'info@rehobothchurch.org'}.</p>
        <p>Thank you for your participation!</p>
        <p>Rehoboth Church</p>
      `,
    });

    return true;
  } catch (error) {
    console.error('Server: Error sending registration confirmation email:', error);
    return false;
  }
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmation(
  registration: EventRegistration,
  event: Event,
  paymentAmount: number
): Promise<boolean> {
  try {
    if (!transporter) {
      console.warn('Server: Email service not configured');
      return false;
    }

    await transporter.sendMail({
      from: emailFrom,
      to: registration.attendee_email,
      subject: `Payment Confirmation: ${event.title}`,
      html: `
        <h1>Payment Confirmation</h1>
        <p>Dear ${registration.attendee_name},</p>
        <p>Your payment of <strong>$${(paymentAmount / 100).toFixed(2)}</strong> for <strong>${event.title}</strong> has been received.</p>
        <p>Your registration is now confirmed.</p>
        <h2>Event Details:</h2>
        <ul>
          <li><strong>Date:</strong> ${new Date(event.start_datetime).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${new Date(event.start_datetime).toLocaleTimeString()} - ${new Date(event.end_datetime).toLocaleTimeString()}</li>
          <li><strong>Location:</strong> ${event.location_name || 'TBA'}</li>
          ${event.location_address ? `<li><strong>Address:</strong> ${event.location_address}</li>` : ''}
        </ul>
        <p>If you have any questions, please contact us at ${event.contact_email || 'info@rehobothchurch.org'}.</p>
        <p>Thank you for your participation!</p>
        <p>Rehoboth Church</p>
      `,
    });

    return true;
  } catch (error) {
    console.error('Server: Error sending payment confirmation email:', error);
    return false;
  }
}

/**
 * Send admin notification for new registration
 */
export async function sendAdminRegistrationNotification(
  registration: EventRegistration,
  event: Event
): Promise<boolean> {
  try {
    if (!transporter) {
      console.warn('Server: Email service not configured');
      return false;
    }
    
    // Use the event contact email or a default admin email
    const adminEmail = event.contact_email || process.env.ADMIN_EMAIL || 'admin@rehobothchurch.org';

    await transporter.sendMail({
      from: emailFrom,
      to: adminEmail,
      subject: `New Registration: ${event.title}`,
      html: `
        <h1>New Event Registration</h1>
        <h2>Event: ${event.title}</h2>
        <p><strong>Registration Details:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${registration.attendee_name}</li>
          <li><strong>Email:</strong> ${registration.attendee_email}</li>
          <li><strong>Phone:</strong> ${registration.attendee_phone || 'Not provided'}</li>
          <li><strong>Party Size:</strong> ${registration.party_size}</li>
          <li><strong>Status:</strong> ${registration.registration_status}</li>
          <li><strong>Payment Status:</strong> ${registration.payment_status}</li>
          <li><strong>Registered:</strong> ${new Date(registration.registered_at).toLocaleString()}</li>
        </ul>
        ${registration.special_requests ? `
          <p><strong>Special Requests:</strong></p>
          <p>${registration.special_requests}</p>
        ` : ''}
        <p>You can view and manage all registrations in the admin dashboard.</p>
      `,
    });

    return true;
  } catch (error) {
    console.error('Server: Error sending admin notification:', error);
    return false;
  }
}
