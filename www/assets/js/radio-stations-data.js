/**
 * قائمة إذاعات القرآن الكريم المباشرة 24/7 والتلاوات الخاشعة
 * روابط بث صوتي مباشرة ومستقرة وسريعة تعمل عالمياً دون انقطاع
 */

const RADIO_STATIONS_LIST = [
    {
        id: "general",
        name: "إذاعة القرآن الكريم العامة (كبار القراء)",
        desc: "بث مباشر مستقر 24/7 لنخبة من مشاهير القراء في العالم الإسلامي",
        url: "https://qurango.net/radio/mix",
        backupUrl: "https://backup.qurango.net/radio/mix",
        icon: "fa-solid fa-tower-broadcast",
        badge: "مستقر 24/7"
    },
    {
        id: "ali_jaber",
        name: "تلاوات الشيخ علي جابر (رحمه الله)",
        desc: "تلاوات خاشعة نادرة ومؤثرة من محراب الحرم المكي الشريف 24/7",
        url: "https://qurango.net/radio/ali_jaber",
        backupUrl: "https://backup.qurango.net/radio/ali_jaber",
        icon: "fa-solid fa-microphone-lines",
        badge: "الحرم المكي"
    },
    {
        id: "abdullah_almousa",
        name: "تلاوات الشيخ عبد الله الموسى",
        desc: "تلاوات ندية خاشعة ومؤثرة برواية حفص عن عاصم 24/7",
        url: "https://qurango.net/radio/abdullah_almousa",
        backupUrl: "https://backup.qurango.net/radio/abdullah_almousa",
        icon: "fa-solid fa-microphone-lines",
        badge: "تلاوات ندية"
    },
    {
        id: "minshawi",
        name: "تلاوات الشيخ محمد صديق المنشاوي",
        desc: "المصحف المرتل الخاشع برواية حفص عن عاصم",
        url: "https://qurango.net/radio/mohammed_siddiq_alminshawi",
        backupUrl: "https://backup.qurango.net/radio/mohammed_siddiq_alminshawi",
        icon: "fa-solid fa-microphone-lines",
        badge: "المصحف المرتل"
    },
    {
        id: "abdulbasit",
        name: "تلاوات الشيخ عبد الباسط عبد الصمد",
        desc: "تلاوات مجودة ومرتلة نادرة برواية حفص",
        url: "https://qurango.net/radio/abdulbasit_abdulsamad_mojawwad",
        backupUrl: "https://backup.qurango.net/radio/abdulbasit_abdulsamad_mojawwad",
        icon: "fa-solid fa-microphone-lines",
        badge: "صوت مكة"
    },
    {
        id: "alafasy",
        name: "تلاوات الشيخ مشاري بن راشد العفاسي",
        desc: "المصحف المرتل برواية حفص عن عاصم",
        url: "https://qurango.net/radio/mishary_alafasi",
        backupUrl: "https://backup.qurango.net/radio/mishary_alafasi",
        icon: "fa-solid fa-microphone-lines",
        badge: "مرتل كامل"
    },
    {
        id: "khalid_aljileel",
        name: "تلاوات الشيخ خالد الجليل",
        desc: "تلاوات خاشعة ومبكية برواية حفص عن عاصم 24/7",
        url: "https://qurango.net/radio/khalid_aljileel",
        backupUrl: "https://backup.qurango.net/radio/khalid_aljileel",
        icon: "fa-solid fa-microphone-lines",
        badge: "تلاوات خاشعة"
    },
    {
        id: "maher",
        name: "تلاوات الشيخ ماهر المعيقلي",
        desc: "المصحف المرتل كاملاً من الحرم المكي الشريف",
        url: "https://qurango.net/radio/maher",
        backupUrl: "https://backup.qurango.net/radio/maher",
        icon: "fa-solid fa-microphone-lines",
        badge: "إمام الحرم"
    },
    {
        id: "yasser",
        name: "تلاوات الشيخ ياسر الدوسري",
        desc: "تلاوات خاشعة مرتلة من الحرم المكي الشريف",
        url: "https://qurango.net/radio/yasser_aldosari",
        backupUrl: "https://backup.qurango.net/radio/yasser_aldosari",
        icon: "fa-solid fa-microphone-lines",
        badge: "الحرم المكي"
    },
    {
        id: "bader_alturki",
        name: "تلاوات الشيخ بدر التركي",
        desc: "تلاوات ندية خاشعة ومؤثرة برواية حفص عن عاصم 24/7",
        url: "https://backup.qurango.net/radio/bader",
        backupUrl: "https://qurango.net/radio/bader",
        icon: "fa-solid fa-microphone-lines",
        badge: "تلاوات ندية"
    },
    {
        id: "cairo",
        name: "إذاعة القرآن الكريم من القاهرة",
        desc: "بث مباشر رسمي ومستمر على مدار 24 ساعة (مع تحويل بديل تلقائي)",
        url: "https://stream.radiojar.com/8s5u5tpdtwzuv",
        backupUrl: "https://qurango.net/radio/mix",
        icon: "fa-solid fa-tower-broadcast",
        badge: "القاهرة"
    },
    {
        id: "makkah",
        name: "إذاعة القرآن الكريم من مكة المكرمة",
        desc: "بث مباشر رسمي لتلاوات الحرم المكي والمسجد النبوي",
        url: "https://stream.radiojar.com/0tpy1h0kxtzuv",
        backupUrl: "https://qurango.net/radio/mix",
        icon: "fa-solid fa-kaaba",
        badge: "مكة المكرمة"
    },
    {
        id: "roqya",
        name: "إذاعة الرقية الشرعية للشفاء والتحصين",
        desc: "آيات الرقية الشرعية وأدعية الشفاء مكررة 24/7",
        url: "https://qurango.net/radio/roqiah",
        backupUrl: "https://backup.qurango.net/radio/roqiah",
        icon: "fa-solid fa-shield-halved",
        badge: "تحصين وشفاء"
    },
    {
        id: "sleep_calm",
        name: "تلاوات هادئة للسكينة والنوم والاسترخاء",
        desc: "تلاوات مبكية خاشعة لتهدئة النفس وجلب النوم والسكينة",
        url: "https://qurango.net/radio/tarateel",
        backupUrl: "https://backup.qurango.net/radio/tarateel",
        icon: "fa-solid fa-bed",
        badge: "سكينة ونوم"
    }
];

// تصدير أو إتاحة في النطاق العام
if (typeof window !== "undefined") {
    window.RADIO_STATIONS_LIST = RADIO_STATIONS_LIST;
}
