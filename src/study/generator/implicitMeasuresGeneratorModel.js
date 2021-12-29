import {fetchJson} from '../../utils/modelHelpers';
import {baseUrl} from '../../modelUrls';


function url(study_type, study_id, file_id) {
    return `${baseUrl}/files/${encodeURIComponent(study_id)}/file/${encodeURIComponent(file_id)}`;
}

export let save = (study_type, study_id, file_id, content) => fetchJson(url(study_type, study_id, file_id), {
    method: 'put',
    body: {content: JSON.stringify(content)}
});

export let saveToJS = (study_type, study_id, file_id, content) => fetchJson(url(study_type, study_id, file_id), {
    method: 'put',
    body: {content: content}
});


