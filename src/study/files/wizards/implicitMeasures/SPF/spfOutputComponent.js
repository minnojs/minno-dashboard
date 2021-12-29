import {clone, checkMissingElementName, viewOutput} from '../resources/utilities.js';

let outputComponent = {
    controller: controller,
    view:view
};

function controller(settings, defaultSettings, blocksObject){
    let error_msg = [];

    error_msg = validityCheck(error_msg, settings, blocksObject);

    return{createFile, error_msg};

    function createFile(settings, fileType){
        return function(){
            let output,textFileAsBlob;
            let downloadLink = document.createElement('a');
            if (fileType === 'JS') {
                output = toString(settings);
                textFileAsBlob = new Blob([output], {type:'text/plain'});
                downloadLink.download = 'SPF.js'; }
            else {
                output = updateSettings(settings);
                textFileAsBlob = new Blob([JSON.stringify(output,null,4)], {type : 'application/json'});
                downloadLink.download = 'SPF.json'; }
            if (window.webkitURL != null) {downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);}
            else {
                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                downloadLink.style.display = 'none';
                document.body.appendChild(downloadLink);
            }
            downloadLink.click();
        };
    }
}

export function updateSettings(settings){
    let output={
        objectCat1: settings.objectCat1,
        objectCat2: settings.objectCat2,
        attribute1: settings.attribute1,
        attribute2: settings.attribute2,
    };
    Object.assign(output, settings.parameters);
    Object.assign(output, settings.blocks);
    Object.assign(output, settings.text);
    return output;
}

export function toString(settings, external){
    return toScript(updateSettings(settings), external);
}

export function toScript(output, external){
    let textForInternal = '//Note: This script was created by the SPF wizard.\n//Modification of this file won\'t be reflected in the wizard.\n';
    let script = `define(['pipAPI' ,'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/spf/spf4.js'], function(APIConstructor, spfExtension){\n\tvar API = new APIConstructor(); return spfExtension(${JSON.stringify(output,null,4)})});`;
    external === false ? script = textForInternal + script : '';
    return script;
}

export function validityCheck(error_msg, settings, blocksObject){
    let temp1 = checkMissingElementName(settings.objectCat1, 'First Category', error_msg);
    let temp2 = checkMissingElementName(settings.objectCat2, 'Second Category', error_msg);
    let temp3 = checkMissingElementName(settings.attribute1, 'First Attribute', error_msg);
    let temp4 = checkMissingElementName(settings.attribute2, 'Second Attribute', error_msg);

    let containsImage = temp1 || temp2 || temp3 || temp4;

    if(settings.parameters.base_url.image.length === 0 && containsImage)
        error_msg.push('Image\'s url is missing and there is an image in the study');

    //check for blocks problems
    let currBlocks = clone(settings.blocks);
    let clearBlocks = blocksObject.slice(-1)[0]; //blocks parameters with zeros as the values, used to check if the current parameters are also zeros.

    ['randomCategoryLocation', 'randomAttributeLocation'].forEach(function(key){
        delete currBlocks[key];
        delete clearBlocks[key];
    });

    if(JSON.stringify(currBlocks) === JSON.stringify(clearBlocks))
        error_msg.push('All the block\'s parameters equals to 0, that will result in not showing the task at all');
    return error_msg;

}

function view(ctrl, settings){
    return viewOutput(ctrl, settings, toString);
}


export default outputComponent;

