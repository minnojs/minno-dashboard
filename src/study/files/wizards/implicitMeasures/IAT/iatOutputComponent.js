import {clone, checkMissingElementName, viewOutput} from '../resources/utilities.js';

let iatOutputComponent = {
    controller: controller,
    view: view
};

function controller(settings, defaultSettings, blocksObject){
    let error_msg = [];
    error_msg = validityCheck(error_msg, settings, blocksObject);

    return {error_msg, createFile, settings};

    function createFile(settings, fileType){
        return function(){
            let output,textFileAsBlob;
            let downloadLink = document.createElement('a');
            if (fileType === 'JS') {
                output = toString(settings);
                textFileAsBlob = new Blob([output], {type:'text/plain'});
                downloadLink.download = 'IAT.js'; }
            else{
                output = updateSettings(settings);
                textFileAsBlob = new Blob([JSON.stringify(output,null,4)], {type : 'application/json'});
                downloadLink.download = 'IAT.json'; }
            if (window.webkitURL) {downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);}
            else{
                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                downloadLink.style.display = 'none';
                document.body.appendChild(downloadLink);
            }
            downloadLink.click();
        };
    }
}

export function validityCheck(error_msg, settings, blocksObject){
    let containsImage;
    let temp1 = checkMissingElementName(settings.category1, 'First Category', error_msg);
    let temp2 = checkMissingElementName(settings.category2, 'Second Category', error_msg);
    let temp3 = checkMissingElementName(settings.attribute1, 'First Attribute', error_msg);
    let temp4 = checkMissingElementName(settings.attribute2, 'Second Attribute', error_msg);

    temp1 || temp2 || temp3 || temp4 ? containsImage = true : containsImage = false;

    if(settings.parameters.base_url.image.length === 0 && containsImage)
        error_msg.push('Image\'s url is missing and there is an image in the study');

    //check for blocks problems
    let currBlocks = clone(settings.blocks);
    let clearBlocks = blocksObject.slice(-1)[0]; //blocks parameters with zeros as the values, used to check if the current parameters are also zeros.

    ['randomBlockOrder', 'randomAttSide'].forEach(function(key){ //remove those parameters for the comparison
        delete currBlocks[key];
        delete clearBlocks[key];
    });

    if(JSON.stringify(currBlocks) === JSON.stringify(clearBlocks))
        error_msg.push('All the block\'s parameters equals to 0, that will result in not showing the task at all');
    blocksObject.slice(0,-1).map(function(block){
        if(settings.blocks[block.numTrialBlocks] !== 0 && settings.blocks[block.numMiniBlocks] === 0)
            error_msg.push(block.label+'\'s number of trials is '+settings.blocks[block.numTrialBlocks]+' and the number of mini blocks is set as 0. If you wish to skip this block, set both of those parameters to 0.');
    });
    return error_msg;
}

export function toString(settings, external){
    return toScript(updateSettings(settings), external);
}

function updateSettings(settings){
    let output={
        category1: settings.category1,
        category2: settings.category2,
        attribute1: settings.attribute1,
        attribute2: settings.attribute2,
        base_url: settings.parameters.base_url,
        remindError: settings.parameters.remindError,
        errorCorrection: settings.parameters.errorCorrection,
        isTouch: settings.parameters.isTouch
    };
    if(settings.parameters.isQualtrics){
        output.isQualtrics=settings.parameters.isQualtrics;
        output.showDebriefing=settings.parameters.showDebriefing;
        output.fullscreen=settings.parameters.fullscreen;

        if(!settings.parameters.isTouch){
            output.leftKey = settings.parameters.leftKey;
            output.rightKey = settings.parameters.rightKey;
        }
    }
    Object.assign(output, settings.blocks);
    settings.parameters.isTouch ? Object.assign(output, settings.touch_text) : Object.assign(output, settings.text);
    return output;
}

export function toScript(output, external){
    let textForInternal = '//Note: This script was created by the IAT wizard.\n//Modification of this file won\'t be reflected in the wizard.\n';
    let script = `define(['pipAPI' ,'${output.isQualtrics ? 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/IAT/qualtrics/quiat10.js': 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/IAT/iat9.js'}'], function(APIConstructor, iatExtension){\n\tvar API = new APIConstructor(); return iatExtension(${JSON.stringify(output,null,4)});});`;
    external === false ? script = textForInternal + script : '';
    return script;
}

function view(ctrl,settings){
    return viewOutput(ctrl, settings, toString);
}

export default iatOutputComponent;
