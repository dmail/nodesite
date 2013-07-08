/*

name: View

description: Element wrapper

FIX: si je modifie une vue enfant, la vue parent recoit aussi l'event
change et croit qu'elle est modifiée, watch est merdé en rgos

*/

NS.View = {
	// about view
	id: null,
	emitter: null,
	controllers: null,
	getters: {},

	// about model
	model: null,
	modelListener: null,
	modelListeners: {
		destroy: 'destroy',

		data: function(e){
			this.emit('data');
		},

		change: function(e){
			var property = e.args[0], value = e.args[1], current = e.args[2];
			this.emit('change:' + property, value, current);
		},

		adopt: function(e){
			var child = e.args[0], index = e.args[1];

			this.insertBefore(child, this.childNodes[index]);
		},

		emancipate: function(){
			this.parentNode.removeChild(this);
		}
	},

	// about element
	template: null,
	directives: null,
	element: null,
	events: null,
	elementEmitter: null,
	elementListener: null,

	create: function(model){
		this.self.addInstance(this);

		this.controllers = {};

		this.emitter = NS.EventEmitter.new(this);
		this.modelListener = NS.EventListener.new(null, this.modelListeners, this);

		if( this.template ){
			if( typeof this.template == 'string' ) this.template = this.template.toElement();
			this.setElement(this.template.cloneNode(true));
		}

		this.emit('create');

		if( model ){
			this.setModel(model);
		}
	},

	destroy: function(){
		this.emit('destroy');
		this.unsetElement();
		this.unsetModel();
		this.self.removeInstance(this);
	},

	get: function(key){
		if( key in this.getters ){
			var getter = this.getters[key];

			if( 'argumentNames' in getter ){
				var names = getter.argumentNames, i = 0, j = names.length, name, values = [];
				for(;i<j;i++){
					name = names[i];
					values[i] = name == key ? this.model.get(name) : this.get(name);
				}

				return getter.apply(this, values);
			}
			else{
				return getter.call(this);
			}
		}

		return this.model.get(key);
	},

	watch: function(property, fn){
		if( property in this.getters ){
			Function.argumentNames(this.getters[property]).forEach(function(name){

				this.on('change:' + name, function(){
					fn.call(this, this.get(property));
				});

			}, this);
		}
		else{
			this.on('change:' + property, function(e){
				fn.call(this, e.args[0], e.args[1]);
			});
		}

		this.once('setModel', function(e){
			var model = e.args[0];

			if( model.data ){
				fn.call(this, this.get(property), undefined);
			}
			else{
				// lorsque le model recoit des données pour la première fois
				this.once('data', function(){
					fn.call(this, this.get(property), undefined);
				});
			}
		});
	},

	link: function(element){
		var proto = this.getPrototype();

		if( !proto.directives ){
			proto.directives = Compiler.compile(element);
		}

		Compiler.link(element, this, proto.directives);
	},

	setElement: function(element){
		this.element = element;

		this.elementEmitter = NS.ElementEmitter.new(this.element, this);
		this.elementListener = NS.EventListener.new(this.elementEmitter, this.events, this);
		this.elementListener.listen();

		this.setAttribute('data-view', this.id);

		this.link(element);

		return this;
	},

	unsetElement: function(){
		if( this.element ){
			this.removeElement();

			this.elementEmitter = null;
			this.elementListener.stopListening();
			this.elementListener = null;
			this.element = null;
		}

		return this;
	},

	insertElement: function(into, before){

		this.removeElement();
		into.insertBefore(this.element, before);
		this.emit('insertElement');

		return this;
	},

	removeElement: function(){
		if( this.element.parentNode ){
			this.emit('removeElement');
			this.element.parentNode.removeChild(this.element);
		}

		return this;
	},

	cast: function(item){
		if( item != null && typeof item.toView == 'function' ) return item.toView();
		return null;
	},

	toView: Function.THIS,

	setModel: function(model){
		if( model ){
			this.model = model;
			this.modelListener.emitter = model;
			this.modelListener.listen();

			this.childNodes = this.model.childNodes;
			if( this.ownerDocument ){
				this.ownerDocument.createChildNodes(this);
			}

			this.emit('setModel', model);
		}
	},

	unsetModel: function(){
		if( this.model ){
			this.modelListener.stopListening();
			this.modelListener.emitter = null;
		}
	},

	hasClass: function(name){
		return this.element.classList.contains(name);
	},

	addClass: function(name){
		this.element.classList.add(name);
		return this;
	},

	removeClass: function(name){
		this.element.classList.remove(name);
	},

	toggleClass: function(name, force){
		this.element.classList.toggle(name, force);
	},

	hasAttribute: function(name){
		return this.element.hasAttribute(name);
	},

	setAttribute: function(name, value){
		this.element.setProperty(name, value);
	},

	getAttribute: function(name){
		return this.element.getAttribute(name);
	},

	setStyle: function(name, value){
		this.element.setStyle(name, value);
	},

	getStyle: function(name){
		return this.element.getStyle(name);
	}
}.supplement(
	NS.EventEmitterInterface,
	NS.NodeInterface,
	NS.NodeFinder
);

