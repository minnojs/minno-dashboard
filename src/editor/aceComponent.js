export default aceComponent;

var noop = function(){};

var aceComponent = {
	controller: function controller(args){
		var ctrl = {
			content: args.content
		};

		return ctrl;
	},

	view: function editorView(ctrl){
		return m('.editor', {config: aceComponent.config(ctrl)});
	},

	config: function(ctrl){
		return function(element, isInitialized, ctx){
			var editor;
			var content = ctrl.content;

			if (!isInitialized){
				require(['ace/ace'], function(ace){
					ace.config.set('packaged', true);
					ace.config.set('basePath', require.toUrl('ace'));

					editor = ace.edit(element);
					var commands = editor.commands;

					editor.setTheme('ace/theme/monokai');
					editor.getSession().setMode('ace/mode/javascript');
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
						exec: ctrl.onSave || noop
					});


					editor.setValue(content());


				});

				onResize();

				window.addEventListener('resize', onResize, true);

				ctx.onunload = function(){
					window.removeEventListener('resize', onResize);
					editor && editor.destroy();
				};
			}

			editor && editor.setValue(content());

			function onResize(){
				element.style.height = document.documentElement.clientHeight - element.getBoundingClientRect().top + 'px';
			}
		};
	}
};