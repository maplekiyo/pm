import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KanbanBoard } from "@/components/KanbanBoard";
import { initialData } from "@/lib/kanban";

const getFirstColumn = () => screen.getAllByTestId(/column-/i)[0];
const boardJson = () => JSON.parse(JSON.stringify(initialData));

const mockBoardApi = () => {
  const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => ({
    ok: true,
    json: async () => (options?.method === "PUT" ? JSON.parse(options.body as string) : boardJson()),
  }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

describe("KanbanBoard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders five columns from the API", async () => {
    mockBoardApi();
    render(<KanbanBoard />);
    expect(screen.getByText(/loading board/i)).toBeInTheDocument();
    await screen.findByRole("heading", { name: /kanban studio/i });
    expect(screen.getAllByTestId(/column-/i)).toHaveLength(5);
  });

  it("renames a column", async () => {
    const fetchMock = mockBoardApi();
    render(<KanbanBoard />);
    await screen.findByRole("heading", { name: /kanban studio/i });
    const column = getFirstColumn();
    const input = within(column).getByLabelText("Column title");
    await userEvent.clear(input);
    await userEvent.type(input, "New Name");
    expect(input).toHaveValue("New Name");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/board", expect.objectContaining({ method: "PUT" })));
  });

  it("adds and removes a card", async () => {
    const fetchMock = mockBoardApi();
    render(<KanbanBoard />);
    await screen.findByRole("heading", { name: /kanban studio/i });
    const column = getFirstColumn();
    const addButton = within(column).getByRole("button", {
      name: /add a card/i,
    });
    await userEvent.click(addButton);

    const titleInput = within(column).getByPlaceholderText(/card title/i);
    await userEvent.type(titleInput, "New card");
    const detailsInput = within(column).getByPlaceholderText(/details/i);
    await userEvent.type(detailsInput, "Notes");

    await userEvent.click(within(column).getByRole("button", { name: /add card/i }));

    expect(within(column).getByDisplayValue("New card")).toBeInTheDocument();

    const deleteButton = within(column).getByRole("button", {
      name: /delete new card/i,
    });
    await userEvent.click(deleteButton);

    expect(within(column).queryByDisplayValue("New card")).not.toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/board", expect.objectContaining({ method: "PUT" })));
  });

  it("edits a card", async () => {
    const fetchMock = mockBoardApi();
    render(<KanbanBoard />);
    await screen.findByRole("heading", { name: /kanban studio/i });

    const titleInput = screen.getByLabelText(/title for align roadmap themes/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Updated card");

    expect(titleInput).toHaveValue("Updated card");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/board", expect.objectContaining({ method: "PUT" })));
  });
});
