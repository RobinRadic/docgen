/// <reference path="types.d.ts" />
declare var requirejs:Require;

requirejs.config(window.packadicConfig.requirejs);

requirejs(['Packadic'], /** @param {Packadic} Packadic */ function(Packadic:any){
    var packadic = window.packadic = Packadic.instance;


    packadic.DEBUG = true;
    packadic.init({

    });
    packadic.boot();
    packadic.removePageLoader();

    /**
    packadic.plugins.load('customizer', function(){
        var m = $('body').customizer({ appendTo: 'body' });
        var i = $('body').customizer('instance');
        packadic.debug.log('make', m);
        packadic.debug.log('instance', i);
    });*/
});


