<script lang="ts">
  export let name: string;
  export let className = "size-5";
</script>

<svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  {#if name === "drop"}<path d="M12 3.2S6.5 9.4 6.5 14a5.5 5.5 0 0 0 11 0C17.5 9.4 12 3.2 12 3.2Z"/><path d="M9.2 15.1c.3 1.2 1.4 2.1 2.8 2.1"/>
  {:else if name === "home"}<path d="m3 10 9-7 9 7"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-7h6v7"/>
  {:else if name === "chart"}<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>
  {:else if name === "gear"}<circle cx="12" cy="12" r="3.5"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14v-4a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z"/>
  {:else if name === "chevron"}<path d="m9 18 6-6-6-6"/>
  {:else if name === "back"}<path d="m15 18-6-6 6-6"/>
  {:else if name === "check"}<path d="m5 12 4 4L19 6"/>
  {:else if name === "globe"}<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
  {:else if name === "bell"}<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>
  {:else if name === "clock"}<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
  {:else if name === "user"}<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>
  {:else if name === "activity"}<path d="M3 12h4l2-6 4 12 2-6h6"/>
  {:else if name === "sun"}<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
  {:else if name === "database"}<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>
  {:else if name === "shield"}<path d="M12 22s8-3.8 8-10V5l-8-3-8 3v7c0 6.2 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>
  {:else if name === "download"}<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>
  {:else if name === "upload"}<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>
  {:else if name === "trash"}<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="m6 7 1 14h10l1-14"/><path d="M9 7V4h6v3"/>
  {:else if name === "moon"}<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>
  {:else if name === "info"}<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>
  {:else if name === "phone"}<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/>
  {:else if name === "glass"}<path d="M7 3h10l-1.5 14.5a3 3 0 0 1-3 2.5h-1a3 3 0 0 1-3-2.5L7 3Z"/><line x1="7" y1="7" x2="17" y2="7"/>
  {:else if name === "cup"}<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
  {:else if name === "teacup"}<path d="M17 9h1a3 3 0 0 1 0 6h-1"/><path d="M4 9h13v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z"/><path d="M2 19h18"/>
  {:else if name === "glass-short"}<path d="M6 7h12l-1 11a2.5 2.5 0 0 1-2.5 2h-5A2.5 2.5 0 0 1 7 18L6 7Z"/><path d="M6.5 11h11"/>
  {:else if name === "glass-tall"}<path d="M6.5 3h11l-1.5 15.5a2.5 2.5 0 0 1-2.5 2.5h-3a2.5 2.5 0 0 1-2.5-2.5L6.5 3Z"/><path d="M7 8h10"/>
  {:else if name === "mug"}<path d="M17 8h1.5a3.5 3.5 0 0 1 0 7H17"/><path d="M5 6h12v10a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z"/><path d="M5 10h12"/>
  {:else if name === "tumbler"}<path d="M9 2h6v2H9Z"/><path d="M7 4h10l-1.2 15a2.5 2.5 0 0 1-2.5 2h-2.6a2.5 2.5 0 0 1-2.5-2L7 4Z"/><path d="M7.4 9h9.2"/>
  {:else if name === "bottle"}<path d="M10 2h4v2.5h-4Z"/><path d="M10 4.5v2.5L6.5 10v9.5a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V10L14 7V4.5"/><path d="M6.5 14h11"/>
  {:else if name === "tumbler-large"}<path d="M15 2l-2 3"/><path d="M8 5h8v2H8Z"/><path d="M7 7h10l-1.5 14a2 2 0 0 1-2 1.5h-3a2 2 0 0 1-2-1.5L7 7Z"/><path d="M7.4 12h9.2"/>
  {:else if name === "bottle-large"}<path d="M9 2h6v2.5H9Z"/><path d="M9 4.5v2L5.5 9.5v11a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V9.5L15 6.5V4.5"/><path d="M18.5 11h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/><path d="M5.5 15h13"/>
  {:else if name === "sliders"}<path d="M5 3v9.5M5 17.5v3.5M12 3v3.5M12 11.5v9.5M19 3v8.5M19 16.5v4.5"/><circle cx="5" cy="15" r="2.5"/><circle cx="12" cy="9" r="2.5"/><circle cx="19" cy="14" r="2.5"/>
  {/if}
</svg>
