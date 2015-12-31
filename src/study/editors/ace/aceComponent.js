import fullHeight from '../../fullHeight';
export default aceComponent;

var noop = function(){};

var aceComponent = {
	controller: function controller(args){
		var ctrl = {
			content: args.content
		};

		return ctrl;
	},

	view: function editorView(ctrl, args){
		return m('.editor', {config: aceComponent.config(ctrl, args)});
	},

	config: function(ctrl, args){
		return function(element, isInitialized, ctx){
			var editor;
			var content = ctrl.content;
			var settings = args.settings || {};
			let mode = settings.mode || 'javascript';

			if (!isInitialized){
				fullHeight(element, isInitialized, ctx);

				require(['ace/ace'], function(ace){
					ace.config.set('packaged', true);
					ace.config.set('basePath', require.toUrl('ace'));

					editor = ace.edit(element);
					var commands = editor.commands;

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
						exec: ctrl.onSave || noop
					});

					editor.setValue(content());
				});

			}

			editor && editor.setValue(content());
		};
	}
};