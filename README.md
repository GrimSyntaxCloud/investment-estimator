# Investment Estimator

An annual compound-growth calculator presented as a burgundy and cyan growth observatory. A full-width SVG plot makes the relationship between capital, rate and time visible, while a compact parameter dock keeps the calculation close at hand.

[Live demo](https://grimsyntaxcloud.github.io/investment-estimator/) · [Portfolio](https://grimsyntaxcloud.github.io/projects/investment-estimator/)

## What you can do

- Enter an investment greater than $0 and up to $100,000, a constant annual rate greater than 0% and up to 15%, and a whole number of years from 1 to 50.
- Calculate the future value, growth added and balance multiplier.
- Trace each year's actual calculated balance with the keyboard-accessible year slider. The chart uses a zero-based dollar axis; the dashed line marks the initial capital.
- Generate a randomized example with the original limits: investment 1–50,000, rate 1–15%, years 1–50.
- Pause the decorative status pulse and curve-drawing animation. System reduced-motion settings are respected automatically.

The initial $10,000 / 6% / 20-year example is an illustration, not a recommended investment. Editing any input clears the old plot and amounts until a valid estimate is submitted, so stale results cannot be mistaken for the new parameters. Invalid fields provide text errors, accessible error associations and focus on the first invalid input.

## How it works

Static HTML and CSS provide the responsive layout; native JavaScript in `calcValue.js` validates inputs and builds an annual balance series. Each year's balance is the previous balance multiplied by `1 + rate / 100`. That same series drives the amount, SVG curve and year inspector. Currency uses U.S. dollar formatting.

There are no application dependencies, external scripts, web fonts, API keys, accounts, backend services or paid libraries. The old Bootstrap beta CDN stylesheet has been removed. Values remain in the current browser page and are not stored or sent to a service. No database or retention policy is involved.

This educational model assumes a fixed annual rate and no additional deposits, withdrawals, fees or taxes. It is not a market forecast.

## Run locally

Use Python 3 to serve the repository:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://127.0.0.1:8080/. No package installation or build step is required.

## Verify changes

With Node.js 22 or newer:

```sh
node --test test/*.test.mjs
```

The seven tests cover currency formatting, known annual compounding, year-by-year balances, pure zero-rate arithmetic, existing input boundaries (the UI still requires a positive rate), random examples, and stale-result invalidation. They use lightweight DOM stand-ins and do not replace browser layout testing. Browser checks cover keyboard calculation and year inspection, invalid fields, random examples, motion control, and narrow layouts at 390 and 320 CSS-pixel viewport settings.

GitHub Actions runs the tests on pushes and pull requests. Dependabot checks Actions weekly; there is no application dependency manifest to audit.

## Hosting and provenance

GitHub Pages serves the default branch for free. This project began as Andres Macias's JavaScript coursework. The October 2026 redesign was developed collaboratively by Andres and an AI coding assistant: Andres selected the direction and requested a distinctive, interactive portfolio presentation; the assistant implemented and checked the visual system, chart and regression coverage. The original annual-compounding model, input limits and random-example behavior remain intact.
