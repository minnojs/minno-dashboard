import {fetchJson} from 'utils/modelHelpers';
import {downloadsAccessUrl as url} from 'modelUrls';

export const STATUS_APPROVED = true;
export const STATUS_SUBMITTED = false;

export function createDataAccessRequest(dataAccessRequest){
    let body = Object.assign({
        action:'createDataAccessRequest'
    }, dataAccessRequest);

    return fetchJson(url, {method: 'post', body: body})
        .then(interceptErrors);
}

export function deleteDataAccessRequest(dataAccessRequest){
    let body = Object.assign({
        action:'deleteDataAccessRequest'
    }, dataAccessRequest);

    return  fetchJson(url, {method: 'post',body:body})
        .then(interceptErrors);
}

export function updateApproved(dataAccessRequest, approved){
    let body = Object.assign({
        action:'updateApproved'
    }, dataAccessRequest,{approved: approved});

    return  fetchJson(url, {method: 'post',body:body})
        .then(interceptErrors);
}

export function getAllOpenRequests(){
    return fetchJson(url, {method:'post', body: {action:'getAllOpenRequests'}})
        .then(interceptErrors);
}



function interceptErrors(response){
    if (!response.error){
        return response;
    }

    let errors = {
        1: 'This ID already exists.',
        2: 'The study could not be found.',
        3: 'The rule file could not be found.',
        4: 'The rules file does not fit the "research" schema.'
    };

    return Promise.reject({message: errors[response.error]});
}
