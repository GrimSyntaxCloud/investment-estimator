import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import fs from "node:fs";
const elements = Object.fromEntries(
  [
    "investment",
    "rate",
    "years",
    "result",
    "investment_error",
    "rate_error",
    "years_error",
  ].map((id) => [id, { value: "", firstChild: { nodeValue: "" }, focus() {} }]),
);
const context = vm.createContext({
  window: {},
  document: { getElementById: (id) => elements[id] },
});
vm.runInContext(
  fs.readFileSync(new URL("../calcValue.js", import.meta.url), "utf8"),
  context,
);
test("currency groups small values and millions correctly", () => {
  assert.equal(context.formatFV("105.00"), "$105.00");
  assert.equal(context.formatFV("1234567.89"), "$1,234,567.89");
});
test("annual compounding retains the known example", () => {
  assert.equal(
    context.formatFV(
      String(context.calcFutureValue(10000, 5, 3)).replace(/[$,]/g, ""),
    ),
    "$11,576.25",
  );
});
test("rejects fractional years, blank fields and numeric text suffixes without stale results", () => {
  for (const [field, value] of [
    ["years", "1.5"],
    ["investment", "100oops"],
    ["rate", ""],
  ]) {
    elements.investment.value = "100";
    elements.years.value = "2";
    elements.rate.value = "5";
    elements.result.value = "old result";
    elements[field].value = value;
    context.processEntries();
    assert.equal(elements.result.value, "");
    assert.notEqual(elements[field + "_error"].firstChild.nodeValue, "");
  }
});

test("year-by-year series matches the final estimate and retains zero-rate arithmetic", () => {
  assert.deepEqual(
    Array.from(context.buildAnnualSeries(10000, 5, 3)),
    [10000, 10500, 11025, 11576.25],
  );
  assert.deepEqual(
    Array.from(context.buildAnnualSeries(100, 0, 3)),
    [100, 100, 100, 100],
  );
  assert.equal(context.calcFutureValue(100, 0, 50), "$100.00");
});

test("input boundaries retain the original investment, rate and whole-year limits", () => {
  for (const [investment, rate, years, valid] of [
    ["0.01", "0.1", "1", true],
    ["100000", "15", "50", true],
    ["0", "5", "2", false],
    ["100001", "5", "2", false],
    ["100", "0", "2", false],
    ["100", "15.01", "2", false],
    ["100", "5", "51", false],
    ["Infinity", "5", "2", false],
    ["100", "5", "2x", false],
  ]) {
    elements.investment.value = investment;
    elements.rate.value = rate;
    elements.years.value = years;
    assert.equal(context.processEntries(), valid);
    assert.equal(elements.result.value !== "", valid);
  }
});

test("random example clears earlier validation and stays within the original bounds", () => {
  elements.investment.value = "bad";
  elements.rate.value = "bad";
  elements.years.value = "bad";
  context.processEntries();
  for (let count = 0; count < 50; count++) {
    context.processRandomNumber();
    assert.ok(
      elements.investment.value >= 1 && elements.investment.value <= 50000,
    );
    assert.ok(elements.rate.value >= 1 && elements.rate.value <= 15);
    assert.ok(elements.years.value >= 1 && elements.years.value <= 50);
    assert.equal(
      elements.result.value,
      context.calcFutureValue(
        Number(elements.investment.value),
        Number(elements.rate.value),
        Number(elements.years.value),
      ),
    );
    for (const id of ["investment_error", "rate_error", "years_error"])
      assert.equal(elements[id].firstChild.nodeValue, "");
  }
});

test("editing inputs invalidates the prior chart and computed result", () => {
  elements.investment.value = "10000";
  elements.rate.value = "6";
  elements.years.value = "20";
  context.processEntries();
  assert.equal(context.currentSeries.length, 21);
  context.clearEstimate();
  assert.equal(elements.result.value, "");
  assert.equal(context.currentSeries.length, 0);
  assert.equal(context.currentInputs, null);
});
