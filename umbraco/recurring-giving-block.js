/* ==========================================================================
   The Barakah Circle — guided recurring-giving flow
   Human Appeal USA
   --------------------------------------------------------------------------
   Four questions, then a summary, then the site's basket.

     1. Monthly or annual?      → paymentScheduleId  (1316 / 1346)
     2. What would you support? → donationItemId + locationId
     3. Zakat or Sadaqah?       → stipulationId      (skipped when the fund
                                                      fixes it, e.g. Zakat)
     4. How much?               → regularAmountText
     5. Summary                 → submit

   The form carries the same field names and the same
   `__add-to-givers-club-cart` class as every other donation form on the
   site, so the shipped basket handler picks it up unchanged. This file only
   fills those fields in — it never talks to the server itself.

   Payment schedule IDs (read off the live site):
     1325 single · 1996 weekly (Jummah Club) · 1316 monthly · 1346 annual
   ========================================================================== */
(function () {
  'use strict';

  var MULTIPLIER = { monthly: 1, annual: 12 };
  var MIN_AMOUNT = 5;

  function money(value) {
    return '$' + Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  function init(quiz) {
    var form = quiz.querySelector('.rg-quiz__form');
    if (!form) return;

    var steps = Array.prototype.slice.call(quiz.querySelectorAll('.rg-quiz__step'));
    var bar = quiz.querySelector('.rg-quiz__progress-bar');
    var meta = quiz.querySelector('.rg-quiz__meta');
    var back = quiz.querySelector('.rg-quiz__back');
    var next = quiz.querySelector('.rg-quiz__next');
    var amountsBox = quiz.querySelector('.rg-quiz__amounts');
    var customInput = quiz.querySelector('.rg-quiz__custom-input');
    var error = quiz.querySelector('.rg-quiz__error');

    var hidden = {
      schedule: form.querySelector('input[name="paymentScheduleId"]'),
      item: form.querySelector('input[name="donationItemId"]'),
      location: form.querySelector('input[name="locationId"]'),
      stipulation: form.querySelector('input[name="stipulationId"]'),
      amount: form.querySelector('input[name="regularAmountText"]')
    };

    var index = 0;
    var returnToSummary = false;
    var lastFactor = 1;

    quiz.setAttribute('data-js', 'on');

    /* ------------------------------------------------------------ helpers */

    function checked(name) {
      return form.querySelector('input[name="' + name + '"]:checked');
    }

    function frequency() {
      var input = checked('rg-frequency');
      return input ? input.value : 'monthly';
    }

    function suffix(short) {
      var annual = frequency() === 'annual';
      if (short) return annual ? 'year' : 'month';
      return annual ? 'per year' : 'per month';
    }

    /* A fund can pin its own stipulation (the Zakat Fund is always Zakat),
       in which case question three has nothing to ask. */
    function stipulationLocked() {
      var cause = checked('rg-cause');
      return cause ? cause.getAttribute('data-stipulation-fixed') : null;
    }

    function isSkipped(step) {
      return step.getAttribute('data-step') === 'stipulation' && !!stipulationLocked();
    }

    function visibleSteps() {
      return steps.filter(function (step) { return !isSkipped(step); });
    }

    /* -------------------------------------------------------- amount step */

    function amountLevels() {
      var cause = checked('rg-cause');
      var raw = (cause && cause.getAttribute('data-amounts')) || '25,50,100';
      return raw.split(',').map(Number).filter(Boolean);
    }

    function minimum() {
      var cause = checked('rg-cause');
      var base = Number(cause && cause.getAttribute('data-min')) || MIN_AMOUNT;
      return base * (MULTIPLIER[frequency()] || 1);
    }

    function renderAmounts() {
      if (!amountsBox) return;
      var factor = MULTIPLIER[frequency()] || 1;
      var previous = checked('rg-amount');
      var previousBase = previous ? previous.getAttribute('data-base') : null;

      amountsBox.innerHTML = '';
      amountLevels().forEach(function (base, i) {
        var value = base * factor;
        var id = 'rg-amount-' + i;
        var label = document.createElement('label');
        label.className = 'rg-option rg-option--amount';
        label.innerHTML =
          '<input type="radio" name="rg-amount" id="' + id + '" value="' + value + '" data-base="' + base + '">' +
          '<span class="rg-option__inner">' +
            '<span class="rg-option__title">' + money(value) + '</span>' +
            '<span class="rg-option__note">' + suffix(false) + '</span>' +
          '</span>';
        amountsBox.appendChild(label);
      });

      var restore = previousBase
        ? amountsBox.querySelector('input[data-base="' + previousBase + '"]')
        : amountsBox.querySelector('input[value="' + (amountLevels()[1] * factor) + '"]');
      if (restore) restore.checked = true;

      if (customInput) {
        var min = minimum();
        customInput.setAttribute('min', String(min));
        customInput.setAttribute('placeholder', String(min));

        // A custom amount survives a change of rhythm — it just rescales,
        // so $75 a month becomes $900 a year rather than silently vanishing.
        if (customInput.value) {
          var rescaled = Number(customInput.value) * (factor / lastFactor);
          customInput.value = rescaled >= min ? String(Math.round(rescaled * 100) / 100) : '';
        }
      }

      lastFactor = factor;
    }

    function chosenAmount() {
      if (customInput && customInput.value) return Number(customInput.value);
      var tile = checked('rg-amount');
      return tile ? Number(tile.value) : 0;
    }

    /* ------------------------------------------------------------ summary */

    function fillSummary() {
      var cause = checked('rg-cause');
      var stipulationInput = checked('rg-stipulation');
      var locked = stipulationLocked();

      var causeLabel = cause ? cause.getAttribute('data-label') : '';
      var typeLabel = locked
        ? cause.getAttribute('data-stipulation-label')
        : (stipulationInput ? stipulationInput.getAttribute('data-label') : '');

      set('.rg-summary__cause', causeLabel);
      set('.rg-summary__frequency', frequency() === 'annual' ? 'Once a year' : 'Every month');
      set('.rg-summary__type', typeLabel);
      set('.rg-summary__amount', money(chosenAmount()) + ' ' + suffix(false));

      var headline = quiz.querySelector('.rg-summary__headline');
      if (headline) {
        headline.innerHTML = money(chosenAmount()) + ' <span>a ' + suffix(true) + '</span>';
      }
    }

    function set(selector, text) {
      var el = quiz.querySelector(selector);
      if (el) el.textContent = text || '—';
    }

    /* ------------------------------------------------ write hidden fields */

    function sync() {
      var freq = checked('rg-frequency');
      var cause = checked('rg-cause');
      var stipulationInput = checked('rg-stipulation');
      var locked = stipulationLocked();

      if (freq && hidden.schedule) hidden.schedule.value = freq.getAttribute('data-schedule');
      if (cause && hidden.item) hidden.item.value = cause.getAttribute('data-item-id');
      if (cause && hidden.location) hidden.location.value = cause.getAttribute('data-location-id');
      if (hidden.stipulation) {
        if (locked) hidden.stipulation.value = locked;
        else if (stipulationInput) hidden.stipulation.value = stipulationInput.value;
      }
      if (hidden.amount) hidden.amount.value = String(chosenAmount() || '');
    }

    /* --------------------------------------------------------- navigation */

    function show(target) {
      var list = visibleSteps();
      index = Math.max(0, Math.min(target, list.length - 1));

      steps.forEach(function (step) { step.hidden = true; });
      list[index].hidden = false;

      var isLast = index === list.length - 1;
      if (bar) bar.style.width = Math.round(((index + 1) / list.length) * 100) + '%';
      if (meta) {
        meta.textContent = isLast
          ? 'Almost done'
          : 'Question ' + (index + 1) + ' of ' + (list.length - 1);
      }
      if (back) back.hidden = index === 0;
      if (next) {
        next.hidden = isLast;
        next.textContent = index === list.length - 2 ? 'Review my gift' : 'Continue';
      }
      if (error) error.hidden = true;

      var shell = quiz.querySelector('.rg-quiz__shell');
      if (shell && shell.getBoundingClientRect().top < 0) {
        shell.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    function currentStep() {
      return visibleSteps()[index];
    }

    function validate() {
      var step = currentStep();
      var name = step.getAttribute('data-step');

      if (name === 'amount') {
        var value = chosenAmount();
        if (!value || value < minimum()) {
          if (error) {
            error.textContent = 'Please enter ' + money(minimum()) + ' or more.';
            error.hidden = false;
          }
          if (customInput) customInput.focus();
          return false;
        }
      }
      if (error) error.hidden = true;
      return true;
    }

    function goNext() {
      if (!validate()) return;
      var list = visibleSteps();
      if (index >= list.length - 1) return;

      // Arrived here from a "Change" link on the summary? Go straight back
      // rather than making the donor walk through the rest again.
      show(returnToSummary ? list.length - 1 : index + 1);
      returnToSummary = false;

      if (currentStep().getAttribute('data-step') === 'summary') fillSummary();
    }

    /* -------------------------------------------------------------- wire */

    var ANSWERS = ['rg-frequency', 'rg-cause', 'rg-stipulation'];
    var advanceTimer = null;

    form.addEventListener('change', function (event) {
      var target = event.target;
      if (!target.name) return;

      if (target.name === 'rg-frequency' || target.name === 'rg-cause') renderAmounts();

      if (target.name === 'rg-amount' && customInput) customInput.value = '';

      sync();
    });

    /* Picking an answer moves you on — that is the whole point of the flow.
       This listens for `click` rather than `change` so that confirming the
       option that is already selected (the pre-checked default, most often)
       advances too. Keyboard Space/Enter fires click as well; arrow keys
       only fire change, which leaves them free to browse the options. */
    form.addEventListener('click', function (event) {
      var target = event.target;
      if (!target.name || ANSWERS.indexOf(target.name) === -1 || !target.checked) return;

      var step = currentStep();
      if (!step || step.getAttribute('data-auto') !== 'true') return;

      window.clearTimeout(advanceTimer);
      advanceTimer = window.setTimeout(goNext, 260);
    });

    if (customInput) {
      customInput.addEventListener('input', function () {
        var tile = checked('rg-amount');
        if (tile && customInput.value) tile.checked = false;
        if (error) error.hidden = true;
        sync();
      });
    }

    if (next) next.addEventListener('click', goNext);

    if (back) {
      back.addEventListener('click', function () {
        returnToSummary = false;
        show(index - 1);
      });
    }

    form.addEventListener('submit', function (event) {
      sync();
      if (!chosenAmount()) {
        event.preventDefault();
        show(visibleSteps().length - 2);
      }
    });

    Array.prototype.forEach.call(quiz.querySelectorAll('[data-rg-edit]'), function (link) {
      link.addEventListener('click', function () {
        var wanted = link.getAttribute('data-rg-edit');
        var list = visibleSteps();
        for (var i = 0; i < list.length; i++) {
          if (list[i].getAttribute('data-step') === wanted) {
            returnToSummary = true;
            show(i);
            return;
          }
        }
      });
    });

    renderAmounts();
    sync();
    show(0);
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('.rg-quiz'), init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
