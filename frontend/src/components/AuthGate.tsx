"use client";

import { FormEvent, useState } from "react";
import { KanbanBoard } from "@/components/KanbanBoard";

const VALID_USERNAME = "user";
const VALID_PASSWORD = "password";

export const AuthGate = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setIsSignedIn(true);
      setUsername("");
      setPassword("");
      setError("");
      return;
    }

    setError("Use username user and password password.");
  };

  if (isSignedIn) {
    return <KanbanBoard onLogout={() => setIsSignedIn(false)} />;
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute left-0 top-0 h-[420px] w-[420px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,_rgba(32,157,215,0.25)_0%,_rgba(32,157,215,0.05)_55%,_transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[520px] w-[520px] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,_rgba(117,57,145,0.18)_0%,_rgba(117,57,145,0.05)_55%,_transparent_75%)]" />

      <section className="relative w-full max-w-md rounded-[32px] border border-[var(--stroke)] bg-white/85 p-8 shadow-[var(--shadow)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--gray-text)]">
          Project Management MVP
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-[var(--navy-dark)]">
          Sign in
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--gray-text)]">
          Use the local MVP credentials to open your Kanban board.
        </p>

        <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--navy-dark)]">
            Username
            <input
              className="rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-base font-medium outline-none transition focus:border-[var(--primary-blue)] focus:ring-4 focus:ring-[rgba(32,157,215,0.12)]"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--navy-dark)]">
            Password
            <input
              className="rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-base font-medium outline-none transition focus:border-[var(--primary-blue)] focus:ring-4 focus:ring-[rgba(32,157,215,0.12)]"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <button
            className="rounded-2xl bg-[var(--secondary-purple)] px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[rgba(117,57,145,0.18)]"
            type="submit"
          >
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
};
