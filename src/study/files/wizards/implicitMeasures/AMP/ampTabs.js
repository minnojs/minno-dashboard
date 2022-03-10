import parametersComponent from '../resources/parametersComponent.js';
import outputComponent from './ampOutputComponent.js';
import textComponent from '../resources/textComponent.js';
import exampleComponent from './ampExampleBlockComponent.js';
import blocksComponent from './ampBlocksComponent.js';
import importComponent from './ampImportComponent.js';
import aboutComponent from '../resources/aboutComponent.js';
import categoriesComponent from '../resources/categoriesComponent.js';

let parametersDesc = [
    {name: 'isQualtrics',options:['Regular','Qualtrics'], label:'Regular script or Qualtrics?', desc: ['If you want this IAT to run from Qualtrics, read ', m('a',{href: 'https://minnojs.github.io/minnojs-blog/qualtrics-iat/'}, 'this blog post '),'to see how.']},
    {name: 'exampleBlock', label:'Example Block', desc: ['Should the task start with an example block?']},
    {name: 'responses', label: 'Number of responses options', options:[2,7], desc: 'Change to 7 for a 1-7 rating.'},
    {name: 'leftkey', label: 'Left Key'},
    {name: 'rightkey', label: 'Right Key'},
    {name: 'sortingLabel1', label: 'First Sorting Label',desc: 'Response is coded as 0.'},
    {name: 'sortingLabel2', label: 'Second Sorting Label', desc: 'Response is coded as 1.'},
    {name: 'randomizeLabelSides',label:'Randomize Label Sides', desc: 'If false, then the first label is on the left, and the second is on the right.'},
    {name: 'maskStimulus', label: 'Mask Stimulus'},
    {name: 'fixationDuration', label: 'Fixation Duration', desc: 'Value of 0 means no fixation presentation.'},
    {name: 'fixationStimulus', label: 'Fixation Stimulus'},
    {name: 'showRatingDuration', label: 'Show Rating Duration ', desc: 'In the 7-responses option, for how long to show the selected rating.'},
    {name: 'base_url', label: 'Image\'s URL'},
    //Clearing Object
    {
        leftkey: '', rightkey: '',
        sortingLabel1:'', sortingLabel2:'',
        randomizeLabelSides: false,
        maskStimulus:{css : {color:'#000000', 'font-size':'1em'}, media : {image:''}},
        fixationDuration:0,
        fixationStimulus:{css : {color:'#000000', 'font-size':'1em'}, media : {word:''}},
        showRatingDuration: '', base_url:{image:''}
    }
];

let textDesc=[
    {name: 'exampleBlockInst', nameSeven:'exampleBlockInst7', label:'Example Block\'s Instructions'},
    {name: 'firstBlockInst', nameSeven:'firstBlockInst7', label:'First Block\'s Instructions'},
    {name: 'middleBlockInst', nameSeven:'middleBlockInst7', label:'Middle Block\'s Instructions'},
    {name: 'lastBlockInst', nameSeven:'lastBlockInst7', label:'Last Block\'s Instructions'},
    {name: 'endText', nameSeven:'endText', label:'End Block\'s Instructions'},
    {exampleBlockInst: '', firstBlockInst: '', middleBlockInst:'', lastBlockInst:'', endText:''},
    {exampleBlockInst7: '', firstBlockInst7: '', middleBlockInst7:'', lastBlockInst7:'', endText:''}
];

let blocksDesc = [
    {name: 'trialsInExample', label: 'Number of trials in example block', desc: 'Change to 0 if you don\'t want an example block.'},
    {name: 'trialsInBlock', label: 'Number of trials in a block'},
    {trialsInExample: 0, trialsInBlock: [0,0,0]}
];

let exampleBlock = [
    {name: 'exampleBlock_fixationDuration', label: 'Fixation Duration', desc: 'Value of -1 means no fixation presentation.'},
    {name: 'exampleBlock_primeDuration', label: 'Prime Duration'},
    {name: 'exampleBlock_postPrimeDuration', label: 'Post Prime Duration'},
    {name: 'exampleBlock_targetDuration', label: 'Target Duration'},
    {   exampleBlock_fixationDuration: 0,
        exampleBlock_primeDuration: 0,
        exampleBlock_postPrimeDuration: 0,
        exampleBlock_targetDuration:0,
        exampleTargetStimulus: {nameForLogging: '', sameAsTargets: false},
        exampleFixationStimulus: {css: {color: '000000', 'font-size': '1em'}, media: {word: ''}},
        exampleMaskStimulus: {css: {color: '000000', 'font-size': '1em'}, media: {image: ''}},
        examplePrimeStimulus: {nameForLogging: '', mediaArray: []}
    }
];

let targetClear = [
    {
        name: '',
        nameForFeedback : '',
        mediaArray : []
    },
    {
        targetDuration: 0,
        color: '#000000',
        'font-size': '1em',
        primeDuration: 0,
        postPrimeDuration: 0,
    }
];

let targetTab = {
    'targetCategory':{text: 'Target Category'},
    'targetStimulusCSS':{text:'Target Appearance'}
};

let primeClear = [
    {
        name : '',
        nameForFeedback: '',
        mediaArray : []
    },
    { //CSS cleared
        targetDuration: 0,
        primeDuration: 0,
        postPrimeDuration: 0,
        color: '#000000',
        'font-size': '1em'
    }
];

let primesTabs = {
    'prime1':{text: 'First Category'},
    'prime2':{text: 'Second Category'},
    'primeStimulusCSS':{text:'Prime Appearance'}
};


let tabs = {
    'parameters':{text: 'General parameters', component: parametersComponent, rowsDesc: parametersDesc },
    'blocks':{text: 'Blocks', component: blocksComponent, rowsDesc: blocksDesc},
    'exampleBlock':{text: 'Example Block', component: exampleComponent, rowsDesc: exampleBlock},
    'prime': {
        text: 'Prime Categories',
        component: categoriesComponent,
        rowsDesc: primeClear,
        subTabs: primesTabs,
        type: 'AMP'
    },
    'categories':{
        text: 'Target Category',
        component: categoriesComponent,
        rowsDesc: targetClear,
        subTabs: targetTab,
        type: 'AMP'
    },
    'text':{text: 'Texts', component: textComponent, rowsDesc: textDesc},
    'output':{text: 'Complete', component: outputComponent, rowsDesc: blocksDesc},
    'import':{text: 'Import', component: importComponent},
    'about': {text: 'About', component: aboutComponent, rowsDesc:'AMP'}
};

export default tabs;