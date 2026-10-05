<script lang="ts">
  import Icon from "./Icon.svelte";
  import { useI18n } from "$lib/i18n";

  export let active: "today" | "history" | "settings";
  export let onChange: (screen: "today" | "history" | "settings") => void;
  export let locale = "id-ID";

  $: i18n = useI18n(locale);
  $: items = [
    { id: "today" as const, icon: "home", label: i18n.t("nav_today") },
    { id: "history" as const, icon: "chart", label: i18n.t("nav_history") },
    { id: "settings" as const, icon: "gear", label: i18n.t("nav_settings") },
  ];
</script>

<div
  class="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-[17px] pb-[calc(env(safe-area-inset-bottom)+9px)]"
>
  <nav
    class="pointer-events-auto w-full max-w-[370px] rounded-[18px] border border-slate-200/80 bg-white/92 px-[7px] py-[5px] shadow-[0_8px_24px_rgba(15,23,42,0.09)] backdrop-blur-xl"
  >
    <div class="grid grid-cols-3">
      {#each items as item}
        <button
          onclick={() => onChange(item.id)}
          class="group flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl px-[5px] transition-all duration-150 active:scale-95 {active ===
          item.id
            ? 'bg-water-50/80 text-water-600'
            : 'text-slate-400 hover:bg-slate-50/60 hover:text-slate-600'}"
          aria-current={active === item.id ? "page" : undefined}
        >
          <Icon
            name={item.icon}
            className="size-[20px] transition-transform duration-150 group-active:scale-90"
          />
          <span class="text-[12px] font-semibold tracking-tight"
            >{item.label}</span
          >
        </button>
      {/each}
    </div>
  </nav>
</div>
