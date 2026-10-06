<script lang="ts">
  import { tick } from "svelte";
  import Icon from "./Icon.svelte";
  import BottomSheet from "./BottomSheet.svelte";
  import Modal from "./Modal.svelte";
  import TimeSelect from "./TimeSelect.svelte";
  import type { AppSettings, Profile } from "$lib/types";
  import type { AppMetaRecord } from "$lib/db/schema";
  import type { PushCapability } from "$lib/push/client";
  import { isValidWakeSleepPair } from "$lib/db/hydration-day";
  import { useI18n, LANGUAGE_OPTIONS } from "$lib/i18n";

  export let profile: Profile;
  export let settings: AppSettings;
  export let meta: AppMetaRecord;
  export let pushCapability: PushCapability | null;
  export let onProfileChange: (profile: Profile) => Promise<void>;
  export let onSettingsChange: (settings: AppSettings) => Promise<void>;
  export let onProfileSettingsChange: (
    profile: Profile,
    settings: AppSettings,
  ) => Promise<void>;
  export let onEnablePush: () => Promise<void>;
  export let onDisablePush: () => Promise<void>;
  export let onExport: () => Promise<void>;
  export let onImport: (file: File) => Promise<void>;
  export let onReset: () => Promise<void>;

  let page:
    | null
    | "profile"
    | "activity"
    | "environment"
    | "data"
    | "privacy"
    | "push"
    | "formula" = null;
  let sheet: null | "target" | "wake" | "sleep" | "language" = null;
  let modal: null | "reset" | "export" | "import" = null;
  let pendingImportFile: File | null = null;
  const backupFileName = `drops-daily-backup-${new Date().toISOString().slice(0, 10)}.json`;
  let localProfile: Profile = structuredClone(profile);
  let localSettings: AppSettings = structuredClone(settings);
  let busyPush = false;
  let pushMessage = "";
  let containerEl: HTMLElement | null = null;
  let savedMenuScroll = 0;
  let subpageScrolls: Record<string, number> = {};

  export function popToRoot(): boolean {
    if (modal) {
      modal = null;
      pendingImportFile = null;
      return true;
    }
    if (sheet) {
      localSettings = structuredClone(settings);
      sheet = null;
      return true;
    }
    if (page !== null) {
      void closeSubpage();
      return true;
    }
    return false;
  }

  async function confirmExport() {
    modal = null;
    await onExport();
  }

  async function confirmReset() {
    modal = null;
    await onReset();
  }

  async function confirmImport() {
    if (pendingImportFile) {
      const file = pendingImportFile;
      pendingImportFile = null;
      modal = null;
      await onImport(file);
    }
  }

  function getSubpageTitle(p: typeof page): string {
    switch (p) {
      case "profile":
        return i18n.t("subpage_profile_title");
      case "activity":
        return i18n.t("subpage_activity_title");
      case "environment":
        return i18n.t("subpage_environment_title");
      case "data":
        return i18n.t("subpage_data_title");
      case "privacy":
        return i18n.t("subpage_privacy_title");
      case "formula":
        return i18n.t("subpage_formula_title");
      case "push":
        return i18n.t("subpage_push_title");
      default:
        return i18n.t("settings_title");
    }
  }

  async function openSubpage(target: NonNullable<typeof page>) {
    const scrollParent = containerEl?.closest(
      ".screen-scroll",
    ) as HTMLElement | null;
    if (scrollParent && page === null) {
      savedMenuScroll = scrollParent.scrollTop;
    }
    page = target;
    await tick();
    if (scrollParent) {
      const targetPos = subpageScrolls[target] ?? 0;
      scrollParent.scrollTop = targetPos;
      requestAnimationFrame(() => {
        if (scrollParent) scrollParent.scrollTop = targetPos;
      });
    }
  }

  async function closeSubpage() {
    const scrollParent = containerEl?.closest(
      ".screen-scroll",
    ) as HTMLElement | null;
    if (scrollParent && page !== null) {
      subpageScrolls[page] = scrollParent.scrollTop;
    }
    page = null;
    await tick();
    if (scrollParent) {
      scrollParent.scrollTop = savedMenuScroll;
      requestAnimationFrame(() => {
        if (scrollParent) scrollParent.scrollTop = savedMenuScroll;
      });
    }
  }

  let savingProfile = false;
  let savingSettings = false;

  $: if (!savingProfile && profile.updatedAt !== localProfile.updatedAt)
    localProfile = structuredClone(profile);
  $: if (!savingSettings && settings.updatedAt !== localSettings.updatedAt)
    localSettings = structuredClone(settings);
  $: scheduleValid = isValidWakeSleepPair(
    localSettings.wakeTime,
    localSettings.sleepTime,
  );

  $: i18n = useI18n(localSettings.locale);
  $: activityOptions = i18n.activityOptions;
  $: environmentOptions = i18n.environmentOptions;
  $: userTypeOptions = i18n.userTypeOptions;

  function activityLabel(value: string) {
    return i18n.activityLabel(value);
  }

  function environmentLabel(value: string) {
    return i18n.environmentLabel(value);
  }

  function userTypeLabel(value: string) {
    return i18n.userTypeLabel(value);
  }

  async function selectLanguage(localeCode: string) {
    localSettings.locale = localeCode;
    localSettings = { ...localSettings };
    await saveSettingsNow();
  }

  const ageYears = Array.from({ length: 100 }, (_, i) => i + 1);
  const ageMonths = Array.from({ length: 12 }, (_, i) => i);
  const weightOptions = Array.from({ length: 171 }, (_, i) => i + 10);

  let currentAgeUnit: "years" | "months" = localProfile.age.unit;
  let ageOptions = localProfile.age.unit === "months" ? ageMonths : ageYears;
  $: if (localProfile.age.unit !== currentAgeUnit) {
    currentAgeUnit = localProfile.age.unit;
    ageOptions = currentAgeUnit === "months" ? ageMonths : ageYears;
  }

  async function chooseUserType(value: Profile["userType"]) {
    localProfile.userType = value;

    if (value === "pregnant" || value === "breastfeeding") {
      localProfile.sex = "female";
    }

    localProfile.pregnancyTrimester =
      value === "pregnant" ? (localProfile.pregnancyTrimester ?? 1) : null;

    localProfile.lactationPeriod =
      value === "breastfeeding"
        ? (localProfile.lactationPeriod ?? "month_0_6")
        : null;

    localProfile = { ...localProfile };
    await saveProfileNow();
  }

  async function setFluidRestriction(value: boolean) {
    localProfile.fluidRestrictionByDoctor = value;

    if (value) {
      localSettings.targetMode = "manual";
      localSettings.manualTargetMl = localSettings.manualTargetMl ?? 1500;
    }

    localProfile = { ...localProfile };
    localSettings = { ...localSettings };
    await saveProfileAndSettingsNow();
  }

  async function saveProfileNow() {
    savingProfile = true;
    try {
      const now = Date.now();
      localProfile.updatedAt = now;
      await onProfileChange({ ...localProfile });
    } finally {
      savingProfile = false;
    }
  }

  async function saveProfileAndSettingsNow() {
    savingProfile = true;
    savingSettings = true;
    try {
      const now = Date.now();
      localProfile.updatedAt = now;
      localSettings.updatedAt = now;
      await onProfileSettingsChange({ ...localProfile }, { ...localSettings });
    } finally {
      savingProfile = false;
      savingSettings = false;
    }
  }

  async function saveSettingsNow() {
    savingSettings = true;
    try {
      const now = Date.now();
      localSettings.updatedAt = now;
      localSettings = { ...localSettings };
      await onSettingsChange({ ...localSettings });
    } finally {
      savingSettings = false;
    }
  }

  async function chooseActivity(value: Profile["activity"]) {
    localProfile.activity = value;
    localProfile = { ...localProfile };
    await saveProfileNow();
  }

  async function chooseEnvironment(value: Profile["environment"]) {
    localProfile.environment = value;
    localProfile = { ...localProfile };
    await saveProfileNow();
  }

  async function toggleReminder() {
    localSettings.remindersEnabled = !localSettings.remindersEnabled;
    localSettings = { ...localSettings };
    await saveSettingsNow();
  }

  async function setPush(enabled: boolean) {
    busyPush = true;
    pushMessage = "";

    try {
      if (enabled) await onEnablePush();
      else await onDisablePush();
    } catch (error) {
      pushMessage =
        error instanceof Error ? error.message : (i18n.isEnglish ? "Push operation failed." : "Operasi push gagal.");
    } finally {
      busyPush = false;
    }
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
    const startedNearLeftEdge = touchStartX <= 40;
    const horizontalGesture = Math.abs(deltaX) > Math.abs(deltaY) * 1.25;

    if (startedNearLeftEdge && horizontalGesture && deltaX >= 72) {
      if (modal) {
        modal = null;
        pendingImportFile = null;
        return;
      }

      if (sheet) {
        sheet = null;
        return;
      }

      if (page) void closeSubpage();
    }
  }

  function filePicked(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      pendingImportFile = file;
      modal = "import";
      input.value = "";
    }
  }
