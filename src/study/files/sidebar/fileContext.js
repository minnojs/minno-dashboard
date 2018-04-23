import contextMenu from 'utils/contextMenuComponent';
import messages from 'utils/messagesComponent';
import {launchUrl} from 'modelUrls';

import {
    createDir, createEmpty, moveFile, duplicateFile, copyFile, renameFile, downloadFile, resetFile,
    make_experiment, update_experiment, delete_experiment
} from './fileActions';
import {createFromTemplate} from './wizardActions';
import wizardHash from './wizardHash';
import copyUrl from 'utils/copyUrl';
export default fileContext;


let fileContext = (file, study) => {
    let path = !file ? '/' : file.isDir ? file.path : file.basePath;
    let isReadonly = study.isReadonly;
    let menu = [];

    if (!isReadonly) {
        menu = menu.concat([
            {icon:'fa-folder', text:'New Directory', action: createDir(study, path)},
            {icon:'fa-file', text:'New File', action: createEmpty(study, path)},
            {icon:'fa-file-text', text:'New from template', menu: mapWizardHash(wizardHash)},
            {icon:'fa-magic', text:'New from wizard', menu: [
                {text: 'Rating wizard', action: activateWizard(`rating`)}
            ]}
        ]);
    }




    // Allows to use as a button without a specific file
    if (file) {
        // console.log(file);
        // let isExpt = /\.expt\.xml$/.test(file.name) && file.exp_data;
        let isExpt = file.exp_data;

        if (!isReadonly) menu.push({separator:true});

        menu = menu.concat([
            {icon:'fa-refresh', text: 'Refresh/Reset', action: resetFile(file), disabled: isReadonly || file.content() == file.sourceContent()},
            {icon:'fa-download', text:'Download', action: downloadFile(study, file)},
            {icon:'fa-link', text: 'Copy URL', action: copyUrl(file.url)},

            !isExpt ?  {icon:'fa-desktop', text:'Make Experiment', action: make_experiment(file,study), disabled: isReadonly }
                    :  {icon:'fa-desktop', text:'Experiment options', menu: [
                        {icon:'fa-exchange', text:'Rename', action: update_experiment(file,study), disabled: isReadonly },
                        {icon:'fa-close', text:'Delete', action: delete_experiment(file, study), disabled: isReadonly },
                        { icon:'fa-play', href:`${launchUrl}/${file.exp_data.id}`, text:'Play this task'},
                        {icon:'fa-link', text: 'Copy Launch URL', action: copyUrl(`${launchUrl}/${file.exp_data.id}`)}
                    ]},

            //     isExpt ?  { icon:'fa-play', href:`https://app-prod-03.implicit.harvard.edu/implicit/Launch?study=${file.url.replace(/^.*?\/implicit/, '')}`, text:'Play this task'} : '',
            // isExpt ? {icon:'fa-link', text: 'Copy Launch URL', action: copyUrl(`https://app-prod-03.implicit.harvard.edu/implicit/Launch?study=${file.url.replace(/^.*?\/implicit/, '')}`)} : '',
            {icon:'fa-close', text:'Delete', action: deleteFile, disabled: isReadonly },
            {icon:'fa-arrows-v', text:'Move', action: moveFile(file,study), disabled: isReadonly },
            {icon:'fa-clone', text:'Duplicate', action: duplicateFile(file, study), disabled: isReadonly },
            {icon:'fa-clone', text:'Copy to Different Study', action: copyFile(file,study), disabled: isReadonly },
            {icon:'fa-exchange', text:'Rename...', action: renameFile(file,study), disabled: isReadonly }
        ]);
    }

    return contextMenu.open(menu);

    function activateWizard(route){
        return () => m.route(`/editor/${study.id}/wizard/` + route);
    }
    
    function mapWizardHash(wizardHash){
        return Object.keys(wizardHash).map((text) => {
            let value = wizardHash[text];
            return typeof value === 'string'
                ? {text, action: createFromTemplate({study, path, url:value, templateName:text})}
                : {text, menu: mapWizardHash(value)};
        });
    }

    function deleteFile(){
        let isFocused = file.id === m.route.param('fileId');

        messages.confirm({
            header:['Delete ',m('small', file.name)],
            content: 'Are you sure you want to delete this file? This action is permanent!'
        })
        .then(ok => {
            if (ok) return doDelete();
        });

        function doDelete(){
            study.delFiles([file])
                .then(redirect)
                .catch(err => messages.alert({
                    header: 'Failed to delete file:',
                    content: err.message
                }))
                .then(m.redraw);
        }

        function redirect(response){
            // redirect only if the file is chosen, otherwise we can stay right here...
            if (isFocused) m.route(`/editor/${study.id}`); 
            return response;
        }
    } // end delete file
};
