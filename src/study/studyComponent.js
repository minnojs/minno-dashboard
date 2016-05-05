export default editorLayoutComponent;
import studyFactory from './studyModel';
import editorComponent from './editorComponent';
import wizardComponent from './wizardComponent';
import sidebarComponent from './sidebar/sidebarComponent';

let study, filesVM;

let editorLayoutComponent = {
	controller: ()=>{
		let id = m.route.param('studyId');

		if (!study || (study.id !== id)){
			study = studyFactory(id);
			study
				.get()
				.then(m.redraw);
		}

		if (!filesVM) filesVM = viewModelMap({
			isOpen: m.prop(false),
			isChanged: m.prop(false)
		});

		let ctrl = {study, filesVM, onunload};

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
	view: ({study, filesVM}) => {
		return m('.row.study', [
			study.loaded
				? [
					m('.col-md-2', [
						m.component(sidebarComponent, {study, filesVM})
					]),
					m('.col-md-10',[
						m.route.param('resource') === 'wizard'
							? m.component(wizardComponent, {study})
							: m.component(editorComponent, {study, filesVM})
					])
				]
				:
				''
		]);
	}
};

// http://lhorie.github.io/mithril-blog/mapping-view-models.html
var viewModelMap = function(signature) {
	var map = {};
	return function(key) {
		if (!map[key]) {
			map[key] = {};
			for (var prop in signature) map[key][prop] = m.prop(signature[prop]());
		}
		return map[key];
	};
};
