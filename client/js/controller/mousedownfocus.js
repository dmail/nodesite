/*

NOTE

le scroll auto lors de expand/contract cherche à garder visibles les 'ul'
mais les 'ul' font 100% de largeur au lieu de la largeur de leur contenu

idée1:
- si on met l'arbre en mode compact le 'ul' pourras si en plus on met les 'li' en float left
faire la largeur de son contenu

- on perds alors la possibilité de drop un fichier hors d'un li

*/

NS.MousedownfocusTreeController = NS.TreeController.extend({
	name: 'MousedownfocusTreeController',
	requires: 'focused',
	events: {
		'mousedown': function(view, e){
			if( view && view != this.view ){
				this.focused.add(view, e);
			}
		}
	}
});
