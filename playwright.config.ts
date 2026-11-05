import { defineConfig, devices } from '@playwright/test';

// Konfiguracja Playwright. Dokumentacja: https://playwright.dev/docs/test-configuration
export default defineConfig({
  // Gdzie są testy.
  testDir: './tests',
  // Testy z różnych plików biegną równolegle.
  fullyParallel: true,
  // Na serwerze CI zabroń zostawionego przypadkiem test.only.
  forbidOnly: !!process.env.CI,
  // Lokalnie bez powtórek: test, który padł, ma być widać od razu.
  retries: process.env.CI ? 2 : 0,
  // Wynik w terminalu (list) i raport HTML w folderze playwright-report.
  // Raport otworzysz poleceniem: npx playwright show-report
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    // Adres aplikacji. Dzięki temu w testach piszesz page.goto('/koszyk').
    baseURL: 'http://localhost:4100',
    // Nagranie przebiegu (trace) zostaje po każdym nieudanym teście.
    // Otwórz je z raportu HTML albo: npx playwright show-trace <plik.zip>
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Inne przeglądarki nie biegną domyślnie. Uruchomienie (po `npx playwright install firefox`):
    //   npx playwright test --project=firefox
    {
      name: 'firefox',
      default: false,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      default: false,
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Playwright sam uruchamia aplikację przed testami i zamyka ją po nich.
  // Jeśli aplikacja już działa (npm start w innym oknie), użyje działającej.
  webServer: {
    command: 'node --disable-warning=ExperimentalWarning app/server.mjs',
    url: 'http://localhost:4100/health',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
