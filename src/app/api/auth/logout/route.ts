import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut().catch(() => {});

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });

    // Clear all session and application cookies
    response.cookies.delete('trce_auth_user_v1');
    response.cookies.delete('trce_otp_challenge');

    response.cookies.set('trce_auth_user_v1', '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Logout error' },
      { status: 500 }
    );
  }
}
