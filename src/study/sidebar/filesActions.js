export function extractFormData(files) {
	var formData = new FormData;
	for (let file of files) {
		formData.append(file, files[file]);
	}

	return formData;
}

let uploadFiles = (path,study) => files => {
	let formData = extractFormData(files);

	study
		.uploadFiles(path, formData)
		.catch(messages.alert);

}