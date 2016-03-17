import fullHeight from 'utils/fullHeight';
export default ace;

let ace = args => m.component(aceComponent, args);

let noop = function(){};

let aceComponent = {
	view: function editorView(ctrl, args){
		return m('.editor', {config: aceComponent.config(args)});
	},

	config: function({content, observer, settings = {}}){
		return function(element, isInitialized, ctx){
			let editor;
			let mode = settings.mode || 'javascript';
			let paste = text => {
				if (editor) {
					editor.insert(text);
					editor.focus();
				}
			};

			if (!isInitialized){
				fullHeight(element, isInitialized, ctx);

				require(['ace/ace'], function(ace){
					ace.config.set('packaged', true);
					ace.config.set('basePath', require.toUrl('ace'));

					editor = ace.edit(element);
					let commands = editor.commands;

					editor.setTheme('ace/theme/monokai');
					editor.getSession().setMode('ace/mode/' + mode);
					if (mode !== 'javascript') editor.getSession().setUseWorker(false);
					editor.setHighlightActiveLine(true);
					editor.setShowPrintMargin(false);
					editor.setFontSize('18px');
					editor.$blockScrolling = Infinity; // scroll to top

					editor.getSession().on('change', function(){
						m.startComputation();
						content(editor.getValue());
						m.endComputation();
					});

					commands.addCommand({
						name: 'save',
						bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
						exec: settings.onSave || noop
					});
					
					if(observer) observer.on('paste',paste );
					
					editor.setValue(content());
					editor.moveCursorTo(0,0);
					editor.focus();

					ctx.onunload = () => {
						editor.destroy();
						if(observer) observer.off(paste );
					};
				});

			}

		};
	}
};
