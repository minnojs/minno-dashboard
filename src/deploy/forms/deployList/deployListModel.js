import {fetchJson} from 'utils/modelHelpers';
import {baseUrl} from 'modelUrls';

const deploy_url = `${baseUrl}/deploy_list`;

export function get_study_list(){
    return fetchJson(deploy_url);
}
