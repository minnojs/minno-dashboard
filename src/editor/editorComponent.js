import aceComponent from './aceComponent';
export default editorPage;

var editorPage = {
	controller: function(){
		var url =  m.route.param('url');
		var content = m.prop('');

		var ctrl = {
			url: url,
			content:content,
			save: save,
			play: play
		};

		m
			.request({method:'GET', url:url,background:true, deserialize: text => text})
			.then(ctrl.script, ()=>ctrl.error = true)
			.then(script => {
				m.startComputation();
				content(script);
				ctrl.loaded = true;
				m.endComputation();
			});

		return ctrl;

		// @TODO: have the glyph inddicate saving and stuff
		function save(){
			alert('this button is not wired yet...');
		}

		function play(){
			var playground;
			playground = window.open('playground.html', 'Playground');

			playground.onload = function(){
				// first set the unload listener
				playground.addEventListener('unload', function() {
					// get focus back here
					window.focus();
				});

				// then activate the player (this ensures that when )
				playground.activate(content());
			};

		}
	},

	view: function(ctrl){
		return m('.container', [
			m('h2', 'Editor', [m('small', ctrl.url)]),
			!ctrl.loaded
				?
				m('.loader')
				:
				ctrl.error
					?
					m('div', {class:'alert alert-danger'}, [
						m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
						`The file "${ctrl.url}" was not found`
					])
					:
					[
						m('.btn-toolbar', [
							m('.btn-group', [
								m('a.btn.btn-default', {onclick: ctrl.save},[
									m('strong.glyphicon.glyphicon-floppy-disk')
								]),
								m('a.btn.btn-default', {onclick: ctrl.play},[
									m('strong.glyphicon.glyphicon-play')
								])
							])
						]),
						m.component(aceComponent, {content:ctrl.content})
					]

		]);
	}
};