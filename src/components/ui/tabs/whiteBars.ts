// whiteBars.ts
type TimerItem = {
  id: string;         // raceId as a string (falls back to index if API is basic)
  name: string;
  time: string;       // ISO string of lockTime
  stats?: Record<string, any>;
};

// Mount inside the "Upcoming Races" section
const CONTAINER_ID = "white-bars-root";

// max number on screen
const MAX_ON_SCREEN = 5;

// minimum card height
const MIN_CARD_HEIGHT_PX = 64;

// container handles vertical spacing; keep 0 here
const BAR_GAP_PX = 0;

function formatCountdown(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const h = hours.toString().padStart(2, "0");
  const m = minutes.toString().padStart(2, "0");
  const s = seconds.toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function ensureContainer(): HTMLDivElement {
  const container = document.getElementById(CONTAINER_ID) as HTMLDivElement | null;
  if (!container) {
    const fallback = document.createElement("div");
    fallback.id = CONTAINER_ID;
    fallback.className = "space-y-3";
    document.body.appendChild(fallback);
    return fallback;
  }
  return container;
}

function createWhiteBar(item: TimerItem): HTMLDivElement {
  const bar = document.createElement("div");

  // card container
  bar.style.minHeight = `${MIN_CARD_HEIGHT_PX}px`;
  bar.style.background = "#000";
  bar.style.color = "#fff";
  bar.style.display = "flex";
  bar.style.alignItems = "center";
  bar.style.justifyContent = "space-between";
  bar.style.border = "1px solid rgba(255,255,255,0.9)";
  bar.style.borderRadius = "12px";
  bar.style.padding = "16px";
  bar.style.fontFamily =
    "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
  bar.style.fontSize = "14px";
  bar.style.cursor = "pointer";
  bar.style.gap = `${BAR_GAP_PX}px`;

  bar.setAttribute("data-id", item.id);
  bar.setAttribute("data-name", item.name);
  bar.setAttribute("data-time", item.time);
  bar.setAttribute("data-key", `${item.id}`);

  bar.addEventListener("mouseenter", () => (bar.style.background = "#0a0a0a"));
  bar.addEventListener("mouseleave", () => (bar.style.background = "#000"));

  // LEFT: title + optional subline
  const left = document.createElement("div");
  left.style.flex = "1 1 auto";

  const title = document.createElement("h3");
  title.textContent = item.name;
  title.style.fontWeight = "600";
  title.style.margin = "0 0 4px 0";

  const sub = document.createElement("p");
  sub.style.margin = "0";
  sub.style.opacity = "0.7";
  sub.style.fontSize = "12px";
  const horses = item.stats?.horses;
  const track = item.stats?.track; // optional future use
  sub.textContent = horses != null ? `${horses} racers` + (track ? ` • ${track}` : "") : "";

  left.appendChild(title);
  if (sub.textContent) left.appendChild(sub);

  // RIGHT: countdown + view
  const right = document.createElement("div");
  right.style.textAlign = "right";
  right.style.display = "flex";
  right.style.flexDirection = "column";
  right.style.alignItems = "flex-end";

  const timeEl = document.createElement("div");
  timeEl.style.fontSize = "12px";
  timeEl.style.fontWeight = "600";
  timeEl.style.marginBottom = "6px";
  timeEl.setAttribute("data-role", "countdown");
  timeEl.textContent = "--:--:--";

  const viewBtn = document.createElement("button");
  viewBtn.textContent = "View";
  viewBtn.style.background = "transparent";
  viewBtn.style.border = "1px solid rgba(255,255,255,0.25)";
  viewBtn.style.color = "#fff";
  viewBtn.style.padding = "4px 10px";
  viewBtn.style.borderRadius = "8px";
  viewBtn.style.fontSize = "12px";
  viewBtn.style.cursor = "pointer";
  viewBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.location.href = `/races2/${encodeURIComponent(item.id)}`;
  });

  right.appendChild(timeEl);
  right.appendChild(viewBtn);

  bar.appendChild(left);
  bar.appendChild(right);

  bar.addEventListener("click", () => {
    window.location.href = `/races2/${encodeURIComponent(item.id)}`;
  });

  return bar;
}

/**
 * Normalize API output to TimerItem[].
 * Prefers the full shape from /api/info?full=1 (with raceId/lockTime/racers),
 * and falls back to basic /api/info (name/time only).
 */
