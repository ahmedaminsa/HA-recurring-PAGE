# دليل الرفع على Umbraco — صفحة The Barakah Circle

كل شيء في الصفحة مبني على كلاسات الثيم الموجودة فعليًا على `humanappealusa.org`،
عشان الصفحة تورث الخطوط والألوان والأزرار والـ grid من غير أي شغل إضافي.

---

## 1. الملفات

| الملف | الوجهة على السيرفر | ملاحظات |
|---|---|---|
| `umbraco/page-body.html` | محتوى الصفحة | الجسم فقط — الهيدر والفوتر بيضيفهم الـ template |
| `umbraco/recurring-giving-block.css` | `/css/recurring-giving-block.css` | ستايلات البلوك الجديد فقط |
| `umbraco/recurring-giving-block.js` | `/js/recurring-giving-block.js` | مبدّل شهري/سنوي + شرائح المبالغ |

مجلد `preview/` كله للمعاينة المحلية فقط — **متترفعش أي حاجة منه**.

---

## 2. إنشاء الصفحة

1. Content → اعمل Right-click على الـ root node → **Create**.
2. اختار نفس الـ Document Type بتاع صفحة `The Jummah Club`
   (صفحة Landing عامة فيها Block List / Grid).
3. الاسم: **The Barakah Circle**
4. الـ URL segment: `the-barakah-circle`
   → العنوان النهائي: `https://humanappealusa.org/the-barakah-circle`
5. في تبويب SEO:
   - **Title:** The Barakah Circle — Monthly & Annual Giving | Human Appeal USA
   - **Description:** Set up a monthly or annual donation with Human Appeal USA.
     Choose your cause, choose your amount, and change or cancel any time.
   - **OG image:** `/media/slxplkwx/rs385769_dsc09721.jpg`

---

## 3. إضافة المحتوى — طريقتان

### الطريقة (أ) — الأسرع: بلوك HTML واحد
لو عندكم Block/Macro بيقبل Raw HTML:
1. ضيف بلوك واحد في أول الصفحة.
2. الصق محتوى `page-body.html` كامل جوّاه.
3. Save & Publish.

الميزة: دقيقة واحدة. العيب: المحرّرين مش هيقدروا يعدّلوا النص من الـ CMS.

### الطريقة (ب) — الأنضف: قسّمها على بلوكات موجودة أصلًا
كل قسم في `page-body.html` معلَّم بتعليق برقمه. المقابل في Umbraco:

| # | القسم في الملف | البلوك الموجود على الموقع |
|---|---|---|
| 1 | Hero | **Hero Carousel / Full width slider** (سلايد واحدة) |
| 2 | Small. Consistent. Powerful. | **Text one column block** |
| 3 | الأسباب الثلاثة | **Text three columns block** |
| 4 | Three steps. One habit. | **Steps block** (نفس أيقونات Jummah) |
| 5 | Choose your gift | **بلوك جديد** — انظر القسم 4 تحت |
| 6 | Circle levels | جزء من البلوك الجديد |
| 7 | الاقتباس | **Pull quote block** |
| 8 | الأسئلة الشائعة | **Accordion / FAQ block** أو Rich text |
| 9 | شارات الثقة | **Rich text** أو Image row |
| 10 | الـ CTA الأخير | **Text one column** بخلفية بنفسجي |

القسم رقم 5 هو الوحيد اللي محتاج Doc Type جديد:
انسخ `JummahClubBlock` وغيّر فيه:
- `paymentScheduleId` من `1996` (أسبوعي) إلى قيمة متغيّرة (شهري/سنوي)
- ضيف property للمبالغ المقترحة لكل صندوق

---

## 4. ⚠️ قبل النشر: مفاتيح التبرع

في الملف **7 حقول مكتوب فيها `REPLACE_ME`** — كل واحدة هي
`donationItemId` لصندوق. لازم تتاخد من الـ CRM.

```
ابحث في الملف عن:  REPLACE_ME
لازم يكون العدد صفر قبل الـ Publish
```

القيم اللي اتأكدت منها من الموقع الحالي:

