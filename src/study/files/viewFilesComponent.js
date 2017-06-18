export default editorLayoutComponent;
import studyFactory from './viewFileCollectionModel';
import editorComponent from './editorComponent';
import wizardComponent from './wizardComponent';
import sidebarComponent from './sidebar/sidebarComponent';
import splitPane from 'utils/splitPane';
import fullheight from 'utils/fullHeight';

let study;

let editorLayoutComponent = {
    controller: ()=>{

        let code = m.route.param('code');

        if (!study || (study.code !== code)){
            study = studyFactory(code);
            study
                .get()
                .catch(reason => {
                    if(reason.status==404)
                        m.route('/');
                    // else


                    // console.log(reason);
                })
                .then(m.redraw);
        }

        let ctrl = {study, onunload};

        return ctrl;
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
