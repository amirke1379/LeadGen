import { Button } from '~/components/ui/Button';

interface MessagePreviewProps {
  body: string;
  subject?: string;
  isEmail: boolean;
  isGenerating: boolean;
  onBodyChange: (body: string) => void;
  onSubjectChange?: (subject: string) => void;
  onRegenerate: () => void;
}

export function MessagePreview({
  body,
  subject,
  isEmail,
  isGenerating,
  onBodyChange,
  onSubjectChange,
  onRegenerate,
}: MessagePreviewProps) {
  return (
    <div className="space-y-3">
      {isEmail && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Subject
          </label>
          <input
            type="text"
            value={subject ?? ''}
            onChange={(e) => onSubjectChange?.(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
          Message
        </label>
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          rows={isEmail ? 7 : 4}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {!isEmail && (
          <p className={`text-xs mt-1 text-right ${body.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
            {body.length}/160
          </p>
        )}
      </div>

      <Button variant="ghost" size="sm" loading={isGenerating} onClick={onRegenerate}>
        Regenerate
      </Button>
    </div>
  );
}
