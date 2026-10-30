import React from 'react';
import { MachineDetailView } from '@/components/machines/machine-detail-view';
import { monitoredMachinesList } from '@/lib/data/monitored-machines';

export function generateStaticParams() {
  return monitoredMachinesList.map((m) => ({
    id: m.machineId,
  }));
}

export default async function MachineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <MachineDetailView initialMachineId={id} />;
}
