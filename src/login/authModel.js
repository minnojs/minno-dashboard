let authorizeState = {};

export let isLoggedIn = () => !!authorizeState.isLoggedIn;
export let getRole = () => authorizeState.role;

export function authorize(){
	authorizeState = getAuth();
}

export function login(){console.log('login not implemented yet')}

function getAuth(){
	var cookieValue = decodeURIComponent(document.cookie.replace(/(?:(?:^|.*;\s*)PiLogin\s*\=\s*([^;]*).*$)|^.*$/, '$1'));
	try {
		return JSON.parse(cookieValue);
	} catch (e) {
		setTimeout(()=>{throw e;});
		return {};
	}
}