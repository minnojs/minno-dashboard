import {fetchJson,fetchVoid} from 'utils/modelHelpers';

const loginUrl = '/dashboard/dashboard/connect';
const logoutUrl = '/dashboard/logout';

let authorizeState = {};

export let isLoggedIn = () => !!authorizeState.isLoggedin;
export let getRole = () => authorizeState.role;

export function authorize(){
	authorizeState = getAuth();
}

export let login = (username, password) => fetchJson(loginUrl, {
	method: 'post',
	body: {username, password}
});

export let logout = () => fetchVoid(logoutUrl, {method:'post'});

function getAuth(){
	var cookieValue = decodeURIComponent(document.cookie.replace(/(?:(?:^|.*;\s*)PiLogin\s*\=\s*([^;]*).*$)|^.*$/, '$1'));
	try {
		return cookieValue ? JSON.parse(cookieValue) : {};
	} catch (e) {
		setTimeout(()=>{throw e;});
		return {};
	}
}