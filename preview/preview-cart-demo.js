/* ==========================================================================
   PREVIEW ONLY — a stand-in for the site's donation cart.
   --------------------------------------------------------------------------
   On the live site the forms carry `.__add-to-givers-club-cart` and the
   shipped /js/jummah-club-block-*.js posts them to `data-cart-url`. That
   script isn't available in this standalone file, so this stub fakes the
   behaviour purely so the page can be reviewed end to end.
   DO NOT upload this file to Umbraco.
   ========================================================================== */
(function () {
  'use strict';

  var section = document.querySelector('.recurring-giving#recurring-giving');
  if (!section) return;

  var list = section.querySelector('.rg-cart__list');
  var empty = section.querySelector('.rg-cart__empty');
  var totalValue = section.querySelector('.rg-cart__total-value');
  var cta = section.querySelector('.rg-cart__cta');
  var basket = {};

  function money(value) {
    return '$' + Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  function suffix() {
    return section.getAttribute('data-frequency') === 'annual' ? 'year' : 'month';
  }

  function render() {
    var keys = Object.keys(basket);
    list.innerHTML = '';
    var total = 0;

    keys.forEach(function (key) {
      total += basket[key].amount;
      var li = document.createElement('li');
      li.className = 'rg-cart__row';
      var name = document.createElement('span');
      name.className = 'rg-cart__row-name';
      name.textContent = basket[key].name;
      var amount = document.createElement('span');
      amount.className = 'rg-cart__row-amount';
      amount.textContent = money(basket[key].amount);
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'rg-cart__remove';
      remove.textContent = 'Remove';
      remove.addEventListener('click', function () {
        delete basket[key];
        var form = section.querySelector('form[data-cause="' + key + '"]');
        if (form) form.querySelector('.rg-cause__button').textContent = 'Add';
        render();
      });
      amount.appendChild(remove);
      li.appendChild(name);
      li.appendChild(amount);
      list.appendChild(li);
    });

    empty.hidden = keys.length > 0;
    totalValue.innerHTML = money(total) + '<span> / <span class="rg-frequency-suffix-short">' + suffix() + '</span></span>';
    if (cta) cta.toggleAttribute('disabled', keys.length === 0);
  }

  Array.prototype.forEach.call(section.querySelectorAll('.rg-cause'), function (cause, index) {
    var form = cause.querySelector('form');
    var title = cause.querySelector('.rg-cause__title');
    if (!form || !title) return;
    var key = 'cause-' + index;
    form.setAttribute('data-cause', key);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('.rg-cause__input');
      var amount = Number(input.value);
      var min = Number(input.getAttribute('min')) || 0;
      if (!amount || amount < min) {
        input.focus();
        input.reportValidity ? input.reportValidity() : null;
        return;
      }
      basket[key] = { name: title.textContent.trim(), amount: amount };
      form.querySelector('.rg-cause__button').textContent = 'Update';
      render();
    });
  });

  // Amounts double when the donor switches to annual — keep the cart honest.
  section.addEventListener('rg:frequencychange', function () {
    Object.keys(basket).forEach(function (key) {
      var form = section.querySelector('form[data-cause="' + key + '"]');
      if (!form) return;
      basket[key].amount = Number(form.querySelector('.rg-cause__input').value) || basket[key].amount;
    });
    render();
  });

  render();
})();
