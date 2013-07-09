NS.ElementEmitter = NS.EventEmitter.extend({
	create: function(element, bind){
		this.element = element;
		this.bind = bind || element;
	},

	handleEvent: function(e){
		this.emit(e.type, e);
	},

	onaddlistener: function(name, listener){
		this.element.addEventListener(name, this);
	},

	onremovelistener: function(name, listener){
		this.element.removeEventListener(name, this);
	}
});