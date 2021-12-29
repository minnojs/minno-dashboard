import {fetchJson,fetchVoid} from 'utils/modelHelpers';
import {baseUrl} from 'modelUrls';

const loginUrl = `${baseUrl}/connect`;
const logoutUrl = `${baseUrl}/logout`;
const is_logedinUrl = `${baseUrl}/is_loggedin`;

export let login = (username, password) => fetchJson(loginUrl, {
    method: 'post',
    body: {username, password}
});

export let logout = () => fetchVoid(logoutUrl, {method:'post'}).then(getAuth);

export let getAuth = () => fetchJson(is_logedinUrl, {
    method: 'get'
});