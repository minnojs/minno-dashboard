export let checkStatus = response => {

	if (response.status >= 200 && response.status < 300) {
		return response;
	}

	let error = new Error(response.statusText);

	error.response = response;

	throw error;
};

export let toJSON = response => response
	.json()
	.catch(	);

// extract info from status error
export let catchJSON = err => (err.response ? err.response.json() : Promise.reject())
	.catch(() => Promise.reject(err))
	.then(json => Promise.reject(json));


export function fetchVoid(url, options){
	let opts = Object.assign({
		credentials: 'same-origin',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	}, options);

	opts.body = JSON.stringify(options.body);
	return fetch(url, opts)
		.then(checkStatus)
		.catch(catchJSON);
}

export function fetchJson(url, options){
	return fetchVoid(url, options)
		.then(toJSON);
}
