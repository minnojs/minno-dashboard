import {createDataAccessRequest, deleteDataAccessRequest, updateApproved, STATUS_APPROVED} from './downloadsAccessModel';
import messages from 'utils/messagesComponent';
import createMessage from './downloadsAccessCreateComponent';
import grantMessage from './downloadsAccessGrantComponent';
import revokeMessage from './downloadsAccessRevokeComponent';

export function play(downloadAccess, list){
    return messages.confirm({
        header: 'Approve Access Request:',
        content: `Are you sure you want to grant access of '${downloadAccess.studyId}' to '${downloadAccess.username}'?`
    })
    .then(response => {
        if(response) {
            return updateApproved(downloadAccess, STATUS_APPROVED)
                .then(() => list(list().filter(el => el !== downloadAccess)))
                .then(messages.alert({header:'Grant access completed', content: 'Access granted'}))
                .catch(reportError('Grant Access'))
                .then(m.redraw());
        }
    });
}


export let remove  = (downloadAccess, list) => {
    return messages.confirm({
        header: 'Delete request:',
        content: `Are you sure you want to delete the access request for'${downloadAccess.studyId}'? If access has already been granted you will lose it`
    })
    .then(response => {
        if(response) {
            
            return deleteDataAccessRequest(downloadAccess)
                .then(() => list(list().filter(el => el !== downloadAccess)))
                .then(messages.alert({header:'Deletion complete', content: 'Access has been deleted'}))
                .catch(reportError('Remove Download Request'))
                .then(m.redraw());

        }
    });
};
export let grant = () => {
    let output = m.prop();
    return grantMessage({output})
    .then(response => {
        if (response) {
            var now = new Date();
            let downloadAccess = Object.assign({
                approved: STATUS_APPROVED,
                creationDate: now
            }, null, unPropify(output()));
            return createDataAccessRequest(downloadAccess)
            .then(messages.alert({header:'Grant access completed', content: 'Access granted'}))
            .catch(reportError('Grant Access'));
        }
    });
};
export let revoke = () => {
    let output = m.prop();
    return revokeMessage({output})
    .then(response => {
        if (response) {
            var now = new Date();
            let downloadAccess = Object.assign({
                creationDate: now
            }, null, unPropify(output()));
            return deleteDataAccessRequest(downloadAccess)
            .then(messages.alert({header:'Revoke access completed', content: 'Access revoked'}))
            .catch(reportError('Revoke Access'));
        }
    });
};
export let create = (list) => {
    let output = m.prop();
    return createMessage({output})
        .then(response => {
            if (response) {
                var now = new Date();
                let downloadAccess = Object.assign({
                    creationDate: now,
                    approved: 'access pending'
                }, null, unPropify(output()));
                return createDataAccessRequest(downloadAccess)
                    .then(() => list().unshift(downloadAccess))
                    .then(m.redraw)
                    .catch(reportError('Data Access Request'));
            }
        });
};

let reportError = header => err => messages.alert({header, content: err.message});

let unPropify = obj => Object.keys(obj).reduce((result, key) => {
    result[key] = obj[key]();
    return result;
}, {});
