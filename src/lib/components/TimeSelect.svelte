<script lang="ts">
  export let value = "06:00";
  export let label = "Waktu";
  export let hourLabel = "Jam";
  export let minuteLabel = "Menit";

  const hours = Array.from({ length: 24 }, (_, index) =>
    String(index).padStart(2, "0"),
  );
  const minutes = Array.from({ length: 60 }, (_, index) =>
    String(index).padStart(2, "0"),
  );

  let hour = "06";
  let minute = "00";

  function normalize(nextValue: string) {
    const [nextHour = "00", nextMinute = "00"] = nextValue.split(":");
    return { nextHour, nextMinute };
  }

  $: {
    const { nextHour, nextMinute } = normalize(value);
    if (hour !== nextHour) hour = nextHour;
    if (minute !== nextMinute) minute = nextMinute;
  }

  function onHourChange(e: Event) {
    const selectEl = e.currentTarget as HTMLSelectElement;
    hour = selectEl.value;
    value = `${hour}:${minute}`;
    selectEl.blur();
  }

  function onMinuteChange(e: Event) {
    const selectEl = e.currentTarget as HTMLSelectElement;
    minute = selectEl.value;
    value = `${hour}:${minute}`;
    selectEl.blur();
  }
</script>

<div class="rounded-2xl bg-white p-[11px]">
  <div class="grid grid-cols-[1fr_auto_1fr] items-end gap-2.5">
    <label class="block min-w-0">
      <span
        class="mb-1.5 block text-[12px] font-semibold uppercase tracking-[.08em] text-slate-400"
        >{hourLabel}</span
      >
      <div class="relative">
        <select
          aria-label={`${label} - ${hourLabel.toLowerCase()}`}
          value={hour}
          onchange={onHourChange}
          class="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-[17px] pr-[41px] py-[11px] text-[16px] font-semibold text-slate-900 outline-none focus:border-water-500 transition-colors duration-150"
        >
          {#each hours as item}
            <option value={item}>{item}</option>
          {/each}
        </select>
      </div>
    </label>

    <span class="pb-[13px] text-[18px] font-bold text-slate-300">:</span>

    <label class="block min-w-0">
      <span
        class="mb-1.5 block text-[12px] font-semibold uppercase tracking-[.08em] text-slate-400"
        >{minuteLabel}</span
      >
      <div class="relative">
        <select
          aria-label={`${label} - ${minuteLabel.toLowerCase()}`}
          value={minute}
          onchange={onMinuteChange}
          class="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-[17px] pr-[41px] py-[11px] text-[16px] font-semibold text-slate-900 outline-none focus:border-water-500 transition-colors duration-150"
        >
          {#each minutes as item}
            <option value={item}>{item}</option>
          {/each}
        </select>
      </div>
    </label>
  </div>
</div>
