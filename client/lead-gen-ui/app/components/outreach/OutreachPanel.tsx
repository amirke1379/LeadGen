import { Button } from '~/components/ui/Button';
import { MessagePreview } from './MessagePreview';
import { useOutreach } from '~/hooks/useOutreach';
import { formatRating } from '~/utils/formatters';

export function OutreachPanel() {
  const {
    selectedLead,
    generatedMessage,
    isGenerating,
    isSending,
    method,
    recipientEmail,
    error,
    setGeneratedMessage,
    setMethod,
    setRecipientEmail,
    generate,
    send,
    reset,
  } = useOutreach();

  if (!selectedLead) return null;

  const canSend =
    !!generatedMessage &&
    (method === 'sms' ? !!selectedLead.phone : !!recipientEmail);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={reset}
      />

      {/* Slide-in panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-gray-900 truncate">{selectedLead.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {selectedLead.category ?? 'Business'}
                {selectedLead.rating != null && (
                  <> · {formatRating(selectedLead.rating, selectedLead.review_count)}</>
                )}
              </p>
              {selectedLead.phone && (
                <p className="text-sm text-gray-600 mt-1">{selectedLead.phone}</p>
              )}
              {selectedLead.address && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{selectedLead.address}</p>
              )}
            </div>
            <button
              onClick={reset}
              className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5"
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Method selector */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Send via
            </p>
            <div className="flex gap-2">
              {(['sms', 'email'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    method === m
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                  }`}
                >
                  {m === 'sms' ? 'SMS' : 'Email'}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient email input */}
          {method === 'email' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="business@example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* No phone warning for SMS */}
          {method === 'sms' && !selectedLead.phone && (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              No phone number on file for this lead.
            </p>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Generate button or message preview */}
          {!generatedMessage ? (
            <Button onClick={generate} loading={isGenerating} className="w-full">
              Generate Message
            </Button>
          ) : (
            <MessagePreview
              body={generatedMessage.body}
              subject={generatedMessage.subject}
              isEmail={method === 'email'}
              isGenerating={isGenerating}
              onBodyChange={(body) => setGeneratedMessage({ ...generatedMessage, body })}
              onSubjectChange={(subject) => setGeneratedMessage({ ...generatedMessage, subject })}
              onRegenerate={generate}
            />
          )}
        </div>

        {/* Footer */}
        {generatedMessage && (
          <div className="px-6 py-4 border-t border-gray-200 shrink-0">
            <Button
              onClick={send}
              loading={isSending}
              disabled={!canSend}
              className="w-full"
            >
              Send {method === 'sms' ? 'SMS' : 'Email'}
            </Button>
            {method === 'email' && !recipientEmail && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                Enter a recipient email to send
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
