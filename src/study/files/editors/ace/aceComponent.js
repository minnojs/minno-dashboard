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

            // paster with padding
            let paste = text => {
                if (!editor) return false;
                let pos = editor.getSelectionRange().start; 
                let line = editor.getSession().getLine(pos.row);
                let padding = line.match(/^\s*/);
                // replace all new lines with padding
                if (padding) text = text.replace(/(?:\r\n|\r|\n)/g, '\n' + padding[0]);
                
                editor.insert(text);
                editor.focus();
            };

            if (!isInitialized){
                fullHeight(element, isInitialized, ctx);

                require(['ace/ace'], function(ace){
                    let undoManager = settings.undoManager || (u => u);
                    ace.config.set('packaged', true);
                    ace.config.set('basePath', require.toUrl('ace'));

                    editor = ctx.editor = ace.edit(element);
                    let session = editor.getSession();
                    let commands = editor.commands;

                    editor.setReadOnly(!!settings.isReadonly);
                    editor.setTheme('ace/theme/cobalt');
                    session.setMode('ace/mode/' + mode);
                    if (mode !== 'javascript') session.setUseWorker(false);
                    editor.setHighlightActiveLine(true);
                    editor.setShowPrintMargin(false);
                    editor.setFontSize('18px');
                    editor.$blockScrolling = Infinity; // scroll to top

                    // set jshintOptions
                    editor.session.on('changeMode', function(e, session){
                        if (session.getMode().$id === 'ace/mode/javascript' && !!session.$worker && settings.jshintOptions) {
                            session.$worker.send('setOptions', [settings.jshintOptions]);
                        }
                    });

                    session.on('change', function(){
                        content(editor.getValue());
                        m.redraw();
                    });

                    commands.addCommand({
                        name: 'save',
                        bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
                        exec: settings.onSave || noop
                    });
                    
                    if(observer) observer.on('paste',paste );
                    
                    setContent();
                    // reset undo manager so that ctrl+z doesn't erase file
                    // save it so that it doesn't get lost when users navigate away
                    session.setUndoManager(undoManager() || undoManager(new ace.UndoManager())); 
                    editor.focus();
                    
                    ctx.onunload = () => {
                        editor.destroy();
                        if(observer) observer.off(paste );
                    };
                });

            }
            
            // each redraw set content from model (the function makes sure that this is not done when not needed...)
            setContent();

            function setContent(){
                let editor = ctx.editor;
                if (!editor) return;
                
                // this should trigger only drastic changes such as the first time the editor is set
                if (editor.getValue() !== content()){
                    editor.setValue(content());
                    editor.moveCursorTo(0,0);
                    editor.focus();
                }
            }
        };
    }
};
