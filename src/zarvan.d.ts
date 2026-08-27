/**
 * Zarvan Calendar v__ZARVAN_VERSION__ - TypeScript definitions.
 *
 * Zarvan is loaded with a <script> tag and lives on `window`, so this file declares GLOBALS. It
 * deliberately contains no `import` and no `export`: adding either would turn it into a module and the
 * globals would stop being visible.
 *
 * Point tsconfig at it:
 *
 *   { "compilerOptions": { "typeRoots": ["./types"] } }        // if you copied it into types/
 *   { "include": ["src/**\/*", "vendor/zarvan/zarvan.d.ts"] }  // or just include the file
 *
 * Dates are Jalali strings, never Date objects: "YYYY-M-D" for an all-day event, "YYYY-M-DTHH:MM" for
 * a timed one. Zero-padding is optional. Gregorian `Date`s appear only in callback payloads and
 * getVisibleRange(), where they exist so you can talk to a backend.
 */

declare namespace Zarvan {
  /** A Jalali date. Months and days are 1-based. */
  interface JDate {
    jy: number;
    jm: number;
    jd: number;
  }

  /** A Gregorian range, for talking to a backend. */
  interface GRange {
    startG: Date;
    endG: Date;
  }

  type ViewName = "day" | "week" | "month" | "year" | "list" | (string & {});

  // ---------------------------------------------------------------- events

  interface Repeat {
    freq: "daily" | "weekly" | "monthly";
    /** Defaults to 1. */
    interval?: number;
    /** Inclusive. A Jalali date string. */
    until?: string;
    /** Caps occurrences produced within the queried range. */
    count?: number;
    /** Saturday = 0. */
    byWeekday?: number[];
  }

  interface CalendarEvent {
    /** Any comparable value. Required for updateEvent() / removeEvent(). */
    id?: string | number;
    title: string;
    /** "1405-06-02" or "1405-06-02T09:00". */
    start: string;
    /** Defaults to `start`. */
    end?: string;
    /** Drives colour and the type filter. */
    type?: string;
    allDay?: boolean;
    /** Keep a multi-day event on the time grid instead of the all-day row. */
    forceTimed?: boolean;
    repeat?: Repeat;
    /** Set by the library when validation kept an invalid event. */
    _invalid?: boolean;
    [key: string]: unknown;
  }

  // ---------------------------------------------------------------- highlights

  interface HighlightWhen {
    /** Saturday = 0. */
    weekday?: number[];
    /** Jalali date strings; unpadded is fine. */
    jDates?: string[];
    jRange?: { start?: string; end?: string };
  }

  interface HighlightRule extends HighlightWhen {
    /** Omit to match every view. */
    views?: ViewName[];
    when?: HighlightWhen;
    day?: { bg?: string; className?: string };
    /** Week and day views only. */
    time?: { start: string; end: string; bg?: string; className?: string };
    bg?: string;
    className?: string;
  }

  // ---------------------------------------------------------------- options

  interface Interactions {
    click?: boolean;
    dblClick?: boolean;
    hover?: boolean;
    contextMenu?: boolean;
    focus?: boolean;
  }

  interface Features {
    sidebar?: boolean;
    miniCalendar?: boolean;
    filters?: boolean;
    typeFilter?: boolean;
    search?: boolean;
    autocomplete?: boolean;
    exportExcel?: boolean;

    viewDropdown?: boolean;
    menuButton?: boolean;
    navigation?: boolean;
    prevNext?: boolean;
    todayButton?: boolean;

    views?: Partial<Record<ViewName, boolean>>;

    dayHighlights?: boolean;
    timeHighlights?: boolean;
    nowLine?: boolean;
    /** The only flag that defaults to false. */
    autoScrollToNow?: boolean;

    moreEventsModal?: boolean;
    allDayRow?: boolean;
    allDayBar?: boolean;

    interactions?: Interactions;

    typeStyleInjection?: boolean;
    /** false silences the entire callback bus. */
    events?: boolean;
    overlapFocus?: boolean;

    /** "overlap" cascades conflicting events; "columns" packs them side by side. */
    timeGridLayout?: "overlap" | "columns";
  }

