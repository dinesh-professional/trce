import { NextResponse } from 'next/server';
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

    const supabase = await createClient();

    // 1. Verify token with Supabase Auth GoTrue engine
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email',
    });

    if (error || !data.user) {
      console.warn('Supabase verifyOtp failed:', error?.message);
      return NextResponse.json(
        { error: error?.message || 'Invalid or expired 6-digit OTP code.' },
        { status: 401 }
      );
    }

    const verifiedUserId = data.user.id;

    // 2. Provision or match corporate tenant
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

    return NextResponse.json({
      success: true,
      user: {
        id: verifiedUserId,
        email: cleanEmail,
        name: cleanEmail.split('@')[0] || 'Operator',
        role: isApex ? 'Operations Director' : 'Plant Controller',
        organization: orgName,
      },
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/auth/verify-otp:', error);
    return NextResponse.json(
      { error: error?.message || 'Unexpected server error during OTP verification.' },
      { status: 500 }
    );
  }
}
