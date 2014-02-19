testModule('mdv/binding/node.bind', function(){

	it('bind textNode by calling textNode.bind', function(){
		var textNode = document.createTextNode('yo');
		var model = {
			text: 'coucou'
		};

		textNode.bind('textContent', model, 'text');	

		expect(textNode.textContent).toBe('coucou');
		model.text = 'hello';
		expect(textNode.textContent).toBe('hello');
	});

	it('bind Element attribute by calling Element.bind', function(){
		
		var element = document.createElement('div');
		var model = {
			text: 'coucou'
		};

		element.bind('name', model, 'text');

		expect(element.getAttribute('name')).toBe('coucou');
	});

});
