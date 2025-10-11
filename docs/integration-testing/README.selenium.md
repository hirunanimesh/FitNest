# Integration Testing with Selenium (UI – FitNest)

Use Selenium to exercise end-to-end user flows against the Next.js frontend running locally. This gives highest UI fidelity (real browser).

## What you can test
- Page rendering, navigation, forms, and error states via a real browser
- Auth flows through UI (with test accounts / mocked APIs)
- Basic accessibility heuristics (via extensions or custom checks)

## Prerequisites
- Start backend + frontend:
  - VS Code Tasks: "🌟 Start Everything (Backend + Frontend)"
  - Or start individually (API Gateway and services, then `frontend` dev server)
- Node.js installed (using JS Selenium bindings) or choose another language if preferred

## Install (JavaScript bindings)
```powershell
# in repo root (or within a separate tests folder)
npm i -D selenium-webdriver chromedriver
```

## Basic test example (JavaScript)
Create a file e.g., `ui.login.int.test.js` in a new folder `ui-tests/` (outside frontend app code):

```js
const { Builder, By, until } = require('selenium-webdriver');

jest.setTimeout(60000);

describe('FitNest UI – Login flow', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  it('renders home and navigates to login', async () => {
    await driver.get('http://localhost:3000');
    await driver.wait(until.titleContains('FitNest'), 10000);

    const loginLink = await driver.findElement(By.css('a[href="/login"]'));
    await loginLink.click();

    await driver.wait(until.urlContains('/login'), 10000);
  });

  it('submits login form with invalid data and shows error', async () => {
    const email = await driver.findElement(By.name('email'));
    const password = await driver.findElement(By.name('password'));

    await email.clear();
    await email.sendKeys('bad@example.com');
    await password.clear();
    await password.sendKeys('wrong');

    const submit = await driver.findElement(By.css('button[type="submit"]'));
    await submit.click();

    const error = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-error"]')),
      10000
    );
    expect(await error.getText()).toMatch(/invalid|failed/i);
  });
});
```

## How to run (Windows PowerShell)
```powershell
# If tests are in ./ui-tests
npx jest ui-tests --runInBand
```

## Tips
- Prefer stable selectors (`data-testid`) in UI for reliable tests
- Mock API calls where possible (e.g., swap Next.js API routes to return fixtures in test mode)
- Keep UI tests small in number; rely on Jest API tests for breadth

## Pros / Cons
- Pros: Highest fidelity (real browser), validates full UX flow
- Cons: Slower, flakier without careful setup; requires running stack