var Compiler = {
	checkDirective: function(path, node, directives){
		// AttributeNode or TextNode
		if( node.nodeType == 2 || node.nodeType == 3 ){
			var value = node.nodeValue;

			if( value.startsWith('{') && value.endsWith('}') ){

				directives.push({
					path: path,

					link: function(node){
						var value = node.nodeValue;
						var property = value.substring(1, value.length - 1);

						this.watch(property, function(value){
							node.nodeValue = value;
						});
					}
				});

			}
		}
	},

	collectDirectives: function(path, node, directives){
		var list, i, j, attr, subpath, child;

		// Element
		if( node.nodeType == 1 ){

			list = node.attributes;
			i = 0;
			j = list.length;
			for(;i<j;i++){
				attr = list[i];
				subpath = [].concat(path, 'attribute', attr.name);
				this.checkDirective(subpath, attr, directives);
			}

			list = node.childNodes;
			i = 0;
			j = list.length;
			for(;i<j;i++){
				child = list[i];
				subpath = [].concat(path, 'childNode', i);
				this.checkDirective(subpath, child, directives);
				this.collectDirectives(subpath, child, directives);
			}

		}

		return directives;
	},

	compile: function(element){
		return this.collectDirectives([], element, []);
	},

	followers: {
		attribute: function(node, name){
			return node.attributes.getNamedItem(name);
		},

		childNode: function(node, index){
			return node.childNodes[index];
		}
	},

	follow: function(node, path){
		var i = 0, j = path.length;

		for(;i<j;i+=2){
			node = this.followers[path[i]].call(this, node, path[i+1]);
			if( !node ) break;
		}

		return node;
	},

	link: function(element, view, directives){
		var i = 0, j = directives.length, directive, node;

		for(;i<j;i++){
			directive = directives[i];
			node = this.follow(element, directive.path);
			directive.link.call(view, node);
		}
	}
};

NS.View.self =  {
	instances: {},
	IDAttribute: 'data-view',
	lastID: 0,

	nextId: function(){
		return this.lastID++;
	},

	addInstance: function(view){
		view.id = this.nextId();
		this.instances[view.id] = view;
	},

	removeInstance: function(view){
		delete this.instances[view.id];
	},

	isElementView: function(element){
		return element.hasAttribute && element.hasAttribute(this.IDAttribute);
	},

	getElementView: function(element){
		var view = null;

		if( this.isElementView(element) ){
			view = this.instances[element.getAttribute(this.IDAttribute)];
		}

		return view;
	},

	// retourne la vue qui liée à element ou null si l'élément ne correspond à aucune vue
	findElementView: function(element){
		var view = null;

		while( element ){
			view = this.getElementView(element);
			if( view ) break;
			element = element.parentNode;
		}

		return view;
	}
};

// show a blank image, useful to have a default src attribute
Image.EMPTY = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

Element.prototype.toView = function(){ return NS.View.self.findElementView(this); };
Event.prototype.toView = function(){ return Element.prototype.toView.call(this.target); };
CustomEvent.prototype.toView = function(){ return this.detail.view; };

NS.viewDocument = NS.Document.new();
NS.viewDocument.oninsert = function(node, child){
	var childrenElement = node.getChildrenElement();
	// si cette vue possède l'élément qui contient les enfants on insère l'enfant
	if( childrenElement ){
		child.insertElement(
			childrenElement,
			child.nextSibling ? child.nextSibling.element : null
		);
	}
};
NS.viewDocument.onremove = function(node){
	node.removeElement();
};
