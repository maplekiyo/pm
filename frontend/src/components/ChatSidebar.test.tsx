import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatSidebar } from "@/components/ChatSidebar";
import { initialData } from "@/lib/kanban";

describe("ChatSidebar", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("submits messages and applies board updates", async () => {
    const onBoardUpdated = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ message: "Created the card.", board: initialData }),
      }))
    );

    render(<ChatSidebar onBoardUpdated={onBoardUpdated} />);
    await userEvent.type(
      screen.getByPlaceholderText(/ask the ai/i),
      "Create a launch card"
    );
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(await screen.findByText("Create a launch card")).toBeInTheDocument();
    expect(await screen.findByText("Created the card.")).toBeInTheDocument();
    expect(onBoardUpdated).toHaveBeenCalledWith(initialData);
  });
});