| الحقل | القيمة | المعنى |
|---|---|---|
| `regularCurrencyId` | `1332` | دولار أمريكي |
| `paymentScheduleId` | `1325` | مرة واحدة |
| `paymentScheduleId` | `1996` | أسبوعي (Jummah Club) |
| `paymentScheduleId` | **`1316`** | **شهري** ← المستخدم هنا |
| `paymentScheduleId` | **`1346`** | **سنوي** ← المستخدم هنا |
| `stipulationId` | `1329` | صدقة |
| `stipulationId` | `1337` | زكاة |
| `stipulationId` | `1314` | عام |
| `locationId` | `3397` | غزة |
| `locationId` | `1434` | حيث الحاجة أشد / عام |

> **مهم:** المنتجات الشهرية والسنوية غالبًا ليها `donationItemId` مختلف عن
> منتجات Jummah الأسبوعية. اطلب من فريق الـ CRM يعمل المنتجات دي الأول،
> أو يأكد إن نفس الـ item بيشتغل مع أكتر من `paymentScheduleId`.

---

## 5. عربة التبرعات (Cart)

الفورمات محتفظة بكلاس `__add-to-givers-club-cart`، يعني سكريبت الكارت
الموجود أصلًا (`/js/jummah-club-block-*.js`) هيتعامل معاها زي ما بيتعامل
مع Jummah Club بالظبط — **مفيش شغل باك-إند جديد**.

المطلوب بس:
1. اعمل صفحة كارت تحت الصفحة الجديدة، الـ URL segment: `barakah-circle-cart`
   (متسجّلة في `data-cart-url` على السكشن).
2. اتأكد إن `/js/jummah-club-block-*.js` بيتحمّل على الصفحة دي —
   ولازم يتحمّل **قبل** `recurring-giving-block.js`.
3. لو الكارت محتاج anti-forgery token، Umbraco بيحقنه تلقائيًا في الفورم
   (`__RequestVerificationToken`) زي ما بيعمل في Jummah Club.

---

## 6. حاجات محتاجة موافقة قبل النشر

**صور** (كلها من الميديا لايبرري الحالية، لكنها مؤقتة):
- كارت *Orphan Sponsorship* حاليًا بيستخدم `gaza-orphans.jpg` — صورة غزة
  لصندوق كفالة عالمي. يُفضّل صورة أعم.
- باقي الصور مأخوذة من صفحات الصناديق المقابلة.

**أرقام محتاجة تأكيد من فريق البرامج/جمع التبرعات:**
- كفالة اليتيم `$60` شهريًا / `$720` سنويًا — ✅ متأكد منها (من صفحة الكفالة الحالية)
- باقي المبالغ المقترحة (`$25 / $50 / $100` إلخ) — **اقتراح مني**، عدّلها زي ما تحبوا
- مستويات الـ Circle (`$25 / $50 / $100 / $250`) — اقتراح
- الصناديق المعلَّمة **Zakat eligible** — لازم مراجعة شرعية

**UX:**
- على الموبايل الكارت بينزل تحت كل الصناديق (نفس سلوك Jummah Club).
  لو حبيتوا تحسنوها لاحقًا: شريط ثابت تحت الشاشة يظهر أول ما يتضاف أول صندوق.

**نصوص:**
- مفيش أي ادعاء أثر بالدولار من نوع "‏$50 بتطعم أسرة شهر" — متعمّد.
  لو عايزين تضيفوا أرقام أثر، لازم تيجي من فريق البرامج بمصدر.

---

## 7. بعد النشر

- [ ] ضيف لينك في `/donate/` وفي صفحة `The Jummah Club`
- [ ] ضيف الصفحة للـ main nav تحت "Ways to Give"
- [ ] اتأكد من الـ redirect: `/monthly-giving` → `/the-barakah-circle`
- [ ] اختبر تبرع حقيقي بـ $1 شهري وألغيه، وكمان $1 سنوي
- [ ] راجع الصفحة على موبايل (الكارت بيتحول من sticky لعادي تحت 1024px)
