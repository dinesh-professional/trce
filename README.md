# Trce

> Untangling the Industrial Supply Chain.

Operational intelligence for modern industrial teams. Trce unites machine telemetry, distributed inventory, and supplier catalog feeds into a single operational workspace to detect equipment anomalies, trace spare resources, and execute automated inter-facility transfers.

---

## Architecture

Trce converts fragmented, non-standard industrial operational data into real-time operational decisions:

```text
    ┌───────────────────────┐   ┌────────────────────────┐   ┌────────────────────────┐
    │  Equipment Telemetry  │   │ Distributed Inventory  │   │ Vendor Catalog Feeds   │
    │  (Vibration, Temp,    │   │ (FAC-A, FAC-B, FAC-C,  │   │ (Heterogeneous Column  │
    │   Pressure, RPM)      │   │  FAC-D Plant Buffers)  │   │  Headers: CSV Feeds)   │
    └───────────┬───────────┘   └───────────┬────────────┘   └───────────┬────────────┘
                │                           │                            │
                ▼                           ▼                            ▼
    ┌─────────────────────────────────────────────────────────────────────────────────┐
    │                              TRCE PLATFORM INGESTION                            │
    │  • Deterministic ISO-10816 Anomaly Rule Engine                                  │
    │  • Deterministic Schema Normalization Engine (Canonical Data Model)             │
    │  • Real-Time Multi-Facility Stock Routing & Buffer Retention Algorithm         │
    └───────────────────────────────────────┬─────────────────────────────────────────┘
                                            │
                                            ▼
    ┌─────────────────────────────────────────────────────────────────────────────────┐
    │                            OPERATIONAL INTELLIGENCE                             │
    │  • Component Failure Isolation (Anomaly → Suspected Component)                  │
    │  • Spare Part Availability Tracing (Local Deficit vs. Regional Buffer)          │
    │  • Algorithmic Source Selection (Distance, Stock Adequacy, Carrier Lead Time)   │
    └───────────────────────────────────────┬─────────────────────────────────────────┘
                                            │
                                            ▼
    ┌─────────────────────────────────────────────────────────────────────────────────┐
    │                               ACTION & EXECUTION                                │
    │  • Inter-Facility Transfer Dispatch (Confirmed Routing: IN TRANSIT)             │
    │  • Dynamic Ledger Reallocation (Automatic Source & Destination Balancing)        │
    │  • Audit Trail & Real-Time Operational Activity Stream                          │
    └─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Features

### 1. Machine Health & Telemetry Anomaly Detection
- Real-time telemetry monitoring for vibration ($mm/s$), temperature ($^\circ C$), pressure ($bar$), and rotational speed ($RPM$).
- Deterministic operational rules adhering to **ISO-10816 vibration standards** (identifying high-frequency harmonic excursions).
- Automatic component failure mapping (e.g., spindle vibration spike at $8.7\text{ mm/s}$ $\rightarrow$ angular contact bearing failure).

### 2. Distributed Spare-Part Tracing
- Distributed inventory visibility across regional manufacturing hubs (`FAC-A`, `FAC-B`, `FAC-C`, `FAC-D`).
- Multi-hub inventory query engine evaluating distance, transit lead time, stock availability, and local safety buffer retention.
- Instant search and filtering by part number, facility, and stock status.

### 3. Automated Reroute Recommendation
- Algorithmic source selection identifying the optimal dispatch plant that preserves local safety buffers while minimizing logistical downtime.
- Interactive operator confirmation workflow featuring full dispatch summaries, route verification, and live simulated transfer execution (`IN TRANSIT`).

### 4. Supplier Data Harmonization
- Deterministic ingestion and normalization engine for vendor inventory feeds.
- Seamlessly maps heterogeneous proprietary headers into the unified **Trce Common Data Model (CDM)**:
  - `part_no`, `component_id`, `SKU`, `part_number`, `item_code` $\rightarrow$ `part_id`
  - `qty`, `available_units`, `stock`, `quantity` $\rightarrow$ `quantity`
  - `warehouse`, `site`, `location_code`, `location` $\rightarrow$ `location`
- Support for arbitrary CSV uploads with live schema transformation previews and error validation.

### 5. Activity Stream & Operational Audit Trail
- Chronological timeline logging anomalies, supplier syncs, and inter-facility transfers.
- Real-time category filtering (`All`, `Machines`, `Inventory`, `Suppliers`, `Transfers`).
- Instantaneous demo state reset without requiring database deletion.

---

## Tech Stack

The application is built strictly with modern, production-grade web technologies:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Server Components & Client Components)
- **Runtime**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) (Strict mode, full type-safety)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Custom Industrial Dark Theme Design System)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/) (Telemetry time-series visualization)
- **State Management**: React Sync External Store with LocalStorage synchronization for instantaneous demo state persistence and replayability.

---

## Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (`v20.0.0` or higher, tested on `v22.22.0`)
- [npm](https://www.npmjs.com/) (`v9.0.0` or higher)

### 1. Clone & Install

```bash
git clone https://github.com/dinesh14-debug/college-event-registration.git trce
cd trce
npm install
```

### 2. Configure Environment

Copy the example environment template (no external API keys required for seeded demo):

```bash
cp .env.example .env.local
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Quality Checks & Production Build

```bash
npm run lint
npm run build
npm run start
```

---

## Environment Variables

