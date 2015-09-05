/// <reference path="../../types.d.ts" />
/// <amd-dependency path="bootstrap-switch" />
import $ = require('jquery');
import {BasePlugin, register} from './../plugins';
import {Packadic} from './../Packadic';
import {Preferences} from './../layout';

import {debug} from './../modules/debug';
import template = require('templates/customizer');

export class CustomizerPlugin extends BasePlugin {
    public static defaults:any = {
        appendTo: 'body',
        contentHeight: 300
    };

    protected get prefs():Preferences {
        return this.packadic.layout.preferences;
    }

    public _create() {
        debug.log('loaded customizer ' + this);
        this.refresh();
    }

    public refresh(){
        var self:CustomizerPlugin = this;
        this.$element = $(template({
            options: self.options,
            prefs: self.prefs.all(),
            definitions: self.packadic.config.get('app.customizer.definitions')
        }));
        $(this.options.appendTo).append(this.$element);
        this.$element.find('.customizer-toggler').on('click', function(e:any){
            e.preventDefault();
            self.$element.toggleClass('active');
        });
        this.$element.find('form input[type="checkbox"].switch').bootstrapSwitch({
            offColor: 'primary', offText: 'NO', onColor: 'info', onText: 'YES'
        }).on('switchChange.bootstrapSwitch', this._onPreferenceControlChange);
        this.$element.find('form [data-preference]').on('change', function(e){
            debug.log('pref change', e, this);
        });
        this.packadic.makeSlimScroll(this.$element.find('.panel-form-container'), {
            height: self.options.contentHeight
        });
    }

    public _onPreferenceControlChange(event:any, state:any){
        debug.log('pref change switch', event, state, this);
        var pref:any = $(this).data('preference');
        var packadic:Packadic = <Packadic> $('body').data('packadic');
        packadic.layout.preferences.set(pref.name, state);
    }

}

register('customizer', CustomizerPlugin);
