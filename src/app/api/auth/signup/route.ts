import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { matchOrProvisionTenant } from '@/lib/supabase/tenant-provisioner';

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Sign up user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Could not register user.' },
        { status: 400 }
      );
    }

    // 2. Perform corporate domain matching & tenant provisioning
    const tenantResult = await matchOrProvisionTenant(
      authData.user.id,
      email,
      fullName
    );

    if (!tenantResult.success) {
      return NextResponse.json(
        {
          error: tenantResult.error || 'Failed to match or provision tenant organization.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: fullName,
        role: tenantResult.role,
        organization: tenantResult.orgName,
        orgId: tenantResult.orgId,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred during signup.' },
      { status: 500 }
    );
  }
}

