import { useCallback } from 'react';
import { scanLeads, getLeads } from '~/api/leadsApi';
import { useLeadsStore } from '~/store/leadsStore';

export function useLeads() {
  const {
    leads,
    isScanning,
    lastScanned,
    newLeadsFound,
    scanConfig,
    error,
    setLeads,
    setIsScanning,
    setLastScanned,
    setNewLeadsFound,
    setScanConfig,
    setError,
  } = useLeadsStore();

  const fetchLeads = useCallback(async () => {
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    }
  }, [setLeads, setError]);

  const runScan = useCallback(async () => {
    if (!scanConfig.location.trim()) {
      setError('Please enter a location to scan');
      return;
    }
    setIsScanning(true);
    setError(null);
    try {
      const result = await scanLeads(scanConfig);
      setLeads(result.leads);
      setNewLeadsFound(result.new_leads_found);
      setLastScanned(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setIsScanning(false);
    }
  }, [scanConfig, setIsScanning, setError, setLeads, setNewLeadsFound, setLastScanned]);

  return {
    leads,
    isScanning,
    lastScanned,
    newLeadsFound,
    scanConfig,
    error,
    fetchLeads,
    runScan,
    setScanConfig,
    setError,
  };
}
