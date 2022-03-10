import {checkPrime, checkStimulus, clone, viewOutput} from '../resources/utilities.js';

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
                downloadLink.download = 'AMP.json'; }
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

export function validityCheck(error_msg, settings){
    //Parameters Tab
    let textParameters= {
        sortingLabel1: 'First Sorting Label',
        sortingLabel2: 'Second Sorting Label',
        rightkey: 'Right key',
        leftkey: 'Left key'
    };
    Object.entries(textParameters).forEach(([key, value]) => {
        if(!settings.parameters[key].length)
            error_msg.push(value+' is missing');
    });
    checkStimulus(settings.parameters.fixationStimulus, 'Fixation stimulus', 'word' ,error_msg);
    checkStimulus(settings.parameters.maskStimulus, 'Mask stimulus', 'image' ,error_msg);
    //Prime, Target & Example Categories
    let temp1 = checkPrime(settings.prime1, 'First Prime Category\'s', error_msg);
    let temp2 = checkPrime(settings.prime2, 'Second Prime Category\'s', error_msg);
    let temp3 = checkPrime(settings.targetCategory, 'Target Category\'s', error_msg);
    let temp4 = false;
    if(settings.parameters.exampleBlock)
        temp4 = checkPrime(settings.exampleBlock.examplePrimeStimulus, 'Example Prime stimulus\'' ,error_msg);

    //Blocks tab
    if(!settings.blocks.trialsInBlock.reduce((a, b) => a + b, 0))
        error_msg.push('All the block\'s trials equals to 0, that will result in not showing the task at all');
    if(settings.parameters.exampleBlock && !settings.blocks.trialsInExample)
        error_msg.push('The example block in the Parameters tab is checked but the the ' +
            'number of trials in example block (in the Blocks tab) is set to 0. ' +
            'Please beware and change the parameters accordingly.');

    //Example Block Check
    if(settings.parameters.exampleBlock){
        if(settings.exampleBlock.exampleTargetStimulus.nameForLogging.length === 0)
            error_msg.push('Example Target stimulus\' name for logging is missing');
        checkStimulus(settings.exampleBlock.exampleFixationStimulus, 'Example Fixation stimulus', 'word' ,error_msg);
        checkStimulus(settings.exampleBlock.exampleMaskStimulus, 'Example Mask stimulus', 'image' ,error_msg);
    }

    //If  one of the categories is using an image and the user didn't set a base_url
    let containsImage = temp1 || temp2 || temp3 || temp4;
    if(settings.parameters.base_url.image.length === 0 && containsImage)
        error_msg.push('Image\'s url is missing and there is an image in the study');

    return error_msg;
}

export function toString(settings, external){
    return toScript(updateSettings(settings), external);
}

export function updateMediaSettings(settings) {
    //update PrimeCats and TargetCats names to be compatible to AMP
    let settings_output = clone(settings);

    settings_output.primeDuration = settings_output.primeStimulusCSS.primeDuration;
    delete settings_output.primeStimulusCSS.primeDuration;
    settings_output.postPrimeDuration = settings_output.primeStimulusCSS.postPrimeDuration;
    delete settings_output.primeStimulusCSS.postPrimeDuration;
    delete settings_output.primeStimulusCSS.targetDuration;
    settings_output.targetDuration = settings_output.targetStimulusCSS.targetDuration;
    delete settings_output.targetStimulusCSS.targetDuration;
    delete settings_output.targetStimulusCSS.postPrimeDuration;
    delete settings_output.targetStimulusCSS.primeDuration;

    settings_output.primeCats = [{ //To order the attributes
        nameForFeedback: settings_output.prime1.nameForFeedback,
        nameForLogging: settings_output.prime1.name,
        mediaArray: settings_output.prime1.mediaArray}, {
        nameForFeedback: settings_output.prime2.nameForFeedback,
        nameForLogging: settings_output.prime2.name,
        mediaArray: settings_output.prime2.mediaArray}];

    delete settings_output.prime1;
    delete settings_output.prime2;

    settings_output.targetCats=[{
        nameForLogging: settings_output.targetCategory.name,
        mediaArray: settings_output.targetCategory.mediaArray}];
    settings_output.targetCat = settings.targetCategory.nameForFeedback;
    delete settings_output.targetCategory;

    if(settings.parameters.responses === '2'){
        settings_output.parameters.leftKey = settings.parameters.leftkey;
        settings_output.parameters.rightKey = settings.parameters.rightkey;
    }
    delete settings_output.parameters.leftkey;
    delete settings_output.parameters.rightkey;

    return settings_output;
}

function updateSettings(settings){
    settings = updateMediaSettings(settings);

    let output={
        primeStimulusCSS: settings.primeStimulusCSS,
        primeDuration: settings.primeDuration,
        postPrimeDuration: settings.postPrimeDuration,
        primeCats: settings.primeCats,
        targetStimulusCSS: settings.targetStimulusCSS,
        targetDuration: settings.targetDuration,
        targetCat: settings.targetCat,
        targetCats: settings.targetCats
    };
    Object.assign(output, settings.blocks);
    if(settings.parameters.exampleBlock){
        Object.assign(output, settings.exampleBlock);
    }
    if(settings.parameters.isQualtrics)
        output.isQualtrics = settings.parameters.isQualtrics;
    delete settings.parameters.isQualtrics;

    Object.assign(output, settings.parameters);
    settings.parameters.responses === 2 ?
        Object.assign(output, settings.text)
        : Object.assign(output, settings.text_seven);
    return output;
}

export function toScript(output, external){
    let textForInternal = '//Note: This script was created by the IAT wizard.\n//Modification of this file won\'t be reflected in the wizard.\n';
    let script = `define(['pipAPI' ,'${output.isQualtrics ? 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/amp/qualtrics/qamp.js': 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/amp/amp4.js'}'], function(APIConstructor, iatExtension){\n\tvar API = new APIConstructor(); return iatExtension(${JSON.stringify(output,null,4)});});`;
    external === false ? script = textForInternal + script : '';
    return script;
}

function view(ctrl,settings){
    return viewOutput(ctrl, settings, toString);
}

export default iatOutputComponent;
