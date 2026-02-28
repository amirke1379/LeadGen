import type { Lead } from '~/api/leadsApi';
import { LeadStatusBadge } from './LeadStatusBadge';
import { formatDistance, formatRating } from '~/utils/formatters';

interface LeadRowProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

export function LeadRow({ lead, onClick }: LeadRowProps) {
  return (
    <tr
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onClick(lead)}
    >
      <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">
        {lead.name}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {lead.category ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
        {formatRating(lead.rating, lead.review_count)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {lead.phone ? (
          <a
            href={`tel:${lead.phone}`}
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {lead.phone}
          </a>
        ) : (
          '—'
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
        {lead.address ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
        {formatDistance(lead.distance)}
      </td>
      <td className="px-4 py-3">
        {lead.google_url ? (
          <a
            href={lead.google_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            Maps ↗
          </a>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <LeadStatusBadge status={lead.status} />
      </td>
    </tr>
  );
}
