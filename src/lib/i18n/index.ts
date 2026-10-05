export type SupportedLanguage = "id" | "en";

export interface LanguageOption {
  id: SupportedLanguage;
  localeCode: string;
  name: string;
  label: string;
  description: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    id: "en",
    localeCode: "en-US",
    name: "English",
    label: "English",
    description: "English (Default)",
    flag: "🇬🇧"
  },
  {
    id: "id",
    localeCode: "id-ID",
    name: "Bahasa Indonesia",
    label: "Bahasa Indonesia",
    description: "Bahasa Indonesia",
    flag: "🇮🇩"
  }
];

export function resolveLanguage(locale?: string): SupportedLanguage {
  if (!locale) return "en";
  const lower = locale.toLowerCase();
  if (lower.startsWith("id")) return "id";
  return "en";
}

export const translations = {
  id: {
    // Navigation
    nav_today: "Hari ini",
    nav_history: "Riwayat",
    nav_settings: "Pengaturan",

    // Common
    save: "Simpan",
    cancel: "Batal",
    close: "Tutup",
    delete: "Hapus",
    hours: "Jam",
    minutes: "Menit",

    // Settings Header & Sections
    settings_title: "Pengaturan",
    section_targets: "Target & reminder",
    section_preferences: "Preferensi",
    section_profile: "Profil pengguna",
    section_data_privacy: "Data & privasi",

    // Settings Menu Items
    menu_daily_target: "Target Harian",
    target_mode_auto: "Otomatis",
    target_mode_manual: "Manual",
    menu_auto_reminder: "Reminder Otomatis",
    menu_auto_reminder_desc: "Menyesuaikan sisa waktu & target",
    menu_notifications: "Notifikasi Perangkat",
    push_status_active: "Web Push aktif",
    push_status_inactive: "Belum aktif",
    menu_wake_time: "Waktu Mulai",
    menu_sleep_time: "Waktu Selesai",
    menu_language: "Pilihan Bahasa",
    menu_language_short: "Bahasa",
    menu_profile: "Profil",
    menu_activity: "Tingkat Aktivitas",
    menu_environment: "Kondisi Lingkungan",
    menu_formula: "Rumus Perhitungan",
    menu_formula_desc: "Cara target dihitung",
    menu_device_data: "Data Perangkat",
    menu_device_data_desc: "IndexedDB lokal",
    menu_privacy: "Privasi",
    menu_privacy_desc: "Local-first",
    menu_reset: "Reset aplikasi",
    menu_reset_desc: "Hapus semua data lokal",

    // Language Sheet
    language_sheet_title: "Pilihan Bahasa",
    lang_id_title: "Bahasa Indonesia",
    lang_id_desc: "Bawaan (Default)",
    lang_en_title: "English",
    lang_en_desc: "Bahasa Inggris",

    // Subpage Titles & Descs
    subpage_profile_title: "Profil Pengguna",
    subpage_profile_desc: "Ubah data dasar yang digunakan oleh mesin perhitungan IngatMinum.",
    subpage_activity_title: "Tingkat Aktivitas",
    subpage_activity_desc: "Dipakai sebagai konteks, bukan multiplier cairan otomatis.",
    subpage_environment_title: "Kondisi Lingkungan",
    subpage_environment_desc: "Pilih kondisi yang paling sering Anda alami.",
    subpage_data_title: "Data Perangkat",
    subpage_data_desc: "Data utama disimpan lokal menggunakan IndexedDB.",
    subpage_privacy_title: "Privasi",
    subpage_privacy_desc: "Prinsipnya: simpan sesedikit mungkin data di server.",
    subpage_formula_title: "Rumus Perhitungan",
    subpage_formula_desc: "Cara aplikasi menentukan referensi total air dan estimasi target air putih.",
    subpage_push_title: "Notifikasi Perangkat",
    subpage_push_desc: "Web Push memungkinkan reminder muncul ketika PWA tidak sedang terbuka.",

    // Subpage Data
    data_indexeddb_desc: "Profil, histori minum, target, dan pengaturan berada di perangkat ini.",
    data_storage_label: "Penyimpanan",
    data_storage_active: "Aktif",
    data_storage_browser: "Dikelola browser",
    data_export_btn: "Ekspor backup JSON",
    data_import_btn: "Impor backup JSON",

    // Subpage Privacy
    privacy_local_title: "Data utama tetap lokal",
    privacy_local_desc: "Profil, histori konsumsi, target, dan statistik tidak perlu dikirim ke Netlify.",
    privacy_push_title: "Web Push minimum",
    privacy_push_desc: "Jika diaktifkan, server hanya menyimpan subscription anonim dan jadwal reminder minimum.",

    // Subpage Formula
    formula_step1_badge: "Langkah 1",
    formula_step1_title: "Referensi total air",
    formula_step1_desc: "Aplikasi memilih nilai referensi berdasarkan kelompok usia dan jenis kelamin.",
    formula_table_title: "Acuan Kebutuhan Cairan Total (AKG 2019)",
    formula_col_group: "Kelompok",
    formula_col_total: "Total ml/hari",
    formula_age_0_5_months: "0–5 bulan",
    formula_age_6_11_months: "6–11 bulan",
    formula_age_1_3_years: "1–3 tahun",
    formula_age_4_6_years: "4–6 tahun",
    formula_age_7_9_years: "7–9 tahun",
    formula_age_10_12_years: "10–12 tahun",
    formula_age_13_15_years: "13–15 tahun",
    formula_age_16_18_years: "16–18 tahun",
    formula_age_19_64_years: "19–64 tahun",
    formula_age_65_80_years: "65–80 tahun",
    formula_age_gt_80_years: ">80 tahun",
    formula_step2_badge: "Langkah 2",
    formula_step2_title: "Tambahan kondisi khusus",
    formula_pregnant: "Hamil:",
    formula_pregnant_desc: "+300 ml/hari pada trimester 1, 2, maupun 3.",
    formula_breastfeeding_0_6: "Menyusui 0–6 bulan:",
    formula_breastfeeding_0_6_desc: "+800 ml/hari.",
    formula_breastfeeding_7_12: "Menyusui 7–12 bulan:",
    formula_breastfeeding_7_12_desc: "+650 ml/hari.",
    formula_step3_badge: "Langkah 3",
    formula_step3_title: "Estimasi target air putih",
    formula_water_target: "Target air putih",
    formula_formula_calc: "80% × referensi total air",
    formula_round_note: "Hasil dibulatkan ke 50 ml terdekat.",
    formula_calc_example: "Contoh: referensi total air 2.500 ml → 2.500 × 80% = 2.000 ml target air putih.",
    formula_disclaimer: "Angka 80% adalah estimasi aplikasi untuk memisahkan target air putih dari referensi total air; bukan angka target air putih resmi dari Kemenkes.",
    formula_special_rules_title: "Aturan khusus",
    formula_rule_0_5_title: "0–5 bulan:",
    formula_rule_0_5_desc: "aplikasi tidak menetapkan target air putih.",
    formula_rule_6_11_title: "6–11 bulan:",
    formula_rule_6_11_desc: "mode caregiver menampilkan kisaran informasi 120–240 ml dan tidak memakai target-chasing reminder.",
    formula_rule_doctor_title: "Pembatasan cairan dari dokter:",
    formula_rule_doctor_desc: "target otomatis dimatikan dan aplikasi memakai target manual dari tenaga kesehatan.",
    formula_rule_activity_title: "Aktivitas dan cuaca panas:",
    formula_rule_activity_desc: "dicatat sebagai konteks, tetapi v1 tidak menambahkan multiplier ml otomatis.",

    // Subpage Push
    push_active_title: "Web Push aktif",
    push_inactive_title: "Web Push belum aktif",
    push_permission_label: "Permission",
    push_not_checked: "belum dicek",
    push_ios_instruction: "Pada iPhone/iPad, install aplikasi ke Home Screen terlebih dahulu.",
    push_btn_disable: "Nonaktifkan Web Push",
    push_btn_enable: "Aktifkan Web Push",
    push_dev_note: "Pada npm run dev biasa, service worker production belum aktif. Pengujian Web Push dilakukan melalui Netlify.",

    // Profile options
    user_type_label: "Jenis pengguna",
    user_type_child: "Anak",
    user_type_teen: "Remaja",
    user_type_adult: "Dewasa",
    user_type_older_adult: "Lansia",
    user_type_pregnant: "Hamil",
    user_type_breastfeeding: "Menyusui",

    age_label: "Usia",
    age_unit_years: "tahun",
    age_unit_months: "bulan",

    sex_label: "Jenis kelamin",
    sex_male: "Laki-laki",
    sex_female: "Perempuan",

    trimester_label: "Trimester",
    lactation_label: "Periode menyusui",
    lactation_0_6: "0–6 bulan",
    lactation_7_12: "7–12 bulan",

    weight_label: "Berat badan (opsional)",
    weight_empty: "Tidak diisi",

    fluid_restriction_label: "Pembatasan cairan dari dokter",
    yes: "Ya",
    no: "Tidak",
    medical_target_label: "Target dari tenaga kesehatan",

    // Units
    unit_ml_per_day: "ml/hari",

    // Sheets
    sheet_target_title: "Target harian",
    sheet_wake_title: "Waktu Mulai",
    sheet_sleep_title: "Waktu Selesai",
    schedule_invalid_msg: "Waktu Mulai dan Waktu Selesai tidak boleh sama.",

    // Modals
    modal_reset_title: "Reset Aplikasi?",
    modal_reset_msg: "Seluruh data akan dihapus permanen dari perangkat ini. Tindakan ini tidak dapat dibatalkan.",
    modal_reset_confirm: "Hapus Data",

    modal_export_title: "Ekspor Backup Data",
    modal_export_msg: "File backup JSON berisi profil, histori minum, dan pengaturan yang tersimpan di perangkat ini.",
    modal_export_confirm: "Unduh File",
    export_format_label: "Format",
    export_format_value: "JSON (Lokal)",
    export_filename_label: "Nama file",

    modal_import_title: "Pulihkan Data Backup?",
    modal_import_msg: "Data saat ini akan digantikan dengan data dari file backup.",
    modal_import_confirm: "Pulihkan Data",

    // Today View
    today_title: "IngatMinum",
    today_badge: "Hari Ini",
    today_header_of: "dari",
    today_target_suffix: "target",
    today_future_not_started: "Hari mendatang belum dimulai",
    today_btn_custom: "Kustom",
    today_custom_add: "Tambah kustom",
    today_quick_add: "Minum cepat",
    today_quick_button: "Minum",
    today_water: "Air Putih",
    today_next_reminder: "Pengingat berikutnya",
    today_reminder_next: "Reminder berikutnya :",
    today_reminder_at: "pukul",
    today_reminder_quiet: "Tidak mengejar target menjelang tidur",
    today_reminder_complete: "Target hari ini selesai",
    today_reminder_none: "Tidak ada reminder aktif",
    today_reminder_future: "Rencana reminder akan aktif pada hari tersebut",
    today_progress_reached: "Target harian tercapai",
    today_progress_label: "Pencapaian:",
    today_progress_of_target: "dari target harian",
    today_intakes_title: "Minum hari ini",
    today_intakes_history_title: "Catatan minum",
    today_records_count: "catatan",
    today_empty_today: "Anda belum minum hari ini, segera penuhi kebutuhan cairan harian Anda!",
    today_empty_future: "Belum ada catatan minum untuk hari mendatang.",
    today_empty_past: "Tidak ada catatan minum pada tanggal ini.",
    today_delete_record_aria: "Hapus catatan",
    today_close_notice_aria: "Tutup pesan",
    today_infant_title: "Tidak ada target air putih",
    today_infant_desc: "Untuk usia 0–5 bulan, aplikasi tidak memberikan target air putih atau reminder adaptif.",
    today_caregiver_badge: "Mode caregiver",
    today_caregiver_desc: "Kisaran air putih informasional. Aplikasi tidak memakai streak atau reminder target-chasing untuk usia ini.",
    today_target_reached: "Target tercapai!",
    portion_glass: "Gelas biasa",
    portion_mug: "Mug meja",
    portion_tumbler_medium: "Tumbler sedang",
    portion_bottle_medium: "Botol sedang",
    portion_tumbler_large: "Tumbler besar",
    portion_bottle_large: "Botol 1 liter",
    quick_add_sheet_title: "Porsi Tambah Cepat",
    quick_add_sheet_desc: "Pilih atau tentukan takaran porsi default untuk tombol tambah cepat di halaman utama.",
    quick_add_custom_label: "Kustom takaran (ml)",

    // History View
    history_title: "Riwayat",
    history_7_days: "7 hari",
    history_30_days: "30 hari",
    history_average: "Rata-rata",
    history_reached_days: "Hari tercapai",
    history_streak: "Streak",
    history_summary: "Ringkasan",
    history_avg_consumption: "Rata-rata konsumsi",
    history_last_days: "hari terakhir",
    history_note: "Hari dianggap tercapai untuk streak pada ≥90% target. Progress di atas 100% tidak mendapat reward tambahan.",

    // Toasts
    toast_added: "ditambahkan",
    toast_deleted: "Catatan dihapus",
    toast_profile_saved: "Profil tersimpan",
    toast_settings_saved: "Pengaturan tersimpan",
    toast_quick_add_saved: "Porsi tombol cepat",
    toast_backup_downloaded: "Backup berhasil diunduh",
    toast_backup_imported: "Backup diimpor"
  },
  en: {
    // Navigation
    nav_today: "Today",
    nav_history: "History",
    nav_settings: "Settings",

    // Common
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    delete: "Delete",
    hours: "Hours",
    minutes: "Minutes",

    // Settings Header & Sections
    settings_title: "Settings",
    section_targets: "Targets & reminders",
    section_preferences: "Preferences",
    section_profile: "User profile",
    section_data_privacy: "Data & privacy",

    // Settings Menu Items
    menu_daily_target: "Daily Target",
    target_mode_auto: "Automatic",
    target_mode_manual: "Manual",
    menu_auto_reminder: "Automatic Reminder",
    menu_auto_reminder_desc: "Adjusts to remaining time & target",
    menu_notifications: "Device Notifications",
    push_status_active: "Web Push active",
    push_status_inactive: "Inactive",
    menu_wake_time: "Wake Time",
    menu_sleep_time: "Sleep Time",
    menu_language: "Language Selection",
    menu_language_short: "Language",
    menu_profile: "Profile",
    menu_activity: "Activity Level",
    menu_environment: "Environment Condition",
    menu_formula: "Calculation Formula",
    menu_formula_desc: "How target is calculated",
    menu_device_data: "Device Data",
    menu_device_data_desc: "Local IndexedDB",
    menu_privacy: "Privacy",
    menu_privacy_desc: "Local-first",
    menu_reset: "Reset application",
    menu_reset_desc: "Delete all local data",

    // Language Sheet
    language_sheet_title: "Language Selection",
    lang_id_title: "Bahasa Indonesia",
    lang_id_desc: "Default (Indonesian)",
    lang_en_title: "English",
    lang_en_desc: "English language",

    // Subpage Titles & Descs
    subpage_profile_title: "User Profile",
    subpage_profile_desc: "Modify baseline data used by the IngatMinum calculation engine.",
    subpage_activity_title: "Activity Level",
    subpage_activity_desc: "Used as context, not an automatic fluid multiplier.",
    subpage_environment_title: "Environment Condition",
    subpage_environment_desc: "Select conditions you experience most often.",
    subpage_data_title: "Device Data",
    subpage_data_desc: "Main data is stored locally using IndexedDB.",
    subpage_privacy_title: "Privacy",
    subpage_privacy_desc: "Principle: store as little data on servers as possible.",
    subpage_formula_title: "Calculation Formula",
    subpage_formula_desc: "How the app determines total water reference and plain water target estimates.",
    subpage_push_title: "Device Notifications",
    subpage_push_desc: "Web Push allows reminders to appear even when the PWA is closed.",

    // Subpage Data
    data_indexeddb_desc: "Profile, drink history, targets, and settings stay on this device.",
    data_storage_label: "Storage",
    data_storage_active: "Active",
    data_storage_browser: "Managed by browser",
    data_export_btn: "Export backup JSON",
    data_import_btn: "Import backup JSON",

    // Subpage Privacy
    privacy_local_title: "Primary data stays local",
    privacy_local_desc: "Profile, consumption history, targets, and stats are not sent to any server.",
    privacy_push_title: "Minimal Web Push",
    privacy_push_desc: "If enabled, server only stores anonymous subscription and minimal reminder schedule.",

    // Subpage Formula
    formula_step1_badge: "Step 1",
    formula_step1_title: "Total fluid reference",
    formula_step1_desc: "The app selects a reference value based on age group and biological sex.",
    formula_table_title: "Total Fluid Requirement Reference (AKG 2019)",
    formula_col_group: "Group",
    formula_col_total: "Total ml/day",
    formula_age_0_5_months: "0–5 months",
    formula_age_6_11_months: "6–11 months",
    formula_age_1_3_years: "1–3 years",
    formula_age_4_6_years: "4–6 years",
    formula_age_7_9_years: "7–9 years",
    formula_age_10_12_years: "10–12 years",
    formula_age_13_15_years: "13–15 years",
    formula_age_16_18_years: "16–18 years",
    formula_age_19_64_years: "19–64 years",
    formula_age_65_80_years: "65–80 years",
    formula_age_gt_80_years: ">80 years",
    formula_step2_badge: "Step 2",
    formula_step2_title: "Special conditions add-on",
    formula_pregnant: "Pregnant:",
    formula_pregnant_desc: "+300 ml/day across trimester 1, 2, or 3.",
    formula_breastfeeding_0_6: "Breastfeeding 0–6 months:",
    formula_breastfeeding_0_6_desc: "+800 ml/day.",
    formula_breastfeeding_7_12: "Breastfeeding 7–12 months:",
    formula_breastfeeding_7_12_desc: "+650 ml/day.",
    formula_step3_badge: "Step 3",
    formula_step3_title: "Estimated plain water target",
    formula_water_target: "Plain water target",
    formula_formula_calc: "80% × total fluid reference",
    formula_round_note: "Results are rounded to the nearest 50 ml.",
    formula_calc_example: "Example: total fluid reference 2,500 ml → 2,500 × 80% = 2,000 ml plain water target.",
    formula_disclaimer: "The 80% ratio is an app estimation to separate plain water target from total dietary fluid; not an official plain water target from the Ministry of Health.",
    formula_special_rules_title: "Special rules",
    formula_rule_0_5_title: "0–5 months:",
    formula_rule_0_5_desc: "the app does not set a plain water target.",
    formula_rule_6_11_title: "6–11 months:",
    formula_rule_6_11_desc: "caregiver mode shows informational 120–240 ml range without target-chasing reminders.",
    formula_rule_doctor_title: "Doctor's fluid restriction:",
    formula_rule_doctor_desc: "automatic target is disabled and app uses manual target from healthcare provider.",
    formula_rule_activity_title: "Activity and hot weather:",
    formula_rule_activity_desc: "logged as context, but v1 does not add an automatic ml multiplier.",

    // Subpage Push
    push_active_title: "Web Push active",
    push_inactive_title: "Web Push inactive",
    push_permission_label: "Permission",
    push_not_checked: "not checked yet",
    push_ios_instruction: "On iPhone/iPad, install the app to the Home Screen first.",
    push_btn_disable: "Disable Web Push",
    push_btn_enable: "Enable Web Push",
    push_dev_note: "In local dev mode, the production service worker is not active. Web Push testing is done via Netlify.",

    // Profile options
    user_type_label: "User type",
    user_type_child: "Child",
    user_type_teen: "Teen",
    user_type_adult: "Adult",
    user_type_older_adult: "Older adult",
    user_type_pregnant: "Pregnant",
    user_type_breastfeeding: "Breastfeeding",

    age_label: "Age",
    age_unit_years: "years",
    age_unit_months: "months",

    sex_label: "Biological sex",
    sex_male: "Male",
    sex_female: "Female",

    trimester_label: "Trimester",
    lactation_label: "Lactation period",
    lactation_0_6: "0–6 months",
    lactation_7_12: "7–12 months",

    weight_label: "Body weight (optional)",
    weight_empty: "Not specified",

    fluid_restriction_label: "Doctor's fluid restriction",
    yes: "Yes",
    no: "No",
    medical_target_label: "Target from healthcare provider",

    // Units
    unit_ml_per_day: "ml/day",

    // Sheets
    sheet_target_title: "Daily Target",
    sheet_wake_title: "Wake Time",
    sheet_sleep_title: "Sleep Time",
    schedule_invalid_msg: "Wake time and sleep time cannot be the same.",

    // Modals
    modal_reset_title: "Reset Application?",
    modal_reset_msg: "All data will be permanently deleted from this device. This action cannot be undone.",
    modal_reset_confirm: "Delete Data",

    modal_export_title: "Export Data Backup",
    modal_export_msg: "JSON backup file containing profile, drink history, and settings stored on this device.",
    modal_export_confirm: "Download File",
    export_format_label: "Format",
    export_format_value: "JSON (Local)",
    export_filename_label: "File name",

    modal_import_title: "Restore Backup Data?",
    modal_import_msg: "Current data will be replaced by data from the backup file.",
    modal_import_confirm: "Restore Data",

    // Today View
    today_title: "IngatMinum",
    today_badge: "Today",
    today_header_of: "of",
    today_target_suffix: "target",
    today_future_not_started: "Future date has not started yet",
    today_btn_custom: "Custom",
    today_custom_add: "Custom amount",
    today_quick_add: "Quick drink",
    today_quick_button: "Drink",
    today_water: "Plain Water",
    today_next_reminder: "Next reminder",
    today_reminder_next: "Next reminder:",
    today_reminder_at: "at",
    today_reminder_quiet: "Not chasing target near bedtime",
    today_reminder_complete: "Today's target achieved",
    today_reminder_none: "No active reminders",
    today_reminder_future: "Reminder plan will be active on that day",
    today_progress_reached: "Daily target achieved",
    today_progress_label: "Progress:",
    today_progress_of_target: "of daily target",
    today_intakes_title: "Today's drinks",
    today_intakes_history_title: "Drink logs",
    today_records_count: "records",
    today_empty_today: "You haven't logged any drinks today. Don't forget to stay hydrated!",
    today_empty_future: "No drink records for future dates.",
    today_empty_past: "No drink records on this date.",
    today_delete_record_aria: "Delete record",
    today_close_notice_aria: "Close notice",
    today_infant_title: "No plain water target",
    today_infant_desc: "For ages 0–5 months, the app does not set a plain water target or adaptive reminders.",
    today_caregiver_badge: "Caregiver mode",
    today_caregiver_desc: "Informational plain water range. The app does not track streaks or use target-chasing reminders for this age.",
    today_target_reached: "Target reached!",
    portion_glass: "Regular glass",
    portion_mug: "Desk mug",
    portion_tumbler_medium: "Medium tumbler",
    portion_bottle_medium: "Medium bottle",
    portion_tumbler_large: "Large tumbler",
    portion_bottle_large: "1 liter bottle",
    quick_add_sheet_title: "Quick Add Portion",
    quick_add_sheet_desc: "Select or set the default portion size for the quick add button on the main screen.",
    quick_add_custom_label: "Custom portion (ml)",

    // History View
    history_title: "History",
    history_7_days: "7 days",
    history_30_days: "30 days",
    history_average: "Average",
    history_reached_days: "Days reached",
    history_streak: "Streak",
    history_summary: "Summary",
    history_avg_consumption: "Average consumption",
    history_last_days: "last days",
    history_note: "Days are considered reached for streak at ≥90% of target. Progress above 100% receives no additional reward.",

    // Toasts
    toast_added: "added",
    toast_deleted: "Entry deleted",
    toast_profile_saved: "Profile saved",
    toast_settings_saved: "Settings saved",
    toast_quick_add_saved: "Quick button portion",
    toast_backup_downloaded: "Backup successfully downloaded",
    toast_backup_imported: "Backup imported"
  }
};

