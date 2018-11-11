import {fetchJson} from 'utils/modelHelpers';
import {baseUrl, collaborationUrl} from 'modelUrls';

const pending_url = `${baseUrl}/pending`;

function apiURL(code)
{
    return `${collaborationUrl}/${encodeURIComponent(code)}`;
}

export let get_pending_studies = () => fetchJson(pending_url, {
    method: 'get'
});


export let use_code = (code) => fetchJson(apiURL(code), {
    method: 'get'
});
