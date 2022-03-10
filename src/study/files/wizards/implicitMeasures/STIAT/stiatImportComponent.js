import {viewImport} from '../resources/utilities.js';

let importComponent = {
    controller:controller,
    view:view
};

function view(ctrl){
    return viewImport(ctrl);
}

function controller(settings) {
    return {handleFile, updateSettings};

    function handleFile(){
        let importedFile = document.getElementById('uploadFile').files[0];
        let reader = new FileReader();
        reader.readAsText(importedFile); 
        reader.onload = function() {
            let fileContent = JSON.parse(reader.result);
            settings = updateSettings(settings, fileContent);
        };
    }
}

export function updateMediaSettings(settings){
    //update attributes to be compatible to IAT so that elementComponent can be used.
    settings.category.stimulusMedia = settings.category.media;
    delete settings.category.media;
    settings.attribute1.stimulusMedia = settings.attribute1.media;
    delete settings.attribute1.media;
    settings.attribute2.stimulusMedia = settings.attribute2.media;
    delete settings.attribute2.media;

    settings.category.stimulusCss = settings.category.css;
    delete settings.category.css;
    settings.attribute1.stimulusCss = settings.attribute1.css;
    delete settings.attribute1.css;
    settings.attribute2.stimulusCss = settings.attribute2.css;
    delete settings.attribute2.css;
    return settings;
}

export function updateSettings(settings, input) {
    settings.category = input.category;
    settings.attribute1 = input.attribute1;
    settings.attribute2 = input.attribute2;
    settings.parameters.base_url = input.base_url;
    settings.parameters.isQualtrics = input.isQualtrics;
    settings.text.leftKeyText = input.leftKeyText;
    settings.text.rightKeyText = input.rightKeyText;
    settings.text.orKeyText = input.orKeyText;
    settings.text.remindErrorText = input.remindErrorText;
    settings.text.finalText = input.finalText;
    settings.text.instTemplatePractice = input.instTemplatePractice;
    settings.text.instTemplateCategoryRight = input.instTemplateCategoryRight;
    settings.text.instTemplateCategoryLeft = input.instTemplateCategoryLeft;
    settings.trialsByBlock = input.trialsByBlock;
    settings.blockOrder = input.blockOrder;
    settings.switchSideBlock = input.switchSideBlock;

    settings = updateMediaSettings(settings);
    return settings;

}

export default importComponent;