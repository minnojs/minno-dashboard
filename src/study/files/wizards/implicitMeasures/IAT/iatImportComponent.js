import {viewImport} from '../resources/utilities.js';

let iatImportComponent = {
    controller:controller,
    view:view
};

function view(ctrl){
    return viewImport(ctrl);
}

export default iatImportComponent;

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
export function updateSettings(settings, input) {
    settings.category1 = input.category1;
    settings.category2 = input.category2;
    settings.attribute1 = input.attribute1;
    settings.attribute2 = input.attribute2;
    settings.parameters.base_url = input.base_url;
    settings.parameters.remindError = input.remindError;
    settings.parameters.errorCorrection = input.errorCorrection;
    settings.parameters.isTouch = input.isTouch;
    if(input.isQualtrics){
        settings.parameters.isQualtrics = input.isQualtrics;
        settings.parameters.showDebriefing = input.showDebriefing;
        settings.parameters.fullscreen = input.fullscreen;
        if(!input.isTouch){
            settings.parameters.leftKey = input.leftKey;
            settings.parameters.rightKey = input.rightKey;
        }
    }
    settings.blocks.blockCategories_nTrials = input.blockCategories_nTrials;
    settings.blocks.blockCategories_nMiniBlocks = input.blockCategories_nMiniBlocks;
    settings.blocks.blockAttributes_nTrials = input.blockAttributes_nTrials;
    settings.blocks.blockAttributes_nMiniBlocks = input.blockAttributes_nMiniBlocks;
    settings.blocks.blockFirstCombined_nTrials = input.blockFirstCombined_nTrials;
    settings.blocks.blockFirstCombined_nMiniBlocks = input.blockFirstCombined_nMiniBlocks;
    settings.blocks.blockSecondCombined_nTrials = input.blockSecondCombined_nTrials;
    settings.blocks.blockSecondCombined_nMiniBlocks = input.blockSecondCombined_nMiniBlocks;
    settings.blocks.blockSwitch_nTrials = input.blockSwitch_nTrials;
    settings.blocks.blockSwitch_nMiniBlocks = input.blockSwitch_nMiniBlocks;
    settings.blocks.randomBlockOrder = input.randomBlockOrder;
    settings.blocks.randomAttSide = input.randomAttSide;
    if (input.isTouch){
        settings.touch_text.textOnError = input.textOnError;
        settings.touch_text.leftKeyText = input.leftKeyText;
        settings.touch_text.rightKeyText = input.rightKeyText;
        settings.touch_text.orKeyText = input.orKeyText;
        settings.touch_text.AttributesBlockInstructions = input.AttributesBlockInstructions;
        settings.touch_text.CategoriesBlockInstructions = input.CategoriesBlockInstructions;
        settings.touch_text.FirstCombinedBlockInstructions = input.FirstCombinedBlockInstructions;
        settings.touch_text.SecondCombinedBlockInstructions = input.SecondCombinedBlockInstructions;
        settings.touch_text.SwitchedCategoriesInstructions = input.SwitchedCategoriesInstructions;
        settings.touch_text.PreDebriefingText = input.PreDebriefingText;
    }
    else {
        settings.text.textOnError = input.textOnError;
        settings.text.leftKeyText = input.leftKeyText;
        settings.text.rightKeyText = input.rightKeyText;
        settings.text.orKeyText = input.orKeyText;
        settings.text.AttributesBlockInstructions = input.AttributesBlockInstructions;
        settings.text.CategoriesBlockInstructions = input.CategoriesBlockInstructions;
        settings.text.FirstCombinedBlockInstructions = input.FirstCombinedBlockInstructions;
        settings.text.SecondCombinedBlockInstructions = input.SecondCombinedBlockInstructions;
        settings.text.SwitchedCategoriesInstructions = input.SwitchedCategoriesInstructions;
        settings.text.PreDebriefingText = input.PreDebriefingText;
    }
    return settings;
}
