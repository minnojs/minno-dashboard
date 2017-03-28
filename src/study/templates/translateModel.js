import {fetchJson} from 'utils/modelHelpers';
import {translateUrl} from 'modelUrls';


function page_url(pageId)
{
    return `${translateUrl}/${encodeURIComponent(pageId)}`;
}

export let getListOfPages = () => fetchJson(translateUrl, {
    method: 'get'
});


export let getStrings = (pageId) => fetchJson(page_url(pageId), {
    method: 'get'
});


export let saveStrings = (strings, pageId) => fetchJson(page_url(pageId), {
    body: {strings},
    method: 'put'
});
