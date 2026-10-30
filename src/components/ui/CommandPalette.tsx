'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Cpu,
  ShieldAlert,
  Boxes,
  FileSpreadsheet,
  RotateCcw,
  Compass,
  ArrowRight,
  X,
  Sparkles,
  Truck,
  Activity,
  Layers,
} from 'lucide-react';
import { useOperationalStore, operationalStore } from '@/lib/operational-store';
import { exportAuditAsCsv, exportAuditAsJson } from '@/lib/crypto-manifest';

// Global singleton to allow opening command palette from anywhere (e.g. Header button)
type CommandPaletteListener = (isOpen: boolean) => void;
const listeners = new Set<CommandPaletteListener>();
let globalIsOpen = false;

export function openCommandPalette() {
  globalIsOpen = true;
  listeners.forEach((l) => l(true));
}

export function closeCommandPalette() {
  globalIsOpen = false;
  listeners.forEach((l) => l(false));
}

export function toggleCommandPalette() {
  globalIsOpen = !globalIsOpen;
  listeners.forEach((l) => l(globalIsOpen));
}

export function useCommandPaletteOpen() {
  const [isOpen, setIsOpen] = useState(globalIsOpen);

  useEffect(() => {
    const handler: CommandPaletteListener = (open) => setIsOpen(open);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return {
    isOpen,
    open: openCommandPalette,
    close: closeCommandPalette,
    toggle: toggleCommandPalette,
  };
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Commands' | 'Machines' | 'Incidents' | 'Inventory' | 'Navigation';
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'primary' | 'critical' | 'warning' | 'neutral';
  action: () => void;
}

export function CommandPalette() {
  const { isOpen, close, toggle } = useCommandPaletteOpen();

  // Listen to Cmd+K / Ctrl+K globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggle, close]);

  if (!isOpen) return null;

  return <CommandPaletteDialog onClose={close} />;
}

function CommandPaletteDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const store = useOperationalStore();

  // Build searchable items from live operational store
  const items: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [];

    // 1. Instant Operational Commands
    list.push(
      {
        id: 'cmd-inspect-inc-204',
        title: 'Inspect Critical Incident INC-204',
        subtitle: 'FAC-A · Angular Bearing vibration anomaly (8.7 mm/s)',
        category: 'Commands',
        icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
        badge: 'CRITICAL',
        badgeVariant: 'critical',
        action: () => {
          onClose();
          router.push('/incidents/INC-204');
        },
      },
      {
        id: 'cmd-goto-m204',
        title: 'Go to Machine M-204',
        subtitle: 'Assembly Line 2 · High vibration telemetry diagnostics',
        category: 'Commands',
        icon: <Cpu className="w-4 h-4 text-amber-600" />,
        badge: 'INSPECT',
        badgeVariant: 'warning',
        action: () => {
          onClose();
          router.push('/machines/M-204');
        },
      },
      {
        id: 'cmd-trace-brg-204',
        title: 'Trace Part BRG-204 Across Facilities',
        subtitle: 'Logistics routing: FAC-C (4 units) → FAC-A (0 units)',
        category: 'Commands',
        icon: <Compass className="w-4 h-4 text-emerald-700" />,
        badge: 'ROUTING',
        badgeVariant: 'primary',
        action: () => {
          onClose();
          router.push('/inventory/BRG-204');
        },
      },
      {
        id: 'cmd-export-csv',
        title: 'Export Activity Audit Ledger (.csv)',
        subtitle: 'Download immutable audit record with cryptographic hashes',
        category: 'Commands',
        icon: <FileSpreadsheet className="w-4 h-4 text-emerald-700" />,
        badge: 'CSV',
        badgeVariant: 'primary',
        action: () => {
          exportAuditAsCsv(store.auditEvents);
          onClose();
        },
      },
      {
        id: 'cmd-export-json',
        title: 'Export Activity Audit Ledger (.json)',
        subtitle: 'Structured JSON export for downstream SIEM / ERP integration',
        category: 'Commands',
        icon: <FileSpreadsheet className="w-4 h-4 text-sky-700" />,
        badge: 'JSON',
        badgeVariant: 'neutral',
        action: () => {
          exportAuditAsJson(store.auditEvents);
          onClose();
        },
      },
      {
        id: 'cmd-restore-baseline',
        title: 'Restore Baseline Operational State',
        subtitle: 'Revert machine telemetry, rebalance stock to FAC-C, and reset incidents',
        category: 'Commands',
        icon: <RotateCcw className="w-4 h-4 text-sky-700" />,
        badge: 'RESET',
        badgeVariant: 'neutral',
        action: () => {
          operationalStore.restoreBaseline();
          onClose();
        },
      }
    );

    // 2. Live Machines (deduplicated by machine id)
    const seenMachineIds = new Set<string>();
    store.machines.forEach((m) => {
      if (!seenMachineIds.has(m.id)) {
        seenMachineIds.add(m.id);
        list.push({
          id: `machine-${m.id}`,
          title: `Machine ${m.id} · ${m.name}`,
          subtitle: `${m.facilityName} (${m.facilityId}) · ${m.line} · ${m.vibrationMmS.toFixed(1)} mm/s · ${m.temperatureC}°C`,
          category: 'Machines',
          icon: <Cpu className="w-4 h-4 text-slate-500" />,
          badge: m.status.toUpperCase(),
          badgeVariant:
            m.status === 'critical' ? 'critical' : m.status === 'warning' ? 'warning' : 'primary',
          action: () => {
            onClose();
            router.push(`/machines/${m.id}`);
          },
        });
      }
    });

    // 3. Live Incidents
    store.incidents.forEach((inc) => {
      list.push({
        id: `incident-${inc.id}`,
        title: `Incident ${inc.id} · ${inc.componentName || inc.componentId}`,
        subtitle: `${inc.facilityName} · Machine ${inc.machineId} · ${inc.description}`,
        category: 'Incidents',
        icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
        badge: inc.status.toUpperCase(),
        badgeVariant: inc.status === 'open' || inc.status === 'investigating' ? 'critical' : 'primary',
        action: () => {
          onClose();
          router.push(`/incidents/${inc.id}`);
        },
      });
    });

    // 4. Live Inventory Parts
    store.inventoryItems.forEach((part) => {
      const totalStock = store.facilityStocks
        .filter((s) => s.partId === part.partId)
        .reduce((acc, s) => acc + s.quantity, 0);
      list.push({
        id: `inventory-${part.partId}`,
        title: `Part ${part.partId} · ${part.name}`,
        subtitle: `${part.category} · ${totalStock} units available across network`,
        category: 'Inventory',
        icon: <Boxes className="w-4 h-4 text-emerald-700" />,
        badge: `${totalStock} IN STOCK`,
        badgeVariant: totalStock < 4 ? 'critical' : 'primary',
        action: () => {
          onClose();
          router.push(`/inventory/${part.partId}`);
        },
      });
    });

    // 5. Global Navigation
    list.push(
      {
        id: 'nav-dashboard',
        title: 'Command Center Overview',
        subtitle: 'Global operational KPIs, fleet status & live metrics',
        category: 'Navigation',
        icon: <Activity className="w-4 h-4 text-sky-700" />,
        action: () => {
          onClose();
          router.push('/dashboard');
        },
      },
      {
        id: 'nav-machines',
        title: 'Telemetry Fleet Management',
        subtitle: 'Real-time vibration, temperature and machine stress testing',
        category: 'Navigation',
        icon: <Cpu className="w-4 h-4 text-sky-700" />,
        action: () => {
          onClose();
          router.push('/machines');
        },
      },
      {
        id: 'nav-incidents',
        title: 'Operational Incidents Log',
        subtitle: 'Root cause probability and inter-facility reroute actions',
        category: 'Navigation',
        icon: <ShieldAlert className="w-4 h-4 text-sky-700" />,
        action: () => {
          onClose();
          router.push('/incidents');
        },
      },
      {
        id: 'nav-inventory',
        title: 'Cross-Facility Parts Inventory',
        subtitle: 'Multi-variable downtime cost calculation and stock tracing',
        category: 'Navigation',
        icon: <Boxes className="w-4 h-4 text-sky-700" />,
        action: () => {
          onClose();
          router.push('/inventory');
        },
      },
      {
        id: 'nav-suppliers',
        title: 'Supplier Harmonization Pipeline',
        subtitle: 'Multi-format CSV ingestion, schema normalization & quarantine',
        category: 'Navigation',
        icon: <Layers className="w-4 h-4 text-sky-700" />,
        action: () => {
          onClose();
          router.push('/suppliers');
        },
      },
      {
        id: 'nav-activity',
        title: 'Cryptographic Activity Audit Ledger',
        subtitle: 'SHA-256 dispatch manifests, transfer orders & event log',
        category: 'Navigation',
        icon: <Truck className="w-4 h-4 text-sky-700" />,
        action: () => {
          onClose();
          router.push('/activity');
        },
      }
    );

    return list;
  }, [store, onClose, router]);

  // Filter items based on user query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubtitle = item.subtitle?.toLowerCase().includes(q) ?? false;
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchBadge = item.badge?.toLowerCase().includes(q) ?? false;
      return matchTitle || matchSubtitle || matchCategory || matchBadge;
    });
  }, [items, query]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSelectedIndex(0);
  };

  const handleClearQuery = () => {
    setQuery('');
    setSelectedIndex(0);
  };

  // Keyboard navigation within list
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (filteredItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          selected.action();
        }
      }
    },
    [filteredItems, selectedIndex]
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Operational Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-2 sm:pt-20 px-2 sm:px-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-sm border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-white">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search machines, incidents, parts, or execute commands..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          {query ? (
            <button
              onClick={handleClearQuery}
              className="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold">ESC</span>
              <span>to close</span>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-1">
              <Sparkles className="w-6 h-6 mx-auto text-slate-400" />
              <p className="font-semibold text-slate-900">No matching operational assets found</p>
              <p>Try searching for &quot;M-204&quot;, &quot;INC-204&quot;, &quot;BRG-204&quot;, or &quot;Export&quot;</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={`${item.id}-${index}`}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-2.5 rounded-sm cursor-pointer transition-colors text-xs ${
                    isSelected
                      ? 'bg-emerald-50 border border-emerald-300 text-slate-900 shadow-2xs'
                      : 'hover:bg-slate-50 border border-transparent text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-xs shrink-0 ${
                        isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate text-slate-900">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.2 rounded-xs font-mono font-bold ${
                              item.badgeVariant === 'critical'
                                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                : item.badgeVariant === 'warning'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : item.badgeVariant === 'primary'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-2 shrink-0">
                    <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-700 animate-in fade-in" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-mono text-[9px] text-slate-700 shadow-2xs font-semibold">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-mono text-[9px] text-slate-700 shadow-2xs font-semibold">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white border border-slate-200 font-mono text-[9px] text-slate-700 shadow-2xs font-semibold">↵</kbd>
              <span>execute</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <span>Trce Autonomous Operations Console</span>
          </div>
        </div>
      </div>
    </div>
  );
}
