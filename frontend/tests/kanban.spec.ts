import { expect, test } from "@playwright/test";

const initialBoard = {
  columns: [
    { id: "col-backlog", title: "Backlog", cardIds: ["card-1", "card-2"] },
    { id: "col-discovery", title: "Discovery", cardIds: ["card-3"] },
    { id: "col-progress", title: "In Progress", cardIds: ["card-4", "card-5"] },
    { id: "col-review", title: "Review", cardIds: ["card-6"] },
    { id: "col-done", title: "Done", cardIds: ["card-7", "card-8"] },
  ],
  cards: {
    "card-1": { id: "card-1", title: "Align roadmap themes", details: "Draft quarterly themes with impact statements and metrics." },
    "card-2": { id: "card-2", title: "Gather customer signals", details: "Review support tags, sales notes, and churn feedback." },
    "card-3": { id: "card-3", title: "Prototype analytics view", details: "Sketch initial dashboard layout and key drill-downs." },
    "card-4": { id: "card-4", title: "Refine status language", details: "Standardize column labels and tone across the board." },
    "card-5": { id: "card-5", title: "Design card layout", details: "Add hierarchy and spacing for scanning dense lists." },
    "card-6": { id: "card-6", title: "QA micro-interactions", details: "Verify hover, focus, and loading states." },
    "card-7": { id: "card-7", title: "Ship marketing page", details: "Final copy approved and asset pack delivered." },
    "card-8": { id: "card-8", title: "Close onboarding sprint", details: "Document release notes and share internally." },
  },
};

const mockBoardApi = async (page: import("@playwright/test").Page) => {
  let board = JSON.parse(JSON.stringify(initialBoard));
  await page.route("/api/board", async (route) => {
    if (route.request().method() === "PUT") {
      board = route.request().postDataJSON();
    }
    await route.fulfill({ json: board });
  });
};

const mockChatApi = async (page: import("@playwright/test").Page) => {
  await page.route("/api/chat", async (route) => {
    const nextBoard = JSON.parse(JSON.stringify(initialBoard));
    nextBoard.cards["card-ai"] = {
      id: "card-ai",
      title: "AI launch checklist",
      details: "Created by AI.",
    };
    nextBoard.columns[0].cardIds.push("card-ai");
    await route.fulfill({
      json: { message: "Created an AI launch checklist card.", board: nextBoard },
    });
  });
};

const signIn = async (page: import("@playwright/test").Page) => {
  await page.getByLabel("Username").fill("user");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: /^sign in$/i }).click();
};

test("requires login before showing the board", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Kanban Studio" })
  ).not.toBeVisible();
});

test("rejects invalid login", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Username").fill("bad");
  await page.getByLabel("Password").fill("credentials");
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await expect(
    page.getByText("Use username user and password password.")
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Kanban Studio" })
  ).not.toBeVisible();
});

test("loads the kanban board", async ({ page }) => {
  await mockBoardApi(page);
  await page.goto("/");
  await signIn(page);
  await expect(page.getByRole("heading", { name: "Kanban Studio" })).toBeVisible();
  await expect(page.locator('[data-testid^="column-"]')).toHaveCount(5);
});

test("adds a card to a column", async ({ page }) => {
  await mockBoardApi(page);
  await page.goto("/");
  await signIn(page);
  const firstColumn = page.locator('[data-testid^="column-"]').first();
  await firstColumn.getByRole("button", { name: /add a card/i }).click();
  await firstColumn.getByPlaceholder("Card title").fill("Playwright card");
  await firstColumn.getByPlaceholder("Details").fill("Added via e2e.");
  await firstColumn.getByRole("button", { name: /add card/i }).click();
  await expect(firstColumn.getByLabel("Title for Playwright card")).toBeVisible();
});

test("moves a card between columns", async ({ page }) => {
  await mockBoardApi(page);
  await page.goto("/");
  await signIn(page);
  const card = page.getByTestId("card-card-1");
  const targetColumn = page.getByTestId("column-col-review");
  const cardBox = await card.boundingBox();
  const columnBox = await targetColumn.boundingBox();
  if (!cardBox || !columnBox) {
    throw new Error("Unable to resolve drag coordinates.");
  }

  await page.mouse.move(
    cardBox.x + cardBox.width / 2,
    cardBox.y + cardBox.height / 2
  );
  await page.mouse.down();
  await page.mouse.move(
    columnBox.x + columnBox.width / 2,
    columnBox.y + 120,
    { steps: 12 }
  );
  await page.mouse.up();
  await expect(targetColumn.getByTestId("card-card-1")).toBeVisible();
});

test("logs out from the board", async ({ page }) => {
  await mockBoardApi(page);
  await page.goto("/");
  await signIn(page);
  await page.getByRole("button", { name: /logout/i }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Kanban Studio" })
  ).not.toBeVisible();
});

test("keeps saved board changes after refresh", async ({ page }) => {
  await mockBoardApi(page);
  await page.goto("/");
  await signIn(page);

  const firstColumn = page.locator('[data-testid^="column-"]').first();
  await firstColumn.getByRole("button", { name: /add a card/i }).click();
  await firstColumn.getByPlaceholder("Card title").fill("Persistent card");
  await firstColumn.getByPlaceholder("Details").fill("Saved via API.");
  await firstColumn.getByRole("button", { name: /add card/i }).click();
  await expect(firstColumn.getByLabel("Title for Persistent card")).toBeVisible();

  await page.reload();
  await signIn(page);
  await expect(page.getByLabel("Title for Persistent card")).toBeVisible();
});

test("updates the board from AI chat", async ({ page }) => {
  await mockBoardApi(page);
  await mockChatApi(page);
  await page.goto("/");
  await signIn(page);

  await page.getByPlaceholder(/ask the ai/i).fill("Create a launch checklist card");
  await page.getByRole("button", { name: /^send$/i }).click();

  await expect(page.getByText("Created an AI launch checklist card.")).toBeVisible();
  await expect(page.getByLabel("Title for AI launch checklist")).toBeVisible();
});
