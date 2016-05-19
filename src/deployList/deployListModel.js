import {fetchJson} from 'utils/modelHelpers';

const baseUrl = '/dashboard/dashboard/deploy_list';


export function get_study_list(){
    return fetchJson(baseUrl);
}
