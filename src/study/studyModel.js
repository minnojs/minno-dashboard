import {toJSON, catchJSON, checkStatus, fetchJson} from 'utils/modelHelpers';
import fileFactory from './fileModel';
export default studyFactory;

let baseUrl = '/dashboard/dashboard';

let studyPrototype = {
	apiURL(){
		return `${baseUrl}/files/${encodeURIComponent(this.id)}`;
	},

	get(){
		return fetchJson(this.apiURL(),{credentials: 'same-origin'})
			.then(study => {
				this.loaded = true;
				let files = flattenFiles(study.files)
					.map(f => Object.assign(f, {studyId: this.id}))
					.map(fileFactory)
					.sort(sort);

				this.files(files);
			})
			.catch(reason => {
				this.error = true;
				return Promise.reject(reason); // do not swallow error
			});

		function flattenFiles(files){
			return files ? [].concat(...files.map(spreadFile)) : [];
		}

		function spreadFile(file){
			return [file, ...flattenFiles(file.files)];
		}

		function sort(a,b){
			let nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase();
			if (nameA < nameB) return -1;//sort string ascending
			if (nameA > nameB) return 1;
			return 0; //default return value (no sorting)
		}
	},

	getFile(id){
		return this.files().find(f => f.id === id);
	},

	createFile(name, content=''){
		return fetch(this.apiURL() + '/file', {
			method:'post',
			credentials: 'same-origin',
			body: JSON.stringify({name, content}),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		})
			.then(checkStatus)
			.then(toJSON)
			.then(response => {
				Object.assign(response, {studyID: this.id, content});
				let file = fileFactory(response);
				file.loaded = true;
				this.files().push(file);
				return response;
			})
			.catch(catchJSON);
	},

	del(fileId){
		let file = this.getFile(fileId);
		return file.del()
			.then(() => {
				let files = this.files().filter(f => f.path.indexOf(file.path) === 0);
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
