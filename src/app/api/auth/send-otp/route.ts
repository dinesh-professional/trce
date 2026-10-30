import { NextResponse } from 'next/server';
import { sendSmtpEmail, createOtpChallenge } from '@/lib/auth/smtp-mailer';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = await createClient();

    // 1. STRICT ACCOUNT VERIFICATION: Check if user account was created in Sign Up
    const { error: existenceCheckError } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: false, // Rejects any email that does not have an account!
      },
    });

    if (
      existenceCheckError &&
      ((existenceCheckError as any).code === 'otp_disabled' ||
        existenceCheckError.message.toLowerCase().includes('signups not allowed') ||
        existenceCheckError.message.toLowerCase().includes('user not found'))
    ) {
      console.warn(`[OTP Rejected] Unregistered email attempted login: ${cleanEmail}`);
      return NextResponse.json(
        {
          error:
            'No account found with this email. Only registered accounts can log in. Please sign up first to create your account.',
        },
        { status: 403 }
      );
    }

    // 2. Generate 6-digit cryptographically secure OTP code
    const crypto = await import('crypto');
    const otpCode = crypto.randomInt(100000, 999999).toString();

    // 3. Dispatch real email via Gmail SMTP Protocol to verified registered account
    console.log(`[SMTP] Dispatching security passcode to registered account: ${cleanEmail}`);
    try {
      await sendSmtpEmail(cleanEmail, otpCode);
      console.log(`[SMTP] Successfully delivered to ${cleanEmail}`);
    } catch (smtpErr: any) {
      console.error('[SMTP Delivery Error]:', smtpErr?.message);
      return NextResponse.json(
        { error: `SMTP Dispatch Error: ${smtpErr?.message || 'Could not reach mail server.'}` },
        { status: 500 }
      );
    }

    // 4. Create signed HMAC challenge token
    const challengeToken = createOtpChallenge(cleanEmail, otpCode);

    const response = NextResponse.json({
      success: true,
      message: `Security passcode dispatched to ${cleanEmail} via Gmail SMTP.`,
      challengeToken,
    });

    // Store signed challenge in HTTP-only cookie (10 minute expiry)
    response.cookies.set('trce_otp_challenge', challengeToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error: any) {
    console.error('Fatal send-otp error:', error);
    return NextResponse.json(
      { error: error?.message || 'Unexpected server error dispatching OTP.' },
      { status: 500 }
    );
  }
}
