import React from "react";
import ModuleScreenLayout from "../components/ModuleScreenLayout";
import ExportSection from "../components/audit/ExportSection";
import AuditStats from "../components/audit/AuditStats";
import AuditFilters from "../components/audit/AuditFilters";
import AuditTimeline from "../components/audit/AuditTimeline";

export default function AuditScreen() {
  return (
    <ModuleScreenLayout>
      <AuditStats />
      <AuditFilters />
      <AuditTimeline />
      <ExportSection />
    </ModuleScreenLayout>
  );
}
