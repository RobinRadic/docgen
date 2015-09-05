/// <reference path="../types.d.ts" />
/// <reference path="./types/tsd.d.ts" />
/*
interface WebpackRequireEnsureCallback {
    (req: WebpackRequire): void
}

interface WebpackRequire {
    (id: string): any;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure(ids: string[], callback: WebpackRequireEnsureCallback, chunkName?: string): void;
}

declare var require: WebpackRequire;
*/

interface Window {
    attachEvent(name:string, handler?:Function);
    packadic?:any;
    packadicConfig?:any;
}
declare var window:Window;

/** EventEmitter2 fix to require and extend properly */
interface EventEmitter2Configuration {
    wildcard?: boolean;
    delimiter?: string;
    maxListeners?: number;
    newListener?: boolean;
}

declare class EventEmitter2 {
    constructor(conf?:EventEmitter2Configuration);

    addListener(event:string, listener:Function):EventEmitter2;

    on(event:string, listener:Function):EventEmitter2;

    onAny(listener:Function):EventEmitter2;

    offAny(listener:Function):EventEmitter2;

    once(event:string, listener:Function):EventEmitter2;

    many(event:string, timesToListen:number, listener:Function):EventEmitter2;

    removeListener(event:string, listener:Function):EventEmitter2;

    off(event:string, listener:Function):EventEmitter2;

    removeAllListeners(event?:string):EventEmitter2;

    setMaxListeners(n:number):void;

    listeners(event:string):Function[];

    listenersAny():Function[];

    emit(event:string, ...args:any[]);
}

interface IWidget {
    _create():any;
    _destroy():any;
}

interface HighlightJS {
    highlight(name:string, value:string, ignore_illegals?:boolean, continuation?:boolean) : any;
    highlightAuto(value:string, languageSubset?:string[]) : any;
    fixMarkup(value:string) : string;
    highlightBlock(block:Node) : void;
    configure(options:any): void;
    initHighlighting(): void;
    initHighlightingOnLoad(): void;
    registerLanguage(name:string, language:(hljs?:any) => any): void;
    listLanguages(): string[];
    getLanguage(name:string): any;
}
interface JQueryStatic {
    material?:any;
    cookie?:any;
}
interface JQuery {
    //slimScroll(...args:any[]): JQuery;
    size(...args:any[]): number;
    removeAttributes(...args:any[]):JQuery ;
    ensureClass(...args:any[]):JQuery ;
    prefixedData(prefix:string):{};
    example(...args:any[]):JQuery;
    sidebar(...args:any[]):JQuery;
    styler(...args:any[]):JQuery;
    customizer(...args:any[]):JQuery;
    bootstrapSwitch(...args:any[]):JQuery;
}

declare module "eventemitter2" {
    export = EventEmitter2;
}

interface RequireConfig {
    prism?:any;
}

interface AceEditor {
    ace           ?: AceAjax.Ace,
    beautify      ?: any,
    emmet         ?: any,
    searchbox     ?: any,
    settings_menu ?: any,
    modelist      ?: any,
    themelist     ?: any,
    language_tools?: any,
}
interface SassCompileResult {
    status?:number;
    text?:string;
    map?:any;
    files?:any[];
    line?:number;
    message?:string;
    formatted?:string;
}
declare class Sass {
    static setWorkerUrl(url:string);
    compile(scss:string, callback:Function); //:SassCompileResult;
    readFile(scss:string|string[], callback:Function);
}

declare module "sass" {
    export = Sass;
}

declare function jadeTemplate(locals:any):string;

declare module 'templates/styler' {
    export = jadeTemplate;
}
declare module 'templates/customizer' {
    export = jadeTemplate;
}
