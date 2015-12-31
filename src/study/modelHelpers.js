export let checkStatus = response => {
	if (response.status >= 200 && response.status < 300) {
		return response;
	}

	let error = new Error(response.statusText);
	error.response = response;
	throw error;
};

export let toJSON = response => response.json();