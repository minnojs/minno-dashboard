import {viewImport} from '../resources/utilities.js';

let importComponent = {
    controller:controller,
    view:view
};

function view(ctrl){
    return viewImport(ctrl);
}

function controller(settings) {
    let fileInput = m.prop('');
    return {fileInput, handleFile, updateSettings};

    function handleFile(){
        let importedFile = document.getElementById('uploadFile').files[0];
        let reader = new FileReader();
        reader.readAsText(importedFile);
        reader.onload = function() {
            let fileContent = JSON.parse(reader.result);
            updateSettings(settings, fileContent);
        };
    }
}
export function updateMediaSettings(settings, input){
    //update attributes to be compatible to IAT so that elementComponent can be used.
    settings.rightAttTargets = input.targetCats.rightAttTargets;
    settings.rightAttTargets.stimulusMedia = input.targetCats.rightAttTargets.mediaArray;
    delete settings.targetCats.rightAttTargets.mediaArray;

    settings.leftAttTargets = input.targetCats.leftAttTargets;
    settings.leftAttTargets.stimulusMedia = input.targetCats.leftAttTargets.mediaArray;
    delete settings.targetCats.leftAttTargets.mediaArray;

    settings.rightAttTargets.stimulusCss = input.targetCats.rightAttTargets.stimulusCSS;
    settings.leftAttTargets.stimulusCss = input.targetCats.leftAttTargets.stimulusCSS;
    delete settings.rightAttTargets.stimulusCSS;
    delete settings.leftAttTargets.stimulusCSS;
    delete settings.targetCats.rightAttTargets;
    delete settings.targetCats.leftAttTargets;
    delete settings.targetCats;
    return settings;
}
export function updateSettings(settings, input) {
    settings.primeStimulusCSS = input.primeStimulusCSS;
    settings.prime1 = input.prime1;
    settings.prime2 = input.prime2;
    settings.targetCats = input.targetCats;
    settings.parameters.base_url = input.base_url;
    settings.parameters.separateStimulusSelection = input.separateStimulusSelection;
    settings.parameters.primeDuration = input.primeDuration;
    settings.parameters.fixationDuration = input.fixationDuration;
    settings.parameters.deadlineDuration = input.deadlineDuration;
    settings.parameters.deadlineMsgDuration = input.deadlineMsgDuration;
    settings.parameters.fixationStimulus = input.fixationStimulus;
    settings.parameters.deadlineStimulus = input.deadlineStimulus;

    if(input.isQualtrics)
        settings.parameters.isQualtrics = input.isQualtrics;

    settings.text.firstBlock = input.firstBlock;
    settings.text.middleBlock = input.middleBlock;
    settings.text.lastBlock = input.lastBlock;

    settings.blocks.nTrialsPerPrimeTargetPair = input.nTrialsPerPrimeTargetPair;
    settings.blocks.nBlocks = input.nBlocks;

    settings = updateMediaSettings(settings, input);
    return settings;
}

export default importComponent;