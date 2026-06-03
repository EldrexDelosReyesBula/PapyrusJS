/**
 * Papyr.js Type Definitions
 * Unlocks VS Code IntelliSense and Autocomplete for Vanilla JS developers.
 */

declare namespace papyr {
    /** Reactive state primitive */
    export function state<T>(initialValue: T): { value: T; subscribe(fn: (val: T) => void): () => void };
    
    /** Computed reactive state */
    export function computed<T>(computeFn: () => T): { value: T; subscribe(fn: (val: T) => void): () => void };
    
    /** Create a basic HTML Element */
    export function el(tag: string, ...args: any[]): HTMLElement;
    
    /** Mounts a component to a DOM selector */
    export function mount(selector: string, component: HTMLElement | DocumentFragment): void;

    /** Error boundary to handle component failures */
    export function errorBoundary(renderFn: () => HTMLElement | DocumentFragment, fallbackFn?: (err: Error) => HTMLElement | DocumentFragment): HTMLElement;

    /** Core DOM element wrappers */
    export function div(...args: any[]): HTMLElement;
    export function span(...args: any[]): HTMLElement;
    export function p(...args: any[]): HTMLElement;
    export function a(...args: any[]): HTMLElement;
    export function img(...args: any[]): HTMLElement;
    export function button(...args: any[]): HTMLElement;
    export function input(...args: any[]): HTMLElement;
    export function form(...args: any[]): HTMLElement;
    export function h1(...args: any[]): HTMLElement;
    export function h2(...args: any[]): HTMLElement;
    export function h3(...args: any[]): HTMLElement;
    export function ul(...args: any[]): HTMLElement;
    export function li(...args: any[]): HTMLElement;

    /** Elite Typography Mappings */
    export function title(...args: any[]): HTMLElement;
    export function muted(...args: any[]): HTMLElement;
    
    /** Layout Helpers */
    export function row(...args: any[]): HTMLElement;
    export function col(...args: any[]): HTMLElement;
    
    /** Flexbox utilities */
    export const flex: {
        center(...args: any[]): HTMLElement;
        between(...args: any[]): HTMLElement;
        col(...args: any[]): HTMLElement;
        row(...args: any[]): HTMLElement;
        around(...args: any[]): HTMLElement;
        wrap(...args: any[]): HTMLElement;
    };

    /** Object-Oriented Base Component */
    export class component {
        constructor();
        render(): HTMLElement;
    }

    /** Object-Relational Model */
    export class model {
        id?: string;
        constructor(data?: any);
        save(): this;
        delete(): void;
        static create<T extends model>(this: new (data: any) => T, data: any): T;
        static find<T extends model>(this: new (data: any) => T, id: string): T | null;
        static all<T extends model>(this: new (data: any) => T): T[];
        static watch<T extends model>(this: new (data: any) => T, callback: (items: T[]) => void): () => void;
    }

    /** Unified Database API */
    export function db(collectionName: string, engine?: 'local' | 'session' | 'indexeddb' | 'firebase' | 'sqlite'): {
        state: { value: any[] };
        list(): any[];
        listAsync(): Promise<any[]>;
        find(id: string): any;
        findAsync(id: string): Promise<any>;
        query(options?: { filter?: any; sort?: { field: string; direction?: 'asc' | 'desc' }; limit?: number; offset?: number }): any[];
        queryAsync(options?: { filter?: any; sort?: { field: string; direction?: 'asc' | 'desc' }; limit?: number; offset?: number }): Promise<any[]>;
        insert(item: any): any;
        insertAsync(item: any): Promise<any>;
        update(id: string, data: any): void;
        updateAsync(id: string, data: any): Promise<void>;
        delete(id: string): void;
        deleteAsync(id: string): Promise<void>;
        clear(): void;
        clearAsync(): Promise<void>;
        watch(callback: (data: any[]) => void): () => void;
        transaction(callback: (tx: { insert(item: any): any; update(id: string, data: any): void; delete(id: string): void }) => Promise<void> | void): Promise<void>;
    };

    /** Unified Data API (Data System 2.0) */
    export const data: {
        local(collectionName: string): ReturnType<typeof db>;
        session(collectionName: string): ReturnType<typeof db>;
        indexed(collectionName: string): ReturnType<typeof db>;
        remote(collectionName: string): ReturnType<typeof db>;
    };

    /** Lightweight local CRUD store */
    export function crud(name: string, initialData?: any[]): {
        items: { value: any[] };
        list(): any[];
        query(options?: { filter?: any; sort?: { field: string; direction?: 'asc' | 'desc' }; limit?: number; offset?: number }): any[];
        create(item: any): any;
        read(id: string): any;
        update(id: string, updates: any): void;
        delete(id: string): void;
        clear(): void;
    };

