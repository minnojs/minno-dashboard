import folderComponent from './folderComponent';
import classNames from 'utils/classNames';
import {uploadConfig} from 'utils/uploader';
import {uploadFiles} from './fileActions';
export default filesList;

let filesList = ({study}) => {
    let folderHash = parseFiles(study.files());
    let config = uploadConfig({onchange:uploadFiles('/', study)});
    let chooseState = getCurrentState(study); 

    return m('div', {config}, [
        m('h5', [
            m('small', [
                m('i.fa.fa-fw', {
                    onclick: choose(chooseState, study),
                    class: classNames({
                        'fa-check-square-o': chooseState === 1,
                        'fa-square-o': chooseState === 0,
                        'fa-minus-square-o': chooseState === -1
                    })
                })
            ]),
            study.name
        ]),
        folderComponent('/', {folderHash, study})
    ]);
};

let parseFiles = files => files.reduce((hash, file)=>{
    let path = file.basePath;
    if (!hash[path]) hash[path] = [];
    hash[path].push(file);
    return hash;
}, {});

function choose(currentState, study){
    return () => study.files().forEach(file => study.vm(file.id).isChosen(currentState === 1 ? 0 : 1));
}

function getCurrentState(study){
    let filesCount = study.files().length;
    let chosenCount = study.getChosenFiles().length;
    return !chosenCount ? 0 : filesCount === chosenCount ? 1 : -1;
}
