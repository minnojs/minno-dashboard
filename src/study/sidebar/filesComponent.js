import folderComponent from './folderComponent';
export default filesComponent;

let currentStudy, filesVM;


let filesComponent = {
	controller(){
		let studyId = m.route.param('studyId');
		if (!filesVM || (currentStudy !== studyId)){
			currentStudy = studyId;
			filesVM = viewModelMap({
				isOpen: m.prop(false),
				isChanged: m.prop(false)
			});
		}

		return {filesVM, parseFiles};
	},
	view({parseFiles, filesVM}, {study}){
		let folderHash = parseFiles(study.files());
		return folderComponent('/', {folderHash, study, filesVM});
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

let parseFiles = files => files.reduce((hash, file)=>{
	let path = file.basePath;
	if (!hash[path]) hash[path] = [];
	hash[path].push(file);
	return hash;
}, {});