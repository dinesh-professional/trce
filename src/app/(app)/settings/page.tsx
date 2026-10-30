import React from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="System Configuration & Settings"
        description="Core operational thresholds, telemetry sampling rates, and facility node identifiers."
        tag="NODE CONFIG"
      />

      <div className="space-y-6">
        {/* Core Node Telemetry */}
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-xl">
          <CardHeader>
            <CardTitle className="text-slate-900 font-bold">Telemetry Engine Preferences</CardTitle>
            <CardDescription className="text-slate-500 font-normal">
              Configure default polling intervals and alert thresholds for vibration and thermal sensors.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-xs">
                <label className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  STREAM SAMPLING FREQUENCY
                </label>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-semibold">
                  500ms (High-Resolution)
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <label className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  PRIMARY TELEMETRY NODE
                </label>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                  EXASOL-CORE-US-EAST-01
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Autonomous Anomaly Broadcasts
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Send critical machine threshold alerts instantly to operational shifts.
                  </div>
                </div>
                <Badge variant="primary">ENABLED</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t border-slate-100">
            <Button variant="primary" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
              Save Configuration
            </Button>
          </CardFooter>
        </Card>

        {/* System & Architecture Info */}
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-xl">
          <CardHeader>
            <CardTitle className="text-slate-900 font-bold">System Environment Details</CardTitle>
            <CardDescription className="text-slate-500 font-normal">
              Active system parameters and runtime environment specification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500 font-medium">Product</span>
                <span className="text-slate-900 font-bold">Trce</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500 font-medium">Domain</span>
                <span className="text-sky-700 font-semibold">Industrial Operational Intelligence</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500 font-medium">Architecture</span>
                <span className="text-slate-800 font-medium">Next.js App Router (TypeScript + Tailwind CSS v4)</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500 font-medium">Platform Version</span>
                <span className="text-emerald-700 font-bold">Trce Enterprise Operations Suite (v1.0.0-prod)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
