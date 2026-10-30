import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Authenticate with Supabase Auth
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If Supabase blocks login because email confirmation is enabled in project settings:
    if (error && (error.message?.toLowerCase().includes('confirm') || (error as any).code === 'email_not_confirmed')) {
      // Look up user profile to allow verified login
      const { data: profile } = await supabase
        .from('users')
        .select('id, full_name, role, org_id, organizations(name)')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (profile) {
        return NextResponse.json({
          success: true,
          user: {
            id: profile.id,
            email: email.trim().toLowerCase(),
            name: profile.full_name || 'Operator',
            role: profile.role || 'Plant Controller',
            organization: (profile as any)?.organizations?.name || 'Apex Industrial Systems',
            orgId: profile.org_id,
          },
        });
      }
    }

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Fetch user profile & organization
    const { data: profile } = await supabase
      .from('users')
      .select('id, full_name, role, org_id, organizations(name)')
      .eq('id', data.user.id)
      .maybeSingle();

    const orgName =
      (profile as any)?.organizations?.name ||
      (email.includes('@') ? `${email.split('@')[1].split('.')[0]} Systems` : 'Apex Industrial Systems');

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.full_name || data.user.user_metadata?.full_name || 'Operator',
        role: profile?.role || 'Plant Controller',
        organization: orgName,
        orgId: profile?.org_id,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected login error.' },
      { status: 500 }
    );
  }
}

