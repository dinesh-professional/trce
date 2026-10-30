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

    // 1. Generate 6-digit cryptographically secure OTP code
    const crypto = await import('crypto');
    const otpCode = crypto.randomInt(100000, 999999).toString();

    // 2. Dispatch real email via Gmail SMTP Protocol
    console.log(`[SMTP] Dispatching security passcode to: ${cleanEmail}`);
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

    // 3. Create signed HMAC challenge token
    const challengeToken = createOtpChallenge(cleanEmail, otpCode);

    // 4. Also register user in Supabase in background (best-effort)
    try {
      const supabase = await createClient();
      supabase.auth.signInWithOtp({ email: cleanEmail, options: { shouldCreateUser: true } }).catch(() => {});
    } catch {}

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
