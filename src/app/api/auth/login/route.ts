import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPass = String(password);

    const supabase = await createClient();

    // Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPass,
    });

    if (error || !data.user) {
      return NextResponse.json(
        {
          error:
            'Invalid email or password. Only registered accounts can log in. Please sign up first if you do not have an account.',
        },
        { status: 401 }
      );
    }

    // Determine tenant organization
    const domain = cleanEmail.split('@')[1] || 'trce.io';
    const isApex = domain === 'apexindustrial.com' || cleanEmail.includes('dinesh');
    const orgName = isApex
      ? 'Apex Industrial Systems'
      : `${domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)} Industrial Systems`;
    const fullName = data.user.user_metadata?.full_name || cleanEmail.split('@')[0] || 'Operator';
    const role = isApex ? 'Operations Director' : 'Plant Controller';

    const verifiedUser = {
      id: data.user.id,
      email: cleanEmail,
      name: fullName,
      role: role,
      organization: orgName,
    };

    const response = NextResponse.json({
      success: true,
      user: verifiedUser,
    });

    // Set permanent session cookie
    response.cookies.set('trce_auth_user_v1', encodeURIComponent(JSON.stringify(verifiedUser)), {
      path: '/',
      maxAge: 604800,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected login error.' },
      { status: 500 }
    );
  }
}
