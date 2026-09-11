"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    if (!response.ok) {
      setError((await response.json() as { error?: string }).error ?? "Anmeldung fehlgeschlagen");
      setBusy(false);
      return;
    }
    router.push("/");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f3ef] p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-[#e2ded4] bg-white p-8">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a5a69f]">ServiceFlow</p>
        <h1 className="mt-2 text-2xl font-bold">Anmelden</h1>
        <div className="mt-6 space-y-4">
          <input name="email" type="email" required placeholder="E-Mail" className="w-full rounded-xl border border-[#ddd9cf] px-4 py-3 text-sm" />
          <input name="password" type="password" required placeholder="Passwort" className="w-full rounded-xl border border-[#ddd9cf] px-4 py-3 text-sm" />
        </div>
        {error && <p className="mt-4 text-sm text-[#c45c44]">{error}</p>}
        <button disabled={busy} className="mt-6 w-full rounded-xl bg-[#183d32] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "Anmelden ..." : "Anmelden"}
        </button>
      </form>
    </main>
  );
}
