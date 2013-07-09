/*

Normalement la sélection est un ensemble de range
chaque range correspond à une portion sélectionné
un range peut très bien être composé d'un seul noeud
lorsque deux range se croise il fusionne pour en devenir un seul

pour le moment on simplifie comme suit

*/

NS.Selection = {
	startNode: null,
	endNode: null,
	range: null,

	create: function(node){
		this.startNode = node;
		this.endNode = node;
		this.range = [];
	},

	filterNode: Function.TRUE,

	selectNode: function(node, e){
		if( e.control ){
			if( e.type != 'keydown' ){
				node.toggleState('selected', e);
			}
		}
		else{
			if( node.hasClass('selected') ){
				this.removeAll(e);
			}

			node.select(e);

			if( e.shift ){
				if( this.startNode != this.node ) this.startNode.select(e);
				this.extend(node, e);
			}
			else{
				this.startNode = node;
			}
		}
	},

	removeAll: function(e){
		// n'unselect pas si control ou shift appuyé, ou mousemove aussi normalement
		if( e && (e.control || e.shift) ) return;

		var range = this.range, i = range.length;
		while(i--) range[0].unselect(e);
	},

	collapse: function(node, e){
		if( this.contains(node) ){
			this.range.remove(node);
			this.removeAll(e);
			this.range.push(node);
		}
		else{
			this.removeAll(e);
		}
	},

	extend: function(node, e){
		if( node ){
			this.endNode = node;
			this.setRange(this.getRange(), e);
		}
	},

	contains: function(node){
		return this.range.contains(node);
	},

	addRange: function(range, e){
		range.forEach(function(view){
			view.select(e);
		});
	},

	removeRange: function(range, e){
		range.forEach(function(view){
			view.unselect(e);
		});
	},

	setRange: function(range, e){
		// get selecteds view not in range
		var unselectList = this.range.filter(function(node){
			if( node === this.startNode ) return false;
			if( node === this.endNode ) return false;
			return !range.contains(node);
		}, this);

		// unselect view not in the range
		this.removeRange(unselectList, e);

		// select view in the range
		this.addRange(range, e);
	},

	getRange: function(){
		var from = this.startNode, to = this.endNode, range = [];

		if( from === null || to === null || from === to ){
			return range;
		}

		// respect order
		if( from.compareDocumentPosition(to) & NS.NodeInterface.PRECEDING ){
			from = this.endNode;
			to = this.startNode;
		}

		// get valid nodes between from and to
		while(from = from.getNext(this.filterNode)){
			if( from === to ) break;
			range.push(from);
		}

		return range;
	}
};