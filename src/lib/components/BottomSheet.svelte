<script lang="ts">
  export let title: string;
  export let onClose: () => void;
  export let closeLabel: string = "Tutup";

  function portal(node: HTMLElement) {
    if (typeof document === "undefined") return;
    document.body.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      }
    };
  }

  function backdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) onClose();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") onClose();
  }
</script>

<svelte:window onkeydown={onKeyDown} />

<div
  use:portal
  class="sheet-backdrop fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 backdrop-blur-[2px]"
  onclick={backdropClick}
  role="presentation"
>
  <section
    class="sheet-panel flex max-h-[min(85vh,720px)] w-full max-w-[430px] flex-col rounded-t-[24px] bg-white px-[17px] pb-[calc(env(safe-area-inset-bottom)+17px)] pt-[13px] shadow-2xl"
  >
    <div class="mx-auto h-1.5 w-10 rounded-full bg-slate-200"></div>
    <div class="mt-3 flex items-center justify-between">
      <h2 class="text-[18px] font-bold tracking-[-.03em]">{title}</h2>
      <button
        onclick={onClose}
        class="grid size-7 place-items-center rounded-full bg-slate-100 text-[16px] text-slate-500 hover:bg-slate-200 active:scale-95 transition-all duration-150"
        aria-label={closeLabel}>×</button
      >
    </div>
    <div class="mt-4 overflow-y-auto overflow-x-hidden"><slot /></div>
  </section>
</div>

<style>
  @keyframes sheetBackdropFade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes sheetSlideUp {
    from {
      transform: translateY(100%);
      opacity: 0.85;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .sheet-backdrop {
    animation: sheetBackdropFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .sheet-panel {
    animation: sheetSlideUp 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>

