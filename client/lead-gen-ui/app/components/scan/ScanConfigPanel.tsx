import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { CATEGORY_OPTIONS } from '~/utils/constants';
import { formatDate } from '~/utils/formatters';
import type { ScanConfig } from '~/api/leadsApi';

interface ScanConfigPanelProps {
  config: ScanConfig;
  onChange: (patch: Partial<ScanConfig>) => void;
  onScan: () => void;
  isScanning: boolean;
  lastScanned: string | null;
  newLeadsFound: number | null;
  error: string | null;
}

export function ScanConfigPanel({
  config,
  onChange,
  onScan,
  isScanning,
  lastScanned,
  newLeadsFound,
  error,
}: ScanConfigPanelProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Scan for Leads</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Input
            label="Location"
            placeholder="e.g. Brooklyn, NY"
            value={config.location}
            onChange={(e) => onChange({ location: e.target.value })}
            disabled={isScanning}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Radius: {config.radius_km} km
          </label>
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={config.radius_km}
            onChange={(e) => onChange({ radius_km: Number(e.target.value) })}
            disabled={isScanning}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            value={config.category}
            onChange={(e) => onChange({ category: e.target.value })}
            disabled={isScanning}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Input
            label="Min Rating"
            type="number"
            min={1}
            max={5}
            step={0.5}
            value={config.min_rating}
            onChange={(e) => onChange({ min_rating: Number(e.target.value) })}
            disabled={isScanning}
          />
        </div>

        <div>
          <Input
            label="Max Rating"
            type="number"
            min={1}
            max={5}
            step={0.5}
            value={config.max_rating}
            onChange={(e) => onChange({ max_rating: Number(e.target.value) })}
            disabled={isScanning}
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-500">{error}</p>
      )}

      <div className="mt-4 flex items-center gap-4">
        <Button onClick={onScan} loading={isScanning} disabled={isScanning}>
          {isScanning ? 'Scanning…' : 'Scan Now'}
        </Button>

        {lastScanned && (
          <p className="text-xs text-gray-500">
            Last scanned: {formatDate(lastScanned)}
            {newLeadsFound != null && (
              <span className="ml-2 font-medium text-green-600">
                +{newLeadsFound} new
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
