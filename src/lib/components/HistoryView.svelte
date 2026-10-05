<script lang="ts">
  import type { HistorySummary } from "$lib/history/history";
  import { useI18n } from "$lib/i18n";

  export let history7: HistorySummary;
  export let history30: HistorySummary;
  export let locale = "id-ID";

  $: i18n = useI18n(locale);
  let range: 7 | 30 = 7;
  $: data = range === 7 ? history7 : history30;

  function dayLabel(dayKey: string) {
    const [y, m, d] = dayKey.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(i18n.dateLocale, {
      weekday: "short",
    });
  }
</script>

<div>
  <!-- Sticky Frosted Header -->
  <div
    class="sticky top-0 z-20 border-b border-slate-200/60 bg-[#F2F2F7]/90 px-[17px] pt-[max(10px,env(safe-area-inset-top))] pb-[10px] backdrop-blur-xl transition-all"
  >
    <div class="flex items-center justify-between">
      <h1 class="text-[20px] font-bold tracking-[-.03em] text-slate-900">
        {i18n.t("history_title")}
      </h1>
    </div>
  </div>

  <div
    class="mx-4 mt-5 grid grid-cols-2 rounded-2xl bg-slate-200/70 p-[5px]"
  >
    <button
      onclick={() => (range = 7)}
      class="rounded-2xl py-[9px] text-[14px] font-bold transition-all duration-150 active:scale-[.97] {range === 7
        ? 'bg-white text-slate-950 shadow-sm'
        : 'text-slate-500 hover:text-slate-800'}">{i18n.t("history_7_days")}</button
    ><button
      onclick={() => (range = 30)}
      class="rounded-2xl py-[9px] text-[14px] font-bold transition-all duration-150 active:scale-[.97] {range === 30
        ? 'bg-white text-slate-950 shadow-sm'
        : 'text-slate-500 hover:text-slate-800'}">{i18n.t("history_30_days")}</button
    >
  </div>
  <div class="mx-4 mt-4 grid grid-cols-3 gap-2">
    <div class="rounded-2xl bg-white px-[11px] py-[11px] shadow-sm">
      <strong class="block text-[20px] tracking-[-.04em]"
        >{Math.round(data.averagePercentage * 100)}%</strong
      ><span class="mt-1 block text-[12px] text-slate-400">{i18n.t("history_average")}</span>
    </div>
    <div class="rounded-2xl bg-white px-[11px] py-[11px] shadow-sm">
      <strong class="block text-[20px] tracking-[-.04em]"
        >{data.reachedDays}</strong
      ><span class="mt-1 block text-[12px] text-slate-400">{i18n.t("history_reached_days")}</span>
    </div>
    <div class="rounded-2xl bg-white px-[11px] py-[11px] shadow-sm">
      <strong class="block text-[20px] tracking-[-.04em]">{data.streak}</strong
      ><span class="mt-1 block text-[12px] text-slate-400">{i18n.t("history_streak")}</span>
    </div>
  </div>
  <section class="mx-4 mt-4 rounded-2xl bg-white p-[13px] shadow-sm">
    <div class="flex h-[172px] items-end gap-2">
      {#each data.days as day}<div
          class="group flex h-full min-w-0 flex-1 flex-col justify-end gap-2 cursor-pointer"
          title={`${day.consumedMl} ml`}
        >
          <div
            class="w-full rounded-t-[8px] rounded-b-[4px] bg-gradient-to-b from-blue-400 to-water-500 transition-all duration-200 group-hover:brightness-110 group-hover:scale-y-[1.03] group-active:scale-y-[1.03] origin-bottom shadow-sm"
            style={`height:${Math.max(4, (day.percentage ?? 0) * 100)}%`}
          ></div>
          {#if range === 7}<span class="text-center text-[12px] text-slate-400 group-hover:text-slate-600 transition-colors"
              >{dayLabel(day.dayKey)}</span
            >{/if}
        </div>{/each}
    </div>
  </section>
  <section class="mx-4 mt-6">
    <h2 class="mb-2 px-[5px] text-[16px] font-bold">{i18n.t("history_summary")}</h2>
    <div class="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div class="flex items-center justify-between px-[17px] py-[11px]">
        <div>
          <p class="text-[16px] font-semibold">{i18n.t("history_avg_consumption")}</p>
          <p class="mt-1 text-[14px] text-slate-400">{range} {i18n.t("history_last_days")}</p>
        </div>
        <span class="text-[14px] font-semibold"
          >{data.averageConsumedMl.toLocaleString(i18n.dateLocale)} ml</span
        >
      </div>
      <div class="border-t border-slate-100 px-[17px] py-[11px]">
        <p class="text-[14px] leading-6 text-slate-500">
          {i18n.t("history_note")}
        </p>
      </div>
    </div>
  </section>
</div>
