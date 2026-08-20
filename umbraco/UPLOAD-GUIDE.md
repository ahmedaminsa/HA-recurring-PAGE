# دليل الرفع على Umbraco — صفحة The Barakah Circle

الصفحة عبارة عن **٤ أسئلة → ملخص → سلة الموقع**.
كل حاجة مبنية على كلاسات الثيم الموجودة فعليًا على `humanappealusa.org`،
عشان الصفحة تورث الخطوط والألوان والأزرار من غير أي شغل إضافي.

---

## 1. الملفات

| الملف | الوجهة على السيرفر | الحجم |
|---|---|---|
| `umbraco/page-body.html` | محتوى الصفحة | ~25 KB |
| `umbraco/recurring-giving-block.css` | `/css/recurring-giving-block.css` | ~13 KB |
| `umbraco/recurring-giving-block.js` | `/js/recurring-giving-block.js` | ~12 KB |

مجلد `preview/` كله للمعاينة المحلية فقط — **متترفعش أي حاجة منه**.

مفيش أي مكتبة خارجية. الـ JS شغّال بـ vanilla JavaScript ومش محتاج jQuery
ولا أي dependency.

---

## 2. إنشاء الصفحة

1. Content → Right-click على الـ root node → **Create**.
2. اختار نفس الـ Document Type بتاع صفحة `The Jummah Club`.
3. الاسم: **The Barakah Circle**
4. الـ URL segment: `the-barakah-circle`
   → `https://humanappealusa.org/the-barakah-circle`
5. تبويب SEO:
   - **Title:** The Barakah Circle — Monthly & Annual Giving | Human Appeal USA
   - **Description:** Set up a monthly or annual donation in four quick
     questions. Choose your cause and amount, change or cancel any time.
   - **OG image:** `/media/slxplkwx/rs385769_dsc09721.jpg`

---

## 3. إضافة المحتوى — طريقتان

### الطريقة (أ) — الأسرع: بلوك HTML واحد
لو عندكم Block/Macro بيقبل Raw HTML:
1. ضيف بلوك واحد في أول الصفحة.
2. الصق محتوى `page-body.html` كامل جوّاه.
3. Save & Publish.

دقيقة واحدة. العيب: المحرّرين مش هيقدروا يعدّلوا النص من الـ CMS.

### الطريقة (ب) — الأنضف: قسّمها على بلوكات موجودة أصلًا
كل قسم في `page-body.html` معلَّم بتعليق برقمه:

| # | القسم | البلوك الموجود على الموقع |
|---|---|---|
| 1 | Hero | **Hero Carousel / Full width slider** (سلايد واحدة) |
| 2 | ★ الأسئلة الأربعة | **بلوك جديد** — انظر القسم 4 |
| 3 | Small. Consistent. Powerful. + ٣ أعمدة | **Text one column** + **Text three columns** |
| 4 | الاقتباس | **Pull quote block** |
| 5 | الأسئلة الشائعة | **Accordion / FAQ block** أو Rich text |
| 6 | شارات الثقة | **Rich text** أو Image row |
| 7 | الـ CTA الأخير | **Text one column** بخلفية بنفسجي |

**قسم واحد بس جديد** (رقم 2). الباقي كله بلوكات موجودة عندكم.

---

## 4. ⚠️ قبل النشر: مفاتيح التبرع

في الصفحة **٦ صناديق**، كل واحد فيه `data-item-id="REPLACE_ME"` لازم
يتملّى بالـ `donationItemId` بتاعه من الـ CRM، بالإضافة للحقل المخفي في آخر
الفورم (٧ مواضع إجمالًا).

```
ابحث في page-body.html عن:  REPLACE_ME
لازم يكون العدد صفر قبل الـ Publish
```

القيم اللي اتأكدت منها من الموقع الحالي:

| الحقل | القيمة | المعنى |
|---|---|---|
| `regularCurrencyId` | `1332` | دولار أمريكي |
| `paymentScheduleId` | `1325` | مرة واحدة |
| `paymentScheduleId` | `1996` | أسبوعي (Jummah Club) |
| `paymentScheduleId` | **`1316`** | **شهري** ← مستخدم هنا |
| `paymentScheduleId` | **`1346`** | **سنوي** ← مستخدم هنا |
| `stipulationId` | `1329` | صدقة |
| `stipulationId` | `1337` | زكاة |
| `stipulationId` | `1314` | عام |
| `locationId` | `3397` | غزة |
| `locationId` | `1434` | حيث الحاجة أشد / عام |

