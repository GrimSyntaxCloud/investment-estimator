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
