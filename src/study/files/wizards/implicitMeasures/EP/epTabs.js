import parametersComponent from '../resources/parametersComponent.js';
import outputComponent from './epOutputComponent.js';
import textComponent from '../resources/textComponent.js';
import blocksComponent from '../resources/blocksComponent.js';
import categoriesComponent from '../resources/categoriesComponent.js';
import importComponent from './epImportComponent.js';
import aboutComponent from '../resources/aboutComponent.js';

let parametersDesc = [
    {name: 'isQualtrics',options:['Regular','Qualtrics'], label:'Regular script or Qualtrics?', desc: ['If you want this Evaluative Priming task to run from Qualtrics, read ', m('a',{href: 'https://minnojs.github.io/minnojs-blog/qualtrics-priming/'}, 'this blog post '),'to see how.']},
    {name: 'separateStimulusSelection', label: 'Separate Stimulus Selection', desc: 'We select the stimuli randomly until exhaustion ' +
            '(i.e., a stimulus would not appear again until all other stimuli of that category would appear). ' +
            '\nThis kind of selection can be done throughout the task or within each prime-target combination (if you keep this option checked).'},
    {name: 'fixationDuration', label: 'Fixation Duration', desc: 'Value of 0 means no fixation presentation.'},
    {name: 'fixationStimulus', label: 'Fixation Stimulus'},
    {name: 'deadlineDuration', label: 'Response Deadline Duration', desc: 'Value of 0 means no response deadline, we\'ll wait until response.'},
    {name: 'deadlineMsgDuration', label: 'Response Deadline\'s Message Duration', desc: 'How long the response deadline message will be presented?'},
    {name: 'deadlineStimulus', label: 'Response Deadline Stimulus'},
    {name: 'base_url', label: 'Image\'s URL'},
    {isTouch:false, separateStimulusSelection:0, fixationDuration:0 ,
        fixationStimulus:{css : {color:'#000000', 'font-size':'1em'}, media : {word:''}},
        deadlineStimulus:{css : {color:'#000000', 'font-size':'1em'}, media : {word:''}, location: {bottom:10}},
        deadlineDuration:0, deadlineMsgDuration:0, base_url:{image:''}}
];

let textDesc=[
    {name: 'firstBlock', label:'First Block\'s Instructions'},
    {name: 'middleBlock', label:'Middle Block\'s Instructions'},
    {name: 'lastBlock', label:'Last Block\'s Instructions'},
    {firstBlock: '', middleBlock:'', lastBlock:''},
    {} //an empty element
];

let blocksDesc = [
    {name: 'nBlocks', label: 'Number of blocks'},
    {name: 'nTrialsPerPrimeTargetPair', label: 'Number of trials in a block, per prime-target combination'},
    {nBlocks: 0, nTrialsPerPrimeTargetPair: 0}
];

let categoryClear = [{
    name: '',
    title: {media: {word: ''},
        css: {color: '#000000', 'font-size': '1em'}, height: 4},
    stimulusMedia: [],
    stimulusCss : {color:'#000000', 'font-size':'1em'}
}];

let primeClear = [
    {
        name : '',  //Will be used in the logging
        mediaArray : []
    },
    { //CSS cleared
        primeDuration: 0,
        color: '#000000',
        'font-size': '1em'
    }
];

let categoriesTabs = {
    'rightAttTargets':{text: 'First Category'},
    'leftAttTargets':{text: 'Second Category'},
};

let primesTabs = {
    'prime1':{text: 'First Category'},
    'prime2':{text: 'Second Category'},
    'primeStimulusCSS':{text:'Prime Appearance'}
};

let tabs = {
    'parameters': {text: 'General parameters', component: parametersComponent, rowsDesc: parametersDesc},
    'blocks': {text: 'Blocks', component: blocksComponent, rowsDesc: blocksDesc},
    'prime': {
        text: 'Prime Categories',
        component: categoriesComponent,
        rowsDesc: primeClear,
        subTabs: primesTabs,
        type: 'EP'
    },
    'categories': {
        text: 'Target Categories',
        component: categoriesComponent,
        rowsDesc: categoryClear,
        subTabs: categoriesTabs
    },
    'text': {text: 'Texts', component: textComponent, rowsDesc: textDesc},
    'output': {text: 'Complete', component: outputComponent},
    'import': {text: 'Import', component: importComponent},
    'about': {text: 'About', component: aboutComponent, rowsDesc: 'EP'}
};

export default tabs;