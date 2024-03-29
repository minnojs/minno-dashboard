import messages from 'utils/messagesComponent';
import downloadUrl from 'utils/downloadUrl';
import moveFileComponent from './moveFileComponent';
import copyFileComponent from './copyFileComponent';

export let createImplicitMeasure = (study, path = '', type) => () => {
    let name = pathProp(path);

    let content = ()=>'';
    let anWizards = ['iat', 'ep', 'amp']
    messages.prompt({
        header: `Create ${anWizards.includes(type) ? 'an' : 'a'} ${type.toUpperCase()} task`,
        content: 'Please insert task name (no file extension is needed):',
        prop: name
    }).then(response => {

        if (response){
            return createFile(study, m.prop(`${name()}.js`), content)
                .then(createFile(study, m.prop(`${name()}.${type}`), content));
        }
    });
};

export let uploadFiles = (path,study) => files => {
    // validation (make sure files do not already exist)
    let filePaths = Array.from(files, file => path === '/' ? file.name : path + '/' + file.name);
    let exist = study.files().filter(file => filePaths.includes(file.path)).map(f => f.path);

    if (!exist.length) return upload({force:false});
    else return messages.confirm({
        header: 'Upload Files', 
        content: `The file${exist.length > 1 ? 's' : ''} "${exist.join(', ')}" already exists, do you want to overwrite ${exist.length > 1 ? 'them' : 'it'}?`,
        okText: 'Overwrite'
    })
        .then(response => response && upload({force:true}));

    function upload({force} = {force:false}) {
        return study.uploadFiles({path, files, force})
            .catch(response => messages.alert({
                header: 'Upload File',
                content: response.message
            }))
            .then(m.redraw);
    }
};

export let moveFile = (file, study) => () => {
    let newPath = m.prop(file.basePath);
    messages.confirm({
        header: 'Move File',
        content: moveFileComponent({newPath, file, study})
    })
        .then(response => {
            const targetPath = newPath().replace(/\/$/, '') + '/' + file.name;
            if (response && newPath() !== file.basePath) return moveAction(targetPath, file,study);
        });
};

export let copyFile = (file, study) => () => {
    let filePath = m.prop(file.basePath);
    let study_id = m.prop(study.id);
    let new_study_id = m.prop('');
    messages.confirm({
        header: 'Copy File',
        content: copyFileComponent({new_study_id, study_id})
    })
        .then(response => {
            if (response && study_id() !== new_study_id) return copyAction(filePath() +'/'+ file.name, file, study_id, new_study_id);
        })
    ;
};

export let renameFile = (file,study) => () => {
    let newPath = m.prop(file.path);
    return messages.prompt({
        header: 'Rename File',
        postContent: m('p.text-muted', 'You can move a file to a specific folder be specifying the full path. For example "images/img.jpg"'),
        prop: newPath
    })
        .then(response => {
            if (response && newPath() !== file.name) return moveAction(newPath(), file, study);
        });
};

export let duplicateFile = (file,study) => () => {
    let newPath = m.prop(file.path);
    return messages.prompt({
        header: 'Duplicate File',
        postContent: m('p.text-muted', 'You can duplicate a file to a specific folder be specifying the full path. For example "images/img.jpg"'),
        prop: newPath
    })
        .then(response => {
            if (response && newPath() !== file.name) return createFile(study, newPath, file.content);
        });
};


function moveAction(newPath, file, study){
    let isFocused = file.id === m.route.param('fileId');

    let def = file
    .move(newPath, study) // the actual movement
    .then(redirect)
    .catch(response => messages.alert({
        header: 'Move/Rename File',
        content: response.message
    }))
    .then(m.redraw); // redraw after server response

    m.redraw();
    return def;

    function redirect(response){
        // redirect only if the file is chosen, otherwise we can stay right here...

        if (isFocused) m.route(`/editor/${study.id}/file/${file.id}`);
        return response;
    }
}

