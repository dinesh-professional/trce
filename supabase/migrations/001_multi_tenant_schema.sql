-- ==============================================================================
-- TRCE INDUSTRIAL OPERATING SYSTEM
-- MIGRATION 001: MULTI-TENANT DATABASE SCHEMA & ROW-LEVEL SECURITY (RLS)
-- IDEMPOTENT EXECUTION SCRIPT
-- ==============================================================================

-- 0. Enable cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. CORE TENANCY & IDENTITY TABLES
-- ==============================================================================

-- 1.1 Organizations Table (Enterprise Industrial Tenants)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL, -- e.g. 'apexindustrial.com' for domain isolation
    subscription_tier VARCHAR(50) DEFAULT 'enterprise',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_organizations_domain ON public.organizations(domain);

-- 1.2 Users Table (Multi-Tenant User Profiles linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'operator', -- 'director', 'admin', 'operator', 'engineer'
    facility_access TEXT[] DEFAULT ARRAY['ALL'],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_users_org_id ON public.users(org_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ==============================================================================
-- 2. INDUSTRIAL ASSET & TELEMETRY TABLES
-- ==============================================================================

-- 2.1 Machines Table (Telemetry Assets & Operating Envelopes)
CREATE TABLE IF NOT EXISTS public.machines (
    id VARCHAR(100) NOT NULL,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    facility_id VARCHAR(50) NOT NULL, -- e.g. 'FAC-A', 'FAC-B', 'FAC-C', 'FAC-D'
    facility_name VARCHAR(255) NOT NULL,
    line VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'milling',
    status VARCHAR(50) NOT NULL DEFAULT 'operational', -- 'operational', 'warning', 'critical'
    health_score INT NOT NULL DEFAULT 95,
    vibration_mms DOUBLE PRECISION NOT NULL DEFAULT 1.4,
    temperature_c DOUBLE PRECISION NOT NULL DEFAULT 55.0,
    pressure_bar DOUBLE PRECISION NOT NULL DEFAULT 40.0,
    rpm INT NOT NULL DEFAULT 1750,
    uptime_hours INT NOT NULL DEFAULT 3000,
    last_ping TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (org_id, id)
);

CREATE INDEX IF NOT EXISTS idx_machines_org_status ON public.machines(org_id, status);
CREATE INDEX IF NOT EXISTS idx_machines_facility ON public.machines(org_id, facility_id);

-- 2.2 Incidents Table (Critical Operational Alarms & Anomaly Breaches)
CREATE TABLE IF NOT EXISTS public.incidents (
    id VARCHAR(100) NOT NULL,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    machine_id VARCHAR(100) NOT NULL,
    machine_name VARCHAR(255) NOT NULL,
    facility_id VARCHAR(50) NOT NULL,
    facility_name VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'warning', -- 'critical', 'warning', 'info'
    title VARCHAR(255) NOT NULL,
    failure_mode VARCHAR(255) NOT NULL,
    root_cause_part VARCHAR(100) NOT NULL,
    description TEXT,
    metric_breach VARCHAR(255),
    recommended_source VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'in_transit'
    assigned_to VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (org_id, id)
);

CREATE INDEX IF NOT EXISTS idx_incidents_org_status ON public.incidents(org_id, status);
CREATE INDEX IF NOT EXISTS idx_incidents_machine ON public.incidents(org_id, machine_id);

-- 2.3 Inventory Table (Distributed Multi-Facility Spare Part Stocks)
CREATE TABLE IF NOT EXISTS public.inventory (
    id VARCHAR(100) NOT NULL,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    part_id VARCHAR(100) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    part_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    lead_time_days INT NOT NULL DEFAULT 7,
    min_threshold INT NOT NULL DEFAULT 2,
    facility_stock JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_quantity INT GENERATED ALWAYS AS (
        COALESCE((facility_stock->'FAC-A'->>'quantity')::int, 0) +
        COALESCE((facility_stock->'FAC-B'->>'quantity')::int, 0) +
        COALESCE((facility_stock->'FAC-C'->>'quantity')::int, 0) +
        COALESCE((facility_stock->'FAC-D'->>'quantity')::int, 0)
    ) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (org_id, id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_org_part ON public.inventory(org_id, part_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON public.inventory(org_id, sku);

-- 2.4 Suppliers Table (Supplier Feeds & Canonical Harmonization Records)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id VARCHAR(100) NOT NULL,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    reliability_score INT NOT NULL DEFAULT 95,
    lead_time_days INT NOT NULL DEFAULT 5,
    contract_active BOOLEAN NOT NULL DEFAULT true,
    feed_format VARCHAR(50) DEFAULT 'CSV',
    last_sync TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (org_id, id)
);

CREATE INDEX IF NOT EXISTS idx_suppliers_org_code ON public.suppliers(org_id, code);

-- 2.5 Audit Events Table (Cryptographic Immutable Event Ledger)
CREATE TABLE IF NOT EXISTS public.audit_events (
    id VARCHAR(100) NOT NULL,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    actor VARCHAR(255) NOT NULL,
    actor_role VARCHAR(100) NOT NULL,
    action VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    target VARCHAR(255) NOT NULL,
    facility VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    details TEXT,
    sha256_hash VARCHAR(64) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (org_id, id)
);

CREATE INDEX IF NOT EXISTS idx_audit_events_org_time ON public.audit_events(org_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_hash ON public.audit_events(sha256_hash);

-- ==============================================================================
-- 3. AUTOMATED HELPER FUNCTIONS FOR ROW-LEVEL SECURITY
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_auth_org_id()
RETURNS UUID AS $$
    SELECT org_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES (CLEAN DROP + RE-CREATE)
-- ==============================================================================

-- 4.1 Enable RLS on ALL Tenant-Partitioned Tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- 4.2 Organizations Table Policies
DROP POLICY IF EXISTS "org_select_policy" ON public.organizations;
CREATE POLICY "org_select_policy" ON public.organizations
    FOR SELECT
    USING (id = public.get_auth_org_id());

DROP POLICY IF EXISTS "org_update_policy" ON public.organizations;
CREATE POLICY "org_update_policy" ON public.organizations
    FOR UPDATE
    USING (id = public.get_auth_org_id());

-- 4.3 Users Table Policies
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
CREATE POLICY "users_select_policy" ON public.users
    FOR SELECT
    USING (org_id = public.get_auth_org_id());

DROP POLICY IF EXISTS "users_update_policy" ON public.users;
CREATE POLICY "users_update_policy" ON public.users
    FOR UPDATE
    USING (id = auth.uid());

-- 4.4 Machines Table Policies
DROP POLICY IF EXISTS "machines_tenant_isolation_select" ON public.machines;
CREATE POLICY "machines_tenant_isolation_select" ON public.machines
    FOR SELECT
    USING (org_id = public.get_auth_org_id());

DROP POLICY IF EXISTS "machines_tenant_isolation_insert" ON public.machines;
CREATE POLICY "machines_tenant_isolation_insert" ON public.machines
    FOR INSERT
    WITH CHECK (org_id = public.get_auth_org_id());

DROP POLICY IF EXISTS "machines_tenant_isolation_update" ON public.machines;
CREATE POLICY "machines_tenant_isolation_update" ON public.machines
    FOR UPDATE
    USING (org_id = public.get_auth_org_id())
    WITH CHECK (org_id = public.get_auth_org_id());

DROP POLICY IF EXISTS "machines_tenant_isolation_delete" ON public.machines;
CREATE POLICY "machines_tenant_isolation_delete" ON public.machines
    FOR DELETE
    USING (org_id = public.get_auth_org_id());

-- 4.5 Incidents Table Policies
DROP POLICY IF EXISTS "incidents_tenant_isolation_select" ON public.incidents;
CREATE POLICY "incidents_tenant_isolation_select" ON public.incidents
    FOR SELECT
    USING (org_id = public.get_auth_org_id());

DROP POLICY IF EXISTS "incidents_tenant_isolation_insert" ON public.incidents;
CREATE POLICY "incidents_tenant_isolation_insert" ON public.incidents
    FOR INSERT
    WITH CHECK (org_id = public.get_auth_org_id());

DROP POLICY IF EXISTS "incidents_tenant_isolation_update" ON public.incidents;
CREATE POLICY "incidents_tenant_isolation_update" ON public.incidents
    FOR UPDATE
    USING (org_id = public.get_auth_org_id())
    WITH CHECK (org_id = public.get_auth_org_id());

DROP POLICY IF EXISTS "incidents_tenant_isolation_delete" ON public.incidents;
CREATE POLICY "incidents_tenant_isolation_delete" ON public.incidents
    FOR DELETE
    USING (org_id = public.get_auth_org_id());

-- 4.6 Inventory Table Policies
DROP POLICY IF EXISTS "inventory_tenant_isolation_select" ON public.inventory;
CREATE POLICY "inventory_tenant_isolation_select" ON public.inventory
    FOR SELECT
    USING (org_id = public.get_auth_org_id());

DROP POLICY IF EXISTS "inventory_tenant_isolation_insert" ON public.inventory;
CREATE POLICY "inventory_tenant_isolation_insert" ON public.inventory
    FOR INSERT
    WITH CHECK (org_id = public.get_auth_org_id());

DROP POLICY IF EXISTS "inventory_tenant_isolation_update" ON public.inventory;
CREATE POLICY "inventory_tenant_isolation_update" ON public.inventory
    FOR UPDATE
    USING (org_id = public.get_auth_org_id())
    WITH CHECK (org_id = public.get_auth_org_id());

DROP POLICY IF EXISTS "inventory_tenant_isolation_delete" ON public.inventory;
CREATE POLICY "inventory_tenant_isolation_delete" ON public.inventory
    FOR DELETE
    USING (org_id = public.get_auth_org_id());

-- 4.7 Suppliers Table Policies
DROP POLICY IF EXISTS "suppliers_tenant_isolation_select" ON public.suppliers;
CREATE POLICY "suppliers_tenant_isolation_select" ON public.suppliers
    FOR SELECT
    USING (org_id = public.get_auth_org_id());

DROP POLICY IF EXISTS "suppliers_tenant_isolation_insert" ON public.suppliers;
CREATE POLICY "suppliers_tenant_isolation_insert" ON public.suppliers
    FOR INSERT
    WITH CHECK (org_id = public.get_auth_org_id());

DROP POLICY IF EXISTS "suppliers_tenant_isolation_update" ON public.suppliers;
CREATE POLICY "suppliers_tenant_isolation_update" ON public.suppliers
    FOR UPDATE
    USING (org_id = public.get_auth_org_id())
    WITH CHECK (org_id = public.get_auth_org_id());

DROP POLICY IF EXISTS "suppliers_tenant_isolation_delete" ON public.suppliers;
CREATE POLICY "suppliers_tenant_isolation_delete" ON public.suppliers
    FOR DELETE
    USING (org_id = public.get_auth_org_id());

-- 4.8 Audit Events Table Policies
DROP POLICY IF EXISTS "audit_events_tenant_isolation_select" ON public.audit_events;
CREATE POLICY "audit_events_tenant_isolation_select" ON public.audit_events
    FOR SELECT
    USING (org_id = public.get_auth_org_id());

DROP POLICY IF EXISTS "audit_events_tenant_isolation_insert" ON public.audit_events;
CREATE POLICY "audit_events_tenant_isolation_insert" ON public.audit_events
    FOR INSERT
    WITH CHECK (org_id = public.get_auth_org_id());

-- ==============================================================================
-- 5. SEED DATA GENERATOR: DEFAULT DEMO TENANT (Apex Industrial Systems)
-- ==============================================================================

-- Create Apex Industrial Systems Organization
INSERT INTO public.organizations (id, name, domain, subscription_tier)
VALUES (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'Apex Industrial Systems',
    'apexindustrial.com',
    'enterprise'
)
ON CONFLICT (domain) DO UPDATE SET name = EXCLUDED.name;

-- Seed Sample Machinery for Apex
INSERT INTO public.machines (id, org_id, name, facility_id, facility_name, line, category, status, health_score, vibration_mms, temperature_c, pressure_bar, rpm)
VALUES 
    ('M-204', 'a0000000-0000-0000-0000-000000000001'::uuid, 'Precision Spindle Unit M-204', 'FAC-A', 'Chennai Assembly Plant', 'Assembly Line 2', 'milling', 'critical', 34, 8.7, 78.0, 41.0, 1840),
    ('M-117', 'a0000000-0000-0000-0000-000000000001'::uuid, 'Drive Motor Unit M-117', 'FAC-B', 'Bengaluru Machining Hub', 'Machining Bay 1', 'robotics', 'warning', 65, 4.2, 81.2, 38.0, 1720),
    ('M-301', 'a0000000-0000-0000-0000-000000000001'::uuid, 'Hydropress Transfer Manifold M-301', 'FAC-A', 'Chennai Assembly Plant', 'Hydraulic Stamping Cell', 'press', 'operational', 92, 1.4, 52.0, 54.0, 1650),
    ('M-402', 'a0000000-0000-0000-0000-000000000001'::uuid, 'Automated Gantry Cell M-402', 'FAC-C', 'Hyderabad Logistics Depot', 'Transfer Line 4', 'robotics', 'operational', 97, 1.4, 55.0, 42.0, 1910)
ON CONFLICT (org_id, id) DO NOTHING;

-- Seed Sample Critical Incident for M-204
INSERT INTO public.incidents (id, org_id, machine_id, machine_name, facility_id, facility_name, severity, title, failure_mode, root_cause_part, metric_breach, recommended_source, status, assigned_to)
VALUES (
    'INC-204',
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'M-204',
    'Precision Spindle Unit M-204',
    'FAC-A',
    'Chennai Assembly Plant',
    'critical',
    'High-Frequency Bearing Harmonics Excursion',
    'ISO-10816 Spindle Bearing Micro-Fracture',
    'BRG-204',
    'Vibration peaked at 8.7 mm/s RMS (threshold 6.0 mm/s)',
    'FAC-C (Hyderabad)',
    'open',
    'Dinesh'
)
ON CONFLICT (org_id, id) DO NOTHING;

-- Seed Distributed Inventory for Bearing BRG-204
INSERT INTO public.inventory (id, org_id, part_id, sku, part_name, description, category, unit_cost, lead_time_days, min_threshold, facility_stock)
VALUES (
    'INV-BRG-204',
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'BRG-204',
    'SKF-BRG-204',
    'Spindle Bearing (Angular Contact)',
    'High-precision angular contact bearing pair for CNC spindles',
    'Bearings',
    485.00,
    14,
    2,
    '{
        "FAC-A": {"quantity": 0, "min_safety": 2, "bin": "Cabinet A1-Bin 04"},
        "FAC-B": {"quantity": 2, "min_safety": 2, "bin": "Cabinet B2-Bin 12"},
        "FAC-C": {"quantity": 4, "min_safety": 2, "bin": "Bay C3-Shelf 01"},
        "FAC-D": {"quantity": 7, "min_safety": 3, "bin": "Storage D4-Pallet 09"}
    }'::jsonb
)
ON CONFLICT (org_id, id) DO NOTHING;
