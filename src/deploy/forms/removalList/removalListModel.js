import {fetchJson} from 'utils/modelHelpers';
import {baseUrl} from 'modelUrls';

const removal_url = `${baseUrl}/removal_list`;

export function get_removal_list(){
    return fetchJson(removal_url);
}
