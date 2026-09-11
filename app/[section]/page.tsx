"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const sections = {
  orders: {
    title: "Bestellungen",
    description: "Offene Bestellungen, Status und Zahlungen zentral verwalten.",
    actions: ["Neue Bestellung", "Offene Bestellungen anzeigen"],
  },
  inventory: {
    title: "Lager",
    description: "Bestände, Mindestmengen und Lagerbewegungen nachvollziehen.",
    actions: ["Lagerbewegung erfassen", "Nachbestellung vorbereiten"],
  },
  staff: {
    title: "Personal",
    description: "Schichten und Anwesenheit des Teams organisieren.",
    actions: ["Schicht anlegen", "Teamübersicht öffnen"],
  },
  finance: {
    title: "Finanzen",
    description: "Umsatz, Zahlungen und Ausgaben des Restaurants auswerten.",
    actions: ["Ausgabe erfassen", "Tagesabschluss öffnen"],
  },
} as const;

export default function SectionPage() {
  const params = useParams<{ section: string }>();
  const section = params.section;
  const content = sections[section as keyof typeof sections];
  const [recordCount, setRecordCount] = useState<number | null>(null);
  const [records, setRecords] = useState<Array<Record<string, unknown>>>([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const load = async () => {
      const dashboard = await fetch("/api/dashboard");
      if (!dashboard.ok) return;
      const { data } = await dashboard.json() as { data: { user: { restaurantId: string } } };
      const endpoint = section === "orders" ? "orders" : section === "inventory" ? "stock-movements" : section === "staff" ? "staff" : section === "finance" ? "expenses" : null;
      if (!endpoint) return;
      const response = await fetch(`/api/${endpoint}?restaurantId=${encodeURIComponent(data.user.restaurantId)}`);
      if (response.ok) {
        const body = await response.json() as { data: Array<Record<string, unknown>> };
        setRecords(body.data);
        setRecordCount(body.data.length);
      }
    };
    void load();
  }, [section]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const endpoint = section === "staff" ? "staff" : "expenses";
    const payload = section === "staff"
      ? { userId: form.get("userId"), position: form.get("position"), hourlyRateCents: Number(form.get("hourlyRateCents")) }
      : { category: form.get("category"), amountCents: Math.round(Number(form.get("amount")) * 100), description: form.get("description") };
    const response = await fetch(`/api/${endpoint}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setMessage("Speichern fehlgeschlagen.");
      return;
    }
    setMessage("Gespeichert.");
    setShowForm(false);
    const refreshed = await fetch(`/api/${endpoint}`);
    if (refreshed.ok) {
      const body = await refreshed.json() as { data: Array<Record<string, unknown>> };
      setRecords(body.data);
      setRecordCount(body.data.length);
    }
  }

  if (!content) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f3ef] p-6 text-[#242522]">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold">Bereich nicht gefunden</h1>
          <Link className="mt-4 inline-block text-sm font-semibold text-[#2e715d]" href="/">
            Zur Übersicht
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f3ef] p-5 text-[#242522] md:p-10">
      <div className="mx-auto max-w-4xl">
        <Link className="text-sm font-semibold text-[#2e715d]" href="/">
          ← Übersicht
        </Link>
        <section className="mt-6 rounded-2xl border border-[#e2ded4] bg-white p-6 md:p-10">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a5a69f]">ServiceFlow</p>
          <h1 className="mt-2 text-3xl font-bold">{content.title}</h1>
          <p className="mt-3 max-w-xl text-sm text-[#777870]">{content.description}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {content.actions.map((action) => (
              <button
                key={action}
                onClick={() => (section === "staff" || section === "finance") && setShowForm(true)}
                className="rounded-xl border border-[#ddd9cf] px-4 py-3 text-left text-sm font-semibold transition hover:bg-[#faf9f6]"
              >
                {action}
              </button>
            ))}
          </div>
          {showForm && (section === "staff" || section === "finance") && (
            <form onSubmit={submit} className="mt-5 grid gap-3 rounded-xl border border-[#ddd9cf] p-4 sm:grid-cols-2">
              {section === "staff" ? (
                <>
                  <input name="userId" required placeholder="Benutzer-ID" className="rounded-lg border border-[#ddd9cf] px-3 py-2 text-sm" />
                  <input name="position" required placeholder="Position" className="rounded-lg border border-[#ddd9cf] px-3 py-2 text-sm" />
                  <input name="hourlyRateCents" required type="number" min="0" placeholder="Stundensatz in Cent" className="rounded-lg border border-[#ddd9cf] px-3 py-2 text-sm" />
                </>
              ) : (
                <>
                  <input name="category" required placeholder="Kategorie" className="rounded-lg border border-[#ddd9cf] px-3 py-2 text-sm" />
                  <input name="amount" required type="number" min="0" step="0.01" placeholder="Betrag in EUR" className="rounded-lg border border-[#ddd9cf] px-3 py-2 text-sm" />
                  <input name="description" placeholder="Beschreibung" className="rounded-lg border border-[#ddd9cf] px-3 py-2 text-sm sm:col-span-2" />
                </>
              )}
              <button className="rounded-lg bg-[#183d32] px-3 py-2 text-sm font-semibold text-white">Speichern</button>
            </form>
          )}
          {message && <p className="mt-3 text-sm text-[#2e715d]">{message}</p>}
          <div className="mt-8 rounded-xl bg-[#faf9f6] p-5 text-sm text-[#777870]">
            {recordCount === null
              ? "Daten werden geladen ..."
              : `${recordCount} Datensätze aus der D1-Datenbank geladen.`}
          </div>
          {records.length > 0 && (
            <div className="mt-4 space-y-2">
              {records.slice(0, 8).map((record, index) => (
                <div key={String(record.id ?? index)} className="flex justify-between rounded-lg border border-[#eeeae1] px-3 py-2 text-xs">
                  <span>{String(record.name ?? record.category ?? record.status ?? record.id)}</span>
                  <span className="text-[#777870]">{String(record.amountCents ?? record.totalCents ?? record.position ?? "")}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
