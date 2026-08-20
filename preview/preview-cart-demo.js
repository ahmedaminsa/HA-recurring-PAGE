/* ==========================================================================
   PREVIEW ONLY — stands in for the site's basket.
   --------------------------------------------------------------------------
   On the live site the form carries `.__add-to-givers-club-cart` and the
   shipped basket handler posts it and moves the donor to the cart page. That
   script isn't available in this standalone file, so this stub intercepts the
   submit and shows what would have been sent instead.
   DO NOT upload this file to Umbraco.
   ========================================================================== */
(function () {
  'use strict';

  var form = document.querySelector('.rg-quiz__form');
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var fields = {};
    Array.prototype.forEach.call(form.querySelectorAll('input[type="hidden"]'), function (input) {
      fields[input.name] = input.value;
    });

    var shell = form.closest('.rg-quiz__shell');
    var panel = document.createElement('div');
    panel.className = 'rg-summary__box';
    panel.style.marginTop = '24px';
    panel.innerHTML =
      '<p style="margin:0 0 12px;font-weight:700;color:#32195c">Preview only — this is what would be posted to the basket:</p>' +
      '<pre style="margin:0;font:12px/1.7 ui-monospace,SFMono-Regular,Menlo,monospace;color:#3e3e3e;white-space:pre-wrap">' +
      Object.keys(fields).map(function (key) { return key + ': ' + (fields[key] || '(empty)'); }).join('\n') +
      '</pre>';

    var existing = shell.querySelector('[data-preview-dump]');
    if (existing) existing.remove();
    panel.setAttribute('data-preview-dump', 'true');
    shell.appendChild(panel);
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
