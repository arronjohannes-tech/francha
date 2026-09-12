'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function HaendlerRegistrierenPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const payload = {
      companyName: form.get('companyName'),
      contactName: form.get('contactName'),
      email: form.get('email'),
      vatId: form.get('vatId'),
      phone: form.get('phone'),
      street: form.get('street'),
      postalCode: form.get('postalCode'),
      city: form.get('city'),
      country: form.get('country'),
      website: form.get('website'),
      notes: form.get('notes'),
    };
    const response = await fetch('/api/merchants', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setError(
        ((await response.json()) as { error?: string }).error ??
          'Registrierung fehlgeschlagen',
      );
      setBusy(false);
      return;
    }
    setDone(true);
    setBusy(false);
  }

  if (done) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f3ef] p-6 text-[#242522]">
        <div className="w-full max-w-md rounded-2xl border border-[#e2ded4] bg-white p-8 text-center">
          <h1 className="text-2xl font-bold">Vielen Dank!</h1>
          <p className="mt-3 text-sm text-[#777870]">
            Ihre Registrierung wurde gespeichert und erhält den Status{' '}
            <strong>„Neu“</strong>. Wir melden uns in Kürze.
          </p>
          <Link
            className="mt-6 inline-block text-sm font-semibold text-[#2e715d]"
            href="/"
          >
            Zur Übersicht
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f3ef] p-6 text-[#242522]">
      <form
        onSubmit={submit}
        className="mx-auto w-full max-w-2xl rounded-2xl border border-[#e2ded4] bg-white p-8"
      >
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a5a69f]">
          ServiceFlow
        </p>
        <h1 className="mt-2 text-2xl font-bold">Händler-Registrierung</h1>
        <p className="mt-2 text-sm text-[#777870]">
          Bitte füllen Sie das Formular aus. Felder mit * sind Pflichtfelder.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Firmenname *" name="companyName" required />
          <Field label="Ansprechpartner *" name="contactName" required />
          <Field label="E-Mail-Adresse *" name="email" type="email" required />
          <Field
            label="Umsatzsteuer-ID (USt-IdNr.) *"
            name="vatId"
            required
            placeholder="z. B. DE123456789"
          />
          <Field label="Telefon" name="phone" />
          <Field label="Webseite" name="website" />
          <Field
            label="Straße und Hausnummer"
            name="street"
            className="sm:col-span-2"
          />
          <Field label="PLZ" name="postalCode" />
          <Field label="Ort" name="city" />
          <Field label="Land" name="country" className="sm:col-span-2" />
          <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
            <span className="font-medium text-[#4a4b46]">Anmerkungen</span>
            <textarea
              name="notes"
              rows={3}
              className="rounded-xl border border-[#ddd9cf] px-4 py-3 text-sm"
            />
          </label>
        </div>

        {error && <p className="mt-4 text-sm text-[#c45c44]">{error}</p>}

        <button
          disabled={busy}
          className="mt-6 w-full rounded-xl bg-[#183d32] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? 'Wird gespeichert ...' : 'Registrierung absenden'}
        </button>

        <Link
          href="/"
          className="mt-4 block text-center text-sm font-semibold text-[#2e715d]"
        >
          Zurück zur Übersicht
        </Link>
      </form>
    </main>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className ?? ''}`}>
      <span className="font-medium text-[#4a4b46]">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="rounded-xl border border-[#ddd9cf] px-4 py-3 text-sm"
      />
    </label>
  );
}
