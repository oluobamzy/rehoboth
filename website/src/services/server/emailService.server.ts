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

/**
 * Send donation receipt to donor
 */
export async function sendDonationReceipt(
  email: string,
  donation: any
): Promise<boolean> {
  try {
    if (!transporter) {
      console.warn('Server: Email service not configured');
      return false;
    }

    // Generate a receipt number based on donation ID and date
    const receiptNumber = `D-${donation.id.substring(0, 8)}-${new Date().toISOString().split('T')[0].replace(/-/g, '')}`;
    
    // Format donation amount with currency symbol
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: donation.currency || 'USD'
    });
    const formattedAmount = formatter.format(Number(donation.amount));
    
    await transporter.sendMail({
      from: emailFrom,
      to: email,
      subject: `Thank You for Your Donation - Receipt #${receiptNumber}`,
      html: `
        <h1>Donation Receipt</h1>
        <p>Dear ${donation.donor_name || 'Friend'},</p>
        <p>Thank you for your generous donation to Rehoboth Church. Your contribution helps us continue our mission.</p>
        
        <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0; background-color: #f9f9f9;">
          <h2>Donation Details</h2>
          <p><strong>Receipt #:</strong> ${receiptNumber}</p>
          <p><strong>Date:</strong> ${new Date(donation.created_at).toLocaleDateString()}</p>
          <p><strong>Amount:</strong> ${formattedAmount}</p>
          <p><strong>Designation:</strong> ${donation.fund_designation || 'General Fund'}</p>
          ${donation.is_recurring ? `<p><strong>Type:</strong> Recurring (${donation.frequency})</p>` : '<p><strong>Type:</strong> One-time</p>'}
          ${donation.stripe_payment_id ? `<p><strong>Transaction ID:</strong> ${donation.stripe_payment_id}</p>` : ''}
        </div>
        
        <p>Rehoboth Church is a registered nonprofit organization. Please save this receipt for your tax records.</p>
        
        <p>If you have any questions about your donation, please contact us at ${process.env.ADMIN_EMAIL || 'donations@rehobothchurch.org'}.</p>
        
        <p>With gratitude,</p>
        <p>Rehoboth Church</p>
        
        <hr />
        <p style="font-size: 12px; color: #666;">This receipt was automatically generated and is valid without a signature.</p>
      `,
    });

    return true;
  } catch (error) {
    console.error('Server: Error sending donation receipt:', error);
    return false;
  }
}

/**
 * Send year-end donation summary
 */
export async function sendYearEndDonationSummary(
  email: string,
  donations: any[],
  year: number
): Promise<boolean> {
  try {
    if (!transporter) {
      console.warn('Server: Email service not configured');
      return false;
    }

    // Calculate total donated amount
    const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);
    
    // Format donation amount with currency symbol
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    const formattedTotal = formatter.format(totalAmount);
    
    // Get donor name from the first donation
    const donorName = donations[0]?.donor_name || 'Supporter';
    
    // Generate summary table of donations
    let donationRows = '';
    donations.forEach(d => {
      const date = new Date(d.created_at).toLocaleDateString();
      const amount = formatter.format(Number(d.amount));
      const fund = d.fund_designation || 'General Fund';
      
      donationRows += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${date}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${amount}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${fund}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${d.stripe_payment_id || 'N/A'}</td>
        </tr>
      `;
    });
    
    await transporter.sendMail({
      from: emailFrom,
      to: email,
      subject: `${year} Donation Summary - Rehoboth Church`,
      html: `
        <h1>${year} Donation Summary</h1>
        <p>Dear ${donorName},</p>
        <p>Thank you for your generous support of Rehoboth Church throughout ${year}. We're grateful for your partnership in our mission.</p>
        <p>Below is a summary of your donations for the tax year ${year}:</p>
        
        <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0; background-color: #f9f9f9;">
          <h2>Donation Summary</h2>
          <p><strong>Total Donations for ${year}:</strong> ${formattedTotal}</p>
          <p><strong>Total Number of Donations:</strong> ${donations.length}</p>
          <p><strong>Tax ID:</strong> XX-XXXXXXX</p>
        </div>
        
        <h3>Donation Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Date</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Amount</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Fund</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Transaction ID</th>
            </tr>
          </thead>
          <tbody>
            ${donationRows}
          </tbody>
        </table>
        
        <p>This summary serves as an official receipt for tax purposes. No goods or services were provided in exchange for these contributions.</p>
        
        <p>If you have any questions about your donation history, please contact us at ${process.env.ADMIN_EMAIL || 'donations@rehobothchurch.org'}.</p>
        
        <p>With gratitude for your generosity,</p>
        <p>Rehoboth Church</p>
        
        <hr />
        <p style="font-size: 12px; color: #666;">This is an automatically generated tax receipt summary. Please consult your tax professional for advice on deductibility.</p>
      `,
      attachments: [{
        filename: `Rehoboth_Church_${year}_Donation_Receipt.pdf`,
        content: Buffer.from(`Year-end donation summary for ${year}`),
        contentType: 'application/pdf'
      }]
    });

    return true;
  } catch (error) {
    console.error('Server: Error sending year-end donation summary:', error);
    return false;
  }
}