export type TranslationKey = keyof typeof translations.id;

export function getActivityOptions(lang: SupportedLanguage) {
  if (lang === "en") {
    return [
      { id: "very_light" as const, label: "Very light", description: "Mostly sitting, almost no exercise" },
      { id: "light" as const, label: "Light", description: "Casual walk or light activity around 30 minutes" },
      { id: "moderate" as const, label: "Moderate", description: "Active or exercise around 30–60 minutes" },
      { id: "high" as const, label: "High", description: "Physical activity around 60–90 minutes with sweating" },
      { id: "very_high" as const, label: "Very high", description: "Heavy physical activity over 90 minutes" }
    ];
  }
  return [
    { id: "very_light" as const, label: "Sangat ringan", description: "Sebagian besar duduk, hampir tidak olahraga" },
    { id: "light" as const, label: "Ringan", description: "Jalan santai atau aktivitas ringan sekitar 30 menit" },
    { id: "moderate" as const, label: "Sedang", description: "Aktif atau olahraga sekitar 30–60 menit" },
    { id: "high" as const, label: "Tinggi", description: "Aktivitas fisik sekitar 60–90 menit dan berkeringat" },
    { id: "very_high" as const, label: "Sangat tinggi", description: "Aktivitas berat lebih dari 90 menit" }
  ];
}