> **مهم:** المنتجات الشهرية والسنوية غالبًا ليها `donationItemId` مختلف عن
> منتجات Jummah الأسبوعية. اطلب من فريق الـ CRM يعمل المنتجات دي الأول،
> أو يأكد إن نفس الـ item بيشتغل مع أكتر من `paymentScheduleId`.

---

## 5. إزاي البلوك شغّال

الفورم واحد بس. الأسئلة الأربعة كلها `<fieldset>` جوّاه، والـ JS بيخفي
ويظهر واحد ورا التاني، وبيملّي الحقول المخفية:

| السؤال | بيكتب في |
|---|---|
| شهري / سنوي | `paymentScheduleId` (1316 / 1346) |
| الصندوق | `donationItemId` + `locationId` |
| زكاة / صدقة / عام | `stipulationId` |
| المبلغ | `regularAmountText` |

الفورم محتفظ بكلاس `__add-to-givers-club-cart` وبنفس أسماء الحقول اللي
بيستخدمها الموقع، فسكريبت السلة الموجود أصلًا هيلقطه زي أي فورم تبرع تاني —
**مفيش شغل باك-إند جديد**.

**التحقق المطلوب من المطوّر:** لازم يتأكد إن `action` الفورم صح للـ endpoint
بتاعكم. حاليًا `action=""` (نفس سلوك Jummah Club، الهاندلر بيتولى الباقي).
لو الـ endpoint مختلف، غيّر السطر ده بس.

### حاجات صغيرة تعرف تعملها بسهولة

- **تضيف صندوق:** انسخ `<label class="rg-option">` وغيّر
  `data-label` / `data-item-id` / `data-location-id` / `data-amounts` / `data-min`.
- **تخلّي صندوق زكاة دايمًا:** ضيف
  `data-stipulation-fixed="1337" data-stipulation-label="Zakat"` —
  السؤال الثالث بيتخطّى تلقائيًا (زي Zakat Fund و Clean Water حاليًا).
- **تغيّر المبالغ المقترحة:** عدّل `data-amounts="25,50,100"`.
  في الوضع السنوي بتتضرب في 12 تلقائيًا.
- **تغيّر اسم البرنامج:** ٣ مواضع بس في `page-body.html`.

### من غير JavaScript

لو الـ JS مش شغّال، الأسئلة الأربعة بتظهر كلها تحت بعض والصفحة بتفضل
مقروءة، وفيه `<noscript>` بيوجّه المتبرع لـ `/donate/`.

---

## 6. حاجات محتاجة موافقة قبل النشر

**صور:**
- كارت *Orphan Sponsorship* بيستخدم `gaza-orphans.jpg` — صورة غزة لصندوق
  كفالة عالمي. يُفضّل صورة أعم.
- باقي الصور من الميديا لايبرري الحالية.

**أرقام محتاجة تأكيد من فريق البرامج/جمع التبرعات:**
- كفالة اليتيم `$60` شهريًا / `$720` سنويًا — ✅ متأكد منها (من صفحة الكفالة الحالية)
- باقي المبالغ المقترحة (`data-amounts`) — **اقتراح مني**، عدّلوها زي ما تحبوا
- الحد الأدنى `$5` شهريًا — اقتراح
- تصنيف الصناديق (زكاة / صدقة) — محتاج مراجعة شرعية

**نصوص:**
- مفيش أي ادعاء أثر بالدولار من نوع "‏$50 بتطعم أسرة شهر" — متعمّد.
  لو عايزين تضيفوا أرقام أثر، لازم تيجي من فريق البرامج بمصدر.

---

## 7. بعد النشر

- [ ] ضيف لينك في `/donate/` وفي صفحة `The Jummah Club`
- [ ] ضيف الصفحة للـ main nav تحت "Ways to Give"
- [ ] redirect: `/monthly-giving` → `/the-barakah-circle`
- [ ] اختبر تبرع حقيقي بـ $1 شهري وألغيه، وكمان $1 سنوي
- [ ] اختبر إن اختيار Zakat Fund بيتخطّى السؤال الثالث فعلًا
- [ ] راجع الصفحة على موبايل