    /** Dynamic Auth Engine */
    export const auth: {
        user: { value: any | null };
        init(config?: { provider?: string }): void;
        login(credentials: { username?: string; password?: string; email?: string }): Promise<any>;
        register(credentials: { username?: string; password?: string }): Promise<any>;
        logout(): Promise<void>;
        use(name: string): any;
        registerProvider(name: string, providerInstance: any): void;
    };

    /** Abstract Payment Gateway Registry */
    export const payments: {
        use(name: string): any;
        register(name: string, gatewayInstance: any): void;
        resolve(name: string): any;
        checkout(gatewayName: string, options: any): Promise<any>;
    };

    export interface StorageAPI {
        (key: string, val?: any): any;
        set(key: string, value: any): void;
        get(key: string): any;
        remove(key: string): void;
        clear(): void;
        secureSet(key: string, value: any, password: string): void;
        secureGet(key: string, password: string): any;
        secureSetAsync(key: string, value: any, password: string): Promise<void>;
        secureGetAsync(key: string, password: string): Promise<any>;
    }

    export const storage: StorageAPI;
    export const session: StorageAPI;

    /** Fetch API Wrappers */
    export const api: {
        get(url: string, headers?: any): Promise<any>;
        post(url: string, data: any, headers?: any): Promise<any>;
    };

    /** Cloud Gateway (Provider-Agnostic) */
    export const cloud: {
        register(name: string, providerInstance: any): void;
        use(name: string): any;
    };

    /** PWA / Offline support */
    export const pwa: {
        init(swPath?: string): Promise<void>;
    };

    /** Debugging Suite */
    export function log(...data: any[]): void;
    export function warn(...data: any[]): void;

    /** Native Browser APIs */
    export const clipboard: {
        copy(text: string): Promise<void>;
        read(): Promise<string>;
    };
    
    export const location: {
        get(): Promise<GeolocationPosition>;
        request(reason: string): Promise<GeolocationPosition>;
    };
    
    export const camera: {
        open(videoElementId?: string): Promise<MediaStream>;
        request(reason: string, videoElementId?: string): Promise<MediaStream>;
        stop(): void;
    };
    
    export function vibrate(pattern: number | number[]): void;

    /** Math & Charting Plugins */
    export const math: {
        sum(...args: any[]): { value: number };
        sub(a: any, b: any): { value: number };
        mul(...args: any[]): { value: number };
        div(a: any, b: any): { value: number };
        avg(...args: any[]): { value: number };
        percent(val: any, total: any): { value: number };
        round(val: any, decimals?: any): { value: number };
    };
    
    export function chart(type: 'bar' | 'ring', data: any, options?: any): HTMLCanvasElement;
    export function simpleTable(data: { headers?: string[]; rows?: any[][] }): HTMLElement;

    /** Design Engine */
    export function glass(...args: any[]): HTMLElement;
    export function center(...args: any[]): HTMLElement;
    export function left(...args: any[]): HTMLElement;
    export function right(...args: any[]): HTMLElement;
    export function justify(...args: any[]): HTMLElement;
    export function template(name: string): HTMLElement;

    /** Animate Extensions */
    export function parallax(selector: string, speed?: number): void;
    export function physics(options?: { gravity?: number, bounce?: number, friction?: number }): (el: HTMLElement) => HTMLElement;

    /** Particles Engine */
    export function particles(options?: { type?: 'snow' | 'stars' | 'fire', count?: number, speed?: number, color?: string }): HTMLCanvasElement;

