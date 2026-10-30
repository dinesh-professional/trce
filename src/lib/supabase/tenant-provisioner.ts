import { createClient } from '@/lib/supabase/server';

export interface ProvisionTenantResult {
  success: boolean;
  orgId?: string;
  orgName?: string;
  role?: string;
  error?: string;
}

/**
 * Extracts the corporate email domain (e.g. "alex@apexindustrial.com" -> "apexindustrial.com").
 * Returns null if invalid or public disposable/consumer domain.
 */
export function extractCorporateDomain(email: string): string | null {
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return null;
  return parts[1];
}

/**
 * Generates an enterprise organization display name from domain.
 * e.g. "apexindustrial.com" -> "Apexindustrial Systems"
 */
function formatOrgNameFromDomain(domain: string): string {
  const namePart = domain.split('.')[0] || 'Enterprise';
  const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
  return `${capitalized} Industrial Systems`;
}

/**
 * Auto-provisions or matches an organization for a newly registered user based on corporate email domain.
 * Executed server-side upon successful registration.
 */
export async function matchOrProvisionTenant(
  userId: string,
  email: string,
  fullName: string
): Promise<ProvisionTenantResult> {
  const supabase = await createClient();
  const domain = extractCorporateDomain(email);

  if (!domain) {
    return { success: false, error: 'Invalid corporate email domain provided.' };
  }

  try {
    // 1. Check if organization already exists for this corporate domain
    const { data: existingOrg, error: findOrgError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('domain', domain)
      .maybeSingle();

    if (findOrgError) {
      console.error('Error looking up organization domain:', findOrgError);
      return { success: false, error: findOrgError.message };
    }

    let targetOrgId: string;
    let targetOrgName: string;
    let assignedRole: string;

    if (existingOrg) {
      // 2A. Tenant exists -> link user to existing organization as operator
      targetOrgId = existingOrg.id;
      targetOrgName = existingOrg.name;
      assignedRole = 'operator';
    } else {
      // 2B. Tenant does not exist -> auto-provision new organization & assign user as admin/director
      targetOrgName = formatOrgNameFromDomain(domain);
      assignedRole = 'director';

      const { data: newOrg, error: createOrgError } = await supabase
        .from('organizations')
        .insert({
          name: targetOrgName,
          domain: domain,
          subscription_tier: 'enterprise',
        })
        .select('id, name')
        .single();

      if (createOrgError || !newOrg) {
        console.error('Error creating new tenant organization:', createOrgError);
        return { success: false, error: createOrgError?.message || 'Failed to create organization.' };
      }

      targetOrgId = newOrg.id;
    }

    // 3. Upsert user record into public.users referencing the matched org_id
    const { error: upsertUserError } = await supabase.from('users').upsert({
      id: userId,
      org_id: targetOrgId,
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      role: assignedRole,
      facility_access: ['ALL'],
      updated_at: new Date().toISOString(),
    });

    if (upsertUserError) {
      console.error('Error upserting tenant user profile:', upsertUserError);
      return { success: false, error: upsertUserError.message };
    }

    return {
      success: true,
      orgId: targetOrgId,
      orgName: targetOrgName,
      role: assignedRole,
    };
  } catch (err: any) {
    console.error('Unexpected error in matchOrProvisionTenant:', err);
    return { success: false, error: err?.message || 'Unexpected tenant provisioning error.' };
  }
}

