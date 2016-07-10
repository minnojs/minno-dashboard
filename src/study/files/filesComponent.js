export default editorLayoutComponent;
import actionsFab from '../actionsFab';
import studyFactory from './fileCollectionModel';
import editorComponent from './editorComponent';
import wizardComponent from './wizardComponent';
import sidebarComponent from './sidebar/sidebarComponent';

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
        return m('.row.study', [
            !study.loaded ? '' : [
                m('.col-md-2', [
                    m.component(sidebarComponent, {study})
                ]),
                m('.col-md-10',[
                    m.route.param('resource') === 'wizard'
                        ? m.component(wizardComponent, {study})
                        : m.component(editorComponent, {study})
                ])
            ],
            !study.loaded ? '' : actionsFab({studyId: study.id})
        ]);
    }
};
