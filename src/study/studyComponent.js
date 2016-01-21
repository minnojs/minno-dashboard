export default editorLayoutComponent;
import studyFactory from './studyModel';
import editorComponent from './editorComponent';
import sidebarComponent from './sidebar/sidebarComponent';

let study, filesVM;

let editorLayoutComponent = {
	controller: ()=>{
		let id = m.route.param('studyID');
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

		let ctrl = {study, filesVM};

		return ctrl;
	},
	view: ctrl => {
		let study = ctrl.study;
		let filesVM = ctrl.filesVM;
		return m('.row.study', [
			study.loaded
				? [
					m('.col-md-2', [
						m.component(sidebarComponent, {study, filesVM})
					]),
					m('.col-md-10',[
						m.component(editorComponent, {study, filesVM})
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