Trce runs completely zero-config and offline for local evaluation. Documented in `.env.example`:

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Application environment | `development` / `production` |
| `PORT` | Local server port | `3000` |
| `NEXT_PUBLIC_APP_URL` | Production URL (e.g. Vercel deployment) | `https://trce.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional: Supabase project URL | *(Optional)* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional: Supabase public anonymous key | *(Optional)* |
| `NEXT_PUBLIC_TELEMETRY_INTERVAL_MS` | Simulated sensor refresh interval (ms) | `500` |
| `NEXT_PUBLIC_TRCE_NODE_ID` | Host industrial node tag | `NODE-PROD-01` |

---

## Demo Account & Verification Scenario

### Demo Accounts

The workspace is pre-configured with active session persistence. You can sign in with any valid corporate email address:

- **Email**: `dinesh@trce.io` (or `operator@apexindustrial.com`)
- **Password**: `password123` (minimum 8 characters)
- Or click **`Get started`** on the landing page to create a new workspace.

### Core End-to-End Walkthrough

Follow this operational flow to verify the entire platform in under 2 minutes:

```text
1. Landing Page (/)
   ↓ Click "Get started" or "Explore the platform"
2. Dashboard (/dashboard)
   ↓ Notice Priority Critical Incident: M-204 (Abnormal vibration)
   ↓ Click "View incident"
3. Incident Detail (/incidents/INC-204)
   ↓ Notice: BRG-204 Bearing identified with 0 units local stock at FAC-A
   ↓ Click "Trace spare"
4. Distributed Inventory Trace (/inventory/BRG-204)
   ↓ Click "Trace availability"
   ↓ Engine audits network: FAC-B (2), FAC-C (4), FAC-D (7)
   ↓ System selects FAC-C as RECOMMENDED (183 km · ETA 4h 20m)
   ↓ Click "Connect to Incident Reroute"
5. Transfer Execution (/incidents/INC-204)
   ↓ Click "INITIATE REROUTE"
   ↓ Review confirmation modal: BRG-204, FAC-C → FAC-A, 4 units
   ↓ Click "Confirm Transfer"
   ↓ Banner displays "Transfer initiated"
   ↓ Transfer card updates to IN TRANSIT (FAC-C ↓ FAC-A · ETA 4h 20m)
6. Activity Stream (/activity)
   ↓ Review real-time feed: "Transfer initiated" is active at the top
   ↓ Test filter tabs: All · Machines · Inventory · Suppliers · Transfers
7. Reset Demo Data
   ↓ Click "Reset demo data" in the header to instantly restore initial balances
```

---

## Deployment

### Frontend: Vercel (Preferred)

Trce is optimized for zero-configuration serverless deployment on Vercel:

```bash
npm install -g vercel
vercel
```

Configure `NEXT_PUBLIC_APP_URL` in the Vercel project environment variables.

### Database & Auth: Supabase (Preferred)

When integrating persistent remote storage:
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your environment.
3. When external services are not connected, Trce automatically falls back to deterministic seeded in-memory and client-synced data.

### Self-Hosted Node.js / Docker

```bash
npm run build
npm run start
```

---

## Known Limitations

- **Simulated Telemetry**: Machine sensor data (vibration, temperature, pressure, RPM) runs on a deterministic operational simulator rather than hardware edge DAQ devices.
- **Simulated Logistics**: Reroute dispatch updates internal distributed inventory balances and simulated freight tracking rather than calling physical EDI/carrier endpoints.
- **File Formats**: Ingestion currently supports CSV (`.csv`); binary Excel (`.xlsx`) parsing is planned for future releases.

---

## Future Improvements

1. **Industrial IoT Protocols**: Native edge adapters for **OPC-UA**, **MQTT**, and **Modbus TCP** streaming directly from factory PLCs.
2. **Predictive Failure Models**: Remaining Useful Life (RUL) estimation trained on run-to-failure vibration spectra.
3. **ERP/WMS Connectors**: Bi-directional synchronization with **SAP S/4HANA**, **Oracle SCM**, and **Manhattan Associates**.
4. **Autonomous Carrier Dispatch**: Real-time telematics integration with Project44 and FourKites for dynamic live-GPS carrier re-routing.

---

## Competition Alignment (Hackathon Context)

This project was built for the **Factories, Fleets & Supply Chains** challenge:

| Requirement | Trce Implementation |
|---|---|
| **Operational Telemetry Ingestion** | Monitored 48-machine fleet with vibration, temperature, pressure, and RPM adhering to ISO-10816 standards. |
| **Component Failure Mapping** | Deterministic anomaly evaluation mapping telemetry excursions to specific BOM parts (`BRG-204`). |
| **Multi-Plant Inventory Query** | Real-time cross-facility spare tracing across `FAC-A`, `FAC-B`, `FAC-C`, and `FAC-D`. |
| **Logistics Lead-Time Optimization** | Distance and buffer-aware source recommendation engine selecting `FAC-C` ($183\text{ km}$, $\text{ETA } 4\text{h } 20\text{m}$). |
| **Supplier Schema Harmonization** | Deterministic normalization engine translating disparate vendor CSV feeds into a unified Common Data Model. |
| **Actionable Operations UI** | Full B2B SaaS workflow from telemetry alarm to confirmed dispatch and activity audit trail. |

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.  
Copyright (c) 2026 Trce Team.
