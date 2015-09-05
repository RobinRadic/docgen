/// <reference path="./../../types.d.ts" />
/// <amd-dependency path="x-editable" />
/// <amd-dependency path="spectrum" />
import $ = require('jquery');
import material = require('./../modules/material');
import template = require('templates/styler');

import {BasePlugin, register} from './../plugins';

import {debug} from './../modules/debug';
var log:any = debug.log;


var colorValues = [];
var palette = [];
$.each(material.colors, function (name, variants) {
    var variantValues = [];
    $.each(variants, function (variant, colorCode) {
        colorValues.push(colorCode);
        variantValues.push(colorCode);
    });
    palette.push(variantValues);
});

export class StylerPlugin extends BasePlugin {

    public static defaults:any = {
        port: 3000,
        host: 'http://127.0.0.1'
    };

    public VERSION:string = '0.0.1';

    protected variables:any;

    protected _getVariables():JQueryXHR {
        return $.ajax(<JQueryAjaxSettings> {
            url: this.options.host.toString() + ':' + this.options.port.toString()
        })
    }

    public refresh() {
        var self:StylerPlugin = this;
        self._getVariables().done(function (res:StylerResponse) {
            if (res.code === 200) {
                self._bindTemplate(res.data);
                self._bindXEditable(self.$element.find('a.scss-variable-value'));
            }
        });
    }

    public _create() {
        var self:StylerPlugin = this;
        self._prepareXEditable();
        self.refresh();
    }

    protected _bindTemplate(data:any) {
        var self:StylerPlugin = this;
        self.$element.html(template(data));
        self.$element.find('a.styler-var-default').tooltip({title: 'Marked as default', container: 'body'});
        self.$element.find('a.styler-var-overides, a.styler-var-overidden').tooltip({
            title: function () {
                console.log(this);
                var stylerVar:any = $(this).closest('tr').data('styler-var');
                if (stylerVar.overides) {
                    return 'Overrides: ' + stylerVar.other;
                } else if (stylerVar.overidden) {
                    return 'Overidden from: ' + stylerVar.other;
                }

            },
            html: true,
            container: 'body'
        });

    }

    protected _bindXEditable($el:JQuery) {
        var self:StylerPlugin = this;
        $el.on('init', function (event, editable:any) {
            var $this = $(this);
            var fileName = $this.data('scss-file-name');
            var varName = $this.attr('id');

            editable.options.pk = {
                fileName: fileName,
                varName: varName
            };
            editable.options.title = varName;
        });
        $el.on('shown', function (event, editable:any) {
            debug.log(arguments);
            if (editable.input.type === 'color') {
                editable.input.$input.parent().spectrum('set', editable.value);

            }
        });
        $el.editable({
            url: this.options.host + ':' + this.options.port.toString(),
            success: function (response, newValue) {
                debug.log('editable resp', response, newValue);

                response.result.files.forEach(function (file:any) {
                    var $el:JQuery = $('link[data-styler="' + file.baseName + '"]').first();
                    debug.log('$el link editing: ', $el);
                    $el.attr('href', self.packadic.config('paths.assets') + '/styles/' + file.relPath);

                });
            }
        });
    }

    protected _prepareXEditable() {

        $.fn.editable.defaults.mode = 'inline';
        $.fn['editableform'].buttons = $.fn['editableform'].buttons
            .replace('glyphicon glyphicon-ok', 'fa fa-fw fa-check')
            .replace('glyphicon glyphicon-remove', 'fa fa-fw fa-times');

        function Color(options) {
            this.init('color', options, Color['defaults']);
        }

        $.fn['editableutils'].inherit(Color, $.fn['editabletypes'].abstractinput);
        $.extend(Color.prototype, {
            render: function () {

                var $input:JQuery = this.$input = this['$tpl'].find('input');
                $input.parent().spectrum({
                    showPalette: true,
                    palette: palette,
                    containerClassName: 'sp-packadic-styler',
                    showSelectionPalette: true, // true by default
                    //selectionPalette    : colorValues,
                    showInitial: true,
                    showInput: true,
                    showAlpha: false,
                    flat: true,
                    show: function(color){
                        //console.log($input.val(), this);
                        $(this).spectrum('reflow')
                    },
                    change: function(color){
                        $(this).find('input').val(color.toHexString().toUpperCase());
                    },
                    preferredFormat: "hex",
                    /*showPaletteOnly      : true,
                     togglePaletteOnly    : true,
                     togglePaletteMoreText: 'more',
                     togglePaletteLessText: 'less',*/
                });
            },
            autosubmit: function () {
                this.$input.keydown(function (e) {
                    if (e.which === 13) {
                        $(this).closest('form').submit();
                    }
                });
            }
        });

        Color['defaults'] = $.extend({}, $.fn['editabletypes'].abstractinput.defaults, {
            tpl: '<div class="editable-color"><input type="hidden" class="form-control" value="" /></div>'
        });
        $.fn['editabletypes'].color = Color;
    }

    public echo() {
        debug.log('ECHOING', arguments);
    }
}
register('styler', StylerPlugin);
