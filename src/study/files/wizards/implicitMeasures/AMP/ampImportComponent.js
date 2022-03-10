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
        reader.onload = function(){
            let fileContent = JSON.parse(reader.result);
            settings = updateSettings(settings, fileContent);
        };
    }
}
export function updateMediaSettings(settings) {
    //update attributes to be compatible to EP so that primeComponent & primeDesignComp can be used for AMP also.

    settings.prime1 = settings.primeCats[0];
    settings.prime2 = settings.primeCats[1];
    delete settings.primeCats;
    settings.prime1.name = settings.prime1.nameForLogging;
    settings.prime2.name = settings.prime2.nameForLogging;

    let temp = settings.targetCats[0];
    delete settings.targetCats;
    settings.targetCategory = temp;
    settings.targetCategory.name = settings.targetCategory.nameForLogging;
    settings.targetCategory.nameForFeedback = settings.targetCat;
    delete settings.targetCategory.nameForLogging;
    delete settings.targetCat;

    return settings;
}
export function updateSettings(settings, input) {
    //updating the settings variable in parameters group according
    //to the DefaultSettings file pattern
    let parameters = ['isQualtrics', 'exampleBlock',
        'fixationDuration',
        'showRatingDuration', 'responses',
        'sortingLabel1', 'sortingLabel2',
        'randomizeLabelSides', 'rightKey', 'leftKey',
        'fixationStimulus', 'maskStimulus', 'base_url'
    ];
    parameters.forEach(parameter => {settings.parameters[parameter] = input[parameter];});

    if(settings.parameters.exampleBlock){
        let exampleBlock = [
            'exampleTargetStimulus', 'exampleFixationStimulus',
            'exampleMaskStimulus', 'exampleBlock_fixationDuration',
            'exampleBlock_primeDuration', 'exampleBlock_postPrimeDuration',
            'exampleBlock_targetDuration', 'examplePrimeStimulus',
        ];
        exampleBlock.forEach(parameter => {settings.exampleBlock[parameter] = input[parameter];});
    }
    let variousParams = [
        'primeStimulusCSS', 'primeCats', 'targetStimulusCSS', 'targetCats', 'targetCat'
    ];
    variousParams.forEach(parameter => {settings[parameter] = input[parameter];});

    let blocks = ['trialsInBlock', 'trialsInExample'];
    blocks.forEach(parameter => {settings.blocks[parameter] = input[parameter];});

    let primeParam = ['primeDuration', 'postPrimeDuration'];
    primeParam.forEach(parameter => {settings.primeStimulusCSS[parameter] = input[parameter];});

    settings.targetStimulusCSS.targetDuration = input.targetDuration;

    let textParams = [];
    if(input.responses === '2'){
        textParams = ['exampleBlockInst', 'firstBlockInst',
            'middleBlockInst', 'lastBlockInst', 'endText'
        ];
        textParams.forEach(param => {settings.text[param] = input[param];});
        settings.parameters.leftkey = input.leftKey;
        settings.parameters.rightkey = input.rightKey;
    }
    else{
        textParams = ['exampleBlockInst7', 'firstBlockInst7',
            'middleBlockInst7', 'lastBlockInst7', 'endText'
        ];
        textParams.forEach(param => {settings.text_seven[param] = input[param];});
    }

    settings = updateMediaSettings(settings);
    m.redraw();

    return settings;
}

export default importComponent;

