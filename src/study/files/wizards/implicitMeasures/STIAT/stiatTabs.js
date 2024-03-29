import parametersComponent from '../resources/parametersComponent.js';
import outputComponent from './stiatOutputComponent.js';
import textComponent from '../resources/textComponent.js';
import blocksComponent from './stiatlBlocksComponent.js';
import categoriesComponent from '../resources/categoriesComponent.js';
import importComponent from './stiatImportComponent.js';
import aboutComponent from '../resources/aboutComponent.js';

let parametersDesc = [
    {name: 'isQualtrics', options:['Regular','Qualtrics'],label:'Regular script or Qualtrics?', desc: ['If you want this IAT to run from Qualtrics, read ', m('a',{href: 'https://minnojs.github.io/minnojs-blog/qualtrics-iat/'}, 'this blog post '),'to see how.']},
    {name: 'base_url', label: 'Image\'s URL'},
    {isQualtrics:false, base_url:{image:''}}
];

let textDesc = [
    {name: 'leftKeyText', label:'Top-left text (about the left key)', desc: 'We use this text to remind participants what key to use for a left response.'},
    {name: 'rightKeyText', label:'Top-right text (about the right key)', desc: 'We use this text to remind participants what key to use for a right response.'},
    {name: 'orKeyText', label:'Or', desc: 'We show this text in the combined blocks to separate between the two categories that use the same key.'},
    {name: 'remindErrorText', label: 'Screen\'s Bottom (error reminder)', desc: 'We use this text to remind participants what happens on error.'},
    {name: 'finalText', label:'Text shown at the end of the task'},
    {name: 'instTemplatePractice', label:'Instructions in Practice Block'},
    {name: 'instTemplateCategoryRight', label:'Block instructions when the single category is on the right'},
    {name: 'instTemplateCategoryLeft', label:'Block instructions when the single category is on the left'},
    {textOnError:'', leftKeyText:'', rightKeyText:'', orKeyText:'', remindErrorText:'',finalText:'',
        instTemplatePractice:'', instTemplateCategoryRight:'', instTemplateCategoryLeft:''},
    {} //an empty element
];

let blocksDesc = [
    {name: 'blockOrder', label: 'Block Order', options: ['startRight','startLeft','random'],
        desc: 'Applies to the single category\'s location on the first block. \n' +
            'Choose \'startRight\' for it to appear on the right side, \'startLeft\' for it to appear on the left side, or \'random\' if you want to randomize the location.\n' +
            'Note that the first Attribute on the Attributes page appears on the left side, and the second attribute appears on the right.'},
    {name: 'switchSideBlock', label: 'Switch Side Block ', desc: 'By default, we switch on block 4 (i.e., after blocks 2 and 3 showed the first pairing condition).'},
    {name: 'instHTML', label:'Block\'s Instructions', desc: 'Empty field means we will create the instructions from a default template.'},
    {name: 'miniBlocks', label:'Number of mini-blocks', desc: 'Higher number reduces repetition of same group/response.\nSet to 1 if you don\'t need mini blocks.\nValue of 0 will break the task.'},
    {name: 'singleAttTrials', label:'Number of single attribute trials', desc: 'Number of trials of the attribute that does not share key with the category (in a mini block).'},
    {name: 'sharedAttTrials', label:'Number of shared key attribute trials', desc: 'Number of trials of the attribute that shares key with the category (in a mini block).'},
    {name: 'categoryTrials', label:'Number of category trials', desc: 'Number of trials of the category (in a mini-block).\nIf 0, the label does not appear.'},
    {
        instHTML : '', 
        block : 1,
        miniBlocks : 0, 
        singleAttTrials : 0, 
        sharedAttTrials : 0, 
        categoryTrials : 0 
    }
];

let categoryClear = [{
    name: '', 
    title: {media: {word: ''}, css: {color: '#000000', 'font-size': '1em'}, height: 4},
    stimulusMedia: [],
    stimulusCss : {color:'#000000', 'font-size':'1em'}
}];

let category = {
    'category':{text: 'Category'}
};

let attributesTabs = {
    'attribute1': {text: 'First Attribute'},
    'attribute2': {text: 'Second Attribute'}
};

let tabs = {
    'parameters': {text: 'General parameters', component: parametersComponent, rowsDesc: parametersDesc},
    'blocks': {text: 'Blocks', component: blocksComponent, rowsDesc: blocksDesc},
    'category': {text: 'Category', component: categoriesComponent, rowsDesc: categoryClear, subTabs: category},
    'attributes': {
        text: 'Attributes',
        component: categoriesComponent,
        rowsDesc: categoryClear,
        subTabs: attributesTabs
    },
    'text': {text: 'Texts', component: textComponent, rowsDesc: textDesc},
    'output': {text: 'Complete', component: outputComponent, rowsDesc: blocksDesc.slice(-1)[0]},
    'import': {text: 'Import', component: importComponent},
    'help': {text: 'Help', component: aboutComponent, rowsDesc: 'STIAT'}
};

export default tabs;