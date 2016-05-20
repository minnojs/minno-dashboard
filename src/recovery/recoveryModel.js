import {fetchJson,fetchVoid} from 'utils/modelHelpers';

const recoveryUrl = '/dashboard/dashboard/recovery';

export let recovery = (username) => fetchJson(recoveryUrl, {
	method: 'post',
	body: {username}
});
