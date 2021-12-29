import {viewImport} from '../resources/utilities.js';

let importComponent = {
    controller:controller,
    view:view
};

function view(ctrl){
    return viewImport(ctrl);
}

function controller(settings){
    let fileInput = m.prop('');
    return {fileInput, handleFile, updateSettings};

    function handleFile(){
        let importedFile = document.getElementById('uploadFile').files[0];
        let reader = new FileReader();
        reader.readAsText(importedFile); 
        reader.onload = function(){
            let fileContent = JSON.parse(reader.result);
            settings = updateSettings(settings, fileContent);
        };
    }
}

export function updateSettings(settings, input){
    settings.objectCat1 = input.objectCat1;
    settings.objectCat2 = input.objectCat2;
    settings.attribute1 = input.attribute1;
    settings.attribute2 = input.attribute2;

    settings.parameters.base_url = input.base_url;
    settings.parameters.keyTopLeft = input.keyTopLeft;
    settings.parameters.keyTopRight = input.keyTopRight;
    settings.parameters.keyBottomLeft = input.keyBottomLeft;
    settings.parameters.keyBottomRight = input.keyBottomRight;

    settings.blocks.nBlocks = input.nBlocks;
    settings.blocks.nTrialsPerPrimeTargetPair = input.nTrialsPerPrimeTargetPair;
    settings.blocks.randomCategoryLocation = input.randomCategoryLocation;
    settings.blocks.randomAttributeLocation = input.randomAttributeLocation;

    settings.text.firstBlock = input.firstBlock;
    settings.text.middleBlock = input.middleBlock;
    settings.text.lastBlock = input.lastBlock;

    return settings;

}

export default importComponent;