    /** UI Components */
    export function toast(message: string, type?: 'info' | 'success' | 'warning' | 'error', duration?: number, useNative?: boolean): void;
    export function modal(content: any, title?: string): HTMLElement & { show(): void; hide(): void };
    export function modal(options: { title?: string; content?: any; animation?: string; onClose?: () => void }): { close(): void };
    export function tabs(tabs: Array<{ title: string; content: any }>): HTMLElement;
    export function table(headers: string[], data: any[]): HTMLElement;
    export function fetch(url: string, options?: any): Promise<HTMLElement>;
    export function drawer(options?: { content?: any, position?: 'left' | 'right' }): { close(): void };
    export function banner(options?: { message: string, type?: 'info' | 'success' | 'warning' | 'error', actions?: Array<{ text: string, action: () => void }> }): void;
    export function snackbar(options?: { message: string, actionText?: string, onAction?: () => void, duration?: number }): void;
    export function tooltip(target: HTMLElement, text: string): void;
    export function accordion(items: Array<{ title: string, content: any }>): HTMLElement;
    export function checkbox(label: string, stateObj: { value: boolean }): HTMLElement;
    export function radio(name: string, label: string, value: any, stateObj: { value: any }): HTMLElement;
    export function navigationRail(items: Array<{ label: string, icon: string, onclick?: () => void }>): HTMLElement;
    export function progress(value: any, max?: number): HTMLElement;
    export function stepper(steps: string[], activeStepState: { value: number }): HTMLElement;
    export function menu(trigger: HTMLElement, items: Array<{ text: string, onclick: () => void }>): void;
    export function dropdown(options?: { items?: string[], placeholder?: string, onSelect?: (item: string) => void }): HTMLElement;
    export function emptyState(options?: { title?: string, description?: string, icon?: string }): HTMLElement;
    export function skeletonLoader(options?: { type?: 'card' | 'line', count?: number }): HTMLElement;
    export function calendar(options?: { onSelect?: (date: Date) => void }): HTMLElement;
    export function datePicker(options?: { placeholder?: string, onSelect?: (date: Date) => void }): HTMLElement;

    /** Design Import Gate (Declared via interface merging at the bottom of this file) */

    /** Security Kernel */
    export const security: {
        sanitize(html: string): string;
        use(provider: 'disable' | any): void;
        encrypt(text: string, password: string): string;
        decrypt(encodedText: string, password: string): string | null;
        encryptAsync(text: string, password: string): Promise<string>;
        decryptAsync(encodedText: string, password: string): Promise<string | null>;
    };

    /** Object Injection Protection Utility */
    export function safeGet(obj: any, key: string): any;

    /** Layout Engine */
    export const layout: {
        flex(options?: any, ...children: any[]): HTMLElement;
        grid(options?: any, ...children: any[]): HTMLElement;
        row(...children: any[]): HTMLElement;
        col(...children: any[]): HTMLElement;
        dashboard(options?: { sidebar?: any, header?: any, main?: any, footer?: any }): HTMLElement;
        mobile(options?: any, ...children: any[]): HTMLElement;
        tablet(options?: any, ...children: any[]): HTMLElement;
        desktop(options?: any, ...children: any[]): HTMLElement;
        foldable(options?: any, ...children: any[]): HTMLElement;
    };

    /** Auto-adaptive flex alignment */
    export function autoFlex(container: HTMLElement, options?: any): HTMLElement;

    /** Clean URL Page System */
    export function page(path: string, componentFn: any): void;
    export function page(): HTMLElement;
    export namespace page {
        export function navigate(path: string): void;
    }
    export function usePageParams(): { value: any };

    /** Continuity Engine & Drafts */
    export const drafts: {
        save(key: string, data: any): void;
        restore(key: string): any;
        clear(key: string): void;
    };
    export const continuity: {
        enable(options?: { key?: string; target?: any; interval?: number; onSave?: (data: any) => void }): void;
        disable(key?: string): void;
        restore(options?: { key?: string; target?: any; onRestore?: (data: any) => void }): any;
    };

    /** Offline-First Synchronization */
    export const offline: {
        enable(options?: { onSync?: (item: any) => Promise<void> }): void;
        queueWrite(action: string, collection: string, data: any): void;
        sync(): Promise<void>;
    };

    /** Reliability Retry Utility */
    export function retry<T>(fn: () => Promise<T> | T, options?: { retries?: number; delay?: number; factor?: number; onError?: (err: Error, attempt: number) => void }): Promise<T>;

    /** Energy-Aware rendering and task scheduling throttler */
    export const power: {
        state: { value: 'active' | 'idle' | 'away' | 'suspended' };
        fps: { value: number };
        targetFps: { value: number };
        isBackground: { value: boolean };
        adaptiveEffects: { value: boolean };
        deviceCapability: 'Low End' | 'Mid Range' | 'High End';
        battery: {
            level: { value: number };
            charging: { value: boolean };
        };
        activity(): void;
        throttle(callback: () => void): () => void;
    };

    /** AI Gateway Integration */
    export const ai: {
        prompt(template: string, variables?: any): string;
        toSemanticJSON(elOrConfig: any): any;
        use(name: string): any;
        normalizeResponse(provider: string, data: any): { success: boolean; content: string | null; refusal: string | null };
        chat(options?: { provider?: string; apiKey?: string; messages?: any[]; model?: string; endpoint?: string }): Promise<any>;
    };

    export function noConflict(): any;
}

/** Design Import Gate interface merging to bypass keyword namespace limitations */
interface papyr {
    "import": {
        figma(figmaJson: any): HTMLElement;
    };
}

