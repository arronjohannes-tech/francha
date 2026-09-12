'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Users,
  WalletCards,
  Utensils,
  Bell,
  Search,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock3,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  Store,
} from 'lucide-react';

const nav = [
  ['Übersicht', LayoutDashboard],
  ['Bestellungen', ClipboardList],
  ['Lager', Package],
  ['Personal', Users],
  ['Finanzen', WalletCards],
  ['Händler', Store],
] as const;
const orders = [
  {
    id: '#1048',
    table: 'Tisch 12',
    items: '2× Pasta · 1× Burrata',
    time: '8 Min.',
    total: '54,80 €',
    status: 'In Zubereitung',
    tone: 'amber',
  },
  {
    id: '#1047',
    table: 'Tisch 4',
    items: '1× Risotto · 2× Wasser',
    time: '12 Min.',
    total: '38,50 €',
    status: 'Bereit',
    tone: 'green',
  },
  {
    id: '#1046',
    table: 'Abholung',
    items: '2× Pizza · 1× Tiramisu',
    time: '18 Min.',
    total: '42,00 €',
    status: 'Neu',
    tone: 'blue',
  },
  {
    id: '#1045',
    table: 'Tisch 9',
    items: '3× Menü · 1× Wein',
    time: '24 Min.',
    total: '112,40 €',
    status: 'Serviert',
    tone: 'gray',
  },
];
const stock = [
  { name: 'Burrata', amount: '4 Stk.', percent: 18, color: 'bg-[#ef6a45]' },
  {
    name: 'San-Marzano Tomaten',
    amount: '6 kg',
    percent: 29,
    color: 'bg-[#e8a848]',
  },
  {
    name: 'Olivenöl Extra Vergine',
    amount: '3,2 l',
    percent: 35,
    color: 'bg-[#e8a848]',
  },
];

