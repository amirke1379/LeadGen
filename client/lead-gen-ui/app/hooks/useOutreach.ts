import { useOutreachStore } from '~/store/outreachStore';
import { generateMessage, sendMessage } from '~/api/outreachApi';

export function useOutreach() {
  const store = useOutreachStore();

  async function handleGenerateMessage() {
    if (!store.selectedLead) return;
    store.setIsGenerating(true);
    store.setError(null);
    try {
      const msg = await generateMessage(store.selectedLead.id, store.method);
      store.setGeneratedMessage(msg);
    } catch (e) {
      store.setError(e instanceof Error ? e.message : 'Failed to generate message');
    } finally {
      store.setIsGenerating(false);
    }
  }

  async function handleSendMessage() {
    if (!store.selectedLead || !store.generatedMessage) return;
    store.setIsSending(true);
    store.setError(null);
    try {
      await sendMessage({
        lead_id: store.selectedLead.id,
        method: store.method,
        message: store.generatedMessage.body,
        email: store.method === 'email' ? store.recipientEmail : undefined,
        subject: store.generatedMessage.subject,
      });
    } catch (e) {
      store.setError(e instanceof Error ? e.message : 'Failed to send message');
    } finally {
      store.setIsSending(false);
    }
  }

  return {
    ...store,
    generate: handleGenerateMessage,
    send: handleSendMessage,
  };
}
