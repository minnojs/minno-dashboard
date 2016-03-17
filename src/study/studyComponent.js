export default editorLayoutComponent;
import studyFactory from './studyModel';
import editorComponent from './editorComponent';
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

		let ctrl = {study, filesVM, onunload: debounce(onunload,0, true)};

		window.addEventListener('beforeunload', beforeunload);

		return ctrl;

		function hasUnsavedData(){
			return study.files().some(f => f.content() !== f.sourceContent());
		}

		function beforeunload(event) {
			if (hasUnsavedData()) return event.returnValue = 'You have unsaved data are you sure you want to leave?';
		}

		// this function needs to be debounced because of https://github.com/lhorie/mithril.js/issues/931
		function onunload(e){
			let leavingEditor = () => !/^\/editor\//.test(m.route());
			if (leavingEditor() && hasUnsavedData() && !window.confirm('You have unsaved data are you sure you want to leave?')){
				e.preventDefault();
			} else {
				window.removeEventListener('beforeunload', beforeunload);
			}
		}
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

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}
