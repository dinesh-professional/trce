import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { InventoryView } from '@/components/inventory/inventory-view';

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory & Spare-Part Trace Engine"
        description="Cross-facility spare part tracking, buffer levels, and automated routing recommendation across distributed plants."
        tag="SPARE TRACE"
      />

      <InventoryView />
    </div>
  );
}
