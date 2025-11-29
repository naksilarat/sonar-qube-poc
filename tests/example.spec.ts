import { test, expect } from "@playwright/test";

// PASSED TEST
test("has title", async ({ page }) => {
  await page.goto("https://playwright.dev/");
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

// PASSED TEST
test.skip("get started link", async ({ page }) => { 
  await page.goto("https://playwright.dev/");
  // Click the get started link.
  await page.getByRole("link", { name: "Get started" }).click();
  // Expects page to have a heading with the name of Installation.
  await expect(
    page.getByRole("heading", { name: "Installation" })
  ).toBeVisible();
});

// FAILED TEST
test.skip("intentional failure test", async () => {
  // This test will always fail to demonstrate failure reporting
  expect(true).toBe(true);
});

// SKIPPED TEST
test.skip("skipped test example", async ({ page }) => {
  // This test is skipped and won't run
  await page.goto("https://example.com");
  expect(true).toBe(true);
});

// ANOTHER PASSED TEST
test("simple assertion test", async () => {
  // Simple test that will pass
  expect(2 + 2).toBe(4);
  expect("hello").toContain("hello");
});

test("simple assertion test 01", async () => {
  // Simple test that will pass
  expect(3 + 3).toBe(6);
});
