import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthGate } from "@/components/AuthGate";
import { initialData } from "@/lib/kanban";

const mockBoardApi = () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => initialData,
    }))
  );
};

const signIn = async () => {
  await userEvent.type(screen.getByLabelText(/username/i), "user");
  await userEvent.type(screen.getByLabelText(/password/i), "password");
  await userEvent.click(screen.getByRole("button", { name: /^sign in$/i }));
};

describe("AuthGate", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("hides the board before login", () => {
    render(<AuthGate />);
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /kanban studio/i })
    ).not.toBeInTheDocument();
  });

  it("shows an error for invalid credentials", async () => {
    render(<AuthGate />);
    await userEvent.type(screen.getByLabelText(/username/i), "bad");
    await userEvent.type(screen.getByLabelText(/password/i), "credentials");
    await userEvent.click(screen.getByRole("button", { name: /^sign in$/i }));
    expect(
      screen.getByText(/use username user and password password/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /kanban studio/i })
    ).not.toBeInTheDocument();
  });

  it("shows the board after successful login", async () => {
    mockBoardApi();
    render(<AuthGate />);
    await signIn();
    expect(
      await screen.findByRole("heading", { name: /kanban studio/i })
    ).toBeInTheDocument();
    expect(screen.getAllByTestId(/column-/i)).toHaveLength(5);
  });

  it("logs out to the login screen", async () => {
    mockBoardApi();
    render(<AuthGate />);
    await signIn();
    await screen.findByRole("heading", { name: /kanban studio/i });
    await userEvent.click(screen.getByRole("button", { name: /logout/i }));
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /kanban studio/i })
    ).not.toBeInTheDocument();
  });
});
