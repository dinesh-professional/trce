'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Activity,
  Boxes,
  Truck,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SCENARIO_STEPS, ScenarioStepNumber } from '@/lib/scenario';
import { useRerouteWorkflow } from '@/lib/reroute';

export function LiveScenarioRunner() {
  const [workflowState, actions] = useRerouteWorkflow();
  const [currentStep, setCurrentStep] = useState<ScenarioStepNumber>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'presenter' | 'standard'>('presenter');
  const [isSearchingInventory, setIsSearchingInventory] = useState<boolean>(false);

  // Interval timer for playback
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stepDuration = playbackSpeed === 'presenter' ? 5000 : 3000;

  const handleNextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= 9) {
        setIsPlaying(false);
        return 9;
      }
      const next = (prev + 1) as ScenarioStepNumber;

      // Special action triggers on step transition
      if (next === 5) {
        setIsSearchingInventory(false);
      }
      if (next === 8 && workflowState.status !== 'IN_TRANSIT') {
        actions.confirmTransfer();
      }
      return next;
    });
  }, [actions, workflowState.status]);

  const handlePrevStep = () => {
    setCurrentStep((prev) => {
      if (prev <= 1) return 1;
      return (prev - 1) as ScenarioStepNumber;
    });
  };

  const handleJumpToStep = (step: ScenarioStepNumber) => {
    setIsPlaying(false);
    setIsSearchingInventory(false);
    if (step >= 8 && workflowState.status !== 'IN_TRANSIT') {
      actions.confirmTransfer();
    }
    if (step < 8 && workflowState.status === 'IN_TRANSIT') {
      // Keep store synchronized
    }
    setCurrentStep(step);
  };

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        handleNextStep();
      }, stepDuration);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, stepDuration, handleNextStep]);

  const handleStartScenario = () => {
    actions.restoreBaseline();
    setCurrentStep(1);
    setIsPlaying(true);
  };

  const handleResetScenario = () => {
    setIsPlaying(false);
    actions.restoreBaseline();
    setCurrentStep(1);
    setIsSearchingInventory(false);
  };

  const handleInitiateRerouteClick = () => {
    actions.confirmTransfer();
    setCurrentStep(8);
  };

  return (
    <div className="space-y-6">
      {/* OPERATIONAL SCENARIO EXECUTION BANNER */}
      <div className="p-3.5 rounded-sm bg-emerald-50/80 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
          <div className="text-xs">
            <span className="font-bold text-emerald-800 uppercase tracking-wider">
              OPERATIONAL SCENARIO
            </span>
            <span className="text-slate-400 mx-2">·</span>
            <span className="text-slate-900 font-semibold tracking-wide">
              LIVE OPERATIONAL TELEMETRY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <span className="px-2 py-0.5 rounded-xs bg-white border border-slate-200 font-medium">
            PIPELINE: Operational Dispatch &amp; Logistics Reroute
          </span>
        </div>
      </div>

      {/* TOP CONTROLS & TIMELINE TRACKER */}
      <Card className="border border-slate-200 bg-white shadow-2xs">
        <CardHeader className="pb-3 border-b border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <CardTitle className="text-sm tracking-wider uppercase text-slate-900 font-bold">
                  END-TO-END INDUSTRIAL DISPATCH RUNNER
                </CardTitle>
              </div>
              <p className="text-xs text-slate-600">
                Predictable 9-stage operational sequence from sensor anomaly detection to cross-facility spare reallocation.
              </p>
            </div>

            {/* Playback & Reset CTA Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {!isPlaying ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleStartScenario}
                  className="glow-primary text-xs"
                  leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                >
                  RUN LIVE SCENARIO
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPlaying(false)}
                  className="text-xs border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                  leftIcon={<Pause className="w-3.5 h-3.5 fill-current" />}
                >
                  PAUSE SCENARIO
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleResetScenario}
                className="text-xs text-slate-600 hover:text-rose-600"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                RESET SCENARIO
              </Button>

              {/* Speed Mode Toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 border border-slate-200 p-0.5 rounded-sm text-[11px]">
                <button
                  onClick={() => setPlaybackSpeed('presenter')}
                  className={`px-2 py-1 rounded-xs transition-colors ${
                    playbackSpeed === 'presenter'
                      ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Presenter (5s)
                </button>
                <button
                  onClick={() => setPlaybackSpeed('standard')}
                  className={`px-2 py-1 rounded-xs transition-colors ${
                    playbackSpeed === 'standard'
                      ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Fast (3s)
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* STEPPER PROGRESS INDICATOR (Steps 1 to 9) */}
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center justify-between min-w-[700px] gap-2">
              {SCENARIO_STEPS.map((s) => {
                const isCurrent = s.step === currentStep;
                const isCompleted = s.step < currentStep;

                return (
                  <button
                    key={s.step}
                    onClick={() => handleJumpToStep(s.step)}
                    className={`flex-1 p-2 rounded-sm border text-left transition-all text-xs ${
                      isCurrent
                        ? 'bg-emerald-50 border-emerald-500 shadow-2xs ring-1 ring-emerald-500/20'
                        : isCompleted
                        ? 'bg-slate-50 border-emerald-300 text-slate-700'
                        : 'bg-slate-50/60 border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          isCurrent
                            ? 'text-emerald-800'
                            : isCompleted
                            ? 'text-sky-700'
                            : 'text-slate-500'
                        }`}
                      >
                        STEP {s.step}
                      </span>
                      {isCompleted && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      )}
                    </div>
                    <div
                      className={`text-[11px] truncate font-medium ${
                        isCurrent ? 'text-slate-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {s.shortLabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper Navigation Controls */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevStep}
                disabled={currentStep <= 1}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextStep}
                disabled={currentStep >= 9}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
              <span className="text-slate-600 ml-2">
                Stage {currentStep} of 9 ·{' '}
                <strong className="text-slate-900">
                  {SCENARIO_STEPS[currentStep - 1].title}
                </strong>
              </span>
            </div>

            <div className="text-[11px] text-slate-600">
              {isPlaying ? (
                <span className="text-emerald-700 font-semibold animate-pulse">
                  ● Autoplay Active ({playbackSpeed} pace)
                </span>
              ) : (
                <span>Interactive Manual Control</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STAGE DISPLAY PANELS (1 through 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Stage Presentation Area (Left 8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: ANOMALY DETECTED (M-204) */}
          <div
            className={`p-6 rounded-sm border transition-all duration-300 ${
              currentStep === 1
                ? 'bg-rose-50/60 border-rose-300 shadow-2xs ring-1 ring-rose-500/20'
                : currentStep > 1
                ? 'bg-white border-slate-200 shadow-2xs'
                : 'bg-slate-50/60 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-3 h-3 rounded-full ${
                    currentStep === 1 ? 'bg-rose-600 animate-ping' : 'bg-rose-600'
                  }`}
                />
                <span className="text-sm font-bold tracking-wider text-rose-700 uppercase">
                  STEP 1 — ANOMALY DETECTED
                </span>
              </div>
              <Badge variant="critical" size="sm">
                CRITICAL ALERT
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-sm bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block text-[10px] uppercase font-medium">
                  MACHINE ID
                </span>
                <span className="text-xl font-bold text-slate-900 block mt-0.5">
                  M-204
                </span>
                <span className="text-[11px] text-sky-700 block font-medium">
                  Assembly Line 2
                </span>
              </div>

              <div className="p-3.5 rounded-sm bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block text-[10px] uppercase font-medium">
                  FACILITY
                </span>
                <span className="text-xl font-bold text-slate-900 block mt-0.5">
                  FAC-A
                </span>
                <span className="text-[11px] text-slate-600 block">
                  Chennai Manufacturing Plant
                </span>
              </div>

              <div className="p-3.5 rounded-sm bg-rose-50/50 border border-rose-300">
                <span className="text-slate-500 block text-[10px] uppercase font-medium">
                  ISSUE
                </span>
                <span className="text-base font-bold text-rose-700 block mt-0.5">
                  Abnormal vibration
                </span>
                <span className="text-[10px] text-rose-600 block font-medium">
                  Failure predicted &lt; 2 hours
                </span>
              </div>
            </div>
          </div>

          {/* STEP 2: REVEAL VIBRATION TELEMETRY */}
          <div
            className={`p-6 rounded-sm border transition-all duration-300 ${
              currentStep === 2
                ? 'bg-rose-50/60 border-rose-300 shadow-2xs ring-1 ring-rose-500/20'
                : currentStep > 2
                ? 'bg-white border-slate-200 shadow-2xs'
                : 'bg-slate-50/60 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-600" />
                <span className="text-sm font-bold tracking-wider text-slate-900 uppercase">
                  STEP 2 — TELEMETRY THRESHOLD BREACH
                </span>
              </div>
              <Badge variant="warning" size="sm">
                +45% OVER NOMINAL
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-sm bg-rose-50/50 border border-rose-300">
                <span className="text-slate-500 block text-[10px] uppercase font-medium">
                  Vibration Reading
                </span>
                <div className="text-3xl font-bold text-rose-700 mt-1">
                  8.7 mm/s
                </div>
                <span className="text-[10px] text-rose-600 block mt-1 font-medium">
                  Root Mean Square (RMS) on Drive Axis
                </span>
              </div>

              <div className="p-4 rounded-sm bg-emerald-50/50 border border-emerald-300">
                <span className="text-slate-500 block text-[10px] uppercase font-medium">
                  Normal Range
                </span>
                <div className="text-3xl font-bold text-emerald-700 mt-1">
                  0–6 mm/s
                </div>
                <span className="text-[10px] text-slate-600 block mt-1">
                  ISO-10816 Class II Standard Tolerance
                </span>
              </div>
            </div>
          </div>

          {/* STEP 3 & STEP 4: POTENTIAL COMPONENT & LOCAL STOCK DEFICIT */}
          <div
            className={`p-6 rounded-sm border transition-all duration-300 ${
              currentStep === 3 || currentStep === 4
                ? 'bg-amber-50/60 border-amber-300 shadow-2xs ring-1 ring-amber-500/20'
                : currentStep > 4
                ? 'bg-white border-slate-200 shadow-2xs'
                : 'bg-slate-50/60 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-bold tracking-wider text-slate-900 uppercase">
                  STEP 3 &amp; 4 — COMPONENT ISOLATION &amp; LOCAL STOCK
                </span>
              </div>
              <Badge variant="critical" size="sm">
                0 LOCAL UNITS
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Step 3: Potential Component */}
              <div className="p-4 rounded-sm bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-500 block text-[10px] uppercase font-medium">
                  Potential component
                </span>
                <div className="text-2xl font-bold text-emerald-700 mt-1">
                  BRG-204
                </div>
                <span className="text-[11px] text-slate-600 block mt-0.5">
                  Deep Groove Spindle Ball Bearing (High Load)
                </span>
              </div>

              {/* Step 4: Local Stock */}
              <div className="p-4 rounded-sm bg-rose-50/50 border border-rose-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[10px] uppercase font-medium">
                    FAC-A Local Stock
                  </span>
                  <span className="px-1.5 py-0.5 rounded-xs bg-rose-100 text-rose-700 text-[10px] font-bold">
                    CRITICAL
                  </span>
                </div>
                <div className="text-2xl font-bold text-rose-700 mt-1">
                  {workflowState.stockFacA} units
                </div>
                <span className="text-[10px] text-rose-600 block mt-0.5 font-medium">
                  Immediate repair blocked: No on-site replacement
                </span>
              </div>
            </div>
          </div>

          {/* STEP 5: AUTOMATICALLY TRIGGER TRACE VISUALIZATION */}
          <div
            className={`p-6 rounded-sm border transition-all duration-300 ${
              currentStep === 5
                ? 'bg-sky-50/60 border-sky-300 shadow-2xs ring-1 ring-sky-500/20'
                : currentStep > 5
                ? 'bg-white border-slate-200 shadow-2xs'
                : 'bg-slate-50/60 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-600" />
                <span className="text-sm font-bold tracking-wider text-slate-900 uppercase">
                  STEP 5 — DISTRIBUTED INVENTORY TRACE
                </span>
              </div>
              <Badge variant="secondary" size="sm">
                CROSS-FACILITY LEDGER
              </Badge>
            </div>

            {/* Loading state indicator */}
            {isSearchingInventory ? (
              <div className="py-8 text-center space-y-3 text-xs">
                <Compass className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
                <span className="text-sky-700 font-bold block animate-pulse">
                  Searching distributed inventory...
                </span>
                <span className="text-[11px] text-slate-600">
                  Querying real-time stock balances across regional nodes
                </span>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-xs">
                {/* Result cards:
                    FAC-B: 2 units
                    FAC-C: 4 units ← Recommended
                    FAC-D: 7 units
                */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-sm bg-white border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">FAC-B</span>
                      <span className="text-[10px] text-slate-500">Bengaluru</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 mt-1">
                      {workflowState.stockFacB} units
                    </div>
                    <span className="text-[10px] text-slate-600 block mt-0.5">
                      Safety buffer: 2 units (Hold)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-sm bg-emerald-50/80 border border-emerald-400 shadow-2xs ring-1 ring-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800">FAC-C</span>
                      <span className="px-1.5 py-0.2 rounded-xs bg-emerald-600 text-white text-[9px] font-bold uppercase">
                        Recommended
                      </span>
                    </div>
                    <div className="text-xl font-bold text-emerald-700 mt-1">
                      {workflowState.stockFacC} units
                    </div>
                    <span className="text-[10px] text-emerald-800 block mt-0.5 font-semibold">
                      Surplus: Safe to transfer
                    </span>
                  </div>

                  <div className="p-3.5 rounded-sm bg-white border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">FAC-D</span>
                      <span className="text-[10px] text-slate-500">Pune</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 mt-1">
                      {workflowState.stockFacD} units
                    </div>
                    <span className="text-[10px] text-slate-600 block mt-0.5">
                      Distance: 840 km (Sub-optimal)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 6 & STEP 7: TRCE RECOMMENDATION & INITIATE REROUTE CTA */}
          <div
            className={`p-6 rounded-sm border transition-all duration-300 ${
              currentStep === 6 || currentStep === 7
                ? 'bg-emerald-50/60 border-emerald-400 shadow-2xs ring-1 ring-emerald-500/20'
                : currentStep > 7
                ? 'bg-white border-slate-200 shadow-2xs'
                : 'bg-slate-50/60 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span className="text-sm font-bold tracking-wider text-emerald-800 uppercase">
                  STEP 6 &amp; 7 — TRCE RECOMMENDATION &amp; DISPATCH CTA
                </span>
              </div>
              <Badge variant="primary" size="sm">
                ACTIONABLE DECISION
              </Badge>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-4 rounded-sm bg-white border border-emerald-300 shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-medium">
                    Move Part
                  </span>
                  <span className="text-base font-bold text-emerald-700">
                    BRG-204
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    4 units
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-medium">
                    Route
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    FAC-C → FAC-A
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    Direct Highway
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-medium">
                    Distance
                  </span>
                  <span className="text-base font-bold text-sky-700">
                    183 km
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    Inter-hub transit
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-medium">
                    ETA
                  </span>
                  <span className="text-base font-bold text-amber-700">
                    4h 20m
                  </span>
                  <span className="text-[11px] text-emerald-700 block font-semibold">
                    Arrives before outage
                  </span>
                </div>
              </div>

              {/* CTA required by Step 7: User clicks INITIATE REROUTE */}
              <div className="pt-2 flex items-center justify-between">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleInitiateRerouteClick}
                  className="w-full sm:w-auto text-sm px-8 py-3.5 glow-primary"
                  leftIcon={<Truck className="w-4 h-4" />}
                  rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                >
                  INITIATE REROUTE
                </Button>
                <span className="hidden sm:inline text-[11px] text-slate-600 font-medium">
                  Click to execute operational transfer
                </span>
              </div>
            </div>
          </div>

          {/* STEP 8: TRANSFER INITIATED (IN TRANSIT DISPLAY) */}
          <div
            className={`p-6 rounded-sm border transition-all duration-300 ${
              currentStep === 8 || currentStep === 9
                ? 'bg-sky-50/60 border-sky-300 shadow-2xs ring-1 ring-sky-500/20'
                : 'bg-slate-50/60 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-sky-700" />
                <span className="text-sm font-bold tracking-wider text-sky-800 uppercase">
                  STEP 8 — TRANSFER INITIATED
                </span>
              </div>
              <Badge variant="secondary" size="sm">
                STATUS: IN TRANSIT
              </Badge>
            </div>

            {/* Visual Flow:
                FAC-C
                   ↓
                BRG-204
                   ↓
                FAC-A
                STATUS: IN TRANSIT
            */}
            <div className="mt-4 p-5 rounded-sm bg-white border border-slate-200 text-center shadow-2xs">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="px-5 py-2 rounded-sm bg-slate-50 border border-slate-200 font-bold text-slate-900">
                  FAC-C (Hyderabad)
                </div>

                <div className="text-xs text-slate-500 animate-bounce">↓</div>

                <div className="px-6 py-2 rounded-sm bg-emerald-50 border border-emerald-400 text-xs font-bold text-emerald-800 shadow-2xs">
                  🚚 BRG-204 (4 units)
                </div>

                <div className="text-xs text-slate-500 animate-bounce">↓</div>

                <div className="px-5 py-2 rounded-sm bg-slate-50 border border-emerald-300 font-bold text-emerald-800">
                  FAC-A (Chennai)
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-center gap-6 text-xs text-slate-600">
                <span>
                  ETA: <strong className="text-amber-700">4h 20m</strong>
                </span>
                <span>·</span>
                <span>
                  STATUS: <strong className="text-sky-700">IN TRANSIT</strong>
                </span>
                <span>·</span>
                <span>
                  Carrier: <strong className="text-slate-900">TRCE Expedited Freight</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: STEP 9 TIMELINE & REAL-TIME INVENTORY LEDGER */}
        <div className="lg:col-span-4 space-y-6">
          {/* STEP 9: INCIDENT TIMELINE */}
          <Card className="border border-slate-200 bg-white shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-700" />
                  <CardTitle className="text-sm tracking-wider uppercase text-slate-900 font-bold">
                    INCIDENT TIMELINE
                  </CardTitle>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  STEP 9
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {/* Timeline Sequence:
                  Anomaly detected
                          ↓
                  Spare identified
                          ↓
                  Inventory traced
                          ↓
                  Source selected
                          ↓
                  Transfer initiated
              */}
              <div className="space-y-3 text-xs relative before:absolute before:inset-0 before:left-3 before:w-px before:bg-slate-200">
                <div className="flex items-start gap-3 relative">
                  <span className="w-2 h-2 rounded-full bg-rose-600 shadow-[0_0_6px_#EF4444] mt-1 shrink-0 z-10" />
                  <div className="p-2 rounded-sm bg-slate-50 border border-slate-200 flex-1 shadow-2xs">
                    <div className="font-bold text-slate-900">21:02 Anomaly detected</div>
                    <div className="text-[10px] text-slate-600">M-204 vibration threshold breach</div>
                  </div>
                </div>

                <div className="text-center text-slate-400 text-[10px] pl-2">↓</div>

                <div className="flex items-start gap-3 relative">
                  <span className="w-2 h-2 rounded-full bg-amber-600 mt-1 shrink-0 z-10" />
                  <div className="p-2 rounded-sm bg-slate-50 border border-slate-200 flex-1 shadow-2xs">
                    <div className="font-bold text-slate-900">21:03 Spare identified</div>
                    <div className="text-[10px] text-slate-600">BRG-204 bearing failure isolated</div>
                  </div>
                </div>

                <div className="text-center text-slate-400 text-[10px] pl-2">↓</div>

                <div className="flex items-start gap-3 relative">
                  <span className="w-2 h-2 rounded-full bg-sky-600 mt-1 shrink-0 z-10" />
                  <div className="p-2 rounded-sm bg-slate-50 border border-slate-200 flex-1 shadow-2xs">
                    <div className="font-bold text-slate-900">21:03 Inventory traced</div>
                    <div className="text-[10px] text-slate-600">FAC-A has 0 units; multi-hub queried</div>
                  </div>
                </div>

                <div className="text-center text-slate-400 text-[10px] pl-2">↓</div>

                <div className="flex items-start gap-3 relative">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0 z-10" />
                  <div className="p-2 rounded-sm bg-slate-50 border border-slate-200 flex-1 shadow-2xs">
                    <div className="font-bold text-slate-900">21:04 Source selected</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">FAC-C optimal match (4 units, 183 km)</div>
                  </div>
                </div>

                <div className="text-center text-slate-400 text-[10px] pl-2">↓</div>

                <div className="flex items-start gap-3 relative">
                  <span
                    className={`w-2 h-2 rounded-full mt-1 shrink-0 z-10 ${
                      currentStep >= 8
                        ? 'bg-emerald-600 shadow-[0_0_8px_#059669]'
                        : 'bg-slate-300'
                    }`}
                  />
                  <div
                    className={`p-2 rounded-sm border flex-1 shadow-2xs ${
                      currentStep >= 8
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="font-bold">21:04 Transfer initiated</div>
                    <div className="text-[10px]">
                      {currentStep >= 8
                        ? 'Active dispatch registered in transit'
                        : 'Awaiting operator confirmation'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OPERATIONAL INVENTORY LEDGER RESTORATION & STATUS */}
          <Card className="border border-slate-200 bg-white shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <CardTitle className="text-sm tracking-wider uppercase text-slate-900 font-bold">
                    NETWORK LEDGER STATE
                  </CardTitle>
                </div>
                <Badge
                  variant={currentStep >= 8 ? 'secondary' : 'warning'}
                  size="sm"
                >
                  {currentStep >= 8 ? 'IN TRANSIT' : 'ACTIVE'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs">
                <span className="text-slate-600 font-medium">FAC-A Stock (Chennai):</span>
                <span
                  className={`font-bold text-sm ${
                    currentStep >= 8 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {currentStep >= 8 ? '0 → 4 (In Transit)' : '0 units (CRITICAL)'}
                </span>
              </div>

              <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs">
                <span className="text-slate-600 font-medium">FAC-C Stock (Hyderabad):</span>
                <span
                  className={`font-bold text-sm ${
                    currentStep >= 8 ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {currentStep >= 8 ? '4 → 0 (Dispatched)' : '4 units (AVAILABLE)'}
                </span>
              </div>

              <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs">
                <span className="text-slate-600 font-medium">FAC-B Stock (Bengaluru):</span>
                <span className="font-bold text-sm text-slate-900">2 units</span>
              </div>

              <div className="p-3 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs">
                <span className="text-slate-600 font-medium">FAC-D Stock (Pune):</span>
                <span className="font-bold text-sm text-slate-900">7 units</span>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetScenario}
                  className="w-full text-xs justify-center"
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  RESET SCENARIO
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
