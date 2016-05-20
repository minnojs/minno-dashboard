import {fetchJson} from 'utils/modelHelpers';

const baseUrl = '/dashboard/dashboard/removal_list';

export function get_removal_list(){
    return fetchJson(baseUrl);
}
