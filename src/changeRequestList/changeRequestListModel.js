import {fetchJson} from 'utils/modelHelpers';

const baseUrl = '/dashboard/dashboard/change_request_list';


export function get_change_request_list(){
    return fetchJson(baseUrl);
}
