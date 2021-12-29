import {clone, checkMissingElementName, viewOutput} from '../resources/utilities.js';

let outputComponent = {
    controller: controller,
    view:view
};

function controller(settings, defaultSettings, blocksObject){
    let error_msg = [];
    error_msg = validityCheck(error_msg, settings, blocksObject);

    return{createFile, error_msg};

    function createFile(settings, type){
        return function(){
            let output,textFileAsBlob;
            let downloadLink = document.createElement('a');
            if (type === 'JS'){
                output = toString(settings);
                textFileAsBlob = new Blob([output], {type:'text/plain'});
                downloadLink.download = 'BIAT.js';
            }
            else{
                output = updateSettings(settings);
                textFileAsBlob = new Blob([JSON.stringify(output,null,4)], {type : 'application/json'});
                downloadLink.download = 'BIAT.json';
            }
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
    let category_headlines = ['First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth'];

    let temp1,temp2,temp3 = false;
    if(settings.parameters.practiceBlock){
        temp1 = checkMissingElementName(settings.practiceCategory1, 'First Practice Category', error_msg);
        temp2 = checkMissingElementName(settings.practiceCategory2, 'Second Practice Category', error_msg);
    }
    settings.categories.map(function(category, index){
        let temp = checkMissingElementName(category, category_headlines[index]+' Category', error_msg);
        if (temp) temp3 = true;
    });

    let temp4 = checkMissingElementName(settings.attribute1, 'First Attribute', error_msg);
    let temp5 = checkMissingElementName(settings.attribute2, 'Second Attribute', error_msg);

    let containsImage = temp1 || temp2 || temp3 || temp4 || temp5;

    if(settings.parameters.base_url.image.length === 0 && containsImage)
        error_msg.push('Image\'s url is missing and there is an image in the study');

    //check for blocks problems
    let currBlocks = clone(settings.blocks);
    let clearBlocks = blocksObject.slice(-1)[0]; //blocks parameters with zeros as the values, used to check if the current parameters are also zeros.
    ['focalAttribute', 'firstFocalAttribute', 'focalCategoryOrder'].forEach(function(key){
        delete currBlocks[key];
        delete clearBlocks[key];
    });

    if(JSON.stringify(currBlocks) === JSON.stringify(clearBlocks))
        error_msg.push('All the block\'s parameters equals to 0, that will result in not showing the task at all');
    return error_msg;

}

export function removeIndexFromCategories(settings){
    settings.categories.forEach(element => delete element.key);
    return settings;
}

export function toString(settings, external){
    return toScript(updateSettings(settings), external);
}

function updateSettings(settings){
    // remove added keys and put in a temp var to keep keys on original settings
    let temp_settings = clone(settings);
    temp_settings = removeIndexFromCategories(temp_settings);
    let output = {};
    if (settings.parameters.practiceBlock){
        output.practiceCategory1 = temp_settings.practiceCategory1;
        output.practiceCategory2 = temp_settings.practiceCategory2;
    }
    output.categories = temp_settings.categories;
    output.attribute1 = temp_settings.attribute1;
    output.attribute2 = temp_settings.attribute2;
    output.base_url = temp_settings.parameters.base_url;
    output.remindError =  temp_settings.parameters.remindError;
    output.showStimuliWithInst = temp_settings.parameters.showStimuliWithInst;
    output.isTouch = temp_settings.parameters.isTouch;
    output.practiceBlock = temp_settings.parameters.practiceBlock;

    temp_settings.parameters.isQualtrics ? output.isQualtrics = temp_settings.parameters.isQualtrics : '';

    Object.assign(output, temp_settings.blocks);
    temp_settings.parameters.isTouch ? Object.assign(output, temp_settings.touch_text) : Object.assign(output, temp_settings.text);
    return output;
}

export function toScript(output, external){
    let textForInternal = '//Note: This script was created by the BIAT wizard.\n//Modification of this file won\'t be reflected in the wizard.\n';
    let script = `define(['pipAPI' ,'${output.isQualtrics ? 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/BIAT/qualtrics/qbiat6.js': 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/BIAT/biat6.js'}'], function(APIConstructor, iatExtension){\n\tvar API = new APIConstructor(); return iatExtension(${JSON.stringify(output,null,4)});});`;
    external === false ? script = textForInternal + script : '';
    return script;
}

function view(ctrl, settings){
    return viewOutput(ctrl, settings, toString);
}

export default outputComponent;