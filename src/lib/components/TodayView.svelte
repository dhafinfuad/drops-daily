<script lang="ts">
  import { slide, fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import Icon from "./Icon.svelte";
  import BottomSheet from "./BottomSheet.svelte";
  import type { DailyTargetRecord, IntakeEntryRecord } from "$lib/db/schema";
  import type { HydrationResult } from "$lib/hydration/calculator";
  import type { ReminderPlan } from "$lib/reminders/engine";
  import {
    formatLocalDateKey,
    getWeekDaysForDayKey,
    shiftDayKey,
  } from "$lib/db/hydration-day";
  import { useI18n } from "$lib/i18n";

  export let consumedMl: number;
  export let targetMl: number;
  export let entries: IntakeEntryRecord[];
  export let hydration: HydrationResult;
  export let reminderPlan: ReminderPlan | null;
  export let onAdd: (
    amountMl: number,
    source: "quick" | "custom",
    occurredAt?: Date,
  ) => Promise<void>;
  export let onDelete: (id: string) => Promise<void>;
  export let quickAddMl: number = 250;
  export let onQuickAddChange:
    | ((amountMl: number) => Promise<void>)
    | undefined = undefined;

  export let todayKey: string = formatLocalDateKey(new Date());
  export let allIntakes: IntakeEntryRecord[] = [];
  export let allTargets: DailyTargetRecord[] = [];
  export let locale = "id-ID";

  $: i18n = useI18n(locale);

  let selectedDayKey = todayKey;
  let showCustom = false;
  let customAmount = quickAddMl;
  let dismissedEmptyNotice = false;

  $: if (!selectedDayKey) {
    selectedDayKey = todayKey;
  }

  $: if (!showCustom) {
    customAmount = quickAddMl;
  }

  $: isViewingToday = selectedDayKey === todayKey;
  $: isFuture = selectedDayKey > todayKey;

  // Selected day entries
  $: currentEntries = isViewingToday
    ? entries
    : allIntakes
        .filter((item) => item.hydrationDayKey === selectedDayKey)
        .sort((a, b) => a.occurredAt - b.occurredAt);

  // Selected day consumed ml
  $: currentConsumedMl = isViewingToday
    ? consumedMl
    : currentEntries.reduce((total, item) => total + item.amountMl, 0);

  // Selected day target ml
  $: currentTargetMl = (() => {
    if (isViewingToday) return targetMl;
    const found = allTargets.find((t) => t.hydrationDayKey === selectedDayKey);
    return found?.plainWaterGoalMl ?? targetMl;
  })();

  $: if (currentEntries.length > 0) {
    dismissedEmptyNotice = false;
  }

  $: percentage =
    currentTargetMl > 0
      ? Math.min(100, Math.round((currentConsumedMl / currentTargetMl) * 100))
      : 0;
  $: circumference = 2 * Math.PI * 85;
  $: offset = circumference - (percentage / 100) * circumference;
  $: nextReminder = reminderPlan?.reminders[0] ?? null;

  $: selectedDateObj = (() => {
    const [y, m, d] = selectedDayKey.split("-").map(Number);
    return new Date(y, m - 1, d);
  })();

  $: selectedDateLong = selectedDateObj.toLocaleDateString(i18n.dateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  $: selectedDateShort = selectedDateObj.toLocaleDateString(i18n.dateLocale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  // Calculate 7 days of the week containing selectedDayKey
  $: weekDays = (() => {
    const rawWeek = getWeekDaysForDayKey(selectedDayKey, todayKey);
    return rawWeek.map((day) => {
      const dayIntakes = allIntakes.filter(
        (e) => e.hydrationDayKey === day.dayKey,
      );
      const dayConsumed =
        day.dayKey === todayKey
          ? consumedMl
          : dayIntakes.reduce((sum, e) => sum + e.amountMl, 0);
      const dayTargetRec = allTargets.find(
        (t) => t.hydrationDayKey === day.dayKey,
      );
      const dayTarget =
        day.dayKey === todayKey
          ? targetMl
          : (dayTargetRec?.plainWaterGoalMl ?? targetMl);
      const ratio = dayTarget > 0 ? dayConsumed / dayTarget : 0;
      const isPast = day.dayKey < todayKey;
      const isPastReached90 = isPast && ratio >= 0.9;

      return {
        ...day,
        isSelected: day.dayKey === selectedDayKey,
        isPastReached90,
      };
    });
  })();

  function formatTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString(i18n.dateLocale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatReminderTime(date: Date) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  $: PORTION_PRESETS = {
    250: { label: i18n.t("portion_glass"), icon: "glass-tall" },
    350: { label: i18n.t("portion_mug"), icon: "mug" },
    500: { label: i18n.t("portion_tumbler_medium"), icon: "tumbler" },
    600: { label: i18n.t("portion_bottle_medium"), icon: "bottle" },
    750: { label: i18n.t("portion_tumbler_large"), icon: "tumbler-large" },
    1000: { label: i18n.t("portion_bottle_large"), icon: "bottle-large" },
  } as Record<number, { label: string; icon: string }>;

  function getPortionLabel(amountMl: number): string {
    return PORTION_PRESETS[amountMl]?.label ?? i18n.t("today_water");
  }

  function getPortionIcon(amountMl: number): string {
    return PORTION_PRESETS[amountMl]?.icon ?? "drop";
  }

  function smoothSlideFade(
    node: HTMLElement,
    { duration = 350, easing = cubicOut } = {}
  ) {
    const style = getComputedStyle(node);
    const opacity = +style.opacity;
    const height = parseFloat(style.height);
    const paddingStart = parseFloat(style.paddingTop);
    const paddingEnd = parseFloat(style.paddingBottom);
    const marginEnd = parseFloat(style.marginBottom);
    const borderStart = parseFloat(style.borderTopWidth);
    const borderEnd = parseFloat(style.borderBottomWidth);

    return {
      duration,
      easing,
      css: (t: number) => `
        overflow: hidden;
        opacity: ${t * opacity};
        height: ${t * height}px;
        padding-top: ${t * paddingStart}px;
        padding-bottom: ${t * paddingEnd}px;
        margin-bottom: ${t * marginEnd}px;
        border-top-width: ${t * borderStart}px;
        border-bottom-width: ${t * borderEnd}px;
      `
    };
  }

  function selectDay(key: string) {
    selectedDayKey = key;
    dismissedEmptyNotice = false;
  }

  function onPrevDay() {
    selectedDayKey = shiftDayKey(selectedDayKey, -1);
    dismissedEmptyNotice = false;
  }

  function onNextDay() {
    selectedDayKey = shiftDayKey(selectedDayKey, 1);
    dismissedEmptyNotice = false;
  }

  function onPrevWeek() {
    selectedDayKey = shiftDayKey(selectedDayKey, -7);
    dismissedEmptyNotice = false;
  }

  function onNextWeek() {
    selectedDayKey = shiftDayKey(selectedDayKey, 7);
    dismissedEmptyNotice = false;
  }

  let touchStartX = 0;
  let touchStartY = 0;

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (e.changedTouches.length > 0) {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        if (deltaX > 0) {
          onPrevWeek();
        } else {
          onNextWeek();
        }
      }
    }
  }

  async function handleAdd(amount: number, source: "quick" | "custom") {
    if (isViewingToday) {
      await onAdd(amount, source);
    } else {
      const [y, m, d] = selectedDayKey.split("-").map(Number);
      const dateToLog = new Date(y, m - 1, d, 12, 0, 0);
      await onAdd(amount, source, dateToLog);
    }
  }

  async function saveQuickAdd() {
    if (!customAmount || customAmount <= 0) return;
    const amt = Math.round(customAmount);
    if (onQuickAddChange) {
      await onQuickAddChange(amt);
    }
    showCustom = false;
  }
</script>

<div>
  <!-- Sticky Frosted Header with centered Drops Daily -->
  <div
    class="sticky top-0 z-20 border-b border-slate-200/60 bg-[#F2F2F7]/90 px-4 pt-[max(10px,env(safe-area-inset-top))] pb-2.5 backdrop-blur-xl transition-all"
  >
    <div class="flex items-center justify-center">
      <h1 class="text-[18px] font-bold tracking-tight text-slate-900">
        {i18n.t("today_title")}
      </h1>
    </div>
  </div>

  <!-- Weekly Date Strip (Not sticky, scrolls with page) -->
  <div
    class="px-4 pt-3 pb-1"
    role="region"
    aria-label={i18n.isEnglish ? "Weekly calendar" : "Kalender mingguan"}
    ontouchstart={handleTouchStart}
    ontouchend={handleTouchEnd}
  >
    <div class="grid grid-cols-7 gap-1">
      {#each weekDays as day (day.dayKey)}
        <button
          type="button"
          onclick={() => selectDay(day.dayKey)}
          class="flex flex-col items-center justify-center p-0 cursor-pointer active:scale-95 transition-transform"
          aria-label={i18n.isEnglish ? `Select date ${day.dateNumber}` : `Pilih tanggal ${day.dateNumber}`}
        >
          <!-- Day label or TODAY -->
          <div class="h-4 flex items-center justify-center">
            {#if day.isToday}
              <span
                class="text-[10px] font-semibold text-blue-600 leading-none"
              >
                {i18n.isEnglish ? "TODAY" : "HARI INI"}
              </span>
            {:else}
              <span class="text-[12px] font-medium text-slate-400 leading-none">
                {day.weekdayInitial}
              </span>
            {/if}
          </div>

          <!-- Date Number with 3 styles -->
          <div class="mt-1.5 flex items-center justify-center">
            {#if day.isToday}
              <!-- Style 2: Hari ini -->
              <div
                class="size-[34px] rounded-full bg-blue-600 text-white font-bold text-[14px] grid place-items-center"
              >
                {day.dateNumber}
              </div>
            {:else if day.isPastReached90}
              <!-- Style 1: Hari kemarin di mana target terpenuhi > 90% (Solid blue circle with white text) -->
              <div
                class="size-[34px] rounded-full bg-blue-600 text-white font-bold text-[14px] grid place-items-center"
              >
                {day.dateNumber}
              </div>
            {:else}
              <!-- Style 3: Hari lainnya (Plain text number) -->
              <div
                class="size-[34px] grid place-items-center text-[14px] {day.isSelected
                  ? 'font-bold text-slate-900'
                  : 'font-medium text-slate-500'}"
              >
                {day.dateNumber}
              </div>
            {/if}
          </div>

          <!-- Selection Indicator Dot -->
          <div class="h-1.5 mt-1.5 flex items-center justify-center">
            {#if day.isSelected}
              <div class="size-1 rounded-full bg-blue-600"></div>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>

  {#if hydration.status === "infant_exclusive"}
    <section class="mx-4 mt-5 rounded-2xl bg-white p-[13px] shadow-sm">
      <h2 class="text-[20px] font-bold">{i18n.t("today_infant_title")}</h2>
      <p class="mt-2 text-[14px] leading-6 text-slate-500">
        {i18n.t("today_infant_desc")}
      </p>
    </section>
  {:else if hydration.status === "caregiver_information"}
    <section class="mx-4 mt-5 rounded-2xl bg-white p-[13px] shadow-sm">
      <p class="text-[12px] font-semibold text-water-600">{i18n.t("today_caregiver_badge")}</p>
      <h2 class="mt-1 text-[28px] font-bold">
        {hydration.caregiverPlainWaterRangeMl?.[0]}–{hydration
          .caregiverPlainWaterRangeMl?.[1]} ml
      </h2>
      <p class="mt-2 text-[14px] leading-6 text-slate-500">
        {i18n.t("today_caregiver_desc")}
      </p>
    </section>
  {:else}
    <section
      class="mx-4 mt-3.5 rounded-2xl border border-slate-100/80 bg-white p-[13px] shadow-sm"
    >
      {#if !isViewingToday}
        <div
          class="mb-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-200/60"
        >
          <span class="text-[13px] font-semibold text-slate-700">
            {selectedDateLong}
          </span>
          <button
            type="button"
            onclick={() => selectDay(todayKey)}
            class="rounded-full bg-water-100 px-2.5 py-0.5 text-[11px] font-bold text-water-700 hover:bg-water-200 transition-colors cursor-pointer"
          >
            {i18n.t("today_badge")}
          </button>
        </div>
      {/if}

      <div class="relative mx-auto size-[200px]">
        <svg class="size-full -rotate-90" viewBox="0 0 200 200">
          <defs>
            <linearGradient
              id="progress-gradient"
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stop-color="#2583eb" />
              <stop offset="100%" stop-color="#10b981" />
            </linearGradient>
          </defs>
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="#e8edf3"
            stroke-width="16"
          />
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke={percentage >= 80 ? "url(#progress-gradient)" : "#2583eb"}
            stroke-width="16"
            stroke-linecap="round"
            stroke-dasharray={circumference}
            stroke-dashoffset={offset}
            class="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div class="absolute inset-0 grid place-items-center text-center">
          <div>
            <div class="text-[32px] font-bold tracking-[-.05em]">
              {currentConsumedMl.toLocaleString(i18n.dateLocale)}
              <span class="text-[16px] font-semibold text-slate-500">ml</span>
            </div>
            <div class="mt-1 text-[14px] text-slate-400">
              {i18n.t("today_header_of")} {currentTargetMl.toLocaleString(i18n.dateLocale)} ml
            </div>
            <div
              class="mt-2 text-[14px] font-semibold {percentage >= 80
                ? 'text-emerald-600'
                : 'text-water-600'}"
            >
              {percentage}% {i18n.t("today_target_suffix")}
            </div>
          </div>
        </div>
      </div>

      {#if isFuture}
        <div
          class="mt-4 rounded-2xl bg-slate-50 py-3 text-center text-[13px] font-medium text-slate-400 border border-slate-100"
        >
          {i18n.t("today_future_not_started")}
        </div>
      {:else}
        <div class="mt-5 flex gap-1.5">
          <button
            onclick={() => handleAdd(quickAddMl, "quick")}
            class="min-h-[44px] w-full rounded-2xl bg-water-500 px-[13px] py-[9px] text-[16px] font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-water-600 active:scale-[.97] transition-all duration-350 cursor-pointer"
            >+ {quickAddMl} ml</button
          >
          <button
            onclick={() => {
              customAmount = quickAddMl;
              showCustom = true;
            }}
            class="min-h-[44px] shrink-0 flex items-center justify-center gap-1.5 rounded-2xl border border-blue-200 bg-blue-50/70 px-4 py-[9px] text-[16px] font-semibold text-blue-600 shadow-sm hover:bg-blue-100/60 hover:border-blue-300 active:scale-[.97] transition-all duration-200 cursor-pointer"
          >
            <Icon name="sliders" className="size-[18px] text-blue-600" />
            <span>{i18n.t("today_btn_custom")}</span>
          </button>
        </div>
      {/if}

      <p class="mt-4 mb-1 text-center text-[12px] text-slate-400">
        {#if isViewingToday}
          {#if nextReminder}
            {i18n.t("today_reminder_next")} {nextReminder.amountMl} ml {i18n.t("today_reminder_at")} {formatReminderTime(
              nextReminder.at,
            )}
          {:else if reminderPlan?.status === "quiet_hours"}
            {i18n.t("today_reminder_quiet")}
          {:else if reminderPlan?.status === "complete"}
            {i18n.t("today_reminder_complete")}
          {:else}
            {i18n.t("today_reminder_none")}
          {/if}
        {:else if isFuture}
          {i18n.t("today_reminder_future")}
        {:else if percentage >= 90}
          {i18n.t("today_progress_reached")} ({percentage}%)
        {:else}
          {i18n.t("today_progress_label")} {percentage}% {i18n.t("today_progress_of_target")}
        {/if}
      </p>
    </section>
  {/if}

  {#if currentEntries.length > 0 || !dismissedEmptyNotice}
    <section class="mx-4 mt-6">
      <div class="mb-2 flex items-end justify-between px-[5px]">
        <h2 class="text-[16px] font-bold">
          {isViewingToday
            ? i18n.t("today_intakes_title")
            : `${i18n.t("today_intakes_history_title")} (${selectedDateShort})`}
        </h2>
        <span class="text-[12px] text-slate-400"
          >{currentEntries.length} {i18n.t("today_records_count")}</span
        >
      </div>
      {#if currentEntries.length > 0}
        <div class="flex flex-col">
          {#each [...currentEntries].reverse().slice(0, 8) as entry (entry.id)}
            <div
              transition:smoothSlideFade={{ duration: 350 }}
              class="mb-2.5 flex items-center gap-2.5 rounded-2xl border border-slate-100/80 bg-white px-[17px] py-[14px] shadow-sm"
            >
              <div
                class="grid size-8 shrink-0 place-items-center rounded-full bg-water-50 text-water-600"
              >
                <Icon
                  name={getPortionIcon(entry.amountMl)}
                  className="size-[18px]"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[16px] font-semibold">
                  {getPortionLabel(entry.amountMl)}
                </p>
                <p class="mt-0.5 text-[12px] text-slate-400">
                  {formatTime(entry.occurredAt)}
                </p>
              </div>
              <span class="text-[14px] font-semibold text-slate-700"
                >{entry.amountMl} ml</span
              >
              <button
                onclick={() => onDelete(entry.id)}
                class="rounded-full p-[9px] text-slate-300 hover:bg-rose-50 hover:text-rose-600 active:scale-90 transition-all duration-250 cursor-pointer"
                aria-label={i18n.t("today_delete_record_aria")}>×</button
              >
            </div>
          {/each}
        </div>
      {:else}
        <div
          transition:slide={{ duration: 350, easing: cubicOut }}
          class="flex items-center gap-3 rounded-2xl border border-slate-100/80 bg-white p-[14px] shadow-sm"
        >
          <div
            class="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500"
          >
            <Icon name="drop" className="size-4 text-slate-500" />
          </div>
          <p class="min-w-0 flex-1 text-[13px] leading-5 text-slate-500">
            {isViewingToday
              ? i18n.t("today_empty_today")
              : isFuture
                ? i18n.t("today_empty_future")
                : i18n.t("today_empty_past")}
          </p>
          <button
            type="button"
            onclick={() => (dismissedEmptyNotice = true)}
            class="rounded-full p-1 text-slate-300 hover:bg-slate-50 hover:text-slate-500 active:scale-90 transition-all cursor-pointer"
            aria-label={i18n.t("today_close_notice_aria")}
          >
            <svg
              class="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      {/if}
    </section>
  {/if}
</div>

{#if showCustom}
  <BottomSheet
    title={i18n.t("quick_add_sheet_title")}
    closeLabel={i18n.t("close")}
    onClose={() => {
      customAmount = quickAddMl;
      showCustom = false;
    }}
  >
    <p class="text-[14px] leading-5 text-slate-500">
      {i18n.t("quick_add_sheet_desc")}
    </p>

    <div class="mt-3.5 grid grid-cols-3 gap-2">
      {#each [
        { ml: 250, label: i18n.t("portion_glass"), icon: "glass-tall" },
        { ml: 350, label: i18n.t("portion_mug"), icon: "mug" },
        { ml: 500, label: i18n.t("portion_tumbler_medium"), icon: "tumbler" },
        { ml: 600, label: i18n.t("portion_bottle_medium"), icon: "bottle" },
        { ml: 750, label: i18n.t("portion_tumbler_large"), icon: "tumbler-large" },
        { ml: 1000, label: i18n.t("portion_bottle_large"), icon: "bottle-large" }
      ] as preset}
        <button
          type="button"
          onclick={() => {
            customAmount = preset.ml;
          }}
          class="flex flex-col items-center justify-center rounded-2xl border py-2.5 px-1.5 text-center transition-all duration-150 {customAmount ===
          preset.ml
            ? 'border-water-500 bg-water-50/70 text-water-700 shadow-sm ring-1 ring-water-500'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-[.98]'}"
        >
          <div
            class="grid size-9 place-items-center rounded-full transition-colors {customAmount ===
            preset.ml
              ? 'bg-water-500/10 text-water-600'
              : 'bg-slate-100 text-slate-500'}"
          >
            <Icon name={preset.icon} className="size-5" />
          </div>
          <span class="mt-1.5 text-[14px] font-bold leading-none"
            >{preset.ml.toLocaleString(i18n.dateLocale)} ml</span
          >
          <span
            class="mt-1 text-[11px] {customAmount === preset.ml
              ? 'font-medium text-water-600/90'
              : 'text-slate-400'}">{preset.label}</span
          >
        </button>
      {/each}
    </div>

    <label class="mt-4 block">
      <span class="mb-2 block text-[14px] font-semibold text-slate-500"
        >{i18n.t("quick_add_custom_label")}</span
      >
      <div
        class="flex items-center rounded-2xl border border-slate-200 bg-white px-[17px]"
      >
        <input
          type="number"
          min="1"
          inputmode="numeric"
          pattern="[0-9]*"
          bind:value={customAmount}
          class="min-w-0 flex-1 py-[11px] text-[16px] font-bold outline-none"
        />
        <span class="text-[14px] text-slate-400">ml</span>
      </div>
    </label>

    <button
      onclick={saveQuickAdd}
      disabled={!customAmount || customAmount <= 0}
      class="mt-4 w-full rounded-2xl bg-water-500 py-[11px] text-[16px] font-bold text-white shadow-lg shadow-blue-500/20 active:scale-[.99] disabled:opacity-40"
      >{i18n.t("save")}</button
    >
  </BottomSheet>
{/if}
