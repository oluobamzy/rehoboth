import { NextResponse } from 'next/server';
import { ContactService } from '@/services/contactService';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { 
      name, 
      email, 
      phone, 
      requestType, 
      urgency, 
      prayerRequest, 
      anonymous, 
      publicShare, 
      followUp 
    } = body;

    // Validate required fields
    if (!prayerRequest) {
      return NextResponse.json(
        { error: "Prayer request message is required" },
        { status: 400 }
      );
    }

    // For anonymous requests, use default values
    const submitterName = anonymous ? 'Anonymous' : (name || 'Anonymous');
    const submitterEmail = anonymous ? 'anonymous@prayer.request' : (email || 'no-email@prayer.request');

    // Validate email format if provided and not anonymous
    if (!anonymous && email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    // Create formatted subject
    const urgencyLabel = urgency === 'emergency' ? '🚨 EMERGENCY' : 
                        urgency === 'urgent' ? '⚡ URGENT' : '🙏';
    const subject = `${urgencyLabel} Prayer Request: ${requestType || 'General'}`;

    // Create formatted message with all details
    const formattedMessage = `
PRAYER REQUEST DETAILS:
${anonymous ? '(Submitted Anonymously)' : ''}

Request Type: ${requestType || 'Not specified'}
Urgency Level: ${urgency || 'routine'}
${phone ? `Phone: ${phone}` : ''}

PRAYER REQUEST:
${prayerRequest}

PREFERENCES:
- Anonymous Submission: ${anonymous ? 'Yes' : 'No'}
- OK to Share Publicly: ${publicShare ? 'Yes' : 'No'}
- Follow-up Requested: ${followUp ? 'Yes' : 'No'}

${anonymous ? 'Note: This is an anonymous request - no personal follow-up possible.' : ''}
${followUp && !anonymous ? 'Note: Submitter has requested follow-up contact.' : ''}
    `.trim();

    // Save prayer request to database using the contact system
    try {
      const savedMessage = await ContactService.submitMessage({
        name: submitterName,
        email: submitterEmail,
        subject: subject,
        message: formattedMessage
      });

      console.log('Prayer request saved to database:', savedMessage.id);

      // Return success response
      return NextResponse.json({ 
        success: true, 
        message: anonymous 
          ? "Your anonymous prayer request has been submitted successfully. Our prayer team will be praying for you."
          : "Your prayer request has been submitted successfully. Our prayer team will be praying for you, and we may reach out if you've requested follow-up.",
        requestId: savedMessage.id,
        isAnonymous: anonymous
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: "Failed to save prayer request. Please try again." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Prayer request error:', error);
    return NextResponse.json(
      { error: "Failed to submit prayer request. Please try again." },
      { status: 500 }
    );
  }
}