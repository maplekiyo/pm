"use client";

import { FormEvent, useState } from "react";
import { sendChatMessage, type ChatMessage } from "@/lib/api";
import type { BoardData } from "@/lib/kanban";

type ChatSidebarProps = {
  onBoardUpdated: (board: BoardData) => void;
};

export const ChatSidebar = ({ onBoardUpdated }: ChatSidebarProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextInput = input.trim();
    if (!nextInput || isSending) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: nextInput },
    ];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    setError("");

    try {
      const response = await sendChatMessage(nextInput, messages);
      setMessages([
        ...nextMessages,
        { role: "assistant", content: response.message },
      ]);
      if (response.board) {
        onBoardUpdated(response.board);
      }
    } catch {
      setError("Unable to reach AI chat.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <aside className="rounded-[32px] border border-[var(--stroke)] bg-white/85 p-5 shadow-[var(--shadow)] backdrop-blur lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--gray-text)]">
          AI Assistant
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--navy-dark)]">
          Board chat
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--gray-text)]">
          Ask for summaries or card updates. Valid board changes are saved automatically.
        </p>
      </div>

      <div className="mt-5 flex max-h-[55vh] flex-col gap-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="rounded-2xl bg-[var(--surface)] px-4 py-3 text-sm text-[var(--gray-text)]">
            Try: Create a card in Backlog for preparing the launch checklist.
          </p>
        ) : null}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === "user"
                ? "self-end rounded-2xl bg-[var(--primary-blue)] px-4 py-3 text-sm font-medium text-white"
                : "self-start rounded-2xl bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--navy-dark)]"
            }
          >
            {message.content}
          </div>
        ))}
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <form className="mt-5 flex flex-col gap-3" onSubmit={handleSubmit}>
        <textarea
          className="min-h-28 resize-none rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary-blue)] focus:ring-4 focus:ring-[rgba(32,157,215,0.12)]"
          placeholder="Ask the AI to inspect or update the board"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <button
          className="rounded-2xl bg-[var(--secondary-purple)] px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSending}
          type="submit"
        >
          {isSending ? "Sending" : "Send"}
        </button>
      </form>
    </aside>
  );
};