export function getEnvironmentOptions(lang: SupportedLanguage) {
  if (lang === "en") {
    return [
      { id: "cool" as const, label: "Cool", description: "Mostly in air-conditioned rooms" },
      { id: "normal" as const, label: "Normal", description: "Comfortable temperature, mix of indoor & outdoor" },
      { id: "hot" as const, label: "Hot", description: "Often exposed to hot weather" },
      { id: "very_hot" as const, label: "Very hot", description: "Frequently outdoors and sweating a lot" }
    ];
  }
  return [
    { id: "cool" as const, label: "Sejuk", description: "Banyak berada di ruangan ber-AC" },
    { id: "normal" as const, label: "Normal", description: "Suhu nyaman, campuran indoor dan outdoor" },
    { id: "hot" as const, label: "Panas", description: "Sering berada di cuaca panas" },
    { id: "very_hot" as const, label: "Sangat panas", description: "Banyak di luar dan sering berkeringat" }
  ];
}

export function getUserTypeOptions(lang: SupportedLanguage) {
  if (lang === "en") {
    return [
      { id: "child" as const, label: "Child" },
      { id: "teen" as const, label: "Teen" },
      { id: "adult" as const, label: "Adult" },
      { id: "older_adult" as const, label: "Older adult" },
      { id: "pregnant" as const, label: "Pregnant" },
      { id: "breastfeeding" as const, label: "Breastfeeding" }
    ];
  }
  return [
    { id: "child" as const, label: "Anak" },
    { id: "teen" as const, label: "Remaja" },
    { id: "adult" as const, label: "Dewasa" },
    { id: "older_adult" as const, label: "Lansia" },
    { id: "pregnant" as const, label: "Hamil" },
    { id: "breastfeeding" as const, label: "Menyusui" }
  ];
}

