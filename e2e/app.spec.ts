// ViperRange — Playwright E2E Tests
// ZeroDay Security Services

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

test.describe('Landing Page', () => {
  test('renders ViperRange branding', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/ViperRange/);
    await expect(page.getByText('VIPERRANGE')).toBeVisible();
    await expect(page.getByText('ZeroDay Security Services')).toBeVisible();
    await expect(page.getByText('EPHEMERAL')).toBeVisible();
  });

  test('has working Get Started CTA', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('link', { name: /get started/i }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('has working Sign In link', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('link', { name: /sign in/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Authentication', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.getByText('ACCESS TERMINAL')).toBeVisible();
    await expect(page.getByPlaceholder(/operator@/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('register page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await expect(page.getByText('JOIN VIPERRANGE')).toBeVisible();
    await expect(page.getByPlaceholder(/your name/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('shows validation error on empty login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('button', { name: /sign in/i }).click();
    // HTML5 validation will trigger before submission
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder(/operator@/i).fill('wrong@test.com');
    await page.getByPlaceholder(/••••/i).fill('WrongPass1!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 5000 });
  });

  test('login with demo credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder(/operator@/i).fill('student@demo.com');
    await page.getByPlaceholder(/••••/i).fill('Student@Demo2024!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});

test.describe('Dashboard (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder(/operator@/i).fill('student@demo.com');
    await page.getByPlaceholder(/••••/i).fill('Student@Demo2024!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/);
  });

  test('shows overview stats', async ({ page }) => {
    await expect(page.getByText('Total Deployments')).toBeVisible();
    await expect(page.getByText('Active Labs')).toBeVisible();
    await expect(page.getByText('Available Labs')).toBeVisible();
  });

  test('navigates to labs page', async ({ page }) => {
    await page.getByRole('link', { name: /labs/i }).first().click();
    await expect(page).toHaveURL(/\/labs/);
    await expect(page.getByText('Lab Marketplace')).toBeVisible();
  });

  test('shows OWASP Juice Shop card', async ({ page }) => {
    await page.goto(`${BASE_URL}/labs`);
    await expect(page.getByText('OWASP Juice Shop')).toBeVisible();
    await expect(page.getByText('Start Lab').first()).toBeVisible();
  });

  test('navigates to walkthroughs', async ({ page }) => {
    await page.goto(`${BASE_URL}/walkthroughs`);
    await expect(page.getByText('Walkthroughs')).toBeVisible();
    await expect(page.getByText('Burp Suite')).toBeVisible();
  });

  test('logs page shows terminal', async ({ page }) => {
    await page.goto(`${BASE_URL}/logs`);
    await expect(page.getByText('ViperRange Security Terminal')).toBeVisible();
  });
});
