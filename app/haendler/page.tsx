'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Merchant = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  vatId: string;
  city: string | null;
  country: string | null;
  status:
    | 'neu'
    | 'in_bearbeitung'
    | 'angelegt'
    | 'aktiv'
    | 'gesperrt'
    | 'obsolet';
  createdAt: string;
};

const statusOptions = [
  { value: 'neu', label: 'Neu' },
  { value: 'in_bearbeitung', label: 'In Bearbeitung' },
  { value: 'angelegt', label: 'Angelegt' },
  { value: 'aktiv', label: 'Aktiv' },
  { value: 'gesperrt', label: 'Gesperrt' },
  { value: 'obsolet', label: 'Obsolet' },
] as const;

const statusTone: Record<Merchant['status'], string> = {
  neu: 'status-blue',
  in_bearbeitung: 'status-amber',
  angelegt: 'status-gray',
  aktiv: 'status-green',
  gesperrt: 'status-amber',
  obsolet: 'status-gray',
};

export default function HaendlerPage() {
  const [merchants, setMerchants] = useState<Merchant[] | null>(null);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch('/api/merchants');
    if (response.status === 401) {
      setError('Bitte melde dich an, um Händler-Registrierungen zu sehen.');
      return;
    }
    if (response.ok) {
      const body = (await response.json()) as { data: Merchant[] };
      setMerchants(body.data);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function updateStatus(id: string, status: string) {
    const response = await fetch(`/api/merchants/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (response.ok) void load();
  }

  return (
    <main className="min-h-screen bg-[#f4f3ef] p-5 text-[#242522] md:p-10">
      <div className="mx-auto max-w-5xl">
        <Link className="text-sm font-semibold text-[#2e715d]" href="/">
          ← Übersicht
        </Link>
        <section className="mt-6 rounded-2xl border border-[#e2ded4] bg-white p-6 md:p-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a5a69f]">
                ServiceFlow
              </p>
              <h1 className="mt-2 text-3xl font-bold">Händler</h1>
              <p className="mt-3 max-w-xl text-sm text-[#777870]">
                Registrierte Händler und deren Status verwalten.
              </p>
            </div>
            <Link
              href="/haendler/registrieren"
              className="rounded-xl bg-[#183d32] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Neue Registrierung
            </Link>
          </div>

          {error && <p className="mt-6 text-sm text-[#c45c44]">{error}</p>}

          {merchants === null && !error && (
            <p className="mt-8 text-sm text-[#777870]">
              Daten werden geladen …
            </p>
          )}

          {merchants !== null && merchants.length === 0 && (
            <p className="mt-8 text-sm text-[#777870]">
              Noch keine Registrierungen vorhanden.
            </p>
          )}

          {merchants !== null && merchants.length > 0 && (
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead className="border-y border-[#eeeae1] bg-[#faf9f6] text-[10px] uppercase tracking-wider text-[#9a9b95]">
                  <tr>
                    {[
                      'Firma',
                      'Ansprechpartner',
                      'E-Mail',
                      'USt-IdNr.',
                      'Ort',
                      'Status',
                    ].map((x) => (
                      <th key={x} className="px-4 py-3 font-semibold">
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {merchants.map((merchant) => (
                    <tr
                      key={merchant.id}
                      className="border-b border-[#f0ede6] text-xs last:border-0"
                    >
                      <td className="px-4 py-4 font-bold">
                        {merchant.companyName}
                      </td>
                      <td className="px-4 py-4">{merchant.contactName}</td>
                      <td className="px-4 py-4 text-[#777870]">
                        {merchant.email}
                      </td>
                      <td className="px-4 py-4">{merchant.vatId}</td>
                      <td className="px-4 py-4">
                        {[merchant.city, merchant.country]
                          .filter(Boolean)
                          .join(', ') || '—'}
                      </td>
                      <td className="px-4 py-4">
                        <select
                          aria-label={`Status für ${merchant.companyName}`}
                          value={merchant.status}
                          onChange={(event) =>
                            updateStatus(merchant.id, event.target.value)
                          }
                          className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold ${statusTone[merchant.status]}`}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
