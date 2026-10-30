'use client';

import { useSyncExternalStore, useMemo } from 'react';
import { rerouteStore, RerouteState } from './reroute-store';

export function useRerouteWorkflow(): [
  RerouteState,
  {
    openConfirmation: () => void;
    cancelConfirmation: () => void;
    confirmTransfer: (hash?: string) => void;
    restoreBaseline: () => void;
  }
] {
  const state = useSyncExternalStore(
    rerouteStore.subscribe,
    rerouteStore.getState,
    rerouteStore.getServerSnapshot
  );

  const actions = useMemo(
    () => ({
      openConfirmation: rerouteStore.openConfirmation,
      cancelConfirmation: rerouteStore.cancelConfirmation,
      confirmTransfer: rerouteStore.confirmTransfer,
      restoreBaseline: rerouteStore.restoreBaseline,
    }),
    []
  );

  return [state, actions];
}

