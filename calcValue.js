"use strict";

var $ = function (id) {
  return document.getElementById(id);
};

var formatFV = function (futureValue) {
  return Number(futureValue).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

var calcFutureValue = function (investment, rate, years) {
  var futureValue = investment;
  for (var i = 1; i <= years; i++) {
    futureValue = futureValue + (futureValue * rate) / 100;
  }
  futureValue = parseFloat(futureValue).toFixed(2);
  futureValue = formatFV(futureValue);
  return futureValue;
};

var processEntries = function () {
  var investment =
    $("investment").value.trim() === "" ? NaN : Number($("investment").value);
  var rate = $("rate").value.trim() === "" ? NaN : Number($("rate").value);
  var years = $("years").value.trim() === "" ? NaN : Number($("years").value);
  var isValid = true;
  $("result").value = "";

  if (!Number.isFinite(investment) || investment <= 0 || investment > 100000) {
    $("investment_error").firstChild.nodeValue =
      "Must be a number greater than 0 and less than or equal to 100,000.";
    isValid = false;
  } else {
    $("investment_error").firstChild.nodeValue = "";
  }

  if (!Number.isFinite(rate) || rate <= 0 || rate > 15) {
    $("rate_error").firstChild.nodeValue =
      "Must be a number greater than 0 and less than or equal to 15.";
    isValid = false;
  } else {
    $("rate_error").firstChild.nodeValue = "";
  }

  if (!Number.isInteger(years) || years <= 0 || years > 50) {
    $("years_error").firstChild.nodeValue =
      "Must be a whole number from 1 to 50.";
    isValid = false;
  } else {
    $("years_error").firstChild.nodeValue = "";
  }

  if (isValid) {
    var futureValue = calcFutureValue(investment, rate, years);
    $("result").value = futureValue;
    $("investment").focus();
  }
};

var getRandomNumber = function (max) {
  //get randomValues for investment, rate and years
  // maximum values should be 50000; 15 and 50.
  // use the random values to calculate future value
  var random;
  random = Math.random();
  random = Math.floor(random * max);
  random = random + 1;
  return random;
};

var processRandomNumber = function () {
  var investment = ($("investment").value = getRandomNumber(50000));
  var rate = ($("rate").value = getRandomNumber(15));
  var years = ($("years").value = getRandomNumber(50));
  var futureValue = calcFutureValue(investment, rate, years);
  $("result").value = futureValue;
};

window.onload = function () {
  $("calculate_value").onclick = processEntries;
  $("random_value").onclick = processRandomNumber;
  $("investment").focus();
};
