/// <reference path="../types.d.ts" />
/// <reference path="./types/tsd.d.ts" />
/// <reference path="./custom_types/yargs.d.ts" />
/// <reference path='./custom_types/underscore.string.d.ts' />
/// <reference path='./custom_types/tmp.d.ts' />
/// <reference path='./custom_types/typedoc.d.ts' />

declare module "globule" {
    export function find(...args:any[]): string[];
}

declare module "gonzales-pe"{
    export function cssToAST(...args:any[]):any;
    export function astToTree(...args:any[]):any;
}

interface JadeOptions {
    filename?:string,
    doctype?:string,
    pretty?:boolean|string,
    self?:boolean,
    debug?:boolean,
    compileDebug?:boolean,
    cache?:boolean,
    globals?:Array<string>
}

interface JadeTemplateFunction extends Function {
    (locals?:any):string;
}
declare module "jade" {
    export function compile(source:string, options?:JadeOptions):JadeTemplateFunction;
    export function compileFile(path:string, options?:JadeOptions):JadeTemplateFunction;
    export function compileClient(source:string, options?:JadeOptions):JadeTemplateFunction;
    export function compileClientWithDependenciesTracked(source:string, options?:JadeOptions):JadeTemplateFunction;
    export function compileFileClient(path:string, options?:JadeOptions):JadeTemplateFunction;
    export function render(source:string, options?:JadeOptions):string;
    export function renderFile(filename:string, options?:JadeOptions):string;
}

interface SassDocOptions {
    dest?:string;
    exclude?:any[];
    'package'?:string|Object;
    theme?:string;
    autofill?:any[];
    groups?:Object;
    'no-update-notifier'?:boolean;
    verbose?:boolean;
    strict?:boolean;
}
interface SassDocFunction {
    (source:string|string[], configuration:SassDocOptions):Q.Promise<any>;
}
declare module 'sassdoc' {
    var sassdoc:SassDocFunction;
    function sasdoc(source:string|string[], configuration:SassDocOptions):Q.Promise<any>;
    export = sasdoc;
}

interface SassDocExtras {
    (...args:any[])
}
declare module 'sassdoc-extras' {
    export = SassDocExtras
}
