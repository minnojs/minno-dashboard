import {fetchJson} from 'utils/modelHelpers';
import {tagsUrl, studyUrl} from 'modelUrls';



function tag_url(tag_id)
{
    return `${tagsUrl}/${encodeURIComponent(tag_id)}`;
}

function study_url(study_id) {
    return `${studyUrl}/${encodeURIComponent(study_id)}/tags`;
}


function study_tag_url(study_id, tag_id) {
    return `${studyUrl}/${encodeURIComponent(study_id)}/tags/${encodeURIComponent(tag_id)}`;
}

export let toggle_tag_to_study = (study_id, tag_id, used) => {
    if(used)
        return add_tag_to_study(study_id, tag_id);
    return delete_tag_from_study(study_id, tag_id);
};

export let update_tags_in_study = (study_id, tags) => fetchJson(study_url(study_id), {
    method: 'put',
    body: {tags}
});


export let add_tag_to_study = (study_id, tag_id) => fetchJson(study_tag_url(study_id, tag_id), {
    method: 'post'
});

export let delete_tag_from_study = (study_id, tag_id) => fetchJson(study_tag_url(study_id, tag_id), {
    method: 'delete'
});

export let get_tags = () => fetchJson(tagsUrl, {
    method: 'get'
});


export let get_tags_for_study = (study_id) => fetchJson(study_url(study_id), {
    method: 'get'
});

export let remove_tag = (tag_id) => fetchJson(tag_url(tag_id), {
    method: 'delete'
});

export let add_tag = (tag_text, tag_color) => fetchJson(tagsUrl, {
    method: 'post',
    body: {tag_text, tag_color}
});

export let edit_tag = (tag_id, tag_text, tag_color) => fetchJson(tag_url(tag_id), {
    method: 'put',
    body: {tag_text, tag_color}
});