  interface Locale {
    code: string;
    /** 7 names, starting Saturday. */
    weekdays?: string[];
    weekdaysShort?: string[];
    /** 12 Jalali month names. */
    months?: string[];
    /** Shapes every number the calendar prints. null leaves numerals alone. */
    digits?: string[] | null;
    strings?: Record<string, string>;
  }

  interface Validation {
    enabled?: boolean;
    requireNumericId?: boolean;
    /** "drop" removes invalid events; "keep" flags them `_invalid`. */
    onInvalid?: "drop" | "keep";
    /** Repair an `end` that falls before `start`. */
    autoFix?: boolean;
  }

  interface TypeStyle {
    bg?: string;
    color?: string;
  }

  /** The range a lazy source is asked about. Gregorian for your backend, Jalali because this is one. */
  interface EventRange {
    startG: Date;
    endG: Date;
    startJ: JDate;
    endJ: JDate;
    view: ViewName;
  }

  /**
   * Asked for one visible range at a time. Return the events for it, or a promise of them.
   *
   *   events: async ({ startG, endG }) => fetchFromServer(startG, endG)
   *
   * Called when the visible range changes — navigation and view switches — and not for re-renders
   * that leave the range where it is. Ranges already fetched are served from a capped cache, so
   * paging back and forth does not re-request. What comes back REPLACES what was loaded: the source
   * is the authority for the range it was asked about.
   */
  type EventLoader = (range: EventRange) => CalendarEvent[] | Promise<CalendarEvent[]>;

  interface Options {
    selector: string | HTMLElement;
    /** Every event up front, or a function asked for one range at a time. */
    events?: CalendarEvent[] | EventLoader;
    /** How many fetched ranges to remember. Default 12. */
    eventCacheLimit?: number;
    view?: ViewName;
    /** A code, a full locale, or a partial one naming the locale it extends. */
    locale?: string | Partial<Locale>;
    /** "sync" renders immediately instead of batching into an animation frame. */
    renderMode?: "batched" | "sync";
    features?: Features;

    typeLabels?: Record<string, string>;
    typeStyles?: Record<string, TypeStyle>;
    highlights?: HighlightRule[];
    validation?: Validation;

    /** Render inside a shadow root. Needs `styles` unless the sheet is same-origin and readable. */
    shadow?: boolean;
    styles?: string | CSSStyleSheet | Array<string | CSSStyleSheet>;

    /** Replaces the registered plugin set entirely. `[]` installs none. */
    plugins?: Plugin[];
    /** `{ xlsx }` for the Excel export plugin. */
    deps?: { xlsx?: unknown; [key: string]: unknown };

    handlers?: Handlers;
  }

  // ---------------------------------------------------------------- callbacks

  interface EventMeta {
    view: ViewName;
    gdate: Date | null;
    jdate: JDate | null;
    isAllDay: boolean;
    domEvent: Event | null;
    /**
     * The element this event was drawn as, in whichever view is showing.
     *
     * Prefer this over `domEvent.currentTarget` (same node, but only while the event is being
     * dispatched) and over `domEvent.target` (a child in some views - a list row's title, for one).
     * Anchor popovers to it. Note that any re-render replaces it, so do not hold on to it across
     * navigation, a view change, a filter change or a data change.
     *
     * Every event node also carries the `zc-event-node` marker class.
     */
    element: HTMLElement | null;
  }

  interface Ctx {
    instanceId: string;
    container: HTMLElement;
    view: ViewName;
    filterState: { type: string; q: string };
    currentJalali: JDate;
    currentWeekDate: Date;
    currentDayDate: Date;
  }

  interface DayRef {
    gdate: Date;
    jdate: JDate;
  }

  /** Every callback receives the same three arguments. `meta` is null where there is none. */
  type Handler<P = unknown, M = null> = (payload: P, meta: M, ctx: Ctx) => void;
  type EventHandler = Handler<CalendarEvent, EventMeta>;

  interface Handlers {
    // lifecycle
    onInit?: Handler<null>;
    onDestroy?: Handler<{ phase: "before" | "after" }>;
    onRenderStart?: Handler<{ view: ViewName }>;
    onRenderEnd?: Handler<{ view: ViewName }>;
    onViewRender?: Handler<{ view: ViewName }>;

