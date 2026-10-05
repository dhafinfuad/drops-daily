<script lang="ts">
  import Icon from "./Icon.svelte";

  export let open: boolean = false;
  export let title: string;
  export let message: string = "";
  export let confirmText: string = "Konfirmasi";
  export let cancelText: string = "Batal";
  export let variant: "danger" | "primary" = "primary";
  export let iconName: string = "info";
  export let onConfirm: () => void;
  export let onCancel: () => void;

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
    if (event.target === event.currentTarget) onCancel();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && open) onCancel();
  }
</script>

<svelte:window onkeydown={onKeyDown} />

{#if open}
  <div
    use:portal
    class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[3px]"
    onclick={backdropClick}
    role="presentation"
  >
    <div
      class="modal-panel w-full max-w-[340px] rounded-[24px] bg-white p-5 text-center shadow-2xl border border-slate-100"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        class="mx-auto mb-3.5 grid size-12 place-items-center rounded-full {variant === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-water-50 text-water-600'}"
      >
        <Icon name={iconName} className="size-6" />
      </div>

      <h3 id="modal-title" class="text-[18px] font-bold tracking-[-.03em] text-slate-900">
        {title}
      </h3>

      {#if message}
        <p class="mt-2 text-[14px] leading-5 text-slate-500">
          {message}
        </p>
      {/if}

      <slot />

      <div class="mt-5 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onclick={onCancel}
          class="rounded-2xl bg-slate-100 py-3 text-[15px] font-semibold text-slate-700 hover:bg-slate-200 active:scale-[0.98] transition-all"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onclick={onConfirm}
          class="rounded-2xl py-3 text-[15px] font-bold text-white shadow-lg active:scale-[0.98] transition-all {variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20' : 'bg-water-500 hover:bg-water-600 shadow-blue-500/20'}"
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes modalFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes modalScaleIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
    }
  }

  .modal-backdrop {
    animation: modalFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .modal-panel {
    animation: modalScaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
