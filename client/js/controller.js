/* global */

NS('item').extend('controller', {
	viewEvents: {
		'setElement': function(element){
			this.setElement(element);
		},

		'unsetElement': function(){
			this.unsetElement();
		},

		'destroy': function(){
			this.destroy();
		}
	},
	events: null,
	requires: null,

	constructor: function(view){
		this.viewListener = NS('listener').new(null, this.viewEvents, this);
		this.elementListener = NS('listener.event').new(null, this.events, this);
		this.elementListener.callHandler = this.callHandler;

		this.setView(view);
		this.resolveDependency();
	},

	resolveDependency: function(){
		var requires = this.requires;
		if( requires ){
			if( typeof requires == 'string' ) requires = [requires];
			requires.forEach(this.provide, this);
		}
	},

	provide: function(name){
		var provider, instance;

		if( name in this.view.controllers ){
			instance = this.view.controllers[name];
		}
		else{
			provider = NS('controller').providers[name];

			if( provider ){
				instance = provider.call(this, this.view);
			}
			else{
				instance = NS('controller.' + name).new(this.view);
			}
		}

		this[name] = instance;
	},

	callHandler: NS('listener.event').callHandler,

	setView: function(view){
		if( view ){
			this.view = view;

			this.view.controllers[this.__name__] = this;

			this.viewListener.emitter = view;
			this.viewListener.listen();

			if( this.view.element ) this.setElement(this.view.element);
		}
	},

	unsetView: function(){
		if( this.view ){
			if( this.view.element && this.element == this.view.element ) this.unsetElement();

			this.viewListener.stopListening();
			delete this.viewListener.emitter;

			delete this.view.controllers[this.__name__];

			delete this.view;
		}
	},

	setElement: function(element){
		if( element ){
			this.elementListener.emitter = element;
			this.elementListener.listen();
		}
	},

	unsetElement: function(){
		if( this.element ){
			this.elementListener.stopListening();
			delete this.elementListener.emitter;
		}
	},

	destroy: function(){
		this.unsetView();
		this.unsetElement();
	}
});

NS('controller').providers = {};

NS('view').on('create', function(){
	this.controllers = {};
});
NS('view').on('destroy', function(){
	delete this.controllers;
});

