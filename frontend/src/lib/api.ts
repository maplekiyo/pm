import type { BoardData } from "@/lib/kanban";

const BOARD_API = "/api/board";
const CHAT_API = "/api/chat";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatResponse = {
  message: string;
  board: BoardData | null;
};

export const fetchBoard = async (): Promise<BoardData> => {
  const response = await fetch(BOARD_API);
  if (!response.ok) {
    throw new Error("Unable to load board.");
  }
  return response.json();
};

export const saveBoard = async (board: BoardData): Promise<BoardData> => {
  const response = await fetch(BOARD_API, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(board),
  });

  if (!response.ok) {
    throw new Error("Unable to save board.");
  }

  return response.json();
};

export const sendChatMessage = async (
  message: string,
  history: ChatMessage[]
): Promise<ChatResponse> => {
  const response = await fetch(CHAT_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    throw new Error("Unable to send chat message.");
  }

  return response.json();
};
