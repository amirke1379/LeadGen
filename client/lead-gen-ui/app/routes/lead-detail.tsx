import { useParams } from 'react-router';

export function meta() {
  return [{ title: 'LeadHunter — Lead Detail' }];
}

export default function LeadDetail() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Lead Detail</h1>
        <p className="text-sm text-gray-500">Lead #{id}</p>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">
            Full lead info and outreach history will be available in Phase 9.
          </p>
        </div>
      </main>
    </div>
  );
}
