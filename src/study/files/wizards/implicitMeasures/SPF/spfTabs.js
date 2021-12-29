import parametersComponent from '../resources/parametersComponent.js';
import outputComponent from './spfOutputComponent.js';
import textComponent from '../resources/textComponent.js';
import blocksComponent from '../resources/blocksComponent.js';
import categoriesComponent from '../resources/categoriesComponent.js';
import importComponent from './spfImportComponent.js';
import helpComponent from '../resources/helpComponent.js';

let parametersDesc = [
    {name: 'keyTopLeft', label:'Top left key'},
    {name: 'keyTopRight', label:'Top right key'},
    {name: 'keyBottomLeft', label:'Bottom left key'},
    {name: 'keyBottomRight', label:'Bottom right key'},
    {name: 'base_url', label: 'Image\'s URL', desc: 'If your task has any images, enter here the path to that images folder. It can be a full url, or a relative URL to the folder that will host this script'},
    {keyTopLeft: '', keyTopRight: '', keyBottomLeft: '', keyBottomRight: '', base_url:{image:''}}
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
    {name: 'nTrialsPerPrimeTargetPair', label: 'Number of trials in a block, per category-attribute combination', desc: 'How many trials in each block, for each of the four category-attribute combinations.'},
    {name: 'randomCategoryLocation', label: 'Randomly choose categories location', desc: 'Whether to randomly select which category is on top. If false, then the first category is on top.'},
    {name: 'randomAttributeLocation', label: 'Randomly choose attributes location', desc: 'Whether to randomly select which attribute is on the left. If false, the first attribute is on the left.'},
    {nBlocks: 0, nTrialsPerPrimeTargetPair: 0, randomCategoryLocation : false, randomAttributeLocation: false}
];

let categoryClear = [{
    name: '', 
    title: {media: {word: ''}, css: {color: '#000000', 'font-size': '1em'}, height: 4},
    stimulusMedia: [],
    stimulusCss : {color:'#000000', 'font-size':'1em'}
}];

let categoriesTabs = {
    'objectCat1': {text: 'First Category'},
    'objectCat2': {text: 'Second Category'}
};

let attributesTabs = {
    'attribute1': {text: 'First Attribute'},
    'attribute2': {text: 'Second Attribute'}
};

let tabs = {
    'parameters': {text: 'General parameters', component: parametersComponent, rowsDesc: parametersDesc},
    'blocks': {text: 'Blocks', component: blocksComponent, rowsDesc: blocksDesc},
    'categories': {
        text: 'Categories',
        component: categoriesComponent,
        rowsDesc: categoryClear,
        subTabs: categoriesTabs
    },
    'attributes': {
        text: 'Attributes',
        component: categoriesComponent,
        rowsDesc: categoryClear,
        subTabs: attributesTabs
    },
    'text': {text: 'Texts', component: textComponent, rowsDesc: textDesc},
    'output': {text: 'Complete', component: outputComponent, rowsDesc: blocksDesc},
    'import': {text: 'Import', component: importComponent},
    'help': {text: 'Help', component: helpComponent, rowsDesc: 'SPF'}
};

export default tabs;