    // navigation
    onViewChange?: Handler<{ from: ViewName; to: ViewName; source: string }>;
    onDateChange?: Handler<{ from: Date; to: Date; source: string }>;
    onRangeChange?: Handler<{ startG: Date; endG: Date; view: ViewName }>;
    onNext?: Handler<{ view: ViewName }>;
    onPrev?: Handler<{ view: ViewName }>;
    onToday?: Handler<null>;

    // data
    onEventsSet?: Handler<CalendarEvent[]>;
    onEventsChange?: Handler<{
      /** "load" is a lazy source answering; the rest are local mutations. */
      type: "set" | "add" | "update" | "remove" | "load";
      event: CalendarEvent | null;
      events: CalendarEvent[];
    }>;

    // lazy loading — only fire when `events` is a function
    /** A range is being fetched. The container also carries `zc-is-loading` while any load is out. */
    onEventsLoadStart?: Handler<{ startG: Date; endG: Date; view: ViewName }>;
    /** A range arrived and was applied. */
    onEventsLoadEnd?: Handler<{
      events: CalendarEvent[];
      startG: Date;
      endG: Date;
      view: ViewName;
    }>;
    /**
     * A range failed. Whatever was on screen is left alone rather than blanked, and the range is not
     * cached, so returning to it tries again. Also reported through `onError`.
     */
    onEventsLoadError?: Handler<{
      error: unknown;
      startG: Date;
      endG: Date;
      view: ViewName;
    }>;

    // event interaction
    onEventClick?: EventHandler;
    onEventDblClick?: EventHandler;
    onEventHover?: EventHandler;
    onEventLeave?: EventHandler;
    onEventContextMenu?: EventHandler;
    onEventFocus?: EventHandler;
    onEventBlur?: EventHandler;

    // chrome interaction
    onDayNumberClick?: Handler<{ gdate: Date; jdate: JDate; view: ViewName | "mini" }>;
    onWeekHeaderDayClick?: Handler<{ gdate: Date; jdate: JDate; view: ViewName }>;
    onMoreEventsClick?: Handler<{ date: DayRef; events: CalendarEvent[]; view: ViewName }>;
    onModalOpen?: Handler<{ dateLabel: string; events: CalendarEvent[]; date: DayRef | null }>;
    onModalClose?: Handler<{ reason: string }>;
    onSidebarToggle?: Handler<boolean>;
    onFiltersChange?: Handler<{ type: string; q: string; source: string; from?: string; to?: string }>;
    onAutocompleteSelect?: Handler<{ value: string }>;
    onViewDropdownOpen?: Handler<null>;
    onViewDropdownClose?: Handler<{ reason: string }>;

    // export
    onExportStart?: Handler<{ view: ViewName; fileName: string }>;
    onExportEnd?: Handler<{ view: ViewName; fileName: string; count: number }>;
    onExportError?: Handler<Error>;

    // diagnostics
    /** Switch on `code`; `message` is localised and will change. */
    onWarn?: Handler<{ code: string; message: string; extra?: unknown }>;
    onError?: Handler<Error>;
    onLocaleChange?: Handler<{ code: string }>;

    [name: string]: unknown;
  }

  // ---------------------------------------------------------------- instance

  interface Instance {
    /** Names of the plugins installed into this instance. */
    plugins(): string[];

    // ---- data
    /** A copy of the list. The event objects are shared - treat them as read-only. */
    getEvents(): CalendarEvent[];
    getEventById(id: string | number): CalendarEvent | null;
    /**
     * Replace the events, or swap the source itself: pass a function to switch to loading one range
     * at a time, pass an array to switch back. Returns what is loaded now, which for a function is
     * empty until the first load lands.
     */
    setEvents(list: CalendarEvent[] | EventLoader): CalendarEvent[];
    /** Reload the visible range, ignoring the cache. False when `events` is an array. */
    refetchEvents(): boolean;
    /** Whether events come from a function rather than an array. */
    isLazy(): boolean;
    /** Whether a load is outstanding right now. */
    isLoading(): boolean;
    /** Returns the normalised stored event, or null if validation rejected it. */
    addEvent(event: CalendarEvent): CalendarEvent | null;
    updateEvent(id: string | number, patch: Partial<CalendarEvent>): CalendarEvent | null;
    removeEvent(id: string | number): CalendarEvent | null;

