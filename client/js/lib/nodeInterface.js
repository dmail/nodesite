/*ça serais bien de recréer TreeWalker à ma sauceutile pour visiblesController-> cependant j'avais abandonner l'idée parce que c'était chaud pourles méthodes de navigation comme pageup, pagedownfaudrait que childNodes soit plutot un object NS.NodeList qu'un array*/NS.NodeInterface = {	parentNode: null,	childNodes: null,	firstChild: null,	lastChild: null,	nextSibling: null,	previousSibling: null,	ownerDocument: null, // the root holding all descendants	DISCONNECTED: 1,	PRECEDING: 2,	FOLLOWING: 4,	CONTAINS: 8,	CONTAINED_BY: 16,	IMPLEMENTATION_SPECIFIC: 32,	oninsertchild: Function.EMPTY,	onremovechild: Function.EMPTY,	appendChild: function(child, index){		child.emancipate();		child.parentNode = this;		if( this.firstChild ){			child.previousSibling = this.lastChild;			this.lastChild.nextSibling = child;			this.lastChild = child;		}		else{			this.firstChild = this.lastChild = child;		}		this.childNodes.push(child);		this.oninsertchild(child);		return child;	},	insertBefore: function(child, sibling){		if( sibling && sibling.parentNode == this ){			child.emancipate();			if( this.firstChild == sibling ) this.firstChild = child;			child.parentNode = this;			child.nextSibling = sibling;			child.previousSibling = sibling.previousSibling;			sibling.previousSibling = child;			this.childNodes.splice(this.childNodes.indexOf(sibling), 0, child);			this.oninsertchild(child);		}		else{			this.appendChild(child);		}		return child;	},	removeChild: function(child){		if( child.parentNode == this ){			if( this.firstChild == child ) this.firstChild = child.nextSibling;			if( this.lastChild == child ) this.lastChild = child.previousSibling;			if( child.previousSibling ) child.previousSibling.nextSibling = child.nextSibling;			if( child.nextSibling ) child.nextSibling.previousSibling = child.previousSibling;			child.parentNode = null;			child.nextSibling = null;			child.previousSibling = null;			child.parentNode.childNodes.remove(this);			this.onremovechild(child);		}		return child;	},	replaceChild: function(child, oldChild){		var before = oldChild.nextSibling;		this.removeChild(oldChild);		this.insertBefore(child, before);		return oldChild;	},	hasChildNodes: function(){		return this.firstChild != null;	},	contains: function(node){		while(node){			if( node == this ) return true;			node = node.parentNode;		}		return false;	},	// inspired by http://dxr.mozilla.org/mozilla-central/source/dom/imptests/webapps/DOMCore/tests/approved/test_Node-compareDocumentPosition.html	compareDocumentPosition: function(other){		var reference = this, referenceAncestor = reference, otherAncestor = other;		if( reference === other ){			return 0;		}		while( referenceAncestor.parentNode ) referenceAncestor = referenceAncestor.parentNode;		while( otherAncestor.parentNode ) otherAncestor = otherAncestor.parentNode;		if( referenceAncestor !== otherAncestor ){			return this.DISCONNECTED + this.IMPLEMENTATION_SPECIFIC + this.PRECEDING;		}		if( other.contains(reference) ){			return this.CONTAINS + this.PRECEDING;		}		if( reference.contains(other) ){			return this.CONTAINED_BY + this.FOLLOWING;		}		while( true ){			// this loop get the previous node of reference in document order			if( reference.previousSibling ){				reference = reference.previousSibling;				while( reference.lastChild ){					reference = reference.lastChild;				}				return reference;			}			else{				reference = reference.parentNode;			}			if( reference == null ){				return this.FOLLOWING;			}			else if( reference == other ){				return this.PRECEDING;			}			else{				continue;			}		}	},	// helper methods	adopt: function(child, index){		if( typeof index == 'number' ){			this.insertBefore(child, this.childNodes[index]);		}		else{			this.appendChild(child);		}		return this;	},	emancipate: function(){		if( this.parentNode ) this.parentNode.removeChild(this);		return this;	}};