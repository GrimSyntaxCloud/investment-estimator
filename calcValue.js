"use strict";

var $ = function (id) {
  return document.getElementById(id);
};
var currentSeries = [];
var currentInputs = null;
var chartGeometry = null;

var formatFV = function (futureValue) {
  return Number(futureValue).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

var buildAnnualSeries = function (investment, rate, years) {
  var balances = [investment];
  for (var year = 1; year <= years; year++) {
    balances.push(balances[year - 1] * (1 + rate / 100));
  }
  return balances;
};

var calcFutureValue = function (investment, rate, years) {
  var balances = buildAnnualSeries(investment, rate, years);
  return formatFV(balances[balances.length - 1].toFixed(2));
};

var writeText = function (id, text) {
  if ($(id)) $(id).textContent = text;
};

var showError = function (id, message) {
  $(id + "_error").firstChild.nodeValue = message;
  if ($(id).setAttribute) $(id).setAttribute("aria-invalid", String(!!message));
};

var clearEstimate = function (message) {
  $("result").value = "";
  currentSeries = [];
  currentInputs = null;
  [
    "capital_metric",
    "growth_metric",
    "multiple_metric",
    "balance_readout",
  ].forEach(function (id) {
    writeText(id, "—");
  });
  writeText("year_readout", "No estimate");
  writeText(
    "result_status",
    message || "Inputs changed. Plot a new estimate to update the curve.",
  );
  if ($("chart_empty")) {
    $("chart_empty").hidden = false;
    $("chart_empty").textContent =
      message || "Plot your updated parameters to draw a new curve.";
    $("growth_chart").style.visibility = "hidden";
    $("year_inspector").disabled = true;
  }
};

var processEntries = function () {
  var investment =
    $("investment").value.trim() === "" ? NaN : Number($("investment").value);
  var rate = $("rate").value.trim() === "" ? NaN : Number($("rate").value);
  var years = $("years").value.trim() === "" ? NaN : Number($("years").value);
  var errors = {
    investment:
      !Number.isFinite(investment) || investment <= 0 || investment > 100000
        ? "Enter an amount greater than 0, up to 100,000."
        : "",
    rate:
      !Number.isFinite(rate) || rate <= 0 || rate > 15
        ? "Enter a rate greater than 0, up to 15%."
        : "",
    years:
      !Number.isInteger(years) || years <= 0 || years > 50
        ? "Enter a whole number from 1 to 50."
        : "",
  };
  Object.keys(errors).forEach(function (id) {
    showError(id, errors[id]);
  });
  var firstInvalid = Object.keys(errors).find(function (id) {
    return errors[id];
  });
  if (firstInvalid) {
    clearEstimate("Update the highlighted fields to plot your estimate.");
    $(firstInvalid).focus();
    return false;
  }
  currentInputs = { investment: investment, rate: rate, years: years };
  currentSeries = buildAnnualSeries(investment, rate, years);
  $("result").value = calcFutureValue(investment, rate, years);
  var finalBalance = currentSeries[currentSeries.length - 1];
  writeText("capital_metric", formatFV(investment));
  writeText("growth_metric", "+" + formatFV(finalBalance - investment));
  writeText("multiple_metric", (finalBalance / investment).toFixed(2) + "×");
  writeText(
    "result_status",
    "After " +
      years +
      (years === 1 ? " year" : " years") +
      " at a constant " +
      rate +
      "% annual rate.",
  );
  if ($("year_inspector")) {
    $("year_inspector").max = years;
    $("year_inspector").value = years;
    $("year_inspector").disabled = false;
  }
  renderChart(true);
  return true;
};

var getRandomNumber = function (max) {
  return Math.floor(Math.random() * max) + 1;
};
var processRandomNumber = function () {
  $("investment").value = String(getRandomNumber(50000));
  $("rate").value = String(getRandomNumber(15));
  $("years").value = String(getRandomNumber(50));
  processEntries();
};

var svgElement = function (tag, attributes, text) {
  var element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.keys(attributes).forEach(function (key) {
    element.setAttribute(key, attributes[key]);
  });
  if (text !== undefined) element.textContent = text;
  return element;
};
var axisValue = function (value) {
  return value >= 1000000
    ? "$" + (value / 1000000).toFixed(1) + "m"
    : value >= 1000
      ? "$" + (value / 1000).toFixed(1) + "k"
      : "$" + value.toFixed(value < 1 ? 2 : 0);
};

var renderChart = function (animate) {
  if (!$("growth_chart") || !currentInputs) return;
  $("chart_empty").hidden = true;
  $("growth_chart").style.visibility = "visible";
  var compact = window.matchMedia("(max-width: 600px)").matches;
  var width = compact ? 540 : 1120;
  var left = compact ? 69 : 78;
  var right = width - 30;
  var top = 24;
  var bottom = 287;
  var ceiling = currentSeries[currentSeries.length - 1] * 1.12;
  var x = function (year) {
    return left + (year / currentInputs.years) * (right - left);
  };
  var y = function (balance) {
    return bottom - (balance / ceiling) * (bottom - top);
  };
  chartGeometry = { x: x, y: y };
  $("growth_chart").setAttribute("viewBox", "0 0 " + width + " 330");
  ["grid_lines", "chart_labels", "chart_points"].forEach(function (id) {
    $(id).replaceChildren();
  });
  for (var tick = 0; tick <= 4; tick++) {
    var value = (ceiling * tick) / 4;
    $("grid_lines").appendChild(
      svgElement("line", {
        x1: left,
        x2: right,
        y1: y(value),
        y2: y(value),
        class: "grid-line",
      }),
    );
    $("chart_labels").appendChild(
      svgElement(
        "text",
        {
          x: left - 13,
          y: y(value) + 4,
          "text-anchor": "end",
          class: "chart-label",
        },
        axisValue(value),
      ),
    );
  }
  var yearTicks = [
    0,
    Math.round(currentInputs.years / 2),
    currentInputs.years,
  ].filter(function (year, index, all) {
    return all.indexOf(year) === index;
  });
  yearTicks.forEach(function (year) {
    $("chart_labels").appendChild(
      svgElement(
        "text",
        {
          x: x(year),
          y: bottom + 27,
          "text-anchor":
            year === 0
              ? "start"
              : year === currentInputs.years
                ? "end"
                : "middle",
          class: "chart-label",
        },
        "YEAR " + year,
      ),
    );
    $("grid_lines").appendChild(
      svgElement("line", {
        x1: x(year),
        x2: x(year),
        y1: top,
        y2: bottom,
        class: "grid-line",
      }),
    );
  });
  var path = currentSeries
    .map(function (balance, year) {
      return (year === 0 ? "M" : "L") + x(year) + " " + y(balance);
    })
    .join(" ");
  $("growth_path").setAttribute("d", path);
  $("growth_glow").setAttribute("d", path);
  $("growth_area").setAttribute(
    "d",
    path + " L" + right + " " + bottom + " L" + left + " " + bottom + " Z",
  );
  $("capital_line").setAttribute(
    "d",
    "M" +
      left +
      " " +
      y(currentInputs.investment) +
      " L" +
      right +
      " " +
      y(currentInputs.investment),
  );
  [0, currentInputs.years].forEach(function (year) {
    $("chart_points").appendChild(
      svgElement("circle", {
        cx: x(year),
        cy: y(currentSeries[year]),
        r: 4,
        class: "curve-point",
      }),
    );
  });
  writeText(
    "chart_description",
    "Starting with " +
      formatFV(currentInputs.investment) +
      ", a constant " +
      currentInputs.rate +
      "% annual rate produces " +
      $("result").value +
      " after " +
      currentInputs.years +
      " years. Use the year slider to inspect each annual balance.",
  );
  if (animate) {
    $("growth_path").classList.remove("draw");
    void $("growth_path").getBoundingClientRect();
    $("growth_path").classList.add("draw");
  }
  inspectYear();
};

var inspectYear = function () {
  if (!currentSeries.length || !chartGeometry) return;
  var year = Number($("year_inspector").value);
  var balance = currentSeries[year];
  writeText("year_readout", "Year " + year);
  writeText("balance_readout", formatFV(balance));
  $("year_inspector").setAttribute(
    "aria-valuetext",
    "Year " + year + ": " + formatFV(balance),
  );
  var line = $("inspection_line").querySelector("line");
  line.setAttribute("x1", chartGeometry.x(year));
  line.setAttribute("x2", chartGeometry.x(year));
  var point = $("inspection_line").querySelector("circle");
  point.setAttribute("cx", chartGeometry.x(year));
  point.setAttribute("cy", chartGeometry.y(balance));
};

window.onload = function () {
  $("parameters").addEventListener("submit", function (event) {
    event.preventDefault();
    processEntries();
  });
  $("random_value").onclick = processRandomNumber;
  ["investment", "rate", "years"].forEach(function (id) {
    $(id).addEventListener("input", function () {
      clearEstimate();
      showError(id, "");
    });
  });
  $("year_inspector").addEventListener("input", inspectYear);
  $("motion_toggle").addEventListener("click", function () {
    var paused = document.body.classList.toggle("motion-paused");
    this.setAttribute("aria-pressed", String(paused));
    this.textContent = paused ? "Resume motion ▶" : "Pause motion Ⅱ";
  });
  window.addEventListener("resize", function () {
    renderChart(false);
  });
  processEntries();
};
