// a linker is an object returned by a parser
var Linker = {
	path: null,
	toString: function(){ return 'Linker'; },
	link: Function.EMPTY,
	unlink: Function.EMPTY
};

var PropertyLinker = Linker.extend({
	nodeAttribute: null,
	modelProperty: null,
	toString: function(){ return 'PropertyLinker'; },

	create: function(nodeAttribute, modelProperty){
		this.nodeAttribute = nodeAttribute;
		this.modelProperty = modelProperty;
	},

	link: function(node, model){
		node.bind(this.nodeAttribute, model, this.modelProperty);
	},

	unlink: function(node, model){
		node.unbind(this.nodeAttribute);
	}
});

var TokenLinker = Linker.extend({
	nodeAttribute: null,
	modelProperty: null,
	prefix: '',
	suffix: '',
	toString: function(){ return 'TokenLinker'; },

	create: function(nodeAttribute, modelProperty, prefix, suffix){
		this.nodeAttribute = nodeAttribute;
		this.modelProperty = modelProperty;
		this.prefix = prefix;
		this.suffix = suffix;
	},



	link: function(node, model){
		var self = this;
		var observer = window.PathObserver.new(this.modelProperty, model, function(change){
			this.value = self.prefix + change.value + self.suffix;
		});

		node.bind(this.nodeAttribute, observer, 'value');
	},

	unlink: function(node){
		node.unbind(this.nodeAttribute);
	}
});

var TokensLinker = Linker.extend({
	nodeAttribute: null,
	tokens: null,
	toString: function(){ return 'TokensLinker'; },

	create: function(nodeAttribute, tokens){
		this.nodeAttribute = nodeAttribute;
		this.tokens = tokens;
	},

	combine: function(values){
		var tokens = this.tokens, result = tokens[0], i = 1, j = tokens.length, value;

		for(;i<j;i+=2){
			value = values[i];
			if( value !== undefined ){
				result+= value;
			}
			result+= tokens[i + 1];
		}

		return result;
	},

	link: function(node, model){
		var computedBinding = window.ComputedBinding.new(this.combine, this);
		var tokens = this.tokens, i = 1, j = this.tokens.length;

		computedBinding.delayed = true;
		for(;i<j;i+=2){
			// observe part, but dont call resolve for each part change
			computedBinding.observe(i, model, tokens[i]);
		}
		// resolve computedBinding.value
		computedBinding.resolve();

		node.bind(this.nodeAttribute, computedBinding, 'value');
	},

	unlink: function(node, model){
		node.unbind(this.nodeAttribute);
	}
});

var LinkerListLinker = Linker.extend({
	list: null,
	toString: function(){ return 'LinkerListLinker'; },

	create: function(list){
		this.list = list;
	},

	link: function(node, model){
		var list = this.list, i = 0, j = list.length;
		for(;i<j;i++){
			list[i].link(node, model);
		}
	},

	unlink: function(node, model){
		var list = this.list, i = 0, j = list.length;
		for(;i<j;i++){
			list[i].unlink(node, model);
		}
	}
});

var SubTemplateLinker = Linker.extend({
	terminal: true,
	template: null,
	toString: function(){ return 'SubTemplateLinker'; },

	create: function(templateElement){
		this.template = window.Template.new(templateElement);
	},

	link: function(node, model){
		/*
		calling Template.new(node)
		put node.childNodes in a documentfragment
		the next time link is called node.childNodes is empty
		so we need to repopulate childNodes with the original childNodes

		native template doesn't need that because their contents is also
		cloned when doing content.cloneNode(true)
		*/

		if( node.childNodes.length === 0 && this.template.content.childNodes.length !== 0 ){
			node.appendChild(this.template.cloneContent());
		}

		var template = window.Template.new(node);
		template.linkers = this.template.parse();
		template.setModel(model);
	},

	unlink: function(node, model){
		node.template.destroy();
		node.template = null;
	}
});