import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { matchOrProvisionTenant } from '@/lib/supabase/tenant-provisioner';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Full name, email address, and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(fullName).trim();
    const cleanPass = String(password);

    if (cleanPass.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Sign up user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPass,
      options: {
        data: {
          full_name: cleanName,
        },
      },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered') || (authError as any).code === 'user_already_exists') {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please log in instead.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: authError.message || 'Could not register account.' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Could not create account. Please try again.' },
        { status: 400 }
      );
    }

    // 2. Provision corporate tenant in background (non-blocking)
    const domain = cleanEmail.split('@')[1] || 'trce.io';
    const isApex = domain === 'apexindustrial.com' || cleanEmail.includes('dinesh');
    const orgName = isApex
      ? 'Apex Industrial Systems'
      : `${domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)} Industrial Systems`;
    const role = isApex ? 'Operations Director' : 'Plant Controller';

    matchOrProvisionTenant(authData.user.id, cleanEmail, cleanName).catch(() => {});

    const registeredUser = {
      id: authData.user.id,
      email: cleanEmail,
      name: cleanName,
      role: role,
      organization: orgName,
    };

    const response = NextResponse.json({
      success: true,
      user: registeredUser,
    });

    // Set permanent session cookie
    response.cookies.set('trce_auth_user_v1', encodeURIComponent(JSON.stringify(registeredUser)), {
      path: '/',
      maxAge: 604800,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred during signup.' },
      { status: 500 }
    );
  }
}
