export default editorLayoutComponent;
import studyFactory from './fileCollectionModel';
import editorComponent from './editorComponent';
import wizardComponent from './wizardComponent';
import sidebarComponent from './sidebar/sidebarComponent';
import splitPane from 'utils/splitPane';
import fullheight from 'utils/fullHeight';

let study;

let editorLayoutComponent = {
    controller: ()=>{
        let id = m.route.param('studyId');

        if (!study || (study.id !== id)){
            study = studyFactory(id);
            study
                .get()
                .then(m.redraw);
        }

        let ctrl = {study, onunload};

        window.addEventListener('beforeunload', beforeunload);

        return ctrl;

        function hasUnsavedData(){
            return study.files().some(f => f.content() !== f.sourceContent());
        }

        function beforeunload(event) {
            if (hasUnsavedData()) return event.returnValue = 'You have unsaved data are you sure you want to leave?';
        }

        function onunload(e){
            let leavingEditor = () => !/^\/editor\//.test(m.route());
            if (leavingEditor() && hasUnsavedData() && !window.confirm('You have unsaved data are you sure you want to leave?')){
                e.preventDefault();
            } else {
                window.removeEventListener('beforeunload', beforeunload);
            }
        }
    },
    view: ({study}) => {
        return m('.study', {config: fullheight},  [
            !study.loaded ? '' : splitPane({
                leftWidth,
                left: m.component(sidebarComponent, {study}),
                right: m.route.param('resource') === 'wizard'
                    ? m.component(wizardComponent, {study})
                    : m.component(editorComponent, {study})
            })
        ]);
    }
};

// a clone of m.prop that users localStorage so that width changes persist across sessions as well as files.
// Essentially this is a global variable
function leftWidth(val){
    if (arguments.length) localStorage.fileSidebarWidth = val;
    return localStorage.fileSidebarWidth;
}
