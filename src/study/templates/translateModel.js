import {fetchJson} from 'utils/modelHelpers';
import {translateUrl} from 'modelUrls';


function template_url(templateId)
{
    return `${translateUrl}/${encodeURIComponent(templateId)}`;
}

function page_url(templateId, pageId)
{
    return `${translateUrl}/${encodeURIComponent(templateId)}/${encodeURIComponent(pageId)}`;
}

export let getListOfPages = (templateId) => fetchJson(template_url(templateId), {
    method: 'get'
});


export let getStrings = (templateId, pageId) => fetchJson(page_url(templateId, pageId), {
    method: 'get'
});


export let saveStrings = (strings, templateId, pageId) => fetchJson(page_url(templateId, pageId), {
    body: {strings},
    method: 'put'
});
