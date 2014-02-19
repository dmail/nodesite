testModule('emitter', function(Emitter){

	it('call listener', function(){
		var emitter = Emitter.new(), value = false;

		emitter.addListener('event', function(arg1){
			value = arg1;
		});
		emitter.callListeners('event', 'yeah');

		expect(value).toBe('yeah');
	});

	it('remove specific listener', function(){
		var emitter = Emitter.new(), listener = function(){};

		emitter.addListener('event', listener);
		emitter.removeListener('event', listener);

		expect(emitter.listeners('event')).toBe(false);
	});

	it('preserve other listener when removing an other', function(){
		var emitter = Emitter.new(), listenera = function(){}, listenerb = function(){};

		emitter.addListener('event', listenera);
		emitter.addListener('event', listenerb);

		emitter.removeListener('event', listenera);

		expect(emitter.listeners('event')[0]).toBe(listenerb);
	});

	it('preserve add order when calling listeners', function(){

		var emitter = Emitter.new(), order = null,
		listenera = function(){ order = 'a'; }, listenerb = function(){ order = 'b'; };

		emitter.addListener('event', listenera);
		emitter.addListener('event', listenerb);
		emitter.callListeners('event');

		expect(order).toBe('b');
	});

	it('add volatile listener', function(){
		var emitter = Emitter.new(), registeredListeners = false;

		emitter.addVolatileListener('event', function(){
			registeredListeners = this.listeners('event');
		});
		emitter.callListeners('event');

		expect(registeredListeners).toBe(false);
	});

	it('remove all listeners for specific event', function(){
		var emitter = Emitter.new();

		emitter.addListener('event', function(){});
		emitter.addListener('event', function(){});
		emitter.off('event');

		expect(emitter.listeners('event')).toBe(false);
	});

	it('remove all listeners', function(){
		var emitter = Emitter.new();

		emitter.addListener('event', function(){});
		emitter.addListener('event', function(){});
		emitter.addListener('event2', function(){});
		emitter.off();

		expect(Object.isEmpty(emitter.$listeners)).toBe(true);
	});

	it('add listener for multiple event', function(){
		var emitter = Emitter.new(), listener = function(){};

		emitter.on('event event2 event3', listener);

		expect(emitter.listeners('event')[0]).toBe(listener);
		expect(emitter.listeners('event2')[0]).toBe(listener);
		expect(emitter.listeners('event3')[0]).toBe(listener);
	});

	it('call listener for multiple event', function(){
		var emitter = Emitter.new(), result = [];

		emitter.on('event', function(arg1){ result.push(arg1); });
		emitter.on('event2', function(arg2){ result.push(arg2); });
		emitter.emit(['event', 'event2'], 'coucou');

		expect(result.join(' ')).toBe('coucou coucou');
	});

	it('remove listener for multiple event', function(){		
		var emitter = Emitter.new(), listener = function(){};
		
		emitter.on('event', listener);
		emitter.on('event2', listener);
		emitter.off('event event2');

		expect(emitter.listeners('event')).toBe(false);
		expect(emitter.listeners('event2')).toBe(false);
	});

	it('accept object with handleEvent as listener', function(){
		var emitter = Emitter.new(), name, args, bind, listener = {
			handleEvent: function(eventName, eventArgs){
				bind = this;
				name = eventName;
				args = eventArgs;
			}
		};

		emitter.on('event', listener);
		emitter.emit('event', 'coucou');

		expect(name).toBe('event');
		expect(args[0]).toBe('coucou');
		expect(bind).toBe(listener);
	});

});