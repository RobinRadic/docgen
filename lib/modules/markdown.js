var jsyaml = require('js-yaml');
var marked = require('marked');
var fmExp = /---[\s\t\n]([\w\W]*?)\n---/;
var renderer = new marked['Renderer']();
renderer.heading = function (text, level) {
    var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    return '<h' + level + '><a name="' +
        escapedText +
        '" class="anchor" href="#' +
        escapedText +
        '"><span class="header-link"></span></a>' +
        text + '</h' + level + '>';
};
function getRawFM(str) {
    return str.match(fmExp)[1];
}
exports.getRawFM = getRawFM;
function removeFM(str) {
    return str.replace(fmExp, '');
}
exports.removeFM = removeFM;
function parseFM(fileContent) {
    return jsyaml.safeLoad(fileContent.toString().match(fmExp)[1]);
}
exports.parseFM = parseFM;
function parse(fileContent, removeFrontMatter) {
    removeFrontMatter = typeof removeFrontMatter === 'undefined' ? true : removeFrontMatter;
    fileContent = removeFrontMatter ? removeFM(fileContent) : fileContent;
    return marked.parse(fileContent, {
        renderer: renderer,
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false
    });
}
exports.parse = parse;
//# sourceMappingURL=markdown.js.map