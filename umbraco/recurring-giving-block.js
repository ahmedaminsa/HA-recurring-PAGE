/* ==========================================================================
   Recurring Giving block — "The Barakah Circle"
   Human Appeal USA
   --------------------------------------------------------------------------
   Responsibilities (deliberately small):
     1. Monthly / Annual switch  → rewrites every form's hidden
        `paymentScheduleId`, swaps the suggested amounts, and re-labels the UI.
     2. Suggested-amount chips   → write the chosen value into the form's
        `regularAmountText` input.
     3. Keeps the cart panel's "per month / per year" wording in sync.

   It does NOT implement the cart. The forms keep the site's existing
   `__add-to-givers-club-cart` class and `data-cart-url`, so the shipped
   /js/jummah-club-block-*.js handler adds them to the donation cart exactly
   like The Jummah Club does. Load this file AFTER that one.

   Payment schedule IDs (read off the live site):
     1325 = Single / one-off
     1996 = Weekly   (The Jummah Club)
     1316 = Monthly
     1346 = Annual
   ========================================================================== */
(function () {
  'use strict';

  var SECTION = '.recurring-giving';
  var MULTIPLIER = { monthly: 1, annual: 12 };

  function money(value) {
    return '$' + Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  function init(section) {
    var frequencyInputs = section.querySelectorAll('.rg-frequency__option input[name="rg-frequency"]');
    if (!frequencyInputs.length) return;

    function currentFrequency() {
      for (var i = 0; i < frequencyInputs.length; i++) {
        if (frequencyInputs[i].checked) return frequencyInputs[i];
      }
      return frequencyInputs[0];
    }

    function apply() {
      var chosen = currentFrequency();
      var mode = chosen.value;                       // "monthly" | "annual"
      var scheduleId = chosen.getAttribute('data-payment-schedule-id');
      var factor = MULTIPLIER[mode] || 1;
      var suffix = mode === 'annual' ? 'per year' : 'per month';
      var suffixShort = mode === 'annual' ? 'year' : 'month';

      section.setAttribute('data-frequency', mode);

      // 1. Every donation form points at the chosen schedule.
      var schedules = section.querySelectorAll('input[name="paymentScheduleId"]');
      Array.prototype.forEach.call(schedules, function (input) {
        input.value = scheduleId;
      });

      // 2. Suggested amounts scale with the frequency.
      var chips = section.querySelectorAll('.rg-amounts__chip input[type="radio"]');
      Array.prototype.forEach.call(chips, function (chip) {
        var base = Number(chip.getAttribute('data-base-amount'));
        if (!base) return;
        var amount = base * factor;
        chip.value = String(amount);
        var label = chip.nextElementSibling;
        if (label) {
          var strong = label.querySelector('.rg-amounts__value') || label;
          strong.textContent = money(amount);
        }
        if (chip.checked) writeAmount(chip);
      });

      // 3. Wording: "$60 per month" etc.
      var suffixes = section.querySelectorAll('.rg-frequency-suffix');
      Array.prototype.forEach.call(suffixes, function (el) {
        el.textContent = suffix;
      });

      var shortSuffixes = section.querySelectorAll('.rg-frequency-suffix-short');
      Array.prototype.forEach.call(shortSuffixes, function (el) {
        el.textContent = suffixShort;
      });

      var minimums = section.querySelectorAll('.rg-cause__input');
      Array.prototype.forEach.call(minimums, function (input) {
        input.setAttribute('aria-label', 'Amount ' + suffix);
      });

      section.dispatchEvent(new CustomEvent('rg:frequencychange', {
        bubbles: true,
        detail: { frequency: mode, paymentScheduleId: scheduleId, suffix: suffix }
      }));
    }

    function writeAmount(chip) {
      var form = chip.closest('form');
      if (!form) return;
      var input = form.querySelector('.rg-cause__input');
      if (input && chip.value !== 'custom') {
        input.value = chip.value;
      } else if (input) {
        input.value = '';
        input.focus();
      }
    }

    Array.prototype.forEach.call(frequencyInputs, function (input) {
      input.addEventListener('change', apply);
    });

    section.addEventListener('change', function (event) {
      var target = event.target;
      if (target && target.matches('.rg-amounts__chip input[type="radio"]')) {
        writeAmount(target);
      }
    });

    // Typing a custom amount clears the selected chip.
    section.addEventListener('input', function (event) {
      var target = event.target;
      if (!target || !target.matches('.rg-cause__input')) return;
      var form = target.closest('form');
      if (!form) return;
      var checked = form.querySelector('.rg-amounts__chip input:checked');
      if (checked && checked.value !== target.value) checked.checked = false;
    });

    apply();
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll(SECTION), init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
