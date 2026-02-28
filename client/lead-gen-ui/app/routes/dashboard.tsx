import { useEffect } from 'react';
import { ScanConfigPanel } from '~/components/scan/ScanConfigPanel';
import { LeadsTable } from '~/components/leads/LeadsTable';
import { OutreachPanel } from '~/components/outreach/OutreachPanel';
import { useLeads } from '~/hooks/useLeads';
import { useOutreachStore } from '~/store/outreachStore';
import type { Lead } from '~/api/leadsApi';

export function meta() {
  return [{ title: 'LeadHunter — Dashboard' }];
}

export default function Dashboard() {
  const {
    leads,
    isScanning,
    lastScanned,
    newLeadsFound,
    scanConfig,
    error,
    fetchLeads,
    runScan,
    setScanConfig,
  } = useLeads();

  const setSelectedLead = useOutreachStore((s) => s.setSelectedLead);

  function handleLeadClick(lead: Lead) {
    setSelectedLead(lead);
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">LeadHunter</h1>
        <p className="text-sm text-gray-500">Find small businesses with no website</p>
      </header>

      <main className="mx-auto max-w-screen-xl px-6 py-6 space-y-6">
        <ScanConfigPanel
          config={scanConfig}
          onChange={setScanConfig}
          onScan={runScan}
          isScanning={isScanning}
          lastScanned={lastScanned}
          newLeadsFound={newLeadsFound}
          error={error}
        />

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Leads{' '}
              <span className="ml-1 text-sm font-normal text-gray-400">
                ({leads.length})
              </span>
            </h2>
          </div>
          <LeadsTable leads={leads} onLeadClick={handleLeadClick} />
        </div>
      </main>

      <OutreachPanel />
    </div>
  );
}
