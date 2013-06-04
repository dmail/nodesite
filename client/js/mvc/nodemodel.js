/* global Model, TreeStructure, TreeTraversal, TreeFinder */

var NodeModel = new Class({
	Extends: Model,
	Implements: [TreeStructure, TreeTraversal, TreeFinder],
	name: '',

	constructor: function NodeModel(){
		Model.prototype.constructor.apply(this, arguments);

		this.initChildren(this.get('children'));
		if( this.has('name') ) this.name = this.get('name');
	},

	oninsertchild: function(child){
		this.emit('adopt', child, this.children.indexOf(child));
		//child.crossAll(function(node){ node.emit('enter'); }, null, true);
	},

	onremovechild: function(child){
		//child.crossAll(function(node){ node.emit('leave'); }, null, true);
		child.emit('emancipate');
	},

	adopt: function(child, index){
		if( typeof index == 'number' ) index = index.limit(0, this.children.length);
		else index = this.children.length;

		child = this.insertBefore(child, this.children[index]);

		return this;
	},

	emancipate: function(){
		if( this.parentNode ) this.parentNode.removeChild(this);
		return this;
	},

	sync: function(action, args, callback){

	}
});