</script>

<svelte:window ontouchstart={handleTouchStart} ontouchend={handleTouchEnd} />

<div bind:this={containerEl}>
  {#if page}
    <!-- Sticky frosted subpage navigation bar -->
    <div
      class="sticky top-0 z-20 border-b border-slate-200/60 bg-[#F2F2F7]/90 px-[17px] pt-[max(10px,env(safe-area-inset-top))] pb-[10px] backdrop-blur-xl transition-all"
    >
      <div class="flex items-center justify-between">
        <button
          type="button"
          onclick={closeSubpage}
          class="group inline-flex items-center gap-1.5 -ml-1 text-slate-900 hover:text-water-600 active:scale-95 transition-all duration-150"
        >
          <Icon
            name="back"
            className="size-5 text-water-600 transition-transform duration-150 group-hover:-translate-x-0.5 group-active:-translate-x-0.5"
          />
          <span
            class="text-[20px] font-bold tracking-[-.03em] text-slate-900 group-hover:text-water-600 transition-colors"
          >
            {getSubpageTitle(page)}
          </span>
        </button>
      </div>
    </div>

    <header class="px-[17px] pt-3">
      {#if page === "profile"}
        <p class="text-[14px] leading-6 text-slate-500">
          {i18n.t("subpage_profile_desc")}
        </p>
      {:else if page === "activity"}
        <p class="text-[14px] leading-6 text-slate-500">
          {i18n.t("subpage_activity_desc")}
        </p>
      {:else if page === "environment"}
        <p class="text-[14px] leading-6 text-slate-500">
          {i18n.t("subpage_environment_desc")}
        </p>
      {:else if page === "data"}
        <p class="text-[14px] leading-6 text-slate-500">
          {i18n.t("subpage_data_desc")}
        </p>
      {:else if page === "privacy"}
        <p class="text-[14px] leading-6 text-slate-500">
          {i18n.t("subpage_privacy_desc")}
        </p>
      {:else if page === "formula"}
        <p class="text-[14px] leading-6 text-slate-500">
          {i18n.t("subpage_formula_desc")}
        </p>
      {:else if page === "push"}
        <p class="text-[14px] leading-6 text-slate-500">
          {i18n.t("subpage_push_desc")}
        </p>
      {/if}
    </header>

    {#if page === "profile"}
      <section class="mx-4 mt-5 grid gap-5">
        <div>
          <span class="mb-2 block text-[14px] font-semibold text-slate-500"
            >{i18n.t("user_type_label")}</span
          >
          <div class="grid grid-cols-2 gap-2">
            {#each userTypeOptions as item}
              <button
                onclick={() => chooseUserType(item.id)}
                class="rounded-2xl border px-[13px] py-[11px] text-[16px] font-semibold {localProfile.userType ===
                item.id
                  ? 'border-water-500 bg-water-50 text-water-600'
                  : 'border-slate-200 bg-white'}">{item.label}</button
              >
            {/each}
          </div>
        </div>

        <label>
          <span class="mb-2 block text-[14px] font-semibold text-slate-500"
            >{i18n.t("age_label")}</span
          >
          <div class="grid grid-cols-2 gap-2">
            <select
              value={localProfile.age.value}
              onchange={async (e) => {
                localProfile.age.value = Number(e.currentTarget.value);
                localProfile = { ...localProfile };
                await saveProfileNow();
                e.currentTarget.blur();
              }}
              class="w-full rounded-2xl border border-slate-200 bg-white pl-[17px] pr-[41px] py-[11px] text-[16px] font-semibold outline-none focus:border-water-500 transition-colors duration-150"
            >
              {#each ageOptions as item}
                <option value={item}>{item}</option>
              {/each}
            </select>
            <select
              bind:value={localProfile.age.unit}
              onchange={async (e) => {
                if (
                  localProfile.age.unit === "months" &&
                  localProfile.age.value > 11
                ) {
                  localProfile.age.value = 6;
                } else if (
                  localProfile.age.unit === "years" &&
                  localProfile.age.value < 1
                ) {
                  localProfile.age.value = 1;
                }
                localProfile = { ...localProfile };
                await saveProfileNow();
                (e.currentTarget as HTMLSelectElement)?.blur();
              }}
              class="w-full rounded-2xl border border-slate-200 bg-white pl-[17px] pr-[41px] py-[11px] text-[16px] font-semibold outline-none focus:border-water-500 transition-colors duration-150"
            >
              <option value="years">{i18n.t("age_unit_years")}</option>
              <option value="months">{i18n.t("age_unit_months")}</option>
            </select>
          </div>
        </label>

        <div>
          <span class="mb-2 block text-[14px] font-semibold text-slate-500"
            >{i18n.t("sex_label")}</span
          >
          <div class="grid grid-cols-2 gap-2">
            <button
              onclick={async () => {
                localProfile.sex = "male";
                localProfile = { ...localProfile };
                await saveProfileNow();
              }}
              disabled={localProfile.userType === "pregnant" ||
                localProfile.userType === "breastfeeding"}
              class="rounded-2xl border px-[13px] py-[11px] text-[16px] font-semibold {localProfile.sex ===
              'male'
                ? 'border-water-500 bg-water-50 text-water-600 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'} disabled:opacity-40"
              >{i18n.t("sex_male")}</button
            >
            <button
              onclick={async () => {
                localProfile.sex = "female";
                localProfile = { ...localProfile };
                await saveProfileNow();
              }}
              class="rounded-2xl border px-[13px] py-[11px] text-[16px] font-semibold {localProfile.sex ===
              'female'
                ? 'border-water-500 bg-water-50 text-water-600 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'}"
              >{i18n.t("sex_female")}</button
            >
          </div>
        </div>

        {#if localProfile.userType === "pregnant"}
          <div>
            <span class="mb-2 block text-[14px] font-semibold text-slate-500"
              >{i18n.t("trimester_label")}</span
            >
            <div class="grid grid-cols-3 gap-2">
              {#each [1, 2, 3] as trimester}
                <button
                  onclick={async () => {
                    localProfile.pregnancyTrimester = trimester as 1 | 2 | 3;
                    localProfile = { ...localProfile };
                    await saveProfileNow();
                  }}
                  class="rounded-2xl border py-[11px] text-[16px] font-semibold {localProfile.pregnancyTrimester ===
                  trimester
                    ? 'border-water-500 bg-water-50 text-water-600 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'}"
                  >{trimester}</button
                >
              {/each}
            </div>
          </div>
        {/if}

        {#if localProfile.userType === "breastfeeding"}
          <div>
            <span class="mb-2 block text-[14px] font-semibold text-slate-500"
              >{i18n.t("lactation_label")}</span
            >
            <div class="grid grid-cols-2 gap-2">
              <button
                onclick={async () => {
                  localProfile.lactationPeriod = "month_0_6";
                  localProfile = { ...localProfile };
                  await saveProfileNow();
                }}
                class="rounded-2xl border px-[13px] py-[11px] text-[16px] font-semibold {localProfile.lactationPeriod ===
                'month_0_6'
                  ? 'border-water-500 bg-water-50 text-water-600 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'}"
                >{i18n.t("lactation_0_6")}</button
              >
              <button
                onclick={async () => {
                  localProfile.lactationPeriod = "month_7_12";
                  localProfile = { ...localProfile };
                  await saveProfileNow();
                }}
                class="rounded-2xl border px-[13px] py-[11px] text-[16px] font-semibold {localProfile.lactationPeriod ===
                'month_7_12'
                  ? 'border-water-500 bg-water-50 text-water-600 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'}"
                >{i18n.t("lactation_7_12")}</button
              >
            </div>
          </div>
        {/if}

        <label>
          <span class="mb-2 block text-[14px] font-semibold text-slate-500"
            >{i18n.t("weight_label")}</span
          >
          <div class="relative">
            <select
              value={localProfile.weightKg ?? ""}
              onchange={async (e) => {
                const val = e.currentTarget.value;
                localProfile.weightKg = val === "" ? null : Number(val);
                localProfile = { ...localProfile };
                await saveProfileNow();
                (e.currentTarget as HTMLSelectElement)?.blur();
              }}
              class="w-full rounded-2xl border border-slate-200 bg-white pl-[17px] pr-[41px] py-[11px] text-[16px] font-semibold outline-none focus:border-water-500 transition-colors duration-150"
            >
              <option value="">{i18n.t("weight_empty")}</option>
              {#each weightOptions as item}
                <option value={item}>{item} kg</option>
              {/each}
            </select>
          </div>
        </label>

        <div>
          <span class="mb-2 block text-[14px] font-semibold text-slate-500"
            >{i18n.t("fluid_restriction_label")}</span
          >
          <div class="grid grid-cols-2 gap-2">
            <button
              onclick={() => setFluidRestriction(false)}
              class="rounded-2xl border py-[11px] text-[16px] font-semibold {!localProfile.fluidRestrictionByDoctor
                ? 'border-water-500 bg-water-50 text-water-600 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'}"
              >{i18n.t("no")}</button
            >
            <button
              onclick={() => setFluidRestriction(true)}
              class="rounded-2xl border py-[11px] text-[16px] font-semibold {localProfile.fluidRestrictionByDoctor
                ? 'border-water-500 bg-water-50 text-water-600 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'}"
              >{i18n.t("yes")}</button
            >
          </div>
        </div>

        {#if localProfile.fluidRestrictionByDoctor}
          <label>
            <span class="mb-2 block text-[14px] font-semibold text-slate-500"
              >{i18n.t("medical_target_label")}</span
            >
            <div
              class="flex items-center rounded-2xl border border-slate-200 bg-white px-[17px]"
            >
              <input
                type="number"
                min="1"
                inputmode="numeric"
                pattern="[0-9]*"
                bind:value={localSettings.manualTargetMl}
                onchange={saveProfileAndSettingsNow}
                onblur={saveProfileAndSettingsNow}
                class="min-w-0 flex-1 py-[11px] text-[16px] font-semibold outline-none"
              />
              <span class="text-[14px] text-slate-400">{i18n.t("unit_ml_per_day")}</span>
            </div>
          </label>
        {/if}
      </section>
    {:else if page === "activity"}
      <section class="mx-4 mt-5 grid gap-2.5">
        {#each activityOptions as item}
          <button
            onclick={() => chooseActivity(item.id)}
            class="rounded-2xl border px-[17px] py-[11px] text-left {localProfile.activity ===
            item.id
              ? 'border-water-500 bg-water-50 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'}"
          >
            <h3
              class="block text-[16px] font-semibold {localProfile.activity ===
              item.id
                ? 'text-blue-900'
                : 'text-slate-900'}"
            >
              {item.label}
            </h3>
            <p
              class="mt-1 block text-[14px] leading-5 {localProfile.activity ===
              item.id
                ? 'text-blue-700/80'
                : 'text-slate-400'}"
            >
              {item.description}
            </p>
          </button>
        {/each}
      </section>
    {:else if page === "environment"}
      <section class="mx-4 mt-5 grid gap-2.5">
        {#each environmentOptions as item}
          <button
            onclick={() => chooseEnvironment(item.id)}
            class="rounded-2xl border px-[17px] py-[11px] text-left {localProfile.environment ===
            item.id
              ? 'border-water-500 bg-water-50 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'}"
          >
            <h3
              class="block text-[16px] font-semibold {localProfile.environment ===
              item.id
                ? 'text-blue-900'
                : 'text-slate-900'}"
            >
              {item.label}
            </h3>
            <p
              class="mt-1 block text-[14px] leading-5 {localProfile.environment ===
              item.id
                ? 'text-blue-700/80'
                : 'text-slate-400'}"
            >
              {item.description}
            </p>
          </button>
        {/each}
      </section>
    {:else if page === "data"}
      <section class="mx-4 mt-5 space-y-4">
        <div class="rounded-2xl bg-white p-[13px] shadow-sm">
          <h2 class="text-[16px] font-bold">IndexedDB</h2>
          <p class="mt-2 text-[14px] leading-6 text-slate-500">
            {i18n.t("data_indexeddb_desc")}
          </p>
          <div
            class="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-[13px] py-[11px]"
          >
            <span class="text-[14px] font-semibold text-slate-600"
              >{i18n.t("data_storage_label")}</span
            >
            <span
              class="text-[12px] font-semibold {meta.storagePersistent
                ? 'text-emerald-600'
                : 'text-slate-400'}"
            >
              {meta.storagePersistent ? i18n.t("data_storage_active") : i18n.t("data_storage_browser")}
            </span>
          </div>
        </div>
        <button
          onclick={() => (modal = "export")}
          class="flex w-full items-center gap-2.5 rounded-2xl bg-white px-[17px] py-[11px] text-left shadow-sm hover:bg-slate-50 hover:shadow active:scale-[.99] transition-all duration-150"
          ><Icon name="download" className="size-5 text-slate-500" /><span
            class="text-[16px] font-semibold">{i18n.t("data_export_btn")}</span
          ></button
        >
        <label
          class="flex w-full cursor-pointer items-center gap-2.5 rounded-2xl bg-white px-[17px] py-[11px] shadow-sm hover:bg-slate-50 hover:shadow active:scale-[.99] transition-all duration-150"
          ><Icon name="upload" className="size-5 text-slate-500" /><span
            class="text-[16px] font-semibold">{i18n.t("data_import_btn")}</span
          ><input
            type="file"
            accept="application/json,.json"
            class="hidden"
            onchange={filePicked}
          /></label
        >
      </section>
    {:else if page === "privacy"}
      <section class="mx-4 mt-5 space-y-4">
        <div class="rounded-2xl bg-white p-[13px] shadow-sm">
          <h2 class="text-[16px] font-bold">{i18n.t("privacy_local_title")}</h2>
          <p class="mt-2 text-[14px] leading-6 text-slate-500">
            {i18n.t("privacy_local_desc")}
          </p>
        </div>
        <div class="rounded-2xl bg-white p-[13px] shadow-sm">
          <h2 class="text-[16px] font-bold">{i18n.t("privacy_push_title")}</h2>
          <p class="mt-2 text-[14px] leading-6 text-slate-500">
            {i18n.t("privacy_push_desc")}
          </p>
        </div>
      </section>
    {:else if page === "formula"}
      <section class="mx-4 mt-5 space-y-4">
        <div class="rounded-2xl bg-white p-[13px] shadow-sm">
          <p
            class="text-[12px] font-semibold uppercase tracking-[.08em] text-water-600"
          >
            {i18n.t("formula_step1_badge")}
          </p>
          <h2 class="mt-2 text-[16px] font-bold">{i18n.t("formula_step1_title")}</h2>
          <p class="mt-2 text-[14px] leading-6 text-slate-500">
            {i18n.t("formula_step1_desc")}
          </p>
          <div class="mt-3 overflow-hidden rounded-2xl border border-slate-100">
            <div
              class="grid grid-cols-[1fr_auto] gap-2.5 bg-slate-50 px-[17px] py-[11px] text-[12px] font-semibold text-slate-400"
            >
              <span>{i18n.t("formula_col_group")}</span><span>{i18n.t("unit_ml_per_day")}</span>
            </div>
            <div
              class="grid grid-cols-[1fr_auto] gap-2.5 border-t border-slate-100 px-[17px] py-[11px] text-[14px]"
            >
              <span>{i18n.t("formula_age_0_5_months")}</span><strong class="font-semibold">700</strong>
            </div>
            <div
              class="grid grid-cols-[1fr_auto] gap-2.5 border-t border-slate-100 px-[17px] py-[11px] text-[14px]"
            >
              <span>{i18n.t("formula_age_6_11_months")}</span><strong class="font-semibold">900</strong>
            </div>
            <div
              class="grid grid-cols-[1fr_auto] gap-2.5 border-t border-slate-100 px-[17px] py-[11px] text-[14px]"
            >
              <span>{i18n.t("formula_age_1_3_years")}</span><strong class="font-semibold">1.150</strong>
            </div>
            <div
              class="grid grid-cols-[1fr_auto] gap-2.5 border-t border-slate-100 px-[17px] py-[11px] text-[14px]"
            >
              <span>{i18n.t("formula_age_4_6_years")}</span><strong class="font-semibold">1.450</strong>
            </div>
            <div
              class="grid grid-cols-[1fr_auto] gap-2.5 border-t border-slate-100 px-[17px] py-[11px] text-[14px]"
            >
              <span>{i18n.t("formula_age_7_9_years")}</span><strong class="font-semibold">1.650</strong>
            </div>
            <div
              class="grid grid-cols-[1fr_auto] gap-2.5 border-t border-slate-100 px-[17px] py-[11px] text-[14px]"
            >
              <span>{i18n.t("formula_age_10_12_years")}</span><strong class="font-semibold"
                >1.850</strong
              >
            </div>
            <div
              class="grid grid-cols-[1fr_auto] gap-2.5 border-t border-slate-100 px-[17px] py-[11px] text-[14px]"
            >
              <span>{i18n.t("formula_age_13_15_years")}</span><strong class="font-semibold"
                >2.100</strong
              >
            </div>
            <div
              class="grid grid-cols-[1fr_auto] gap-2.5 border-t border-slate-100 px-[17px] py-[11px] text-[14px]"
            >
              <span>{i18n.t("formula_age_16_18_years")}</span><strong class="font-semibold"
                >2.300 / 2.150</strong
              >
            </div>
            <div
              class="grid grid-cols-[1fr_auto] gap-2.5 border-t border-slate-100 px-[17px] py-[11px] text-[14px]"
            >
              <span>{i18n.t("formula_age_19_64_years")}</span><strong class="font-semibold"
                >2.500 / 2.350</strong
              >
            </div>
            <div
              class="grid grid-cols-[1fr_auto] gap-2.5 border-t border-slate-100 px-[17px] py-[11px] text-[14px]"
            >
              <span>{i18n.t("formula_age_65_80_years")}</span><strong class="font-semibold"
                >1.800 / 1.550</strong
              >
            </div>
            <div
              class="grid grid-cols-[1fr_auto] gap-2.5 border-t border-slate-100 px-[17px] py-[11px] text-[14px]"
            >
              <span>{i18n.t("formula_age_gt_80_years")}</span><strong class="font-semibold"
                >1.600 / 1.400</strong
              >
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-[13px] shadow-sm">
          <p
            class="text-[12px] font-semibold uppercase tracking-[.08em] text-water-600"
          >
            {i18n.t("formula_step2_badge")}
          </p>
          <h2 class="mt-2 text-[16px] font-bold">{i18n.t("formula_step2_title")}</h2>
          <div class="mt-3 space-y-3 text-[14px] leading-6 text-slate-500">
            <p>
              <strong class="font-semibold text-slate-800">{i18n.t("formula_pregnant")}</strong> {i18n.t("formula_pregnant_desc")}
            </p>
            <p>
              <strong class="font-semibold text-slate-800"
                >{i18n.t("formula_breastfeeding_0_6")}</strong
              > {i18n.t("formula_breastfeeding_0_6_desc")}
            </p>
            <p>
              <strong class="font-semibold text-slate-800"
                >{i18n.t("formula_breastfeeding_7_12")}</strong
              > {i18n.t("formula_breastfeeding_7_12_desc")}
            </p>
          </div>
        </div>

        <div class="rounded-2xl bg-water-50 p-[13px]">
          <p
            class="text-[12px] font-semibold uppercase tracking-[.08em] text-water-600"
          >
            {i18n.t("formula_step3_badge")}
          </p>
          <h2 class="mt-2 text-[16px] font-bold text-slate-900">
            {i18n.t("formula_step3_title")}
          </h2>
          <div
            class="mt-3 rounded-2xl bg-white px-[17px] py-[11px] text-center shadow-sm"
          >
            <p class="text-[14px] text-slate-500">{i18n.t("formula_water_target")}</p>
            <p class="mt-2 text-[20px] font-bold tracking-[-.03em]">
              {i18n.t("formula_formula_calc")}
            </p>
            <p class="mt-2 text-[12px] leading-5 text-slate-400">
              {i18n.t("formula_round_note")}
            </p>
          </div>
          <p class="mt-3 text-[14px] leading-6 text-slate-500">
            {i18n.t("formula_calc_example")}
          </p>
          <p class="mt-3 text-[12px] leading-5 text-slate-400">
            {i18n.t("formula_disclaimer")}
          </p>
        </div>

        <div class="rounded-2xl bg-white p-[13px] shadow-sm">
          <h2 class="text-[16px] font-bold">{i18n.t("formula_special_rules_title")}</h2>
          <div class="mt-3 space-y-3 text-[14px] leading-6 text-slate-500">
            <p>
              <strong class="font-semibold text-slate-800">{i18n.t("formula_rule_0_5_title")}</strong> {i18n.t("formula_rule_0_5_desc")}
            </p>
            <p>
              <strong class="font-semibold text-slate-800">{i18n.t("formula_rule_6_11_title")}</strong> {i18n.t("formula_rule_6_11_desc")}
            </p>
            <p>
              <strong class="font-semibold text-slate-800"
                >{i18n.t("formula_rule_doctor_title")}</strong
              > {i18n.t("formula_rule_doctor_desc")}
            </p>
            <p>
              <strong class="font-semibold text-slate-800"
                >{i18n.t("formula_rule_activity_title")}</strong
              >
              {i18n.t("formula_rule_activity_desc")}
            </p>
          </div>
        </div>
      </section>
    {:else if page === "push"}
      <section class="mx-4 mt-5 space-y-4">
        <div class="rounded-2xl bg-white p-[13px] shadow-sm">
          <div class="flex items-start gap-2.5">
            <div
              class="grid size-8 shrink-0 place-items-center rounded-2xl bg-water-50 text-water-600"
            >
              <Icon name="bell" className="size-5" />
            </div>
            <div>
              <h2 class="text-[16px] font-bold">
                {meta.pushEnabled ? i18n.t("push_active_title") : i18n.t("push_inactive_title")}
              </h2>
              <p class="mt-2 text-[14px] leading-6 text-slate-500">
                {i18n.t("push_permission_label")}: {pushCapability?.permission ?? i18n.t("push_not_checked")}.
              </p>
              {#if pushCapability && !pushCapability.standalone}<p
                  class="mt-2 text-[14px] leading-6 text-slate-500"
                >
                  {i18n.t("push_ios_instruction")}
                </p>{/if}
            </div>
          </div>
        </div>
        {#if pushMessage}<div
            class="rounded-2xl bg-amber-50 px-[17px] py-[11px] text-[14px] leading-6 text-amber-800"
          >
            {pushMessage}
          </div>{/if}
        {#if meta.pushEnabled}<button
            disabled={busyPush}
            onclick={() => setPush(false)}
            class="w-full rounded-2xl bg-slate-900 py-[11px] text-[16px] font-bold text-white hover:bg-slate-800 active:scale-[.99] transition-all duration-150 disabled:opacity-50"
            >{i18n.t("push_btn_disable")}</button
          >{:else}<button
            disabled={busyPush}
            onclick={() => setPush(true)}
            class="w-full rounded-2xl bg-water-500 py-[11px] text-[16px] font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-water-600 active:scale-[.99] transition-all duration-150 disabled:opacity-50"
            >{i18n.t("push_btn_enable")}</button
          >{/if}
        <p class="text-[12px] leading-5 text-slate-400">
          {i18n.t("push_dev_note")}
        </p>
      </section>
    {/if}
  {:else}
    <div>
      <!-- Sticky Frosted Header for Main Settings -->
      <div
        class="sticky top-0 z-20 border-b border-slate-200/60 bg-[#F2F2F7]/90 px-[17px] pt-[max(10px,env(safe-area-inset-top))] pb-[10px] backdrop-blur-xl transition-all"
      >
        <div class="flex items-center justify-between">
          <h1 class="text-[20px] font-bold tracking-[-.03em] text-slate-900">
            {i18n.t("settings_title")}
          </h1>
        </div>
      </div>

      <section class="mx-4 mt-5">
        <h2
          class="mb-2 px-[5px] text-[12px] font-semibold uppercase tracking-[.08em] text-slate-400"
        >
          {i18n.t("section_targets")}
        </h2>
        <div
          class="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm"
        >
          <button
            onclick={() => (sheet = "target")}
            class="group flex min-h-[50px] w-full items-center gap-2.5 px-[17px] py-[14px] text-left hover:bg-slate-50/80 active:bg-slate-100/90 active:scale-[.995] transition-all duration-150"
            ><div
              class="grid size-8 place-items-center rounded-2xl bg-water-100/60 text-water-600 transition-colors group-hover:bg-water-200/40"
            >
              <Icon name="drop" className="size-4" />
            </div>
            <div class="flex-1">
              <p class="text-[15px] font-semibold">{i18n.t("menu_daily_target")}</p>
              <p class="mt-1 text-[14px] text-slate-400">
                {localSettings.targetMode === "automatic"
                  ? i18n.t("target_mode_auto")
                  : i18n.t("target_mode_manual")}
              </p>
            </div>
            <Icon
              name="chevron"
              className="size-4 text-slate-300 transition-all duration-150 group-hover:text-slate-400 group-hover:translate-x-0.5"
            /></button
          >
          <button
            onclick={toggleReminder}
            class="group flex min-h-[50px] w-full items-center gap-2.5 px-[17px] py-[14px] text-left hover:bg-slate-50/80 active:bg-slate-100/90 active:scale-[.995] transition-all duration-150"
            ><div
              class="grid size-8 place-items-center rounded-2xl bg-water-100/60 text-water-600 transition-colors group-hover:bg-water-200/40"
            >
              <Icon name="bell" className="size-4" />
            </div>
            <div class="flex-1">
              <p class="text-[16px] font-semibold">{i18n.t("menu_auto_reminder")}</p>
              <p class="mt-1 text-[14px] text-slate-400">
                {i18n.t("menu_auto_reminder_desc")}
              </p>
            </div>
            <span
              class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out {localSettings.remindersEnabled
                ? 'bg-water-500'
                : 'bg-slate-200'}"
              ><span
                class="pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out mt-1 ml-1 {localSettings.remindersEnabled
                  ? 'translate-x-5'
                  : 'translate-x-0'}"
              ></span></span
            ></button
          >
          <button
            onclick={() => openSubpage("push")}
            class="group flex min-h-[50px] w-full items-center gap-2.5 px-[17px] py-[14px] text-left hover:bg-slate-50/80 active:bg-slate-100/90 active:scale-[.995] transition-all duration-150"
            ><div
              class="grid size-8 place-items-center rounded-2xl bg-water-100/60 text-water-600 transition-colors group-hover:bg-water-200/40"
            >
              <Icon name="phone" className="size-4" />
            </div>
            <div class="flex-1">
              <p class="text-[15px] font-semibold">{i18n.t("menu_notifications")}</p>
              <p class="mt-1 text-[14px] text-slate-400">
                {meta.pushEnabled ? i18n.t("push_status_active") : i18n.t("push_status_inactive")}
              </p>
            </div>
            <Icon
              name="chevron"
              className="size-4 text-slate-300 transition-all duration-150 group-hover:text-slate-400 group-hover:translate-x-0.5"
            /></button
          >
          <button
            onclick={() => (sheet = "wake")}
            class="group flex min-h-[50px] w-full items-center gap-2.5 px-[17px] py-[14px] text-left hover:bg-slate-50/80 active:bg-slate-100/90 active:scale-[.995] transition-all duration-150"
            ><div
              class="grid size-8 place-items-center rounded-2xl bg-water-100/60 text-water-600 transition-colors group-hover:bg-water-200/40"
            >
              <Icon name="clock" className="size-4" />
            </div>
            <div class="flex-1">
              <p class="text-[16px] font-semibold">{i18n.t("menu_wake_time")}</p>
              <p class="mt-1 text-[14px] text-slate-400">
                {localSettings.wakeTime}
              </p>
            </div>
            <Icon
              name="chevron"
              className="size-4 text-slate-300 transition-all duration-150 group-hover:text-slate-400 group-hover:translate-x-0.5"
            /></button
          >
          <button
            onclick={() => (sheet = "sleep")}
            class="group flex min-h-[50px] w-full items-center gap-2.5 px-[17px] py-[14px] text-left hover:bg-slate-50/80 active:bg-slate-100/90 active:scale-[.995] transition-all duration-150"
            ><div
              class="grid size-8 place-items-center rounded-2xl bg-water-100/60 text-water-600 transition-colors group-hover:bg-water-200/40"
            >
              <Icon name="moon" className="size-4" />
            </div>
            <div class="flex-1">
              <p class="text-[16px] font-semibold">{i18n.t("menu_sleep_time")}</p>
              <p class="mt-1 text-[14px] text-slate-400">
                {localSettings.sleepTime}
              </p>
            </div>
            <Icon
              name="chevron"
              className="size-4 text-slate-300 transition-all duration-150 group-hover:text-slate-400 group-hover:translate-x-0.5"
            /></button
          >
        </div>
      </section>

      <!-- Language / Preferences Section -->
      <section class="mx-4 mt-5">
        <h2
          class="mb-2 px-[5px] text-[12px] font-semibold uppercase tracking-[.08em] text-slate-400"
        >
          {i18n.t("section_preferences")}
        </h2>
        <div
          class="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm"
        >
          <button
            onclick={() => (sheet = "language")}
            class="group flex min-h-[50px] w-full items-center gap-2.5 px-[17px] py-[14px] text-left hover:bg-slate-50/80 active:bg-slate-100/90 active:scale-[.995] transition-all duration-150"
          >
            <div
              class="grid size-8 place-items-center rounded-2xl bg-water-100/60 text-water-600 transition-colors group-hover:bg-water-200/40"
            >
              <Icon name="globe" className="size-4" />
            </div>
            <div class="flex-1">
              <p class="text-[16px] font-semibold">{i18n.t("menu_language")}</p>
              <p class="mt-1 text-[14px] text-slate-400">
                {i18n.isIndonesian ? "Bahasa Indonesia" : "English"}
              </p>
            </div>
            <Icon
              name="chevron"
              className="size-4 text-slate-300 transition-all duration-150 group-hover:text-slate-400 group-hover:translate-x-0.5"
            />
          </button>
        </div>
      </section>

      <section class="mx-4 mt-5">
        <h2
          class="mb-2 px-[5px] text-[12px] font-semibold uppercase tracking-[.08em] text-slate-400"
        >
          {i18n.t("section_profile")}
        </h2>
        <div
          class="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm"
        >
          <button
            onclick={() => openSubpage("profile")}
            class="group flex min-h-[50px] w-full items-center gap-2.5 px-[17px] py-[14px] text-left hover:bg-slate-50/80 active:bg-slate-100/90 active:scale-[.995] transition-all duration-150"
            ><div
              class="grid size-8 place-items-center rounded-2xl bg-water-100/60 text-water-600 transition-colors group-hover:bg-water-200/40"
            >
              <Icon name="user" className="size-4" />
            </div>
            <div class="flex-1">
              <p class="text-[16px] font-semibold">{i18n.t("menu_profile")}</p>
              <p class="mt-1 text-[14px] text-slate-400">
                {userTypeLabel(localProfile.userType)}
              </p>
            </div>
            <Icon
              name="chevron"
              className="size-4 text-slate-300 transition-all duration-150 group-hover:text-slate-400 group-hover:translate-x-0.5"
            /></button
          >
          <button
            onclick={() => openSubpage("activity")}
            class="group flex min-h-[50px] w-full items-center gap-2.5 px-[17px] py-[14px] text-left hover:bg-slate-50/80 active:bg-slate-100/90 active:scale-[.995] transition-all duration-150"
            ><div
              class="grid size-8 place-items-center rounded-2xl bg-water-100/60 text-water-600 transition-colors group-hover:bg-water-200/40"
            >
              <Icon name="activity" className="size-4" />
            </div>
            <div class="flex-1">
              <p class="text-[16px] font-semibold">{i18n.t("menu_activity")}</p>
              <p class="mt-1 text-[14px] text-slate-400">
                {activityLabel(localProfile.activity)}
              </p>
            </div>
            <Icon
              name="chevron"
              className="size-4 text-slate-300 transition-all duration-150 group-hover:text-slate-400 group-hover:translate-x-0.5"
            /></button
          >
          <button
            onclick={() => openSubpage("environment")}
            class="group flex min-h-[50px] w-full items-center gap-2.5 px-[17px] py-[14px] text-left hover:bg-slate-50/80 active:bg-slate-100/90 active:scale-[.995] transition-all duration-150"
            ><div
              class="grid size-8 place-items-center rounded-2xl bg-water-100/60 text-water-600 transition-colors group-hover:bg-water-200/40"
            >
              <Icon name="sun" className="size-4" />
            </div>
            <div class="flex-1">
              <p class="text-[16px] font-semibold">{i18n.t("menu_environment")}</p>
              <p class="mt-1 text-[14px] text-slate-400">
                {environmentLabel(localProfile.environment)}
              </p>
            </div>
            <Icon
              name="chevron"
              className="size-4 text-slate-300 transition-all duration-150 group-hover:text-slate-400 group-hover:translate-x-0.5"
            /></button
          >
        </div>
      </section>

      <section class="mx-4 mt-5">
        <h2
          class="mb-2 px-[5px] text-[12px] font-semibold uppercase tracking-[.08em] text-slate-400"
        >
          {i18n.t("section_data_privacy")}
        </h2>
        <div
          class="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm"
        >
          <button
            onclick={() => openSubpage("formula")}
            class="group flex min-h-[50px] w-full items-center gap-2.5 px-[17px] py-[14px] text-left hover:bg-slate-50/80 active:bg-slate-100/90 active:scale-[.995] transition-all duration-150"
            ><div
              class="grid size-8 place-items-center rounded-2xl bg-water-100/60 text-water-600 transition-colors group-hover:bg-water-200/40"
            >
              <Icon name="info" className="size-4" />
            </div>
            <div class="flex-1">
              <p class="text-[16px] font-semibold">{i18n.t("menu_formula")}</p>
              <p class="mt-1 text-[14px] text-slate-400">
                {i18n.t("menu_formula_desc")}
              </p>
            </div>
            <Icon
              name="chevron"
              className="size-4 text-slate-300 transition-all duration-150 group-hover:text-slate-400 group-hover:translate-x-0.5"
            /></button
          >
          <button
            onclick={() => openSubpage("data")}
            class="group flex min-h-[50px] w-full items-center gap-2.5 px-[17px] py-[14px] text-left hover:bg-slate-50/80 active:bg-slate-100/90 active:scale-[.995] transition-all duration-150"
            ><div
              class="grid size-8 place-items-center rounded-2xl bg-water-100/60 text-water-600 transition-colors group-hover:bg-water-200/40"
            >
              <Icon name="database" className="size-4" />
            </div>
            <div class="flex-1">
              <p class="text-[16px] font-semibold">{i18n.t("menu_device_data")}</p>
              <p class="mt-1 text-[14px] text-slate-400">{i18n.t("menu_device_data_desc")}</p>
            </div>
            <Icon
              name="chevron"
              className="size-4 text-slate-300 transition-all duration-150 group-hover:text-slate-400 group-hover:translate-x-0.5"
            /></button
          >
          <button
            onclick={() => openSubpage("privacy")}
            class="group flex min-h-[50px] w-full items-center gap-2.5 px-[17px] py-[14px] text-left hover:bg-slate-50/80 active:bg-slate-100/90 active:scale-[.995] transition-all duration-150"
            ><div
              class="grid size-8 place-items-center rounded-2xl bg-water-100/60 text-water-600 transition-colors group-hover:bg-water-200/40"
            >
              <Icon name="shield" className="size-4" />
            </div>
            <div class="flex-1">
              <p class="text-[16px] font-semibold">{i18n.t("menu_privacy")}</p>
              <p class="mt-1 text-[14px] text-slate-400">{i18n.t("menu_privacy_desc")}</p>
            </div>
            <Icon
              name="chevron"
              className="size-4 text-slate-300 transition-all duration-150 group-hover:text-slate-400 group-hover:translate-x-0.5"
            /></button
          >
        </div>
      </section>

      <section class="mx-4 mt-5">
        <button
          onclick={() => (modal = "reset")}
          class="flex w-full items-center gap-2.5 rounded-2xl bg-white px-[17px] py-[11px] text-left shadow-sm hover:bg-rose-50/40 hover:border-rose-100 active:bg-rose-50 active:scale-[.99] transition-all duration-150"
          ><div
            class="grid size-8 place-items-center rounded-2xl bg-rose-50 text-rose-600"
          >
            <Icon name="trash" className="size-4" />
          </div>
          <div>
            <p class="text-[16px] font-semibold text-rose-600">
              {i18n.t("menu_reset")}
            </p>
            <p class="mt-1 text-[14px] text-slate-400">
              {i18n.t("menu_reset_desc")}
            </p>
          </div></button
        >
      </section>
    </div>
  {/if}
</div>

{#if sheet === "target"}
  <BottomSheet
    title={i18n.t("sheet_target_title")}
    closeLabel={i18n.t("close")}
    onClose={() => {
      localSettings = structuredClone(settings);
      sheet = null;
    }}
  >
    <div class="grid grid-cols-2 rounded-2xl bg-slate-100 p-[5px]">
      <button
        disabled={localProfile.fluidRestrictionByDoctor}
        onclick={() => {
          localSettings.targetMode = "automatic";
          localSettings = { ...localSettings };
        }}
        class="rounded-xl py-[11px] text-[14px] font-semibold {localSettings.targetMode ===
        'automatic'
          ? 'bg-white shadow-sm'
          : 'text-slate-500'} disabled:opacity-40">{i18n.t("target_mode_auto")}</button
      >
      <button
        onclick={() => {
          localSettings.targetMode = "manual";
          localSettings.manualTargetMl = localSettings.manualTargetMl ?? 2000;
          localSettings = { ...localSettings };
        }}
        class="rounded-xl py-[11px] text-[14px] font-semibold {localSettings.targetMode ===
        'manual'
          ? 'bg-white shadow-sm'
          : 'text-slate-500'}">{i18n.t("target_mode_manual")}</button
      >
    </div>
    {#if localSettings.targetMode === "manual"}<div
        class="mt-3 flex items-center rounded-2xl border border-slate-200 px-[17px]"
      >
        <input
          type="number"
          min="1"
          inputmode="numeric"
          pattern="[0-9]*"
          bind:value={localSettings.manualTargetMl}
          class="min-w-0 flex-1 py-[11px] text-[16px] font-bold outline-none"
        /><span class="text-[14px] text-slate-400">{i18n.t("unit_ml_per_day")}</span>
      </div>{/if}
    <button
      onclick={async () => {
        await saveSettingsNow();
        sheet = null;
      }}
      disabled={localSettings.targetMode === "manual" &&
        (!localSettings.manualTargetMl || localSettings.manualTargetMl <= 0)}
      class="mt-4 w-full rounded-2xl bg-water-500 py-[11px] text-[16px] font-bold text-white shadow-lg shadow-blue-500/20 active:scale-[.99] disabled:opacity-40"
      >{i18n.t("save")}</button
    >
  </BottomSheet>
{:else if sheet === "wake"}
  <BottomSheet
    title={i18n.t("sheet_wake_title")}
    closeLabel={i18n.t("close")}
    onClose={() => {
      localSettings = structuredClone(settings);
      sheet = null;
    }}
  >
    <TimeSelect bind:value={localSettings.wakeTime} label={i18n.t("sheet_wake_title")} hourLabel={i18n.t("hours")} minuteLabel={i18n.t("minutes")} />
    {#if !scheduleValid}<p
        class="mt-3 rounded-2xl bg-amber-50 px-[13px] py-[9px] text-[14px] text-amber-800"
      >
        {i18n.t("schedule_invalid_msg")}
      </p>{/if}
    <button
      disabled={!scheduleValid}
      onclick={async () => {
        await saveSettingsNow();
        sheet = null;
      }}
      class="mt-4 w-full rounded-2xl bg-water-500 py-[11px] text-[16px] font-bold text-white shadow-lg shadow-blue-500/20 active:scale-[.99] disabled:opacity-40"
      >{i18n.t("save")}</button
    >
  </BottomSheet>
{:else if sheet === "sleep"}
  <BottomSheet
    title={i18n.t("sheet_sleep_title")}
    closeLabel={i18n.t("close")}
    onClose={() => {
      localSettings = structuredClone(settings);
      sheet = null;
    }}
  >
    <TimeSelect bind:value={localSettings.sleepTime} label={i18n.t("sheet_sleep_title")} hourLabel={i18n.t("hours")} minuteLabel={i18n.t("minutes")} />
    {#if !scheduleValid}<p
        class="mt-3 rounded-2xl bg-amber-50 px-[13px] py-[9px] text-[14px] text-amber-800"
      >
        {i18n.t("schedule_invalid_msg")}
      </p>{/if}
    <button
      disabled={!scheduleValid}
      onclick={async () => {
        await saveSettingsNow();
        sheet = null;
      }}
      class="mt-4 w-full rounded-2xl bg-water-500 py-[11px] text-[16px] font-bold text-white shadow-lg shadow-blue-500/20 active:scale-[.99] disabled:opacity-40"
      >{i18n.t("save")}</button
    >
  </BottomSheet>
{:else if sheet === "language"}
  <BottomSheet
    title={i18n.t("language_sheet_title")}
    closeLabel={i18n.t("close")}
    onClose={() => {
      sheet = null;
    }}
  >
    <div class="space-y-2.5">
      {#each LANGUAGE_OPTIONS as opt}
        {@const isSelected = (opt.id === "en" && i18n.isEnglish) || (opt.id === "id" && i18n.isIndonesian)}
        <button
          onclick={async () => {
            await selectLanguage(opt.localeCode);
            sheet = null;
          }}
          class="group flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all duration-150 {isSelected
            ? 'border-water-500 bg-water-50/80 shadow-sm'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'}"
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl" role="img" aria-label={opt.name}>{opt.flag}</span>
            <div>
              <p class="text-[16px] font-semibold {isSelected ? 'text-water-900 font-bold' : 'text-slate-900'}">
                {opt.label}
              </p>
              <p class="mt-0.5 text-[12px] {isSelected ? 'text-water-600' : 'text-slate-400'}">
                {opt.id === "id" ? i18n.t("lang_id_desc") : i18n.t("lang_en_desc")}
              </p>
            </div>
          </div>
          {#if isSelected}
            <div class="grid size-6 place-items-center rounded-full bg-water-500 text-white shadow-sm">
              <Icon name="check" className="size-3.5" />
            </div>
          {/if}
        </button>
      {/each}
    </div>
  </BottomSheet>
{/if}

<Modal
  open={modal === "reset"}
  title={i18n.t("modal_reset_title")}
  message={i18n.t("modal_reset_msg")}
  confirmText={i18n.t("modal_reset_confirm")}
  cancelText={i18n.t("cancel")}
  variant="danger"
  iconName="trash"
  onConfirm={confirmReset}
  onCancel={() => (modal = null)}
/>

<Modal
  open={modal === "export"}
  title={i18n.t("modal_export_title")}
  message={i18n.t("modal_export_msg")}
  confirmText={i18n.t("modal_export_confirm")}
  cancelText={i18n.t("cancel")}
  variant="primary"
  iconName="download"
  onConfirm={confirmExport}
  onCancel={() => (modal = null)}
>
  <div class="mt-3 rounded-2xl bg-slate-50 p-3 text-left">
    <div class="flex items-center justify-between text-[12px] text-slate-400">
      <span>{i18n.t("export_format_label")}</span>
      <span class="font-semibold text-slate-600">{i18n.t("export_format_value")}</span>
    </div>
    <div
      class="mt-1.5 flex items-center justify-between text-[12px] text-slate-400"
    >
      <span>{i18n.t("export_filename_label")}</span>
      <span class="max-w-[180px] truncate font-semibold text-slate-600"
        >{backupFileName}</span
      >
    </div>
  </div>
</Modal>

<Modal
  open={modal === "import"}
  title={i18n.t("modal_import_title")}
  message={pendingImportFile
    ? (i18n.isEnglish ? `File "${pendingImportFile.name}" will replace all current data.` : `File "${pendingImportFile.name}" akan menggantikan seluruh data saat ini.`)
    : i18n.t("modal_import_msg")}
  confirmText={i18n.t("modal_import_confirm")}
  cancelText={i18n.t("cancel")}
  variant="primary"
  iconName="upload"
  onConfirm={confirmImport}
  onCancel={() => {
    modal = null;
    pendingImportFile = null;
  }}
/>
