import {fetchJson,fetchVoid} from 'utils/modelHelpers';

const loginUrl      = '/dashboard/dashboard/connect';
const logoutUrl     = '/dashboard/dashboard/logout';
const is_logedinUrl = '/dashboard/dashboard/is_loggedin';


export let login = (username, password) => fetchJson(loginUrl, {
    method: 'post',
    body: {username, password}
});

export let logout = () => fetchVoid(logoutUrl, {method:'post'}).then(getAuth);

export let getAuth = () => fetchJson(is_logedinUrl, {
    method: 'get'
});