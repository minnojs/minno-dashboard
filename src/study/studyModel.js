import {toJSON, catchJSON, checkStatus} from './modelHelpers';
import fileFactory from './fileModel';
export default studyFactory;

let baseUrl = '/dashboard/dashboard';

let studyPrototype = {
	apiURL(){
		return `${baseUrl}/files/${this.id}`;
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
		return this.files().find(file => file.id === id);
	},

	create(name, content=''){

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
				let file = fileFactory(response);
				file.loaded = true;
				this.files().push(file);
			})
			.catch(catchJSON);
	},

	del(fileId){
		return this.getFile(fileId).del()
			.then(() => {
				let cleanFiles = this.files().filter(file => file.id !== fileId);
				this.files(cleanFiles);
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
