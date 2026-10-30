import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { ActivityView } from '@/components/activity/activity-view';

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Stream"
        description="Chronological operational feed of incident anomalies, spare-part transfers, and supplier synchronizations."
        tag="ACTIVITY FEED"
      />

      <ActivityView />
    </div>
  );
}
