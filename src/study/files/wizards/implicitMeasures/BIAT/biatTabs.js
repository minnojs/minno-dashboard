import parametersComponent from '../resources/parametersComponent.js';
import blocksComponent from '../resources/blocksComponent.js';
import textComponent from '../resources/textComponent.js';
import categoriesComponent from './biatCategoriesComponent.js';
import attributesComponent from '../resources/categoriesComponent.js';
import outputComponent from './biatOutputComponent.js';
import importComponent from './biatImportComponent.js';
import aboutComponent from '../resources/aboutComponent.js';

let parametersDesc = [
    {name: 'isTouch', options:['Keyboard', 'Touch'], label:'Keyboard input or touch input?', desc:'The script can run on a desktop computer or a touch device. \nMinno does not auto-detect the input method. If you need a touch version and a keyboard version, create two different scripts with this tool.'},
    {name: 'isQualtrics', options:['Regular','Qualtrics'], label:'Regular script or Qualtrics?', desc: ['If you want this BIAT to run from Qualtrics, read ', m('a',{href: 'https://minnojs.github.io/minnojs-blog/qualtrics-biat/'}, 'this blog post '),'to see how.']},
    {name: 'practiceBlock', label: 'Practice Block', desc: 'Should the task start with a practice block?'},
    {name: 'remindError', label: 'Error feedback on incorrect responses', desc: 'Should we show error feedback?\nIt is recommended to show participants an error feedback on error responses.'},
    {name: 'showStimuliWithInst', label: 'Show Stimuli with Instructions', desc: 'Whether to show the stimuli of the IN categories at the beginning of the block.'},
    {name: 'base_url', label: 'Image\'s URL', desc: 'If your task has any images, enter here the path to that images folder.\nIt can be a full url, or a relative URL to the folder that will host this script.'},
    {istouch:false, isQualtrics:false, practiceBlock:false, showStimuliWithInst:false, remindError:false, base_url:{image:''}}
];

let blocksDesc = [
    {name: 'nMiniBlocks', label: 'Mini Blocks', desc: 'Each block can be separated to a number of mini-blocks, to reduce repetition of the same response in consecutive trials. The default, 1, means that we don\'t actually use mini blocks.'},
    {name: 'nTrialsPerMiniBlock', label: 'Trials in Mini Blocks', desc: '50% on the right, 50% left, 50% attributes, 50% categories.'},
    {name: 'nPracticeBlockTrials', label: 'Trials in Practice Block', desc:'Should be at least 8 trials'},
    {name: 'nCategoryAttributeBlocks', label: 'Blocks per focal category-attribute combination', desc: 'Number of blocks per focal category-attribute combination'},
    {name: 'focalAttribute', label: 'Focal Attribute', desc: 'Sets whether we use a certain focal attribute throughout the task, or both.', options: ['attribute1','attribute2','both']},
    {name: 'firstFocalAttribute', label: 'First Focal Attribute', desc: 'Sets what attribute appears first. Irrelevant if Focal Attribute is not \'both\'.', options: ['attribute1','attribute2','random']},
    {name: 'focalCategoryOrder', label: 'Focal Category Order', desc: 'If bySequence then we always start with the first category in the list as the first focal category.', options: ['bySequence','random']},
    {nMiniBlocks: 0, nTrialsPerMiniBlock: 0, nPracticeBlockTrials:0, nCategoryAttributeBlocks:0,
        focalAttribute: 'attribute1', firstFocalAttribute : 'random', focalCategoryOrder: 'random'}
];

let textDesc = [
    {name: 'instTemplate', nameTouch: 'instTemplateTouch',label:'Instructions'},
    {name: 'remindErrorText', nameTouch: 'remindErrorTextTouch' , label:'Screen\'s Bottom (error reminder)', desc:'We use this text to remind participants what happens on error. Replace this text if you do not require participants to correct their error responses (see General Parameters page).'},
    {name: 'leftKeyText', nameTouch:'leftKeyTextTouch',label:'Top-left text (about the left key)', desc: 'We use this text to remind participants what key to use for a left response.'},
    {name: 'rightKeyText', nameTouch:'rightKeyTextTouch',label:'Top-right text (about the right key)', desc: 'We use this text to remind participants what key to use for a right response.'},
    {name: 'orText', label:'Or', desc: 'We show this text in the combined blocks to separate between the two categories that use the same key.'},
    {name: 'finalText', nameTouch: 'finalTouchText' , label:'Text shown at the end of the task'},
    {remindErrorText:'', leftKeyText:'', rightKeyText:'', orText:'', instTemplate:'', finalText:''},
    {remindErrorTextTouch:'', leftKeyTextTouch:'', rightKeyTextTouch:'',  instTemplateTouch:'', finalTouchText:''}
];

let elementClear = [{
    name : '',
    title : {
        media : {word : ''},
        css : {color:'#000000','font-size':'1em'},
        height : 4, 
        startStimulus : { 
            media : {word : ''},
            css : {color:'#000000','font-size':'1em'},
            height : 2
        }
    },
    stimulusMedia : [], 
    stimulusCss : {color:'#000000','font-size':'1em'} }];


let attributesTabs = {
    'attribute1': {text: 'First Attribute'},
    'attribute2': {text: 'Second Attribute'}
};

let practiceTabs = {
    'practiceCategory1':{text: 'First Practice Category'},
    'practiceCategory2':{text: 'Second Practice Category'}
};

let tabs = {
    'parameters': {text: 'General parameters', component: parametersComponent, rowsDesc: parametersDesc},
    'blocks': {text: 'Blocks', component: blocksComponent, rowsDesc: blocksDesc},
    'practice': {
        text: 'Practice Block',
        component: attributesComponent,
        rowsDesc: elementClear,
        subTabs: practiceTabs,
        type: 'BIAT'
    },
    'categories': {text: 'Categories', component: categoriesComponent, rowsDesc: elementClear},
    'attributes': {
        text: 'Attributes',
        component: attributesComponent,
        rowsDesc: elementClear,
        subTabs: attributesTabs,
        type: 'BIAT'
    },
    'text': {text: 'Texts', component: textComponent, rowsDesc: textDesc},
    'output': {text: 'Complete', component: outputComponent, rowsDesc: blocksDesc},
    'import': {text: 'Import', component: importComponent},
    'about': {text: 'About', component: aboutComponent, rowsDesc: 'BIAT'}
};

export default tabs;