    // ---- navigation
    getView(): ViewName;
    setView(view: ViewName): void;
    /** Enabled views, in switcher order. */
    getViews(): ViewName[];
    getDate(): Date;
    getJDate(): JDate;
    /** Moves every view's anchor, not just the active one. */
    gotoDate(date: Date | JDate): Date | null;
    getVisibleRange(): GRange;
    next(): void;
    prev(): void;
    today(): void;
    /** Older aliases for next / prev / today. */
    goNext(): void;
    goPrev(): void;
    goToday(): void;

    // ---- configuration
    /** Feature flags (dotted paths work: "features.views.year") plus view, locale, typeLabels,
     *  typeStyles, highlights, events. Anything else warns through onWarn and returns null. */
    setOption(key: string, value: unknown): unknown;
    /** Bare names are namespaced: "color-accent" === "--zc-color-accent". null clears an override. */
    setTheme(tokens: Record<string, string | null>): string;
    setTypeStyles(map: Record<string, TypeStyle>): void;
    getHighlights(): HighlightRule[];
    setHighlights(list: HighlightRule[]): void;
    getLocale(): string;
    setLocale(locale: string | Partial<Locale>): void;

    // ---- bus
    /** Returns an unsubscribe function. */
    on(name: string, fn: Handler<any, any>): () => void;
    off(name: string, fn: Handler<any, any>): void;
    emit(name: string, payload?: unknown): void;

    // ---- DOM and lifecycle
    /** The element passed to create(). */
    getContainer(): HTMLElement;
    /** The .zc-calendar element. Same as getContainer() outside shadow mode. */
    getRoot(): HTMLElement;
    getShadowRoot(): ShadowRoot | null;
    /** Flush any pending render immediately. */
    refresh(): void;
    /** Releases every listener, interval, node and style tag, and cleans the host element. */
    destroy(): void;

    /** Added by the bundled excel-export plugin. */
    exportToExcel?(): void;

    [key: string]: unknown;
  }

  // ---------------------------------------------------------------- extension

  /** What a view renderer is handed. */
  interface ViewContext {
    features: Features;
    instanceId: string;
    state: Record<string, unknown>;
    store: DisposableStore;
    emit(name: string, payload?: unknown): void;
    hooks: Hooks;
    /** Call for anything standing for a day, so highlight plugins reach your view. */
    decorateDay(el: HTMLElement, gdate: Date, jdate: JDate, view: ViewName): HTMLElement;
    /** Call for anything standing for an event: gets the bus, keyboard activation and ARIA. */
    bindEventItem(el: HTMLElement, event: CalendarEvent, meta: Partial<EventMeta>): void;
    showEventsModal(events: CalendarEvent[], dateLabel: string, date?: DayRef): void;
    goToDayViewByGDate(gdate: Date): void;
    eventsFor(jdate: JDate): CalendarEvent[];
    moreLabel(n: number): string;
    dayLabel(jdate: JDate): string;
    /** Wires click plus Enter/Space, with a role and a tab stop. */
    onActivate(el: HTMLElement, label: string | null, handler: (e: Event) => void): HTMLElement;
    [key: string]: unknown;
  }

  interface ViewDefinition {
    /** A string, or a function so setLocale() can relabel it. */
    label?: string | (() => string);
    /** Position in the view switcher. */
    order?: number;
    /** Which dates the view covers - decides which events are loaded. */
    range(): GRange;
    /** The date that identifies this view's position, for change detection. */
    anchor(): Date;
    /** dir is +1 or -1. */
    step(dir: 1 | -1): void;
    /** Which month the mini calendar follows. */
    focusDate?(): Date;
    /** Which day the mini calendar marks selected. */
    selectedJDate?(): JDate;
    /** Return the header text, or null to write .zc-title yourself. */
    title?: ((ctx: ViewContext) => string) | null;
    render(ctx: ViewContext): void;
  }

  /** Vertical scale of a time grid, derived from --zc-hour-height. */
  interface GridMetrics {
    hourHeight: number;
    pxPerMin: number;
    dayHeight: number;
  }

