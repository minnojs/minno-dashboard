import {fetchJson, fetchUpload} from 'utils/modelHelpers';
import fileFactory from './fileModel';
export default studyFactory;

let baseUrl = '/dashboard/dashboard';

let studyPrototype = {
	apiURL(path = ''){
		return `${baseUrl}/files/${encodeURIComponent(this.id)}${path}`;
	},

	get(){
		return fetchJson(this.apiURL())
			.then(study => {
				this.loaded = true;
				let files = flattenFiles(study.files)
					.map(assignStudyId(this.id))
					.map(fileFactory);

				this.files(files);
				this.sort();
			})
			.catch(reason => {
				this.error = true;
				return Promise.reject(reason); // do not swallow error
			});

		function flattenFiles(files){
			return files ? [].concat(...files.map(spreadFile)) : [];
		}

		function assignStudyId(id){
			return f => Object.assign(f, {studyId: id});
		}

		function spreadFile(file){
			return [file, ...flattenFiles(file.files)];
		}


	},

	getFile(id){
		return this.files().find(f => f.id === id);
	},

	createFile({name, content='',isDir}){
		return fetchJson(this.apiURL('/file'), {method:'post', body: {name, content, isDir}})
			.then(response => {
				Object.assign(response, {studyId: this.id, content, path:name, isDir});
				let file = fileFactory(response);
				file.loaded = true;
				this.files().push(file);
				return response;
			})
			.then(this.sort.bind(this));
	},

	sort(response){
		let files = this.files().sort(sort);
		this.files(files);
		return response;

		function sort(a,b){
			// sort by isDir then name
			let nameA= +!a.isDir + a.name.toLowerCase(), nameB=+!b.isDir + b.name.toLowerCase();
			if (nameA < nameB) return -1;//sort string ascending
			if (nameA > nameB) return 1;
			return 0; //default return value (no sorting)
		}
	},

	uploadFiles(path, files){
		let paths = Array.from(files, file => path === '/' ? file.name : path + '/' + file.name);
		let formData = buildFormData(path === '/' ? '' : path, files);
		// validation (make sure files do not already exist)
		let exists = this.files().find(file => paths.includes(file.path));
		if (exists) return Promise.reject({message: `The file "${exists.path}" already exists`});

		return fetchUpload(this.apiURL(`/upload/${path === '/' ? '' : path}`), {method:'post', body:formData})
			.then(response => {
				response.forEach(src => {
					let file = fileFactory(Object.assign({studyId: this.id},src));
					this.files().push(file);
				});

				return response;
			})
			.then(this.sort.bind(this));

		function buildFormData(path, files) {
			var formData = new FormData;
			// formData.append('path', path);

			// for (let file in files) {
			// 	formData.append('files', files[file]);
			// }

			for (let i = 0; i < files.length; i++) {
				formData.append(i, files[i]);
			}

			return formData;
		}
	},

	del(fileId){
		let file = this.getFile(fileId);
		return file.del()
			.then(() => {
				let files = this.files()
					.filter(f => f.path.indexOf(file.path) !== 0); // all paths that start with the same path are deleted
				this.files(files);
			});
	}
};

let studyFactory = 	id =>{
	let study = Object.create(studyPrototype);
	Object.assign(study, {
		id 		: id,
		files 	: m.prop([]),
		loaded 	: false,
		error 	:false
	});

	return study;
};
