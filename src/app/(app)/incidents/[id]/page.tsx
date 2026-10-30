import React from 'react';
import { incidentsData } from '@/lib/data';
import { IncidentRerouteView } from '@/components/incidents/incident-reroute-view';
import { GeneralIncidentView } from '@/components/incidents/general-incident-view';

export function generateStaticParams() {
  return incidentsData.map((inc) => ({
    id: inc.id,
  }));
}

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Primary scenario for Module 05: INC-204 / M-204
  if (id === 'INC-204' || id === 'M-204') {
    return <IncidentRerouteView incidentId={id} />;
  }

  return <GeneralIncidentView incidentId={id} />;
}