export function getUserTypeLabel(value: string, lang: SupportedLanguage): string {
  const map: Record<SupportedLanguage, Record<string, string>> = {
    id: {
      child: "Anak",
      teen: "Remaja",
      adult: "Dewasa",
      older_adult: "Lansia",
      pregnant: "Hamil",
      breastfeeding: "Menyusui"
    },
    en: {
      child: "Child",
      teen: "Teen",
      adult: "Adult",
      older_adult: "Older adult",
      pregnant: "Pregnant",
      breastfeeding: "Breastfeeding"
    }
  };
  return map[lang]?.[value] ?? map.id[value] ?? value;
}

export function useI18n(locale?: string) {
  const lang = resolveLanguage(locale);
  const isIndonesian = lang === "id";
  const isEnglish = lang === "en";
  const dateLocale = isEnglish ? "en-US" : "id-ID";

  const t = (key: TranslationKey): string => {
    return translations[lang][key] ?? translations.id[key] ?? (key as string);
  };

  const activityOptions = getActivityOptions(lang);
  const environmentOptions = getEnvironmentOptions(lang);
  const userTypeOptions = getUserTypeOptions(lang);

  const activityLabel = (value: string) => {
    return activityOptions.find((item) => item.id === value)?.label ?? value;
  };

  const environmentLabel = (value: string) => {
    return environmentOptions.find((item) => item.id === value)?.label ?? value;
  };

  const userType = (value: string) => {
    return getUserTypeLabel(value, lang);
  };

  return {
    lang,
    isIndonesian,
    isEnglish,
    dateLocale,
    t,
    activityOptions,
    environmentOptions,
    userTypeOptions,
    activityLabel,
    environmentLabel,
    userTypeLabel: userType
  };
}
