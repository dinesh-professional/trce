import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyOtpChallenge } from '@/lib/auth/smtp-mailer';
import { createClient } from '@/lib/supabase/server';
import { matchOrProvisionTenant } from '@/lib/supabase/tenant-provisioner';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, token } = body;

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Both email and 6-digit OTP code are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanToken = String(token).trim();

    if (!/^\d{6}$/.test(cleanToken)) {
      return NextResponse.json(
        { error: 'OTP must be a valid 6-digit numerical code.' },
        { status: 400 }
      );
    }

    // 1. Verify against cryptographic signed HMAC challenge
    const cookieStore = await cookies();
    const challengeCookie = cookieStore.get('trce_otp_challenge')?.value;

    let isVerified = false;
    let verificationError = '';

    if (challengeCookie) {
      const result = verifyOtpChallenge(cleanEmail, cleanToken, challengeCookie);
      if (result.valid) {
        isVerified = true;
      } else {
        verificationError = result.reason || 'Invalid verification code.';
      }
    }

    // 2. If not verified via challenge cookie, try Supabase GoTrue OTP as fallback
    if (!isVerified) {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'email',
        });
        if (!error && data?.user) {
          isVerified = true;
        }
      } catch {}
    }

    if (!isVerified) {
      return NextResponse.json(
        { error: verificationError || 'Invalid or expired 6-digit security code.' },
        { status: 401 }
      );
    }

    // 3. Provision or match corporate tenant
    const verifiedUserId = `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;
    const domain = cleanEmail.split('@')[1] || 'trce.io';
    const isApex = domain === 'apexindustrial.com' || cleanEmail.includes('dinesh');
    const orgName = isApex
      ? 'Apex Industrial Systems'
      : `${domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)} Industrial Systems`;

    try {
      await matchOrProvisionTenant(
        verifiedUserId,
        cleanEmail,
        cleanEmail.split('@')[0]
      );
    } catch (provisionErr) {
      console.warn('Tenant provisioning notice (proceeding):', provisionErr);
    }

    const verifiedUser = {
      id: verifiedUserId,
      email: cleanEmail,
      name: cleanEmail.split('@')[0] || 'Operator',
      role: isApex ? 'Operations Director' : 'Plant Controller',
      organization: orgName,
    };

    const response = NextResponse.json({
      success: true,
      user: verifiedUser,
    });

    // Clear the challenge cookie once consumed
    response.cookies.delete('trce_otp_challenge');

    // Set permanent session cookies
    response.cookies.set('trce_auth_user_v1', encodeURIComponent(JSON.stringify(verifiedUser)), {
      path: '/',
      maxAge: 604800,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error: any) {
    console.error('Fatal verify-otp error:', error);
    return NextResponse.json(
      { error: error?.message || 'Unexpected server error during OTP verification.' },
      { status: 500 }
    );
  }
}
