import messages from 'utils/messagesComponent';
import aceComponent from './aceComponent';
export default editorPage;

var editorPage = {
	controller: function({file}){
		file.loaded || file.get()
			.then(m.redraw)
			.catch(err => {
				return messages.alert({
					header: 'Loading Error',
					content: err.message
				});
			});

		var ctrl = {
			content:file.content,
			play: play,
			save: save
		};

		return ctrl;

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
				playground.activate(file);
				playground.focus();
			};
		}

		function save(){
			file.save().catch(err => messages.alert({
				header: 'Error Saving:',
				content: err.message
			}));
		}
	},

	view: function(ctrl, {file, settings}){
		return m('.editor', [
			!file.loaded
				?
				m('.loader')
				:
				file.error
					?
					m('div', {class:'alert alert-danger'}, [
						m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
						`The file "${file.path}" was not found`
					])
					:
					[
						m('.btn-toolbar', [
							m('.btn-group.btn-group-sm', [
								file.type === 'js'
									?
									m('a.btn.btn-secondary', {onclick: ctrl.play, title:'Play this task'},[
										m('strong.fa.fa-play')
									])
									:
									'',
								m('a.btn.btn-secondary', {onclick: ctrl.save, title:'Save (ctrl+s)'},[
									m('strong.fa.fa-save')
								])
							])
						]),
						m.component(aceComponent, {content:ctrl.content, settings: settings})
					]
		]);
	}
};