async function loadFromServer(): Promise<TimerItem[]> {
  // Try the richer endpoint first
  let res = await fetch("/api/info?full=1", { cache: "no-store" });
  if (!res.ok) {
    // Fallback to legacy/basic
    res = await fetch("/api/info", { cache: "no-store" });
  }
  if (!res.ok) throw new Error("Failed to load info");
  const raw = await res.json();

  return (raw as any[]).map((r, idx) => {
    // Prefer on-chain raceId if present
    const raceId =
      r.raceId !== undefined && r.raceId !== null
        ? String(r.raceId)
        : r.id !== undefined && r.id !== null
        ? String(r.id)
        : String(idx); // last resort, keep list stable

    // Prefer lockTime (seconds) if present; else ISO already provided; else now
    const timeIso =
      typeof r.lockTime !== "undefined"
        ? new Date(Number(r.lockTime) * 1000).toISOString()
        : r.time
        ? String(r.time)
        : new Date().toISOString();

    const racers = Array.isArray(r.racers) ? r.racers : undefined;

    return {
      id: raceId,
      name: r.name ?? `Race ${raceId}`,
      time: timeIso,
      stats: racers ? { horses: racers.length } : undefined,
    } as TimerItem;
  });
}

// no-op: on-chain list isn't mutable via DELETE; kept for compatibility
async function deleteOnServer(_name: string, _time: string) {
  return;
}

function sortAndFilter(items: TimerItem[], nowMs = Date.now()) {
  return items
    .filter((i) => Date.parse(i.time) > nowMs)
    .sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
}

function renderTop(container: HTMLElement, items: TimerItem[], limit = MAX_ON_SCREEN) {
  container.innerHTML = "";
  items.slice(0, limit).forEach((it) => container.appendChild(createWhiteBar(it)));
}

export async function startWhiteBars() {
  const container = ensureContainer();
  let queue: TimerItem[] = [];

  const currentKeys = () =>
    Array.from(container.querySelectorAll<HTMLDivElement>("div[data-key]")).map(
      (n) => n.getAttribute("data-key")!,
    );

  async function refreshAll(reSeed = false) {
    const data = await loadFromServer();
    const fresh = sortAndFilter(data);

    if (reSeed) {
      queue = fresh;
      renderTop(container, queue);
      return;
    }

    const freshTopKeys = fresh.slice(0, MAX_ON_SCREEN).map((i) => `${i.id}`);
    const domKeys = currentKeys();
    const same =
      freshTopKeys.length === domKeys.length &&
      freshTopKeys.every((k, idx) => k === domKeys[idx]);

    if (!same) {
      queue = fresh;
      renderTop(container, queue);
    } else {
      queue = fresh;
    }
  }

  async function appendNextIfAvailable() {
    const domCount = container.querySelectorAll("div[data-key]").length;
    if (domCount >= MAX_ON_SCREEN) return;

    while (
      queue.length > 0 &&
      container.querySelectorAll("div[data-key]").length < MAX_ON_SCREEN
    ) {
      const onScreen = new Set(currentKeys());
      const next = queue.find((i) => !onScreen.has(`${i.id}`));
      if (!next) break;

      const targetMs = Date.parse(next.time);
      const now = Date.now();
      if (targetMs <= now) {
        // expired – just drop locally (no DELETE on-chain)
        queue = queue.filter((i) => i.id !== next.id);
        continue;
      }

      container.appendChild(createWhiteBar(next));
    }
  }

  async function tick() {
    const now = Date.now();
    const bars = Array.from(container.querySelectorAll<HTMLDivElement>("div[data-key]"));
    let expiredOccurred = false;

    for (const bar of bars) {
      const timeStr = bar.getAttribute("data-time")!;
      const target = Date.parse(timeStr);
      const remaining = target - now;

      const timerEl = bar.querySelector<HTMLElement>('[data-role="countdown"]');
      if (timerEl) timerEl.textContent = formatCountdown(remaining);

      if (remaining <= 0) {
        expiredOccurred = true;
        bar.remove();
      }
    }

    if (expiredOccurred) {
      await appendNextIfAvailable();
    }
  }

  try {
    await refreshAll(true);
  } catch (e) {
    console.error(e);
  }

  const refreshInterval = setInterval(() => {
    refreshAll(false).catch(console.error);
  }, 15_000);

  const tickInterval = setInterval(() => {
    tick().catch(console.error);
  }, 1_000);

  return () => {
    clearInterval(refreshInterval);
    clearInterval(tickInterval);
    const bars = Array.from(container.querySelectorAll("div[data-key]"));
    bars.forEach((b) => b.remove());
  };
}
