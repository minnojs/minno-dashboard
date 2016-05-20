import {fetchJson,fetchVoid} from 'utils/modelHelpers';

const add_userUrl = '/dashboard/dashboard/add_user';

let added = false;

export let isadded = () => added;

export let add = (username, first_name , last_name, email, iscu) => fetchJson(add_userUrl, {
    method: 'post',
    body: {username, first_name , last_name, email, iscu}
});

