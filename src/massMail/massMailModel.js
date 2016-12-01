import {fetchJson} from 'utils/modelHelpers';
import {baseUrl} from 'modelUrls';

const massMailUrl = `${baseUrl}/mass_mail`;

let sent = false;

export let issent = () => sent;

export let send = (subject, body , ru, su, cu) => fetchJson(massMailUrl, {
    method: 'post',
    body: {subject, body , ru, su, cu}
});

