import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: 'A valid corporate or personal email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = await createClient();

    // Trigger Supabase OTP send over configured SMTP provider
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error('Supabase signInWithOtp SMTP error:', error);
      
      let userFriendlyMessage = error.message;
      if (error.message.includes('Error sending magic link email')) {
        userFriendlyMessage =
          'SMTP dispatch rejected by mail server. Please verify in Supabase SMTP Settings that Port is 587 and Sender is onboarding@resend.dev.';
      } else if (error.message.includes('rate limit')) {
        userFriendlyMessage = 'SMTP rate limit reached. Please wait 60 seconds before requesting a new code.';
      }

      return NextResponse.json(
        { error: userFriendlyMessage, raw: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Verification code successfully dispatched to ${cleanEmail} via SMTP.`,
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/auth/send-otp:', error);
    return NextResponse.json(
      { error: error?.message || 'Unexpected server error during OTP dispatch.' },
      { status: 500 }
    );
  }
}