  interface HookPayloads {
    /** Any element standing for a single day. */
    dayElement: { el: HTMLElement; gdate: Date; jdate: JDate; view: ViewName };
    /** A 24-hour column. `store` is the RENDER store - released at the next render. */
    timeColumn: {
      el: HTMLElement;
      gdate: Date;
      jdate: JDate;
      view: ViewName;
      store: DisposableStore;
      metrics: GridMetrics;
    };
    /** The sidebar filter panel, once built. */
    sidebar: { el: HTMLElement; ctx: ViewContext };
    /** After a view has finished drawing. */
    viewRendered: { view: ViewName; body: HTMLElement; days: DayRef[]; metrics: GridMetrics };
  }

  interface Hooks {
    on<K extends keyof HookPayloads>(name: K, fn: (payload: HookPayloads[K]) => void): () => void;
    on(name: string, fn: (payload: any) => void): () => void;
    run(name: string, payload?: unknown): unknown;
    count(name: string): number;
  }

  interface DisposableStore {
    add(fn: () => void): () => void;
    addListener(target: EventTarget, type: string, fn: EventListener, capture?: boolean): () => void;
    addNode(node: Node): () => void;
    addInterval(fn: () => void, ms: number): () => void;
    addTimeout(fn: () => void, ms: number): () => void;
    dispose(): void;
    reset(): void;
  }

  /** The curated surface install() receives - not the internals. */
  interface PluginContext {
    hooks: Hooks;
    /** Anything added here becomes a public method on the instance. */
    api: Instance;
    /** Released on destroy(). */
    store: DisposableStore;

    options: Options;
    /** Respect these rather than assuming you should draw. */
    features: Features;
    state: Record<string, unknown>;

    emit(name: string, payload?: unknown): void;
    on(name: string, fn: Handler<any, any>): () => void;
    off(name: string, fn: Handler<any, any>): void;
    warn(code: string, extra?: unknown): void;
    error(err: unknown): void;

    t(key: string, params?: Record<string, unknown>): string;
    /** Shape a number into the locale's digits. */
    num(value: string | number): string;
    typeLabel(type: string): string;
    viewLabel(): string;
    headerTitle(): string;

    getContainer(): HTMLElement;
    getEvents(): CalendarEvent[];
    getHighlights(): HighlightRule[];
    getVisibleRange(): GRange;
    expandRecurring(events: CalendarEvent[], startG: Date, endG: Date): CalendarEvent[];
    applyFilters(events: CalendarEvent[]): CalendarEvent[];
    requestRender(): void;
    refresh(): void;
  }

  interface Plugin {
    name: string;
    /** Return a teardown function, or register on cal.store. Anything else leaks. */
    install(cal: PluginContext): (() => void) | void;
  }

  // ---------------------------------------------------------------- statics

  /** The build this file came from. */
  const version: string;

  function create(options: Options): Instance;

  /** Registers a plugin for every calendar created afterwards. An existing name is replaced. */
  function use(plugin: Plugin): Plugin;
  function unuse(name: string): boolean;
  function plugins(): string[];

  /** Call before create(). Instances copy the registry at construction. */
  function registerView(key: string, def: ViewDefinition): ViewDefinition;
  function unregisterView(key: string): boolean;
  function registeredViews(): string[];

  function registerLocale(def: Locale): Locale;
  function locales(): string[];
}

/** The jalaali date library, bundled into zarvan.js and left on the global for date conversion. */
declare namespace jalaali {
  function toJalaali(gy: number, gm: number, gd: number): Zarvan.JDate;
  function toJalaali(date: Date): Zarvan.JDate;
  function toGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number };
  function isValidJalaaliDate(jy: number, jm: number, jd: number): boolean;
  function isLeapJalaaliYear(jy: number): boolean;
  function jalaaliMonthLength(jy: number, jm: number): number;
  function jalaaliToDateObject(jy: number, jm: number, jd: number, h?: number, m?: number, s?: number, ms?: number): Date;
  function jalaaliWeek(jy: number, jm: number, jd: number): { saturday: Zarvan.JDate; friday: Zarvan.JDate };
}

interface Window {
  Zarvan: typeof Zarvan;
  jalaali: typeof jalaali;
}
