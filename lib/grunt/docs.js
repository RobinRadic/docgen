/*
import {objectGet,objectSet,kindOf} from './../modules/utilities';

var raws = {},
    fms = {},
    fmExp = /---[\s\t\n]([\w\W]*?)\n---/;

export function getRawFM(str):string {
    return str.match(fmExp)[1];
}

export function removeFM(str):string {
    return str.replace(fmExp, '');
}

export function readDocFile(name):string {
    if (typeof raws[name] !== 'string') {
        raws[name] = fse.readFileSync(rootPath('docs/' + name + '.md'), 'utf8');
    }
    return raws[name];
}

export function getParsedDocFM(name):{} {
    fms[name] = jsyaml.safeLoad(readDocFile(name).toString().match(fmExp)[1]);
    return fms[name];
}

export function getParsedDocFile(name, removeFrontMatter):string {
    removeFrontMatter = typeof removeFrontMatter === 'undefined' ? true : removeFrontMatter;
    var str = readDocFile(name);
    str = removeFrontMatter ? removeFM(str) : str;
    return marked.parse(str, {
        renderer: new marked['Renderer'](),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false
    });
}
*/
//# sourceMappingURL=docs.js.map