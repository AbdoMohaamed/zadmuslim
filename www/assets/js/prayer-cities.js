window.ZadPrayerCities = {
    // المملكة العربية السعودية (طريقة أم القرى: method 4)
    Riyadh: { city: "Riyadh", country: "Saudi Arabia", method: 4 },
    Makkah: { city: "Makkah", country: "Saudi Arabia", method: 4 },
    Madinah: { city: "Medina", country: "Saudi Arabia", method: 4 },
    Jeddah: { city: "Jeddah", country: "Saudi Arabia", method: 4 },
    Dammam: { city: "Dammam", country: "Saudi Arabia", method: 4 },

    // جمهورية مصر العربية (الهيئة المصرية العامة للمساحة: method 5)
    Cairo: { city: "Cairo", country: "Egypt", method: 5 },
    Alexandria: { city: "Alexandria", country: "Egypt", method: 5 },
    Giza: { city: "Giza", country: "Egypt", method: 5 },
    Mansoura: { city: "Mansoura", country: "Egypt", method: 5 },
    Tanta: { city: "Tanta", country: "Egypt", method: 5 },
    Zagazig: { city: "Zagazig", country: "Egypt", method: 5 },
    Assiut: { city: "Assiut", country: "Egypt", method: 5 },

    // العواصم والمدن الإسلامية
    Jerusalem: { city: "Jerusalem", country: "Palestine", method: 3 },
    Dubai: { city: "Dubai", country: "United Arab Emirates", method: 16 },
    Kuwait: { city: "Kuwait", country: "Kuwait", method: 9 },
    Doha: { city: "Doha", country: "Qatar", method: 10 },
    Amman: { city: "Amman", country: "Jordan", method: 3 },
"Abu Dhabi": {"city":"Abu Dhabi","country":"United Arab Emirates","method":16},
"Beirut": {"city":"Beirut","country":"Lebanon","method":3},
"Baghdad": {"city":"Baghdad","country":"Iraq","method":3},
"Damascus": {"city":"Damascus","country":"Syria","method":3},
"Muscat": {"city":"Muscat","country":"Oman","method":8},
"Manama": {"city":"Manama","country":"Bahrain","method":8},
"Tunis": {"city":"Tunis","country":"Tunisia","method":3},
"Algiers": {"city":"Algiers","country":"Algeria","method":3},
"Rabat": {"city":"Rabat","country":"Morocco","method":3},
"Tripoli": {"city":"Tripoli","country":"Libya","method":3},
"Khartoum": {"city":"Khartoum","country":"Sudan","method":3},
"London": {"city":"London","country":"United Kingdom","method":3},
"Paris": {"city":"Paris","country":"France","method":3},
"New York": {"city":"New York","country":"United States","method":2},
"Istanbul": {"city":"Istanbul","country":"Turkey","method":13}
};
Object.entries({"Cairo":"القاهرة (مصر)","Alexandria":"الإسكندرية (مصر)","Giza":"الجيزة (مصر)","Riyadh":"الرياض (السعودية)","Makkah":"مكة المكرمة (السعودية)","Madinah":"المدينة المنورة (السعودية)","Dubai":"دبي (الإمارات)","Abu Dhabi":"أبو ظبي (الإمارات)","Kuwait":"الكويت","Doha":"الدوحة (قطر)","Amman":"عمان (الأردن)","Beirut":"بيروت (لبنان)","Baghdad":"بغداد (العراق)","Damascus":"دمشق (سوريا)","Jerusalem":"القدس الشريف (فلسطين)","Muscat":"مسقط (عمان)","Manama":"المنامة (البحرين)","Tunis":"تونس","Algiers":"الجزائر","Rabat":"الرباط (المغرب)","Tripoli":"طرابلس (ليبيا)","Khartoum":"الخرطوم (السودان)","London":"لندن (بريطانيا)","Paris":"باريس (فرنسا)","New York":"نيويورك (أمريكا)","Istanbul":"إسطنبول (تركيا)"}).forEach(([key, label]) => { if (window.ZadPrayerCities[key]) window.ZadPrayerCities[key].label = label; });