export default function Home() {
  const router = useRouter();
  const [active, setActive] = useState('Übersicht');
  const [mobile, setMobile] = useState(false);
  const [range, setRange] = useState('Heute');
  const [live, setLive] = useState<{
    user: { name: string };
    orders: { count: number; revenueCents: number };
  }>();
  useEffect(() => {
    fetch('/api/dashboard').then(async (response) => {
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      if (response.ok) {
        const body = (await response.json()) as {
          data: {
            user: { name: string };
            orders: { count: number; revenueCents: number };
          };
        };
        setLive(body.data);
      }
    });
  }, [router]);
  return (
    <main className="min-h-screen bg-[#f4f3ef] text-[#242522]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[248px] border-r border-[#e4e1d9] bg-[#fbfaf7] p-5 transition-transform lg:translate-x-0 ${mobile ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-9 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#183d32] text-white">
              <Utensils size={19} />
            </div>
            <div>
              <div className="text-[17px] font-bold tracking-tight">
                ServiceFlow
              </div>
              <div className="text-xs text-[#8b8d87]">Restaurant ERP</div>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setMobile(false)}>
            <X size={20} />
          </button>
        </div>
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#a5a69f]">
          Arbeitsbereich
        </p>
        <nav className="space-y-1">
          {nav.map(([label, Icon]) => (
            <button
              key={label}
              onClick={() => {
                setActive(label);
                setMobile(false);
                if (label !== 'Übersicht')
                  router.push(`/${sectionPath(label)}`);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active === label ? 'bg-[#e7eee9] text-[#183d32]' : 'text-[#676962] hover:bg-[#f0eee8]'}`}
            >
              <Icon size={18} />
              {label}
              {label === 'Bestellungen' && (
                <span className="ml-auto rounded-full bg-[#183d32] px-2 py-0.5 text-[10px] text-white">
                  6
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-[#183d32] p-4 text-white">
          <div className="mb-3 flex items-center gap-2 text-xs text-[#a9c2b8]">
            <span className="h-2 w-2 rounded-full bg-[#7fd6a5]" />
            System online
          </div>
          <div className="text-sm font-semibold">Osteria Verde</div>
          <div className="mt-1 text-xs text-[#a9c2b8]">
            Berlin · Prenzlauer Berg
          </div>
          <button className="mt-4 flex w-full items-center justify-between border-t border-white/10 pt-3 text-xs">
            Restaurant wechseln <ChevronDown size={14} />
          </button>
        </div>
      </aside>
      <section className="lg:pl-[248px]">
        <header className="flex h-[74px] items-center justify-between border-b border-[#e4e1d9] bg-[#fbfaf7]/95 px-5 md:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setMobile(true)}>
              <Menu />
            </button>
            <div>
              <h1 className="text-lg font-bold">{active}</h1>
              <p className="hidden text-xs text-[#8b8d87] sm:block">
                Mittwoch, 26. August 2026
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden h-9 items-center gap-2 rounded-xl border border-[#ddd9cf] bg-white px-3 text-xs text-[#777870] md:flex">
              <Search size={15} />
              Suchen{' '}
              <span className="rounded bg-[#f1efe9] px-1.5 py-0.5">⌘ K</span>
            </button>
            <button className="relative grid h-9 w-9 place-items-center rounded-xl border border-[#ddd9cf] bg-white">
              <Bell size={16} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#e15b3f]" />
            </button>
            <div className="ml-1 grid h-9 w-9 place-items-center rounded-full bg-[#d8b88c] text-xs font-bold text-[#49341e]">
              LM
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] p-5 md:p-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1 text-sm text-[#777870]">
                Guten Morgen, {live?.user?.name ?? 'Lena'}
              </p>
              <h2 className="text-2xl font-bold tracking-[-.03em] md:text-[30px]">
                So läuft dein Restaurant heute.
              </h2>
            </div>
            <div className="flex rounded-xl border border-[#ddd9cf] bg-white p-1">
              {['Heute', 'Woche', 'Monat'].map((x) => (
                <button
                  key={x}
                  onClick={() => setRange(x)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${range === x ? 'bg-[#183d32] text-white' : 'text-[#777870]'}`}
                >
                  {x}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              title="Umsatz heute"
              value={
                live
                  ? `${(live.orders.revenueCents / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`
                  : '—'
              }
              delta="Live"
              positive
              icon="€"
              sub="aus D1"
            />
            <Metric
              title="Bestellungen"
              value={live ? String(live.orders.count) : '—'}
              delta="Live"
              positive
              icon="↗"
              sub="heute"
            />
            <Metric
              title="Auslastung"
              value="—"
              delta="Keine Daten"
              icon="◫"
              sub="Tische folgen"
            />
            <Metric
              title="Personalkosten"
              value="—"
              delta="Keine Daten"
              icon="◇"
              sub="Zeiterfassung folgt"
            />
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-[#e2ded4] bg-white p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Umsatzverlauf</h3>
                    <p className="text-xs text-[#92938d]">
                      Stündlich · {range}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#777870]">
                    <span className="h-2 w-2 rounded-full bg-[#2e715d]" />
                    Heute{' '}
                    <span className="ml-2 h-2 w-2 rounded-full bg-[#d7d4cc]" />
                    Vorwoche
                  </div>
                </div>
                <div className="relative h-52 overflow-hidden rounded-xl bg-[#faf9f6] p-4">
                  <div className="absolute inset-x-4 top-1/4 border-t border-dashed border-[#dedbd3]" />
                  <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-[#dedbd3]" />
                  <div className="absolute inset-x-4 top-3/4 border-t border-dashed border-[#dedbd3]" />
                  <svg
                    viewBox="0 0 700 180"
                    className="relative h-full w-full"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0"
                          stopColor="#3c816b"
                          stopOpacity=".28"
                        />
                        <stop offset="1" stopColor="#3c816b" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 152 C70 146 75 130 130 132 S205 110 250 119 S330 75 380 82 S455 42 505 58 S590 26 700 20 L700 180 L0 180Z"
                      fill="url(#fill)"
                    />
                    <path
                      d="M0 152 C70 146 75 130 130 132 S205 110 250 119 S330 75 380 82 S455 42 505 58 S590 26 700 20"
                      fill="none"
                      stroke="#2e715d"
                      strokeWidth="3"
                    />
                    <path
                      d="M0 160 C90 153 120 142 180 145 S280 116 340 124 S460 88 520 96 S620 72 700 65"
                      fill="none"
                      stroke="#cfcbc1"
                      strokeDasharray="7 6"
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="absolute inset-x-4 bottom-2 flex justify-between text-[10px] text-[#999a94]">
                    <span>11:00</span>
                    <span>13:00</span>
                    <span>15:00</span>
                    <span>17:00</span>
                    <span>19:00</span>
                    <span>21:00</span>
                  </div>
                </div>
              </section>
              <section className="overflow-hidden rounded-2xl border border-[#e2ded4] bg-white">
                <div className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="font-bold">Live-Bestellungen</h3>
                    <p className="text-xs text-[#92938d]">
                      6 offene Bestellungen
                    </p>
                  </div>
                  <button className="flex items-center gap-1 text-xs font-semibold text-[#2e715d]">
                    Alle anzeigen <ArrowUpRight size={14} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[660px] text-left">
                    <thead className="border-y border-[#eeeae1] bg-[#faf9f6] text-[10px] uppercase tracking-wider text-[#9a9b95]">
                      <tr>
                        {[
                          'Bestellung',
                          'Ort',
                          'Artikel',
                          'Zeit',
                          'Summe',
                          'Status',
                          '',
                        ].map((x) => (
                          <th key={x} className="px-5 py-3 font-semibold">
                            {x}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr
                          key={o.id}
                          className="border-b border-[#f0ede6] text-xs last:border-0"
                        >
                          <td className="px-5 py-4 font-bold">{o.id}</td>
                          <td className="px-5 py-4">{o.table}</td>
                          <td className="px-5 py-4 text-[#777870]">
                            {o.items}
                          </td>
                          <td className="px-5 py-4">
                            <span className="flex items-center gap-1">
                              <Clock3 size={13} />
                              {o.time}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-semibold">{o.total}</td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 font-semibold status-${o.tone}`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td>
                            <MoreHorizontal size={15} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
            <div className="space-y-6">
              <section className="rounded-2xl bg-[#183d32] p-5 text-white">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <p className="text-xs text-[#9fb9af]">Aktuelle Schicht</p>
                    <h3 className="mt-1 text-lg font-bold">Abendservice</h3>
                  </div>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-[#bcd0c8]">
                    17:00 – 23:30
                  </span>
                </div>
                <div className="mb-5 grid grid-cols-3 gap-3">
                  <Mini value="12" label="Im Dienst" />
                  <Mini value="2" label="Pause" />
                  <Mini value="0" label="Fehlend" />
                </div>
                <div className="flex -space-x-2">
                  {['LK', 'MB', 'AS', 'JF', 'NW'].map((x, i) => (
                    <span
                      key={x}
                      className={`grid h-8 w-8 place-items-center rounded-full border-2 border-[#183d32] text-[9px] font-bold ${['bg-[#e4b879] text-[#3c2c16]', 'bg-[#90b8a8]', 'bg-[#bd8f82]', 'bg-[#849bae]', 'bg-[#d3c29f] text-[#3c2c16]'][i]}`}
                    >
                      {x}
                    </span>
                  ))}
                  <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#183d32] bg-white/10 text-[9px]">
                    +7
                  </span>
                </div>
              </section>
              <section className="rounded-2xl border border-[#e2ded4] bg-white p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Lagerwarnungen</h3>
                    <p className="text-xs text-[#92938d]">
                      3 Artikel unter Mindestbestand
                    </p>
                  </div>
                  <AlertTriangle className="text-[#d88336]" size={19} />
                </div>
                <div className="space-y-5">
                  {stock.map((s) => (
                    <div key={s.name}>
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="font-semibold">{s.name}</span>
                        <span className="text-[#777870]">{s.amount}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#eeeae2]">
                        <div
                          className={`h-full rounded-full ${s.color}`}
                          style={{ width: `${s.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-5 w-full rounded-xl border border-[#ddd9cf] py-2.5 text-xs font-semibold">
                  Bestellung vorbereiten
                </button>
              </section>
              <section className="rounded-2xl border border-[#e2ded4] bg-white p-5">
                <h3 className="mb-4 font-bold">Nächste Aufgaben</h3>
                <div className="space-y-3">
                  <Task done label="Mittagsabrechnung prüfen" time="14:30" />
                  <Task label="Lieferung Frischemarkt" time="15:15" />
                  <Task label="Team-Briefing" time="16:45" />
                </div>
                <button className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#2e715d]">
                  <Plus size={14} />
                  Aufgabe hinzufügen
                </button>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
function Metric({
  title,
  value,
  delta,
  positive,
  icon,
  sub,
}: {
  title: string;
  value: string;
  delta: string;
  positive?: boolean;
  icon: string;
  sub: string;
}) {
  return (
    <article className="rounded-2xl border border-[#e2ded4] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium text-[#777870]">{title}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f1f4f0] text-sm font-bold text-[#2e715d]">
          {icon}
        </span>
      </div>
      <div className="text-[25px] font-bold tracking-tight">{value}</div>
      <div className="mt-2 flex items-center gap-2 text-[10px]">
        <span
          className={`flex items-center gap-0.5 font-bold ${positive ? 'text-[#2e715d]' : 'text-[#c45c44]'}`}
        >
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{' '}
          {delta}
        </span>
        <span className="text-[#999a94]">{sub}</span>
      </div>
    </article>
  );
}
function Mini({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[10px] text-[#9fb9af]">{label}</div>
    </div>
  );
}
function Task({
  label,
  time,
  done,
}: {
  label: string;
  time: string;
  done?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#faf9f6] p-3">
      <span
        className={`grid h-6 w-6 place-items-center rounded-full ${done ? 'bg-[#dceae4] text-[#2e715d]' : 'border border-[#d8d4cb] text-transparent'}`}
      >
        <CheckCircle2 size={14} />
      </span>
      <span
        className={`flex-1 text-xs font-medium ${done ? 'text-[#999a94] line-through' : ''}`}
      >
        {label}
      </span>
      <span className="text-[10px] text-[#999a94]">{time}</span>
    </div>
  );
}
function sectionPath(label: string) {
  return (
    {
      Bestellungen: 'orders',
      Lager: 'inventory',
      Personal: 'staff',
      Finanzen: 'finance',
      Händler: 'haendler',
    }[
      label as 'Bestellungen' | 'Lager' | 'Personal' | 'Finanzen' | 'Händler'
    ] ?? 'overview'
  );
}
