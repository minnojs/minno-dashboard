import {fetchJson} from 'utils/modelHelpers';
import {baseUrl} from 'modelUrls';

const change_request_url = `${baseUrl}/change_request_list`;


export function get_change_request_list(){
    return fetchJson(change_request_url);
}
