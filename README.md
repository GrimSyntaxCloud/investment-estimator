# Investment Estimator

A JavaScript coursework calculator for annual compound growth, with a randomized-example button.

[Live demo](https://grimsyntaxcloud.github.io/investment-estimator/) · [Portfolio](https://grimsyntaxcloud.github.io/)

## What it does

Enter an investment greater than zero and up to 100,000, an annual rate greater than zero and up to 15%, and a whole number of years from 1 to 50. Each year adds interest to the previous balance. Results use U.S. dollar formatting, including values below 1,000. Random examples stay within the same bounds.

## How it works

The interface is static HTML and CSS, with native JavaScript in `calcValue.js`. There are no npm dependencies, API keys, accounts, backend services or paid libraries.

This educational model assumes a fixed annual rate and no additional deposits, withdrawals, fees or taxes. It is not a financial forecast; inputs are not stored.

## Run locally

Use Python 3 to serve this directory:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://127.0.0.1:8080/. No package installation is required to use the app.

## Verify changes

With Node.js 22 or newer:

```sh
node --test test/*.test.mjs
```

The regression tests cover the repaired behavior using lightweight DOM stand-ins. They do not replace a browser layout check. GitHub Actions runs them on pushes and pull requests. Dependabot checks the Actions used by CI weekly; there is no application dependency manifest to scan.

## Hosting and provenance

GitHub Pages serves the default branch for free. This remains an educational project by Andres Macias; the original exercise structure is retained. The October 2026 maintenance pass documents local setup and adds targeted correctness fixes and regression coverage without redesigning the interface.
