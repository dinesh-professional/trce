import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { LiveScenarioRunner } from '@/components/scenario/live-scenario-runner';
import { Sparkles, Terminal } from 'lucide-react';

export default function OperationalScenarioPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Operational Scenario"
        description="Predictable end-to-end execution of industrial anomaly detection, spare isolation, distributed inventory tracing, and dispatch reroute."
        tag="OPERATIONAL SCENARIO"
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="md">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              DETERMINISTIC EXECUTION
            </Badge>
          </div>
        }
      />

      {/* Main Interactive Scenario Runner */}
      <LiveScenarioRunner />

      {/* Operational Scenario Workflow Guide */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <Terminal className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-900">
            Operational Scenario Workflow Guide
          </span>
          <p className="leading-relaxed">
            This module ties together telemetry anomaly detection, cross-facility inventory tracing, and operational reroute operations. You can use <strong className="text-emerald-700 font-semibold">RUN LIVE SCENARIO</strong> for automated autoplay, or use the step buttons to pause and inspect each stage in detail. Click <strong className="text-rose-600 font-semibold">RESET SCENARIO</strong> at any time to replay.
          </p>
        </div>
      </div>
    </div>
  );
}