function copyAction(path, file, study_id, new_study_id){
    let def = file
    .copy(path, study_id, new_study_id) // the actual movement
    .catch(response => messages.alert({

        header: 'Copy File',
        content: response.message
    }))
    .then(m.redraw); // redraw after server response

    return def;
}

let playground;
export let play = (file,study) => () => {
    let isSaved = study.files().every(file => !file.hasChanged());  

    if (isSaved) open();
    else messages.confirm({
        header: 'Play task',
        content: 'You have unsaved files, the player will use the saved version, are you sure you want to proceed?' 
    }).then(response => response && open());

    function open(){
        // this is important, if we don't close the original window we get problems with onload
        if (playground && !playground.closed) playground.close();

        playground = window.open('playground.html', 'Playground');
        playground.onload = function(){
            // first set the unload listener
            playground.addEventListener('unload', function() {
                // get focus back here
                window.focus();
            });

            // then activate the player (this ensures that when )
            playground.activate(file);
            playground.focus();
        };
    }
};

export let save = file => () => {
    file.save()
        .then(m.redraw)
        .catch(err => messages.alert({
            header: 'Error Saving:',
            content: err.message
        }));
};


// add trailing slash if needed, and then remove proceeding slash
// return prop
let pathProp = path => m.prop(path.replace(/\/?$/, '/').replace(/^\//, ''));

export let  createFile = (study, name, content) => {
    return study.createFile({name:name(), content:content()})
        .then(response => {
            m.route(`/editor/${study.id}/file/${encodeURIComponent(response.id)}`);
            return response;
        })
        .catch(err => messages.alert({
            header: 'Failed to create file:',
            content: err.message
        }));
};

export let createDir = (study, path='') => () => {
    let name = pathProp(path);

    messages.prompt({
        header: 'Create Directory',
        content: 'Please insert directory name',
        prop: name
    })
        .then(response => {
            if (response) return study.createFile({name:name(), isDir:true});
        })
        .then(m.redraw)
        .catch(err => messages.alert({
            header: 'Failed to create directory:',
            content: err.message
        }));
};

export let createEmpty = (study, path = '') => () => {
    let name = pathProp(path);
    let content = ()=>'';

    messages.prompt({
        header: 'Create file',
        content: 'Please insert the file name:',
        prop: name
    }).then(response => {
        if (response) return createFile(study, name,content);
    });
};

export let deleteFiles = study => () => {
    let chosenFiles = study.getChosenFiles();
    let isFocused = chosenFiles.some(file => file.id === m.route.param('fileId'));

    if (!chosenFiles.length) {
        messages.alert({
            header:'Remove Files',
            content: 'There are no files selected'
        });
        return;
    }

    messages.confirm({
        header: 'Remove Files',
        content: 'Are you sure you want to remove all checked files? This is a permanent change.'
    })
        .then(response => {
            if (response) doDelete();
        });

    function doDelete(){
        study.delFiles(chosenFiles)
            .then(redirect)
            .catch(err => messages.alert({
                header: 'Failed to delete files:',
                content: err.message
            }))
            .then(m.redraw);
    }

    function redirect(response){
        // redirect only if the file is chosen, otherwise we can stay right here...
        if (isFocused) m.route(`/editor/${study.id}`); 
        return response;
    }
};

export let downloadChosenFiles = (study) => () => {
    let chosenFiles = study.getChosenFiles().map(f=>f.path);
    if (!chosenFiles.length) {
        messages.alert({
            header:'Download Files',
            content: 'There are no files selected'
        });
        return;
    }

    study.downloadFiles(chosenFiles)
        .then(url => downloadUrl(url, study.name))
        .catch(err => messages.alert({
            header: 'Failed to download files:',
            content: err.message
        }));
};

export let downloadFile = (study, file) => () => {
    if (!file.isDir) return downloadUrl(file.url, file.name);

    study.downloadFiles([file.path])
        .then(url => downloadUrl(url, study.name))
        .catch(err => messages.alert({
            header: 'Failed to download files:',
            content: err.message
        }));
};

export let resetFile = file => () => file.content(file.sourceContent());


