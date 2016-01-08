import {toJSON, catchJSON, checkStatus} from './modelHelpers';
import File from './fileModel';
export default studyModel;

let baseUrl = '/dashboard/dashboard';

class studyModel {
	constructor(id){
		this.id = id;
		this.files = m.prop([]);
		this.loaded = false;
		this.error = false;
	}

	apiURL(){
		return `${baseUrl}/files/${this.id}`;
	}

	get(){
		return fetch(this.apiURL(),{credentials: 'same-origin'})
			.then(checkStatus)
			.then(toJSON)
			.then(study => {
				this.loaded = true;
				this.files(study.files.map(file => {
					Object.assign(file, {studyID: this.id});
					return new File(file);
				}));
			})
			.catch(reason => {
				this.error = true;
				return Promise.reject(reason); // do not swallow error
			});
	}

	getFile(id){
		return this.files().find(file => file.id === id);
	}

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
				this.files().push(new File(response));
			})
			.catch(catchJSON);
	}

	del(fileId){
		return this.getFile(fileId).del()
			.then(() => {
				let cleanFiles = this.files().filter(file => file.id !== fileId);
				this.files(cleanFiles);
			});
	}
}