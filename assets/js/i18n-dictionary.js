/* Reviewed interface labels. Religious texts and personal content stay in their original language. */
(function(root){
 'use strict';
 const rows=`
تستخدم رسائل الإدارة على الهاتف خدمة OneSignal. عند تهيئة الخدمة، تعالج معرّفات التثبيت والاشتراك وبيانات الجهاز والتفاعل مع الرسائل لتوصيل الإشعارات وقياس وصولها. يمكنك تعطيل الإشعارات من إعدادات الهاتف.|The app uses OneSignal for mobile announcements. When initialized, the service processes installation and subscription identifiers, device information and notification interactions to deliver messages and measure delivery. You can turn notifications off in phone settings.|موبائل اعلانات کے لیے OneSignal استعمال ہوتا ہے۔ فعال ہونے پر یہ سروس پیغامات پہنچانے اور ترسیل جانچنے کے لیے تنصیب و رکنیت کے شناختی کوڈ، آلے کی معلومات اور اطلاعات کے ساتھ تعامل پر کارروائی کرتی ہے۔ فون کی ترتیبات سے اطلاعات بند کی جا سکتی ہیں۔
إذا شاركت في الختمة العامة، يحفظ Firebase اسم القارئ الذي تدخله ورقم الجزء وحالته ووقت الحجز، وتظهر هذه المعلومات للمشاركين. عند إرسال بلاغ، يتلقى فريق التطبيق النص وموضع المشكلة والصفحة ومعلومات المتصفح والمنصة ووقت الإرسال عبر Firebase. يمكنك مراسلة فريق الدعم لطلب حذف هذه البيانات.|If you join the group Quran reading, Firebase stores the reader name you enter, part number, status and reservation time. Participants can see these details. When you send a report, the app team receives its text, the reported section and page, browser and platform details and submission time through Firebase. Contact support to request deletion.|اجتماعی ختم میں آپ کا درج کردہ نام، پارہ، حالت اور وقت Firebase میں محفوظ ہوتے ہیں اور شرکا کو دکھائی دیتے ہیں۔ رپورٹ بھیجنے پر ٹیم کو Firebase کے ذریعے متن، متعلقہ حصہ اور صفحہ، براؤزر، پلیٹ فارم اور وقت ملتے ہیں۔ حذف کرانے کے لیے معاونت سے رابطہ کریں۔
عندما تنشر دعاءً على الحائط العام، يُرسل نص الدعاء واسم العرض والفئة إلى Firebase ويُحفظ المنشور مع وقت النشر ليظهر للمستخدمين الآخرين. مسح بيانات الهاتف لا يحذف المنشور العام.|When you post on the public prayer wall, the prayer text, display name and category are sent to Firebase and stored with the posting time for other users to see. Clearing phone data does not remove the public post.|عوامی دیوار پر دعا شائع کرنے پر دعا کا متن، ظاہر ہونے والا نام اور زمرہ Firebase کو بھیجے جاتے ہیں اور اشاعت کے وقت کے ساتھ دوسرے صارفین کے لیے محفوظ ہوتے ہیں۔ فون کا ڈیٹا صاف کرنے سے عوامی پوسٹ حذف نہیں ہوتی۔
تُنقل طلبات الموقع عبر اتصال مشفّر (HTTPS). يتلقى مقدم الخدمة عنوان الإنترنت عند الاتصال، وقد يحتفظ بسجلات وفق سياسته.|Location requests use encrypted HTTPS connections. The provider receives your IP address and may retain logs according to its policy.|مقام کی درخواستیں خفیہ کردہ HTTPS رابطے سے بھیجی جاتی ہیں۔ خدمت فراہم کنندہ کو آپ کا آئی پی پتہ ملتا ہے اور وہ اپنی پالیسی کے مطابق لاگ رکھ سکتا ہے۔
عند البحث عن مسجد قريب، تُرسل إحداثيات مركز البحث إلى Overpass وقد تُرسل إلى Photon. عند البحث اليدوي يُرسل اسم المكان إلى Nominatim أو Photon. تطلب الخريطة صور المنطقة من OpenStreetMap. إذا فتحت خرائط Google فستتلقى المواقع الواردة في الرابط.|Nearby mosque searches send the search coordinates to Overpass and may send them to Photon. Manual searches send the place name to Nominatim or Photon. The map requests area tiles from OpenStreetMap. Opening Google Maps sends it the locations in the link.|قریبی مساجد تلاش کرنے پر نقاط Overpass اور ضرورت پڑنے پر Photon کو بھیجے جاتے ہیں۔ دستی تلاش میں جگہ کا نام Nominatim یا Photon کو جاتا ہے۔ نقشہ OpenStreetMap سے علاقے کی تصاویر لیتا ہے۔ Google Maps کھولنے پر اسے لنک میں موجود مقامات ملتے ہیں۔
يُرسل موقعك الجديد إلى AlAdhan لتحديث مواقيت الصلاة أثناء السفر.|Your new location is sent to AlAdhan to update prayer times as you travel.|سفر کے دوران نماز کے اوقات اپ ڈیٹ کرنے کے لیے آپ کا نیا مقام AlAdhan کو بھیجا جاتا ہے۔
إذا فعّلت تحديث الأذان أثناء السفر وسمحت بالموقع دائمًا، يرسل التطبيق إحداثيات موقعك الجديد إلى AlAdhan لتحديث التنبيهات حتى عندما يكون التطبيق مغلقًا. يمكنك إيقاف ذلك من مواقيت الصلاة أو من إعدادات أذونات الهاتف.|If you enable travel updates and allow location access all the time, the app sends your new coordinates to AlAdhan to update prayer alerts even when the app is closed. You can turn this off in Prayer Times or your phone’s permissions.|اگر آپ سفری اپ ڈیٹس فعال کر کے مقام تک ہمیشہ رسائی دیں تو ایپ بند ہونے پر بھی نئے مقام کے نقاط AlAdhan کو بھیجے جاتے ہیں تاکہ نماز کی اطلاعات اپ ڈیٹ ہوں۔ آپ اسے اوقاتِ نماز یا فون کی اجازتوں میں بند کر سکتے ہیں۔
تحديث الأذان أثناء السفر والتطبيق مغلق|Update prayer alerts while traveling with the app closed|سفر کے دوران ایپ بند ہو تب بھی اذان کے اوقات اپ ڈیٹ کریں
اسمح بالموقع دائمًا من إعدادات الهاتف لتحديث الأذان أثناء السفر.|Allow location access all the time in phone settings to update prayer alerts while traveling.|سفر کے دوران اذان کے اوقات اپ ڈیٹ کرنے کے لیے فون کی ترتیبات میں مقام تک ہمیشہ رسائی دیں۔
تشغيل الأذكار|Play adhkar|اذکار سنیں
تنزيل للاستماع بدون إنترنت|Download to listen offline|آف لائن سننے کے لیے ڈاؤن لوڈ کریں
متاح بدون إنترنت|Available offline|آف لائن دستیاب ہے
أذكار محفوظة|Saved adhkar|محفوظ اذکار
اكتمل التشغيل|Playback finished|ریکارڈنگ مکمل ہو گئی
تعذّر تشغيل الأذكار|Couldn’t play the adhkar|اذکار چلائے نہیں جا سکے
تعذّر تنزيل الأذكار. أعد المحاولة.|Couldn’t download the adhkar. Try again.|اذکار ڈاؤن لوڈ نہیں ہو سکے۔ دوبارہ کوشش کریں۔
نزّل الأذكار أولًا للاستماع بدون إنترنت|Download the adhkar first to listen offline|آف لائن سننے کے لیے پہلے اذکار ڈاؤن لوڈ کریں
الاتجاهات|Directions|راستہ دیکھیں
الاتجاهات ↗|Directions ↗|راستہ دیکھیں ↗
موقعك الحالي 📍|Your location 📍|آپ کا موجودہ مقام 📍
انقر لعرض وتكبير المسجد على الخريطة|Show this mosque on the map|یہ مسجد نقشے پر دیکھیں
عرض وتكبير المسجد على الخريطة|Show this mosque on the map|یہ مسجد نقشے پر دیکھیں
🤍 صدقة جارية لمن تحب|🤍 Ongoing charity for a loved one|🤍 اپنے پیارے کے لیے صدقۂ جاریہ
اكتب اسم المتوفى لتجهيز الدعاء ورابط المشاركة.|Enter the deceased person’s name to prepare a dua and a link to share.|دعا اور شیئر کرنے کا لنک تیار کرنے کے لیے مرحوم کا نام لکھیں۔
اسم المتوفى أو المهدى له|Name of the person you are praying for|جس کے لیے دعا کر رہے ہیں اس کا نام
مثال: الوالد رحمه الله أو فلان بن فلان|For example, your father’s name|مثلاً اپنے والد کا نام
تجهيز بطاقة الدعاء والرابط ✨|Create dua card and link ✨|دعا کا کارڈ اور لنک بنائیں ✨
دعاء لمن تحب|A dua for a loved one|اپنے پیارے کے لیے دعا
مشاركة الدعاء والرابط|Share dua and link|دعا اور لنک شیئر کریں
تم نسخ الدعاء والرابط ✓|Dua and link copied ✓|دعا اور لنک کاپی ہو گئے ✓
الدعاء والرابط للنسخ اليدوي|Dua and link to copy|کاپی کرنے کے لیے دعا اور لنک
تعذّرت المشاركة؛ انسخ النص الظاهر|Couldn’t share. Copy the text shown here.|شیئر نہیں ہو سکا۔ دکھایا گیا متن کاپی کریں۔
دليل المتوفى|Guide to praying for the deceased|مرحوم کے لیے دعا کی رہنمائی
الموقع المحفوظ — حدّثه إذا انتقلت|Saved location — update it if you’ve moved|محفوظ مقام — جگہ بدلنے پر اسے اپ ڈیٹ کریں
لم يتم تحديد موقع موثوق|Location not confirmed|مقام کی تصدیق نہیں ہوئی
حدّد موقعك الحالي لحساب القبلة، خصوصًا إذا كنت داخل مكة.|Set your current location to calculate the qibla, especially if you are in Makkah.|قبلے کی سمت معلوم کرنے کے لیے اپنا موجودہ مقام منتخب کریں، خاص طور پر اگر آپ مکہ میں ہیں۔
زاوية القبلة محسوبة للموقع الموضّح. فعّل البوصلة ثم ضع الهاتف مسطحًا وبالوضع الطولي، بعيدًا عن المعادن.|The qibla angle is for the location shown. Enable the compass and lay your phone flat in portrait orientation, away from metal.|قبلے کا زاویہ دکھائے گئے مقام کے لیے ہے۔ کمپاس فعال کریں اور فون کو دھات سے دور، پورٹریٹ موڈ میں ہموار سطح پر رکھیں۔
الحساس لم يوفّر اتجاه الشمال. الزاوية المعروضة للموقع فقط؛ استخدم بوصلة موثوقة لتوجيهها.|The sensor couldn’t locate north. Use a reliable compass with the angle shown for your location.|سینسر شمال کا تعین نہیں کر سکا۔ اپنے مقام کے لیے دکھایا گیا زاویہ کسی قابلِ اعتماد کمپاس کے ساتھ استعمال کریں۔
اجعل الشاشة في الوضع الطولي وضع الهاتف مسطحًا لقراءة الاتجاه.|Switch to portrait orientation and lay your phone flat to read the direction.|سمت معلوم کرنے کے لیے فون پورٹریٹ موڈ میں ہموار سطح پر رکھیں۔
ضع الهاتف مسطحًا، والشاشة لأعلى؛ لا تعتمد على اتجاه السهم أثناء إمالته.|Lay your phone flat with the screen facing up. Tilting it affects the arrow’s accuracy.|فون ہموار سطح پر اسکرین اوپر کی طرف رکھیں۔ فون جھکا ہو تو تیر کی سمت پر بھروسا نہ کریں۔
دقة البوصلة ضعيفة. ابتعد عن المعادن وحرّك الهاتف على شكل 8 ثم أعد وضعه مسطحًا.|Compass accuracy is low. Move away from metal, move your phone in a figure eight, then lay it flat again.|کمپاس کی درستگی کم ہے۔ دھات سے دور جائیں، فون کو 8 کی شکل میں حرکت دیں اور پھر ہموار سطح پر رکھیں۔
توقفت قراءة الحساس. اضغط تفعيل الحساس لإعادة المحاولة.|Sensor readings stopped. Enable the sensor to try again.|سینسر کی ریڈنگ رک گئی ہے۔ دوبارہ کوشش کے لیے سینسر فعال کریں۔
أنت قريب من اتجاه القبلة حسب قراءة الحساس. أبقِ الهاتف مسطحًا وبعيدًا عن المعادن.|The sensor shows you are close to the qibla direction. Keep your phone flat and away from metal.|سینسر کے مطابق آپ کا رخ قبلے کی سمت کے قریب ہے۔ فون ہموار سطح پر اور دھات سے دور رکھیں۔
وجّه أعلى الهاتف نحو علامة الكعبة. قراءة الحساس تقريبية وقد تتأثر بالمجالات المغناطيسية.|Point the top of your phone toward the Kaaba marker. Magnetic fields can affect this estimate.|فون کا اوپری سرا کعبہ کے نشان کی طرف کریں۔ یہ اندازاً سمت ہے اور مقناطیسی میدان اس پر اثر ڈال سکتے ہیں۔
في انتظار قراءة اتجاه موثوقة من الحساس…|Waiting for a reliable compass reading…|کمپاس کی قابلِ اعتماد ریڈنگ کا انتظار ہے…
حساس البوصلة غير متاح هنا. الزاوية المعروضة للموقع فقط.|Compass sensor unavailable. The angle shown is for your location.|کمپاس سینسر دستیاب نہیں۔ دکھایا گیا زاویہ آپ کے مقام کے لیے ہے۔
إذن حساس الاتجاه غير مسموح. اسمح به من إعدادات المتصفح ثم أعد المحاولة.|Allow orientation sensor access in your browser settings, then try again.|براؤزر کی ترتیبات میں سمت کے سینسر کی اجازت دیں اور دوبارہ کوشش کریں۔
لم تصل قراءة موثوقة للبوصلة. فعّل الحساس أو استخدم زاوية الشمال المعروضة مع بوصلة أخرى.|No reliable compass reading yet. Enable the sensor or use the angle from north with another compass.|کمپاس کی قابلِ اعتماد ریڈنگ نہیں ملی۔ سینسر فعال کریں یا شمال سے دکھایا گیا زاویہ کسی دوسرے کمپاس کے ساتھ استعمال کریں۔
تعذّر تفعيل حساس الاتجاه. افتح الصفحة في المتصفح أو راجع أذونات الحركة.|Couldn’t enable the orientation sensor. Open this page in your browser or check motion permissions.|سمت کا سینسر فعال نہیں ہو سکا۔ صفحہ براؤزر میں کھولیں یا حرکت کے سینسر کی اجازت دیکھیں۔
اضغط تفعيل الحساس لاستئناف قراءة الاتجاه.|Enable the sensor to resume compass readings.|سمت کی ریڈنگ دوبارہ شروع کرنے کے لیے سینسر فعال کریں۔
تعذّر تحديد الموقع. اسمح بالموقع أو اختر مدينتك من الإعدادات.|Couldn’t find your location. Allow location access or choose your city in settings.|مقام معلوم نہیں ہو سکا۔ مقام تک رسائی کی اجازت دیں یا ترتیبات میں اپنا شہر منتخب کریں۔
جارٍ تحميل يومي…|Loading My Day…|میرا دن لوڈ ہو رہا ہے…
تفاصيل|Details|تفصیلات
مشاركة الآية كصورة|Share verse as an image|آیت بطور تصویر شیئر کریں
آية اليوم|Verse of the day|آج کی آیت
آية مباركة|Quranic verse|قرآنی آیت
آية كريمة|Quranic verse|قرآنی آیت
مشاركة البطاقة كصورة|Share card as an image|کارڈ بطور تصویر شیئر کریں
معاينة صورة المشاركة|Share image preview|شیئر کی جانے والی تصویر کا پیش منظر
مقاس الصورة|Image format|تصویر کا سائز
حالة / ستوري · 9:16|Story · 9:16|اسٹوری · 9:16
منشور مربع · 1:1|Square post · 1:1|مربع پوسٹ · 1:1
اختر مظهر وألوان البطاقة:|Choose a card theme|کارڈ کا انداز منتخب کریں
🌌 داكن ملكي|🌌 Royal dark|🌌 شاہی سیاہ
📜 ورقي مذهّب|📜 Gold parchment|📜 سنہری کاغذ
🌿 أخضر زمردي|🌿 Emerald green|🌿 زمردی سبز
مشاركة الصورة|Share image|تصویر شیئر کریں
حفظ الصورة|Save image|تصویر محفوظ کریں
نسخ النص|Copy text|متن کاپی کریں
اختر التطبيق من قائمة المشاركة وأكمل النشر بنفسك، أو احفظ الصورة لاستخدامها لاحقًا.|Choose an app to share the image, or save it for later.|تصویر شیئر کرنے کے لیے ایپ منتخب کریں یا اسے بعد کے لیے محفوظ کر لیں۔
جارٍ تجهيز الصورة…|Preparing image…|تصویر تیار ہو رہی ہے…
الصورة جاهزة للمشاركة أو الحفظ|Image ready to share or save|تصویر شیئر یا محفوظ کرنے کے لیے تیار ہے
تعذّر تجهيز الصورة. جرّب اختيار المقاس مرة أخرى.|Couldn’t prepare the image. Select the format again.|تصویر تیار نہیں ہو سکی۔ سائز دوبارہ منتخب کریں۔
المشاركة المباشرة غير متاحة هنا؛ استخدم حفظ الصورة ثم شاركها من جهازك.|Save the image, then share it from your device.|تصویر محفوظ کریں، پھر اسے اپنے آلے سے شیئر کریں۔
تعذّرت المشاركة. يمكنك حفظ الصورة ومشاركتها من جهازك.|Couldn’t share the image. You can save it and share it from your device.|تصویر شیئر نہیں ہو سکی۔ اسے محفوظ کر کے اپنے آلے سے شیئر کریں۔
تم حفظ الصورة|Image saved|تصویر محفوظ ہو گئی
تم طلب تنزيل الصورة. إذا ظهرت في صفحة جديدة، اضغط مطولًا عليها للحفظ.|Download requested. If the image opens in a new tab, press and hold it to save.|ڈاؤن لوڈ کی درخواست بھیج دی گئی۔ اگر تصویر نئے صفحے پر کھلے تو محفوظ کرنے کے لیے اسے دبا کر رکھیں۔
تعذّر حفظ الصورة. حاول مرة أخرى.|Couldn’t save the image. Try again.|تصویر محفوظ نہیں ہو سکی۔ دوبارہ کوشش کریں۔
تم نسخ النص بنجاح 📋|Text copied 📋|متن کاپی ہو گیا 📋
زادٌ لقلبك، ونورٌ ليومك • صدقة جارية|Nourishment for your heart, light for your day • Ongoing charity|دل کی غذا، دن کی روشنی • صدقۂ جاریہ
جهّز دعاءً باسم من تحب، وشاركه مع رابط زاد المسلم.|Prepare a dua for a loved one and share it with a link to Zad Al Muslim.|اپنے پیارے کے نام کی دعا تیار کریں اور زاد المسلم کے لنک کے ساتھ شیئر کریں۔
جهّز دعاءً ورابط مشاركة|Prepare a dua & sharing link|دعا اور شیئرنگ لنک تیار کریں
دليل ما ينفع المتوفى والأدعية المأثورة|Guide to duas & deeds for the deceased|مرحوم کے لیے دعاؤں اور اعمال کی رہنمائی

بث صوتي لأذكار الصباح|Live stream of morning adhkar|صبح کے اذکار کی براہِ راست نشریات
بث صوتي لأذكار المساء|Live stream of evening adhkar|شام کے اذکار کی براہِ راست نشریات
زاد المسلم|Zad Al Muslim|زاد المسلم
الرئيسية|Home|ہوم
يومي مع الله|My daily worship|میری روزانہ عبادت
يومي|My day|میرا دن
الخدمات|Services|خدمات
مقتطفات|Inspiration|منتخب کلپس
الإعدادات والتخصيص|Settings & preferences|ترتیبات اور ترجیحات
الإعدادات|Settings|ترتیبات
الخصوصية|Privacy|رازداری
سياسة الخصوصية|Privacy policy|رازداری کی پالیسی
عن المنصة|About|تعارف
السلام عليكم ✦|Assalamu alaikum ✦|السلام علیکم ✦
الخدمة|Service|خدمت
الكل|All|سبھی
القرآن|Quran|قرآن
الصلاة|Prayer|نماز
الأذكار|Adhkar|اذکار
الدعاء|Dua|دعا
المزيد|More|مزید
المصحف|Mushaf|مصحف
القرآن الكريم|The Holy Quran|قرآن کریم
أذكاري|My adhkar|میرے اذکار
السبحة|Tasbeeh counter|تسبیح کاؤنٹر
📿 السبحة|📿 Tasbeeh counter|📿 تسبیح کاؤنٹر
مواسم الطاعات|Worship seasons|عبادت کے مواقع
باقي الخدمات|All services|تمام خدمات
فهرس الخدمات والعبادات|Services & worship|خدمات اور عبادات
جميع الخدمات والعبادات|All services & worship|تمام خدمات اور عبادات
فهرس المنصة الشامل|Explore the app|ایپ کی فہرست
اختر تصنيفًا أو ابحث عن الخدمة اللي محتاجها.|Choose a category or search for a service.|زمرہ منتخب کریں یا مطلوبہ خدمت تلاش کریں۔
ابحث عن خدمة...|Search services…|خدمات تلاش کریں…
ابحث عن خدمة|Search services|خدمات تلاش کریں
لا توجد خدمة مطابقة|No matching services|کوئی خدمت نہیں ملی
الورد والمتابعة|Daily goals & progress|روزانہ اہداف اور پیش رفت
المعرفة والقصص|Learn & explore|علم اور واقعات
الصلاة والقبلة والمساجد|Prayer, qibla & mosques|نماز، قبلہ اور مساجد
الأذكار والتسبيح|Adhkar & tasbeeh|اذکار اور تسبیح
الدعاء والسكينة|Dua & peace|دعا اور سکون
وردي ومتابعتي|My daily goals|میرے روزانہ اہداف
تعلّم واكتشف|Learn & explore|سیکھیں اور دریافت کریں
صدقة ودعاء للمتوفى|Charity & dua for the deceased|مرحوم کے لیے صدقہ اور دعا
اقرأ واستمع واحفظ موضعك.|Read, listen and save your place.|پڑھیں، سنیں اور اپنا مقام محفوظ کریں۔
فتح المصحف الشريف ←|Open the Mushaf →|مصحف کھولیں ←
الختمة الجماعية|Group khatma|اجتماعی ختم قرآن
احجز جزءًا وشارك في الختمة.|Reserve a juz and join a group khatma.|پارہ منتخب کریں اور ختم قرآن میں شامل ہوں۔
حجز جزء في الختمة ←|Reserve a juz →|پارہ منتخب کریں ←
إذاعات القرآن|Quran radio|قرآن ریڈیو
استمع لإذاعة القاهرة وباقي المحطات.|Listen to Cairo Quran Radio and other stations.|قاہرہ قرآن ریڈیو اور دیگر اسٹیشن سنیں۔
الاستماع للإذاعات ←|Listen to radio →|ریڈیو سنیں ←
مواقيت الصلاة والقبلة|Prayer times & qibla|نماز کے اوقات اور قبلہ
مواقيت الصلاة والقبلة حسب موقعك.|Prayer times and qibla for your location.|اپنے مقام کے مطابق نماز کے اوقات اور قبلہ۔
فتح مواقيت الصلاة ←|View prayer times →|نماز کے اوقات دیکھیں ←
دليل الصلاة|Prayer guide|نماز کی رہنمائی
تعلّم الصلاة خطوة بخطوة.|Learn how to pray, step by step.|مرحلہ وار نماز سیکھیں۔
استكشف فقه الصلاة 🕌 ←|Explore the prayer guide 🕌 →|نماز کی رہنمائی دیکھیں 🕌 ←
مساجد قريبة منك|Nearby mosques|قریبی مساجد
اعثر على المساجد القريبة.|Find mosques near you.|اپنے قریب مساجد تلاش کریں۔
عرض أقرب المساجد ←|Find nearby mosques →|قریبی مساجد دیکھیں ←
أذكار اليوم وحصن المسلم|Daily adhkar & Hisn al-Muslim|روزانہ اذکار اور حصن المسلم
أذكار يومك مع حفظ تقدمك.|Daily adhkar with saved progress.|روزانہ اذکار، محفوظ پیش رفت کے ساتھ۔
تصفح الأذكار ←|Browse adhkar →|اذکار دیکھیں ←
عداد تسبيح ذكي تفاعلي.|An interactive tasbeeh counter.|تسبیح کا آسان کاؤنٹر۔
فتح السبحة ←|Open counter →|تسبیح کھولیں ←
الأدعية النبوية والقرآنية|Quranic & prophetic duas|قرآنی اور مسنون دعائیں
أدعية مصنفة للنسخ والمشاركة.|Browse, copy and share duas.|دعائیں دیکھیں، نقل کریں اور شیئر کریں۔
استعراض الأدعية ←|Browse duas →|دعائیں دیکھیں ←
بوصلة القلوب|Heart compass|دل کا سکون
اختار شعورك واقرأ ذكرًا مناسبًا.|Choose how you feel and read a suitable dhikr.|اپنی کیفیت منتخب کریں اور مناسب ذکر پڑھیں۔
اختار شعورك ←|Choose how you feel →|اپنی کیفیت منتخب کریں ←
حائط الدعاء|Dua wall|دعاؤں کی دیوار
اطلب الدعاء لنفسك أو لغيرك، وادعُ لأصحاب الطلبات.|Ask for dua for yourself or others, and pray for them.|اپنے یا دوسروں کے لیے دعا کی درخواست کریں اور ان کے لیے دعا کریں۔
زيارة حائط الدعاء ←|Visit the dua wall →|دعاؤں کی دیوار دیکھیں ←
الورد اليومي والمهام|Daily worship & tasks|روزانہ عبادات اور کام
تابع عباداتك اليومية.|Track your daily worship.|اپنی روزانہ عبادات کی پیش رفت دیکھیں۔
متابعة الورد ←|Track daily worship →|روزانہ عبادات دیکھیں ←
تحدي 7 أيام|7-day challenge|۷ دن کا چیلنج
ابدأ عادة يومية وتابع تقدمك خلال أسبوع.|Build a daily habit and follow your progress for a week.|روزانہ کی عادت بنائیں اور ہفتے بھر کی پیش رفت دیکھیں۔
ابدأ التحدي ←|Start the challenge →|چیلنج شروع کریں ←
حديقة الحسنات وشجرة الذكر|Good deeds garden & dhikr tree|نیکیوں کا باغ اور ذکر کا درخت
تابع تقدمك في الذكر والقراءة.|Follow your dhikr and reading progress.|ذکر اور تلاوت کی پیش رفت دیکھیں۔
دخول حديقة الحسنات ←|Open the garden →|باغ کھولیں ←
مواسم الطاعات والتقويم|Worship seasons & calendar|عبادت کے مواقع اور تقویم
التقويم الهجري ومواسم الطاعات.|Hijri calendar and worship seasons.|ہجری تقویم اور عبادت کے مواقع۔
عرض التقويم والمواسم ←|View calendar & seasons →|تقویم اور مواقع دیکھیں ←
أسماء الله الحسنى|Names of Allah|اللہ کے خوبصورت نام
تعرّف على الأسماء ومعانيها.|Explore the names and their meanings.|اسماء اور ان کے معانی جانیں۔
استكشاف الأسماء الحسنى ←|Explore the names →|اسماء الحسنیٰ دیکھیں ←
قصص الأنبياء والصحابة|Prophets & companions|انبیاء اور صحابہ کے واقعات
اقرأ قصص الأنبياء والصحابة.|Read about the prophets and companions.|انبیاء اور صحابہ کے واقعات پڑھیں۔
قراءة القصص ←|Read stories →|واقعات پڑھیں ←
اختبر معلوماتك|Quiz|اپنا علم آزمائیں
اختبر معلوماتك بأسئلة متنوعة.|Test your knowledge with a variety of questions.|مختلف سوالات سے اپنا علم آزمائیں۔
بدء الاختبار ←|Start the quiz →|سوالات شروع کریں ←
تصفح المقتطفات ←|Browse clips →|کلپس دیکھیں ←
شاهد المواعظ أو استمع لها.|Watch or listen to reminders.|نصیحتیں دیکھیں یا سنیں۔
الزكاة|Zakat|زکوٰۃ
حاسبة الزكاة|Zakat calculator|زکوٰۃ کیلکولیٹر
احسب زكاة المال والذهب والتجارة.|Calculate zakat on savings, gold and trade.|مال، سونے اور تجارت کی زکوٰۃ کا حساب کریں۔
احسب زكاتك الآن ←|Calculate zakat →|زکوٰۃ کا حساب کریں ←
صدقة جارية|Ongoing charity|صدقہ جاریہ
إنشاء بطاقة الآن ←|Create a card →|کارڈ بنائیں ←
أدعية الزوار|Visitors’ duas|زائرین کی دعائیں
إهداء دعاء ←|Offer a dua →|دعا پیش کریں ←
أحكام الجنائز وفضل الصدقة|Funerals & charity guide|جنازے اور صدقے کی رہنمائی
دليل أحكام الجنائز والصدقة.|A guide to funerals and charity.|جنازے اور صدقے کی رہنمائی۔
قراءة الأحكام ←|Read the guide →|رہنمائی پڑھیں ←
فتح الكل|Expand all|سب کھولیں
طي الكل|Collapse all|سب بند کریں
التنبيهات والأذان|Notifications & adhan|اطلاعات اور اذان
مواقيت الصلاة|Prayer times|نماز کے اوقات
الخط والقراءة|Font & reading|خط اور مطالعہ
اللغة|Language|زبان
لغة التطبيق|App language|ایپ کی زبان
اختر لغة الواجهة. تظل نصوص القرآن والأذكار والأحاديث بالعربية.|Choose the interface language. Quran, adhkar and hadith texts remain in Arabic.|ایپ کی زبان منتخب کریں۔ قرآن، اذکار اور احادیث کے متن عربی میں رہیں گے۔
أقسام الرئيسية|Home sections|ہوم کے حصے
الاختصارات المفضلة|Favorite shortcuts|پسندیدہ شارٹ کٹس
النسخ والبيانات|Backups & data|بیک اپ اور ڈیٹا
المساعدة والتشخيص|Help & diagnostics|مدد اور تشخیص
تصويب واقتراح|Report & suggest|تصحیح اور تجاویز
إظهار الكل|Show all|سب دکھائیں
حفظ ملف النسخة|Save backup file|بیک اپ فائل محفوظ کریں
اختيار ملف النسخة (.json)|Choose backup file (.json)|بیک اپ فائل منتخب کریں (.json)
إعادة ضبط|Reset|دوبارہ ترتیب دیں
طلب إذن التنبيهات|Allow notifications|اطلاعات کی اجازت دیں
تجربة إرسال تنبيه|Send a test notification|آزمائشی اطلاع بھیجیں
تحديث الحالة|Refresh status|حالت تازہ کریں
إعادة تطبيق الإعدادات|Apply settings again|ترتیبات دوبارہ لاگو کریں
المدينة:|City:|شہر:
اختر المدينة:|Choose a city:|شہر منتخب کریں:
طريقة الحساب الفقهية:|Calculation method:|حساب کا طریقہ:
تلقائي حسب المدينة|Automatic by city|شہر کے مطابق خودکار
أم القرى (مكة المكرمة والخليج)|Umm al-Qura (Makkah & Gulf)|ام القریٰ (مکہ اور خلیج)
الهيئة المصرية العامة للمساحة|Egyptian General Authority of Survey|مصری محکمہ مساحت
رابطة العالم الإسلامي|Muslim World League|رابطہ عالم اسلامی
أمريكا الشمالية (ISNA)|North America (ISNA)|شمالی امریکہ (ISNA)
معهد الجيوفيزياء (طهران)|Institute of Geophysics (Tehran)|ادارہ جیو فزکس (تہران)
منطقة الخليج|Gulf region|خلیجی خطہ
وزارة الأوقاف والشؤون الإسلامية (الكويت)|Ministry of Awqaf (Kuwait)|وزارت اوقاف (کویت)
وزارة الأوقاف (قطر)|Ministry of Awqaf (Qatar)|وزارت اوقاف (قطر)
رئاسة الشؤون الدينية (تركيا)|Diyanet (Turkey)|دیانت (ترکی)
حساب صلاة العصر:|Asr calculation:|عصر کا حساب:
الجمهور (الشافعي، المالكي، الحنبلي)|Standard (Shafi‘i, Maliki, Hanbali)|جمہور (شافعی، مالکی، حنبلی)
المذهب الحنفي|Hanafi|حنفی
تعديل التاريخ الهجري (رؤية الهلال):|Hijri date adjustment:|ہجری تاریخ کی درستگی:
تلقائي (حسب تقويم أم القرى)|Automatic (Umm al-Qura)|خودکار (ام القریٰ)
تأخير يومين (-2)|Two days earlier (-2)|دو دن پیچھے (-2)
تأخير يوم واحد (-1)|One day earlier (-1)|ایک دن پیچھے (-1)
تقديم يوم واحد (+1)|One day later (+1)|ایک دن آگے (+1)
تقديم يومين (+2)|Two days later (+2)|دو دن آگے (+2)
الفجر|Fajr|فجر
الظهر|Dhuhr|ظہر
العصر|Asr|عصر
المغرب|Maghrib|مغرب
العشاء|Isha|عشاء
الشروق|Sunrise|طلوع آفتاب
صوت المؤذن المفضل:|Preferred adhan voice:|پسندیدہ مؤذن:
سماع|Preview|سنیں
قبل الموعد بـ:|Remind me before:|وقت سے پہلے یاد دہانی:
التكرار:|Repeat:|تکرار:
صوت التذكير:|Reminder sound:|یاد دہانی کی آواز:
الصوت الافتراضي|Default sound|پہلے سے طے شدہ آواز
الصوت الأول|Sound 1|آواز ۱
الصوت الثاني|Sound 2|آواز ۲
صوت|Sound|آواز
🔊 صوت|🔊 Sound|🔊 آواز
🔊 تشغيل الصوت|🔊 Enable sound|🔊 آواز فعال کریں
كل ساعة|Every hour|ہر گھنٹے
كل ساعة (الافتراضي)|Every hour (default)|ہر گھنٹے (طے شدہ)
كل ساعتين|Every 2 hours|ہر ۲ گھنٹے
كل 3 ساعات|Every 3 hours|ہر ۳ گھنٹے
كل 4 ساعات|Every 4 hours|ہر ۴ گھنٹے
5 دقائق|5 minutes|۵ منٹ
10 دقائق|10 minutes|۱۰ منٹ
15 دقيقة|15 minutes|۱۵ منٹ
20 دقيقة|20 minutes|۲۰ منٹ
كل 15 دقيقة|Every 15 minutes|ہر ۱۵ منٹ
كل 30 دقيقة|Every 30 minutes|ہر ۳۰ منٹ
كل 45 دقيقة|Every 45 minutes|ہر ۴۵ منٹ
حفظ وتفعيل التنبيهات ✨|Save & enable reminders ✨|محفوظ کریں اور یاد دہانیاں فعال کریں ✨
إعدادات الأذان والتنبيهات|Adhan & reminder settings|اذان اور یاد دہانی کی ترتیبات
إعادة محاولة تفعيل التنبيهات|Retry enabling notifications|اطلاعات دوبارہ فعال کریں
سماع التنبيه الناطق|Preview spoken reminder|بولنے والی یاد دہانی سنیں
صلاة المعاينة|Prayer preview|نماز کا پیش منظر
معاينة وتجربة شاشة الأذان بالصورة|Preview the adhan screen|اذان کی اسکرین کا پیش منظر
استمرار الأذان|Continue adhan|اذان جاری رکھیں
إيقاف الأذان|Stop adhan|اذان روکیں
المتصفح لا يضمن تشغيل الأذان عند إغلاقه.|Adhan playback is not guaranteed when the browser is closed.|براؤزر بند ہونے پر اذان چلنے کی ضمانت نہیں۔
مستوى الصوت للعينة والتشغيل داخل المتصفح.|This volume applies to previews and browser playback.|یہ آواز پیش منظر اور براؤزر میں چلانے کے لیے ہے۔
تعذّر تنفيذ الطلب. حاول مرة أخرى.|Could not complete the request. Try again.|درخواست مکمل نہیں ہو سکی۔ دوبارہ کوشش کریں۔
تُحفظ التغييرات تلقائيًا. حالة التنبيهات أدناه توضّح هل تم تطبيقها في الهاتف.|Changes are saved automatically. The notification status below shows whether they were applied on your phone.|تبدیلیاں خود محفوظ ہوتی ہیں۔ نیچے اطلاعات کی حالت بتاتی ہے کہ وہ فون پر لاگو ہوئی ہیں یا نہیں۔
حجم الخط|Font size|خط کا سائز
نوع الخط|Font family|خط کی قسم
الخط|Font|خط
التشكيل|Diacritics|اعراب
إظهار التشكيل|Show diacritics|اعراب دکھائیں
إخفاء التشكيل|Hide diacritics|اعراب چھپائیں
أميري|Amiri|امیری
نسخ|Copy|نقل کریں
شهرزاد|Scheherazade|شہرزاد
القاهرة|Cairo|قاہرہ
أذكار الصباح|Morning adhkar|صبح کے اذکار
أذكار المساء|Evening adhkar|شام کے اذکار
أذكار النوم|Bedtime adhkar|سونے کے اذکار
بعد الصلاة|After prayer|نماز کے بعد
الرقية الشرعية|Ruqyah|شرعی رقیہ
حصن المسلم|Hisn al-Muslim|حصن المسلم
الاستماع للسورة|Listen to the surah|سورت سنیں
القارئ|Reciter|قاری
استماع|Listen|سنیں
تنزيل السورة|Download surah|سورت ڈاؤن لوڈ کریں
انتقل لصفحة|Go to page|صفحے پر جائیں
رقم الصفحة من ١ إلى ٦٠٤|Page number, 1–604|صفحہ نمبر، ۱ تا ۶۰۴
انتقل|Go|جائیں
فهرس المصحف الشريف|Mushaf index|مصحف کی فہرست
السور (114)|Surahs (114)|سورتیں (۱۱۴)
الأجزاء (30)|Juz (30)|پارے (۳۰)
علاماتي|My bookmarks|میری نشانیاں
ختمتي ووردي|My khatma & daily reading|میرا ختم قرآن اور روزانہ تلاوت
ابدأ ورد اليوم|Start today’s reading|آج کی تلاوت شروع کریں
علامة|Bookmark|نشانی
فاصل|Divider|فاصلہ
ملاحظة|Note|نوٹ
تلاوة|Recitation|تلاوت
التفسير الميسر|Al-Tafsir al-Muyassar|تفسیر میسر
العلامات المرجعية|Bookmarks|نشانیاں
إضافة علامة جديدة للموضع الحالي 🔖|Bookmark this position 🔖|اس مقام کی نشانی لگائیں 🔖
جميع الأجزاء (30)|All juz (30)|تمام پارے (۳۰)
المتاح للحجز|Available|دستیاب
قيد القراءة|Being read|پڑھا جا رہا ہے
المكتملة|Completed|مکمل
تصفح المصحف الشريف بدون إنترنت|Read the Mushaf offline|مصحف آف لائن پڑھیں
تحميل المصحف كاملاً|Download the whole Mushaf|مکمل مصحف ڈاؤن لوڈ کریں
تحميل السور الفاضلة|Download selected surahs|منتخب سورتیں ڈاؤن لوڈ کریں
إلغاء التحميل|Cancel download|ڈاؤن لوڈ منسوخ کریں
تفريغ الذاكرة المؤقتة للمصحف|Clear downloaded Mushaf pages|مصحف کے ڈاؤن لوڈ شدہ صفحات حذف کریں
مساعد الحفظ وتكرار الآيات|Memorization & verse repetition|حفظ اور آیات کی تکرار
مساعد حفظ وتثبيت القرآن الكريم|Quran memorization assistant|حفظ قرآن کا معاون
القارئ للحفظ:|Memorization reciter:|حفظ کے لیے قاری:
تكرار كل آية:|Repeat each verse:|ہر آیت کی تکرار:
∞ مستمر|∞ Continuous|∞ مسلسل
الانتقال التلقائي للآية التالية بعد انتهاء التكرار|Move to the next verse after repeating|تکرار کے بعد اگلی آیت پر جائیں
السورة:|Surah:|سورت:
القارئ المعلم:|Teaching reciter:|معلم قاری:
نطاق الآيات:|Verse range:|آیات کی حد:
بدء التحفيظ والتكرار|Start memorization & repetition|حفظ اور تکرار شروع کریں
اختبر حفظك (إخفاء النص)|Test memorization (hide text)|حفظ آزمائیں (متن چھپائیں)
اتجاه القبلة|Qibla direction|قبلے کی سمت
موقعي (GPS)|My location (GPS)|میرا مقام (GPS)
موقعي الحالي|My location|میرا موجودہ مقام
تفعيل حساس الحركة|Enable motion sensor|حرکت کا سینسر فعال کریں
أقرب المساجد إليك|Nearby mosques|آپ کے قریب مساجد
قائمة المساجد والجوامع|Mosque list|مساجد کی فہرست
الخريطة التفاعلية|Interactive map|نقشہ
بحث|Search|تلاش کریں
تحميل|Download|ڈاؤن لوڈ
تنزيل|Download|ڈاؤن لوڈ
التنزيلات|Downloads|ڈاؤن لوڈز
المحفوظة|Saved|محفوظ
بدون إنترنت|Offline|آف لائن
المحطات|Stations|اسٹیشن
المفضلة|Favorites|پسندیدہ
تشغيل|Play|چلائیں
إيقاف|Stop|روکیں
إيقاف مؤقت|Pause|عارضی طور پر روکیں
إغلاق|Close|بند کریں
رجوع|Back|واپس
حفظ|Save|محفوظ کریں
إلغاء|Cancel|منسوخ کریں
حذف|Delete|حذف کریں
مسح|Clear|صاف کریں
تأكيد|Confirm|تصدیق کریں
التالي|Next|اگلا
السابق|Previous|پچھلا
مشاركة|Share|شیئر کریں
نسخ الرابط|Copy link|لنک نقل کریں
تم النسخ|Copied|نقل ہو گیا
متابعة|Continue|جاری رکھیں
من البداية|From the start|شروع سے
صوت فقط|Audio only|صرف آواز
مشاهدة الآن|Watch now|ابھی دیکھیں
مشاركة كصدقة|Share as charity|صدقے کی نیت سے شیئر کریں
عنوان الفيديو|Video title|ویڈیو کا عنوان
أقسام الإعدادات|Settings sections|ترتیبات کے حصے
تخصيص الاختصارات|Customize shortcuts|شارٹ کٹس تبدیل کریں
تخصيص أقسام الرئيسية|Customize home sections|ہوم کے حصے تبدیل کریں
عرض التفاصيل|View details|تفصیل دیکھیں
رحلتك الإيمانية اليوم|Your worship journey today|آج کا عبادت کا سفر
باقي مهام اليوم|Remaining daily tasks|آج کے باقی کام
متابعة تفاصيل الورد|View daily progress|روزانہ کی پیش رفت دیکھیں
رحلتك مع القرآن|Your Quran journey|قرآن کے ساتھ آپ کا سفر
صلاة الضحى • صدقة عن كل مفصل|Duha prayer • Charity for every joint|نماز چاشت • ہر جوڑ کا صدقہ
دليل الصلاة والسنن|Prayer & sunnah guide|نماز اور سنتوں کی رہنمائی
الفجر في وقته|Fajr on time|فجر وقت پر
ورد القرآن · صفحتان|Quran reading · Two pages|قرآن کی تلاوت · دو صفحات
الضحى أو الوتر|Duha or Witr|چاشت یا وتر
الصلاة على النبي ﷺ · ١٠٠ مرة|Salawat upon the Prophet ﷺ · 100 times|نبی ﷺ پر درود · ۱۰۰ مرتبہ
صدقة أو إحسان أو صلة رحم|Charity, kindness or family ties|صدقہ، احسان یا صلہ رحمی
تحدي الـ 7 أيام الإيماني|7-day worship challenge|۷ دن کا عبادت کا چیلنج
إعادة ضبط التحدي من اليوم الأول|Restart the challenge from day one|چیلنج پہلے دن سے دوبارہ شروع کریں
تصفير|Reset counter|گنتی صفر کریں
إعادة ضبط اليوم|Reset today|آج کی پیش رفت دوبارہ شروع کریں
ردّد الذكر|Repeat the dhikr|ذکر دہرائیں
مفتوح ∞|Unlimited ∞|لامحدود ∞
اسأل زاد|Ask Zad|زاد سے پوچھیں
اكتب سؤالك...|Type your question…|اپنا سوال لکھیں…
إرسال|Send|بھیجیں
محادثة جديدة|New conversation|نئی گفتگو
موضع الخطأ:|Where is the issue?|غلطی کہاں ہے؟
تفاصيل الخطأ أو الملاحظة:|Issue or suggestion details:|غلطی یا تجویز کی تفصیل:
إرسال البلاغ للإدارة فوراً ✨|Send report ✨|رپورٹ بھیجیں ✨
جميع أقسام الرئيسية مخفية حاليًا|All home sections are currently hidden|ہوم کے تمام حصے اس وقت چھپے ہوئے ہیں
تثبيت الآن|Install now|ابھی انسٹال کریں
تثبيت التطبيق على جهاز الآيفون (iOS)|Install on iPhone (iOS)|آئی فون (iOS) پر انسٹال کریں
فهمت، بارك الله فيكم|Got it, thank you|سمجھ گیا، جزاکم اللہ
كمّل من مكانك|Continue where you left off|جہاں چھوڑا تھا وہاں سے جاری رکھیں
محفوظاتي|My saved items|میری محفوظ چیزیں
الأحد|Sunday|اتوار
الاثنين|Monday|پیر
الثلاثاء|Tuesday|منگل
الأربعاء|Wednesday|بدھ
الخميس|Thursday|جمعرات
الجمعة|Friday|جمعہ
السبت|Saturday|ہفتہ
`;
 const more=`
مدينة المواقيت المحددة|Selected prayer city|نماز کے اوقات کا منتخب شہر
تخصيص شامل لتطبيق زاد المسلم. جميع التغييرات تُحفظ وتُطبّق تلقائيًا وفورياً على جهازك.|Customize Zad Al Muslim. Changes are saved and applied automatically on this device.|زاد المسلم کو اپنی پسند کے مطابق ترتیب دیں۔ تبدیلیاں اس آلے پر خود محفوظ اور لاگو ہوتی ہیں۔
تحكم كامل في أوقات الأذان، التنبيه المسبق، أذكار الصباح والمساء، وسنن الأسبوع مع خيارات الصوت والتخصيص:|Manage adhan, advance reminders, daily adhkar and weekly reminders:|اذان، پیشگی یاد دہانی، روزانہ اذکار اور ہفتہ وار یاد دہانی کی ترتیبات:
صوت الأذان والصلوات الخمس|Adhan & the five prayers|اذان اور پانچ نمازیں
صوت الأذان في وقته|Adhan at prayer time|نماز کے وقت اذان
رفع الأذان تلقائياً عند دخول وقت كل صلاة مفعلة|Play adhan automatically for each enabled prayer|فعال نمازوں کے وقت خودکار اذان
الشيخ ناصر القطامي (الافتراضي)|Nasser Al-Qatami (default)|ناصر القطامی (طے شدہ)
الشيخ عبد الباسط عبد الصمد|Abdul Basit Abdus Samad|عبد الباسط عبد الصمد
الشيخ محمد رفعت|Muhammad Rifaat|محمد رفعت
أذان الحرم المكي الشريف|Adhan from Makkah|حرم مکی کی اذان
أذان الحرم المدني الشريف|Adhan from Madinah|حرم مدنی کی اذان
أذان المسجد الأقصى المبارك|Adhan from Al-Aqsa|مسجد اقصیٰ کی اذان
مستوى صوت الأذان:|Adhan volume:|اذان کی آواز:
⏳ اقتربت الصلاة (تنبيه مسبق ناطق)|⏳ Prayer approaching (spoken reminder)|⏳ نماز کا وقت قریب ہے (صوتی یاد دہانی)
تنبيه صوتي ناطق يذكّرك بالوضوء والاستعداد قبل دخول الوقت|A spoken reminder to prepare and make wudu before prayer time|نماز سے پہلے وضو اور تیاری کی صوتی یاد دہانی
🖼️ عرض صورة الصلاة مع الأذان والإشعارات|🖼️ Show prayer images with adhan & notifications|🖼️ اذان اور اطلاعات میں نماز کی تصویر دکھائیں
إظهار الصورة المخصصة لكل صلاة على شاشة الأذان وبطاقات المواقيت والإشعارات|Show each prayer’s image on the adhan screen, time cards and notifications|اذان کی اسکرین، اوقات کے کارڈ اور اطلاعات میں ہر نماز کی تصویر دکھائیں
الأذكار اليومية وسنن الأسبوع|Daily adhkar & weekly sunnahs|روزانہ اذکار اور ہفتہ وار سنتیں
🌅 أذكار الصباح|🌅 Morning adhkar|🌅 صبح کے اذکار
🌇 أذكار المساء|🌇 Evening adhkar|🌇 شام کے اذکار
🌙 أذكار النوم والتحصين|🌙 Bedtime adhkar & protection|🌙 سونے اور حفاظت کے اذکار
ﷺ التذكير بالصلاة على النبي|ﷺ Salawat reminder|ﷺ درود کی یاد دہانی
تنبيه صوتي وإشعار دوري بالصلاة والسلام على الحبيب المصطفى ﷺ حتى والتطبيق مغلق وقفل الشاشة|Periodic salawat reminders, including when the app is closed or the screen is locked|ایپ بند یا اسکرین مقفل ہونے پر بھی درود کی وقفے وقفے سے یاد دہانی
✨ تذكير سورة الكهف (يوم الجمعة)|✨ Surah Al-Kahf reminder (Friday)|✨ سورہ کہف کی یاد دہانی (جمعہ)
🌿 تذكير صيام الإثنين والخميس|🌿 Monday & Thursday fasting reminder|🌿 پیر اور جمعرات کے روزوں کی یاد دہانی
تُحفظ اختياراتك تلقائيًا.|Your choices are saved automatically.|آپ کے انتخاب خود محفوظ ہوتے ہیں۔
حدد مدينتك|Choose your city|اپنا شہر منتخب کریں
حدد مدينتك وطريقة حساب مواقيت الصلاة المناسبة لك:|Choose your city and prayer time calculation method:|اپنا شہر اور نماز کے اوقات کے حساب کا طریقہ منتخب کریں:
اختار الخط والحجم والتشكيل مرة واحدة؛ تتطبّق على الأذكار والأدعية والأحاديث وشروحها في كل الأقسام. إعدادات المصحف مستقلة.|Set font, size and diacritics once for adhkar, duas, hadiths and explanations throughout the app. Mushaf settings are separate.|خط، سائز اور اعراب ایک بار منتخب کریں؛ یہ تمام حصوں کے اذکار، دعاؤں، احادیث اور وضاحتوں پر لاگو ہوں گے۔ مصحف کی ترتیبات الگ ہیں۔
تخصيص ما يظهر في الصفحة الرئيسية|Customize your home screen|ہوم اسکرین کے حصے منتخب کریں
تحكم بالكامل في أقسام وبطاقات الصفحة الرئيسية؛ انقر على أي قسم لتفعيله أو إخفائه حسب رغبتك واحتياجك. يتم الحفظ والتطبيق فوراً:|Tap a home section to show or hide it. Changes apply immediately:|ہوم کے کسی حصے کو دکھانے یا چھپانے کے لیے دبائیں۔ تبدیلی فوراً لاگو ہوتی ہے:
اختصاراتك المفضلة في الصفحة الرئيسية|Your home screen shortcuts|ہوم اسکرین کے پسندیدہ شارٹ کٹس
انقر على أي أداة لإضافتها أو إزالتها من شريط الوصول السريع بالصفحة الرئيسية. يتم الحفظ والتحديث فوراً.|Tap a tool to add or remove it from your home shortcuts. Changes are saved immediately.|ہوم کے شارٹ کٹس میں کسی آلے کو شامل یا خارج کرنے کے لیے دبائیں۔ تبدیلی فوراً محفوظ ہوتی ہے۔
النسخ والاحتياط لتقدمك الإيماني|Back up your progress|اپنی پیش رفت کا بیک اپ
احفظ ختماتك، علامات القراءة، الملاحظات، وسجل أذكارك في ملف آمن لنقله لأي جهاز آخر:|Save your khatma, bookmarks, notes and adhkar progress in a backup file to transfer to another device:|اپنا ختم قرآن، نشانیاں، نوٹس اور اذکار کی پیش رفت دوسرے آلے پر منتقل کرنے کے لیے بیک اپ فائل بنائیں:
تصدير نسخة احتياطية|Export backup|بیک اپ برآمد کریں
يحفظ تقدمك وملاحظاتك وتفضيلاتك، ولا يشمل كلمات المرور أو الموقع الدقيق أو الملفات الصوتية المنزّلة.|Includes progress, notes and preferences. Excludes passwords, precise location and downloaded audio.|پیش رفت، نوٹس اور ترجیحات محفوظ ہوتی ہیں۔ پاس ورڈ، درست مقام اور ڈاؤن لوڈ شدہ آڈیو شامل نہیں۔
استرجاع نسخة سابقة|Restore backup|بیک اپ بحال کریں
اختر ملف نسخة احتياطية محفوظة لاسترجاع تقدمك السابق على هذا الجهاز:|Choose a backup file to restore your progress on this device:|اس آلے پر اپنی پیش رفت بحال کرنے کے لیے بیک اپ فائل منتخب کریں:
إعادة ضبط الإعدادات|Reset settings|ترتیبات دوبارہ طے کریں
استعادة كافة إعدادات المواقيت، الخط، التنبيهات، والواجهة إلى الوضع الافتراضي مع الحفاظ على محفوظات القرآن والأذكار.|Restore default prayer, font, notification and appearance settings while keeping Quran and adhkar progress.|قرآن اور اذکار کی پیش رفت برقرار رکھتے ہوئے اوقات، خط، اطلاعات اور ظاہری شکل کی طے شدہ ترتیبات بحال کریں۔
المساعدة والتشخيص الفني|Help & diagnostics|مدد اور تشخیص
فحص أذونات الإشعارات، دقة الأذان والتنبيهات في الخلفية، واختبار عمل المنبهات على جهازك:|Check notification permissions, background reminders and adhan delivery on your device:|اپنے آلے پر اطلاعات کی اجازت، پس منظر کی یاد دہانی اور اذان کی جانچ کریں:
حالة التنبيهات والأذونات ودقة الأذان|Notification permissions & adhan status|اطلاعات کی اجازت اور اذان کی حالت
إرشادات لضمان عمل الأذان بدون توقف|Tips for reliable adhan reminders|اذان کی یاد دہانی کے لیے ہدایات
أجهزة شاومي وريلمي وأوبو:|Xiaomi, Realme & Oppo:|شاومی، ریئل می اور اوپو:
يرجى تفعيل (التشغيل التلقائي Auto-start) وإلغاء قيود توفير شحن البطارية للتطبيق.|Enable auto-start and remove battery saving restrictions for this app.|خودکار آغاز فعال کریں اور ایپ کی بیٹری کی پابندیاں ہٹائیں۔
أجهزة سامسونج:|Samsung:|سام سنگ:
تأكد من وضع التطبيق في قائمة (التطبيقات التي لا يتم إيقافها مطلقاً Never sleeping apps).|Add this app to the Never sleeping apps list.|ایپ کو Never sleeping apps کی فہرست میں شامل کریں۔
أجهزة آيفون (iOS):|iPhone (iOS):|آئی فون (iOS):
تأكد من تفعيل الإشعارات وتحديد أصوات التنبيهات من إعدادات النظام الرئيسية.|Enable notifications and notification sounds in your system settings.|نظام کی ترتیبات میں اطلاعات اور ان کی آواز فعال کریں۔
مستوى الصوت:|Volume:|آواز:
تأكد من أن مستوى صوت الوسائط والتنبيهات في الهاتف ليس في وضع الصامت التام.|Check that media and notification volumes are not muted.|یقینی بنائیں کہ میڈیا اور اطلاعات کی آواز خاموش نہیں۔
الإبلاغ عن خطأ أو اقتراح تصويب|Report an error or suggest a correction|غلطی کی اطلاع یا تصحیح کی تجویز
جزاك الله خيراً على تنبيهنا لأي خطأ طباعي أو لغوي؛ تصل الملاحظات مباشرة إلى لوحة تحكم الإدارة لمراجعتها وتصويبها فوراً:|Thank you for reporting wording or typing errors. Reports reach the admin dashboard for review:|املا یا زبان کی غلطیوں کی اطلاع دینے پر شکریہ۔ رپورٹ جائزے کے لیے انتظامیہ تک پہنچتی ہے:
نوع خط القراءة|Reading font|پڑھنے کا خط
حجم خط القراءة|Reading font size|پڑھنے کے خط کا سائز
تصغير خط القراءة|Decrease reading font size|پڑھنے کا خط چھوٹا کریں
تكبير خط القراءة|Increase reading font size|پڑھنے کا خط بڑا کریں
معاينة القراءة|Reading preview|مطالعے کا پیش منظر
استعادة الافتراضي|Restore defaults|طے شدہ ترتیبات بحال کریں
تم حفظ إعدادات القراءة وتطبيقها.|Reading preferences saved and applied.|مطالعے کی ترتیبات محفوظ اور لاگو ہو گئیں۔
السلام عليكم|Assalamu alaikum|السلام علیکم
نُورٌ لِقَلْبِكَ وَضِيَاءٌ لِيَوْمِك|Light for your heart and your day|آپ کے دل اور دن کے لیے روشنی
آيَـةُ الـيَـوْمِ|Verse of the day|آج کی آیت
تتجدد تلقائياً كل يوم|Updated automatically each day|ہر روز خود تازہ ہوتا ہے
الصلاة القادمة|Next prayer|اگلی نماز
جارٍ تحميل مواقيت مدينتك…|Loading your city’s prayer times…|آپ کے شہر کے نماز کے اوقات لوڈ ہو رہے ہیں…
صلاتك في وقتها|Pray on time|نماز وقت پر
تختلف المواقيت حسب مدينتك|Times vary by city|اوقات شہر کے مطابق بدلتے ہیں
ركعتان تجزئان عن الصدقات، وتجلبان البركة والسكينة.|Two rak‘ahs of Duha, a daily act of charity.|چاشت کی دو رکعتیں، روزانہ کا صدقہ۔
خطوة صغيرة كل يوم ترتقي بها|A small step forward each day|ہر دن ایک چھوٹا قدم آگے
زاد اليوم|Today’s inspiration|آج کا زاد
وردك اليوم|Today’s worship|آج کا ورد
يتجدد تلقائياً كل فجر|Resets automatically each Fajr|ہر فجر خود نئے سرے سے شروع ہوتا ہے
نور يومك • موعظة اليوم المرئية 🌿|Brighten your day • Today’s reminder 🌿|اپنا دن روشن کریں • آج کی نصیحت 🌿
موعظة|Reminder|نصیحت
عنوان موعظة اليوم|Today’s reminder|آج کی نصیحت
وصف المقطع الإيماني...|Clip description…|کلپ کی تفصیل…
أثرٌ طيب لا ينقطع|A lasting act of kindness|نیکی کا دائمی اثر
صدقة جارية لمن تحب 🤍|Ongoing charity for someone you love 🤍|اپنے پیاروں کے لیے صدقہ جاریہ 🤍
اجعل لمن تحب نصيباً مستمراً من تلاوة القرآن والدعاء الصالح يصله أثره وبركته بإذن الله.|Create a page for a loved one to bring together Quran readings and duas.|اپنے پیارے کے لیے قرآن کی تلاوت اور دعائیں جمع کرنے کا صفحہ بنائیں۔
أنشئ صفحة صدقة جارية بالاسم الآن|Create a named charity page|نام کے ساتھ صدقہ جاریہ کا صفحہ بنائیں
دليل ما ينفع المتوفى والأدعية المأثورة ←|Guide to duas & deeds for the deceased →|مرحوم کے لیے دعاؤں اور اعمال کی رہنمائی ←
يمكنك إعادة تفعيل أي قسم تريده أو استعادة الأقسام الافتراضية بضغطة واحدة من صفحة الإعدادات.|Show any section again or restore the default layout from Settings.|ترتیبات سے کوئی بھی حصہ دوبارہ دکھائیں یا طے شدہ ترتیب بحال کریں۔
منصة إسلامية شاملة خالية من الإعلانات • رفيقك اليومي إلى الله • صدقة جارية بإذن الله.|An ad-free Islamic app • Your daily worship companion • An ongoing charity, insha’Allah.|اشتہارات سے پاک اسلامی ایپ • روزانہ عبادت کا ساتھی • ان شاء اللہ صدقہ جاریہ۔
تنبيهات خفيفة ومباركة في مواعيدها المحددة|Gentle reminders at their scheduled times|مقررہ وقت پر یاد دہانیاں
الصلوات والأذان|Prayers & adhan|نمازیں اور اذان
الأذان كاملاً مع دخول وقت كل صلاة|Full adhan at each prayer time|ہر نماز کے وقت مکمل اذان
الأذكار والتحصين|Adhkar & protection|اذکار اور حفاظت
ﷺ الصلاة على النبي|ﷺ Salawat upon the Prophet|ﷺ نبی پر درود
✨ سورة الكهف (يوم الجمعة)|✨ Surah Al-Kahf (Friday)|✨ سورہ کہف (جمعہ)
🌿 صيام الإثنين والخميس|🌿 Monday & Thursday fasting|🌿 پیر اور جمعرات کے روزے
🌟 بداية خير واستمرار|🌟 A good beginning, a lasting habit|🌟 اچھی شروعات اور مستقل عادت
ابدأ عادة يومية خفيفة وثابتة إلى الله؛ أحب الأعمال إلى الله أدومها وإن قلّ. تقدمك هنا تشجيعي محفوظ على جهازك.|Build a small, consistent daily worship habit. Your progress is saved on this device for encouragement.|روزانہ عبادت کی چھوٹی اور مستقل عادت بنائیں۔ حوصلہ افزائی کے لیے پیش رفت اسی آلے پر محفوظ ہوتی ہے۔
توقفت عند|Last position|آخری مقام
وضع الاستماع الصوتي (توفير باقة البيانات)|Audio mode (save mobile data)|صوتی انداز (موبائل ڈیٹا کی بچت)
السرعة:|Speed:|رفتار:
اسم الشيخ / القناة|Speaker / channel|مقرر / چینل
مفضلتك|Your favorites|آپ کی پسندیدہ خدمات
استخدمتها مؤخرًا|Recently used|حال ہی میں استعمال شدہ
إخفاء|Hide|چھپائیں
إظهار آخر الخدمات|Show recent services|حالیہ خدمات دکھائیں
خدماتك المفضلة|Your favorite services|آپ کی پسندیدہ خدمات
آخر الخدمات|Recent services|حالیہ خدمات
البحث في جميع الخدمات|Search all services|تمام خدمات تلاش کریں
ابحث عن خدمة…|Search services…|خدمات تلاش کریں…
خدمة واحدة|1 service|۱ خدمت
خدمتان|2 services|۲ خدمات
`;
 const tools=`
السورة|Surah|سورت
تلاواتك المحفوظة تعمل بدون إنترنت|Your saved recitations work offline|آپ کی محفوظ تلاوتیں آف لائن چلتی ہیں
إضافة تلاوة جديدة|Add a recitation|نئی تلاوت شامل کریں
اعرف حجم التلاوة قبل التنزيل.|Check the recording size before downloading.|ڈاؤن لوڈ سے پہلے تلاوت کا سائز دیکھیں۔
معرفة الحجم|Check size|سائز دیکھیں
إلغاء التنزيل|Cancel download|ڈاؤن لوڈ منسوخ کریں
تقدّم تنزيل التلاوة|Download progress|ڈاؤن لوڈ کی پیش رفت
موضع التلاوة|Playback position|تلاوت کا مقام
رجوع ١٥ ثانية|Back 15 seconds|۱۵ سیکنڈ پیچھے
تقديم ١٥ ثانية|Forward 15 seconds|۱۵ سیکنڈ آگے
−١٥ ثانية|−15 seconds|−۱۵ سیکنڈ
+١٥ ثانية|+15 seconds|+۱۵ سیکنڈ
لسه مفيش تلاوات محفوظة. اختار سورة وقارئ وابدأ التنزيل.|No saved recitations yet. Choose a surah and reciter to download.|ابھی کوئی تلاوت محفوظ نہیں۔ ڈاؤن لوڈ کے لیے سورت اور قاری منتخب کریں۔
تم حذف التلاوة من هذا الجهاز.|Recitation removed from this device.|تلاوت اس آلے سے حذف ہو گئی۔
تعذّر الحذف. أوقف التنزيل أو التشغيل وأعد المحاولة.|Could not delete. Stop downloading or playback and try again.|حذف نہیں ہو سکا۔ ڈاؤن لوڈ یا تلاوت روک کر دوبارہ کوشش کریں۔
تعذّر فتح التلاوة. أعد المحاولة أو نزّلها من جديد.|Could not open this recitation. Try again or download it again.|تلاوت نہیں کھل سکی۔ دوبارہ کوشش کریں یا دوبارہ ڈاؤن لوڈ کریں۔
تعذّر قراءة التنزيلات. التخزين قد لا يكون متاحًا على هذا الجهاز.|Could not read downloads. Storage may be unavailable on this device.|ڈاؤن لوڈز نہیں پڑھے جا سکے۔ شاید اس آلے پر ذخیرہ دستیاب نہیں۔
التلاوة أكبر من الحد المسموح (٢٥٦ م.ب).|Recording exceeds the 256 MB limit.|تلاوت ۲۵۶ ایم بی کی حد سے بڑی ہے۔
الحجم غير متاح؛ سيظهر الاستهلاك أثناء التنزيل.|Size unavailable; usage will appear during download.|سائز دستیاب نہیں؛ ڈاؤن لوڈ کے دوران استعمال دکھایا جائے گا۔
تعذّر معرفة الحجم؛ يمكنك محاولة التنزيل مع متابعة الاستهلاك.|Could not check size. You can download while monitoring usage.|سائز معلوم نہیں ہو سکا۔ استعمال دیکھتے ہوئے ڈاؤن لوڈ کر سکتے ہیں۔
التلاوة محفوظة بالفعل.|This recitation is already saved.|یہ تلاوت پہلے سے محفوظ ہے۔
جاري بدء التنزيل…|Starting download…|ڈاؤن لوڈ شروع ہو رہا ہے…
اكتمل التنزيل؛ التلاوة جاهزة بدون إنترنت.|Download complete. Your recitation is ready offline.|ڈاؤن لوڈ مکمل۔ تلاوت آف لائن تیار ہے۔
تم إلغاء التنزيل؛ لم يُحفظ ملف ناقص.|Download cancelled. No incomplete file was saved.|ڈاؤن لوڈ منسوخ۔ نامکمل فائل محفوظ نہیں کی گئی۔
مساحة التخزين غير كافية. احذف بعض التنزيلات وحاول مجددًا.|Not enough space. Delete some downloads and try again.|جگہ کم ہے۔ کچھ ڈاؤن لوڈز حذف کر کے دوبارہ کوشش کریں۔
تعذّر إكمال التنزيل. تحقق من الاتصال والمساحة ثم أعد المحاولة.|Download failed. Check your connection and free space, then retry.|ڈاؤن لوڈ مکمل نہیں ہوا۔ رابطہ اور خالی جگہ دیکھ کر دوبارہ کوشش کریں۔
جاري إلغاء التنزيل…|Cancelling download…|ڈاؤن لوڈ منسوخ ہو رہا ہے…
اختر سورة وقارئًا صحيحين.|Choose a valid surah and reciter.|درست سورت اور قاری منتخب کریں۔
السورة مش محفوظة بصوت القارئ المختار. نزّلها أولًا أو اختار قارئًا حفظت له السورة.|This surah is not saved for the selected reciter. Download it first or choose a reciter whose recording you saved.|یہ سورت منتخب قاری کی آواز میں محفوظ نہیں۔ پہلے ڈاؤن لوڈ کریں یا محفوظ تلاوت والا قاری منتخب کریں۔
تعذّر تشغيل السورة. أعد المحاولة.|Could not play this surah. Try again.|سورت نہیں چل سکی۔ دوبارہ کوشش کریں۔
بث إذاعي مباشر|Live radio|براہ راست ریڈیو
تلاوة محفوظة|Saved recitation|محفوظ تلاوت
تلاوة القرآن|Quran recitation|قرآن کی تلاوت
إذاعة القرآن|Quran radio|قرآن ریڈیو
راديو القرآن الكريم|Quran radio|قرآن ریڈیو
مؤقت النوم|Sleep timer|نیند کا ٹائمر
مستوى الصوت|Volume|آواز
جاري التحميل...|Loading…|لوڈ ہو رہا ہے…
جاري الاتصال...|Connecting…|رابطہ ہو رہا ہے…
الذكي|Assistant|ذہین معاون
متاح دائماً|Always available|ہمیشہ دستیاب
رفيقك في القرآن والأذكار وأحكام العبادات|Your companion for Quran, adhkar and worship|قرآن، اذکار اور عبادات میں آپ کا ساتھی
مسح المحادثة|Clear conversation|گفتگو حذف کریں
إغلاق النافذة|Close window|ونڈو بند کریں
أهلاً بك في "اسأل زاد" 🌿|Welcome to Ask Zad 🌿|زاد سے پوچھیں میں خوش آمدید 🌿
أساعدك تفتح الخدمات وتعرف مواقيت الصلاة وتراجع التنبيهات. الإجابات من معلومات التطبيق، وقد أستعين بـ Google Gemini للأسئلة الأخرى.|I can help with app services, prayer times and reminders. Answers use app information; other questions may use Google Gemini.|میں ایپ کی خدمات، نماز کے اوقات اور یاد دہانی میں مدد کرتا ہوں۔ جوابات ایپ کی معلومات سے ملتے ہیں؛ دوسرے سوالات کے لیے Google Gemini استعمال ہو سکتا ہے۔
رسالتك إلى اسأل زاد|Your message to Ask Zad|زاد سے پوچھیں کو آپ کا پیغام
اكتب سؤالك أو الخدمة اللي محتاجها…|Type your question or the service you need…|اپنا سوال یا مطلوبہ خدمت لکھیں…
قد يُرسل السؤال إلى Google Gemini عند غياب إجابة محلية. للفتاوى الشخصية ارجع إلى جهة علمية موثوقة.|Your question may be sent to Google Gemini when no local answer is available. Consult a trusted scholar for personal fatwas.|مقامی جواب نہ ہونے پر سوال Google Gemini کو بھیجا جا سکتا ہے۔ ذاتی فتوے کے لیے معتبر عالم سے رجوع کریں۔
صلاة الجنازة بالتفصيل|Funeral prayer guide|نماز جنازہ کی رہنمائی
سجود السهو|Sujud al-sahw|سجدہ سہو
آيات الصبر وتفسيرها|Verses about patience & tafsir|صبر کی آیات اور تفسیر
دعاء تفريج الكرب|Dua in distress|پریشانی کی دعا
حساب زكاة المال والذهب|Zakat on savings & gold|مال اور سونے کی زکوٰۃ
صفة الوضوء ونواقضه|Wudu & what invalidates it|وضو کا طریقہ اور نواقض
تواصل مع المطور|Contact the developer|ڈویلپر سے رابطہ کریں
تنقل بطاقات الأدعية|Supplication card navigation|دعاؤں کے کارڈز کی نیویگیشن
تنقل مقتطفات الفيديو|Video clip navigation|ویڈیو کلپس کی نیویگیشن
تنقل قصص الأنبياء والسير|Prophet stories and biographies navigation|انبیاء کے قصوں اور سیرت کی نیویگیشن
واتساب|WhatsApp|واٹس ایپ
فيسبوك|Facebook|فیس بک
مشاري العفاسي|Mishary Alafasy|مشاری العفاسی
عبد الرحمن السديس|Abdul Rahman Al-Sudais|عبدالرحمن السدیس
محمود خليل الحصري|Mahmoud Khalil Al-Husary|محمود خلیل الحصری
محمد صديق المنشاوي|Muhammad Siddiq Al-Minshawi|محمد صدیق المنشاوی
`;
 const extra=`
طيّب وقتك بذكر الله وتلاوة كتابه 📖|Fill your day with dhikr and Quran 📖|اپنا وقت ذکر اور تلاوت سے روشن کریں 📖
ورد القرآن اليومي 📖|Daily Quran reading 📖|روزانہ قرآن کی تلاوت 📖
تخصيص الإعدادات والتنزيلات|Settings & downloads|ترتیبات اور ڈاؤن لوڈز
العودة للإشعارات|Back to notifications|اطلاعات پر واپس
إعداداتك وبياناتك|Your settings & data|آپ کی ترتیبات اور ڈیٹا
العامة والمواقيت|General & prayer times|عمومی اور نماز کے اوقات
النسخ والاحتياط|Backup|بیک اپ
ملاحظة أو خطأ|Feedback or issue|رائے یا غلطی
تخصيص المواقيت والواجهة|Prayer times & appearance|نماز کے اوقات اور ظاہری شکل
المواقيت|Prayer times|نماز کے اوقات
الصدقة|Charity|صدقہ
تخصيص الأذان والمنبهات|Adhan & reminder preferences|اذان اور یاد دہانی کی ترجیحات
تجربة تنبيه|Test notification|آزمائشی اطلاع
حفظ اختياراتي ✨|Save my preferences ✨|میری ترجیحات محفوظ کریں ✨
التنزيل للقراءة والاستماع أوفلاين|Downloads for offline reading & listening|آف لائن پڑھنے اور سننے کے لیے ڈاؤن لوڈز
تنزيل صفحات المصحف|Download Mushaf pages|مصحف کے صفحات ڈاؤن لوڈ کریں
تنزيل التفسير|Download tafsir|تفسیر ڈاؤن لوڈ کریں
اختر السورة:|Choose a surah:|سورت منتخب کریں:
عرض الملفات المنزلة والمساحة|View downloads & storage|ڈاؤن لوڈز اور جگہ دیکھیں
إيقاف التنزيل|Stop download|ڈاؤن لوڈ روکیں
النسخ الاحتياطي لتقدمك الإيماني|Back up your progress|اپنی پیش رفت کا بیک اپ بنائیں
فتح البلاغ في تطبيق البريد للإرسال|Open report in email app|رپورٹ بھیجنے کے لیے ای میل ایپ کھولیں
إضافة للمفضلة|Add to favorites|پسندیدہ میں شامل کریں
إزالة من المفضلة|Remove from favorites|پسندیدہ سے ہٹائیں
البث المباشر|Live radio|براہ راست نشریات
تنزيلاتي|My downloads|میرے ڈاؤن لوڈز
المفضلة فقط|Favorites only|صرف پسندیدہ
اضغط سماع لبدء البث المباشر|Press play to start the live stream|براہ راست نشریات شروع کرنے کے لیے چلائیں دبائیں
كتم / تشغيل الصوت|Mute / unmute|آواز بند / بحال کریں
إيقاف المؤقت (تشغيل مستمر)|Timer off (continuous playback)|ٹائمر بند (مسلسل چلائیں)
30 دقيقة|30 minutes|۳۰ منٹ
45 دقيقة|45 minutes|۴۵ منٹ
60 دقيقة (ساعة)|60 minutes (1 hour)|۶۰ منٹ (ایک گھنٹہ)
سيتوقف البث بعد:|Playback will stop in:|نشریات اتنی دیر بعد رک جائیں گی:
عبدالرحمن السديس|Abdul Rahman Al-Sudais|عبدالرحمن السدیس
إذاعة القرآن الكريم من القاهرة|Cairo Quran Radio|قاہرہ قرآن ریڈیو
إذاعة القرآن الكريم العامة (كبار القراء)|Quran Radio (renowned reciters)|قرآن ریڈیو (مشہور قراء)
تلاوات الشيخ علي جابر (رحمه الله)|Ali Jaber recitations|علی جابر کی تلاوتیں
تلاوات الشيخ عبد الله الموسى|Abdullah Al-Mousa recitations|عبداللہ الموسیٰ کی تلاوتیں
تلاوات الشيخ محمد صديق المنشاوي|Muhammad Siddiq Al-Minshawi recitations|محمد صدیق المنشاوی کی تلاوتیں
تلاوات الشيخ عبد الباسط عبد الصمد|Abdul Basit Abdus Samad recitations|عبد الباسط عبد الصمد کی تلاوتیں
تلاوات الشيخ مشاري بن راشد العفاسي|Mishary Alafasy recitations|مشاری العفاسی کی تلاوتیں
تلاوات الشيخ خالد الجليل|Khalid Al-Jaleel recitations|خالد الجلیل کی تلاوتیں
تلاوات الشيخ ماهر المعيقلي|Maher Al-Muaiqly recitations|ماہر المعیقلی کی تلاوتیں
تلاوات الشيخ ياسر الدوسري|Yasser Al-Dosari recitations|یاسر الدوسری کی تلاوتیں
تلاوات الشيخ بدر التركي|Badr Al-Turki recitations|بدر الترکی کی تلاوتیں
إذاعة القرآن الكريم من مكة المكرمة|Makkah Quran Radio|مکہ قرآن ریڈیو
إذاعة الرقية الشرعية للشفاء والتحصين|Ruqyah radio|شرعی رقیہ ریڈیو
تلاوات هادئة للسكينة والنوم والاسترخاء|Calm recitations for rest & relaxation|آرام اور سکون کے لیے پرسکون تلاوتیں
الرياض (السعودية)|Riyadh (Saudi Arabia)|ریاض (سعودی عرب)
مكة المكرمة (السعودية)|Makkah (Saudi Arabia)|مکہ مکرمہ (سعودی عرب)
المدينة المنورة (السعودية)|Madinah (Saudi Arabia)|مدینہ منورہ (سعودی عرب)
جدة (السعودية)|Jeddah (Saudi Arabia)|جدہ (سعودی عرب)
الدمام (السعودية)|Dammam (Saudi Arabia)|دمام (سعودی عرب)
القاهرة (مصر)|Cairo (Egypt)|قاہرہ (مصر)
الإسكندرية (مصر)|Alexandria (Egypt)|اسکندریہ (مصر)
الجيزة (مصر)|Giza (Egypt)|جیزہ (مصر)
المنصورة (الدقهلية)|Mansoura (Egypt)|منصورہ (مصر)
طنطا (الغربية)|Tanta (Egypt)|طنطا (مصر)
الزقازيق (الشرقية)|Zagazig (Egypt)|زقازیق (مصر)
أسيوط (مصر)|Assiut (Egypt)|اسیوط (مصر)
القدس الشريف (فلسطين)|Jerusalem (Palestine)|القدس (فلسطین)
دبي (الإمارات)|Dubai (UAE)|دبئی (متحدہ عرب امارات)
الكويت|Kuwait|کویت
الكويت (الكويت)|Kuwait City (Kuwait)|کویت شہر (کویت)
الدوحة (قطر)|Doha (Qatar)|دوحہ (قطر)
عمّان (الأردن)|Amman (Jordan)|عمان (اردن)
عمان (الأردن)|Amman (Jordan)|عمان (اردن)
أبو ظبي (الإمارات)|Abu Dhabi (UAE)|ابوظہبی (متحدہ عرب امارات)
بيروت (لبنان)|Beirut (Lebanon)|بیروت (لبنان)
بغداد (العراق)|Baghdad (Iraq)|بغداد (عراق)
دمشق (سوريا)|Damascus (Syria)|دمشق (شام)
مسقط (عمان)|Muscat (Oman)|مسقط (عمان)
المنامة (البحرين)|Manama (Bahrain)|منامہ (بحرین)
تونس|Tunis|تونس
الجزائر|Algiers|الجزائر
الرباط (المغرب)|Rabat (Morocco)|رباط (مراکش)
طرابلس (ليبيا)|Tripoli (Libya)|طرابلس (لیبیا)
الخرطوم (السودان)|Khartoum (Sudan)|خرطوم (سوڈان)
لندن (بريطانيا)|London (UK)|لندن (برطانیہ)
باريس (فرنسا)|Paris (France)|پیرس (فرانس)
نيويورك (أمريكا)|New York (USA)|نیویارک (امریکہ)
إسطنبول (تركيا)|Istanbul (Turkey)|استنبول (ترکی)
المصحف الشريف|Holy Mushaf|مصحف شریف
الأذكار والأدعية|Adhkar & duas|اذکار اور دعائیں
الصدقة الجارية|Ongoing charity|صدقہ جاریہ
تلاوة وتدبر ومتابعة الورد والختمة القرآنية|Read, reflect and track daily Quran reading|تلاوت، تدبر اور روزانہ قرآن کی پیش رفت
حصن المسلم وأذكار الصباح والمساء والأدعية المأثورة|Hisn al-Muslim, morning & evening adhkar and duas|حصن المسلم، صبح و شام کے اذکار اور مسنون دعائیں
تسبيح ذكي مع عداد تفاعلي وأهداف يومية مباركة|Interactive tasbeeh counter with daily goals|روزانہ اہداف کے ساتھ تسبیح کاؤنٹر
مواسم الطاعات والتقويم الهجري|Worship seasons & Hijri calendar|عبادت کے مواقع اور ہجری تقویم
تحديد دقيق للمواقيت واتجاه القبلة مع تنبيهات الأذان|Prayer times, qibla direction and adhan reminders|نماز کے اوقات، قبلے کی سمت اور اذان کی یاد دہانی
محاضرات ودروس وبث إذاعي إسلامي مباشر خاشع|Talks, lessons and Islamic radio|بیانات، اسباق اور اسلامی ریڈیو
حساب زكاة المال والذهب بسهولة ودقة شرعية|Calculate zakat on savings and gold|مال اور سونے کی زکوٰۃ کا حساب
بطاقات دعاء للمتوفى ومشاركة الدعاء|Dua cards for the deceased and sharing|مرحوم کے لیے دعائیہ کارڈ اور اشتراک
اختار القارئ؛ تُستخدم التلاوة المحفوظة إن توفّرت.|Choose a reciter; saved audio is used when available.|قاری منتخب کریں؛ دستیاب ہونے پر محفوظ تلاوت استعمال ہوگی۔
تعذّر تشغيل التلاوة؛ أعد المحاولة.|Could not play the recitation. Try again.|تلاوت نہیں چل سکی۔ دوبارہ کوشش کریں۔
جاري فتح التلاوة…|Opening recitation…|تلاوت کھل رہی ہے…
اكتب رقم صفحة من ١ إلى ٦٠٤.|Enter a page number from 1 to 604.|۱ تا ۶۰۴ صفحہ نمبر لکھیں۔
`;
 const secondary=`
حاسبة الزكاة الذكية الشاملة|Zakat calculator|زکوٰۃ کیلکولیٹر
العملة:|Currency:|کرنسی:
🇸🇦 ريال سعودي (SAR)|🇸🇦 Saudi riyal (SAR)|🇸🇦 سعودی ریال (SAR)
🇪🇬 جنيه مصري (EGP)|🇪🇬 Egyptian pound (EGP)|🇪🇬 مصری پاؤنڈ (EGP)
🇦🇪 درهم إماراتي (AED)|🇦🇪 UAE dirham (AED)|🇦🇪 اماراتی درہم (AED)
🇰🇼 دينار كويتي (KWD)|🇰🇼 Kuwaiti dinar (KWD)|🇰🇼 کویتی دینار (KWD)
🇶🇦 ريال قطري (QAR)|🇶🇦 Qatari riyal (QAR)|🇶🇦 قطری ریال (QAR)
🇺🇸 دولار أمريكي (USD)|🇺🇸 US dollar (USD)|🇺🇸 امریکی ڈالر (USD)
🇪🇺 يورو (EUR)|🇪🇺 Euro (EUR)|🇪🇺 یورو (EUR)
الذهب (85 جم)|Gold (85 g)|سونا (۸۵ گرام)
الفضة (595 جم)|Silver (595 g)|چاندی (۵۹۵ گرام)
1. السيولة النقدية والحسابات البنكية|1. Cash & bank accounts|۱۔ نقد رقم اور بینک اکاؤنٹس
النقد المتوفر في اليد أو الخزينة:|Cash in hand:|دستیاب نقد رقم:
الأرصدة بالحسابات البنكية والودائع:|Bank balances & deposits:|بینک بیلنس اور جمع رقوم:
2. الذهب والسبائك (بالجرام)|2. Gold & bullion (grams)|۲۔ سونا اور سونے کی اینٹیں (گرام)
ذهب عيار 24 (جم):|24-karat gold (g):|۲۴ قیراط سونا (گرام):
ذهب عيار 22 (جم):|22-karat gold (g):|۲۲ قیراط سونا (گرام):
ذهب عيار 21 (جم):|21-karat gold (g):|۲۱ قیراط سونا (گرام):
ذهب عيار 18 (جم):|18-karat gold (g):|۱۸ قیراط سونا (گرام):
3. الفضة وعروض التجارة والأسهم|3. Silver, trade goods & shares|۳۔ چاندی، تجارتی سامان اور حصص
وزن الفضة الخالصة (بالجرام):|Pure silver weight (g):|خالص چاندی کا وزن (گرام):
قيمة بضاعة عروض التجارة (بسعر البيع الحالي):|Trade goods value (current selling price):|تجارتی سامان کی قیمت (موجودہ فروخت کی قیمت):
الأسهم والصناديق الاستثمارية (بغرض التجارة):|Shares & investment funds held for trading:|تجارت کے لیے حصص اور سرمایہ کاری فنڈز:
4. الديون والخصومات وشرط الحول|4. Debts, deductions & the lunar year|۴۔ قرض، کٹوتیاں اور قمری سال کی شرط
ديون مرجوة السداد لك عند الآخرين:|Debts owed to you that are likely to be repaid:|دوسروں کے ذمے آپ کا قابل وصول قرض:
ديون مستحقة عليك واجبة السداد حالاً (تُخصم):|Debts you must repay now (deducted):|آپ کے ذمے فوری واجب الادا قرض (منہا ہوگا):
أقر بأن هذا المال قد حال عليه الحول القمري (مضى عليه عام هجري كامل وهو في ملكي).|I confirm that I have owned this wealth for a full lunar year.|میں تصدیق کرتا ہوں کہ اس مال کی ملکیت پر ایک مکمل قمری سال گزر چکا ہے۔
حفظ النتيجة|Save result|نتیجہ محفوظ کریں
مشاركة النتيجة|Share result|نتیجہ شیئر کریں
إعادة الحساب|Recalculate|دوبارہ حساب کریں
قيم مرجعية غير محدثة|Reference values, not live prices|حوالہ جاتی قیمتیں، تازہ قیمتیں نہیں
أسعار أدخلتها يدويًا|Manually entered prices|دستی درج کی گئی قیمتیں
سعر يدوي وقيمة مرجعية للحقل الفارغ|One manual price; reference value for the empty field|ایک دستی قیمت؛ خالی خانے کے لیے حوالہ جاتی قیمت
مرة واحدة (1x)|Once (1x)|ایک بار (1x)
مرتان (2x)|Twice (2x)|دو بار (2x)
3 مرات (3x)|3 times (3x)|۳ بار (3x)
5 مرات (5x)|5 times (5x)|۵ بار (5x)
7 مرات (7x)|7 times (7x)|۷ بار (7x)
10 مرات (10x - للحفظ المتقن)|10 times (10x)|۱۰ بار (10x)
تكرار مستمر بدون توقف (∞)|Continuous repetition (∞)|مسلسل تکرار (∞)
إعادة المقطع بالكامل:|Repeat the full passage:|مکمل حصے کی تکرار:
مهلة لترديد الآية بصوتك:|Pause to repeat the verse yourself:|آیت خود دہرانے کے لیے وقفہ:
بدون مهلة (فوري)|No pause|بغیر وقفے
مهلة ثانيتان (2s)|2-second pause|۲ سیکنڈ کا وقفہ
مهلة 4 ثوانٍ (4s)|4-second pause|۴ سیکنڈ کا وقفہ
مهلة 6 ثوانٍ (6s)|6-second pause|۶ سیکنڈ کا وقفہ
الاستماع للآية 🔊|Listen to the verse 🔊|آیت سنیں 🔊
نسخ الآية الكريمة 📋|Copy verse 📋|آیت نقل کریں 📋
مشاركة الآية 📤|Share verse 📤|آیت شیئر کریں 📤
إضافة علامة مرجعية 🔖|Add bookmark 🔖|نشانی شامل کریں 🔖
تحديد موضع القراءة (أكمل من هنا) 📍|Save reading position (continue here) 📍|تلاوت کا مقام محفوظ کریں (یہیں سے جاری رکھیں) 📍
مشاركة كبطاقة ستوري (واتساب / إنستغرام) 📷|Share as a story card (WhatsApp / Instagram) 📷|اسٹوری کارڈ شیئر کریں (واٹس ایپ / انسٹاگرام) 📷
مشاركة كـ ستوري / حالة|Share as a story / status|اسٹوری / اسٹیٹس شیئر کریں
شارك كستوري 📷|Share as a story 📷|اسٹوری شیئر کریں 📷
مشاركة إنجاز شجرتي اليوم 🌿|Share today’s tree progress 🌿|آج کے درخت کی پیش رفت شیئر کریں 🌿
اطلب دعاءً بظهر الغيب|Request a dua|دعا کی درخواست کریں
اطلب دعاءً بظهر الغيب 🤲|Request a dua 🤲|دعا کی درخواست کریں 🤲
عرض دعواتي 💌|My dua requests 💌|میری دعا کی درخواستیں 💌
باب الدعاء:|Dua category:|دعا کا زمرہ:
نماذج مقترحة (اضغط للاختيار):|Suggestions (tap to choose):|تجاویز (منتخب کرنے کے لیے دبائیں):
نص دعائك:|Your dua:|آپ کی دعا:
الصفة أو اللقب المستعار:|Display name or nickname:|ظاہری نام یا عرفیت:
انشر الدعاء على الحائط بظهر الغيب 🤲|Post your dua request 🤲|دعا کی درخواست شائع کریں 🤲
نشر الدعاء|Post dua|دعا شائع کریں
نص الدعاء:|Dua text:|دعا کا متن:
اسمك (أو اتركه فارغاً ليكون فاعل خير):|Your name (leave blank to remain anonymous):|آپ کا نام (گمنام رہنے کے لیے خالی چھوڑیں):
اسم القارئ (أو اتركه فاعل خير):|Reader’s name (optional):|قاری کا نام (اختیاری):
تأكيد حجز الجزء|Confirm juz reservation|پارہ منتخب کرنے کی تصدیق کریں
فتح بالمصحف|Open in Mushaf|مصحف میں کھولیں
تصميم بطاقة دعاء|Create a dua card|دعا کا کارڈ بنائیں
صانع بطاقات الأدعية للمشاركة 🖼️✨|Dua card creator 🖼️✨|دعائیہ کارڈ بنائیں 🖼️✨
إهداء الصدقة والدعاء باسم:|Dedicate charity & dua to:|صدقہ اور دعا منسوب کریں:
اختر نوع المحتوى الإيماني:|Choose content type:|مواد کی قسم منتخب کریں:
أدعية للمتوفى|Duas for the deceased|مرحوم کے لیے دعائیں
آيات قرآنية|Quran verses|قرآنی آیات
اختر النص أو الآية المباركة:|Choose the text or verse:|متن یا آیت منتخب کریں:
✏️ كتابة نص مخصص بقلمك...|✏️ Write your own text…|✏️ اپنا متن لکھیں…
اكتب نص الدعاء أو الآية المخصصة:|Enter your dua or verse:|دعا یا آیت کا متن لکھیں:
اختر أبعاد وحجم التصميم:|Choose design size:|ڈیزائن کا سائز منتخب کریں:
حالة / ستوري (9:16)|Status / story (9:16)|اسٹیٹس / اسٹوری (9:16)
بطاقة عمودية (4:5)|Portrait card (4:5)|عمودی کارڈ (4:5)
منشور مربع (1:1)|Square post (1:1)|مربع پوسٹ (1:1)
اختر السمة واللون المفضل للبطاقة:|Choose card theme & color:|کارڈ کا انداز اور رنگ منتخب کریں:
الملكي الكحلي 🌙|Royal navy 🌙|گہرا نیلا 🌙
الزمردي 🌿|Emerald 🌿|زمردی 🌿
العنابي الإسلامي 🍷|Burgundy 🍷|عنابی 🍷
الرخامي 📜|Marble 📜|سنگ مرمر 📜
نوع الإنتاج المطلوب:|Output format:|فائل کی قسم:
صورة ثابتة (PNG)|Image (PNG)|تصویر (PNG)
مقطع فيديو واستوري متحرك (Reels 9:16) ✨|Animated story video (Reels 9:16) ✨|متحرک اسٹوری ویڈیو (Reels 9:16) ✨
تحميل الصورة (PNG)|Download image (PNG)|تصویر ڈاؤن لوڈ کریں (PNG)
تصدير فيديو الاستوري (MP4)|Export story video (MP4)|اسٹوری ویڈیو برآمد کریں (MP4)
مشاركة لواتساب|Share to WhatsApp|واٹس ایپ پر شیئر کریں
إنشاء رابط صدقة جارية لفقيدك|Create a charity link for a loved one|اپنے مرحوم کے لیے صدقہ جاریہ کا لنک بنائیں
اسم المتوفى (رحمه الله):|Name of the deceased:|مرحوم کا نام:
صلة القرابة / اللقب:|Relationship / title:|رشتہ / لقب:
رابط تحميل التطبيق:|App download link:|ایپ ڈاؤن لوڈ کرنے کا لنک:
مشاركة مباشرة عبر واتساب|Share via WhatsApp|واٹس ایپ کے ذریعے شیئر کریں
`;
 const completion=`
✦ فهرس المنصة الشامل|✦ Explore Zad Al Muslim|✦ زاد المسلم کی مکمل فہرست
اختار تصنيفًا أو ابحث عن الخدمة اللي محتاجها.|Choose a category or search for a service.|زمرہ منتخب کریں یا مطلوبہ خدمت تلاش کریں۔
صدقة للمتوفى|Charity for the deceased|مرحوم کے لیے صدقہ
جرّب البحث بكلمة أخرى مثل: صلاة، قرآن، أذكار، قصص، تسبيح.|Try another word: prayer, Quran, adhkar, stories or tasbeeh.|دوسرا لفظ آزمائیں: نماز، قرآن، اذکار، واقعات یا تسبیح۔
قراءة المصحف والاستماع والمشاركة في الختمات.|Read, listen and join Quran khatmas.|قرآن پڑھیں، سنیں اور ختم قرآن میں شامل ہوں۔
مواقيت الصلاة واتجاه القبلة وتعلّم الصلاة وأقرب مسجد.|Prayer times, qibla, prayer guides and nearby mosques.|نماز کے اوقات، قبلہ، نماز کی رہنمائی اور قریبی مساجد۔
أذكار يومك والسبحة الإلكترونية.|Daily adhkar and the tasbeeh counter.|روزانہ اذکار اور تسبیح کاؤنٹر۔
أدعية مأثورة وذكر يناسب شعورك وطلبات الدعاء.|Duas, dhikr for how you feel and prayer requests.|مسنون دعائیں، آپ کی کیفیت کے مطابق ذکر اور دعا کی درخواستیں۔
تابع وردك ومهامك اليومية وتقدمك في الذكر والقراءة.|Track daily worship, tasks, dhikr and reading.|روزانہ عبادات، کاموں، ذکر اور تلاوت کی پیش رفت دیکھیں۔
التقويم الهجري والمناسبات ومواسم الطاعات.|Hijri calendar, occasions and worship seasons.|ہجری تقویم، مناسبتیں اور عبادت کے مواقع۔
أسماء الله الحسنى وقصص الأنبياء والصحابة واختبار المعلومات.|Names of Allah, prophets, companions and quizzes.|اسماء الحسنیٰ، انبیاء اور صحابہ کے واقعات اور سوالات۔
شاهد المواعظ والمقاطع أو استمع لها.|Watch or listen to reminders and clips.|نصیحتیں اور کلپس دیکھیں یا سنیں۔
حساب زكاة المال والذهب والتجارة.|Calculate zakat on savings, gold and trade.|مال، سونے اور تجارت کی زکوٰۃ کا حساب۔
صفحة صدقة جارية ودعوات للمتوفى ودليل الجنائز.|Charity pages, duas for the deceased and funeral guidance.|صدقہ جاریہ کے صفحات، مرحوم کے لیے دعائیں اور جنازے کی رہنمائی۔
أنشئ رابطاً مخصصاً لفقيدك واجمع له الدعوات وقراءات القرآن.|Create a dedicated page for a loved one’s duas and Quran readings.|اپنے مرحوم کے لیے دعائیں اور قرآن کی تلاوت جمع کرنے کا مخصوص صفحہ بنائیں۔
اكتب دعاءً للمتوفى أو رسالة مواساة لأهله.|Write a dua for the deceased or offer condolences.|مرحوم کے لیے دعا یا اہل خانہ کے لیے تعزیتی پیغام لکھیں۔
وضع التركيز|Focus mode|توجہ کا انداز
اقرأ من آخر موضع، أو اختار سورة من الفهرس.|Continue reading or choose a surah from the index.|آخری مقام سے پڑھیں یا فہرست سے سورت منتخب کریں۔
موضع وقوفك المحفوظ|Your saved reading position|آپ کا محفوظ مقام تلاوت
تُستخدم التلاوة المحفوظة إن توفّرت.|Saved recitations are used when available.|دستیاب ہونے پر محفوظ تلاوت استعمال ہوتی ہے۔
كتبي ومراجعي المحملة|My downloaded references|میرے ڈاؤن لوڈ شدہ مراجع
معاني الكلمات والبيان|Word meanings|الفاظ کے معانی
أسباب النزول|Reasons for revelation|اسباب نزول
إعراب القرآن وبيانه|Quran grammar & explanation|قرآن کا اعراب اور بیان
موضوع الآيات والهدى|Verse themes & guidance|آیات کے موضوعات اور ہدایت
تلاوة مباركة|Quran recitation|قرآن کی تلاوت
مزامنة سحابية فورية|Live cloud sync|فوری کلاؤڈ ہم آہنگی
الختمة المباركة:|Khatma:|ختم قرآن:
أُنجز|Completed|مکمل
من 30 جزءاً|of 30 juz|۳۰ پاروں میں سے
متاح للقراءة|Available to read|پڑھنے کے لیے دستیاب
تمت القراءة|Read|پڑھ لیا گیا
اسحب أفقياً لتصفح الأجزاء (1 - 30)|Swipe to browse juz (1–30)|پارے (۱ تا ۳۰) دیکھنے کے لیے افقی سوائپ کریں
صلواتك بركة ونور|Your prayers, light & blessing|آپ کی نمازیں، نور اور برکت
مواقيت الصلاة وساعة الاستجابة|Prayer times & times for dua|نماز کے اوقات اور دعا کے اوقات
المتبقي على أذان المغرب والإفطار:|Time until Maghrib & iftar:|مغرب اور افطار تک باقی وقت:
دعاء الصائم والإفطار|Fasting & iftar duas|روزے اور افطار کی دعائیں
📍 موقعي الحالي (تحديد تلقائي / GPS)|📍 My current location (GPS)|📍 میرا موجودہ مقام (GPS)
الأذان: مفعّل|Adhan: on|اذان: فعال
الأذان: صامت|Adhan: muted|اذان: خاموش
صوت المؤذن|Adhan voice|مؤذن کی آواز
إشعار شريط الحالة|Status bar notification|اسٹیٹس بار کی اطلاع
ويدجت الهاتف 📱|Phone widget 📱|فون ویجیٹ 📱
التقويم الهجري المبارك|Hijri calendar|ہجری تقویم
الصلاة القادمة:|Next prayer:|اگلی نماز:
جاري الحساب...|Calculating…|حساب ہو رہا ہے…
خُطاك إلى بيوت الله|Find your way to the mosque|مسجد کی راہ تلاش کریں
تحديد موقعي والبحث عن المساجد والجوامع 📍|Find my location & nearby mosques 📍|میرا مقام اور قریبی مساجد تلاش کریں 📍
نطاق البحث:|Search radius:|تلاش کا دائرہ:
أو ابحث باسم مدينتك أو حيك:|Or search by city or neighborhood:|یا شہر یا محلے کے نام سے تلاش کریں:
اضغط على "تحديد موقعي" لعرض أقرب المساجد إليك|Choose “My location” to find nearby mosques|قریبی مساجد کے لیے «میرا مقام» منتخب کریں
دواء القلب بالقرآن والدعاء|Find comfort in Quran & dua|قرآن اور دعا سے دل کا سکون
بوصلة القلوب والسكينة 🌿|Heart compass & peace 🌿|دل کا سکون 🌿
كيف تجد في قلبك الآن؟ اختر شعورك وسيدلك زاد المسلم على ما يطمئنك:|How do you feel? Choose an emotion to find a comforting reminder:|آپ کی کیفیت کیسی ہے؟ تسلی بخش یاد دہانی کے لیے کیفیت منتخب کریں:
حزين أو مهموم|Sad or worried|اداس یا پریشان
قلق أو متوتر|Anxious or tense|فکرمند یا تناؤ میں
ضيق في الرزق|Financial hardship|رزق کی تنگی
غاضب أو منفعل|Angry or upset|غصے یا اشتعال میں
محبط أو ضعيف الهمة|Discouraged or unmotivated|مایوس یا کم ہمت
ممتن وفرحان بنعمة|Grateful and happy|شکر گزار اور خوش
خائف أو غير آمن|Afraid or unsafe|خوف زدہ یا غیر محفوظ
أرق وصعوبة نوم|Trouble sleeping|سونے میں دشواری
حصن المسلم اليومي|Daily Hisn al-Muslim|روزانہ حصن المسلم
تم إتمام:|Completed:|مکمل:
من|of|میں سے
أذكار|adhkar|اذکار
اسحب أفقياً لتصفح الأذكار|Swipe to browse adhkar|اذکار دیکھنے کے لیے افقی سوائپ کریں
الذكر السابق|Previous dhikr|پچھلا ذکر
الذكر التالي|Next dhikr|اگلا ذکر
الدعاء السابق|Previous dua|پچھلی دعا
الدعاء التالي|Next dua|اگلی دعا
القصة السابقة|Previous story|پچھلا واقعہ
القصة التالية|Next story|اگلا واقعہ
التكرار المستحب:|Suggested repetitions:|تجویز کردہ تکرار:
مرات|times|بار
ازرع الخير • وداوم على الذكر|Plant goodness • Keep remembering Allah|نیکی اگائیں • ذکر جاری رکھیں
حديقة الحسنات وشجرة الذكر التفاعلية|Good deeds garden & dhikr tree|نیکیوں کا باغ اور ذکر کا درخت
المرحلة الأولى: بذرة الإيمان 🌱|Stage 1: A seed of faith 🌱|پہلا مرحلہ: ایمان کا بیج 🌱
ابدأ بالتسبيح وتلاوة القرآن لتنمو شجرتك وتورق ثمارها|Grow your tree with tasbeeh and Quran reading|تسبیح اور قرآن کی تلاوت سے اپنے درخت کو بڑھائیں
رصيد بركة اليوم:|Today’s progress:|آج کی پیش رفت:
حسنة / نقطة|deed / point|نیکی / پوائنٹ
تتابع:|Streak:|تسلسل:
يوم|day|دن
التسبيحات|Tasbeeh repetitions|تسبیح کی گنتی
صفحات القرآن|Quran pages|قرآن کے صفحات
أوراد الأذكار|Adhkar sessions|اذکار کے معمولات
المسابقات والسنن|Quizzes & sunnahs|سوالات اور سنتیں
محاسبة النفس • المداومة على الطاعات|Reflection • Consistent worship|محاسبہ نفس • عبادت میں پابندی
وردي اليومي ورحلتي مع الطاعات|My daily worship journey|میرا روزانہ عبادت کا سفر
أنت ملتزم بالورد لـ|Your daily worship streak:|روزانہ عبادت کا تسلسل:
يوم متتالي ✨|consecutive days ✨|مسلسل دن ✨
إنجازك الإيماني اليوم:|Today’s worship progress:|آج کی عبادت کی پیش رفت:
صلاة الفجر في وقتها 🕌|Fajr on time 🕌|فجر وقت پر 🕌
ورد القرآن الكريم (صفحتين فأكثر) 📖|Quran reading (2+ pages) 📖|قرآن کی تلاوت (۲ یا زیادہ صفحات) 📖
أذكار الصباح ☀️|Morning adhkar ☀️|صبح کے اذکار ☀️
أذكار المساء 🌙|Evening adhkar 🌙|شام کے اذکار 🌙
صلاة الضحى أو ركعة الوتر ✨|Duha or Witr prayer ✨|چاشت یا وتر کی نماز ✨
أذكار النوم والاضطجاع 🛏️|Bedtime adhkar 🛏️|سونے کے اذکار 🛏️
الصلاة على النبي ﷺ (100 مرة) 🌿|Salawat upon the Prophet ﷺ (100 times) 🌿|نبی ﷺ پر درود (۱۰۰ مرتبہ) 🌿
صدقة أو إحسان أو صلة رحم 🤍|Charity, kindness or family ties 🤍|صدقہ، احسان یا صلہ رحمی 🤍
يتجدد الجدول تلقائياً مع بداية كل يوم مبارك|The checklist resets automatically each day|فہرست ہر روز خود نئے سرے سے شروع ہوتی ہے
دورة الهدف:|Completed rounds:|مکمل ادوار:
استقامة وذكر|Consistency & dhikr|استقامت اور ذکر
7 أيام|7 days|۷ دن
تحدي 7 أيام إيماني 🌟|7-day worship challenge 🌟|۷ دن کا عبادت کا چیلنج 🌟
ابدأ خطوة ثابتة في بناء عادة يومية خفيفة ترتقي بها من الذكر وتلاوة القرآن.|Build a small daily habit of dhikr and Quran reading.|ذکر اور قرآن کی تلاوت کی چھوٹی روزانہ عادت بنائیں۔
دقائق يسيرة كل يوم|A few minutes each day|ہر روز چند منٹ
متابعة تشجيعية للتقدم|Encouraging progress tracking|حوصلہ افزا پیش رفت
اكتشف التحدي وابدأ اليوم ←|Explore the challenge & start today →|چیلنج دیکھیں اور آج شروع کریں ←
الكرب وقضاء الدين|Distress & debts|پریشانی اور قرض
الشفاء والعافية|Healing & wellbeing|شفا اور عافیت
الرزق والتيسير|Provision & ease|رزق اور آسانی
صلاح الأبناء والوالدين|Parents & children|والدین اور اولاد
جوامع دعاء القرآن|Comprehensive Quranic duas|قرآن کی جامع دعائیں
رجوع للخدمات|Back to services|خدمات پر واپس
العودة للصفحة الرئيسية|Back to home|ہوم پر واپس
عرض باقي التصنيفات|Show more categories|مزید زمرے دکھائیں
تصنيف الخدمات|Service categories|خدمات کے زمرے
اختيار السورة|Choose a surah|سورت منتخب کریں
فهرس القرآن الكريم|Quran index|قرآن کی فہرست
فتح خيارات الاستماع|Open listening options|سننے کے اختیارات کھولیں
انتقل إلى صفحة|Go to page|صفحے پر جائیں
الانتقال إلى صفحة محددة|Go to a specific page|مخصوص صفحے پر جائیں
الصفحة السابقة|Previous page|پچھلا صفحہ
الصفحة التالية|Next page|اگلا صفحہ
حفظ فاصلة القراءة|Save reading position|تلاوت کا مقام محفوظ کریں
التفسير والتلاوة والمراجع|Tafsir, recitation & references|تفسیر، تلاوت اور مراجع
تبديل المظهر|Switch appearance|ظاہری شکل بدلیں
المظهر النهاري / الليلي|Light / dark appearance|روشن / تاریک انداز
مشغل إذاعات القرآن الكريم|Quran radio player|قرآن ریڈیو پلیئر
راديو زاد المسلم|Zad Al Muslim Radio|زاد المسلم ریڈیو
متوقف|Stopped|رکا ہوا
مباشر|Live|براہ راست
جاري الاتصال|Connecting|رابطہ ہو رہا ہے
جاري التحميل|Loading|لوڈ ہو رہا ہے
إعادة الاتصال|Reconnecting|دوبارہ رابطہ ہو رہا ہے
الإنترنت غير متاح|No internet connection|انٹرنیٹ دستیاب نہیں
البث غير متاح — أعد المحاولة|Stream unavailable — try again|نشریات دستیاب نہیں — دوبارہ کوشش کریں
اضغط تشغيل|Press play|چلائیں دبائیں
متوقف مؤقتًا|Paused|عارضی طور پر رکا ہوا
محطة|Station|اسٹیشن
سماع صوت المؤذن|Preview adhan voice|مؤذن کی آواز سنیں
سماع صوت التذكير|Preview reminder sound|یاد دہانی کی آواز سنیں
تخصيص وترتيب اختصارات الصفحة الرئيسية|Customize home shortcuts|ہوم کے شارٹ کٹس ترتیب دیں
اسأل زاد - المساعد الإسلامي الذكي|Ask Zad — Islamic assistant|زاد سے پوچھیں — اسلامی معاون
أنت تتصفح بدون إنترنت • تم تفعيل وضع الأوفلاين (القرآن، الأذكار، والسبحة تعمل بنجاح 100%)|You are offline. Saved Quran pages, adhkar and tasbeeh are available.|آپ آف لائن ہیں۔ محفوظ قرآنی صفحات، اذکار اور تسبیح دستیاب ہیں۔
هل تريد استعادة الإعدادات الافتراضية للتطبيق؟ (لن يتم حذف علامات قراءة المصحف أو أذكارك المحفوظة)|Restore default settings? Quran bookmarks and saved adhkar progress will be kept.|طے شدہ ترتیبات بحال کریں؟ قرآن کی نشانیاں اور اذکار کی پیش رفت برقرار رہے گی۔
حذف هذه الملفات المنزّلة؟ تقدّمك في القراءة سيظل محفوظًا.|Delete these downloads? Your reading progress will be kept.|یہ ڈاؤن لوڈز حذف کریں؟ تلاوت کی پیش رفت برقرار رہے گی۔
تمت استعادة الإعدادات الافتراضية بنجاح.|Default settings restored.|طے شدہ ترتیبات بحال ہو گئیں۔
تُحفظ التغييرات تلقائيًا.|Changes are saved automatically.|تبدیلیاں خود محفوظ ہوتی ہیں۔
تم حفظ الإعدادات بنجاح.|Settings saved.|ترتیبات محفوظ ہو گئیں۔
تم حفظ اختياراتك.|Your preferences have been saved.|آپ کی ترجیحات محفوظ ہو گئیں۔
`;
 const details=`
مواقيت الصلاة والقبلة وساعة الاستجابة 🕌|Prayer times, qibla & dua 🕌|نماز کے اوقات، قبلہ اور دعا 🕌
دليل الصلاة الشامل • صفة صلاة النبي ﷺ 📖|Prayer guide • How the Prophet ﷺ prayed 📖|نماز کی رہنمائی • نبی ﷺ کی نماز کا طریقہ 📖
أقرب المساجد إليك 📍|Nearby mosques 📍|آپ کے قریب مساجد 📍
أذكار اليوم وحصن المسلم 🤲|Daily adhkar & Hisn al-Muslim 🤲|روزانہ اذکار اور حصن المسلم 🤲
حديقة الحسنات وشجرة الذكر التفاعلية 🌱|Good deeds garden & dhikr tree 🌱|نیکیوں کا باغ اور ذکر کا درخت 🌱
الورد اليومي ومهام المسلم 🌿|Daily worship & tasks 🌿|روزانہ عبادات اور کام 🌿
مواسم الخيرات والأيام الفاضلة 🌙|Worship seasons & blessed days 🌙|عبادت کے مواقع اور بابرکت دن 🌙
الأدعية النبوية والقرآنية المصنفة 🤲|Quranic & prophetic duas by topic 🤲|موضوع کے مطابق قرآنی اور مسنون دعائیں 🤲
أسماء الله الحسنى ومعانيها ✨|Names of Allah & their meanings ✨|اسماء الحسنیٰ اور ان کے معانی ✨
قصص الأنبياء والصحابة الكرام 📜|Prophets & companions 📜|انبیاء اور صحابہ کے واقعات 📜
مسابقة اختبر معلوماتك الدينية 🏆|Islamic knowledge quiz 🏆|اسلامی معلومات کے سوالات 🏆
حاسبة الزكاة الشرعية الشاملة 🪙|Zakat calculator 🪙|زکوٰۃ کیلکولیٹر 🪙
حائط الدعاء بظهر الغيب 🌟|Dua wall 🌟|دعاؤں کی دیوار 🌟
فضل الدعاء والصدقة للميت 🤍|Dua & charity for the deceased 🤍|مرحوم کے لیے دعا اور صدقہ 🤍
دليل أحكام الجنائز وفضل الصدقة ⚖️|Funerals & charity guide ⚖️|جنازے اور صدقے کی رہنمائی ⚖️
دليل زيارة القبور وآدابها الشرعية 🌿|Grave visitation guide 🌿|زیارت قبور کی رہنمائی 🌿
المصحف الشريف والختمة الجماعية 📖|Mushaf & group khatma 📖|مصحف اور اجتماعی ختم قرآن 📖
مسح البحث|Clear search|تلاش صاف کریں
تلاوة وتكرار الآيات لتسهيل الحفظ (مساعد الحفظ)|Recite & repeat verses for memorization|حفظ کے لیے آیات سنیں اور دہرائیں
تبديل وضع راحة العين (ليلي دافئ / ورقي هادئ)|Switch reading theme (warm night / paper)|مطالعے کا انداز بدلیں (رات / کاغذ)
ملء الشاشة الكامل (Full Screen)|Full screen|مکمل اسکرین
إغلاق خيارات الاستماع|Close listening options|سننے کے اختیارات بند کریں
ابحث باسم السورة أو رقمها (مثال: الكهف، 18)...|Search by surah name or number (e.g. 18)…|سورت کے نام یا نمبر سے تلاش کریں (مثلاً ۱۸)…
مشاركة الآية|Share verse|آیت شیئر کریں
نسخ الآية|Copy verse|آیت نقل کریں
نسخ الآية الكريمة|Copy Quran verse|قرآنی آیت نقل کریں
تشغيل / إيقاف|Play / stop|چلائیں / روکیں
إغلاق المشغل|Close player|پلیئر بند کریں
تحديد مواقيت الصلاة بدقة لموقعك الحالي حول العالم|Prayer times for your current location|موجودہ مقام کے مطابق نماز کے اوقات
تحديد اتجاه القبلة نحو الكعبة المشرفة|Find the qibla direction|قبلے کی سمت معلوم کریں
تشغيل أو كتم صوت الأذان عند مواقيت الصلاة|Enable or mute adhan at prayer times|نماز کے وقت اذان فعال یا خاموش کریں
اختيار صوت المؤذن المفضل للأذان|Choose your adhan voice|اذان کی آواز منتخب کریں
تفعيل إشعار الصلاة والذكر الدائم في شريط الحالة|Enable the persistent prayer & dhikr notification|اسٹیٹس بار میں نماز اور ذکر کی مستقل اطلاع فعال کریں
معلومات ويدجت الشاشة الرئيسية في الهاتف|Phone home screen widget information|فون کی ہوم اسکرین کے ویجیٹ کی معلومات
اكتب اسم المدينة أو الحي (مثال: القاهرة، مكة، الرياض، المنصورة)...|Enter a city or neighborhood…|شہر یا محلے کا نام لکھیں…
إعادة تعيين ورد اليوم|Reset today’s worship checklist|آج کی عبادت کی فہرست دوبارہ شروع کریں
انقر هنا للتسبيح|Tap to count tasbeeh|تسبیح گننے کے لیے دبائیں
تشغيل / كتم صوت الخرزات|Enable / mute bead sounds|تسبیح کی آواز فعال / خاموش کریں
مشاركة هذا الذكر كستوري|Share this dhikr as a story|اس ذکر کی اسٹوری شیئر کریں
تصفير العداد|Reset counter|گنتی صفر کریں
موسوعة الأدعية النبوية المبوبة|Prophetic duas by topic|موضوع کے مطابق مسنون دعائیں
ابحث في نصوص وأسماء الأدعية (مثال: الشفاء، الرزق، الدين، الوالدين، الهم)...|Search dua titles or text…|دعا کے عنوان یا متن میں تلاش کریں…
مكتبة أسماء الله الحسنى ومعانيها|Names of Allah & their meanings|اسماء الحسنیٰ اور ان کے معانی
ابحث عن أي اسم من أسماء الله الحسنى أو في المعنى...|Search the names of Allah or their meanings…|اللہ کے نام یا ان کے معانی تلاش کریں…
جميع الأسماء (99)|All names (99)|تمام نام (۹۹)
أسماء الجلال والعظمة|Majesty & greatness|جلال اور عظمت
أسماء الرحمة واللطف|Mercy & kindness|رحمت اور لطف
أسماء القدرة والخلق|Power & creation|قدرت اور تخلیق
أسماء الرزق والإنعام|Provision & blessings|رزق اور انعام
أسماء المغفرة والعفو|Forgiveness & pardon|مغفرت اور معافی
أسماء العلم والإحاطة|Knowledge & awareness|علم اور احاطہ
أسماء الحكمة والعدل|Wisdom & justice|حکمت اور عدل
مقتطفات زاد المسلم|Zad Al Muslim inspiration|زاد المسلم کے منتخب کلپس
ابحث في المرئيات، الشيوخ، أو الموضوعات...|Search clips, speakers or topics…|کلپس، مقررین یا موضوعات تلاش کریں…
لم نجد مقتطفات مطابقة للبحث|No matching clips found|کوئی کلپ نہیں ملا
عرض جميع المقاطع|Show all clips|تمام کلپس دکھائیں
مكتبة قصص الأنبياء وسير الصحابة الكرام|Stories of prophets & companions|انبیاء اور صحابہ کے واقعات
جميع القصص والسير|All stories & biographies|تمام واقعات اور سیرتیں
قصص الأنبياء عليهم السلام|Stories of the prophets|انبیاء علیہم السلام کے واقعات
العشرة المبشرون بالجنة|The ten promised Paradise|عشرہ مبشرہ
اختبر معلوماتك الدينية وتحدَّ أصدقاءك 🎯|Test your Islamic knowledge 🎯|اپنی اسلامی معلومات آزمائیں 🎯
حائط الدعاء بظهر الغيب|Dua wall|دعاؤں کی دیوار
أدعية المحبين والزوار|Duas from loved ones & visitors|عزیزوں اور زائرین کی دعائیں
فضل الدعاء والصدقة للميت|Dua & charity for the deceased|مرحوم کے لیے دعا اور صدقہ
دليل أحكام الجنائز والصدقة الجارية وما ينفع الميت|Guide to funerals, ongoing charity & deeds for the deceased|جنازے، صدقہ جاریہ اور مرحوم کے لیے اعمال کی رہنمائی
دليل وآداب زيارة القبور للمتوفى|Grave visitation guide & etiquette|زیارت قبور کی رہنمائی اور آداب
ما يصل ثوابه للميت بإجماع العلماء|Deeds benefiting the deceased by scholarly consensus|علماء کے اتفاق سے مرحوم کو فائدہ پہنچانے والے اعمال
آداب الزيارة الشرعية المستحبة|Recommended visitation etiquette|زیارت کے مستحب آداب
تنبيهات ومخالفات يجب اجتنابها|Practices to avoid|جن کاموں سے بچنا چاہیے
أرسل دعاءك لفقيدنا الغالي|Offer a dua for our loved one|ہمارے مرحوم کے لیے دعا پیش کریں
مثال: حفيدك / ابنك / فاعل خير|Example: grandchild / child / anonymous|مثلاً: پوتا / بیٹا / گمنام
قراءة جزء لروحه الطاهرة|Dedicate a juz reading to the deceased|مرحوم کے لیے ایک پارے کی تلاوت
اسمك الكريم...|Your name…|آپ کا نام…
اكتب اسم المتوفى (مثال: أبي، أمي، أخي، فلان...)|Enter the deceased’s name…|مرحوم کا نام لکھیں…
أبي الحبيب|My beloved father|میرے پیارے والد
أمي الغالية|My beloved mother|میری پیاری والدہ
جدتي الغالية|My beloved grandmother|میری پیاری دادی / نانی
موتى المسلمين|Deceased Muslims|مسلمان مرحومین
تكبير الخط|Increase font size|خط بڑا کریں
تصغير الخط|Decrease font size|خط چھوٹا کریں
إخفاء/إظهار نص الآية لاختبار استحضار الحفظ|Hide / show verse text to test memorization|حفظ آزمانے کے لیے آیت چھپائیں / دکھائیں
الآية السابقة|Previous verse|پچھلی آیت
الآية التالية|Next verse|اگلی آیت
إعادة المقطع من البداية|Restart passage|حصہ شروع سے چلائیں
تحديد القبلة الدقيقة بموقعي الحالي GPS|Find qibla for my GPS location|موجودہ GPS مقام کے لیے قبلہ معلوم کریں
اكتب كلمة أو نصاً من الآية (مثال: الصابرين، الرحمن، الجنة، الفردوس)...|Enter a word or phrase from the Arabic verse…|عربی آیت کا لفظ یا عبارت لکھیں…
مثال: جدي الحاج محمد / والدي الحبيب أحمد...|Example: my grandfather Muhammad / my father Ahmad…|مثلاً: میرے دادا محمد / میرے والد احمد…
اسم النبي أو الصحابي|Prophet or companion’s name|نبی یا صحابی کا نام
رسالة الطمأنينة|A comforting reminder|تسلی کا پیغام
البدء من البداية|Start from the beginning|شروع سے چلائیں
تراجع 10 ثوان|Back 10 seconds|۱۰ سیکنڈ پیچھے
تقديم 10 ثوان|Forward 10 seconds|۱۰ سیکنڈ آگے
حفظ في محفوظاتي|Save to my collection|میری محفوظ چیزوں میں شامل کریں
فيديو|Video|ویڈیو
مثال: أختكم في الله، سائل رحمة ربه، طالب علم...|Example: a fellow Muslim / a student…|مثلاً: ایک مسلمان / طالب علم…
الإعدادات وتخصيص التطبيق • زاد المسلم|Settings & preferences • Zad Al Muslim|ترتیبات اور ترجیحات • زاد المسلم
`;
 const device=`
مرحبًا بك في زاد المسلم|Welcome to Zad Al Muslim|زاد المسلم میں خوش آمدید
مقدمة زاد المسلم|Zad Al Muslim introduction|زاد المسلم کا تعارف
تخطي|Skip|آگے بڑھیں
تشغيل الصوت|Enable sound|آواز فعال کریں
كتم الصوت|Mute sound|آواز خاموش کریں
فتح أذونات الإشعارات|Open notification permissions|اطلاعات کی اجازت کھولیں
السماح بالمواعيد الدقيقة|Allow exact alarms|درست وقت کے الارم کی اجازت دیں
إعدادات تشغيل الخلفية|Background activity settings|پس منظر کی ترتیبات
إذن شاشة الأذان الكاملة|Full-screen adhan permission|مکمل اسکرین اذان کی اجازت
اختبار الأذان بعد دقيقة|Test adhan in one minute|ایک منٹ بعد اذان آزمائیں
«سماع » يشغّل الصوت الآن. اختبار الخلفية يجدول تنبيهًا بعد دقيقة؛ اقفل الشاشة بعد تأكيد الجدولة.|Preview plays sound now. The background test schedules a reminder in one minute; lock the screen after scheduling is confirmed.|پیش منظر ابھی آواز چلاتا ہے۔ پس منظر کی آزمائش ایک منٹ بعد یاد دہانی مقرر کرتی ہے؛ تصدیق کے بعد اسکرین مقفل کریں۔
سماع العينة يختبر الصوت فقط. اختبار الخلفية متاح داخل تطبيق الهاتف.|Preview only tests sound. Background testing is available in the phone app.|پیش منظر صرف آواز آزماتا ہے۔ پس منظر کی آزمائش فون ایپ میں دستیاب ہے۔
الإشعارات:|Notifications:|اطلاعات:
إذن الإشعارات:|Notification permission:|اطلاعات کی اجازت:
مسموح بها|allowed|اجازت ہے
غير مسموح بها|not allowed|اجازت نہیں
تحتاج إذنًا|permission needed|اجازت درکار ہے
مسموح|allowed|اجازت ہے
غير مفعّل|disabled|غیر فعال
— المواعيد الدقيقة:|— Exact alarms:|— درست وقت کے الارم:
— شاشة الأذان: تحتاج إذنًا لفتح الشاشة عند القفل|— Adhan screen: permission required while locked|— اذان کی اسکرین: مقفل حالت میں اجازت درکار ہے
تنبيه الصلاة القادم:|Next prayer reminder:|نماز کی اگلی یاد دہانی:
. المواعيد محفوظة حتى|. Schedule saved until|۔ اوقات اس تاریخ تک محفوظ ہیں
. يتم تجديدها تلقائيًا دون إنترنت حسب الموقع المحفوظ.|. Renewed automatically offline using the saved location.|۔ محفوظ مقام کے مطابق آف لائن خود تجدید ہوتی ہے۔
. افتح التطبيق قبلها لتجديدها.|. Open the app before then to renew the schedule.|۔ اوقات کی تجدید کے لیے اس سے پہلے ایپ کھولیں۔
لا توجد تنبيهات صلاة قادمة محفوظة. راجع تفعيل الأذان ومواقيت مدينتك.|No upcoming prayer reminders are saved. Check adhan settings and your city’s times.|آئندہ نماز کی یاد دہانیاں محفوظ نہیں۔ اذان کی ترتیبات اور شہر کے اوقات دیکھیں۔
راجع قيود البطارية إذا تأخر التنبيه.|Check battery restrictions if reminders arrive late.|یاد دہانی میں تاخیر ہو تو بیٹری کی پابندیاں دیکھیں۔
. الجدولة حتى|. Scheduled until|۔ اوقات اس تاریخ تک مقرر ہیں
. افتح التطبيق لتجديدها؛ يصلك تذكير قبل انتهاء الجدولة.|. Open the app to renew; a reminder arrives before the schedule expires.|۔ تجدید کے لیے ایپ کھولیں؛ اوقات ختم ہونے سے پہلے یاد دہانی آئے گی۔
لا توجد تنبيهات صلاة قادمة يمكن تأكيدها.|No upcoming prayer reminders could be confirmed.|آئندہ نماز کی یاد دہانیوں کی تصدیق نہیں ہو سکی۔
تعذّر التحقق من الجدولة. حدّث التطبيق أو أعد المحاولة؛ حفظ الاختيارات لا يؤكد وصول التنبيه.|Could not verify the schedule. Update the app or retry; saved preferences alone do not confirm reminder delivery.|اوقات کی تصدیق نہیں ہو سکی۔ ایپ تازہ کریں یا دوبارہ کوشش کریں؛ صرف ترجیحات محفوظ ہونے سے اطلاع پہنچنے کی تصدیق نہیں ہوتی۔
تم حفظ مواقيت الصلاة المختارة وإلغاء المواعيد القديمة. افتح الرئيسية لتحديث المواقيت وجدولتها.|Prayer preferences saved and old alarms cancelled. Open Home to update and schedule prayer times.|نماز کی ترجیحات محفوظ اور پرانے الارم منسوخ ہو گئے۔ اوقات تازہ اور مقرر کرنے کے لیے ہوم کھولیں۔
على آيفون: مستوى الصوت هنا للعينة فقط؛ صوت الإشعار يتحكم فيه إعداد صوت الهاتف.|On iPhone, this volume is for previews only; notification volume follows your phone settings.|آئی فون پر یہ آواز صرف پیش منظر کے لیے ہے؛ اطلاع کی آواز فون کی ترتیبات کے مطابق ہے۔
هذا المستوى يطبّق على الأذان الفعلي فوق مستوى صوت المنبّه في الهاتف. إذا كان صوت المنبّه مكتومًا فلن يُسمع الأذان.|This level scales adhan volume relative to your phone’s alarm volume. If alarm volume is muted, adhan will not be heard.|یہ سطح فون کے الارم کی آواز کے مطابق اذان کی آواز بدلتی ہے۔ الارم خاموش ہو تو اذان سنائی نہیں دے گی۔
`;
 const dictionary=Object.create(null);
 (rows+more+tools+extra+secondary+completion+details+device).trim().split('\n').forEach(row=>{const [ar,en,ur]=row.trim().split('|');if(ar&&en&&ur)dictionary[ar]={en,ur};});
 dictionary['اكتشف خدمات زاد المسلم | دليلك الشامل لجميع الأقسام الإيمانية']={en:'Explore services • Zad Al Muslim',ur:'خدمات دریافت کریں • زاد المسلم'};
 dictionary['زاد المسلم | القرآن الكريم، مواقيت الصلاة، الأذكار والسبحة (صدقة جارية)']={en:'Zad Al Muslim | Quran, prayer times, adhkar & tasbeeh',ur:'زاد المسلم | قرآن، نماز کے اوقات، اذکار اور تسبیح'};
 `
الفاتحة|Al-Fatihah|الفاتحہ
يس|Ya-Sin|یٰسین
الشيخ...|Reciter…|قاری…
يوتيوب ↗|YouTube ↗|یوٹیوب ↗
مقتطفات إسلامي|Islamic clips|اسلامی اقتباسات
بودكاست إسلامي|Islamic podcasts|اسلامی پوڈکاسٹ
مواعظ وترقيق القلوب|Reminders for the heart|دلوں کی اصلاح
تأملات وتدبر|Reflections|غور و فکر
سيرة وقصص|Biography and stories|سیرت اور قصے
خواطر وقصيرة|Short reflections|مختصر خیالات
يتم عرض|Showing|دکھائے جا رہے ہیں
من أصل|of|کل میں سے
اسحب أفقياً لتصفح المقاطع|Swipe to browse clips|کلپس دیکھنے کے لیے افقی سوائپ کریں
عرض المزيد من المقتطفات|Show more clips|مزید کلپس دکھائیں
+9 مقاطع|+9 clips|+9 کلپس
جرّب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً.|Try other search terms or choose another category.|دوسرے الفاظ تلاش کریں یا دوسرا زمرہ منتخب کریں۔
اسحب أفقياً لتصفح القصص والسير|Swipe to browse stories and biographies|قصے اور سیرت دیکھنے کے لیے افقی سوائپ کریں
اسحب أفقياً لتصفح بطاقات الأدعية|Swipe to browse dua cards|دعاؤں کے کارڈ دیکھنے کے لیے افقی سوائپ کریں
أساس النصاب:|Nisab basis:|نصاب کی بنیاد:
أسعار الجرام —|Prices per gram —|فی گرام قیمتیں —
. لا نجلب أسعار السوق تلقائيًا؛ أدخل السعر الحالي بعملتك قبل اعتماد النتيجة:|. Market prices are not fetched automatically; enter the current price in your currency before using the result:|۔ مارکیٹ کی قیمتیں خودکار نہیں ملتیں؛ نتیجہ استعمال کرنے سے پہلے اپنی کرنسی میں موجودہ قیمت درج کریں:
ذهب عيار 24:|24-karat gold:|24 قیراط سونا:
فضة خام:|Pure silver:|خالص چاندی:
ر.س|SAR|سعودی ریال
تجب فيه الزكاة شرعاً|Zakat is due|زکوٰۃ واجب ہے
مقدار الزكاة الواجب إخراجها شرعاً (2.5%):|Zakat due (2.5%):|واجب زکوٰۃ (2.5%):
بشارة قلبية:|A heartwarming message:|دل کو خوش کرنے والی خبر:
أمّن|Said Ameen|آمین کہا
دعاءً بظهر الغيب|duas for others|غائبانہ دعائیں
تأمينة ودعوة مستجابة|Ameens and duas|آمین اور دعائیں
دعواتي المنشورة|My published duas|میری شائع شدہ دعائیں
شفاء مريض|Healing for the sick|مریض کی شفا
تفريج كرب|Relief from hardship|پریشانی سے نجات
تيسير ورزق|Ease and provision|آسانی اور رزق
نجاح وتوفيق|Success and guidance|کامیابی اور توفیق
هداية وصلاح|Guidance and righteousness|ہدایت اور اصلاح
رحمة لميت|Mercy for the deceased|مرحوم کے لیے رحمت
دعواتي الخاصة|My duas|میری دعائیں
في ميزان حسناته|In their record of good deeds|ان کی نیکیوں کے میزان میں
ادعُ لهم|Make dua for them|ان کے لیے دعا کریں
اكتب دعاءً لروحه|Write a dua for the deceased|مرحوم کے لیے دعا لکھیں
إهداء صدقة لفقيدك 🌿|Dedicate charity to your loved one 🌿|اپنے مرحوم کے لیے صدقہ 🌿
تنبيهات الطاعات 🔔|Worship reminders 🔔|عبادت کی یاد دہانیاں 🔔
أضف دعاءك ليظهر في السلايدر|Add your dua to the carousel|اپنی دعا شامل کریں تاکہ سلائیڈر میں نظر آئے
قبسات من النور|Glimpses of light|نور کی جھلکیاں
يمكنك كتابة أي اسم مخصص|You can enter any name|آپ کوئی بھی نام لکھ سکتے ہیں
المعاينة تتحدث تلقائياً مع كل اختيار|The preview updates with each selection|ہر انتخاب پر پیش منظر خود بدلتا ہے
صفحة ...|Page …|صفحہ …
سورة ...|Surah …|سورۃ …
علامات وقوفك المحفوظة في كتاب الله 🌿|Your saved Quran bookmarks 🌿|قرآن میں آپ کے محفوظ نشانات 🌿
حالة التخزين على جهازك:|Storage on your device:|آپ کے آلے پر ذخیرہ:
جاري التحقق...|Checking…|جانچ جاری ہے…
جاري الفحص|Checking|جانچ جاری ہے
تحميل السور الفاضلة والأكثر قراءة (سريع)|Download frequently read surahs (quick)|زیادہ پڑھی جانے والی سورتیں ڈاؤن لوڈ کریں (فوری)
يشمل: الفاتحة، الكهف، يس، الواقعة، الرحمن، الملك، المعوذات، وجزء عمّ وتبارك (~ 3 ميجابايت)|Includes Al-Fatihah, Al-Kahf, Ya-Sin, Al-Waqiah, Ar-Rahman, Al-Mulk, Al-Muawwidhat, and Juz Amma and Tabarak (~3 MB)|الفاتحہ، الکہف، یٰسین، الواقعہ، الرحمٰن، الملک، معوذات، اور عم و تبارک کے پارے شامل ہیں (~3 ایم بی)
تحميل المصحف الشريف كاملاً (604 صفحات)|Download the entire Mushaf (604 pages)|مکمل مصحف ڈاؤن لوڈ کریں (604 صفحات)
تنزيل جميع صفحات المصحف الشريف بدقة فيكتور عالية مع التفاسير الميسرة (~ 18 ميجابايت)|Download all Mushaf pages in high-quality vector format with simplified tafsir (~18 MB)|تمام صفحات اعلیٰ معیار میں آسان تفسیر کے ساتھ ڈاؤن لوڈ کریں (~18 ایم بی)
جاري تنزيل الصفحات...|Downloading pages…|صفحات ڈاؤن لوڈ ہو رہے ہیں…
الصفحات التي يتم حفظها تبقى متوفرة دائماً على جهازك بدون الحاجة للاتصال بالإنترنت.|Saved pages remain available on your device without an internet connection.|محفوظ صفحات انٹرنیٹ کے بغیر آپ کے آلے پر دستیاب رہتے ہیں۔
من آية:|From ayah:|آیت سے:
إلى آية:|To ayah:|آیت تک:
اختر نطاق الآيات واضغط "بدء التحفيظ" للبدء في الترديد 🌿|Choose an ayah range and press “Start memorization” to begin repeating 🌿|آیات منتخب کریں اور دہرانے کے لیے حفظ شروع کرنے کا بٹن دبائیں 🌿
بوصلة اتجاه القبلة الشريفة|Qibla compass|قبلے کا کمپاس
لم يُحدد بعد|Not set yet|ابھی متعین نہیں
زاوية الكعبة:|Kaaba bearing:|کعبے کا زاویہ:
شمال (N)|North (N)|شمال (N)
شرق (E)|East (E)|مشرق (E)
جنوب (S)|South (S)|جنوب (S)
غرب (W)|West (W)|مغرب (W)
القبلة|Qibla|قبلہ
قم بتوجيه أعلى الهاتف باتجاه علامة الكعبة الذهبية|Point the top of your phone toward the golden Kaaba marker|فون کا اوپری حصہ کعبے کے سنہری نشان کی طرف کریں
اختيار صوت مؤذن الصلوات|Choose an adhan voice|اذان کی آواز منتخب کریں
اختر صوت المؤذن المفضل للأذان عند مواقيت الصلاة، يمكنك الاستماع لمعاينة كل صوت قبل اعتماده:|Choose your preferred adhan voice. Preview each voice before selecting it:|اذان کی پسندیدہ آواز منتخب کریں۔ انتخاب سے پہلے ہر آواز سن سکتے ہیں:
تطبيق زاد المسلم على هاتفك 📱|Zad Al Muslim on your phone 📱|آپ کے فون پر زاد المسلم 📱
يمكنك تشغيل تطبيق|You can run|آپ چلا سکتے ہیں
اضغط على زر|Tap the button|بٹن دبائیں
المشاركة|Share|اشتراک
اختر|Choose|منتخب کریں
اضغط|Tap|دبائیں
بأعلى اليمين|at the top right|اوپر دائیں طرف
"إضافة إلى الصفحة الرئيسية"|“Add to Home Screen”|“ہوم اسکرین میں شامل کریں”
"إضافة" (Add)|“Add”|“شامل کریں” (Add)
مرر قائمة الخيارات لأسفل واضغط (Add to Home Screen)|Scroll down and tap “Add to Home Screen”|نیچے اسکرول کریں اور “Add to Home Screen” دبائیں
الأيقونة المربعة مع السهم المتجه لأعلى في شريط سفاري بالأسفل|The square with an upward arrow in Safari’s bottom bar|سفاری کی نچلی پٹی میں اوپر تیر والا مربع نشان
البحث الفوري في آيات القرآن الكريم|Search Quran ayahs|قرآن کی آیات میں تلاش
اكتب كلمة للبحث في المصحف الشريف الشامل (604 صفحات)|Enter a word to search the entire Mushaf (604 pages)|مکمل مصحف میں تلاش کے لیے لفظ لکھیں (604 صفحات)
فقيدنا الغالي|Our beloved departed|ہمارے پیارے مرحوم
والدي الحبيب|My beloved father|میرے پیارے والد
والدتي الغالية|My beloved mother|میری پیاری والدہ
جدي الغالي|My beloved grandfather|میرے پیارے دادا
أخي الحبيب|My beloved brother|میرے پیارے بھائی
أختي الغالية|My beloved sister|میری پیاری بہن
موتانا وموتى المسلمين|Our deceased loved ones and all deceased Muslims|ہمارے مرحومین اور تمام مسلمان مرحومین
جلال|Majesty|جلال
المعنى والشرح:|Meaning and explanation:|معنی اور تشریح:
الثمرة الإيمانية:|Spiritual benefit:|ایمانی فائدہ:
صيغة الدعاء والتعبد بهذا الاسم:|Making dua using this name:|اس نام سے دعا:
نسخ الاسم ومعناه|Copy name and meaning|نام اور معنی نقل کریں
قصص الأنبياء|Stories of the prophets|انبیاء کے قصے
أحداث وسياق القصة:|Events and context:|واقعات اور پس منظر:
أهم الدروس والعِبر المستفادة:|Key lessons:|اہم اسباق:
نسخ العِبر والدروس|Copy lessons|اسباق نقل کریں
مشاركة القصة لواتساب|Share story on WhatsApp|واٹس ایپ پر قصہ شیئر کریں
رسالة لقلبك اليوم|A message for your heart today|آج آپ کے دل کے لیے پیغام
الخاطرة والتدبر:|Reflection:|غور و فکر:
دعاء مقترح لليوم:|Suggested dua for today:|آج کی مجوزہ دعا:
نسخ الرسالة|Copy message|پیغام نقل کریں
بودكاست|Podcast|پوڈکاسٹ
تمرير أفقي ⟵|Swipe horizontally|افقی سوائپ کریں
خصوصيتك محفوظة 100% ولا نطلب أي بيانات شخصية.|Your privacy is protected; we do not ask for personal details.|آپ کی رازداری محفوظ ہے؛ ہم ذاتی تفصیلات نہیں مانگتے۔
إذا واجهت مشكلة، افتح في تطبيق YouTube ↗|Having trouble? Open in YouTube ↗|مسئلہ ہو تو یوٹیوب میں کھولیں ↗
مشاري العفاسي (مرتل)|Mishary Alafasy (Murattal)|مشاری العفاسی (مرتل)
محمود خليل الحصري (المعلم)|Mahmoud Khalil Al-Husary (teaching)|محمود خلیل الحصری (معلم)
محمود خليل الحصري (المصحف المعلم)|Mahmoud Khalil Al-Husary (teaching Mushaf)|محمود خلیل الحصری (مصحف معلم)
محمد صديق المنشاوي (مرتل)|Muhammad Siddiq Al-Minshawi (Murattal)|محمد صدیق المنشاوی (مرتل)
عبد الباسط عبد الصمد (مرتل)|Abdul Basit Abdus Samad (Murattal)|عبدالباسط عبدالصمد (مرتل)
الشيخ مشاري راشد العفاسي|Sheikh Mishary Rashid Alafasy|شیخ مشاری راشد العفاسی
مشاري راشد العفاسي|Mishary Rashid Alafasy|مشاری راشد العفاسی
عبد الباسط عبد الصمد|Abdul Basit Abdus Samad|عبدالباسط عبدالصمد
ماهر المعيقلي|Maher Al-Muaiqly|ماہر المعیقلی
خالد الجليل|Khalid Al-Jaleel|خالد الجلیل
ياسر الدوسري|Yasser Al-Dosari|یاسر الدوسری
علي جابر|Ali Jaber|علی جابر
المصحف كاملًا|Complete Quran|پورا قرآن
تنزيل المصحف كاملًا|Download the complete Quran|پورا قرآن ڈاؤن لوڈ کریں
سيتم تنزيل السور غير المحفوظة واحدة تلو الأخرى. قد يحتاج المصحف الكامل إلى مساحة كبيرة.|Unsaved surahs will download one at a time. The complete Quran may need substantial storage.|غیر محفوظ سورتیں ایک ایک کر کے ڈاؤن لوڈ ہوں گی۔ پورے قرآن کے لیے کافی جگہ درکار ہو سکتی ہے۔
تنزيل المصحف كاملًا؟ قد يستهلك مساحة وبيانات كثيرة.|Download the complete Quran? This may use substantial storage and data.|پورا قرآن ڈاؤن لوڈ کریں؟ اس میں کافی جگہ اور انٹرنیٹ ڈیٹا استعمال ہو سکتا ہے۔
كل سور القارئ محفوظة بالفعل.|All surahs by this reciter are already saved.|اس قاری کی تمام سورتیں پہلے سے محفوظ ہیں۔
اكتمل تنزيل المصحف؛ السور جاهزة بدون إنترنت.|The complete Quran is ready to listen offline.|پورا قرآن ڈاؤن لوڈ ہو گیا۔ سورتیں انٹرنیٹ کے بغیر سن سکتے ہیں۔
تم إيقاف التنزيل. السور المكتملة محفوظة.|Download stopped. Completed surahs are saved.|ڈاؤن لوڈ روک دیا گیا۔ مکمل سورتیں محفوظ ہیں۔
سعد الغامدي|Saad Al-Ghamdi|سعد الغامدی
حان الآن وقت أذكار الصباح ☀️|It is time for morning adhkar ☀️|صبح کے اذکار کا وقت ہے ☀️
حان الآن وقت أذكار المساء 🌙|It is time for evening adhkar 🌙|شام کے اذکار کا وقت ہے 🌙
موسم صيام مستحب 🌙|A season of recommended fasting 🌙|مستحب روزوں کا موسم 🌙
صيام اليوم: سنة مباركة|Today’s fast: a blessed Sunnah|آج کا روزہ: بابرکت سنت
مواسم الخير ومضاعفة الأجور|Seasons of goodness and greater reward|خیر اور زیادہ اجر کے موسم
عِبَرٌ وَدُرُوسٌ مُلْهِمَة|Inspiring lessons|سبق آموز واقعات
زَادُ الْمَعْرِفَةِ وَالْعِلْم|Grow your knowledge|علم و معرفت
جوامع الكلم وسؤال العظيم|Comprehensive words of supplication|جامع دعائیں
ركن الإسلام الثالث • طهرة وبركة|Islam’s third pillar • Purification and blessing|اسلام کا تیسرا رکن • پاکیزگی اور برکت
الترابط الأخوي الإيماني|Bonds of faith and brotherhood|ایمانی اخوت
لوحة تحكم زاد المسلم • الإشعارات والإحصائيات|Zad Al Muslim dashboard • Notifications and statistics|زاد المسلم ڈیش بورڈ • اطلاعات اور اعداد و شمار
العودة للتطبيق|Back to app|ایپ پر واپس
تسجيل الخروج|Sign out|سائن آؤٹ
إحصائيات|Statistics|اعداد و شمار
`.trim().split('\n').forEach(row=>{const [ar,en,ur]=row.split('|');if(ar&&en&&ur)dictionary[ar]={en,ur};});
 `
ختمة القرآن الكريم الجماعية لروحه • ختمة مباركة سحابية|A shared Quran completion for the departed • Synced online|مرحوم کے لیے اجتماعی ختم قرآن • آن لائن محفوظ
كيف تجد في قلبك الآن؟ اختر شعورك وسيدلك زاد المسلم على ما يطمئنك من آيات الذكر الحكيم والأدعية النبوية المأثورة:|How are you feeling? Choose a feeling to find comforting Quran verses and prophetic duas:|آپ کیسا محسوس کر رہے ہیں؟ تسلی بخش قرآنی آیات اور مسنون دعاؤں کے لیے اپنا احساس منتخب کریں:
يتم جلب البيانات الحقيقية بأعلى دقة وخصوصية كاملة دون أي تتبع لموقعك.|Accurate information is retrieved privately, without tracking your location.|درست معلومات رازداری کے ساتھ، آپ کے مقام کی نگرانی کے بغیر حاصل کی جاتی ہیں۔
اجعل من كل تسبيحة بذرة خير، ومن كل ذكر غرسة تنمو في حديقتك التفاعلية. وداوم على ذكر الله وتلاوة آياته، لتزهر حديقتك يومًا بعد يوم، وتكون شاهدًا على رحلتك مع الطاعات والأعمال الصالحة.|Let each tasbeeh plant a seed in your interactive garden. Keep remembering Allah and reading Quran so your garden grows alongside your daily worship.|ہر تسبیح سے اپنے باغ میں نیکی کا بیج بوئیں۔ ذکر اور تلاوت جاری رکھیں تاکہ آپ کی عبادت کے ساتھ باغ بھی روز بڑھتا رہے۔
اجعل لكل يوم نصيبًا من الطاعة، وراقب تقدمك في الصلاة وتلاوة القرآن والأذكار والأعمال الصالحة. فالقليل الدائم خيرٌ من الكثير المنقطع، وكل يوم فرصة جديدة لتزكية النفس والتقرب إلى الله.|Make time each day for worship and track your prayers, Quran reading, adhkar and good deeds. Small, consistent steps help you grow closer to Allah.|روز عبادت کے لیے وقت نکالیں اور نماز، تلاوت، اذکار اور نیک اعمال کی پیش رفت دیکھیں۔ چھوٹے مگر مستقل اعمال اللہ سے قرب بڑھاتے ہیں۔
تعرّف على تاريخ اليوم الهجري والميلادي ومواعيد أعظم المناسبات الإسلامية وأيام الصيام المستحبة مع عد تنازلي حيّ لكل موسم مبارك.|See today’s Hijri and Gregorian dates, Islamic occasions and recommended fasting days, with a live countdown.|آج کی ہجری اور عیسوی تاریخ، اسلامی مناسبتیں اور مستحب روزوں کے دن الٹی گنتی کے ساتھ دیکھیں۔
حلقات بودكاست نافعة، مواعظ خاشعة، تأملات قرآنية، وقصص ملهمة تثري عقلك وتطمئن قلبك بنية الصدقة الجارية.|Beneficial podcasts, reminders, Quran reflections and inspiring stories to enrich your mind and comfort your heart.|مفید پوڈکاسٹ، نصیحتیں، قرآنی تدبر اور سبق آموز قصے جو علم بڑھائیں اور دل کو سکون دیں۔
سير مباركة وأحداث تاريخية خالدة تزيد الإيمان وترسخ قيم الصبر واليقين والتضحية في قلوب المؤمنين.|Biographies and lasting historical lessons about faith, patience, certainty and sacrifice.|ایمان، صبر، یقین اور قربانی سکھانے والی سیرتیں اور تاریخی واقعات۔
مسابقة يومية سريعة وممتعة في القرآن الكريم والسنة النبوية والسيرة العطرة لنيل العلم والأجر والمشاركة.|A quick daily quiz about Quran, Sunnah and the Prophet’s life to learn and share.|قرآن، سنت اور سیرت پر روزانہ مختصر سوالات، سیکھنے اور شیئر کرنے کے لیے۔
احسب زكاة أموالك والذهب والفضة والأسهم وعروض التجارة بدقة شرعية 100% وفق النصاب الشرعي المعتمد وحولان الحول.|Calculate zakat on cash, gold, silver, shares and trade goods based on nisab and the passage of a lunar year.|نصاب اور قمری سال گزرنے کے مطابق نقدی، سونے، چاندی، حصص اور تجارتی سامان کی زکوٰۃ کا حساب کریں۔
أدعية مأثورة صحيحة من الكتاب والسنة مقسمة حسب حاجتك اليومية؛ لتفريج الكرب، والشفاء، والرزق، وصلاح الأهل والذرية.|Quranic and prophetic duas arranged by daily needs: relief, healing, provision and the well-being of your family.|قرآن و سنت کی دعائیں روزمرہ ضروریات کے مطابق: پریشانی، شفا، رزق اور اہل و اولاد کی اصلاح۔
تعرّف على معاني أسماء الله الحسنى الـ 99 ودلالاتها الإيمانية وثمار الدعاء بها لنيل البشارة النبوية بدخول الجنة.|Explore the meanings of Allah’s 99 beautiful names, their spiritual significance and how to use them in dua.|اللہ کے 99 خوبصورت ناموں کے معانی، ایمانی فوائد اور ان سے دعا کرنا جانیں۔
عرض جميع الأسماء (99 اسماً) • اضغط على أي اسم لعرض معناه وثمرته وصيغة الدعاء به|All 99 names • Select a name to see its meaning, benefit and suggested dua|تمام 99 نام • معنی، فائدہ اور دعا دیکھنے کے لیے نام منتخب کریں
اكتب اسمك لتسجيل حجز هذا الجزء، ثم اضغط على زر إتمام القراءة عند الانتهاء لتنال الأجر كاملاً إن شاء الله.|Enter your name to reserve this juz, then mark it complete when you finish reading.|اس پارے کو محفوظ کرنے کے لیے اپنا نام لکھیں، پھر پڑھنے کے بعد تکمیل کا بٹن دبائیں۔
حدد السورة ونطاق الآيات مع عدد التكرارات وفترة الترديد بصوتك لترسيخ الحفظ بسهولة 📖✨|Choose the surah, ayah range, repetitions and recitation pause to practise memorization 📖✨|حفظ کی مشق کے لیے سورۃ، آیات، تکرار اور دہرانے کا وقفہ منتخب کریں 📖✨
احفظ صفحات المصحف والتفاسير على هاتفك مباشرة لتتلو كتاب الله في أي وقت ومكان بدون الحاجة لبيانات الهاتف أو الاتصال بالإنترنت 🌿📱|Save Mushaf pages and tafsir on your phone to read anywhere without internet access 🌿📱|مصحف اور تفسیر فون پر محفوظ کریں اور انٹرنیٹ کے بغیر کہیں بھی پڑھیں 🌿📱
اختر أو اكتب دعاءً بالاسم الذي تريده لفقيدك الغالي، وصمّم بطاقة إسلامية راقية فوراً لنشرها في حالات واتساب ومواقع التواصل.|Choose or write a dua with your loved one’s name and create a card to share on WhatsApp or social media.|اپنے مرحوم کے نام کے ساتھ دعا منتخب کریں یا لکھیں اور واٹس ایپ یا سوشل میڈیا کے لیے کارڈ بنائیں۔
اكتب حاجتك بصدق، وإخوانك في الله سيؤمّنون لك دون كشف هويتك 🌿|Write your heartfelt request so others can say Ameen without seeing your identity 🌿|اپنی دلی حاجت لکھیں تاکہ دوسرے آپ کی شناخت جانے بغیر آمین کہیں 🌿
أدعية مأثورة جاهزة (اضغط لاختيار أحدها مباشرة):|Suggested duas (tap to choose):|تیار دعائیں (منتخب کرنے کے لیے دبائیں):
دعوتك ستظهر فوراً في السلايدر ليؤمّن عليها جميع الزوار بإذن الله.|Your dua will appear in the carousel for visitors to say Ameen, insha’Allah.|آپ کی دعا سلائیڈر میں نظر آئے گی تاکہ زائرین آمین کہیں، ان شاء اللہ۔
🕊️ تفريج هم وكرب وقضاء دين|🕊️ Relief from worry, hardship and debt|🕊️ فکر، پریشانی اور قرض سے نجات
🩺 شفاء مريض ومعافاة عاجلة|🩺 Healing and a speedy recovery|🩺 شفا اور جلد صحت یابی
🤲 تيسير رزق وعمل وبركة|🤲 Provision, work and blessings|🤲 رزق، کام اور برکت
🎓 نجاح وتوفيق وسداد|🎓 Success and sound guidance|🎓 کامیابی اور درست رہنمائی
🤍 هداية وثبات على الطاعة|🤍 Guidance and steadfast worship|🤍 ہدایت اور عبادت پر ثابت قدمی
🌿 رحمة ومغفرة لمتوفى|🌿 Mercy and forgiveness for the deceased|🌿 مرحوم کے لیے رحمت اور مغفرت
زاد المسلم (Zad Muslim)|Zad Al Muslim|زاد المسلم
سياسة الخصوصية وحماية بيانات المستخدم|Privacy policy and user data protection|رازداری کی پالیسی اور صارف کے ڈیٹا کا تحفظ
تطبيق إسلامي مجاني بالكامل لوجه الله تعالى • صدقة جارية|A free Islamic app for Allah’s sake • An ongoing charity|اللہ کے لیے مفت اسلامی ایپ • صدقہ جاریہ
نظرة عامة:|Overview:|جائزہ:
نحن في تطبيق|At|ہم ایپ میں
"زاد المسلم"|“Zad Al Muslim”|“زاد المسلم”
١. المعلومات والأذونات التي يطلبها التطبيق|1. Information and app permissions|1. معلومات اور ایپ کی اجازتیں
يعمل التطبيق بأعلى درجات الخصوصية، ولا يطلب إلا الأذونات الضرورية جداً لتقديم الخدمات الشرعية:|The app prioritizes privacy and requests only permissions needed to provide its services:|ایپ رازداری کو ترجیح دیتی ہے اور خدمات کے لیے ضروری اجازتیں ہی مانگتی ہے:
إذن الموقع الجغرافي (Location Permission):|Location permission:|مقام کی اجازت:
إذن الإشعارات والتنبيهات (Notification Permission):|Notification permission:|اطلاعات کی اجازت:
إذن التخزين المحلي (Local Storage):|Local storage:|مقامی ذخیرہ:
٢. سياسة الإعلانات والجهات الخارجية|2. Advertising and third parties|2. اشتہارات اور تیسرے فریق
تطبيق "زاد المسلم" هو صدقة جارية وموقوف لوجه الله تعالى:|Zad Al Muslim is an ongoing charity dedicated for Allah’s sake:|زاد المسلم اللہ کے لیے وقف صدقہ جاریہ ہے:
خالٍ تماماً من الإعلانات:|Ad-free:|اشتہارات سے پاک:
الخدمات الخارجية:|External services:|بیرونی خدمات:
المساعد الذكي:|AI assistant:|ذہین معاون:
حدود الاستخدام:|Usage limits:|استعمال کی حدود:
٣. استخدام الأطفال (Child Safety)|3. Child safety|3. بچوں کا تحفظ
٤. حذف البيانات والتحكم الكامل|4. Deleting and controlling your data|4. ڈیٹا حذف کرنا اور اختیار
٥. التعديلات على سياسة الخصوصية|5. Changes to this privacy policy|5. رازداری کی پالیسی میں تبدیلیاں
٦. التواصل والدعم|6. Contact and support|6. رابطہ اور مدد
تطبيق زاد المسلم • صدقة جارية عن جميع موتى المسلمين • نسألكم الدعاء|Zad Al Muslim • An ongoing charity for all deceased Muslims • Please remember us in your duas|زاد المسلم • تمام مسلمان مرحومین کے لیے صدقہ جاریہ • دعاؤں کی درخواست
آخر تحديث: نوفمبر 2026|Last updated: November 2026|آخری تازہ کاری: نومبر 2026
`.trim().split('\n').forEach(row=>{const [ar,en,ur]=row.split('|');if(ar&&en&&ur)dictionary[ar]={en,ur};});
 `
نستخدم البيانات الموضحة أدناه لتشغيل الميزات التي تختارها. التطبيق مجاني ولا يبيع بيانات المستخدمين.|use the data described below to provide the features you choose. The app is free and does not sell user data.|آپ کی منتخب کردہ سہولیات کے لیے ذیل میں بیان کردہ ڈیٹا استعمال کرتے ہیں۔ ایپ مفت ہے اور صارف کا ڈیٹا فروخت نہیں کرتی۔
يُستخدم حصرياً لإرسال تنبيهات الأذان عند حلول وقت الصلاة، والتذكير بأذكار الصباح والمساء، وتذكير صيام الأيام البيض ويوم الجمعة. يمكنك تعطيل أو تخصيص الإشعارات في أي وقت من إعدادات التطبيق.|Used only for prayer-time adhan alerts, morning and evening adhkar reminders, and reminders for the white days and Friday. You can disable or customize notifications in app settings at any time.|صرف نماز کے وقت اذان، صبح و شام کے اذکار، ایام بیض اور جمعے کی یاد دہانیوں کے لیے استعمال ہوتی ہے۔ ایپ کی ترتیبات سے اطلاعات کسی بھی وقت بند یا تبدیل کر سکتے ہیں۔
يُستخدم لحفظ علامات توقف القراءة في المصحف، قائمة الأذكار المفضلة، وإعدادات المؤذن والمدينة داخل هاتفك محلياً.|Used to save Quran bookmarks, favorite adhkar, and adhan voice and city preferences locally on your phone.|مصحف کے نشانات، پسندیدہ اذکار، مؤذن اور شہر کی ترتیبات فون پر محفوظ کرنے کے لیے استعمال ہوتا ہے۔
لا يحتوي التطبيق على أي إعلانات (No Ads) أو شبكات إعلانية تجارية تتبع سلوك المستخدم.|The app contains no ads or commercial advertising networks that track user behavior.|ایپ میں اشتہارات یا صارف کے رویے کی نگرانی کرنے والے تجارتی اشتہاری نیٹ ورک نہیں ہیں۔
لا نبيع أو نؤجر بيانات المستخدمين. بعض الوظائف تتصل بمقدمي خدمات خارجيين لتشغيل الميزة المطلوبة.|We do not sell or rent user data. Some features connect to external providers to deliver the requested service.|ہم صارفین کا ڈیٹا فروخت یا کرائے پر نہیں دیتے۔ بعض خصوصیات مطلوبہ خدمت کے لیے بیرونی فراہم کنندگان سے رابطہ کرتی ہیں۔
يستخدم الخادم بصمة مشفرة لعنوان الاتصال لحساب حدود الطلبات المشتركة، دون حفظ نص السؤال في مخزن العدادات. تُحذف عدادات الاستخدام تلقائيًا خلال مدة لا تتجاوز 48 ساعة. قد تحتفظ الاستضافة ومقدمو الخدمات بسجلات تشغيل وفق سياساتهم.|The server uses a hashed connection address to enforce shared request limits, without saving question text in the counter store. Usage counters are deleted automatically within 48 hours. Hosting and service providers may retain operational logs under their policies.|سرور مشترکہ درخواستوں کی حد کے لیے رابطے کے پتے کا ہیش استعمال کرتا ہے، سوال کا متن شمار کے ذخیرے میں محفوظ نہیں ہوتا۔ شمار 48 گھنٹوں کے اندر خود حذف ہو جاتا ہے۔ ہوسٹنگ اور خدمات کے فراہم کنندگان اپنی پالیسیوں کے مطابق عملی لاگ رکھ سکتے ہیں۔
التطبيق آمن لجميع الفئات العمرية ومناسب للأطفال والعائلة بالكامل، ولا يعرض أي محتوى غير لائق أو ضار أو يخالف الشريعة الإسلامية والآداب العامة.|The app is suitable for all ages, children and families, and does not display inappropriate or harmful content or content contrary to Islamic teachings and public decency.|ایپ تمام عمروں، بچوں اور خاندان کے لیے موزوں ہے اور نامناسب، نقصان دہ یا اسلامی تعلیمات اور عمومی آداب کے خلاف مواد نہیں دکھاتی۔
تبقى إحداثيات الصلاة وتفضيلات القراءة والأذكار على جهازك حتى تغيّرها أو تمسح بيانات التطبيق. يمكنك سحب إذن الموقع من إعدادات الهاتف. احذف أي نسخة احتياطية صدّرتها من مكان حفظها. لطلب حذف منشور عام، راسلنا على البريد أدناه.|Saved prayer coordinates and reading and adhkar preferences remain on your device until you change them or clear app data. You can revoke location permission in phone settings. Delete exported backups from their saved location. For removal of a public post, contact the email below.|نماز کے نقاط اور مطالعے و اذکار کی ترجیحات آلے پر رہتی ہیں جب تک آپ انہیں بدلیں یا ایپ کا ڈیٹا مٹائیں۔ فون کی ترتیبات سے مقام کی اجازت واپس لے سکتے ہیں۔ بیک اپ اس کی محفوظ جگہ سے حذف کریں۔ عوامی پوسٹ ہٹوانے کے لیے نیچے دیے گئے ای میل پر رابطہ کریں۔
نحتفظ بحق تحديث سياسة الخصوصية هذه عند الضرورة لمواكبة التحديثات التقنية. سيتم نشر أي تغيير على هذه الصفحة فور حدوثه.|We may update this privacy policy as needed to reflect technical changes. Changes will be published on this page.|تکنیکی تبدیلیوں کے مطابق ضرورت پر یہ پالیسی تازہ کی جا سکتی ہے۔ تبدیلیاں اسی صفحے پر شائع ہوں گی۔
إذا كان لديك أي استفسار، اقتراح، أو ملاحظة حول سياسة الخصوصية أو خدمات التطبيق، يسعدنا تواصلك معنا مباشرة عبر البريد الإلكتروني:|For questions, suggestions or feedback about this privacy policy or the app’s services, contact us by email:|رازداری کی پالیسی یا ایپ کی خدمات کے بارے میں سوال، تجویز یا رائے کے لیے ای میل پر رابطہ کریں:
`.trim().split('\n').forEach(row=>{const [ar,en,ur]=row.split('|');if(ar&&en&&ur)dictionary[ar]={en,ur};});
 // Surah names in interface labels; Quran text remains excluded from translation.
 `الفاتحة|Al-Fatihah|الفاتحة
البقرة|Al-Baqarah|البقرة
آل عمران|Ali Imran|آل عمران
النساء|An-Nisa|النساء
المائدة|Al-Maidah|المائدة
الأنعام|Al-Anam|الأنعام
الأعراف|Al-Araf|الأعراف
الأنفال|Al-Anfal|الأنفال
التوبة|At-Tawbah|التوبة
يونس|Yunus|يونس
هود|Hud|هود
يوسف|Yusuf|يوسف
الرعد|Ar-Rad|الرعد
إبراهيم|Ibrahim|إبراهيم
الحجر|Al-Hijr|الحجر
النحل|An-Nahl|النحل
الإسراء|Al-Isra|الإسراء
الكهف|Al-Kahf|الكهف
مريم|Maryam|مريم
طه|Ta-Ha|طه
الأنبياء|Al-Anbiya|الأنبياء
الحج|Al-Hajj|الحج
المؤمنون|Al-Muminun|المؤمنون
النور|An-Nur|النور
الفرقان|Al-Furqan|الفرقان
الشعراء|Ash-Shuara|الشعراء
النمل|An-Naml|النمل
القصص|Al-Qasas|القصص
العنكبوت|Al-Ankabut|العنكبوت
الروم|Ar-Rum|الروم
لقمان|Luqman|لقمان
السجدة|As-Sajdah|السجدة
الأحزاب|Al-Ahzab|الأحزاب
سبأ|Saba|سبأ
فاطر|Fatir|فاطر
يس|Ya-Sin|يس
الصافات|As-Saffat|الصافات
ص|Sad|ص
الزمر|Az-Zumar|الزمر
غافر|Ghafir|غافر
فصلت|Fussilat|فصلت
الشورى|Ash-Shura|الشورى
الزخرف|Az-Zukhruf|الزخرف
الدخان|Ad-Dukhan|الدخان
الجاثية|Al-Jathiyah|الجاثية
الأحقاف|Al-Ahqaf|الأحقاف
محمد|Muhammad|محمد
الفتح|Al-Fath|الفتح
الحجرات|Al-Hujurat|الحجرات
ق|Qaf|ق
الذاريات|Adh-Dhariyat|الذاريات
الطور|At-Tur|الطور
النجم|An-Najm|النجم
القمر|Al-Qamar|القمر
الرحمن|Ar-Rahman|الرحمن
الواقعة|Al-Waqiah|الواقعة
الحديد|Al-Hadid|الحديد
المجادلة|Al-Mujadilah|المجادلة
الحشر|Al-Hashr|الحشر
الممتحنة|Al-Mumtahanah|الممتحنة
الصف|As-Saff|الصف
الجمعة|Al-Jumuah|الجمعة
المنافقون|Al-Munafiqun|المنافقون
التغابن|At-Taghabun|التغابن
الطلاق|At-Talaq|الطلاق
التحريم|At-Tahrim|التحريم
الملك|Al-Mulk|الملك
القلم|Al-Qalam|القلم
الحاقة|Al-Haqqah|الحاقة
المعارج|Al-Maarij|المعارج
نوح|Nuh|نوح
الجن|Al-Jinn|الجن
المزمل|Al-Muzzammil|المزمل
المدثر|Al-Muddaththir|المدثر
القيامة|Al-Qiyamah|القيامة
الإنسان|Al-Insan|الإنسان
المرسلات|Al-Mursalat|المرسلات
النبأ|An-Naba|النبأ
النازعات|An-Naziat|النازعات
عبس|Abasa|عبس
التكوير|At-Takwir|التكوير
الانفطار|Al-Infitar|الانفطار
المطففين|Al-Mutaffifin|المطففين
الانشقاق|Al-Inshiqaq|الانشقاق
البروج|Al-Buruj|البروج
الطارق|At-Tariq|الطارق
الأعلى|Al-Ala|الأعلى
الغاشية|Al-Ghashiyah|الغاشية
الفجر|Al-Fajr|الفجر
البلد|Al-Balad|البلد
الشمس|Ash-Shams|الشمس
الليل|Al-Layl|الليل
الضحى|Ad-Duha|الضحى
الشرح|Ash-Sharh|الشرح
التين|At-Tin|التين
العلق|Al-Alaq|العلق
القدر|Al-Qadr|القدر
البينة|Al-Bayyinah|البينة
الزلزلة|Az-Zalzalah|الزلزلة
العاديات|Al-Adiyat|العاديات
القارعة|Al-Qariah|القارعة
التكاثر|At-Takathur|التكاثر
العصر|Al-Asr|العصر
الهمزة|Al-Humazah|الهمزة
الفيل|Al-Fil|الفيل
قريش|Quraysh|قريش
الماعون|Al-Maun|الماعون
الكوثر|Al-Kawthar|الكوثر
الكافرون|Al-Kafirun|الكافرون
النصر|An-Nasr|النصر
المسد|Al-Masad|المسد
الإخلاص|Al-Ikhlas|الإخلاص
الفلق|Al-Falaq|الفلق
الناس|An-Nas|الناس`.trim().split('\n').forEach(row=>{const [ar,en,ur]=row.split('|');dictionary[ar]={en,ur};});
 // Labels created by the section renderers, dialogs and offline controls.
 const interfaceRows=`
جدي الغالي عبدالمعبود أمين سعيد، وجدتي الغالية حكم عبدالصمد|My dear grandfather, Abdel Maaboud Amin Saeed, and my dear grandmother, Hekm Abdel Samad|میرے پیارے دادا عبدالمعبود امین سعید اور میری پیاری دادی حکم عبدالصمد
، رحمهما الله وأسكنهما فسيح جناته.|, may Allah have mercy on them and grant them Paradise.|، اللہ ان دونوں پر رحم فرمائے اور انہیں جنت میں جگہ عطا فرمائے۔
— عبده محمد|— Abdo Mohamed|— عبدہ محمد
تجربة مشغّل بديل|Try an alternative player|متبادل پلیئر آزمائیں
تعذّر تشغيل التلاوة؛ أعد تنزيلها|Unable to play the recitation; download it again|تلاوت نہیں چل سکی؛ دوبارہ ڈاؤن لوڈ کریں
اكتملت التلاوة|Recitation completed|تلاوت مکمل ہو گئی
لا توجد محطات في المفضلة حالياً|No favorite stations yet|ابھی کوئی پسندیدہ اسٹیشن نہیں
بث مباشر مستقر 24/7 لنخبة من مشاهير القراء في العالم الإسلامي|Live recitations from renowned Quran reciters, available around the clock|عالم اسلام کے معروف قراء کی تلاوت، چوبیس گھنٹے براہ راست
مستقر 24/7|Available 24/7|چوبیس گھنٹے دستیاب
تلاوات خاشعة نادرة ومؤثرة من محراب الحرم المكي الشريف 24/7|Moving recitations from the Grand Mosque in Makkah, around the clock|حرم مکی سے اثر انگیز تلاوتیں، چوبیس گھنٹے
الحرم المكي|The Grand Mosque in Makkah|حرم مکی
تلاوات ندية خاشعة ومؤثرة برواية حفص عن عاصم 24/7|Heartfelt Quran recitations in the Hafs narration, around the clock|روایت حفص عن عاصم میں پُرسوز تلاوتیں، چوبیس گھنٹے
تلاوات ندية|Melodious recitations|پُرسوز تلاوتیں
المصحف المرتل الخاشع برواية حفص عن عاصم|Measured Quran recitation in the Hafs narration|روایت حفص عن عاصم میں ترتیل کے ساتھ تلاوت
المصحف المرتل|Measured Quran recitation|قرآن کی مرتل تلاوت
تلاوات مجودة ومرتلة نادرة برواية حفص|Rare mujawwad and measured recitations in the Hafs narration|روایت حفص میں نادر مجود اور مرتل تلاوتیں
صوت مكة|The voice of Makkah|مکہ کی آواز
المصحف المرتل برواية حفص عن عاصم|Quran recitation in the Hafs narration|روایت حفص عن عاصم میں قرآن کی تلاوت
مرتل كامل|Complete Quran recitation|مکمل مرتل قرآن
تلاوات خاشعة ومبكية برواية حفص عن عاصم 24/7|Moving Quran recitations in the Hafs narration, around the clock|روایت حفص عن عاصم میں رقت انگیز تلاوتیں، چوبیس گھنٹے
تلاوات خاشعة|Heartfelt recitations|خشوع بھری تلاوتیں
المصحف المرتل كاملاً من الحرم المكي الشريف|Complete Quran recitation from the Grand Mosque in Makkah|حرم مکی سے مکمل مرتل قرآن
إمام الحرم|Imam of the Grand Mosque|امام حرم
تلاوات خاشعة مرتلة من الحرم المكي الشريف|Heartfelt Quran recitations from the Grand Mosque in Makkah|حرم مکی سے خشوع بھری مرتل تلاوتیں
بث تلاوات من الحرم المكي والمسجد النبوي|Recitations from the Grand Mosque and the Prophet's Mosque|حرم مکی اور مسجد نبوی سے تلاوتیں
مكة المكرمة|Makkah|مکہ مکرمہ
آيات الرقية الشرعية وأدعية الشفاء مكررة 24/7|Ruqyah verses and duas for healing, repeated around the clock|رقیہ کی آیات اور شفا کی دعائیں، چوبیس گھنٹے
تحصين وشفاء|Protection and healing|حفاظت اور شفا
تلاوات مبكية خاشعة لتهدئة النفس وجلب النوم والسكينة|Peaceful recitations for relaxation, rest and sleep|دل کے سکون، آرام اور نیند کے لیے پُرسوز تلاوتیں
سكينة ونوم|Peace and sleep|سکون اور نیند
تشغيل موعظة اليوم|Play today's reminder|آج کی نصیحت چلائیں
استماع بالصوت فقط|Listen to audio only|صرف آواز سنیں
مشاركة واتساب|Share on WhatsApp|واٹس ایپ پر شیئر کریں
مشاركة تويتر|Share on Twitter|ٹوئٹر پر شیئر کریں
مثال: سورة البقرة، آية 255|Example: Surah Al-Baqarah, ayah 255|مثال: سورۃ البقرہ، آیت 255
اكتب التصويب المقترح أو الملاحظة بالتفصيل...|Describe your suggested correction or feedback…|اپنی مجوزہ اصلاح یا رائے تفصیل سے لکھیں…
مشاهدة المقطع على YouTube|Watch on YouTube|یوٹیوب پر دیکھیں
مشغل المرئيات|Video player|ویڈیو پلیئر
التبديل بين الفيديو والصوت|Switch between video and audio|ویڈیو اور آواز کے درمیان تبدیل کریں
الصفحة اليمنى|Right page|دائیں صفحہ
الصفحة اليسرى|Left page|بائیں صفحہ
نسخ الدعاء|Copy dua|دعا کاپی کریں
تنقل بطاقات الأذكار|Browse adhkar cards|اذکار کے کارڈ دیکھیں
انقر هنا لتزكية شجرة طاعاتك وتذكير نفسك بالذكر 🌿|Tap to nurture your worship tree and remember Allah 🌿|اپنی عبادت کے درخت کی نگہداشت اور ذکر کی یاد دہانی کے لیے دبائیں 🌿
كل نقرة في السبحة تزيد حسنة|Each tasbeeh tap adds one point|تسبیح کا ہر دباؤ ایک پوائنٹ بڑھاتا ہے
كل صفحة في المصحف تزيد 5 حسنات|Each Quran page adds 5 points|قرآن کا ہر صفحہ 5 پوائنٹس بڑھاتا ہے
إتمام الأذكار يزيد 15 حسنة|Completing adhkar adds 15 points|اذکار مکمل کرنے سے 15 پوائنٹس بڑھتے ہیں
حل المسابقات والأحاديث يزيد 5 حسنات|Completing quizzes and hadith activities adds 5 points|مسابقے اور حدیث کی سرگرمیاں مکمل کرنے سے 5 پوائنٹس بڑھتے ہیں
متابعة الأيام المكتملة هذا الأسبوع|Track completed days this week|اس ہفتے کے مکمل دن دیکھیں
اليوم|Today|آج
تعديل تاريخ الهلال حسب بلدك|Adjust the Hijri date for local moon sighting|اپنے ملک کی رؤیت ہلال کے مطابق ہجری تاریخ بدلیں
تأخير يوم|Move back one day|ایک دن پیچھے کریں
تقديم يوم|Move forward one day|ایک دن آگے کریں
انقر لتكرار الدعاء ونيل الأجر|Tap to repeat the dua|دعا دہرانے کے لیے دبائیں
مشاركة الدعاء لواتساب|Share dua on WhatsApp|واٹس ایپ پر دعا شیئر کریں
حفظ لمشاهدته لاحقاً 🔖|Save to watch later 🔖|بعد میں دیکھنے کے لیے محفوظ کریں 🔖
حفظ المقطع|Save clip|کلپ محفوظ کریں
موثوق|Verified|تصدیق شدہ
مشاركة المقطع عبر واتساب كصدقة جارية|Share this clip on WhatsApp as ongoing charity|اس کلپ کو صدقہ جاریہ کے طور پر واٹس ایپ پر شیئر کریں
اضغط للتأمين والدعاء لأخيك ونيل أجر: ولك بمثل|Tap to say amen and make dua for another Muslim|آمین کہنے اور اپنے مسلمان بھائی کے لیے دعا کرنے کے لیے دبائیں
مشاركة الدعاء عبر واتساب|Share dua on WhatsApp|واٹس ایپ پر دعا شیئر کریں
نسخ نص الدعاء|Copy dua text|دعا کا متن کاپی کریں
اكتب دعاءك هنا بصدق وإخلاص...|Write your heartfelt dua here…|یہاں اخلاص سے اپنی دعا لکھیں…
اكتب دعاءك أو آيتك هنا بصدق...|Write your dua or Quran verse here…|یہاں اپنی دعا یا قرآنی آیت لکھیں…
اتجاه الكعبة المشرفة|Direction of the Kaaba|کعبہ کی سمت
أيقونة التطبيق|App icon|ایپ کا آئیکن
اكتب ما في قلبك بكل صدق (مثال: ادعوا لأمي بالشفاء العاجل، أو ادعوا لي بتفريج همي وقضاء ديني)...|Write your heartfelt request (for example, pray for my mother's recovery, or for relief from worry and debt)…|اپنی دلی درخواست لکھیں (مثلاً میری والدہ کی صحت یابی یا میرے غم اور قرض سے نجات کے لیے دعا کریں)…
أوسمة الإنجاز والاستمرارية|Achievement and consistency badges|کامیابی اور تسلسل کے اعزازات
فتح جميع الأقسام|Expand all sections|تمام حصے کھولیں
طي الأقسام|Collapse sections|حصے بند کریں
مستوى صوت الأذان|Adhan volume|اذان کی آواز کی سطح
معاينة شاشة الأذان|Adhan screen preview|اذان کی اسکرین کا پیش نظارہ
إغلاق المعاينة|Close preview|پیش نظارہ بند کریں
البريد الإلكتروني للمسؤول|Admin email address|منتظم کا ای میل پتہ
كلمة المرور|Password|پاس ورڈ
تجربة إرسال من الخادم لجهاز واحد|Send a server test to one device|سرور سے ایک آلے کو آزمائشی اطلاع بھیجیں
فتح التطبيق الرئيسي|Open the main app|مرکزی ایپ کھولیں
مثال: سُورَةُ الكَهْفِ • نُورٌ لِمَا بَيْنَ الجُمُعَتَيْنِ 🌿|Example: Surah Al-Kahf • Light between Fridays 🌿|مثال: سورۃ الکہف • دو جمعوں کے درمیان نور 🌿
اكتب نص التذكير أو الحديث الشريف...|Write the reminder or hadith text…|یاد دہانی یا حدیث کا متن لکھیں…
إعادة تعيين|Reset|دوبارہ ترتیب دیں
أدخل الرمز الحالي|Enter the current passcode|موجودہ پاس کوڈ درج کریں
أدخل الرمز الجديد (12 حرفًا على الأقل)|Enter a new passcode (at least 12 characters)|نیا پاس کوڈ درج کریں (کم از کم 12 حروف)
أعد كتابة الرمز الجديد|Re-enter the new passcode|نیا پاس کوڈ دوبارہ درج کریں
مثال: https://www.youtube.com/watch?v=Pfj4niPP0DY أو Pfj4niPP0DY|Example: https://www.youtube.com/watch?v=Pfj4niPP0DY or Pfj4niPP0DY|مثال: https://www.youtube.com/watch?v=Pfj4niPP0DY یا Pfj4niPP0DY
مثال: 1:25:40 أو 18:30|Example: 1:25:40 or 18:30|مثال: 1:25:40 یا 18:30
مثال: الأكثر مشاهدة 🔥 (10M) أو حلقة استثنائية|Example: Most watched 🔥 (10M) or Featured episode|مثال: سب سے زیادہ دیکھا گیا 🔥 (10M) یا منتخب قسط
اكتب ملخصاً مشوقاً ومفيداً يظهر للمستخدم في تفاصيل المقطع...|Write a helpful, engaging summary for the clip details…|کلپ کی تفصیلات کے لیے دلچسپ اور مفید خلاصہ لکھیں…
معاينة الصورة|Image preview|تصویر کا پیش نظارہ
ابحث بالعنوان أو الشيخ أو الوصف...|Search by title, speaker or description…|عنوان، مقرر یا تفصیل سے تلاش کریں…
ابحث في نص البلاغ أو الموضع...|Search report text or location…|شکایت کے متن یا مقام میں تلاش کریں…
هـ|AH|ھ
محمد ﷺ|Muhammad ﷺ|محمد ﷺ
آمَنْتُ وَدَعَوْتُ لَكَ|I said amen and prayed for you|میں نے آمین کہا اور آپ کے لیے دعا کی
كيف يمكن فهمك للقرآن أن يغيّر حياتك بالكامل؟|How can understanding the Quran transform your life?|قرآن کو سمجھنا آپ کی زندگی کیسے بدل سکتا ہے؟
حوار استثنائي عميق يغير نظرتك لكتاب الله بالكامل، وكيف يتحول القرآن من مجرد تلاوة إلى منهاج حياة وشفاء وبصيرة.|An in-depth conversation about understanding the Quran as a way of life, healing and insight, beyond recitation alone.|قرآن کو محض تلاوت سے آگے بڑھ کر زندگی کے طریقے، شفا اور بصیرت کے طور پر سمجھنے پر ایک گہری گفتگو۔
كيف يفتح لنا القرآن أبوابه؟ مفاتيح التدبر والعيش مع الآيات|How does the Quran open its doors to us? Keys to reflection and living with its verses|قرآن ہمارے لیے اپنے دروازے کیسے کھولتا ہے؟ تدبر اور آیات کے ساتھ زندگی گزارنے کی کنجیاں
لقاء إيماني عظيم حول كيفية كسر الحواجز بين قلبك والقرآن، وفهم رسائل الله المباشرة إليك في كل آية.|A conversation about removing barriers between your heart and the Quran and understanding the guidance in each verse.|دل اور قرآن کے درمیان رکاوٹیں دور کرنے اور ہر آیت کی ہدایت سمجھنے پر ایک ایمانی گفتگو۔
أقومية القرآن - لماذا كان القرآن أعظم معجزة لهداية البشرية؟|The Quran's upright guidance — Why is it the greatest miracle for guiding humanity?|قرآن کی سیدھی رہنمائی — یہ انسانیت کی ہدایت کا سب سے بڑا معجزہ کیوں ہے؟
محاضرة فكرية وإيمانية عميقة تجيب عن سر إعجاز القرآن وقوته المطلقة في إقامة العدل وهداية النفوس.|A thoughtful lecture on the Quran's miraculous nature and its power to establish justice and guide hearts.|قرآن کے اعجاز اور انصاف قائم کرنے اور دلوں کو ہدایت دینے کی قوت پر ایک فکری و ایمانی خطاب۔
القرآن.. لماذا غيّر الصحابة رضي الله عنهم ولم يغيّرنا؟|The Quran: why did it transform the companions, yet fail to transform us?|قرآن نے صحابہ رضی اللہ عنہم کو بدل دیا، ہمیں کیوں نہیں بدلتا؟
حلقة استثنائية تبحث في الفارق بين طريقة تعامل جيل الصحابة مع الوحي وطريقة تعاملنا اليوم، ومفتاح التغيير الحقيقي.|An episode exploring how the companions approached revelation, how we approach it today and the key to real change.|صحابہ کے وحی سے تعلق، آج ہمارے رویے اور حقیقی تبدیلی کی کنجی پر ایک گفتگو۔
لماذا لا يُستجاب دعاؤك؟ السر الذي يغفل عنه الملايين!|Why is your dua not answered? What millions overlook|آپ کی دعا قبول کیوں نہیں ہوتی؟ وہ بات جس سے لاکھوں لوگ غافل ہیں
كشف موانع الإجابة وأسرار اليقين والافتقار إلى الله في الدعاء، ولماذا يؤخر الله العطاء لحكمة بالغة.|Obstacles to answered dua, certainty and dependence on Allah, and the wisdom behind delayed answers.|قبولیت دعا کی رکاوٹیں، یقین اور اللہ کے سامنے عاجزی، اور جواب میں تاخیر کی حکمت۔
مجلس إيماني شبابي مؤثر حول لطف الله بالتائبين وفرحه برجوع عبده، وكيف تمسح التوبة كل ما قبلها وتبدله حسنات.|A heartfelt discussion for young people about Allah's kindness to those who repent and how repentance erases past sins and replaces them with good deeds.|نوجوانوں کے لیے اللہ کی توبہ کرنے والوں پر مہربانی اور توبہ کے گناہوں کو مٹانے اور نیکیوں میں بدلنے پر ایک اثر انگیز گفتگو۔
كيف تبدأ صفحة جديدة مع الله؟ هذا الدرس إن وصلك فالله أراد بك خيرًا|How can you make a fresh start with Allah? A lesson to renew your hope|اللہ کے ساتھ نیا آغاز کیسے کریں؟ امید تازہ کرنے والا درس
كلمات دافئة من أرق ما سمعت للشيخ سعد العتيق تفتح لك أبواب الصلح مع الله وبداية حياة جديدة مليئة بالسكينة والبركة.|Gentle words from Sheikh Saad Al-Atiq about returning to Allah and beginning a new life of peace and blessing.|شیخ سعد العتیق کے نرم اور اثر انگیز الفاظ، اللہ کی طرف رجوع اور سکون و برکت والی نئی زندگی کے آغاز کے بارے میں۔
جرعة وعي روحانية ونفسية تلخص لك كيف تتخلص من شقاء الدنيا بالاعتصام بكتاب الله وسنة رسوله ﷺ.|Spiritual and psychological reflections on finding relief from worldly distress through the Quran and the Prophet's Sunnah ﷺ.|قرآن اور سنت رسول ﷺ سے وابستگی کے ذریعے دنیا کی پریشانی سے نجات پر روحانی اور نفسیاتی رہنمائی۔
كيف تبدأ علاقة حقيقية مع الله وتصل لسكينة القلب؟|How can you build a sincere relationship with Allah and find peace of heart?|اللہ کے ساتھ سچا تعلق قائم کر کے دل کا سکون کیسے پائیں؟
حوار إيماني ونفسي عميق حول كيفية تجديد الصلة بالله وبناء التزام صادق بعيداً عن التكلف.|An in-depth discussion on renewing your connection with Allah and developing sincere, unforced devotion.|اللہ سے تعلق تازہ کرنے اور بناوٹ سے پاک سچی پابندی پیدا کرنے پر ایک گہری ایمانی و نفسیاتی گفتگو۔
أسرار الخشوع في الصلاة وعلاج السرحان والوساوس|Finding humility in prayer and overcoming distraction and intrusive thoughts|نماز میں خشوع اور توجہ کی کمی اور وسوسوں کا علاج
خطوات عملية وروحانية للوصول إلى لذة الصلاة والاتصال الحقيقي برب العالمين.|Practical and spiritual steps toward finding joy in prayer and a sincere connection with Allah.|نماز کی لذت اور رب العالمین سے حقیقی تعلق پانے کے عملی و روحانی اقدامات۔
كيف تتغلب على وساوس الشيطان وتنتصر على ذنوب الخلوات؟|How can you overcome whispers of Shaytan and sins committed in private?|شیطان کے وسوسوں اور تنہائی کے گناہوں پر کیسے قابو پائیں؟
تحليل نفسي وشرعي لمداخل الشيطان وكيفية حماية القلب والثبات على طريق الطاعة.|A psychological and religious discussion of Shaytan's approaches, protecting the heart and remaining steadfast in worship.|شیطان کے راستوں، دل کی حفاظت اور اطاعت پر ثابت قدمی کا نفسیاتی و شرعی جائزہ۔
قوانين التوفيق والبركة في الرزق والعمر والأهل|Finding divine help and blessing in provision, life and family|رزق، عمر اور اہل خانہ میں توفیق اور برکت کے اصول
توضيح مفاتيح البركة الإلهية في المال والصحة والوقت، وفضل الصدقة الخفية في صلاح الذرية.|Keys to blessing in wealth, health and time, and the virtue of private charity in nurturing a righteous family.|مال، صحت اور وقت میں الٰہی برکت کی کنجیاں اور اولاد کی اصلاح میں پوشیدہ صدقے کی فضیلت۔
أسرار الفرج وتفريج الكروب والهموم المستعصية|Finding relief from distress and persistent worries|مشکل پریشانیوں اور غموں سے نجات کے راز
رسائل إيمانية تبث الأمل واليقين في قلوب المبتلين وحسن الظن بالله عند الشدائد والمحن.|Messages of faith that nurture hope, certainty and trust in Allah during hardship and trials.|آزمائشوں میں امید، یقین اور اللہ سے حسن ظن پیدا کرنے والے ایمانی پیغامات۔
أعظم تجارة مع الله - فضل الصدقة الجارية وأثرها في القبر|The greatest trade with Allah — Ongoing charity and its benefit in the grave|اللہ کے ساتھ بہترین تجارت — صدقہ جاریہ کی فضیلت اور قبر میں اس کا فائدہ
موعظة خاشعة حول كيف تنجيك الصدقة الجارية في ظلمة القبر وتكون نوراً وظلاً لصاحبها.|A heartfelt reminder about ongoing charity bringing light and protection in the darkness of the grave.|قبر کے اندھیرے میں صدقہ جاریہ کے نور اور حفاظت بننے پر ایک اثر انگیز نصیحت۔
ماذا يحدث للميت عند أول ليلة في قبره؟ وكيف نؤنس وحدته؟|What happens on the first night in the grave, and how can we bring comfort to the deceased?|قبر کی پہلی رات میت کے ساتھ کیا ہوتا ہے، اور ہم اسے تسلی کیسے پہنچائیں؟
بيان فضل الدعاء والاستغفار ووهب الثواب للوالدين والأجداد والأحباب المتوفين.|The virtue of dua, seeking forgiveness and dedicating rewards to deceased parents, grandparents and loved ones.|مرحوم والدین، بزرگوں اور عزیزوں کے لیے دعا، استغفار اور ایصال ثواب کی فضیلت۔
أجمل ما قيل في التوبة والرجوع إلى الله لمن أثقلته الذنوب|Words of hope about repentance and returning to Allah when sins weigh heavily|گناہوں کے بوجھ تلے دبے شخص کے لیے توبہ اور اللہ کی طرف رجوع کی امید افزا باتیں
كلمات دافئة تفتح أبواب الأمل والمغفرة لكل من ظن أن ذنوبه لا تُغفر وأن الله أرحم بعباده.|Reassuring words of hope and forgiveness for anyone who feels their sins are beyond pardon, recalling Allah's mercy.|جو اپنے گناہوں کو ناقابل معافی سمجھتا ہے، اس کے لیے اللہ کی رحمت، امید اور مغفرت کی تسلی بخش باتیں۔
وصف الجنة ونعيمها الأبدي وما أعده الله للمتقين|Paradise, its eternal blessings and what Allah has prepared for the righteous|جنت، اس کی دائمی نعمتیں اور متقین کے لیے اللہ کی تیار کردہ نعمتیں
رحلة روحانية بديعة في وصف درجات الجنة وقصورها وأنهارها ولقاء الأحبة فيها.|A spiritual journey through the ranks, palaces and rivers of Paradise and reunion with loved ones.|جنت کے درجات، محلات، نہروں اور عزیزوں سے ملاقات کے بیان کا ایک روحانی سفر۔
كيف تتدبر سورة يوسف وتستخرج منها شفاء لقلبك؟|How can reflection on Surah Yusuf bring healing to your heart?|سورۃ یوسف میں تدبر سے دل کی شفا کیسے پائیں؟
وقفات تدبرية عميقة في أحسن القصص ودروس الصبر واليقين بعد الابتلاء.|Reflections on the most beautiful story and its lessons of patience and certainty through trials.|احسن القصص میں تدبر اور آزمائش کے بعد صبر اور یقین کے اسباق۔
عجائب سورة الكهف والنجاة من فتن الزمان الأربع|The wonders of Surah Al-Kahf and protection from four trials|سورۃ الکہف کے عجائب اور چار فتنوں سے نجات
شرح بديع لروابط قصص سورة الكهف وكيف تشكل درعاً للمسلم في حياته.|An explanation of the connections between the stories in Surah Al-Kahf and their guidance and protection in a Muslim's life.|سورۃ الکہف کے قصوں کے باہمی تعلق اور مسلمان کی زندگی میں ان کی رہنمائی اور حفاظت کی وضاحت۔
تأملات في سورة الملك المنجية من عذاب القبر|Reflections on Surah Al-Mulk and protection from punishment in the grave|عذاب قبر سے حفاظت دینے والی سورۃ الملک میں غور و فکر
أسرار آيات الملك وعظمة خلق الله والكون وسبب حمايتها لصاحبها في القبر.|Reflections on Al-Mulk, the greatness of Allah's creation and its reciter's protection in the grave.|سورۃ الملک کی آیات، اللہ کی تخلیق کی عظمت اور پڑھنے والے کی قبر میں حفاظت پر گفتگو۔
قصة إسلام وسيرة الفاروق عمر بن الخطاب رضي الله عنه|The conversion and life of Umar ibn al-Khattab, may Allah be pleased with him|فاروق عمر بن خطاب رضی اللہ عنہ کے اسلام لانے کا قصہ اور سیرت
شخصية عمر الملهمة، عدله، هيبته، وخشيته العظيمة من الله تعالى.|Umar's inspiring character, justice, dignity and deep reverence for Allah.|عمر رضی اللہ عنہ کی متاثر کن شخصیت، عدل، ہیبت اور اللہ کا عظیم خوف۔
كلمة واحدة تمحو ذنوبك وتملأ ميزانك بالحسنات|Words that erase sins and fill your scale with good deeds|گناہ مٹانے اور میزان کو نیکیوں سے بھرنے والے کلمات
فضل الاستغفار وقول سبحان الله وبحمده سبحان الله العظيم.|The virtue of seeking forgiveness and saying: ⁧سبحان الله وبحمده سبحان الله العظيم⁩.|استغفار اور سبحان الله وبحمده سبحان الله العظيم کہنے کی فضیلت۔
وصية من ذهب: كيف تدعو لمن تحب بعد وفاته؟|Precious advice: how can you pray for a loved one after their death?|قیمتی نصیحت: کسی عزیز کی وفات کے بعد اس کے لیے کیسے دعا کریں؟
أنفع الأعمال التي تصل للميت في قبره وتجعله في نور دائم.|Beneficial deeds for the deceased that bring light to their grave.|میت کو قبر میں فائدہ اور نور پہنچانے والے بہترین اعمال۔
د. نايف بن نهار|Dr. Nayef bin Nahar|ڈاکٹر نایف بن نہار
هِداية بودكاست|Hidayah Podcast|ہدایہ پوڈکاسٹ
م. شريف علي|Sherif Ali|شریف علی
الشيخ سعد العتيق|Sheikh Saad Al-Atiq|شیخ سعد العتیق
بودكاست وعي|Waie Podcast|وعی پوڈکاسٹ
د. عثمان الخميس|Dr. Uthman Al-Khamis|ڈاکٹر عثمان الخمیس
الشيخ حازم شومان|Sheikh Hazem Shoman|شیخ حازم شومان
د. عمر عبد الكافي|Dr. Omar Abdel Kafi|ڈاکٹر عمر عبد الکافی
د. أحمد عبد المنعم|Dr. Ahmed Abdel Moneim|ڈاکٹر احمد عبد المنعم
الأكثر مشاهدة 🔥 (20M)|Most watched 🔥 (20M)|سب سے زیادہ دیکھا گیا 🔥 (20M)
ملايين المشاهدات 🌟 (6.3M)|Millions of views 🌟 (6.3M)|لاکھوں ملاحظات 🌟 (6.3M)
مليون مشاهدة 💎 (1.1M)|Over a million views 💎 (1.1M)|دس لاکھ سے زیادہ ملاحظات 💎 (1.1M)
بودكاست مميز 🎙️|Featured podcast 🎙️|منتخب پوڈکاسٹ 🎙️
أسرار الدعاء 🤲|The power of dua 🤲|دعا کے راز 🤲
ترقيق القلوب 🌸|Softening hearts 🌸|دلوں کی نرمی 🌸
بداية جديدة 🌿|A fresh start 🌿|نیا آغاز 🌿
سكينة ووعي 🕊️|Peace and awareness 🕊️|سکون اور آگاہی 🕊️
الأكثر استماعاً 🔥|Most listened 🔥|سب سے زیادہ سنا گیا 🔥
مميز 🌟|Featured 🌟|منتخب 🌟
توجيهي 💡|Guidance 💡|رہنمائی 💡
قيم 🌿|Valuable lessons 🌿|قیمتی اسباق 🌿
مؤثر 🤲|Heartfelt 🤲|اثر انگیز 🤲
صدقة جارية 🕊️|Ongoing charity 🕊️|صدقہ جاریہ 🕊️
ترقيق القلوب 🌙|Softening hearts 🌙|دلوں کی نرمی 🌙
توبة 🌸|Repentance 🌸|توبہ 🌸
بشارة 🌺|Glad tidings 🌺|خوش خبری 🌺
تدبر 📖|Quran reflection 📖|قرآنی تدبر 📖
سورة الكهف 🕌|Surah Al-Kahf 🕌|سورۃ الکہف 🕌
سورة الملك 🌙|Surah Al-Mulk 🌙|سورۃ الملک 🌙
الصحابة ⚔️|The companions ⚔️|صحابہ ⚔️
خاطرة ⚡|A short reflection ⚡|مختصر نصیحت ⚡
دعاء للميت 🕊️|Dua for the deceased 🕊️|میت کے لیے دعا 🕊️
مؤثر جداً|Very moving|بہت اثر انگیز
بصيرة وهداية|Insight and guidance|بصیرت اور ہدایت
الأكثر رواجاً|Trending|مقبول ترین
شائع جداً|Very popular|بہت مقبول
توجيهي|Guidance|رہنمائی
بركة وخير|Blessings and goodness|برکت اور خیر
تفريج الكرب|Relief from distress|پریشانی سے نجات
ترقيق القلوب|Softening hearts|دلوں کی نرمی
توبة ومغفرة|Repentance and forgiveness|توبہ اور مغفرت
بشارة النعيم|Glad tidings of Paradise|جنت کی خوش خبری
شفاء الصدور|Healing for the heart|دلوں کی شفا
نور الأسبوع|Light for the week|ہفتے کا نور
المنجية من القبر|Protection in the grave|قبر میں حفاظت
حب النبي ﷺ|Love for the Prophet ﷺ|نبی ﷺ کی محبت
عدل الفاروق|The justice of Al-Faruq|فاروق کا عدل
أجور عظيمة|Great rewards|عظیم اجر
بر الوالدين|Kindness to parents|والدین کے ساتھ نیکی
موعظة خاشعة|A heartfelt reminder|اثر انگیز نصیحت
تأملات قرآنية|Quran reflections|قرآنی غور و فکر
خاطرة إيمانية|A reflection on faith|ایمانی نصیحت
موعظة اليوم|Today's reminder|آج کی نصیحت
تذكير الجمعة • سورة الكهف والصلاة على النبي ﷺ|Friday reminder • Surah Al-Kahf and salawat upon the Prophet ﷺ|جمعہ کی یاد دہانی • سورۃ الکہف اور نبی ﷺ پر درود
خير يوم طلعت عليه الشمس؛ لا تنسَ قراءة سورة الكهف، والإكثار من الصلاة والسلام على النبي ﷺ، والدعاء في ساعة الاستجابة.|On this blessed Friday, remember Surah Al-Kahf, send blessings upon the Prophet ﷺ and make dua during the hour of answered prayer.|اس مبارک جمعہ کو سورۃ الکہف پڑھیں، نبی ﷺ پر کثرت سے درود و سلام بھیجیں اور قبولیت کی گھڑی میں دعا کریں۔
قراءة سورة الكهف 📖|Read Surah Al-Kahf 📖|سورۃ الکہف پڑھیں 📖
سنة صيام الإثنين • ترفع فيه الأعمال 🌿|Monday Sunnah fast • A day when deeds are presented 🌿|پیر کا مسنون روزہ • اعمال پیش ہونے کا دن 🌿
سنة صيام الخميس • ترفع فيه الأعمال 🌿|Thursday Sunnah fast • A day when deeds are presented 🌿|جمعرات کا مسنون روزہ • اعمال پیش ہونے کا دن 🌿
قال ﷺ: 'تُعرض الأعمال يوم الاثنين والخميس، فأحب أن يُعرض عملي وأنا صائم'. هنيئاً للصائمين وبشرى بباب الريان.|The Prophet ﷺ said: '⁧تُعرض الأعمال يوم الاثنين والخميس، فأحب أن يُعرض عملي وأنا صائم⁩'. Glad tidings to those who fast and the promise of the gate of Al-Rayyan.|نبی ﷺ نے فرمایا: 'تُعرض الأعمال يوم الاثنين والخميس، فأحب أن يُعرض عملي وأنا صائم'۔ روزہ داروں کو مبارک ہو اور باب ریان کی خوش خبری ہو۔
مواقيت الصلاة والصيام 🤲|Prayer and fasting times 🤲|نماز اور روزے کے اوقات 🤲
غداً سنة صيام الإثنين المبارك 🌙|Tomorrow: the Monday Sunnah fast 🌙|کل پیر کا مسنون روزہ ہے 🌙
غداً سنة صيام الخميس المبارك 🌙|Tomorrow: the Thursday Sunnah fast 🌙|کل جمعرات کا مسنون روزہ ہے 🌙
بيّت النية لصيام الغد؛ تُعرض الأعمال على الله تعالى ويُباعد الله وجه الصائم عن النار سبعين خريفاً.|Make your intention to fast tomorrow. Deeds are presented to Allah, and He distances the fasting person's face from the Fire by seventy years.|کل کے روزے کی نیت کریں۔ اعمال اللہ کے حضور پیش ہوتے ہیں اور اللہ روزہ دار کے چہرے کو آگ سے ستر سال دور فرماتا ہے۔
أذكار وطاعات الصيام 🤲|Adhkar and worship for fasting 🤲|روزے کے اذکار اور عبادات 🤲
قيام الليل والأسحار • شرف المؤمن 🌌|Night prayer and the hours before dawn • The believer's honor 🌌|قیام اللیل اور سحر کے اوقات • مومن کی شان 🌌
ينزل ربنا تبارك وتعالى إلى السماء الدنيا: 'هل من داعٍ فأستجيب له؟'... صلِّ ركعتين خاشعتين واختم ليلتك بالوتر واستغفر بالأسحار.|Our Lord descends to the lowest heaven: '⁧هل من داعٍ فأستجيب له؟⁩'… Pray two rakahs with humility, end your night with Witr and seek forgiveness before dawn.|ہمارا رب آسمان دنیا پر نزول فرماتا ہے: 'هل من داعٍ فأستجيب له؟'… خشوع سے دو رکعتیں پڑھیں، رات وتر پر ختم کریں اور سحر میں استغفار کریں۔
تصفح الأدعية 🤲|Browse duas 🤲|دعائیں دیکھیں 🤲
ألا بذكر الله تطمئن القلوب • أذكار الصباح 🌅|Hearts find peace in Allah's remembrance • Morning adhkar 🌅|اللہ کے ذکر سے دلوں کو سکون ملتا ہے • صبح کے اذکار 🌅
ابدأ يومك بحفظ الله ورعايته؛ أذكار الصباح حصن منيع وانشراح للصدر وبركة في الرزق ليومك كله.|Begin your day seeking Allah's protection. Morning adhkar bring reassurance and blessings throughout your day.|اپنے دن کا آغاز اللہ کی حفاظت طلب کرتے ہوئے کریں۔ صبح کے اذکار دل کی کشادگی اور پورے دن کی برکت کا ذریعہ ہیں۔
أذكار الصباح 🛡️|Morning adhkar 🛡️|صبح کے اذکار 🛡️
صلاة الضحى • صدقة عن كل مفصل ☀️|Duha prayer • Charity for every joint ☀️|نماز چاشت • ہر جوڑ کا صدقہ ☀️
يصبح على كل سلامى من أحدكم صدقة، وتجزئ عن ذلك ركعتان يركعهما من الضحى صلاة الأوابين لجلب البركة والسكينة.|Charity is due for every joint each day. Two rakahs of Duha fulfill this, bringing a moment of worship and peace.|ہر دن ہر جوڑ کی طرف سے صدقہ لازم ہوتا ہے۔ چاشت کی دو رکعتیں اس کے لیے کافی ہیں اور عبادت و سکون کا موقع ہیں۔
دليل الصلاة والسنن 🕌|Prayer and Sunnah guide 🕌|نماز اور سنتوں کی رہنمائی 🕌
طيّب وقتك بذكر الله وتلاوة كتابه 📖|Brighten your day with dhikr and Quran recitation 📖|اللہ کے ذکر اور تلاوت سے اپنا دن روشن کریں 📖
ورد القرآن اليومي 📖|Daily Quran reading 📖|روزانہ تلاوت قرآن 📖
حصّن نفسك وأهلك • أذكار المساء 🌇|Seek protection for your family • Evening adhkar 🌇|اپنے اور اہل خانہ کے لیے حفاظت طلب کریں • شام کے اذکار 🌇
أمسينا وأمسى الملك لله؛ حان وقت أذكار المساء لطمأنينة القلب والوقاية من كل سوء والتحصين الشامل حتى تصبح.|'⁧أمسينا وأمسى الملك لله⁩' — It is time for evening adhkar: reassurance for the heart and protection through the night.|'أمسينا وأمسى الملك لله' — شام کے اذکار کا وقت ہے، دل کے سکون اور صبح تک حفاظت کے لیے۔
أذكار المساء 🛡️|Evening adhkar 🛡️|شام کے اذکار 🛡️
ما بين المغرب والعشاء • روضة الطاعات 🕌|Between Maghrib and Isha • A time for worship 🕌|مغرب اور عشاء کے درمیان • عبادت کا وقت 🕌
وقت مبارك لشهود السنن الرواتب، وتدبر آيات الذكر الحكيم، ومداومة الاستغفار والتسبيح قبل صلاة العشاء.|A blessed time for Sunnah prayers, Quran reflection, seeking forgiveness and tasbeeh before Isha.|عشاء سے پہلے سنن رواتب، قرآن میں غور و فکر، استغفار اور تسبیح کا مبارک وقت۔
السبحة والأذكار 📿|Tasbeeh and adhkar 📿|تسبیح اور اذکار 📿
سكينة الليل ونور القبر 🌙|Peace at night and light in the grave 🌙|رات کا سکون اور قبر کا نور 🌙
سورة الملك تنجي من عذاب القبر وتشفع لصاحبها، واختم ليلتك بركعة الوتر قبل النوم لتنام على طاعة.|Recite Surah Al-Mulk for protection and intercession, and end your night with Witr before going to sleep.|حفاظت اور شفاعت کے لیے سورۃ الملک پڑھیں، اور سونے سے پہلے وتر پڑھ کر رات مکمل کریں۔
قراءة سورة الملك 📖|Read Surah Al-Mulk 📖|سورۃ الملک پڑھیں 📖
تعذّر بدء خدمة الصوت في أندرويد|Unable to start Android audio playback|اینڈرائیڈ کی صوتی خدمت شروع نہیں ہو سکی
تعذّر استكمال التلاوة|Unable to resume the recitation|تلاوت دوبارہ جاری نہیں ہو سکی
الصوت محجوز بواسطة مكالمة أو تطبيق آخر|Audio is in use by a call or another app|آواز کسی کال یا دوسری ایپ کے استعمال میں ہے
تعذّر تشغيل الصوت بعد تحميل البث|Unable to play audio after loading the stream|نشریات لوڈ ہونے کے بعد آواز نہیں چل سکی
تعذّر الاتصال بالبث من مشغّل أندرويد|The Android player could not connect to the stream|اینڈرائیڈ پلیئر نشریات سے رابطہ نہیں کر سکا
انتهت مهلة تحميل البث|The stream loading request timed out|نشریات لوڈ کرنے کی مہلت ختم ہو گئی
اختر المدينة من التطبيق|Choose a city in the app|ایپ سے شہر منتخب کریں
موقعك الحالي|Your location|آپ کا مقام
إغلاق التنبيه|Dismiss alert|اطلاع بند کریں
ابدأ يومك بذكر الله|Begin your day with the remembrance of Allah|اپنے دن کا آغاز اللہ کے ذکر سے کریں
حان وقت أذكار المساء|It is time for evening adhkar|شام کے اذکار کا وقت ہے
جمعة مباركة|Blessed Friday|جمعہ مبارک
تذكير بسورة الكهف والصلاة على النبي ﷺ|Remember Surah Al-Kahf and salawat upon the Prophet ﷺ|سورۃ الکہف اور نبی ﷺ پر درود کی یاد دہانی
تذكير بالصيام|Fasting reminder|روزے کی یاد دہانی
غدًا موعد صيام الإثنين أو الخميس|Tomorrow is a Monday or Thursday fasting day|کل پیر یا جمعرات کے روزے کا دن ہے
ﷺ صلِّ على النبي|ﷺ Send blessings upon the Prophet|ﷺ نبی پر درود بھیجیں
جدّد مواقيت الصلاة|Refresh prayer times|نماز کے اوقات تازہ کریں
افتح التطبيق لتجديد تنبيهات الصلاة قبل انتهاء المواعيد المحفوظة.|Open the app to renew prayer alerts before the saved schedule expires.|محفوظ اوقات ختم ہونے سے پہلے نماز کی اطلاعات تازہ کرنے کے لیے ایپ کھولیں۔
تنبيه اقتراب موعد الصلاة|Upcoming prayer alert|نماز کا وقت قریب ہونے کی اطلاع
تنبيه اقتراب صلاة الفجر|Upcoming Fajr alert|فجر کا وقت قریب ہونے کی اطلاع
تنبيه اقتراب صلاة الظهر|Upcoming Dhuhr alert|ظہر کا وقت قریب ہونے کی اطلاع
تنبيه اقتراب صلاة العصر|Upcoming Asr alert|عصر کا وقت قریب ہونے کی اطلاع
تنبيه اقتراب صلاة المغرب|Upcoming Maghrib alert|مغرب کا وقت قریب ہونے کی اطلاع
تنبيه اقتراب صلاة العشاء|Upcoming Isha alert|عشاء کا وقت قریب ہونے کی اطلاع
أذان الشيخ ناصر القطامي (الافتراضي)|Adhan by Sheikh Nasser Al-Qatami (default)|شیخ ناصر القطامی کی اذان (بنیادی)
أذان الشيخ عبد الباسط|Adhan by Sheikh Abdul Basit|شیخ عبد الباسط کی اذان
أذان الشيخ محمد رفعت|Adhan by Sheikh Muhammad Rifat|شیخ محمد رفعت کی اذان
أذان الفجر المخصوص|Fajr adhan|فجر کی مخصوص اذان
أذكار الصباح والمساء وسورة الكهف|Morning and evening adhkar and Surah Al-Kahf|صبح و شام کے اذکار اور سورۃ الکہف
تذكير الصلاة على النبي ﷺ|Salawat reminder|نبی ﷺ پر درود کی یاد دہانی
الصلاة على النبي ﷺ — الصوت الأول|Salawat — Voice 1|درود — پہلی آواز
الصلاة على النبي ﷺ — الصوت الثاني|Salawat — Voice 2|درود — دوسری آواز
تذكير الصلاة على النبي ﷺ (بدون صوت)|Silent salawat reminder|درود کی خاموش یاد دہانی
إشعارات ورسائل زاد المسلم العامة|Zad Al Muslim announcements|زاد المسلم کی عمومی اطلاعات
تعذّر تجهيز النسخة الاحتياطية:|Unable to prepare backup:|بیک اپ تیار نہیں ہو سکا:
تعذّر الاسترجاع:|Restore failed:|بحالی ناکام:
بيانات غير صالحة في النسخة:|Invalid backup data:|بیک اپ کا ڈیٹا درست نہیں:
الحجم غير متاح|Size unavailable|حجم دستیاب نہیں
حفظ التلاوات غير مدعوم في هذا المتصفح.|Saving recitations is not supported in this browser.|اس براؤزر میں تلاوت محفوظ کرنے کی سہولت نہیں ہے۔
مصدر التلاوة غير صالح.|Invalid recitation source.|تلاوت کا ذریعہ درست نہیں۔
تعذّر معرفة الحجم.|Unable to determine the size.|حجم معلوم نہیں ہو سکا۔
انتظر اكتمال التنزيل الحالي.|Wait for the current download to finish.|موجودہ ڈاؤن لوڈ مکمل ہونے کا انتظار کریں۔
التخزين غير مدعوم.|Storage is not supported.|ذخیرہ کرنے کی سہولت دستیاب نہیں۔
تعذّر تنزيل التلاوة.|Unable to download the recitation.|تلاوت ڈاؤن لوڈ نہیں ہو سکی۔
الملف غير صالح أو حجمه أكبر من المسموح.|The file is invalid or exceeds the size limit.|فائل درست نہیں یا مقررہ حجم سے بڑی ہے۔
مساحة التخزين غير كافية.|Not enough storage space.|ذخیرہ کرنے کی جگہ کافی نہیں۔
التلاوة أكبر من الحد المسموح.|The recitation exceeds the size limit.|تلاوت مقررہ حجم سے بڑی ہے۔
التنزيل لم يكتمل.|The download did not complete.|ڈاؤن لوڈ مکمل نہیں ہوا۔
الملف ليس تلاوة صوتية صالحة.|The file is not a valid audio recitation.|فائل درست صوتی تلاوت نہیں ہے۔
أوقف التنزيل أولًا.|Stop the download first.|پہلے ڈاؤن لوڈ روکیں۔
الملف غير موجود؛ نزّله من جديد.|File not found; download it again.|فائل موجود نہیں؛ دوبارہ ڈاؤن لوڈ کریں۔
تعذّر البحث. حاول مجددًا.|Search failed. Try again.|تلاش ناکام ہوئی۔ دوبارہ کوشش کریں۔
الخدمة غير متاحة حاليًا.|The service is currently unavailable.|خدمت فی الحال دستیاب نہیں۔
جاري تحديد موقعك الجغرافي الدقيق عبر GPS...|Finding your precise location using GPS…|GPS سے آپ کا درست مقام معلوم کیا جا رہا ہے…
جاري استخدام الموقع المحفوظ أو تحديد موقعك عند الحاجة...|Using your saved location or locating you if needed…|محفوظ مقام استعمال کیا جا رہا ہے یا ضرورت پر مقام معلوم کیا جائے گا…
لا توجد نتائج محفوظة لهذا الموقع والنطاق. اتصل بالإنترنت مرة واحدة لتحميل المساجد.|No saved results for this location and radius. Connect once to download nearby mosques.|اس مقام اور دائرے کے لیے نتائج محفوظ نہیں۔ مساجد لوڈ کرنے کے لیے ایک بار انٹرنیٹ سے جڑیں۔
تعذّر الاتصال بخدمة المساجد. تحقق من الإنترنت وحاول مجددًا؛ لا يعني ذلك عدم وجود مساجد.|Unable to connect to the mosque service. Check your connection and try again; this does not mean there are no mosques.|مساجد کی خدمت سے رابطہ نہیں ہو سکا۔ انٹرنیٹ جانچیں اور دوبارہ کوشش کریں؛ اس کا مطلب مساجد کا نہ ہونا نہیں۔
مسجد (بيت من بيوت الله)|Mosque (a house of Allah)|مسجد (اللہ کا گھر)
بيت من بيوت الله|A house of Allah|اللہ کا گھر
محدد على الخريطة|Selected on the map|نقشے پر منتخب
تعذّر الاتصال بخدمة المساجد.|Unable to connect to the mosque service.|مساجد کی خدمت سے رابطہ نہیں ہو سکا۔
الموقع محدد على الخريطة|Location selected on the map|مقام نقشے پر منتخب ہے
البحث عن مدينة جديدة يحتاج الإنترنت. يمكنك عرض النتائج المحفوظة.|Searching for a new city needs internet. You can view saved results.|نیا شہر تلاش کرنے کے لیے انٹرنیٹ درکار ہے۔ محفوظ نتائج دیکھ سکتے ہیں۔
تعذّر البحث عن المدينة. تحقق من الإنترنت وحاول مجددًا.|Unable to search for the city. Check your connection and try again.|شہر تلاش نہیں ہو سکا۔ انٹرنیٹ جانچیں اور دوبارہ کوشش کریں۔
عرض الخريطة يحتاج الإنترنت. يمكنك استخدام قائمة المساجد المحفوظة.|The map needs internet. You can use the saved mosque list.|نقشے کے لیے انٹرنیٹ درکار ہے۔ محفوظ مساجد کی فہرست استعمال کر سکتے ہیں۔
جاري تحميل الخريطة…|Loading the map…|نقشہ لوڈ ہو رہا ہے…
تعذّر تحميل الخريطة. اضغط «الخريطة» للمحاولة مجددًا، أو استخدم قائمة المساجد.|Unable to load the map. Select “Map” to retry, or use the mosque list.|نقشہ لوڈ نہیں ہو سکا۔ دوبارہ کوشش کے لیے «نقشہ» منتخب کریں یا مساجد کی فہرست استعمال کریں۔
ملف النسخة الاحتياطية غير صالح.|Invalid backup file.|بیک اپ فائل درست نہیں۔
حجم النسخة أكبر من الحد المسموح.|The backup exceeds the size limit.|بیک اپ مقررہ حجم سے بڑا ہے۔
الملف يحتوي على بيانات غير مسموح بها.|The file contains unsupported data.|فائل میں غیر مجاز ڈیٹا موجود ہے۔
مستوى الصوت غير صالح.|Invalid volume level.|آواز کی سطح درست نہیں۔
لغة غير صالحة.|Invalid language.|زبان درست نہیں۔
إعداد صور الصلاة غير صالح.|Invalid prayer image setting.|نماز کی تصاویر کی ترتیب درست نہیں۔
علامة ورد يومي غير صالحة.|Invalid daily reading marker.|روزانہ تلاوت کا نشان درست نہیں۔
اسمح بالإشعارات من إعدادات الهاتف.|Allow notifications in phone settings.|فون کی ترتیبات سے اطلاعات کی اجازت دیں۔
تنبيه تجريبي|Test notification|آزمائشی اطلاع
تمت جدولة تجربة بعد ٥ ثوانٍ. تحقق من وصولها على الجهاز.|A test is scheduled in 5 seconds. Check that it arrives on your device.|5 سیکنڈ بعد آزمائشی اطلاع مقرر ہے۔ آلے پر اس کی وصولی جانچیں۔
الإشعارات غير مدعومة.|Notifications are not supported.|اطلاعات کی سہولت دستیاب نہیں۔
لم يتم منح إذن الإشعارات.|Notification permission was not granted.|اطلاعات کی اجازت نہیں دی گئی۔
أُرسل التنبيه التجريبي إلى المتصفح.|A test notification was sent to the browser.|براؤزر کو آزمائشی اطلاع بھیجی گئی۔
اختر سورة صحيحة.|Choose a valid surah.|درست سورۃ منتخب کریں۔
انتظر اكتمال التنزيل الحالي أو أوقفه.|Wait for the current download to finish or stop it.|موجودہ ڈاؤن لوڈ مکمل ہونے کا انتظار کریں یا اسے روکیں۔
التنزيل يحتاج إلى متصفح يدعم التخزين الآمن.|Downloading requires a browser that supports secure storage.|ڈاؤن لوڈ کے لیے محفوظ ذخیرے کی سہولت والا براؤزر درکار ہے۔
تعذّر تنزيل أحد الملفات. يمكنك المحاولة مجددًا لاستكمال الناقص.|A file could not be downloaded. Retry to complete the missing files.|ایک فائل ڈاؤن لوڈ نہیں ہو سکی۔ باقی فائلیں مکمل کرنے کے لیے دوبارہ کوشش کریں۔
لم تتوفر بيانات التفسير لهذه الصفحة.|Tafsir is not available for this page.|اس صفحے کی تفسیر دستیاب نہیں۔
ملف صفحة المصحف غير صالح.|Invalid Mushaf page file.|مصحف کے صفحے کی فائل درست نہیں۔
اكتمل التنزيل. الموارد محفوظة على هذا الجهاز.|Download complete. Resources are saved on this device.|ڈاؤن لوڈ مکمل۔ وسائل اس آلے پر محفوظ ہیں۔
توقف التنزيل؛ الملفات المكتملة محفوظة ويمكن استكماله.|Download stopped; completed files are saved and you can resume.|ڈاؤن لوڈ رک گیا؛ مکمل فائلیں محفوظ ہیں اور دوبارہ جاری کر سکتے ہیں۔
لا توجد تنزيلات محفوظة بعد. البث المباشر والخدمات السحابية تحتاج إلى الإنترنت.|No saved downloads yet. Live streams and cloud services need internet.|ابھی کوئی ڈاؤن لوڈ محفوظ نہیں۔ براہ راست نشریات اور کلاؤڈ خدمات کے لیے انٹرنیٹ درکار ہے۔
صفحات المصحف|Mushaf pages|مصحف کے صفحات
حذف التنزيل|Delete download|ڈاؤن لوڈ حذف کریں
أوقف التنزيل أولاً.|Stop the download first.|پہلے ڈاؤن لوڈ روکیں۔
تم حذف التنزيل.|Download deleted.|ڈاؤن لوڈ حذف کر دیا گیا۔
احتفظ باختصار واحد على الأقل.|Keep at least one shortcut.|کم از کم ایک شارٹ کٹ رکھیں۔
تم تحديث اختصاراتك.|Your shortcuts were updated.|آپ کے شارٹ کٹس تازہ ہو گئے۔
إظهار|Show|دکھائیں
تعذّر تجهيز القراءة بدون إنترنت؛ أعد المحاولة عند الاتصال.|Unable to prepare offline reading; retry when connected.|آف لائن مطالعہ تیار نہیں ہو سکا؛ رابطہ بحال ہونے پر دوبارہ کوشش کریں۔
الموقع الحالي (GPS)|Current location (GPS)|موجودہ مقام (GPS)
تم حفظ وتطبيق المدينة فوراً ✨|City saved and applied ✨|شہر محفوظ اور نافذ ہو گیا ✨
تم حفظ وتطبيق طريقة الحساب فوراً ✨|Calculation method saved and applied ✨|حساب کا طریقہ محفوظ اور نافذ ہو گیا ✨
تم حفظ وتطبيق المذهب فوراً ✨|Prayer school saved and applied ✨|فقہی مسلک محفوظ اور نافذ ہو گیا ✨
تم تطبيق حجم النصوص العامة فوراً ✨|Interface text size applied ✨|عام متن کا سائز نافذ ہو گیا ✨
تم ضبط وتطبيق تعديل التاريخ الهجري فوراً 🌙|Hijri date adjustment applied 🌙|ہجری تاریخ کی تبدیلی نافذ ہو گئی 🌙
حُفظت الإعدادات. افتح لوحة المواقيت لتحديث تنبيهات الهاتف.|Settings saved. Open prayer times to update phone alerts.|ترتیبات محفوظ ہو گئیں۔ فون کی اطلاعات تازہ کرنے کے لیے نماز کے اوقات کھولیں۔
تم حفظ اختياراتك وتطبيقها بنجاح ✨|Your choices were saved and applied ✨|آپ کے انتخاب محفوظ اور نافذ ہو گئے ✨
حدّث التطبيق لحفظ ملف النسخة على الهاتف.|Update the app to save the backup file on your phone.|فون پر بیک اپ محفوظ کرنے کے لیے ایپ تازہ کریں۔
اختر مكان حفظ ملف النسخة الاحتياطية.|Choose where to save the backup file.|بیک اپ فائل محفوظ کرنے کی جگہ منتخب کریں۔
تم إلغاء حفظ النسخة؛ بياناتك لم تتغير.|Backup saving cancelled; your data is unchanged.|بیک اپ محفوظ کرنا منسوخ؛ آپ کا ڈیٹا تبدیل نہیں ہوا۔
تم حفظ ملف النسخة الاحتياطية بنجاح ✨|Backup file saved successfully ✨|بیک اپ فائل کامیابی سے محفوظ ہو گئی ✨
لم يؤكد الهاتف حفظ الملف.|The phone did not confirm saving the file.|فون نے فائل محفوظ ہونے کی تصدیق نہیں کی۔
تم تجهيز النسخة الاحتياطية للتحميل بنجاح ✨|Your backup is ready to download ✨|آپ کا بیک اپ ڈاؤن لوڈ کے لیے تیار ہے ✨
الملف أكبر من ٥ م.ب.|The file is larger than 5 MB.|فائل 5 ایم بی سے بڑی ہے۔
اكتب تفاصيل الخطأ أو الملاحظة أولاً.|Enter the error or feedback details first.|پہلے غلطی یا رائے کی تفصیل درج کریں۔
جاري إرسال البلاغ إلى لوحة تحكم المسؤول...|Sending your report to the admin panel…|آپ کی شکایت انتظامی پینل کو بھیجی جا رہی ہے…
تعذّر الاتصال بخادم البلاغات.|Unable to connect to the reporting server.|شکایات کے سرور سے رابطہ نہیں ہو سکا۔
جزاك الله خيراً، تم إرسال البلاغ إلى لوحة تحكم الإدارة بنجاح وستتم مراجعته وتصويبه فوراً ✨|Thank you. Your report was sent successfully and will be reviewed for correction ✨|شکریہ۔ آپ کی شکایت کامیابی سے بھیج دی گئی ہے اور اصلاح کے لیے اس کا جائزہ لیا جائے گا ✨
بلاغ محتوى — زاد المسلم|Content report — Zad Al Muslim|مواد کی شکایت — زاد المسلم
تم تحويل البلاغ إلى تطبيق البريد الإلكتروني.|The report was passed to your email app.|شکایت آپ کی ای میل ایپ کو منتقل کر دی گئی۔
اجعل لقلبك نصيباً من كتاب الله خلال يومك؛ تلاوة صفحة من المصحف الشريف والصلاة على النبي ﷺ تنير دربك وتبارك وقتك.|Make time for the Quran today. Read a page and send blessings upon the Prophet ﷺ to brighten your day.|آج قرآن کے لیے وقت نکالیں۔ ایک صفحہ پڑھیں اور نبی ﷺ پر درود بھیجیں تاکہ دن میں نور اور برکت ہو۔
سيرة 🌹|Seerah 🌹|سیرت 🌹
الشيخ بدر المشاري|Sheikh Badr Al-Mishari|شیخ بدر المشاری
مواقف تبكيك من وفاء النبي ﷺ وحبه لأمته|Moving moments of the Prophet's ﷺ loyalty and love for his ummah|نبی ﷺ کی وفا اور امت سے محبت کے رقت انگیز واقعات
مشاهد مؤثرة تسكب العبرات من رحمة وسيرة الحبيب المصطفى ﷺ مع أصحابه وأمته.|Moving accounts of the Prophet's ﷺ mercy toward his companions and ummah.|صحابہ اور امت کے ساتھ نبی ﷺ کی رحمت کے رقت انگیز واقعات۔
عمّ|Amma|عمّ
تبارك|Tabarak|تبارک
شوّال|Shawwal|شوال
شروط صحة الصلاة (9 شروط تسبق الصلاة)|Conditions for valid prayer (9 prerequisites)|نماز کی صحت کی شرائط (نماز سے پہلے 9 شرائط)
أركان الصلاة الـ 14 (لا تسقط عمداً ولا سهواً)|The 14 pillars of prayer (required even if forgotten)|نماز کے 14 ارکان (جان بوجھ کر یا بھول سے ساقط نہیں ہوتے)
واجبات الصلاة الـ 8 (تُجبر بسجود السهو)|The 8 obligations of prayer (omissions remedied by sujud al-sahw)|نماز کے 8 واجبات (بھول کی تلافی سجدہ سہو سے ہوتی ہے)
🕌 صلاة الفجر (الصبح)|🕌 Fajr prayer|🕌 فجر کی نماز
🕌 صلاة الظهر|🕌 Dhuhr prayer|🕌 ظہر کی نماز
🕌 صلاة العصر|🕌 Asr prayer|🕌 عصر کی نماز
🕌 صلاة المغرب|🕌 Maghrib prayer|🕌 مغرب کی نماز
🕌 صلاة العشاء|🕌 Isha prayer|🕌 عشاء کی نماز
🕌 صلاة الضحى (صلاة الأوابين)|🕌 Duha prayer|🕌 چاشت کی نماز
🕌 قيام الليل والتهجد|🕌 Night prayer and Tahajjud|🕌 قیام اللیل اور تہجد
🕌 صلاة الوتر|🕌 Witr prayer|🕌 وتر کی نماز
🕌 صلاة الاستخارة|🕌 Istikharah prayer|🕌 استخارہ کی نماز
🕌 صلاة الجنازة|🕌 Funeral prayer|🕌 نماز جنازہ
🕌 صلاة الجمعة|🕌 Friday prayer|🕌 جمعہ کی نماز
🕌 صلاة التوبة|🕌 Prayer of repentance|🕌 توبہ کی نماز
🕌 صلاة الكسوف والخسوف|🕌 Eclipse prayer|🕌 سورج اور چاند گرہن کی نماز
🕌 صلاة العيدين (الفطر والأضحى)|🕌 Eid al-Fitr and Eid al-Adha prayers|🕌 عید الفطر اور عید الاضحیٰ کی نمازیں
دعاء الاستفتاح (بعد تكبيرة الإحرام)|Opening supplication (after the opening takbir)|دعائے استفتاح (تکبیر تحریمہ کے بعد)
ما يقال عند الركوع|What to say when bowing|رکوع میں کیا پڑھیں
ما يقال عند الرفع من الركوع والاعتدال|What to say when rising from bowing|رکوع سے اٹھتے وقت کیا پڑھیں
ما يقال في السجود (موطن إجابة الدعاء)|What to say in prostration (a time for answered dua)|سجدے میں کیا پڑھیں (دعا کی قبولیت کا مقام)
ما يقال بين السجدتين|What to say between prostrations|دو سجدوں کے درمیان کیا پڑھیں
التشهد والصلاة الإبراهيمية|Tashahhud and Salat Ibrahimiyyah|تشہد اور درود ابراہیمی
الاستعاذة من الأربع قبل السلام|Seeking refuge from four things before salam|سلام سے پہلے چار چیزوں سے پناہ مانگنا
دعاء صلاة الاستخارة كاملاً|Complete Istikharah supplication|استخارہ کی مکمل دعا
هيئات وحركات حذر منها رسول الله ﷺ|Postures and movements the Prophet ﷺ warned against|وہ حرکات جن سے رسول اللہ ﷺ نے منع فرمایا
مبطلات الصلاة المتفق عليها|Agreed-upon invalidators of prayer|نماز توڑنے والے متفقہ امور
الصلاة على النبي|Salawat upon the Prophet|نبی ﷺ پر درود
الحوقلة|Hawqala|حوقلہ
التوحيد|Tawhid|توحید
الباقيات الصالحات|Enduring good deeds|باقیات صالحات
شهر رجب المبارك 🌙|The month of Rajab 🌙|ماہ رجب 🌙
ليلة الإسراء والمعراج 🌌|Al-Isra and al-Miraj 🌌|شب اسراء و معراج 🌌
ليلة النصف من شعبان 🌟|The middle night of Sha'ban 🌟|شعبان کی پندرہویں رات 🌟
شهر رمضان المبارك 🌙|The blessed month of Ramadan 🌙|مبارک ماہ رمضان 🌙
ليلة القدر والعشر الأواخر ✨|Laylat al-Qadr and the last ten nights ✨|شب قدر اور آخری عشرہ ✨
عيد الفطر المبارك 🎈|Eid al-Fitr 🎈|عید الفطر مبارک 🎈
صيام الست من شوّال 🌸|Fasting six days of Shawwal 🌸|شوال کے چھ روزے 🌸
عشر ذي الحجة المباركة 🕋|The first ten days of Dhu al-Hijjah 🕋|ذوالحجہ کے پہلے دس دن 🕋
وقفة عرفات المباركة 🤲|The day of Arafah 🤲|یوم عرفہ 🤲
عيد الأضحى المبارك 🐑|Eid al-Adha 🐑|عید الاضحیٰ مبارک 🐑
رأس السنة الهجرية الجديدة 📅|Islamic New Year 📅|نیا ہجری سال 📅
يوم عاشوراء وتاسوعاء 🌊|Ashura and Tasu'a 🌊|عاشورہ اور تاسوعا 🌊
المولد النبوي الشريف 🌺|The Prophet's birth 🌺|میلاد النبی ﷺ 🌺
دعاء ذي النون في بطن الحوت (كشف كل كرب)|Dua of Yunus in the whale (relief from distress)|مچھلی کے پیٹ میں یونس علیہ السلام کی دعا (غم سے نجات)
دعاء الكرب العظيم النبوي|Prophetic dua for severe distress|شدید پریشانی کی مسنون دعا
دعاء قضاء الدَّين والاستعاذة من الهم والحزن|Dua for repaying debt and seeking refuge from worry and grief|قرض کی ادائیگی اور غم سے پناہ کی دعا
دعاء سداد الديون ولو كانت كجبل أُحد|Dua for repaying debts, even as large as Mount Uhud|احد پہاڑ جیسے قرض کی ادائیگی کی دعا
ما هي الأعمال التي ينعقد الإجماع على وصول ثوابها للميت؟|Which deeds are agreed to benefit the deceased?|کن اعمال کا ثواب میت کو پہنچنے پر اتفاق ہے؟
ما هي أفضل صور الصدقة الجارية للميت وأعظمها أجراً؟|What are the best forms of ongoing charity for the deceased?|میت کے لیے صدقہ جاریہ کی بہترین صورتیں کیا ہیں؟
كيفية وأحكام أداء الحج والعمرة عن المتوفى|Performing Hajj and Umrah for the deceased|مرحوم کی طرف سے حج و عمرہ کا طریقہ اور احکام
آداب وسنن زيارة القبور والأدعية المأثورة فيها|Etiquette, Sunnah and duas for visiting graves|قبروں کی زیارت کے آداب، سنتیں اور دعائیں
أولوية سداد الديون والوصية قبل توزيع الميراث|Debts and bequests before inheritance distribution|وراثت تقسیم کرنے سے پہلے قرض اور وصیت کی ادائیگی
تنبيهات مهمة: ما يجب تجنبه في الجنائز والتعزية|Important notes: what to avoid at funerals and condolences|اہم ہدایات: جنازے اور تعزیت میں کن باتوں سے بچیں
ما هي السورة التي تسمى 'عروس القرآن'؟|Which surah is called the 'Bride of the Quran'?|کس سورۃ کو 'عروس القرآن' کہا جاتا ہے؟
ما هي السورة التي تعدل ثلث القرآن في الفضل والأجر؟|Which surah is equal to a third of the Quran in reward?|کون سی سورۃ اجر میں ایک تہائی قرآن کے برابر ہے؟
ما هي السورة التي تنجي صاحبها وتشفع له في القبر؟|Which surah protects its reciter and intercedes for them in the grave?|کون سی سورۃ پڑھنے والے کی قبر میں حفاظت اور شفاعت کرتی ہے؟
ما هي أطول آية في كتاب الله الكريم؟|What is the longest ayah in the Quran?|قرآن کریم کی سب سے طویل آیت کون سی ہے؟
ما هي السورة التي لا تبدأ بالبسملة؟|Which surah does not begin with the basmalah?|کون سی سورۃ بسم اللہ سے شروع نہیں ہوتی؟
من هي أول من أسلمت وآمنت برسول الله ﷺ من النساء والرجال جميعاً؟|Who was the first person to believe in the Prophet ﷺ?|سب سے پہلے رسول اللہ ﷺ پر ایمان لانے والی شخصیت کون تھی؟
في أي عام هجري كانت غزوة بدر الكبرى والفتح المبين؟|In which Hijri year did the Battle of Badr take place?|غزوہ بدر کس ہجری سال میں ہوا؟
من هو الصحابي الجليل الذي رافق النبي ﷺ في رحلة الهجرة إلى المدينة المنورة؟|Which companion accompanied the Prophet ﷺ during the migration to Madinah?|مدینہ ہجرت کے سفر میں کون سے صحابی نبی ﷺ کے ساتھ تھے؟
كم سنة استمرت الدعوة الإسلامية في مكة المكرمة قبل الهجرة؟|How many years did the call to Islam continue in Makkah before the Hijrah?|ہجرت سے پہلے مکہ میں دعوت اسلام کتنے سال جاری رہی؟
من هو الصحابي الذي تستحي منه ملائكة الرحمن؟|Which companion did the angels feel shy before?|فرشتے کس صحابی سے حیا کرتے تھے؟
من لُقب بـ 'سيف الله المسلول'؟|Who was called the 'Drawn Sword of Allah'?|کسے 'اللہ کی کھینچی ہوئی تلوار' کہا گیا؟
من هو الصحابي الذي أشار على النبي ﷺ بحفر الخندق في غزوة الأحزاب؟|Which companion suggested digging the trench in the Battle of the Confederates?|غزوہ احزاب میں خندق کھودنے کا مشورہ کس صحابی نے دیا؟
من هو النبي الذي سخر الله له الريح والجن والحديث مع الطير؟|For which prophet did Allah subject the wind and jinn, and grant understanding of birds?|اللہ نے کس نبی کے لیے ہوا اور جنات مسخر کیے اور پرندوں کی زبان سکھائی؟
من هو كليم الله من الأنبياء والرسل؟|Which prophet spoke directly with Allah?|کس نبی کو کلیم اللہ کہا جاتا ہے؟
من هو النبي الملقب بـ 'خليل الرحمن' وأبو الأنبياء؟|Which prophet is called Khalil al-Rahman and the father of the prophets?|کون سے نبی خلیل الرحمن اور ابو الانبیاء کہلاتے ہیں؟
ما هي الصلاة التي ليس فيها ركوع ولا سجود؟|Which prayer has no bowing or prostration?|کس نماز میں رکوع اور سجدہ نہیں ہوتا؟
ما هي أفضل الشهور للصيام بعد شهر رمضان المبارك؟|Which month is best for fasting after Ramadan?|رمضان کے بعد روزوں کے لیے افضل مہینہ کون سا ہے؟
كم عدد ركعات صلاة التراويح والوتر التي كان النبي ﷺ يواظب عليها غالباً؟|How many rakahs of night prayer and Witr did the Prophet ﷺ usually pray?|نبی ﷺ عموماً تراویح اور وتر کی کتنی رکعتیں پڑھتے تھے؟
ما هي السورة التي ذكرت فيها البسملة مرتين؟|Which surah contains the basmalah twice?|کس سورۃ میں بسم اللہ دو مرتبہ آئی ہے؟
من هو أمين هذه الأمة من الصحابة الكرام؟|Which companion was called the trustee of this ummah?|کس صحابی کو اس امت کا امین کہا گیا؟
آدم|Adam|آدم
نوح|Nuh|نوح
إبراهيم|Ibrahim|ابراہیم
يوسف|Yusuf|یوسف
موسى|Musa|موسیٰ
عيسى|Isa|عیسیٰ
إسماعيل|Ismail|اسماعیل
يعقوب|Yaqub|یعقوب
داود|Dawud|داؤد
سليمان|Sulayman|سلیمان
إدريس|Idris|ادریس
أبو بكر الصديق|Abu Bakr al-Siddiq|ابو بکر صدیق
عمر بن الخطاب|Umar ibn al-Khattab|عمر بن خطاب
عثمان بن عفان|Uthman ibn Affan|عثمان بن عفان
علي بن أبي طالب|Ali ibn Abi Talib|علی بن ابی طالب
طلحة بن عبيد الله|Talhah ibn Ubaydullah|طلحہ بن عبید اللہ
الزبير بن العوام|Al-Zubayr ibn al-Awwam|زبیر بن عوام
عبد الرحمن بن عوف|Abd al-Rahman ibn Awf|عبد الرحمن بن عوف
سعد بن أبي وقاص|Sad ibn Abi Waqqas|سعد بن ابی وقاص
سعيد بن زيد|Said ibn Zayd|سعید بن زید
أبو عبيدة بن الجراح|Abu Ubaydah ibn al-Jarrah|ابو عبیدہ بن جراح
أبو عبيدة عامر بن الجراح|Abu Ubaydah Amir ibn al-Jarrah|ابو عبیدہ عامر بن جراح
خالد بن الوليد|Khalid ibn al-Walid|خالد بن ولید
حمزة بن عبد المطلب|Hamzah ibn Abd al-Muttalib|حمزہ بن عبد المطلب
سلمان الفارسي|Salman al-Farisi|سلمان فارسی
أبو ذر الغفاري|Abu Dharr al-Ghifari|ابو ذر غفاری
عمار بن ياسر|Ammar ibn Yasir|عمار بن یاسر
حذيفة بن اليمان|Hudhayfah ibn al-Yaman|حذیفہ بن یمان
معاذ بن جبل|Muadh ibn Jabal|معاذ بن جبل
عبد الله بن مسعود|Abdullah ibn Masud|عبد اللہ بن مسعود
أبي بن كعب|Ubayy ibn Kab|ابی بن کعب
عائشة بنت أبي بكر|Aishah bint Abi Bakr|عائشہ بنت ابی بکر
خديجة بنت خويلد|Khadijah bint Khuwaylid|خدیجہ بنت خویلد
فاطمة الزهراء|Fatimah al-Zahra|فاطمہ زہراء
أم سلمة|Umm Salamah|ام سلمہ
آية الكرسي|Ayat al-Kursi|آیت الکرسی
آية الدين (البقرة 282)|The debt verse (Al-Baqarah 282)|قرض کی آیت (البقرہ 282)
آية الوضوء|The wudu verse|وضو کی آیت
آية المداينة في سورة النساء|The debt verse in An-Nisa|سورۃ النساء میں قرض کی آیت
سورة التوبة (براءة)|Surah At-Tawbah (Bara'ah)|سورۃ التوبہ (براءت)
سورة الملك (تبارك)|Surah Al-Mulk (Tabarak)|سورۃ الملک (تبارک)
صلاة الكسوف|Eclipse prayer|گرہن کی نماز
صلاة الجنازة|Funeral prayer|نماز جنازہ
صلاة الاستسقاء|Prayer for rain|نماز استسقاء
صلاة العيدين|Eid prayer|عیدین کی نماز
شهر شوال|Shawwal|شوال
شهر رجب|Rajab|رجب
شهر الله المحرم|Muharram|محرم
شهر شعبان|Sha'ban|شعبان
السنة الأولى هـ|1 AH|1 ہجری
السنة الثانية هـ|2 AH|2 ہجری
السنة الثالثة هـ|3 AH|3 ہجری
السنة الخامسة هـ|5 AH|5 ہجری
يمكنك اختيار المدينة يدويًا أو السماح بقراءة موقعك التقريبي أو الدقيق بحسب إذن الهاتف. يستخدم التطبيق الإحداثيات لتحديد اتجاه القبلة، ويحفظ موقع الصلاة على جهازك ويرسل الإحداثيات إلى AlAdhan لجلب المواقيت.|Choose a city manually or grant access to your approximate or precise location. The app uses coordinates for Qibla direction, saves the prayer location on your device and sends coordinates to AlAdhan for prayer times.|شہر خود منتخب کریں یا اپنا تخمینی یا درست مقام استعمال کرنے کی اجازت دیں۔ ایپ نقاط سے قبلے کی سمت نکالتی ہے، نماز کا مقام آلے پر محفوظ کرتی ہے اور اوقات کے لیے نقاط AlAdhan کو بھیجتی ہے۔
إذا لم تتوفر إجابة محلية، يُرسل نص السؤال الحالي عبر خادم التطبيق إلى Google Gemini لإنتاج إجابة. لا نرسل سجل المحادثة أو الإحداثيات أو إعدادات جهازك ضمن هذا الطلب. تُحفظ المحادثة محليًا ويمكن مسحها من المساعد. تستقبل Google نص السؤال وفق سياساتها وإعدادات حساب الخدمة. نحتفظ مؤقتًا بإجابات قائمة محددة من الأسئلة العامة لمدة تصل إلى 24 ساعة لتقليل الطلبات؛ لا تُضاف الأسئلة الشخصية أو سجل المحادثة إلى هذا الحفظ المشترك.|If no local answer is available, the current question is sent through the app server to Google Gemini to generate an answer. We do not include your conversation history, coordinates or device settings in this request. Conversations are saved locally and can be cleared from the assistant. Google receives the question under its policies and the service account settings. Answers to a fixed list of general questions may be cached for up to 24 hours to reduce requests; personal questions and conversation history are not added to this shared cache.|اگر مقامی جواب دستیاب نہ ہو تو موجودہ سوال ایپ کے سرور کے ذریعے Google Gemini کو جواب تیار کرنے کے لیے بھیجا جاتا ہے۔ اس درخواست میں گفتگو کی تاریخ، نقاط یا آلے کی ترتیبات نہیں بھیجی جاتیں۔ گفتگو مقامی طور پر محفوظ ہوتی ہے اور معاون سے مٹائی جا سکتی ہے۔ Google سوال کا متن اپنی پالیسیوں اور سروس اکاؤنٹ کی ترتیبات کے مطابق وصول کرتا ہے۔ درخواستیں کم کرنے کے لیے عمومی سوالات کی ایک مقررہ فہرست کے جوابات زیادہ سے زیادہ 24 گھنٹے عارضی طور پر محفوظ رکھے جا سکتے ہیں؛ ذاتی سوالات اور گفتگو کی تاریخ اس مشترکہ ذخیرے میں شامل نہیں ہوتے۔
أضف، عدّل، واحذف المقاطع والبودكاست والمواعظ الخاشعة المعروضة لجميع زوار ومستخدمي زاد المسلم. يمكنك وضع رابط يوتيوب وسيتولى النظام استخراج الصورة والمعلومات تلقائياً، مع إمكانية إرسال إشعار فوري لأي مقطع بضغطة زر واحدة.|Add, edit and delete clips, podcasts and reminders shown to all app users. Enter a YouTube link to retrieve its thumbnail and information automatically. You can also send a notification for a clip.|تمام صارفین کو دکھائے جانے والے کلپس، پوڈکاسٹ اور نصیحتیں شامل، تبدیل یا حذف کریں۔ یوٹیوب کا لنک درج کرنے سے تصویر اور معلومات خود حاصل ہو جائیں گی۔ آپ کسی کلپ کی اطلاع بھی بھیج سکتے ہیں۔
يدعم جميع الروابط: يوتيوب عادي، روابط مختصرة youtu.be، يوتيوب شورتس Shorts، أو المعرّف المباشر (11 حرفاً).|Supports YouTube links, youtu.be links, Shorts and 11-character video IDs.|یوٹیوب لنکس، youtu.be لنکس، Shorts اور 11 حروف کی ویڈیو شناخت کی سہولت موجود ہے۔
تصلك هنا فوراً جميع الملاحظات والتصويبات المرسلة من المستخدمين حول نصوص الأذكار، المصحف، ومواقيت الصلاة، مع إمكانية تمييز ما تم فحصه وتصويبه.|User reports about adhkar, the Mushaf and prayer times appear here. Mark reports as reviewed and corrected after checking them.|اذکار، مصحف اور نماز کے اوقات سے متعلق صارفین کی شکایات یہاں ظاہر ہوتی ہیں۔ جانچ کے بعد انہیں جائزہ شدہ اور درست شدہ نشان زد کریں۔
الإذن:|Permission:|اجازت:
إذن الهاتف:|Phone permission:|فون کی اجازت:
مرفوض؛ غيّره من إعدادات المتصفح|Denied; change it in browser settings|اجازت نہیں؛ براؤزر کی ترتیبات سے تبدیل کریں
لم يُطلب بعد|Not requested yet|ابھی درخواست نہیں کی گئی
غير مدعوم في هذا المتصفح|Not supported in this browser|اس براؤزر میں دستیاب نہیں
التذكير المحلي القادم:|Next local reminder:|اگلی مقامی یاد دہانی:
لا توجد تذكيرات محلية مجدولة|No local reminders scheduled|کوئی مقامی یاد دہانی مقرر نہیں
أذان Android يُدار أيضًا بواسطة منبّه الصلاة الأصلي.|Android adhan is also managed by the native prayer alarm.|اینڈرائیڈ پر اذان کا انتظام اصل نماز الارم بھی کرتا ہے۔
إذن الموعد الدقيق:|Exact alarm permission:|عین وقت کے الارم کی اجازت:
تعذّر قراءة حالة تنبيهات الهاتف.|Unable to read phone notification status.|فون کی اطلاعات کی حالت معلوم نہیں ہو سکی۔
تنبيهات الصلاة في الويب لا تُضمن عند إغلاق المتصفح.|Web prayer notifications are not guaranteed when the browser is closed.|براؤزر بند ہونے پر ویب کی نماز کی اطلاعات کی ضمانت نہیں ہے۔
مواقيت اليوم محدّثة.|Today's prayer times are up to date.|آج کے نماز کے اوقات تازہ ہیں۔
مواقيت اليوم لم تُؤكد بعد؛ اتصل بالإنترنت وحدّث المدينة.|Today's prayer times are not confirmed yet; connect to the internet and update the city.|آج کے نماز کے اوقات کی تصدیق نہیں ہوئی؛ انٹرنیٹ سے جڑیں اور شہر تازہ کریں۔
يناير|January|جنوری
فبراير|February|فروری
مارس|March|مارچ
أبريل|April|اپریل
مايو|May|مئی
يونيو|June|جون
يوليو|July|جولائی
أغسطس|August|اگست
سبتمبر|September|ستمبر
أكتوبر|October|اکتوبر
نوفمبر|November|نومبر
ديسمبر|December|دسمبر
محرم|Muharram|محرم
محرّم|Muharram|محرم
صفر|Safar|صفر
ربيع الأول|Rabi al-Awwal|ربیع الاول
ربيع الآخر|Rabi al-Thani|ربیع الثانی
جمادى الأولى|Jumada al-Ula|جمادی الاولیٰ
جمادى الآخرة|Jumada al-Akhirah|جمادی الآخرۃ
رجب|Rajab|رجب
شعبان|Sha'ban|شعبان
رمضان|Ramadan|رمضان
شوال|Shawwal|شوال
ذو القعدة|Dhu al-Qadah|ذوالقعدہ
ذو الحجة|Dhu al-Hijjah|ذوالحجہ
لوحة إدارة زاد المسلم|Zad Al Muslim admin panel|زاد المسلم انتظامی پینل
أدخل رمز المرور السري للدخول إلى لوحة التحكم وإرسال الإشعارات والإحصائيات|Enter your passcode to manage notifications and statistics|اطلاعات اور اعداد و شمار کے انتظام کے لیے اپنا پاس کوڈ درج کریں
تسجيل الدخول|Sign in|سائن ان
كلمة المرور غير صحيح، حاول ثانية.|Incorrect password. Try again.|پاس ورڈ درست نہیں۔ دوبارہ کوشش کریں۔
تجربة على جهاز|Test on a device|آلے پر آزمائش
الموقع|Website|ویب سائٹ
بث الإشعارات|Send notifications|اطلاعات بھیجیں
بلاغات وتصويبات المحتوى|Content reports and corrections|مواد کی شکایات اور اصلاحات
المشاهدات والإحصائيات|Views and statistics|ملاحظات اور اعداد و شمار
سجل الإرسال|Delivery history|ارسال کی تاریخ
تغيير كلمة المرور والإعدادات|Password and settings|پاس ورڈ اور ترتیبات
المشتركون في الإشعارات|Notification subscribers|اطلاعات کے صارفین
التنبيهات المرسلة|Notifications sent|بھیجی گئی اطلاعات
متصل 🟢|Connected 🟢|منسلک 🟢
حالة البث السحابي|Cloud delivery status|کلاؤڈ ارسال کی حالت
إنشاء وإرسال إشعار فوري لجميع المستخدمين|Create and send a notification to all users|تمام صارفین کے لیے اطلاع بنائیں اور بھیجیں
قوالب جاهزة سريعة بضغطة زر:|Quick notification templates:|اطلاعات کے فوری سانچے:
🕌 سورة الكهف والجمعة|🕌 Al-Kahf and Friday|🕌 سورۃ الکہف اور جمعہ
🌙 تذكير صيام غداً|🌙 Fasting reminder for tomorrow|🌙 کل کے روزے کی یاد دہانی
🌆 أذكار المساء|🌆 Evening adhkar|🌆 شام کے اذکار
🤲 دعاء للموتى|🤲 Dua for the deceased|🤲 مرحومین کے لیے دعا
📖 ورد القرآن اليومي|📖 Daily Quran reading|📖 روزانہ تلاوت
🌌 قيام الليل والوتر|🌌 Night prayer and Witr|🌌 قیام اللیل اور وتر
✨ ختمة القرآن الجماعية|✨ Group Quran completion|✨ اجتماعی ختم قرآن
🕌 أذان العصر|🕌 Asr adhan|🕌 عصر کی اذان
🕌 أذان المغرب|🕌 Maghrib adhan|🕌 مغرب کی اذان
🕌 أذان العشاء|🕌 Isha adhan|🕌 عشاء کی اذان
🕌 أذان الفجر|🕌 Fajr adhan|🕌 فجر کی اذان
عنوان الإشعار:|Notification title:|اطلاع کا عنوان:
نص التذكير والدعاء:|Reminder and dua text:|یاد دہانی اور دعا کا متن:
قناة الإرسال:|Delivery channel:|ارسال کا ذریعہ:
🌐 الكل (متصفحات الويب + تطبيقات الموبايل OneSignal)|🌐 All (web browsers + OneSignal mobile apps)|🌐 سب (ویب براؤزر + OneSignal موبائل ایپس)
📱 تطبيقات الموبايل فقط (OneSignal)|📱 Mobile apps only (OneSignal)|📱 صرف موبائل ایپس (OneSignal)
💻 متصفحات الويب فقط (Web Push)|💻 Web browsers only (Web Push)|💻 صرف ویب براؤزر (Web Push)
الصفحة أو القسم المستهدف عند النقر:|Destination page or section:|کلک کرنے پر منزل کا صفحہ یا حصہ:
📖 المصحف الشريف وقراءة السور|📖 Mushaf and surah reading|📖 مصحف اور سورتوں کی تلاوت
🕌 مواقيت الصلاة والقبلة|🕌 Prayer times and Qibla|🕌 نماز کے اوقات اور قبلہ
📿 قسم الأذكار وحصن المسلم|📿 Adhkar and Hisn al-Muslim|📿 اذکار اور حصن المسلم
🌿 بوصلة القلوب والسكينة|🌿 Guidance and peace of heart|🌿 دلوں کی رہنمائی اور سکون
📍 أقرب المساجد إليك|📍 Nearby mosques|📍 قریبی مساجد
🪙 حاسبة الزكاة الذكية|🪙 Zakat calculator|🪙 زکوٰۃ کیلکولیٹر
🤲 حائط الدعاء بظهر الغيب|🤲 Dua wall|🤲 دعاؤں کی دیوار
📿 السبحة الإلكترونية التفاعلية|📿 Interactive tasbeeh counter|📿 تفاعلی تسبیح کاؤنٹر
🏠 الصفحة الرئيسية للتطبيق|🏠 App home page|🏠 ایپ کا مرکزی صفحہ
جهاز التجربة — معرّف الاشتراك في OneSignal:|Test device — OneSignal subscription ID:|آزمائشی آلہ — OneSignal سبسکرپشن شناخت:
انسخ معرّف اشتراك هاتفك من قائمة الاشتراكات في OneSignal. هذه التجربة تُرسل لجهاز واحد فقط.|Copy your phone's subscription ID from OneSignal. This test is sent to one device only.|OneSignal کی فہرست سے اپنے فون کی سبسکرپشن شناخت کاپی کریں۔ یہ آزمائش صرف ایک آلے کو بھیجی جاتی ہے۔
إرسال تجربة لهذا الجهاز|Send a test to this device|اس آلے کو آزمائشی اطلاع بھیجیں
فحص جاهزية إرسال الموبايل|Check mobile delivery readiness|موبائل ارسال کی تیاری جانچیں
إرسال الإشعار لجميع المشتركين الآن 🚀|Send to all subscribers now 🚀|ابھی تمام صارفین کو اطلاع بھیجیں 🚀
معاينة حية على شاشة الهاتف|Live phone preview|فون کا براہ راست پیش نظارہ
زاد المسلم • الآن|Zad Al Muslim • Now|زاد المسلم • ابھی
الآن|Now|ابھی
يصل هذا الإشعار كنظام إشعار رسمي منبثق بصوت التنبيه وبانر تفاعلي.|This appears as a system notification with a sound and interactive banner.|یہ آواز اور تفاعلی بینر کے ساتھ سسٹم اطلاع کے طور پر ظاہر ہوتی ہے۔
إحصائيات المشاهدات والزيارات والتفاعل المباشر|Views, visits and engagement statistics|ملاحظات، دوروں اور تعامل کے اعداد و شمار
تحديث الإحصائيات|Refresh statistics|اعداد و شمار تازہ کریں
إجمالي المشاهدات والزيارات|Total views and visits|کل ملاحظات اور دورے
الزوار الفريدون (Unique)|Unique visitors|منفرد زائرین
أجهزة ومستخدمين مختلفين|Distinct devices and users|مختلف آلات اور صارفین
مرات التثبيت والتنزيل (PWA)|PWA installations|PWA تنصیبات
تمت إضافته للشاشة الرئيسية|Added to the home screen|ہوم اسکرین پر شامل کیا گیا
عداد التسبيح والذكر الجماعي|Shared tasbeeh and dhikr counter|اجتماعی تسبیح اور ذکر کا کاؤنٹر
تسبيحة مسجلة في التطبيق|Tasbeeh recorded in the app|ایپ میں درج تسبیح
توزيع الأجهزة وأنظمة التشغيل للمستخدمين:|User devices and operating systems:|صارفین کے آلات اور آپریٹنگ سسٹم:
الهواتف الذكية (Mobile)|Mobile phones|موبائل فون
الحواسيب المكتبية والمحمولة (Desktop)|Desktop and laptop computers|ڈیسک ٹاپ اور لیپ ٹاپ کمپیوٹر
الأجهزة اللوحية (Tablets)|Tablets|ٹیبلٹس
سجل الإشعارات والتنبيهات السابقة|Notification history|سابقہ اطلاعات کی تاریخ
تحديث السجل|Refresh history|تاریخ تازہ کریں
الوقت والتاريخ|Date and time|تاریخ اور وقت
عنوان الإشعار|Notification title|اطلاع کا عنوان
نص التنبيه|Notification text|اطلاع کا متن
الرابط المستهدف|Destination link|منزل کا لنک
الحالة|Status|حالت
إجراءات|Actions|اقدامات
جاري تحميل سجل الإشعارات...|Loading notification history…|اطلاعات کی تاریخ لوڈ ہو رہی ہے…
تغيير كلمة المرور للوحة الإدارة (Admin PIN)|Change admin password (PIN)|انتظامی پاس ورڈ (PIN) تبدیل کریں
كلمة المرور الحالي:|Current password:|موجودہ پاس ورڈ:
كلمة المرور الجديد:|New password:|نیا پاس ورڈ:
تأكيد كلمة المرور الجديد:|Confirm new password:|نئے پاس ورڈ کی تصدیق:
حفظ كلمة المرور الجديد|Save new password|نیا پاس ورڈ محفوظ کریں
معلومات النظام والجاهزية|System information and readiness|سسٹم کی معلومات اور تیاری
الإصدار:|Version:|ورژن:
زاد المسلم v3.6|Zad Al Muslim v3.6|زاد المسلم v3.6
قاعدة البيانات السحابية:|Cloud database:|کلاؤڈ ڈیٹابیس:
متصلة بنجاح 🟢|Connected successfully 🟢|کامیابی سے منسلک 🟢
مشغل إشعارات الخدمة (ServiceWorker):|Service worker notifications:|سروس ورکر کی اطلاعات:
مفعّل وجاهز 🚀|Enabled and ready 🚀|فعال اور تیار 🚀
إدارة مكتبة المقتطفات|Manage the media library|میڈیا لائبریری کا انتظام
إضافة مقطع جديد|Add a new clip|نیا کلپ شامل کریں
إجمالي المقاطع والبودكاست|Total clips and podcasts|کل کلپس اور پوڈکاسٹ
حلقات البودكاست|Podcast episodes|پوڈکاسٹ کی اقساط
تأملات وتدبر قرآني|Quran reflections|قرآنی غور و فکر
مواعظ ورقائق وقصص|Reminders and stories|نصیحتیں اور قصے
إضافة مقطع أو بودكاست جديد|Add a clip or podcast|نیا کلپ یا پوڈکاسٹ شامل کریں
وضع الإضافة|Add mode|شامل کرنے کا طریقہ
رابط المقطع على يوتيوب أو المعرّف (YouTube URL / ID)|YouTube URL or video ID|یوٹیوب لنک یا ویڈیو شناخت
عنوان المقطع أو حلقة البودكاست|Clip or podcast title|کلپ یا پوڈکاسٹ کا عنوان
اسم الشيخ / المتحدث / القناة|Sheikh / speaker / channel name|شیخ / مقرر / چینل کا نام
التصنيف والقسم|Category and section|زمرہ اور حصہ
🎙️ بودكاست إسلامي|🎙️ Islamic podcast|🎙️ اسلامی پوڈکاسٹ
📖 تأملات وتدبر قرآني|📖 Quran reflections|📖 قرآنی غور و فکر
💖 موعظة وترقيق قلوب|💖 Heartfelt reminder|💖 دل نرم کرنے والی نصیحت
📜 سيرة نبوية وقصص|📜 Seerah and stories|📜 سیرت نبوی اور قصے
⚡ خاطرة إيمانية قصيرة (Shorts)|⚡ Short faith reminder (Shorts)|⚡ مختصر ایمانی نصیحت (Shorts)
المدة الزمنية (ساعة:دقيقة:ثانية)|Duration (hour:minute:second)|مدت (گھنٹہ:منٹ:سیکنڈ)
شارة تمييز أو عدد المشاهدات|Badge or view count|امتیازی نشان یا ملاحظات کی تعداد
نبذة عن المقطع والمحاور التي يتناولها|Clip summary and topics|کلپ کا خلاصہ اور موضوعات
معاينة الصورة المصغرة|Thumbnail preview|تھمب نیل کا پیش نظارہ
الصورة المصغرة ستظهر هنا تلقائياً بمجرد إدخال الرابط ⚡|The thumbnail will appear after you enter a link ⚡|لنک درج کرنے کے بعد تھمب نیل یہاں ظاہر ہوگا ⚡
تجربة التشغيل|Test playback|چلا کر آزمائیں
إلغاء التعديل|Cancel editing|ترمیم منسوخ کریں
تفريغ الحقول|Clear fields|خانے خالی کریں
حفظ ونشر المقطع في زاد المسلم|Save and publish the clip|کلپ محفوظ اور شائع کریں
قائمة المقاطع الحالية في المكتبة|Current library clips|لائبریری کے موجودہ کلپس
المعروض:|Showing:|دکھائے گئے:
من إجمالي|of total|کل میں سے
قرآن وتدبر|Quran and reflections|قرآن اور غور و فکر
مواعظ|Reminders|نصیحتیں
خواطر قصيرة|Short reflections|مختصر خیالات
المرفوع سحابياً|Cloud uploads|کلاؤڈ پر اپ لوڈ شدہ
لا توجد مقاطع مطابقة للبحث أو الفلتر|No clips match your search or filter|تلاش یا فلٹر کے مطابق کوئی کلپ نہیں
جرّب كتابة كلمات بحث أخرى أو اختر تصنيفاً مختلفاً من الأعلى.|Try other search terms or choose another category above.|دوسرے الفاظ تلاش کریں یا اوپر سے دوسرا زمرہ منتخب کریں۔
بلاغات وتصويبات المحتوى الواردة من المستخدمين|User content reports and corrections|صارفین کی شکایات اور مواد کی اصلاحات
تحديث القائمة|Refresh list|فہرست تازہ کریں
إجمالي البلاغات|Total reports|کل شکایات
بلاغات جديدة بانتظار المراجعة|New reports awaiting review|جائزے کی منتظر نئی شکایات
تمت المراجعة والتصويب|Reviewed and corrected|جائزہ اور اصلاح مکمل
تصفية الحالة:|Filter by status:|حالت کے مطابق فلٹر:
جديدة فقط|New only|صرف نئی
تم تصويبها|Corrected|اصلاح ہو چکی
جاري تحميل البلاغات...|Loading reports…|شکایات لوڈ ہو رہی ہیں…
معاينة تشغيل المقطع|Clip playback preview|کلپ چلانے کا پیش نظارہ
تعذّر تحميل تسجيل الدخول. تحقق من الإنترنت.|Unable to load sign-in. Check your connection.|سائن ان لوڈ نہیں ہو سکا۔ انٹرنیٹ جانچیں۔
جارٍ تحديث مواقيت مدينتك…|Updating prayer times for your city…|آپ کے شہر کے نماز کے اوقات تازہ کیے جا رہے ہیں…
افتح المصحف|Open the Mushaf|مصحف کھولیں
الإشعارات مش بتوصل|Notifications are not arriving|اطلاعات موصول نہیں ہو رہیں
صفحة الإعدادات الشاملة|All settings|تمام ترتیبات
اختر مدينتك وطريقة الحساب الفقهية المناسبة لك وحجم الخط:|Choose your city, prayer calculation method and font size:|اپنا شہر، نماز کے اوقات کا طریقہ اور فونٹ کا سائز منتخب کریں:
حالة الأذان والتنبيهات|Adhan and notification status|اذان اور اطلاعات کی حالت
نزّل ما تحتاجه ليعمل التطبيق بكامل كفاءته حتى بدون اتصال بالإنترنت:|Download the resources you need for offline use:|انٹرنیٹ کے بغیر استعمال کے لیے ضروری وسائل ڈاؤن لوڈ کریں:
المصحف الشريف (604 صفحة)|The Mushaf (604 pages)|مصحف شریف (604 صفحات)
مضمّن في نسخة الهاتف؛ نزّله أولاً على الويب|Included in the mobile app; download it first on the web|موبائل ایپ میں شامل ہے؛ ویب پر پہلے ڈاؤن لوڈ کریں
صفحات المصحف مضمّنة في نسخة الهاتف. في المتصفح استخدم زر التنزيل قبل القراءة بدون إنترنت.|Mushaf pages are included in the mobile app. In the browser, download them before reading offline.|مصحف کے صفحات موبائل ایپ میں شامل ہیں۔ براؤزر میں آف لائن پڑھنے سے پہلے انہیں ڈاؤن لوڈ کریں۔
تنزيل تفسير آيات القرآن الكريم الميسر لجميع الصفحات.|Download the simplified tafsir for all pages.|تمام صفحات کی آسان تفسیر ڈاؤن لوڈ کریں۔
تلاوة سورة كاملة بصوت العفاسي|Complete surah recitation by Alafasy|العفاسی کی آواز میں مکمل سورۃ کی تلاوت
جزاك الله خيراً على تنبيهنا لأي خطأ طباعي أو لغوي؛ يسعدنا مراجعته وتصويبه فوراً:|Thank you for reporting typing or language errors. We will review and correct them:|کتابت یا زبان کی غلطیوں کی اطلاع دینے کا شکریہ۔ ہم ان کا جائزہ لے کر اصلاح کریں گے:
بث إذاعة القرآن الكريم من القاهرة — إعادة اتصال بنفس المحطة عند الانقطاع|Quran radio from Cairo — reconnects to the same station if interrupted|قاہرہ قرآن ریڈیو — رابطہ ٹوٹنے پر اسی اسٹیشن سے دوبارہ جڑتا ہے
احجز لقراءته|Reserve for reading|تلاوت کے لیے محفوظ کریں
شريط الحالة: معطّل|Status bar: disabled|اسٹیٹس بار: غیر فعال
المواقيت غير متاحة|Prayer times unavailable|نماز کے اوقات دستیاب نہیں
تحديث موقعي|Update my location|میرا مقام تازہ کریں
تحديث المساجد|Refresh mosques|مساجد تازہ کریں
بنر الترحيب الرئيسي|Main welcome banner|مرکزی استقبالیہ بینر
واجهة البداية الترحيبية "زادٌ لقلبك، ونورٌ ليومك" وأزرار البدء السريع|Welcome message and quick start buttons|استقبالیہ پیغام اور فوری آغاز کے بٹن
ظاهر|Visible|نمایاں
شريط التذكير الذكي|Smart reminder bar|ذہین یاد دہانی کی پٹی
بنر التذكير بالسياق الزمني والأدعية المناسبة لوقتك الحالي|Timely reminders and duas for the current time of day|دن کے وقت کے مطابق یاد دہانیاں اور دعائیں
رحلتك الإيمانية اليوم (مواقيت الصلاة والمهام)|Today's worship journey (prayer times and tasks)|آج کا عبادت کا سفر (نماز کے اوقات اور کام)
بطاقة موعد الصلاة القادمة، عداد إنجاز اليوم، ومتابعة الأذكار والورد القرآني|Next prayer, daily progress, adhkar and Quran reading tracker|اگلی نماز، روزانہ پیش رفت، اذکار اور تلاوت کی نگرانی
الختمة القرآنية الذكية|Smart Quran completion plan|قرآن مکمل کرنے کا ذہین منصوبہ
بطاقة خطة الختمة الشخصية والصفحات المتبقية ومتابعة القراءة اليومية|Personal completion plan, remaining pages and daily reading progress|ذاتی ختم کا منصوبہ، باقی صفحات اور روزانہ تلاوت کی پیش رفت
موعظة اليوم المرئية والبودكاست|Today's video reminder and podcast|آج کی ویڈیو نصیحت اور پوڈکاسٹ
مقاطع فيديو إيمانية قصيرة ومختارات وعظية متجددة يومياً|Short faith videos and daily selections of reminders|مختصر ایمانی ویڈیوز اور روزانہ منتخب نصیحتیں
بطاقات الوصول السريع للخدمات|Service shortcuts|خدمات تک فوری رسائی
شبكة بطاقات الخدمات الرئيسية (القرآن، الأذكار، القبلة، الزكاة، المساجد...)|Shortcuts to Quran, adhkar, Qibla, zakat, mosques and more|قرآن، اذکار، قبلہ، زکوٰۃ، مساجد اور دیگر خدمات کے شارٹ کٹس
إنشاء صفحة صدقة جارية للأحباب ومشاركة الدعاء|Create an ongoing charity page for loved ones and share duas|اپنوں کے لیے صدقہ جاریہ کا صفحہ بنائیں اور دعائیں شیئر کریں
أ −|A −|ا −
أ +|A +|ا +
لم يتم تحديد المقطع المطلوب|No clip was selected|کوئی کلپ منتخب نہیں کیا گیا
ختمتي الذكية ووردي القرآني 🌿|My Quran completion plan and daily reading 🌿|میرا ختم قرآن منصوبہ اور روزانہ تلاوت 🌿
يوم مستمر|day streak|مسلسل دن
إنجاز الختمة:|Completion progress:|ختم کی پیش رفت:
من 604 صفحة|of 604 pages|604 صفحات میں سے
من صفحة|From page|صفحہ سے
تم الإنجاز|Completed|مکمل ہوا
تغيير الخطة والمدة|Change plan and duration|منصوبہ اور مدت تبدیل کریں
المرحلة الثانية: غرس مبارك 🌿|Stage 2: A blessed planting 🌿|دوسرا مرحلہ: بابرکت پودا 🌿
المرحلة الثالثة: شجرة الاستغفار 🌳|Stage 3: A tree of forgiveness 🌳|تیسرا مرحلہ: استغفار کا درخت 🌳
المرحلة الرابعة: أصلها ثابت وفرعها في السماء 🌳✨|Stage 4: Firm roots and branches reaching the sky 🌳✨|چوتھا مرحلہ: مضبوط جڑیں اور آسمان تک شاخیں 🌳✨
المرحلة الخامسة: روضة الرضوان والجنة 🌺🌸|Stage 5: A garden of Allah's pleasure and Paradise 🌺🌸|پانچواں مرحلہ: رضائے الٰہی اور جنت کا باغ 🌺🌸
غرس مبارك 🌿|A blessed planting 🌿|بابرکت پودا 🌿
شجرة الاستغفار 🌳|A tree of forgiveness 🌳|استغفار کا درخت 🌳
غرس طيب مبارك، ابدأ بالتسبيح والقرآن لتنمو شجرتك|A blessed seed: begin with tasbeeh and Quran to grow your tree|بابرکت بیج: اپنی شجر کو بڑھانے کے لیے تسبیح اور قرآن سے آغاز کریں
أورقت شجرتك الإيمانية بفضل أذكارك وتلاوتك|Your tree has sprouted through your adhkar and recitation|آپ کے اذکار اور تلاوت سے آپ کے درخت پر پتے آ گئے ہیں
شجرة باسقة مباركة تظلل صاحبها بالأجر والثواب|A tall, blessed tree growing with your worship|آپ کی عبادت سے بڑھتا ہوا بابرکت بلند درخت
تؤتي أُكُلها كل حين بإذن ربها، تقبل الله طاعاتك|Bearing fruit by Allah's permission. May He accept your worship.|اللہ کے حکم سے پھل دیتا ہے۔ اللہ آپ کی عبادت قبول فرمائے۔
ما شاء الله! حديقة إيمانية متكاملة عامرة بالبركة والحسنات|Masha'Allah! A flourishing garden of worship and good deeds|ما شاء اللہ! عبادت اور نیکیوں سے بھرا سرسبز باغ
سبت|Sat|ہفتہ
أحد|Sun|اتوار
اثنين|Mon|پیر
ثلاثاء|Tue|منگل
أربعاء|Wed|بدھ
خميس|Thu|جمعرات
جمعة|Fri|جمعہ
التقويم الهجري الرسمي • تقويم أم القرى|Hijri calendar • Umm al-Qura|ہجری تقویم • ام القریٰ
تعديل الهلال:|Moon-sighting adjustment:|رؤیت ہلال کی ترتیب:
مضى:|Elapsed:|گزر چکے:
متبقي:|Remaining:|باقی:
متبقي|Remaining|باقی
يوماً على الأيام البيض للشهر القادم|days until next month's white days|دن، اگلے مہینے کے ایام بیض تک
صيام الإثنين والخميس القادم 🌿|Upcoming Monday and Thursday fasting 🌿|آنے والے پیر اور جمعرات کے روزے 🌿
اليوم الإثنين (سنة الصيام) 🌿|Today is Monday (Sunnah fasting) 🌿|آج پیر ہے (سنت کا روزہ) 🌿
اليوم الخميس (سنة الصيام) 🌿|Today is Thursday (Sunnah fasting) 🌿|آج جمعرات ہے (سنت کا روزہ) 🌿
صيام الإثنين غداً 🌿|Monday fasting tomorrow 🌿|کل پیر کا روزہ 🌿
الأيام البيض القادمة 🌕|Upcoming white days 🌕|آنے والے ایام بیض 🌕
13، 14، 15 من كل شهر هجري|13th, 14th and 15th of each Hijri month|ہر ہجری مہینے کی 13، 14 اور 15 تاریخ
ساعة|hour|گھنٹہ
دقيقة|minute|منٹ
رحمة|Mercy|رحمت
علم|Knowledge|علم
قدرة|Power|قدرت
مغفرة|Forgiveness|مغفرت
رزق|Provision|رزق
حكمة|Wisdom|حکمت
اقرأ القصة كاملة والعِبر|Read the full story and lessons|مکمل قصہ اور اسباق پڑھیں
لم يبلغ النصاب|Below the nisab|نصاب تک نہیں پہنچا
إجمالي الأصول والأموال:|Total assets and funds:|کل اثاثے اور رقوم:
صافي الوعاء الزكوي:|Net zakatable assets:|زکوٰۃ کے قابل خالص اثاثے:
حد النصاب المعتمد (85 جم ذهب):|Nisab threshold (85 g of gold):|نصاب کی حد (85 گرام سونا):
تفريج هم وكرب|Relief from distress|غم اور پریشانی سے نجات
رحمة ومغفرة|Mercy and forgiveness|رحمت اور مغفرت
نسخ دعاء المقابر|Copy the cemetery dua|قبرستان کی دعا کاپی کریں
أدعية الصائم عند الفطر والسحر|Duas for breaking the fast and before dawn|افطار اور سحری کی دعائیں
دعاء الإفطار المأثور|The reported dua for breaking the fast|افطار کی مسنون دعا
دعاء استجابة الصائم|Dua of the fasting person|روزے دار کی دعا
دعاء الإفطار عند قوم|Dua when breaking the fast at someone's home|کسی کے ہاں افطار کی دعا
الشيخ ناصر القطامي|Sheikh Nasser Al-Qatami|شیخ ناصر القطامی
دليل الصلاة الشامل • صفة صلاة النبي ﷺ|Prayer guide • The Prophet's prayer ﷺ|نماز کی جامع رہنمائی • نبی ﷺ کی نماز کا طریقہ
الأركان والشروط|Pillars and conditions|ارکان اور شرائط
دليل الصلوات والنوافل|Obligatory and voluntary prayers|فرض اور نفل نمازوں کی رہنمائی
أدعية وأذكار الصلاة|Prayer duas and adhkar|نماز کی دعائیں اور اذکار
منهيات ومكروهات|Prohibited and disliked acts|ممنوع اور مکروہ امور
شرط أساسي|Essential condition|بنیادی شرط
الفرائض الخمس|Five obligatory prayers|پانچ فرض نمازیں
الصلوات الخمس المفروضة والسنن الرواتب|The five daily prayers and regular Sunnah prayers|پانچ فرض نمازیں اور سنن رواتب
نوافل وقربات|Voluntary worship|نوافل اور قربات
نوافل الطاعات والصلوات المستحبة|Voluntary and recommended prayers|نفل اور مستحب نمازیں
فقه السهو|Forgetfulness in prayer|نماز میں بھول کے احکام
دليل سجود السهو المبسط|A simple guide to prostration for forgetfulness|سجدہ سہو کی آسان رہنمائی
حالات السجود قبل السلام:|Cases before the salam:|سلام سے پہلے کے مواقع:
حالات السجود بعد السلام:|Cases after the salam:|سلام کے بعد کے مواقع:
كيفيته:|How to perform it:|طریقہ:
🌿 السنن:|🌿 Sunnah prayers:|🌿 سنتیں:
⏰ وقتها:|⏰ Time:|⏰ وقت:
💡 فائدة:|💡 Note:|💡 فائدہ:
القيام|Standing|قیام
الركوع|Bowing|رکوع
السجود|Prostration|سجدہ
الاعتدال قائماً|Standing upright|سیدھا کھڑا ہونا
الجلوس بين السجدتين|Sitting between prostrations|دو سجدوں کے درمیان بیٹھنا
القعود الأخير|Final sitting|آخری قعدہ
قبل السلام|Before the salam|سلام سے پہلے
ثبّت التطبيق للوصول السريع للقرآن ومواقيت الصلاة والأذكار بدون نت|Install the app for quick access to Quran, prayer times and downloaded adhkar offline|قرآن، نماز کے اوقات اور ڈاؤن لوڈ شدہ اذکار تک فوری آف لائن رسائی کے لیے ایپ انسٹال کریں
وسيظهر التطبيق فوراً على شاشة هاتفك مع سائر تطبيقاتك الأساسية|The app will appear on your phone's home screen|ایپ آپ کے فون کی ہوم اسکرین پر ظاہر ہوگی
اكتب اسم فقيدك لمشاركة الدعاء له مع رابط تحميل التطبيق.|Enter your loved one's name to share a prayer for them with the app download link.|اپنے مرحوم عزیز کے لیے دعا اور ایپ ڈاؤن لوڈ کرنے کا لنک شیئر کرنے کے لیے ان کا نام درج کریں۔
متبقي أقل من دقيقة|Less than a minute remaining|ایک منٹ سے کم باقی
تم حفظ الاختيارات، لكن تعذّر تطبيق مستوى صوت أندرويد. حدّث التطبيق وأعد المحاولة.|Preferences saved, but the Android volume could not be applied. Update the app and try again.|انتخاب محفوظ ہیں، لیکن اینڈرائیڈ پر آواز کی سطح لاگو نہیں ہوئی۔ ایپ اپ ڈیٹ کر کے دوبارہ کوشش کریں۔
تم حفظ الاختيارات، لكن تعذّرت جدولة التنبيهات.|Preferences saved, but reminders could not be scheduled.|انتخاب محفوظ ہیں، لیکن یاد دہانیاں مقرر نہیں ہو سکیں۔
تم حفظ إعدادات التنبيهات.|Reminder settings saved.|یاد دہانیوں کی ترتیبات محفوظ ہو گئیں۔
إذن الإشعارات غير متاح؛ فعّله من إعدادات الهاتف.|Enable notification permission in your phone settings.|فون کی ترتیبات میں اطلاعات کی اجازت دیں۔
تم حفظ التذكيرات، لكن تعذّر تفعيل تشغيل الأذان الكامل في أندرويد. أعد التفعيل بعد مراجعة الأذونات.|Reminders saved, but the full Adhan could not be enabled on Android. Check permissions and try again.|یاد دہانیاں محفوظ ہیں، لیکن اینڈرائیڈ پر مکمل اذان فعال نہیں ہوئی۔ اجازتیں دیکھ کر دوبارہ کوشش کریں۔
لا توجد مواعيد صلاة قادمة مجدولة. حدّث المواقيت من الرئيسية؛ التذكيرات الأخرى محفوظة.|No upcoming prayers are scheduled. Refresh prayer times on Home. Other reminders are saved.|آنے والی نمازوں کے اوقات مقرر نہیں ہیں۔ ہوم پر اوقات تازہ کریں۔ باقی یاد دہانیاں محفوظ ہیں۔
حُفظت التنبيهات، لكن إذن المنبّهات الدقيقة غير مفعّل. فعّله لضبط توقيت الأذان وتشغيله في الخلفية.|Reminders saved. Enable exact alarms for on-time Adhan playback in the background.|یاد دہانیاں محفوظ ہیں۔ پس منظر میں وقت پر اذان چلانے کے لیے درست وقت کے الارم کی اجازت دیں۔
تم حفظ الأذان وتجديد مواقيته تلقائيًا على أندرويد حسب الموقع المحفوظ، دون إنترنت.|Adhan reminders are saved and renew automatically on Android for the saved location, even offline.|اذان کی یاد دہانیاں محفوظ ہیں اور اینڈرائیڈ پر محفوظ مقام کے مطابق انٹرنیٹ کے بغیر بھی خود بخود تازہ ہوتی ہیں۔
تم حفظ التذكيرات المتكررة في الهاتف.|Recurring reminders saved on your phone.|بار بار آنے والی یاد دہانیاں فون میں محفوظ ہو گئیں۔
تعذّرت جدولة التنبيهات في نظام الهاتف.|Your phone could not schedule notifications.|فون میں اطلاعات مقرر نہیں ہو سکیں۔
تم حفظ الأذكار والصلاة على النبي، لكن الأذان لم يُجدول لعدم توفر مواقيت مؤكدة. افتح الرئيسية وحدّث مواقيت الصلاة لموقعك ثم أعد التفعيل.|Adhkar and salawat reminders are saved. Refresh prayer times for your location on Home before enabling Adhan reminders again.|اذکار اور درود کی یاد دہانیاں محفوظ ہیں۔ اذان کی یاد دہانیاں دوبارہ فعال کرنے سے پہلے ہوم پر اپنے مقام کے اوقات نماز تازہ کریں۔
تعذّرت جدولة التذكيرات في نظام الهاتف.|Your phone could not schedule reminders.|فون میں یاد دہانیاں مقرر نہیں ہو سکیں۔
الإشعارات غير مدعومة في هذا المتصفح.|This browser does not support notifications.|یہ براؤزر اطلاعات کی سہولت نہیں دیتا۔
إذن الإشعارات مرفوض؛ غيّره من إعدادات المتصفح.|Notifications are blocked. Allow them in browser settings.|اطلاعات مسدود ہیں۔ براؤزر کی ترتیبات میں اجازت دیں۔
تعذّر إرسال الإشعار التجريبي.|Could not send the test notification.|آزمائشی اطلاع نہیں بھیجی جا سکی۔
اختبار الخلفية يحتاج تطبيق الهاتف؛ المتصفح لا يضمن التنبيه عند قفل الشاشة.|Use the mobile app to test reminders with the screen locked.|اسکرین مقفل ہونے پر یاد دہانی کی آزمائش کے لیے موبائل ایپ استعمال کریں۔
فعّل إذن الإشعارات قبل الاختبار.|Enable notification permission before testing.|آزمائش سے پہلے اطلاعات کی اجازت دیں۔
فعّل إذن المنبّهات الدقيقة من إعدادات الهاتف ثم أعد الاختبار.|Allow exact alarms in phone settings, then run the test again.|فون کی ترتیبات میں درست وقت کے الارم کی اجازت دیں اور دوبارہ آزمائیں۔
تعذّرت جدولة اختبار الخلفية. راجع أذونات الهاتف؛ مؤقت المتصفح لا يضمن العمل والشاشة مقفولة.|Could not schedule the background test. Check your phone permissions; browser timers may stop when the screen locks.|پس منظر کی آزمائش مقرر نہیں ہو سکی۔ فون کی اجازتیں دیکھیں؛ اسکرین مقفل ہونے پر براؤزر کا ٹائمر رک سکتا ہے۔
اللهم اغفر له وارحمه وعافه واعف عنه...|Dua for mercy and pardon…|رحمت اور درگزر کی دعا…
اللهم اجعل قبره روضة من رياض الجنة...|Dua for a grave like a garden of Paradise…|قبر کو جنت کا باغ بنانے کی دعا…
اللهم يمن كتابه ويسر حسابه...|Dua for an easy reckoning…|آسان حساب کی دعا…
اللهم أبدله داراً خيراً من داره...|Dua for a better home in the Hereafter…|آخرت میں بہتر گھر کی دعا…
اللهم إنه كان يشهد أنك لا إله إلا أنت...|Dua for mercy for one who testified to Allah’s oneness…|توحید کی گواہی دینے والے کے لیے رحمت کی دعا…
تم تفعيل إذن التنبيهات بنجاح في جهازك ✓|Notifications are enabled on your device ✓|آپ کے آلے پر اطلاعات فعال ہیں ✓
على أجهزة iPhone و iOS: لإتاحة استقبال التنبيهات والأذان، اضغط على زر المشاركة (Share) في متصفح Safari ثم اختر "إضافة إلى الصفحة الرئيسية (Add to Home Screen)".|On iPhone, open the Share menu in Safari and choose Add to Home Screen to enable notifications and Adhan reminders.|آئی فون پر اطلاعات اور اذان کی یاد دہانیوں کے لیے سفاری میں شیئر مینو کھولیں اور ہوم اسکرین پر شامل کریں۔
أفضل أوقات استجابة الدعاء دبر الصلوات المكتوبة، وبين الأذان والإقامة، وفي الثلث الأخير من الليل.|Good times to make dua include after obligatory prayers, between the Adhan and Iqamah, and during the last third of the night.|دعا کے بہترین اوقات فرض نمازوں کے بعد، اذان اور اقامت کے درمیان، اور رات کے آخری تہائی حصے میں ہیں۔
خير يوم طلعت عليه الشمس؛ لا تنسَ قراءة سورة الكهف، والإكثار من الصلاة على النبي ﷺ، واغتنام ساعة الاستجابة بالدعاء لفقيدنا الغالي.|On this blessed day, read Surah Al-Kahf, send abundant blessings on the Prophet ﷺ, and remember our loved one in your duas.|اس مبارک دن سورۃ الکہف پڑھیں، نبی ﷺ پر کثرت سے درود بھیجیں اور قبولیت کی گھڑی میں ہمارے عزیز مرحوم کے لیے دعا کریں۔
"للصائم عند فطره دعوة لا تُرد"... اغتنم هذه النفحات بالدعاء لفقيدنا الحبيب.|When you break your fast, take a moment to pray for our departed loved one.|افطار کے وقت اس مبارک موقع پر ہمارے عزیز مرحوم کے لیے دعا کریں۔
داوم على أذكار يومك وانوِ بركتها وأجرها لروحه الطاهرة، فالذكر حصن منيع وسكينة للقلوب وبركة في العمر والعمل.|Keep up your daily remembrance and pray that its blessings and reward reach him. Dhikr brings protection, peace, and blessings.|روزانہ کے اذکار کی پابندی کریں اور ان کی برکت اور اجر مرحوم کے لیے مانگیں۔ ذکر حفاظت، دل کا سکون اور زندگی و عمل میں برکت لاتا ہے۔
في ذمة الله وحفظه|Under Allah’s protection|اللہ کی حفاظت میں
بكل حرف عشر حسنات|Ten good deeds for each letter|ہر حرف پر دس نیکیاں
حصن وبركة لليوم كله|Protection and blessings throughout the day|دن بھر حفاظت اور برکت
حفظ وسكينة طوال الليل|Protection and peace throughout the night|رات بھر حفاظت اور سکون
صدقة عن كل مفصل|Charity for every joint|ہر جوڑ کی طرف سے صدقہ
ملك يحرسك حتى تصبح|An angel guards you until morning|صبح تک ایک فرشتہ حفاظت کرتا ہے
يُكفى همك ويُغفر ذنبك|Relief from worry and forgiveness of sins|پریشانی سے نجات اور گناہوں کی بخشش
تطفئ غضب الرب وتدفع البلاء|A means of averting divine anger and hardship|اللہ کے غضب اور مصیبت کو دور کرنے کا ذریعہ
حبيبتان إلى الرحمن، خفيفتان على اللسان، ثقيلتان في الميزان.|Two phrases beloved to the Most Merciful, easy to say and heavy on the scales.|دو کلمات جو رحمان کو محبوب، زبان پر ہلکے اور میزان میں بھاری ہیں۔
قال رسول الله ﷺ:|The Messenger of Allah ﷺ said:|رسول اللہ ﷺ نے فرمایا:
قال تعالى:|Allah the Exalted says:|اللہ تعالیٰ فرماتا ہے:
[متفق عليه]|[Agreed upon]|[متفق علیہ]
[صحيح مسلم]|[Sahih Muslim]|[صحیح مسلم]
كل دعوة تؤمّن عليها أو تكتبها ترفع درجته وتؤنس وحشته وتثقل ميزانك بالأجر إن شاء الله.|Each dua you write or say Ameen to is a prayer for his comfort and higher rank, and a source of reward for you, insha’Allah.|ہر دعا جو آپ لکھیں یا جس پر آمین کہیں، ان کے لیے راحت اور بلندیٔ درجات کی دعا اور آپ کے لیے اجر کا ذریعہ ہے، ان شاء اللہ۔
صدقة جارية على روح جدي الغالي (عبدالمعبود أمين سعيد) رحمه الله، وستي الغالية (حكم عبدالصمد) رحمها الله|An ongoing charity in memory of my beloved grandfather, Abdul-Maboud Amin Saeed, and grandmother, Hakam Abdulsamad. May Allah have mercy on them.|میرے پیارے نانا دادا عبدالمعبود امین سعید اور پیاری دادی حکم عبدالصمد کے لیے صدقہ جاریہ۔ اللہ ان پر رحم فرمائے۔
— نسألكم الفاتحة وصالح الدعاء لهما ولكل موتى المسلمين.|— Please recite Al-Fatihah and pray for them and all departed Muslims.|— ان دونوں اور تمام مرحوم مسلمانوں کے لیے سورۃ الفاتحہ پڑھیں اور دعا کریں۔
وعد الله رسوله الكريم بأن عمل ابن آدم لا ينقطع بدعاء ولده وأحبابه ومحبيه.|The duas of one’s children and loved ones can continue to benefit a person after death.|اولاد اور عزیزوں کی دعائیں وفات کے بعد بھی انسان کو فائدہ پہنچا سکتی ہیں۔
رواه مسلم عن أبي هريرة رضي الله عنه|Narrated by Muslim from Abu Hurayrah, may Allah be pleased with him|مسلم نے ابو ہریرہ رضی اللہ عنہ سے روایت کیا
رواه مسلم عن بريدة رضي الله عنه|Narrated by Muslim from Buraydah, may Allah be pleased with him|مسلم نے بریدہ رضی اللہ عنہ سے روایت کیا
رواه ابن ماجه وأحمد بإسناد حسن|Narrated by Ibn Majah and Ahmad with a sound chain|ابن ماجہ اور احمد نے حسن سند کے ساتھ روایت کیا
فتاوى وأحكام شرعية موثقة|Referenced Islamic rulings|حوالوں کے ساتھ شرعی احکام
إجابات شرعية موثقة من الكتاب والسنّة وإجماع العلماء حول ما يصل للميت من دعاء وصدقات وأحكام الحج والصيام عنه.|Answers from the Quran, Sunnah, and scholarly consensus on dua, charity, Hajj, and fasting on behalf of the deceased.|قرآن، سنت اور اجماع کی روشنی میں مرحوم کے لیے دعا، صدقہ، حج اور روزے کے احکام۔
سنّة نبوية وهدي قويم|Prophetic practice and guidance|نبوی سنت اور رہنمائی
زيارة القبور تذكّر بالآخرة، وترقق القلوب، وينتفع بها الميت بالدعاء له والاستغفار وطلب الرحمة لروحه.|Visiting graves reminds us of the Hereafter, softens the heart, and gives us a chance to pray for mercy and forgiveness for the deceased.|قبروں کی زیارت آخرت کی یاد دلاتی ہے، دل کو نرم کرتی ہے اور مرحوم کے لیے بخشش اور رحمت مانگنے کا موقع دیتی ہے۔
ما يقوله المسلم عند دخول المقابر:|What to say when entering a cemetery:|قبرستان میں داخل ہوتے وقت کی دعا:
الدعاء والاستغفار:|Dua and seeking forgiveness:|دعا اور استغفار:
أنفع ما يقدمه الحي للميت، ويرفع درجته في الجنة.|Among the best gifts to the deceased, raising their rank in Paradise.|مرحوم کے لیے بہترین تحفوں میں سے ہے اور جنت میں ان کے درجات بلند کرتا ہے۔
الصدقة الجارية:|Ongoing charity:|صدقہ جاریہ:
كإطعام الطعام، حفر الآبار، طباعة المصاحف، وبناء المساجد.|Examples include feeding people, digging wells, printing Qurans, and building mosques.|مثلاً کھانا کھلانا، کنویں کھدوانا، قرآن چھپوانا اور مسجدیں تعمیر کرنا۔
الحج والعمرة عنه:|Hajj and Umrah on their behalf:|مرحوم کی طرف سے حج اور عمرہ:
لمن حج واعتمر عن نفسه أولاً.|For someone who has already performed Hajj and Umrah for themselves.|اس شخص کے لیے جو پہلے اپنی طرف سے حج اور عمرہ کر چکا ہو۔
قضاء ديونه ونذوره:|Settling debts and fulfilling vows:|قرض اور نذر کی ادائیگی:
إبراء لذمته وتخفيف عنه.|This discharges their obligations and eases their burden.|اس سے ان کی ذمہ داری ادا ہوتی ہے اور بوجھ کم ہوتا ہے۔
إخلاص النية:|Sincere intention:|نیت میں اخلاص:
للاتعاظ وتذكر الآخرة والإحسان للميت بالدعاء.|Reflect, remember the Hereafter, and pray for the deceased.|عبرت حاصل کریں، آخرت کو یاد کریں اور مرحوم کے لیے دعا کریں۔
إلقاء السلام:|Offering greetings of peace:|سلام کہنا:
على أهل القبور كما ورد في السنة.|Greet the people of the graves as taught in the Sunnah.|سنت کے مطابق اہل قبور کو سلام کہیں۔
استقبال القبلة:|Facing the Qiblah:|قبلے کی طرف رخ کرنا:
عند الدعاء للميت والتضرع ورفع اليدين.|When raising your hands in supplication for the deceased.|مرحوم کے لیے ہاتھ اٹھا کر عاجزی سے دعا کرتے وقت۔
الدعاء بثباته ومغفرته:|Praying for steadfastness and forgiveness:|ثابت قدمی اور مغفرت کی دعا:
وسؤال الفسحة والنور له في قبره.|Also ask for spaciousness and light in their grave.|ان کی قبر میں کشادگی اور نور بھی مانگیں۔
عدم الجلوس أو المشي فوق القبور:|Avoid sitting or walking on graves:|قبروں پر بیٹھنے یا چلنے سے پرہیز:
لنهي النبي ﷺ الصريح عن ذلك تعظيماً للمسلم.|The Prophet ﷺ forbade this out of respect for the deceased.|نبی ﷺ نے مرحوم کے احترام میں اس سے منع فرمایا۔
اجتناب النياحة وشق الجيوب:|Avoid wailing and tearing clothes:|نوحہ کرنے اور گریبان چاک کرنے سے پرہیز:
والرضا بقضاء الله وقدره واحتساب الصبر.|Accept Allah’s decree and seek reward through patience.|اللہ کی تقدیر پر راضی رہیں اور صبر کا اجر مانگیں۔
الدعاء للميت لا دعاء الميت:|Pray to Allah for the deceased:|مرحوم کے لیے اللہ سے دعا کریں:
فالميت فقير إلى رحمة ربه ودعائكم له.|The deceased needs Allah’s mercy and your prayers.|مرحوم کو اپنے رب کی رحمت اور آپ کی دعاؤں کی ضرورت ہے۔
جدي عبدالمعبود ✦|My grandfather Abdul-Maboud ✦|میرے دادا عبدالمعبود ✦
يُستخدم صوت المؤذن المختار لجميع الصلوات، بما فيها الفجر.|The selected muezzin is used for all prayers, including Fajr.|منتخب مؤذن کی آواز فجر سمیت تمام نمازوں کے لیے استعمال ہوتی ہے۔
كأي تطبيق رسمي من متجر أبل يعمل بدون إنترنت بخطوتين بسيطتين:|Add the app to your iPhone in two steps:|دو آسان مرحلوں میں ایپ آئی فون پر شامل کریں:
يفتح التطبيق بضغطة زر، ويعمل بكفاءة 100% بدون اتصال بالإنترنت!|Open it with one tap. Offline features are available without an internet connection.|ایک بار دبانے سے ایپ کھل جاتی ہے۔ آف لائن سہولتیں انٹرنیٹ کے بغیر دستیاب ہیں۔
بشارة نبوية شريفة:|Glad tidings from the Prophet ﷺ:|نبی ﷺ کی خوش خبری:
فقه الصلاة خطوة بخطوة: الأركان، الشروط، السنن والرواتب، النوافل والقيام، وأدعية الركوع والسجود والمنهيات.|A step-by-step prayer guide: essentials, conditions, Sunnah and voluntary prayers, duas, and what to avoid.|نماز کی مرحلہ وار رہنمائی: ارکان، شرائط، سنتیں، نوافل، دعائیں اور ممنوع کام۔
تبطل الصلاة بتركها|Omitting these invalidates prayer|انہیں چھوڑنے سے نماز باطل ہو جاتی ہے
تُجبر بسجود السهو|Make up for these with the prostration of forgetfulness|ان کی تلافی سجدۂ سہو سے ہوتی ہے
تبطل الصلاة بها|These invalidate prayer|ان سے نماز باطل ہو جاتی ہے
تحذير نبوي|Prophetic warning|نبوی تنبیہ
بعد التسليم من ركعتي الاستخارة|After completing the two rakahs of Istikharah|استخارے کی دو رکعت کا سلام پھیرنے کے بعد
سنة نبوية مؤكدة|Emphasized Sunnah|سنت مؤکدہ
دعاء نبوي مأثور|Supplication from the Sunnah|مسنون دعا
السيرة النبوية|Life of the Prophet ﷺ|سیرت نبوی ﷺ
حان الآن وقت أذكار الصباح وسؤال العافية ☀️|It’s time for morning remembrance and prayers for well-being ☀️|صبح کے اذکار اور عافیت کی دعا کا وقت ہے ☀️
حان الآن وقت أذكار المساء وحفظ الليل 🌙|It’s time for evening remembrance and prayers for protection through the night 🌙|شام کے اذکار اور رات کی حفاظت کی دعا کا وقت ہے 🌙
1. الإسلام|1. Islam|۱۔ اسلام
2. العقل|2. Sound mind|۲۔ عقل
3. التمييز|3. Discernment|۳۔ سمجھ بوجھ
4. رفع الحدث (الوضوء أو الغسل)|4. Ritual purification (wudu or ghusl)|۴۔ طہارت (وضو یا غسل)
5. إزالة النجاسة|5. Removing impurities|۵۔ نجاست دور کرنا
6. ستر العورة|6. Covering the required parts of the body|۶۔ ستر ڈھانپنا
7. دخول الوقت|7. The prayer time has begun|۷۔ نماز کا وقت داخل ہونا
8. استقبال القبلة|8. Facing the Qiblah|۸۔ قبلہ رخ ہونا
9. النية|9. Intention|۹۔ نیت
1. القيام في الفريضة للقادر|1. Standing for obligatory prayer if able|۱۔ استطاعت ہو تو فرض نماز میں قیام
2. تكبيرة الإحرام|2. The opening takbir|۲۔ تکبیر تحریمہ
3. قراءة سورة الفاتحة|3. Reciting Surah Al-Fatihah|۳۔ سورۃ الفاتحہ پڑھنا
5. الرفع والاعتدال من الركوع|5. Rising from ruku and standing upright|۵۔ رکوع سے اٹھ کر سیدھا کھڑا ہونا
6. السجود على الأعضاء السبعة|6. Prostrating on the seven points of contact|۶۔ سات اعضا پر سجدہ کرنا
7. الرفع من السجود|7. Rising from prostration|۷۔ سجدے سے اٹھنا
9. الطمأنينة في جميع الأركان|9. Pausing calmly in each posture|۹۔ ہر رکن میں اطمینان
10. التشهد الأخير|10. The final tashahhud|۱۰۔ آخری تشہد
11. الجلوس للتشهد الأخير والتسليمتين|11. Sitting for the final tashahhud and the two salams|۱۱۔ آخری تشہد اور دونوں سلام کے لیے بیٹھنا
12. الصلاة على النبي ﷺ في التشهد الأخير|12. Sending blessings on the Prophet ﷺ in the final tashahhud|۱۲۔ آخری تشہد میں نبی ﷺ پر درود پڑھنا
13. التسليمتان|13. The two closing salams|۱۳۔ دونوں سلام پھیرنا
14. الترتيب بين الأركان|14. Performing the pillars in order|۱۴۔ ارکان کو ترتیب سے ادا کرنا
1. جميع التكبيرات غير تكبيرة الإحرام|1. All takbirs except the opening takbir|۱۔ تکبیر تحریمہ کے سوا تمام تکبیریں
2. قول: «سَمِعَ اللهُ لِمَنْ حَمِدَه»|2. Say: «سَمِعَ اللهُ لِمَنْ حَمِدَه»|۲۔ پڑھیں: «سَمِعَ اللهُ لِمَنْ حَمِدَه»
3. قول: «رَبَّنَا وَلَكَ الحَمْد»|3. Say: «رَبَّنَا وَلَكَ الحَمْد»|۳۔ پڑھیں: «رَبَّنَا وَلَكَ الحَمْد»
4. قول: «سُبْحَانَ رَبِّيَ العَظِيم»|4. Say: «سُبْحَانَ رَبِّيَ العَظِيم»|۴۔ پڑھیں: «سُبْحَانَ رَبِّيَ العَظِيم»
5. قول: «سُبْحَانَ رَبِّيَ الأَعْلَى»|5. Say: «سُبْحَانَ رَبِّيَ الأَعْلَى»|۵۔ پڑھیں: «سُبْحَانَ رَبِّيَ الأَعْلَى»
6. قول: «رَبِّ اغْفِرْ لِي»|6. Say: «رَبِّ اغْفِرْ لِي»|۶۔ پڑھیں: «رَبِّ اغْفِرْ لِي»
7. التشهد الأول|7. The first tashahhud|۷۔ پہلا تشہد
8. الجلوس للتشهد الأول|8. Sitting for the first tashahhud|۸۔ پہلے تشہد کے لیے بیٹھنا
ركعتان مفروضتان (جهريتان)|Two obligatory rakahs (recited aloud)|دو فرض رکعتیں (بلند آواز سے قراءت)
4 ركعات مفروضة (سرية)|Four obligatory rakahs (quiet recitation)|چار فرض رکعتیں (آہستہ قراءت)
3 ركعات مفروضة (الأولى والثانية جهرية، والثالثة سرية)|Three obligatory rakahs (first two aloud, third quietly)|تین فرض رکعتیں (پہلی دو میں بلند، تیسری میں آہستہ قراءت)
4 ركعات مفروضة (الأولى والثانية جهرية، والثالثة والرابعة سرية)|Four obligatory rakahs (first two aloud, last two quietly)|چار فرض رکعتیں (پہلی دو میں بلند، آخری دو میں آہستہ قراءت)
من ركعتين إلى 8 ركعات (مثنى مثنى)|Two to eight rakahs, in pairs|دو سے آٹھ رکعتیں، دو دو کر کے
مثنى مثنى، وأقلها ركعتان، وأكملها 8 أو 10 ركعات ثم الوتر|Pray in pairs, at least two rakahs, or eight or ten followed by Witr.|دو دو رکعت کر کے پڑھیں، کم از کم دو، یا آٹھ یا دس اور پھر وتر۔
أقلها ركعة واحدة، وأدنى الكمال 3 ركعات (ركعتان شفع ثم ركعة وتر)|At least one rakah; three can be prayed as two followed by one Witr.|کم از کم ایک رکعت؛ تین پڑھیں تو دو رکعت کے بعد ایک وتر۔
ركعتان من غير الفريضة|Two voluntary rakahs|دو نفل رکعتیں
4 تكبيرات قياماً دون ركوع ولا سجود|Four takbirs while standing, without ruku or prostration|کھڑے ہو کر چار تکبیریں، رکوع اور سجدے کے بغیر
ركعتان جهريتان بعد الخطبتين|Two rakahs recited aloud after the two sermons|دو خطبوں کے بعد دو رکعتیں بلند قراءت کے ساتھ
ركعتان|Two rakahs|دو رکعتیں
ركعتان بهيئة خاصة|Two rakahs in a special form|خاص طریقے سے دو رکعتیں
⚠️ 1. نقر الغراب (العجلة وعدم الطمأنينة)|⚠️ 1. Rushing through the prayer postures|⚠️ ۱۔ نماز کے ارکان جلدی اور بے اطمینانی سے ادا کرنا
⚠️ 2. افتراش السبع (بسط الذراعين في السجود)|⚠️ 2. Resting the forearms on the ground in prostration|⚠️ ۲۔ سجدے میں بازو زمین پر بچھانا
⚠️ 3. الالتفات في الصلاة|⚠️ 3. Turning aside during prayer|⚠️ ۳۔ نماز میں ادھر ادھر رخ کرنا
⚠️ 4. إقعاء الكلب في الجلوس|⚠️ 4. Sitting like a dog|⚠️ ۴۔ کتے کی طرح بیٹھنا
⚠️ 5. رفع البصر إلى السماء أثناء الصلاة|⚠️ 5. Looking up at the sky during prayer|⚠️ ۵۔ نماز میں آسمان کی طرف دیکھنا
⚠️ 6. التخصر في الصلاة (وضع اليدين على الخاصرة)|⚠️ 6. Placing the hands on the hips in prayer|⚠️ ۶۔ نماز میں کمر پر ہاتھ رکھنا
⚠️ 7. كفت الثياب وعقص الشعر في الصلاة|⚠️ 7. Gathering up clothes or tying up hair for prayer|⚠️ ۷۔ نماز کے لیے کپڑے سمیٹنا یا بال باندھنا
⚠️ 8. الصلاة بحضرة الطعام أو مدافعة الأخبثين|⚠️ 8. Praying when food is served or while needing the toilet|⚠️ ۸۔ کھانا سامنے ہو یا حاجت روک کر نماز پڑھنا
⚠️ 9. السدل وتغطية الفم (التلثم) لغير حاجة|⚠️ 9. Letting garments hang loose or covering the mouth without need|⚠️ ۹۔ بلا ضرورت کپڑا لٹکانا یا منہ ڈھانپنا
⚠️ 10. تشبيك الأصابع والعبث بالحركات الزائدة|⚠️ 10. Interlacing fingers and fidgeting|⚠️ ۱۰۔ انگلیاں پھنسانا اور بے جا حرکت کرنا
❌ 1. الحدث الأصغر أو الأكبر|❌ 1. Losing ritual purity|❌ ۱۔ وضو یا طہارت ٹوٹ جانا
❌ 2. الكلام العمد لغير مصلحة الصلاة|❌ 2. Deliberately speaking about something unrelated to prayer|❌ ۲۔ نماز سے غیر متعلق بات جان بوجھ کر کرنا
❌ 3. الضحك والقهقهة|❌ 3. Laughing aloud|❌ ۳۔ ہنسنا اور قہقہہ لگانا
❌ 4. الأكل والشرب عمداً|❌ 4. Deliberately eating or drinking|❌ ۴۔ جان بوجھ کر کھانا یا پینا
❌ 5. كثرة الحركة المتوالية لغير ضرورة|❌ 5. Repeated unnecessary movement|❌ ۵۔ بلا ضرورت مسلسل زیادہ حرکت کرنا
❌ 6. ترك ركن أو شرط عمداً|❌ 6. Deliberately omitting a pillar or condition|❌ ۶۔ جان بوجھ کر کوئی رکن یا شرط چھوڑنا
❌ 7. تعمد زيادة ركعة أو ركن فعلي|❌ 7. Deliberately adding a rakah or a physical pillar|❌ ۷۔ جان بوجھ کر رکعت یا عملی رکن بڑھانا
الصيغة الأولى (المشهورة):|First wording (well known):|پہلے الفاظ (مشہور):
الصيغة الثانية (المأثورة في الصحيحين):|Second wording (reported in both Sahih collections):|دوسرے الفاظ (صحیحین میں منقول):
الواجب (يكرر 3 مرات مستحباً):|Required wording (recommended three times):|واجب کلمات (تین بار پڑھنا مستحب ہے):
أدعية نبوية مأثورة في الركوع:|Prophetic duas for ruku:|رکوع کی مسنون دعائیں:
دعاء الجمع بين الحمد والمغفرة:|Dua of praise and forgiveness:|حمد اور مغفرت کی دعا:
عند الرفع (للإمام والمنفرد):|When rising (for the imam and those praying alone):|اٹھتے وقت (امام اور اکیلے نماز پڑھنے والے کے لیے):
عند الاستواء قائماً (للجميع):|When standing upright (for everyone):|سیدھا کھڑے ہونے پر (سب کے لیے):
صيغة التمام النبوية:|Full wording from the Sunnah:|سنت سے ثابت مکمل الفاظ:
دعاء الاستغفار الجامع في السجود:|A comprehensive dua for forgiveness in prostration:|سجدے میں مغفرت کی جامع دعا:
دعاء الخضوع والانكسار:|Dua of humility and submission:|عاجزی اور انکساری کی دعا:
الواجب المجزئ:|Minimum required wording:|واجب ادا کرنے کے لیے کافی الفاظ:
الدعاء النبوي الجامع لحاجات الدنيا والآخرة:|A Prophetic dua for this world and the Hereafter:|دنیا اور آخرت کی حاجات کے لیے جامع مسنون دعا:
نص التشهد (حديث ابن مسعود رضي الله عنه):|Tashahhud (hadith of Ibn Masud):|تشہد کے الفاظ (ابن مسعود رضی اللہ عنہ کی حدیث):
الصلاة الإبراهيمية (في التشهد الأخير):|Ibrahimic blessings (in the final tashahhud):|درود ابراہیمی (آخری تشہد میں):
الاستعاذة النبوية الأكيدة:|Prophetic supplication for protection:|پناہ مانگنے کی مسنون دعا:
دعاء معاذ بن جبل المشهور:|The well-known dua taught to Muadh ibn Jabal:|معاذ بن جبل کو سکھائی گئی مشہور دعا:
نص دعاء الاستخارة النبوي الشريف:|The Prophetic dua for Istikharah:|استخارے کی مسنون دعا:
منذ قليل|Just now|ابھی کچھ دیر پہلے
أمس|Yesterday|گزشتہ روز
1 رجب (من الأشهر الحُرُم)|1 Rajab (one of the sacred months)|یکم رجب (حرمت والے مہینوں میں سے ایک)
2 إلى 30 شوّال|2 to 30 Shawwal|۲ سے ۳۰ شوال
9 و 10 محرّم|9 and 10 Muharram|۹ اور ۱۰ محرم
يس 36|Ya-Sin 36|یٰسین ۳۶
ملاحظة: حلي المرأة الشخصي المعتاد لا زكاة فيه عند جمهور الفقهاء. الزكاة في سبائك الادخار والاستثمار.|Most jurists exempt customary personal jewelry from zakat. Gold bars held as savings or investments are subject to zakat.|اکثر فقہا کے نزدیک عام ذاتی زیور پر زکوٰۃ نہیں۔ بچت یا سرمایہ کاری کے لیے رکھی گئی سونے کی سلاخوں پر زکوٰۃ ہے۔
أبو البشر|Father of humanity|انسانیت کے جد
أول الرسل|First messenger|پہلے رسول
خليل الرحمن|Close friend of the Most Merciful|رحمان کے خلیل
أحسن القصص|The finest of stories|بہترین قصہ
كليم الله|The one Allah spoke to|کلیم اللہ
سيد ولد آدم|Leader of the children of Adam|اولادِ آدم کے سردار
الصديق الأكبر|The foremost believer in the truth|صدیقِ اکبر
أمير المؤمنين|Commander of the faithful|امیر المؤمنین
ذو النورين|Possessor of two lights|ذوالنورین
رابع الخلفاء|Fourth caliph|چوتھے خلیفہ
طلحة الفياض|Talhah the generous|سخی طلحہ
حواري النبي|The Prophet’s devoted disciple|نبی ﷺ کے حواری
المنفق الصادق|The sincere giver|مخلص سخی
فارس القادسية|Hero of Al-Qadisiyyah|قادسیہ کے شہسوار
المستجاب الدعوة|One whose duas were answered|مستجاب الدعوات
أمين الأمة|Trustee of the Ummah|امینِ امت
خلق الله آدم بيده من طين ونفخ فيه من روحه وأسجد له ملائكته تعظيماً، وعلمه الأسماء كلها، ثم أهبطه إلى الأرض ليعمرها بالتوحيد بعد توبته الصادقة.|Allah created Adam from clay, taught him the names, and commanded the angels to bow before him. After Adam repented, Allah sent him to earth to live in worship of Him alone.|اللہ نے آدم کو مٹی سے پیدا کیا، انہیں نام سکھائے اور فرشتوں کو ان کے سامنے سجدے کا حکم دیا۔ توبہ کے بعد انہیں زمین پر بھیجا تاکہ وہ اللہ وحدہ کی عبادت کریں۔
دعا قومه 950 سنة ليلاً ونهاراً وسراً وجهاراً بالصبر الجميل، وصنع الفلك بوحي الله لينجي الله به المؤمنين من الطوفان العظيم.|Nuh called his people to Allah for 950 years, night and day, privately and openly. By Allah’s command he built the ark, in which the believers were saved from the flood.|نوح نے ۹۵۰ سال رات دن، پوشیدہ اور علانیہ اپنی قوم کو اللہ کی طرف بلایا۔ اللہ کے حکم سے کشتی بنائی جس میں اہل ایمان طوفان سے بچ گئے۔
حطم الأصنام وجادل قومه بالبرهان العقلي، وألقي في النار فكانت برداً وسلاماً، وامتثل لأمر ذبح ابنه ففداه الله بذبح عظيم وبنى البيت الحرام.|Ibrahim challenged his people’s idols. Allah made the fire cool and safe for him, provided a sacrifice in place of his son, and Ibrahim built the Sacred House.|ابراہیم نے اپنی قوم کے بتوں کو چیلنج کیا۔ اللہ نے آگ کو ان کے لیے ٹھنڈا اور سلامتی والا بنایا اور بیٹے کے بدلے قربانی عطا کی۔ ابراہیم نے بیت اللہ تعمیر کیا۔
ألقي في البئر، وبيع بثمن بخس، وفتن في قصر العزيز فاستعصم، وسجن ظلماً، ثم مكنه الله ليصير عزيز مصر وينقذ البلاد من القحط ويعفو عن إخوته.|Yusuf was thrown into a well, sold cheaply, and imprisoned unjustly. Allah gave him authority in Egypt, where he saved the people from famine and forgave his brothers.|یوسف کو کنویں میں ڈالا گیا، کم قیمت پر بیچا گیا اور ناحق قید کیا گیا۔ اللہ نے انہیں مصر میں اختیار دیا، جہاں انہوں نے لوگوں کو قحط سے بچایا اور اپنے بھائیوں کو معاف کیا۔
ألقي رضيعاً في اليم، ورباه عدوه في قصره، وكلّمه الله في الوادي المقدس، وأيده بالمعجزات الباهرة حتى فلق له البحر وأغرق فرعون وجنوده.|Musa was placed in the river as a baby and raised in his enemy’s palace. Allah spoke to him in the sacred valley and parted the sea for him, drowning Pharaoh and his army.|موسیٰ کو شیر خوارگی میں دریا میں ڈالا گیا اور دشمن کے محل میں پرورش پائی۔ اللہ نے مقدس وادی میں ان سے کلام کیا اور سمندر کو چیر دیا، جس میں فرعون اور اس کا لشکر ڈوب گئے۔
أرسله الله شاهداً ومبشراً ونذيراً، أخرج الناس من ظلمات الجهل والشرك إلى نور التوحيد، وبلغ الرسالة وأدى الأمانة وتركنا على المحجة البيضاء.|Allah sent Muhammad ﷺ as a witness, bearer of good news, and warner. He called people to worship Allah alone and conveyed the message faithfully.|اللہ نے محمد ﷺ کو گواہ، خوش خبری دینے والا اور خبردار کرنے والا بنا کر بھیجا۔ آپ نے توحید کی دعوت دی اور امانت سے پیغام پہنچایا۔
أول من أسلم من الرجال، صدّق النبي في الإسراء والمعراج، أنفق ماله كله لله، وثبت الأمة بعد وفاة النبي ﷺ وحارب المرتدين وجمع المصحف الشريف.|Abu Bakr was among the first believers, affirmed the Night Journey, and spent his wealth for Allah. After the Prophet ﷺ died, he held the community together and had the Quran collected.|ابو بکر اولین اہل ایمان میں تھے، انہوں نے واقعۂ اسرا کی تصدیق کی اور اللہ کی راہ میں مال خرچ کیا۔ نبی ﷺ کی وفات کے بعد امت کو سنبھالا اور قرآن جمع کروایا۔
فرق الله به بين الحق والباطل، شهدت خلافته الفتوحات الكبرى (الشام، العراق، مصر، والقدس)، وأسس الدواوين والتأريخ الهجري بنظام العدل التاريخي.|Umar’s caliphate saw major conquests in the Levant, Iraq, Egypt, and Jerusalem. He established public registers and the Hijri calendar and became known for justice.|عمر کی خلافت میں شام، عراق، مصر اور بیت المقدس کی بڑی فتوحات ہوئیں۔ انہوں نے دیوان اور ہجری تقویم قائم کی اور عدل کے لیے مشہور ہوئے۔
تزوج ابنتي رسول الله ﷺ (رقية ثم أم كلثوم)، جهز جيش العسرة واشترى بئر رومة وجعلها وقفاً للمسلمين، ونسخ القرآن ووزعه على الأمصار.|Uthman married two daughters of the Prophet ﷺ, equipped the army in a time of hardship, endowed the well of Rumah, and sent copies of the Quran to the provinces.|عثمان نے نبی ﷺ کی دو صاحبزادیوں سے نکاح کیا، مشکل وقت میں لشکر کا سامان مہیا کیا، بئر رومہ وقف کیا اور قرآن کے نسخے مختلف علاقوں میں بھیجے۔
ابن عم رسول الله ﷺ وزوج فاطمة الزهراء وأبو الحسن والحسين، أول من أسلم من الصبيان، وفدى النبي ﷺ بالنوم في فراشه ليلة الهجرة.|Ali was the Prophet’s cousin, Fatimah’s husband, and the father of Hasan and Husayn. He embraced Islam as a boy and slept in the Prophet’s bed on the night of the migration.|علی نبی ﷺ کے چچا زاد، فاطمہ کے شوہر اور حسن و حسین کے والد تھے۔ بچپن میں اسلام قبول کیا اور ہجرت کی رات نبی ﷺ کے بستر پر سوئے۔
أحد الثمانية السابقين إلى الإسلام، فدى النبي ﷺ يوم أحد بجسده وترسه حتى شُلّت إصبعه الشريفة، وسماه النبي طلحة الخير وطلحة الجود لكرمه وسخائه المنقطع النظير.|Talhah was among the earliest Muslims. He shielded the Prophet ﷺ at Uhud and was known for his remarkable generosity.|طلحہ اولین مسلمانوں میں تھے۔ احد میں نبی ﷺ کی حفاظت کی اور اپنی بے مثال سخاوت کے لیے مشہور ہوئے۔
ابن عمة النبي ﷺ (صفية بنت عبد المطلب) وابن أخي خديجة، أول من سلّ سيفاً في سبيل الله وهو حدث صغير، وفارس غزوات بدر وأحد واليرموك.|Al-Zubayr was the son of Safiyyah, the Prophet’s aunt, and a nephew of Khadijah. He defended Islam from a young age and fought at Badr, Uhud, and Yarmuk.|زبیر نبی ﷺ کی پھوپھی صفیہ کے بیٹے اور خدیجہ کے بھتیجے تھے۔ کم عمری سے اسلام کا دفاع کیا اور بدر، احد اور یرموک میں شریک ہوئے۔
أحد الثمانية السابقين للإسلام، هاجر إلى المدينة معدماً فقال: «دلوني على السوق»، فبارك الله في تجارته حتى جهز الجيوش وأعتق مئات الرقاب وتصدق بقوافل كاملة.|Abd al-Rahman ibn Awf migrated to Madinah with little wealth and asked to be shown the market. Allah blessed his trade, and he used his wealth to equip armies, free enslaved people, and give to charity.|عبد الرحمن بن عوف تھوڑے مال کے ساتھ مدینہ پہنچے اور بازار کا راستہ پوچھا۔ اللہ نے تجارت میں برکت دی۔ انہوں نے لشکروں کی مدد کی، غلام آزاد کیے اور صدقہ دیا۔
خال النبي ﷺ وأول من رمى بسهم في سبيل الله، جمع له النبي أبويه في أحد: «ارمِ فداك أبي وأمي»، وقاد جيوش المسلمين في معركة القادسية وفتح المدائن.|Sa’d ibn Abi Waqqas was among the earliest defenders of Islam. The Prophet ﷺ encouraged him at Uhud, and he later commanded the Muslims at Al-Qadisiyyah.|سعد بن ابی وقاص اسلام کے ابتدائی محافظوں میں تھے۔ نبی ﷺ نے احد میں ان کی حوصلہ افزائی کی اور بعد میں انہوں نے قادسیہ میں مسلمانوں کی قیادت کی۔
ابن زيد بن عمرو بن نفيل الباحث عن ملة إبراهيم، زوج فاطمة أخت عمر بن الخطاب وكان سبباً في إسلامه، شهد اليرموك وكان من أشجع فرسان المسلمين.|Sa’id ibn Zayd was the son of Zayd ibn Amr, who sought the faith of Ibrahim. He married Umar’s sister Fatimah and was a courageous fighter at Yarmuk.|سعید بن زید، زید بن عمرو کے بیٹے تھے جو ملتِ ابراہیم کے طالب تھے۔ انہوں نے عمر کی بہن فاطمہ سے نکاح کیا اور یرموک میں بہادری سے لڑے۔
عامر بن عبد الله بن الجراح، لقبه النبي ﷺ بأمين الأمة، فدى النبي بأسنانه يوم أحد لنزع حلقتي الدرع من وجنته الشريفة، وقاد فتوحات الشام بحكمة وتواضع أذهل التاريخ.|Abu Ubaydah ibn al-Jarrah was called the trustee of the Ummah by the Prophet ﷺ. He helped the Prophet at Uhud and later led the campaigns in the Levant with wisdom and humility.|ابو عبیدہ بن جراح کو نبی ﷺ نے امینِ امت کہا۔ انہوں نے احد میں نبی ﷺ کی مدد کی اور بعد میں شام کی مہمات میں حکمت اور عاجزی سے قیادت کی۔
`.trim().split('\n');
 interfaceRows.forEach(row=>{const [ar,en,ur]=row.split('|');dictionary[ar]={en,ur};});
 const juzOrdinals=['الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر','الحادي عشر','الثاني عشر','الثالث عشر','الرابع عشر','الخامس عشر','السادس عشر','السابع عشر','الثامن عشر','التاسع عشر','العشرون','الحادي والعشرون','الثاني والعشرون','الثالث والعشرون','الرابع والعشرون','الخامس والعشرون','السادس والعشرون','السابع والعشرون','الثامن والعشرون','التاسع والعشرون','الثلاثون'];
 juzOrdinals.forEach((name,index)=>{dictionary['الجزء '+name]={en:'Juz '+(index+1),ur:'پارہ '+(index+1)};});
 // These words also name surahs. Ordinary day and prayer labels use their own
 // meanings; the translation engine handles explicit surah references separately.
 dictionary['الجمعة']={en:'Friday',ur:'جمعہ'};
 dictionary['الفجر']={en:'Fajr',ur:'فجر'};
 dictionary['العصر']={en:'Asr',ur:'عصر'};
 root.ZadTranslations=dictionary;
 Object.assign(dictionary,{
  'د. نايف بن نهار | بودكاست بدون ورق':{en:'Dr. Nayef bin Nahar • Bedoon Waraq Podcast',ur:'ڈاکٹر نایف بن نہار • بدون ورق پوڈکاسٹ'},
  'أ. أحمد السيد | فداء الدين':{en:'Ahmed Al-Sayed • Fida Al-Din',ur:'احمد السید • فداء الدین'},
  'الشيخ أمجد سمير | بودكاست مُبصر':{en:'Sheikh Amjad Samir • Mubsir Podcast',ur:'شیخ امجد سمیر • مبصر پوڈکاسٹ'},
  'نعمة التوبة | تخيّل حياتك بلا توبة - مجالس الشباب':{en:'The blessing of repentance • Imagine life without repentance — Youth gatherings',ur:'توبہ کی نعمت • توبہ کے بغیر زندگی کا تصور — نوجوانوں کی مجالس'},
  'كيف تعيش حياة بدون شقاء | أسرار الطمأنينة والسعادة':{en:'How can you live without misery? Finding peace and happiness',ur:'پریشانی کے بغیر زندگی کیسے گزاریں؟ اطمینان اور خوشی کے راز'},
  'سياسة الخصوصية | تطبيق زاد المسلم':{en:'Privacy policy | Zad Al Muslim',ur:'رازداری کی پالیسی | زاد المسلم'},
  'مشغل المرئيات | زاد المسلم':{en:'Video player | Zad Al Muslim',ur:'ویڈیو پلیئر | زاد المسلم'},
  '🕌 فضل يوم الجمعة وساعة الاستجابة':{en:'🕌 The virtues of Friday and the hour of answered prayer',ur:'🕌 جمعہ کی فضیلت اور دعا کی قبولیت کی گھڑی'},
  'تطبيق إسلامي متاح مجاناً لوجه الله تعالى •':{en:'A free Islamic app for the sake of Allah •',ur:'اللہ کی رضا کے لیے مفت اسلامی ایپ •'},
  'صدقة جارية بإذن الله عن':{en:'An ongoing charity, insha’Allah, on behalf of',ur:'ان شاء اللہ صدقہ جاریہ، ان کی طرف سے'},
  'إذاعة القرآن الكريم':{en:'Quran radio',ur:'قرآن ریڈیو'},
  'زاد المسلم • رفيق طاعاتك اليومية وصدقة جارية بإذن الله.':{en:'Zad Al Muslim • Your daily worship companion and an ongoing charity, insha’Allah.',ur:'زاد المسلم • روزانہ عبادت کا ساتھی اور ان شاء اللہ صدقہ جاریہ۔'},
  'رواه مسلم':{en:'Narrated by Muslim',ur:'صحیح مسلم'},
  'متفق عليه':{en:'Agreed upon',ur:'متفق علیہ'},
  'لا تنسونا من صالح دعائكم':{en:'Please remember us in your duas',ur:'ہمیں اپنی دعاؤں میں یاد رکھیں'},
  'جزاكم الله خيرًا على زيارتكم وصالح دعواتكم لهما.':{en:'Thank you for visiting and remembering them in your duas.',ur:'تشریف لانے اور ان کے لیے دعا کرنے کا شکریہ۔'}
 });
 Object.assign(dictionary,{
  "صيام فريضة شهر رمضان": {
    "en": "Observing the Ramadan fast",
    "ur": "رمضان کا فرض روزہ"
  },
  "ليالي شهر رمضان المبارك": {
    "en": "Blessed nights of Ramadan",
    "ur": "رمضان کی بابرکت راتیں"
  },
  "أيام النفحات والبركات والقرآن، نسأل الله أن يرحم فقيدنا ويجعل صيامه وقيامه نوراً في قبره.": {
    "en": "Days of blessings and Quran recitation. May Allah have mercy on our departed loved one and make his fasting and night prayers a light in his grave.",
    "ur": "یہ برکتوں اور تلاوت قرآن کے دن ہیں۔ اللہ ہمارے مرحوم پر رحم فرمائے اور ان کے روزوں اور قیام کو ان کی قبر کا نور بنائے۔"
  },
  "صيام الأيام البيض المباركة 🌕": {
    "en": "Fasting on the White Days 🌕",
    "ur": "ایام بیض کے روزے 🌕"
  },
  "صيام ثلاثة أيام من كل شهر تعدل صيام الدهر كله كما أخبر النبي ﷺ.": {
    "en": "The Prophet (peace be upon him) taught that fasting three days each month is like fasting throughout the year.",
    "ur": "نبی کریم نے فرمایا کہ ہر مہینے تین روزے رکھنا پورے سال کے روزوں کی مانند ہے۔"
  },
  "يوم عرفة المبارك 🕋": {
    "en": "Blessed Day of Arafah 🕋",
    "ur": "عرفہ کا بابرکت دن 🕋"
  },
  "صيام يوم عرفة": {
    "en": "Fasting on the Day of Arafah",
    "ur": "عرفہ کے دن کا روزہ"
  },
  "يكفر السنة الماضية والباقية، وأعظم أيام الدعاء والرجاء.": {
    "en": "Fasting on this day expiates sins of the previous and following years. It is a day of supplication and hope.",
    "ur": "اس دن کا روزہ پچھلے اور اگلے سال کے گناہوں کا کفارہ ہے۔ یہ دعا اور امید کا دن ہے۔"
  },
  "عاشوراء المبارك 🌊": {
    "en": "Blessed Ashura 🌊",
    "ur": "عاشورا کا بابرکت دن 🌊"
  },
  "صيام يوم عاشوراء": {
    "en": "Fasting on Ashura",
    "ur": "عاشورا کا روزہ"
  },
  "صيام يوم تاسوعاء": {
    "en": "Fasting on Tasu’a",
    "ur": "تاسوعا کا روزہ"
  },
  "صيام يوم عاشوراء يكفر ذنوب سنة ماضية، نسأل الله القبول لفقيدنا ولكم.": {
    "en": "Fasting on Ashura expiates sins of the previous year. May Allah accept the deeds of our departed loved one and yours.",
    "ur": "عاشورا کا روزہ پچھلے سال کے گناہوں کا کفارہ ہے۔ اللہ ہمارے مرحوم اور آپ کے اعمال قبول فرمائے۔"
  },
  "سنة صيام يوم الاثنين 🌿": {
    "en": "Sunnah of fasting on Monday 🌿",
    "ur": "پیر کے روزے کی سنت 🌿"
  },
  "صيام يوم الاثنين المبارك": {
    "en": "Fasting on Monday",
    "ur": "پیر کا روزہ"
  },
  "سنة صيام يوم الخميس 🌿": {
    "en": "Sunnah of fasting on Thursday 🌿",
    "ur": "جمعرات کے روزے کی سنت 🌿"
  },
  "صيام يوم الخميس المبارك": {
    "en": "Fasting on Thursday",
    "ur": "جمعرات کا روزہ"
  },
  "قال ﷺ: 'تُعرض الأعمال يوم الاثنين والخميس، فأحب أن يُعرض عملي وأنا صائم'.": {
    "en": "The Prophet (peace be upon him) said: Deeds are presented on Mondays and Thursdays, and I like my deeds to be presented while I am fasting.",
    "ur": "نبی کریم نے فرمایا: اعمال پیر اور جمعرات کو پیش کیے جاتے ہیں اور میں پسند کرتا ہوں کہ میرا عمل روزے کی حالت میں پیش ہو۔"
  },
  "المتبقي على أذان المغرب والإفطار 🌅:": {
    "en": "Time until Maghrib and iftar 🌅:",
    "ur": "مغرب اور افطار تک باقی وقت 🌅:"
  },
  "المتبقي على أذان الفجر والإمساك 🌙:": {
    "en": "Time until Fajr and the start of fasting 🌙:",
    "ur": "فجر اور روزہ شروع ہونے تک باقی وقت 🌙:"
  },
  "باسمك ربي وضعت جنبي وبك أرفعه": {
    "en": "In Your name, my Lord, I lie down, and by You I rise.",
    "ur": "اے میرے رب، تیرے نام سے میں لیٹتا ہوں اور تیری مدد سے اٹھتا ہوں۔"
  },
  "اللهم صلِّ وسلِّم وبارك على نبينا محمد ﷺ": {
    "en": "O Allah, send blessings, peace and favor upon our Prophet Muhammad.",
    "ur": "اے اللہ، ہمارے نبی محمد پر درود، سلام اور برکت نازل فرما۔"
  },
  "ﷺ صلِّ على النبي": {
    "en": "Send blessings upon the Prophet",
    "ur": "نبی کریم پر درود بھیجیں"
  },
  "تذكير بسورة الكهف والصلاة على النبي ﷺ": {
    "en": "A reminder to recite Surah Al-Kahf and send blessings upon the Prophet.",
    "ur": "سورۃ الکہف کی تلاوت اور نبی کریم پر درود کی یاد دہانی۔"
  },
  "تجربة إشعار الأذان": {
    "en": "Test adhan notification",
    "ur": "اذان کی آزمائشی اطلاع"
  },
  "🔊 سماع الأذان كاملاً": {
    "en": "🔊 Listen to the full adhan",
    "ur": "🔊 مکمل اذان سنیں"
  },
  "حدّث تطبيق الهاتف لتفعيل التذكيرات المستمرة": {
    "en": "Update the mobile app to enable recurring reminders.",
    "ur": "بار بار آنے والی یاد دہانیاں فعال کرنے کے لیے موبائل ایپ اپ ڈیٹ کریں۔"
  },
  "تعذّرت جدولة تذكيرات أندرويد": {
    "en": "Could not schedule Android reminders.",
    "ur": "اینڈرائیڈ کی یاد دہانیاں مقرر نہیں ہو سکیں۔"
  }
});
 Object.assign(dictionary,{
  "⏳ اختبار التنبيه المسبق للصلاة": {
    "en": "⏳ Test upcoming prayer alert",
    "ur": "⏳ نماز سے پہلے کی آزمائشی اطلاع"
  },
  "🕌 اختبار الأذان في الخلفية": {
    "en": "🕌 Test adhan in the background",
    "ur": "🕌 پس منظر میں اذان آزمائیں"
  },
  "اقتربت الصلاة، تَهَيّأْ للوضوء والصلاة وأَقْبِلْ على الله بقلب خاشع 🌿": {
    "en": "Prayer time is approaching. Prepare for wudu and prayer with a humble heart. 🌿",
    "ur": "نماز کا وقت قریب ہے۔ وضو اور نماز کی تیاری کریں اور خشوع کے ساتھ اللہ کی طرف متوجہ ہوں۔ 🌿"
  },
  "الله أكبر، الله أكبر.. حيّ على الصلاة، حيّ على الفلاح 🕋": {
    "en": "Allah is the Greatest, Allah is the Greatest. Come to prayer, come to success. 🕋",
    "ur": "اللہ سب سے بڑا ہے، اللہ سب سے بڑا ہے۔ نماز کی طرف آؤ، کامیابی کی طرف آؤ۔ 🕋"
  }
});
})(window);
