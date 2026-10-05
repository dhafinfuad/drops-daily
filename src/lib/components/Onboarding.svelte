<script lang="ts">
  import { tick } from "svelte";
  import { preventBoundaryOverscroll } from "$lib/actions/overscroll";
  import Icon from "./Icon.svelte";
  import TimeSelect from "./TimeSelect.svelte";
  import type { AppSettings, Profile, UserType } from "$lib/types";
  import { calculateHydration } from "$lib/hydration/calculator";
  import { isValidWakeSleepPair } from "$lib/db/hydration-day";
  import { useI18n } from "$lib/i18n";

  export let onComplete: (
    profile: Profile,
    settings: AppSettings,
  ) => Promise<void>;

  const now = Date.now();
  let profile: Profile = {
    id: "current",
    userType: "adult",
    age: { value: 30, unit: "years" },
    sex: "male",
    weightKg: 65,
    activity: "moderate",
    environment: "normal",
    pregnancyTrimester: null,
    lactationPeriod: null,
    fluidRestrictionByDoctor: false,
    updatedAt: now,
  };

  let settings: AppSettings = {
    id: "current",
    targetMode: "automatic",
    manualTargetMl: null,
    wakeTime: "06:00",
    sleepTime: "22:00",
    remindersEnabled: true,
    locale: "en-US",
    volumeUnit: "ml",
    updatedAt: now,
  };

  let stepIndex = 0;
  let submitting = false;
  let scrollContainer: HTMLElement | null = null;

  $: i18n = useI18n(settings.locale);
  $: isEnglish = i18n.isEnglish;

  function toggleLanguage() {
    settings.locale = isEnglish ? "id-ID" : "en-US";
    settings = { ...settings };
  }

  function formatWarning(warning: string, english: boolean) {
    if (!english) return warning;
    if (warning.includes("Mode bayi")) {
      return "Infant mode provides guidance for caregivers and does not use target-based reminders.";
    }
    if (warning.includes("Aktivitas tinggi")) {
      return "High activity levels may increase fluid needs; baseline targets do not estimate individual sweat loss.";
    }
    if (warning.includes("Kondisi panas")) {
      return "Hot environments may increase fluid needs; baseline targets do not apply artificial weather multipliers.";
    }
    return warning;
  }

  $: if (stepIndex !== undefined) {
    void resetScroll();
  }

  async function resetScroll() {
    await tick();
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
      requestAnimationFrame(() => {
        if (scrollContainer) scrollContainer.scrollTop = 0;
      });
    }
  }

  $: steps = [
    "welcome",
    "userType",
    "basics",
    "safety",
    ...(profile.userType === "pregnant"
      ? ["pregnancy"]
      : profile.userType === "breastfeeding"
        ? ["lactation"]
        : []),
    "schedule",
    "summary",
  ];
  $: currentStep = steps[stepIndex] ?? "welcome";
  $: preview = calculateHydration(profile, settings);
  $: scheduleValid = isValidWakeSleepPair(
    settings.wakeTime,
    settings.sleepTime,
  );

  $: userTypes = isEnglish
    ? [
        {
          id: "child" as UserType,
          label: "Child",
          description: "For children and early age users",
        },
        {
          id: "teen" as UserType,
          label: "Teen",
          description: "For adolescents and teenagers",
        },
        {
          id: "adult" as UserType,
          label: "Adult",
          description: "Standard profile for adults",
        },
        {
          id: "older_adult" as UserType,
          label: "Older Adult",
          description: "Adapted for senior and elderly users",
        },
        {
          id: "pregnant" as UserType,
          label: "Pregnant",
          description: "Includes additional intake requirements during pregnancy",
        },
        {
          id: "breastfeeding" as UserType,
          label: "Breastfeeding",
          description: "Includes additional intake requirements during lactation",
        },
      ]
    : [
        { id: "child" as UserType, label: "Anak", description: "Untuk pengguna anak" },
        { id: "teen" as UserType, label: "Remaja", description: "Untuk usia remaja" },
        { id: "adult" as UserType, label: "Dewasa", description: "Pilihan umum orang dewasa" },
        {
          id: "older_adult" as UserType,
          label: "Lansia",
          description: "Untuk pengguna usia lanjut",
        },
        {
          id: "pregnant" as UserType,
          label: "Hamil",
          description: "Kebutuhan tambahan selama kehamilan",
        },
        {
          id: "breastfeeding" as UserType,
          label: "Menyusui",
          description: "Kebutuhan tambahan selama menyusui",
        },
      ];

  $: restrictionOptions = isEnglish
    ? [
        {
          value: false,
          label: "No",
          description: "Use automatic personalized calculation",
        },
        {
          value: true,
          label: "Yes",
          description: "Set a specific target prescribed by a healthcare professional",
        },
      ]
    : [
        {
          value: false,
          label: "Tidak",
          description: "Gunakan kalkulator otomatis",
        },
        {
          value: true,
          label: "Ya",
          description: "Gunakan target dari tenaga kesehatan",
        },
      ];

  function optionClass(selected: boolean) {
    return selected
      ? "border-water-500 bg-water-50 shadow-sm  transition-all duration-150"
      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 transition-all duration-150";
  }

  function selectUserType(type: UserType) {
    profile.userType = type;
    profile.pregnancyTrimester = type === "pregnant" ? 1 : null;
    profile.lactationPeriod = type === "breastfeeding" ? "month_0_6" : null;
    if (type === "child") profile.age = { value: 5, unit: "years" };
    else if (type === "teen") profile.age = { value: 14, unit: "years" };
    else if (type === "older_adult") profile.age = { value: 70, unit: "years" };
    else profile.age = { value: 30, unit: "years" };
    if (type === "pregnant" || type === "breastfeeding") profile.sex = "female";
    profile = { ...profile };
  }

  function setRestriction(value: boolean) {
    profile.fluidRestrictionByDoctor = value;
    settings.targetMode = value ? "manual" : "automatic";
    settings.manualTargetMl = value ? (settings.manualTargetMl ?? 1500) : null;
    profile = { ...profile };
    settings = { ...settings };
  }

  async function next() {
    if (stepIndex < steps.length - 1) {
      stepIndex += 1;
      return;
    }
    if (
      profile.fluidRestrictionByDoctor &&
      (!settings.manualTargetMl || settings.manualTargetMl <= 0)
    )
      return;
    submitting = true;
    try {
      await onComplete(
        { ...profile, updatedAt: Date.now() },
        { ...settings, updatedAt: Date.now() },
      );
    } finally {
      submitting = false;
    }
  }

  function back() {
    if (stepIndex > 0) stepIndex -= 1;
  }

  const ageYears = Array.from({ length: 100 }, (_, i) => i + 1);
  const ageMonths = Array.from({ length: 12 }, (_, i) => i);
  const weightOptions = Array.from({ length: 171 }, (_, i) => i + 10);

  let currentAgeUnit: "years" | "months" = profile.age.unit;
  let ageOptions = profile.age.unit === "months" ? ageMonths : ageYears;
  $: if (profile.age.unit !== currentAgeUnit) {
    currentAgeUnit = profile.age.unit;
    ageOptions = currentAgeUnit === "months" ? ageMonths : ageYears;
  }

  let touchStartX = 0;
  let touchStartY = 0;

  function handleTouchStart(event: TouchEvent) {
    const touch = event.changedTouches[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }

  function handleTouchEnd(event: TouchEvent) {
    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const horizontalGesture = Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

    if (horizontalGesture && deltaX >= 60) {
      if (stepIndex > 0) {
        back();
      }
    }
  }
</script>

<svelte:window ontouchstart={handleTouchStart} ontouchend={handleTouchEnd} />

<div
  class="app-shell flex h-full min-h-0 flex-col px-[17px] safe-top safe-bottom"
>
  <div class="shrink-0 pt-[5px]">
    <div class="flex items-center gap-2.5">
      <button
        onclick={back}
        class="grid size-8 place-items-center rounded-full bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-800 active:scale-90 transition-all duration-150 {stepIndex ===
        0
          ? 'pointer-events-none opacity-0'
          : ''}"
        aria-label={isEnglish ? "Back" : "Kembali"}
      >
        <Icon name="back" className="size-4" />
      </button>
      <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div
          class="h-full rounded-full bg-water-500 transition-all"
          style={`width:${((stepIndex + 1) / steps.length) * 100}%`}
        ></div>
      </div>
      <button
        onclick={toggleLanguage}
        type="button"
        class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all"
        title={isEnglish ? "Ganti ke Bahasa Indonesia" : "Switch to English"}
        aria-label={isEnglish ? "Switch to Indonesian" : "Ganti ke Bahasa Inggris"}
      >
        <span>{isEnglish ? "🇬🇧 EN" : "🇮🇩 ID"}</span>
      </button>
      <span class="w-8 text-right text-[12px] font-semibold text-slate-400"
        >{stepIndex + 1}/{steps.length}</span
      >
    </div>
  </div>

  <div
    bind:this={scrollContainer}
    use:preventBoundaryOverscroll
    class="onboarding-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-[13px]"
  >
    <div
      class="mx-auto flex min-h-full w-full max-w-[360px] flex-col justify-start py-[5px] sm:justify-center"
    >
      {#if currentStep === "welcome"}
        <h1 class="mt-2 text-[28px] font-bold leading-[1.12] tracking-[-.04em]">
          {isEnglish ? "Stay hydrated. Effortlessly." : "Minum cukup. Tanpa ribet."}
        </h1>
        <p class="mt-2 text-[14px] leading-5 text-slate-500">
          {isEnglish
            ? "Meet your daily hydration goals with Ingat Minum, an intelligent reminder designed for your everyday lifestyle."
            : "Cukupi kebutuhan cairan harian dengan Ingat Minum, aplikasi reminder cerdas untuk aktivitas Anda."}
        </p>
        <div class="mt-6 grid gap-2.5">
          <div
            class="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm"
          >
            <div
              class="grid size-10 shrink-0 place-items-center rounded-2xl bg-water-100 text-water-600"
            >
              <Icon name="user" className="size-5" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between">
                <strong class="text-[15px] font-bold text-slate-800"
                  >{isEnglish ? "Personalized" : "Personal"}</strong
                >
              </div>
              <p class="mt-0.5 text-[12px] leading-snug text-slate-400">
                {isEnglish
                  ? "Fluid intake calculated specifically for your body profile"
                  : "Kebutuhan cairan dihitung khusus sesuai profil tubuh"}
              </p>
            </div>
          </div>

          <div
            class="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm"
          >
            <div
              class="grid size-10 shrink-0 place-items-center rounded-2xl bg-water-100 text-water-600"
            >
              <Icon name="bell" className="size-5" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between">
                <strong class="text-[15px] font-bold text-slate-800"
                  >{isEnglish ? "Adaptive" : "Adaptif"}</strong
                >
              </div>
              <p class="mt-0.5 text-[12px] leading-snug text-slate-400">
                {isEnglish
                  ? "Smart, spaced reminders tailored to your sleep and wake schedule"
                  : "Pengingat cerdas teratur menyesuaikan jam bangun & tidur"}
              </p>
            </div>
          </div>

          <div
            class="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm"
          >
            <div
              class="grid size-10 shrink-0 place-items-center rounded-2xl bg-water-100 text-water-600"
            >
              <Icon name="shield" className="size-5" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between">
                <strong class="text-[15px] font-bold text-slate-800"
                  >{isEnglish ? "Private & Local" : "Lokal"}</strong
                >
              </div>
              <p class="mt-0.5 text-[12px] leading-snug text-slate-400">
                {isEnglish
                  ? "Your privacy is protected with 100% of data stored offline on your device"
                  : "Privasi terjaga, 100% data tersimpan offline di HP Anda"}
              </p>
            </div>
          </div>
        </div>
      {:else if currentStep === "userType"}
        <h1 class="mt-2 text-[28px] font-bold leading-[1.12] tracking-[-.04em]">
          {isEnglish ? "Who is this app for?" : "Aplikasi ini untuk siapa?"}
        </h1>
        <p class="mt-2 text-[14px] leading-5 text-slate-500">
          {isEnglish
            ? "Select the profile that fits best. You can change this at any time in settings."
            : "Pilih profil yang paling sesuai. Anda bisa mengubahnya nanti."}
        </p>
        <div class="mt-6 grid gap-2">
          {#each userTypes as item}
            <button
              onclick={() => selectUserType(item.id)}
              class="flex w-full items-start gap-2.5 rounded-2xl border px-[17px] py-[11px] text-left transition {optionClass(
                profile.userType === item.id,
              )}"
            >
              <span
                class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border {profile.userType ===
                item.id
                  ? 'border-water-500 bg-water-500 text-white'
                  : 'border-slate-300 bg-white'}"
                >{#if profile.userType === item.id}<Icon
                    name="check"
                    className="size-3"
                  />{/if}</span
              >
              <span class="min-w-0 flex-1"
                ><h3
                  class="block text-[16px] font-semibold {profile.userType ===
                  item.id
                    ? 'text-blue-900'
                    : 'text-slate-900'}"
                  >{item.label}</h3
                ><p
                  class="mt-1 block text-[14px] leading-5 {profile.userType ===
                  item.id
                    ? 'text-blue-700/80'
                    : 'text-slate-400'}"
                  >{item.description}</p
                ></span
              >
            </button>
          {/each}
        </div>
      {:else if currentStep === "basics"}
        <h1 class="mt-2 text-[28px] font-bold leading-[1.12] tracking-[-.04em]">
          {isEnglish ? "Basic Profile" : "Profil dasar"}
        </h1>
        <p class="mt-2 text-[14px] leading-5 text-slate-500">
          {isEnglish
            ? "We only ask for information essential to calculate your accurate hydration target."
            : "Kami hanya meminta data yang benar-benar dibutuhkan untuk perhitungan."}
        </p>
        <div class="mt-6 grid gap-3">
          <label class="block">
            <span class="mb-2 block text-[14px] font-semibold text-slate-500"
              >{isEnglish ? "Age" : "Usia"}</span
            >
            <div class="grid grid-cols-2 gap-2">
              <select
                value={profile.age.value}
                onchange={(e) => {
                  profile.age.value = Number(e.currentTarget.value);
                  profile = { ...profile };
                  (e.currentTarget as HTMLSelectElement)?.blur();
                }}
                class="w-full rounded-2xl border border-slate-200 bg-white pl-[17px] pr-[41px] py-[11px] text-[16px] font-semibold outline-none focus:border-water-500 transition-colors duration-150"
              >
                {#each ageOptions as item}
                  <option value={item}>{item}</option>
                {/each}
              </select>
              <select
                bind:value={profile.age.unit}
                onchange={(e) => {
                  if (profile.age.unit === "months" && profile.age.value > 11) {
                    profile.age.value = 6;
                  } else if (
                    profile.age.unit === "years" &&
                    profile.age.value < 1
                  ) {
                    profile.age.value = 1;
                  }
                  profile = { ...profile };
                  (e.currentTarget as HTMLSelectElement)?.blur();
                }}
                class="w-full rounded-2xl border border-slate-200 bg-white pl-[17px] pr-[41px] py-[11px] text-[16px] font-semibold outline-none focus:border-water-500 transition-colors duration-150"
              >
                <option value="years">{isEnglish ? "years" : "tahun"}</option>
                <option value="months">{isEnglish ? "months" : "bulan"}</option>
              </select>
            </div>
          </label>
          <div>
            <span class="mb-2 block text-[14px] font-semibold text-slate-500"
              >{isEnglish ? "Biological sex" : "Jenis kelamin"}</span
            >
            <div class="grid grid-cols-2 gap-2">
              <button
                onclick={() => {
                  profile.sex = "male";
                  profile = { ...profile };
                }}
                disabled={profile.userType === "pregnant" ||
                  profile.userType === "breastfeeding"}
                class="min-h-[46px] rounded-2xl border px-[13px] py-[9px] text-[16px] font-semibold {profile.sex ===
                'male'
                  ? 'border-water-500 bg-water-50 text-water-600'
                  : 'border-slate-200 bg-white text-slate-700'} disabled:opacity-40"
                >{isEnglish ? "Male" : "Laki-laki"}</button
              >
              <button
                onclick={() => {
                  profile.sex = "female";
                  profile = { ...profile };
                }}
                class="min-h-[46px] rounded-2xl border px-[13px] py-[9px] text-[16px] font-semibold {profile.sex ===
                'female'
                  ? 'border-water-500 bg-water-50 text-water-600'
                  : 'border-slate-200 bg-white text-slate-700'}"
                >{isEnglish ? "Female" : "Perempuan"}</button
              >
            </div>
          </div>
          <label class="block"
            ><span class="mb-2 block text-[14px] font-semibold text-slate-500"
              >{isEnglish ? "Body weight (optional)" : "Berat badan (opsional)"}</span
            >
            <div class="relative">
              <select
                value={profile.weightKg ?? ""}
                onchange={(e) => {
                  const val = e.currentTarget.value;
                  profile.weightKg = val === "" ? null : Number(val);
                  profile = { ...profile };
                  (e.currentTarget as HTMLSelectElement)?.blur();
                }}
                class="w-full rounded-2xl border border-slate-200 bg-white pl-[17px] pr-[41px] py-[11px] text-[16px] font-semibold outline-none focus:border-water-500 transition-colors duration-150"
              >
                <option value="">{isEnglish ? "Not specified" : "Tidak diisi"}</option>
                {#each weightOptions as item}
                  <option value={item}>{item} kg</option>
                {/each}
              </select>
            </div></label
          >
          <p
            class="rounded-2xl bg-slate-100 px-[17px] py-[11px] text-[14px] leading-6 text-slate-500"
          >
            {isEnglish
              ? "Height is not required as it is not needed for the primary calculation standard."
              : "Tinggi badan tidak diminta karena belum diperlukan pada metode kalkulasi utama."}
          </p>
        </div>
      {:else if currentStep === "safety"}
        <h1 class="mt-2 text-[28px] font-bold leading-[1.12] tracking-[-.04em]">
          {isEnglish ? "Do you have medical fluid restrictions?" : "Ada batasan cairan dari dokter?"}
        </h1>
        <p class="mt-2 text-[14px] leading-5 text-slate-500">
          {isEnglish
            ? "If your doctor has advised restricting fluid intake, the app will not set an automatic target."
            : "Jika pernah mendapat anjuran membatasi cairan, aplikasi tidak akan menentukan target otomatis."}
        </p>
        <div class="mt-6 grid gap-2">
          {#each restrictionOptions as item}
            <button
              onclick={() => setRestriction(item.value)}
              class="flex w-full items-start gap-2.5 rounded-2xl border px-[17px] py-[11px] text-left {optionClass(
                profile.fluidRestrictionByDoctor === item.value,
              )}"
            >
              <span
                class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border {profile.fluidRestrictionByDoctor ===
                item.value
                  ? 'border-water-500 bg-water-500 text-white'
                  : 'border-slate-300'}"
                >{#if profile.fluidRestrictionByDoctor === item.value}<Icon
                    name="check"
                    className="size-3"
                  />{/if}</span
              >
              <span class="min-w-0 flex-1"
                ><h3
                  class="block text-[16px] font-semibold {profile.fluidRestrictionByDoctor ===
                  item.value
                    ? 'text-blue-900'
                    : 'text-slate-900'}"
                  >{item.label}</h3
                ><p
                  class="mt-1 block text-[14px] leading-5 {profile.fluidRestrictionByDoctor ===
                  item.value
                    ? 'text-blue-700/80'
                    : 'text-slate-400'}"
                  >{item.description}</p
                ></span
              >
            </button>
          {/each}
        </div>
        {#if profile.fluidRestrictionByDoctor}
          <label class="mt-4 block"
            ><span class="mb-2 block text-[14px] font-semibold text-slate-500"
              >{isEnglish ? "Target prescribed by healthcare provider" : "Target dari tenaga kesehatan"}</span
            >
            <div
              class="flex items-center rounded-2xl border border-slate-200 bg-white px-[17px]"
            >
              <input
                type="number"
                min="1"
                inputmode="numeric"
                pattern="[0-9]*"
                bind:value={settings.manualTargetMl}
                class="min-w-0 flex-1 bg-transparent py-[11px] text-[16px] font-semibold outline-none"
              /><span class="text-[14px] text-slate-400">{isEnglish ? "ml/day" : "ml/hari"}</span>
            </div></label
          >
        {/if}
      {:else if currentStep === "pregnancy"}
        <h1 class="mt-2 text-[28px] font-bold leading-[1.12] tracking-[-.04em]">
          {isEnglish ? "Which trimester?" : "Trimester berapa?"}
        </h1>
        <p class="mt-2 text-[14px] leading-5 text-slate-500">
          {isEnglish
            ? "Dietary guidelines recommend additional water intake during pregnancy."
            : "AKG menambahkan kebutuhan air selama kehamilan."}
        </p>
        <div class="mt-6 grid gap-2">
          {#each [1, 2, 3] as trimester}
            <button
              onclick={() => {
                profile.pregnancyTrimester =
                  trimester === 1 ? 1 : trimester === 2 ? 2 : 3;
                profile = { ...profile };
              }}
              class="rounded-2xl border px-[17px] py-[11px] text-left text-[16px] font-semibold {optionClass(
                profile.pregnancyTrimester === trimester,
              )}">Trimester {trimester}</button
            >
          {/each}
        </div>
      {:else if currentStep === "lactation"}
        <h1 class="mt-2 text-[28px] font-bold leading-[1.12] tracking-[-.04em]">
          {isEnglish ? "Baby's age" : "Usia bayi"}
        </h1>
        <p class="mt-2 text-[14px] leading-5 text-slate-500">
          {isEnglish
            ? "Fluid requirements differ between the first and second six months of breastfeeding."
            : "Tambahan kebutuhan air berbeda antara enam bulan pertama dan kedua."}
        </p>
        <div class="mt-6 grid gap-2">
          <button
            onclick={() => {
              profile.lactationPeriod = "month_0_6";
              profile = { ...profile };
            }}
            class="rounded-2xl border px-[17px] py-[11px] text-left {optionClass(
              profile.lactationPeriod === 'month_0_6',
            )}"
            ><span class="block text-[16px] font-semibold">{isEnglish ? "0–6 months" : "0–6 bulan"}</span><span
              class="mt-1 block text-[14px] text-slate-400"
              >{isEnglish ? "First six months of breastfeeding" : "Enam bulan pertama menyusui"}</span
            ></button
          >
          <button
            onclick={() => {
              profile.lactationPeriod = "month_7_12";
              profile = { ...profile };
            }}
            class="rounded-2xl border px-[17px] py-[11px] text-left {optionClass(
              profile.lactationPeriod === 'month_7_12',
            )}"
            ><span class="block text-[16px] font-semibold">{isEnglish ? "7–12 months" : "7–12 bulan"}</span
            ><span class="mt-1 block text-[14px] text-slate-400"
              >{isEnglish ? "Second six months of breastfeeding" : "Enam bulan kedua menyusui"}</span
            ></button
          >
        </div>

      {:else if currentStep === "schedule"}
        <h1 class="mt-2 text-[28px] font-bold leading-[1.12] tracking-[-.04em]">
          {isEnglish ? "When does your day start?" : "Kapan hari Anda dimulai?"}
        </h1>
        <p class="mt-2 text-[14px] leading-5 text-slate-500">
          {isEnglish
            ? "Reminders are scheduled only within your active waking hours."
            : "Reminder hanya aktif pada rentang waktu yang Anda tentukan."}
        </p>
        <div class="mt-6 grid gap-3">
          <TimeSelect
            bind:value={settings.wakeTime}
            label={isEnglish ? "Wake Time" : "Waktu Mulai"}
            hourLabel={isEnglish ? "Hours" : "Jam"}
            minuteLabel={isEnglish ? "Minutes" : "Menit"}
          />
          <TimeSelect
            bind:value={settings.sleepTime}
            label={isEnglish ? "Bedtime" : "Waktu Selesai"}
            hourLabel={isEnglish ? "Hours" : "Jam"}
            minuteLabel={isEnglish ? "Minutes" : "Menit"}
          />
          {#if !scheduleValid}<div
              class="rounded-2xl bg-amber-50 px-[17px] py-[11px] text-[14px] leading-6 text-amber-800"
            >
              {isEnglish
                ? "Start time and end time cannot be identical."
                : "Waktu mulai dan waktu selesai tidak boleh sama."}
            </div>{/if}
          <div class="rounded-2xl bg-water-50 p-[13px]">
            <div class="flex gap-2.5">
              <div
                class="grid size-8 shrink-0 place-items-center rounded-full bg-white text-water-600"
              >
                <Icon name="bell" className="size-[18px]" />
              </div>
              <div>
                <p class="text-[16px] font-semibold text-slate-800">
                  {isEnglish ? "No reminders while sleeping" : "Tidak ada reminder saat tidur"}
                </p>
                <p class="mt-1 text-[14px] leading-6 text-slate-500">
                  {isEnglish
                    ? "The schedule will automatically recalculate as your logged intake changes."
                    : "Jadwal akan dihitung ulang bila konsumsi Anda berubah."}
                </p>
              </div>
            </div>
          </div>
        </div>
      {:else if currentStep === "summary"}
        <h1 class="mt-2 text-[28px] font-bold leading-[1.12] tracking-[-.04em]">
          {isEnglish ? "All set." : "Semua siap."}
        </h1>
        <p class="mt-2 text-[14px] leading-5 text-slate-500">
          {isEnglish
            ? "Here is your initial plan summary. Everything can be adjusted anytime in Settings."
            : "Berikut ringkasan awal. Semua dapat diubah dari Pengaturan."}
        </p>
        <div class="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div class="flex items-center justify-between px-[17px] py-[11px]">
            <span class="text-[14px] text-slate-400"
              >{isEnglish ? "Plain water goal" : "Target air putih"}</span
            ><strong class="text-[16px]"
              >{preview.plainWaterGoalMl
                ? `${preview.plainWaterGoalMl.toLocaleString(isEnglish ? "en-US" : "id-ID")} ml`
                : isEnglish
                  ? "Custom mode"
                  : "Mode khusus"}</strong
            >
          </div>
          <div class="border-t border-slate-100 px-[17px] py-[11px]">
            <p class="text-[12px] text-slate-400">{isEnglish ? "Method" : "Metode"}</p>
            <p class="mt-1 text-[16px] font-semibold">
              {isEnglish
                ? preview.calculationMethod === "kemkes_akg_2019"
                  ? "MoH RDA 2019 + Plain Water Estimate"
                  : preview.calculationMethod === "manual"
                    ? "Manual target"
                    : "Caregiver guidance"
                : preview.calculationMethod === "kemkes_akg_2019"
                  ? "AKG Kemenkes 2019 + Estimasi Air Putih"
                  : preview.calculationMethod === "manual"
                    ? "Target manual"
                    : "Informasi caregiver"}
            </p>
          </div>
          {#if preview.totalWaterReferenceMl}<div
              class="border-t border-slate-100 px-[17px] py-[11px]"
            >
              <p class="text-[12px] text-slate-400"
                >{isEnglish ? "Total fluid reference" : "Referensi total air"}</p
              >
              <p class="mt-1 text-[16px] font-semibold">
                {preview.totalWaterReferenceMl.toLocaleString(isEnglish ? "en-US" : "id-ID")} {isEnglish ? "ml/day" : "ml/hari"}
              </p>
            </div>{/if}
        </div>
        {#if preview.warnings.length}<div
            class="mt-3 rounded-2xl bg-slate-100 px-[17px] py-[11px]"
          >
            <p class="text-[14px] leading-6 text-slate-500">
              {formatWarning(preview.warnings[0], isEnglish)}
            </p>
          </div>{/if}
      {/if}
    </div>
  </div>

  <div
    class="mx-auto w-full max-w-[360px] shrink-0 border-t border-slate-200/70 bg-[#F2F2F7]/95 pb-[5px] pt-[13px] backdrop-blur-xl"
  >
    <button
      onclick={next}
      disabled={submitting ||
        (currentStep === "safety" &&
          profile.fluidRestrictionByDoctor &&
          (!settings.manualTargetMl || settings.manualTargetMl <= 0)) ||
        (currentStep === "schedule" && !scheduleValid)}
      class="min-h-[46px] w-full rounded-2xl bg-water-500 px-[17px] py-[9px] text-[16px] font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-water-600 active:scale-[.97] transition-all duration-150 disabled:opacity-50"
    >
      {submitting
        ? isEnglish
          ? "Saving..."
          : "Menyimpan..."
        : currentStep === "summary"
          ? isEnglish
            ? "Get started"
            : "Mulai menggunakan aplikasi"
          : isEnglish
            ? "Continue"
            : "Lanjut"}
    </button>
  </div>
</div>
