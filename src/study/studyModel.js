import {toJSON, catchJSON, checkStatus} from 'utils/modelHelpers';
import fileFactory from './fileModel';
export default studyFactory;

let baseUrl = '/dashboard/dashboard';

let studyPrototype = {
	apiURL(){
		return `${baseUrl}/files/${encodeURIComponent(this.id)}`;
	},

	get(){

		return fetch(this.apiURL(),{credentials: 'same-origin'})
			.then(checkStatus)
			.then(toJSON)
			.then(study => {
				this.loaded = true;
				this.files(study.files.map(file => {
					Object.assign(file, {studyID: this.id});
					return fileFactory(file);
				}));
			})
			.catch(reason => {
				this.error = true;
				return Promise.reject(reason); // do not swallow error
			});
	},

	getFile(id){
		return getById(id, this.files());

		function getById(id, files){
			for (let file of files){
				if (file.id == id) return file;
				if (file.files) return getById(id, file.files);
			}
		}
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
		return this.getFile(fileId).del()
			.then(() => {
				this.files(filterById(fileId, this.files()));

				function filterById(id, files){
					return files && files
						.filter(file => file.id !== id)
						.map(file => {
							if (Array.isArray(file.files)) file.files = filterById(id, file.files);
							return file;
						});
				}
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
