<script lang="ts">
  import { onMount, tick } from "svelte";
  import { preventBoundaryOverscroll } from "$lib/actions/overscroll";
  import Onboarding from "$lib/components/Onboarding.svelte";
  import TodayView from "$lib/components/TodayView.svelte";
  import HistoryView from "$lib/components/HistoryView.svelte";
  import SettingsView from "$lib/components/SettingsView.svelte";
  import BottomNav from "$lib/components/BottomNav.svelte";
  import type { AppSettings, Profile } from "$lib/types";
  import type { AppMetaRecord, DailyTargetRecord, IntakeEntryRecord } from "$lib/db/schema";
  import {
    addIntake,
    deleteIntake,
    ensureAppMeta,
    ensureSettings,
    getAllDailyTargets,
    getAllIntakes,
    getDailyTarget,
    getIntakesByDay,
    getProfile,
    getReminderState,
    resetHydrationDB,
    saveDailyTarget,
    saveProfile,
    saveReminderState,
    saveSettings,
    updateAppMeta
  } from "$lib/db/hydration-db";
  import { getActivePeriod, getHydrationDayKey } from "$lib/db/hydration-day";
  import { calculateHydration, getUserStage, type HydrationResult } from "$lib/hydration/calculator";
  import { generateReminderPlan, type ReminderPlan } from "$lib/reminders/engine";
  import { buildHistorySummary, type HistorySummary } from "$lib/history/history";
  import { exportBackup, importBackupReplace, validateBackup } from "$lib/db/backup";
  import {
    disablePush,
    enablePush,
    getPushCapability,
    reconcilePushState,
    registerExistingPushSubscription,
    syncPushSchedule,
    PushSyncError,
    type PushCapability
  } from "$lib/push/client";
  import { requestPersistentStorage } from "$lib/storage/persistence";
  import { useI18n } from "$lib/i18n";

  type Screen = "today" | "history" | "settings";

  let loading = true;
  let fatalError = "";
  let screen: Screen = "today";
  let todayScrollEl: HTMLElement | null = null;
  let historyScrollEl: HTMLElement | null = null;
  let settingsScrollEl: HTMLElement | null = null;
  let settingsViewRef: { popToRoot: () => boolean } | null = null;

  const savedScroll: Record<Screen, number> = {
    today: 0,
    history: 0,
    settings: 0
  };

  $: i18n = useI18n(settings?.locale);

  async function handleTabChange(next: Screen) {
    const currentEl =
      screen === "today"
        ? todayScrollEl
        : screen === "history"
          ? historyScrollEl
          : settingsScrollEl;

    if (currentEl) {
      savedScroll[screen] = currentEl.scrollTop;
    }

    // Re-tapping current active tab
    if (screen === next) {
      if (screen === "settings" && settingsViewRef?.popToRoot()) {
        return;
      }
      if (currentEl) {
        currentEl.scrollTo({ top: 0, behavior: "smooth" });
        savedScroll[screen] = 0;
      }
      return;
    }

    screen = next;
    await tick();

    const targetEl =
      next === "today"
        ? todayScrollEl
        : next === "history"
          ? historyScrollEl
          : settingsScrollEl;

    if (targetEl) {
      const restorePos = savedScroll[next] ?? 0;
      targetEl.scrollTop = restorePos;
      requestAnimationFrame(() => {
        if (targetEl) targetEl.scrollTop = restorePos;
      });
    }
  }
  let meta: AppMetaRecord | null = null;
  let profile: Profile | null = null;
  let settings: AppSettings | null = null;
  let hydration: HydrationResult | null = null;
  let todayKey = "";
  let targetRecord: DailyTargetRecord | null = null;
  let entries: IntakeEntryRecord[] = [];
  let allIntakes: IntakeEntryRecord[] = [];
  let allTargets: DailyTargetRecord[] = [];
  let consumedMl = 0;
  let reminderPlan: ReminderPlan | null = null;
  let history7: HistorySummary = emptyHistory();
  let history30: HistorySummary = emptyHistory();
  let pushCapability: PushCapability | null = null;
  let toast = "";

  function emptyHistory(): HistorySummary {
    return { days: [], averageConsumedMl: 0, averagePercentage: 0, reachedDays: 0, streak: 0 };
  }

  function showToast(message: string) {
    toast = message;
    setTimeout(() => (toast = ""), 1600);
  }

  function targetFromHydration(dayKey: string, result: HydrationResult, existing: DailyTargetRecord | undefined) {
    return {
      hydrationDayKey: dayKey,
      plainWaterGoalMl: result.plainWaterGoalMl ?? 0,
      totalWaterReferenceMl: result.totalWaterReferenceMl,
      targetMode: result.calculationMethod === "manual" ? "manual" as const : "automatic" as const,
      calculationMethod: result.calculationMethod,
      calculationVersion: result.calculationVersion,
      createdAt: existing?.createdAt
    };
  }

  async function syncPlanWithRecovery(
    revision: number,
    plan: ReminderPlan
  ) {
    if (!meta) return;

    try {
      if (!navigator.onLine) throw new PushSyncError("offline", "network");

      await syncPushSchedule(meta, revision, plan);
      meta = await updateAppMeta({
        pendingPushSync: false,
        lastSuccessfulPushSyncAt: Date.now(),
        lastPushError: null
      });
    } catch (error) {
      if (
        error instanceof PushSyncError &&
        error.code === "registration_missing"
      ) {
        try {
          await registerExistingPushSubscription(meta);
          await syncPushSchedule(meta, revision, plan);

          meta = await updateAppMeta({
            pushEnabled: true,
            pendingPushSync: false,
            lastSuccessfulPushSyncAt: Date.now(),
            lastPushError: null
          });
          return;
        } catch (recoveryError) {
          if (
            recoveryError instanceof PushSyncError &&
            (recoveryError.code === "subscription_missing" ||
              recoveryError.code === "permission_not_granted")
          ) {
            meta = await updateAppMeta({
              pushEnabled: false,
              pendingPushSync: false,
              lastPushError: recoveryError.code
            });
            pushCapability = getPushCapability();
            return;
          }
        }
      }

      meta = await updateAppMeta({
        pendingPushSync: true,
        lastPushError:
          error instanceof Error ? error.message : "push_sync_failed"
      });
    }
  }

  async function reconcileLocalPushState() {
    if (!meta?.pushEnabled) return;

    const state = await reconcilePushState(meta);
    pushCapability = state.capability;

    if (!state.active) {
      meta = await updateAppMeta({
        pushEnabled: false,
        pendingPushSync: false,
        lastPushError: state.reason
      });
    }
  }

  async function refreshAll(options: { syncPush?: boolean } = {}) {
    if (!profile || !settings || !meta) return;

    hydration = calculateHydration(profile, settings);
    todayKey = getHydrationDayKey(new Date(), settings.wakeTime);

    const existingTarget = await getDailyTarget(todayKey);
    targetRecord = await saveDailyTarget(targetFromHydration(todayKey, hydration, existingTarget));

    entries = await getIntakesByDay(todayKey);
    consumedMl = entries.reduce((total, item) => total + item.amountMl, 0);

    const now = new Date();
    const activePeriod = getActivePeriod(now, settings.wakeTime, settings.sleepTime);
    const lastIntake = entries.length ? new Date(entries[entries.length - 1].occurredAt) : null;

    reminderPlan = generateReminderPlan({
      goalMl: targetRecord.plainWaterGoalMl,
      consumedMl,
      now,
      sleepAt: activePeriod.sleepAt,
      lastIntakeAt: lastIntake,
      reminderEnabled: settings.remindersEnabled && hydration.adaptiveReminderAllowed,
      userStage: getUserStage(profile),
      withinActiveWindow: activePeriod.active
    });

    const previousReminder = await getReminderState();
    const revision = (previousReminder?.revision ?? 0) + 1;

    await saveReminderState({
      hydrationDayKey: todayKey,
      revision,
      status: reminderPlan.status,
      generatedAt: Date.now(),
      reminders: reminderPlan.reminders.map((item) => ({ id: item.id, at: item.at.getTime(), amountMl: item.amountMl })),
      projectedShortfallMl: reminderPlan.projectedShortfallMl
    });

    if (meta.pushEnabled && options.syncPush !== false) {
      await syncPlanWithRecovery(revision, reminderPlan);
    }

    const [fetchedIntakes, fetchedTargets] = await Promise.all([getAllIntakes(), getAllDailyTargets()]);
    allIntakes = fetchedIntakes;
    allTargets = fetchedTargets;
    history7 = buildHistorySummary(todayKey, 7, allIntakes, allTargets);
    history30 = buildHistorySummary(todayKey, 30, allIntakes, allTargets);
  }

  async function initialize() {
    try {
      meta = await ensureAppMeta();
      settings = await ensureSettings();
      profile = (await getProfile()) ?? null;
      pushCapability = getPushCapability();

      const storage = await requestPersistentStorage();
      if (storage.supported) {
        meta = await updateAppMeta({ storagePersistent: storage.persistent });
      }

      await reconcileLocalPushState();

      if (meta.onboardingCompleted && profile) {
        await refreshAll({ syncPush: true });
      }
    } catch (error) {
      fatalError = error instanceof Error ? error.message : "Gagal membuka database lokal.";
    } finally {
      loading = false;
    }
  }

  async function finishOnboarding(newProfile: Profile, newSettings: AppSettings) {
    profile = await saveProfile({
      userType: newProfile.userType,
      age: newProfile.age,
      sex: newProfile.sex,
      weightKg: newProfile.weightKg,
      activity: newProfile.activity,
      environment: newProfile.environment,
      pregnancyTrimester: newProfile.pregnancyTrimester,
      lactationPeriod: newProfile.lactationPeriod,
      fluidRestrictionByDoctor: newProfile.fluidRestrictionByDoctor
    });

    settings = await saveSettings({
      targetMode: newSettings.targetMode,
      manualTargetMl: newSettings.manualTargetMl,
      wakeTime: newSettings.wakeTime,
      sleepTime: newSettings.sleepTime,
      remindersEnabled: newSettings.remindersEnabled,
      locale: newSettings.locale ?? "en-US",
      volumeUnit: "ml",
      quickAddMl: newSettings.quickAddMl ?? 250
    });

    meta = await updateAppMeta({ onboardingCompleted: true });
    await refreshAll();
  }

  async function addWater(amountMl: number, source: "quick" | "custom", occurredAt?: Date) {
    await addIntake({ amountMl, source, occurredAt });
    await refreshAll();
    showToast(i18n.isEnglish ? `+${amountMl} ml added` : `+${amountMl} ml ditambahkan`);
  }

  async function removeIntake(id: string) {
    await deleteIntake(id);
    await refreshAll();
    showToast(i18n.t("toast_deleted"));
  }

  async function updateProfile(next: Profile) {
    profile = await saveProfile({
      userType: next.userType,
      age: next.age,
      sex: next.sex,
      weightKg: next.weightKg,
      activity: next.activity,
      environment: next.environment,
      pregnancyTrimester: next.pregnancyTrimester,
      lactationPeriod: next.lactationPeriod,
      fluidRestrictionByDoctor: next.fluidRestrictionByDoctor
    });
    await refreshAll();
    showToast(i18n.t("toast_profile_saved"));
  }

  async function updateProfileAndSettings(nextProfile: Profile, nextSettings: AppSettings) {
    profile = await saveProfile({
      userType: nextProfile.userType,
      age: nextProfile.age,
      sex: nextProfile.sex,
      weightKg: nextProfile.weightKg,
      activity: nextProfile.activity,
      environment: nextProfile.environment,
      pregnancyTrimester: nextProfile.pregnancyTrimester,
      lactationPeriod: nextProfile.lactationPeriod,
      fluidRestrictionByDoctor: nextProfile.fluidRestrictionByDoctor
    });

    settings = await saveSettings({
      targetMode: nextSettings.targetMode,
      manualTargetMl: nextSettings.manualTargetMl,
      wakeTime: nextSettings.wakeTime,
      sleepTime: nextSettings.sleepTime,
      remindersEnabled: nextSettings.remindersEnabled,
      locale: nextSettings.locale,
      volumeUnit: "ml",
      quickAddMl: nextSettings.quickAddMl ?? 250
    });

    await refreshAll();
    showToast(i18n.t("toast_profile_saved"));
  }

  async function updateSettings(next: AppSettings) {
    settings = await saveSettings({
      targetMode: next.targetMode,
      manualTargetMl: next.manualTargetMl,
      wakeTime: next.wakeTime,
      sleepTime: next.sleepTime,
      remindersEnabled: next.remindersEnabled,
      locale: next.locale,
      volumeUnit: "ml",
      quickAddMl: next.quickAddMl ?? 250
    });
    await refreshAll();
    showToast(i18n.t("toast_settings_saved"));
  }

  async function updateQuickAdd(amountMl: number) {
    if (!settings) return;
    settings = await saveSettings({
      targetMode: settings.targetMode,
      manualTargetMl: settings.manualTargetMl,
      wakeTime: settings.wakeTime,
      sleepTime: settings.sleepTime,
      remindersEnabled: settings.remindersEnabled,
      locale: settings.locale,
      volumeUnit: "ml",
      quickAddMl: amountMl
    });
    await refreshAll();
    showToast(i18n.isEnglish ? `Quick button portion: ${amountMl} ml` : `Porsi tombol cepat: ${amountMl} ml`);
  }

  async function enableDevicePush() {
    if (!meta) return;
    await enablePush(meta);
    meta = await updateAppMeta({
      pushEnabled: true,
      pendingPushSync: true,
      lastPushError: null
    });
    await refreshAll();
    pushCapability = getPushCapability();
    showToast(i18n.isEnglish ? "Web Push active" : "Web Push aktif");
  }

  async function disableDevicePush() {
    if (!meta) return;
    await disablePush(meta);
    meta = await updateAppMeta({
      pushEnabled: false,
      pendingPushSync: false,
      lastPushError: null
    });
    pushCapability = getPushCapability();
    showToast(i18n.isEnglish ? "Web Push disabled" : "Web Push dinonaktifkan");
  }

  async function downloadBackup() {
    const data = await exportBackup();
    const fileName = `drops-daily-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const jsonString = JSON.stringify(data, null, 2);

    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare) {
      try {
        const file = new File([jsonString], fileName, { type: "application/json" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: fileName,
          });
          showToast(i18n.isEnglish ? "Backup shared successfully" : "Backup berhasil dibagikan");
          return;
        }
      } catch (error) {
        if ((error as Error)?.name === "AbortError") {
          return;
        }
      }
    }

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast(i18n.t("toast_backup_downloaded"));
  }

  async function importBackup(file: File) {
    try {
      const parsed = validateBackup(JSON.parse(await file.text()));
      await importBackupReplace(parsed);
      showToast(i18n.t("toast_backup_imported"));
      setTimeout(() => location.reload(), 500);
    } catch (error) {
      showToast(error instanceof Error ? error.message : (i18n.isEnglish ? "Import failed" : "Import gagal"));
    }
  }

  async function resetApp() {
    await resetHydrationDB();
    location.reload();
  }

  onMount(() => {
    void initialize();

    const onlineHandler = () => {
      if (meta?.pushEnabled && meta.pendingPushSync) void refreshAll();
    };

    const visibleHandler = () => {
      if (document.visibilityState !== "visible") return;

      void (async () => {
        await reconcileLocalPushState();

        if (settings && profile) {
          const currentDayKey = getHydrationDayKey(new Date(), settings.wakeTime);
          if (currentDayKey !== todayKey) await refreshAll({ syncPush: true });
        }
      })();
    };

    const boundaryTimer = window.setInterval(() => {
      if (
        document.visibilityState === "visible" &&
        settings &&
        profile
      ) {
        const currentDayKey = getHydrationDayKey(new Date(), settings.wakeTime);
        if (currentDayKey !== todayKey) void refreshAll({ syncPush: true });
      }
    }, 60_000);

    window.addEventListener("online", onlineHandler);
    document.addEventListener("visibilitychange", visibleHandler);

    return () => {
      window.clearInterval(boundaryTimer);
      window.removeEventListener("online", onlineHandler);
      document.removeEventListener("visibilitychange", visibleHandler);
    };
  });
</script>

<svelte:head><title>Drops Daily</title></svelte:head>

{#if loading}
  <div class="app-shell grid min-h-screen place-items-center"><div class="text-center"><div class="mx-auto size-8 animate-spin rounded-full border-2 border-slate-200 border-t-water-500"></div><p class="mt-4 text-[14px] text-slate-400">{i18n.isEnglish ? "Loading local data…" : "Membuka data lokal…"}</p></div></div>
{:else if fatalError}
  <div class="app-shell safe-top px-5"><div class="mt-10 rounded-[24px] bg-white p-5 shadow-sm"><h1 class="text-[20px] font-bold">{i18n.isEnglish ? "Application failed to open" : "Aplikasi gagal dibuka"}</h1><p class="mt-2 text-[14px] leading-6 text-slate-500">{fatalError}</p></div></div>
{:else if !meta?.onboardingCompleted || !profile || !settings}
  <Onboarding onComplete={finishOnboarding}/>
{:else if hydration && targetRecord}
  <div class="app-shell relative">
    <div
      bind:this={todayScrollEl}
      use:preventBoundaryOverscroll
      class="screen-scroll {screen === 'today' ? 'block' : 'hidden'}"
    >
      <TodayView
        {consumedMl}
        targetMl={targetRecord.plainWaterGoalMl}
        {entries}
        {hydration}
        {reminderPlan}
        {todayKey}
        {allIntakes}
        {allTargets}
        locale={settings.locale}
        quickAddMl={settings.quickAddMl ?? 250}
        onAdd={addWater}
        onDelete={removeIntake}
        onQuickAddChange={updateQuickAdd}
      />
    </div>
    <div
      bind:this={historyScrollEl}
      use:preventBoundaryOverscroll
      class="screen-scroll {screen === 'history' ? 'block' : 'hidden'}"
    >
      <HistoryView {history7} {history30} locale={settings.locale} />
    </div>
    <div
      bind:this={settingsScrollEl}
      use:preventBoundaryOverscroll
      class="screen-scroll {screen === 'settings' ? 'block' : 'hidden'}"
    >
      <SettingsView bind:this={settingsViewRef} {profile} {settings} {meta} {pushCapability} onProfileChange={updateProfile} onSettingsChange={updateSettings} onProfileSettingsChange={updateProfileAndSettings} onEnablePush={enableDevicePush} onDisablePush={disableDevicePush} onExport={downloadBackup} onImport={importBackup} onReset={resetApp}/>
    </div>
    <BottomNav active={screen} onChange={handleTabChange} locale={settings.locale} />
    {#if toast}<div class="fixed bottom-[calc(104px+env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-4 py-2.5 text-[12px] font-semibold text-white shadow-xl">{toast}</div>{/if}
  </div>
{/if}
