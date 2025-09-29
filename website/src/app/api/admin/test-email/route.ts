// src/app/api/admin/test-email/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Import email service
    const { sendAdminInvitation } = await import('@/services/emailService');
    
    // Test email data
    const testData = {
      email: email,
      role: 'admin' as const,
      inviteToken: 'test-token-123',
      inviterName: 'Test Admin',
      inviterEmail: 'admin@rehoboth-church.org',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };

    console.log('Testing email configuration...');
    console.log('Email Host:', process.env.EMAIL_HOST);
    console.log('Email Port:', process.env.EMAIL_PORT);
    console.log('Email User:', process.env.EMAIL_USER);
    console.log('Email Password set:', !!process.env.EMAIL_PASSWORD);
    console.log('Email From:', process.env.EMAIL_FROM);

    const emailSent = await sendAdminInvitation(testData);
    
    if (emailSent) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully!',
        emailConfig: {
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          user: process.env.EMAIL_USER,
          from: process.env.EMAIL_FROM,
          passwordSet: !!process.env.EMAIL_PASSWORD
        }
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to send test email',
          emailConfig: {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            user: process.env.EMAIL_USER,
            from: process.env.EMAIL_FROM,
            passwordSet: !!process.env.EMAIL_PASSWORD
          }
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        emailConfig: {
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          user: process.env.EMAIL_USER,
          from: process.env.EMAIL_FROM,
          passwordSet: !!process.env.EMAIL_PASSWORD
        }
      },
      { status: 500 }
    );
  }
}