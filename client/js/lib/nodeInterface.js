/*au lieu de créer un tableau children qu'on manipuleune version plus light serait de reconstituer le tableau childrengrâce aux relations nextSiblingça serais bien de recréer TreeWalker à ma sauceutile pour visiblesController-> cependant j'avais abandonner l'idée parce que c'était chaud pourles méthodes de navigation comme pageup, pagedownfaudrait que children soit plutot un object NS.NodeListet children seras ptet renommer childNodesle problème c'est que lorsqu'on crée un enfant si cet enfant dispose de sous enfantsownerDocument existe pas encore*/NS.NodeInterface = {	parentNode: null,	children: null,	firstChild: null,	lastChild: null,	nextSibling: null,	previousSibling: null,	ownerDocument: null, // the root holding all descendants	oninsertchild: Function.EMPTY,	onremovechild: Function.EMPTY,	hasChildren: function(){		return this.children.length > 0;	},	appendChild: function(child, index){		child.emancipate();		child.parentNode = this;		if( this.firstChild ){			child.previousSibling = this.lastChild;			this.lastChild.nextSibling = child;			this.lastChild = child;		}		else{			this.firstChild = this.lastChild = child;		}		this.children.push(child);		this.oninsertchild(child);		return child;	},	insertBefore: function(child, sibling){		if( sibling && sibling.parentNode == this ){			child.emancipate();			if( this.firstChild == sibling ) this.firstChild = child;			child.parentNode = this;			child.nextSibling = sibling;			child.previousSibling = sibling.previousSibling;			sibling.previousSibling = child;			this.children.splice(this.children.indexOf(sibling), 0, child);			this.oninsertchild(child);		}		else{			this.appendChild(child);		}		return child;	},	removeChild: function(child){		if( child.parentNode == this ){			if( this.firstChild == child ) this.firstChild = child.nextSibling;			if( this.lastChild == child ) this.lastChild = child.previousSibling;			if( child.previousSibling ) child.previousSibling.nextSibling = child.nextSibling;			if( child.nextSibling ) child.nextSibling.previousSibling = child.previousSibling;			child.parentNode = null;			child.nextSibling = null;			child.previousSibling = null;			child.parentNode.children.remove(this);			this.onremovechild(child);		}		return child;	},	replaceChild: function(child, oldChild){		var before = oldChild.nextSibling;		this.removeChild(oldChild);		this.insertBefore(child, before);		return oldChild;	},	contains: function(node){		while(node){			if( node == this ) return true;			node = node.parentNode;		}		return false;	},	// helper methods	adopt: function(child, index){		if( typeof index == 'number' ){			this.insertBefore(child, this.children[index]);		}		else{			this.appendChild(child);		}		return this;	},	emancipate: function(){		if( this.parentNode ) this.parentNode.removeChild(this);		return this;	}};