import { fetchBoard, saveBoard, sendChatMessage } from "@/lib/api";
import { initialData } from "@/lib/kanban";

describe("board API client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads the board", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => initialData,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchBoard()).resolves.toEqual(initialData);
    expect(fetchMock).toHaveBeenCalledWith("/api/board");
  });

  it("saves the board", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => initialData,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(saveBoard(initialData)).resolves.toEqual(initialData);
    expect(fetchMock).toHaveBeenCalledWith("/api/board", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(initialData),
    });
  });

  it("sends a chat message", async () => {
    const responseBody = { message: "Updated.", board: initialData };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseBody,
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      sendChatMessage("Add a card", [{ role: "user", content: "Hi" }])
    ).resolves.toEqual(responseBody);
    expect(fetchMock).toHaveBeenCalledWith("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Add a card",
        history: [{ role: "user", content: "Hi" }],
      }),
    });
  });
});
