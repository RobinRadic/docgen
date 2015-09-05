/// <reference path="../types.d.ts" />
import {Packadic} from './../Packadic';
import jquery = require('jquery');
import {cre, ucfirst} from './utilities';
import {storage, IStorage} from './storage';


export class PreferenceControl {
    protected pref:Preference;
    protected def:any;
    public value:any;
    protected storageKey:string;
    protected $el:JQuery;
    protected onChangeHandler:Function = $.noop;
    protected makeFunction:Function = $.noop;

    constructor(pref:Preference){
        this.pref = pref;
        this.storageKey = 'preference-' + this.pref.id;
    }

    public init(){
        this.makeFunction.apply(this, arguments);
    }

    public setDefault(def:any):PreferenceControl {
        this.def = def;
        return this;
    }

    public make(onChange?:any){
        var self:PreferenceControl = this;
        this.makeFunction = function() {
            var value:any = storage.get(self.storageKey, {
                def: self.def
            });
            self.onChangeHandler = onChange;
            self.$el.on('change', function (e:JQueryEventObject) {
                var $this:JQuery = this;
                self.setValue(self.$el.val());
            });
            self.setValue(value);
            self.$el.blur();
        }
    }

    public setValue(val:any):PreferenceControl{
        this.value = val;
        storage.set(this.storageKey, this.value);
        if(this.onChangeHandler){
            this.onChangeHandler(this.value, this, this.$el)
        }
        return this;
    }

}

export class PreferenceSelectControl extends PreferenceControl {
    protected options:any;

    constructor(pref:Preference){
        super(pref);
        this.options = {};
        this.$el = cre('select').addClass('form-control').attr('id', pref.id);
        pref.$controlWrapper.append(this.$el);
    }

    public setOptions(options:any):PreferenceSelectControl {
        this.options = options;
        return this;
    }

    public make(onChange?:any):PreferenceSelectControl {
        var self:PreferenceSelectControl = this;
        super.make(function(){
            if(onChange){
                onChange.apply(this, arguments)
            }
            self.$el.html('');
            $.each(self.options, function(val:any, text:any){
                var $opt:JQuery = cre('option').val(val).text(text);
                if(val === self.value){
                    $opt.attr('selected', 'selected');
                }
                self.$el.append($opt);
            });
        });
        return this;
    }
}

export class Preference {
    public name:string;
    public id:string;
    public $box:JQuery;
    public $labelWrapper:JQuery;
    public $label:JQuery;
    public $controlWrapper:JQuery;
    public control:PreferenceControl;


    constructor(id:string, name:string){
        this.id = id;
        this.name = name;

        this.$box = cre().addClass('preference-box clearfix');
        this.$labelWrapper = cre().addClass('preference-label pull-left').appendTo(this.$box);
        this.$label = cre().addClass('control-label').attr('for', 'pref-' + id).text(name).appendTo(this.$labelWrapper);
        this.$controlWrapper = cre().addClass('preference-control pull-right').appendTo(this.$box);
        this.$controlWrapper.html('');
    }


    public createSelectControl():PreferenceSelectControl {
        return this.control = new PreferenceSelectControl(this);
    }
}

export class Preferences {
    private app:Packadic;
    private $el:JQuery;
    private preferences:any;
    constructor(app:Packadic, $el:JQuery) {
        this.app = app;
        this.$el = $el;
        this.preferences = {};
    }

    public init():Preferences{
        this.$el.closest('.preferences').find('> .btn').on('click', function (e) {
            e.preventDefault();
            $(this).parent().toggleClass('active');
        });
        $.each(this.preferences, function(id:string, pref:Preference){
            pref.control.init();
        });
        return this;
    }

    public add(id:string, name:string):Preference {
        this.preferences[id] = new Preference(id, name);
        console.log(this.preferences[id]);
        this.$el.append(this.preferences[id].$box);
        return this.preferences[id];
    }

    public getControl(id:string):PreferenceControl {
        return this.preferences[id].control;
    }

    public getValue(id:string):any{
        var pref:Preference;
        if(this.preferences[id]){
            return this.preferences[id].control.value;
        } else {
            return storage.get('preference-' + id);
        }
    }

    public setValue(id:string, value:any){
        var pref:Preference;
        if(this.preferences[id]){
            return this.getControl(id).setValue(value);
        } else {
            return storage.set('preference-' + id, value);
        }
    }
}
