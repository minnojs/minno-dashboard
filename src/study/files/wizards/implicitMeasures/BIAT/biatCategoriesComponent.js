import elementComponent from './biatElementComponent.js';
import {clone, resetClearButtons, showClearOrReset, showRestrictions} from '../resources/utilities.js';
import messages from '../../../../../utils/messagesComponent';

let categoriesComponent = {
    controller:controller,
    view:view
};

function controller(settings, defaultSettings, clearElement){
    let categories = settings.categories;
    categories.forEach(element => { //adding a random key for each category
        element.key = Math.random();
    });
    let headlines = ['First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth'];
    let chooseFlag = m.prop(false);
    let chosenCategoriesList = m.prop([]);
    let chooseClicked = m.prop(false);
    let curr_tab = m.prop(0);

    return {reset, clear, chooseFlag, unChooseCategories,categories, headlines, addCategory, chosenCategoriesList,
        updateChosenBlocks, showRemoveCategories, chooseCategories, curr_tab, getDefaultValues};

    function clear(curr_tab){showClearOrReset(categories[curr_tab], clearElement[0], 'clear');}
    function reset(curr_tab){showClearOrReset(categories[curr_tab], defaultSettings.categories[curr_tab], 'reset');
    }
    function addCategory() {
        categories.push(clone(clearElement[0]));
        let last = categories.length - 1;
        categories[last].key = Math.random();
    }
    function updateChosenBlocks(e, index){
        //if clicked the checkbox to uncheck the item
        if (chosenCategoriesList().includes(index) && !e.target.checked){
            let i = chosenCategoriesList().indexOf(index);
            if (i !== -1) chosenCategoriesList().splice(i, 1);
            return;
        }
        if (e.target.checked) chosenCategoriesList().push(index);
    }
    function unChooseCategories(){
        chooseFlag(false);
        chosenCategoriesList().length = 0;
    }
    function chooseCategories(){
        if(categories.length < 3){
            showRestrictions('error','It\'s not possible to remove categories because there must be at least 2 categories.','Error');
            return;
        }
        chooseFlag(true);
        if (!chooseClicked()) { //show the info msg only for the first time the choose button has been clicked
            showRestrictions('info','To choose categories to remove, please tik the checkbox near the wanted category, and to remove them click the \'Remove Chosen Categories\' button.', 'Choose categories to remove');
            chooseClicked(true);
        }
    }
    function showRemoveCategories(){
        if ((categories.length - chosenCategoriesList().length) < 2){
            showRestrictions('error','Minimum number of categories needs to be 2, please choose less categories to remove', 'Error Removing Chosen Categories');
            return;
        }
        return messages.confirm({header: 'Are you sure?', content:
                m('', 'This action is permanent')})
            .then(response => {
                if (response) {
                    removeCategories();
                    m.redraw();
                }
                else {
                    chosenCategoriesList().length = 0;
                    chooseFlag(false);
                    m.redraw();
                }
            }).catch(error => messages.alert({header: 'Error in removing categories' , content: m('p.alert.alert-danger', error.message)}))
            .then(m.redraw());

        function removeCategories(){
            chosenCategoriesList().sort();
            for (let i = chosenCategoriesList().length - 1; i >=0; i--)
                categories.splice(chosenCategoriesList()[i],1);

            chosenCategoriesList().length = 0;
            chooseFlag(false);
            curr_tab(categories.length - 1);
        }
    }

    function getDefaultValues(){
        let stimulusMedia = null;
        let startStimulus = null;
        if(curr_tab() < 2){
            stimulusMedia = defaultSettings.categories[curr_tab()].stimulusMedia;
            startStimulus = defaultSettings.categories[curr_tab()].title.startStimulus;
        }
        return [stimulusMedia, startStimulus];
    }
}

function view(ctrl,settings) {
    return m('.space',[
        m('.row',[
            m('.col-md-12',
                m('.subtab', ctrl.categories.map(function(tab, index){
                    return m('button',{
                        class: ctrl.curr_tab() === index ? 'active' : '',
                        onclick:function(){
                            ctrl.curr_tab(index);
                        }}, ctrl.headlines[index] + ' Category ',
                    !ctrl.chooseFlag() ? '' :
                        m('input[type=checkbox].space', {checked : ctrl.chosenCategoriesList().includes(index), onclick: (e) => ctrl.updateChosenBlocks(e, index)}));
                }))
            )
        ]),
        m('.row.space',[
            m('.col-md-9',
                m('.btn-group btn-group-toggle', [
                    ctrl.categories.length > 7 ? '' :
                        m('button.btn btn btn-info',{title:'You can add up to 8 categories',onclick: ctrl.addCategory}, [m('i.fa.fa-plus')],' Add Category'),
                    !ctrl.chooseFlag() ?
                        m('button.btn btn btn-secondary',{onclick: ctrl.chooseCategories},[
                            m('i.fa.fa-check'), ' Choose Categories to Remove'])
                        : m('button.btn btn btn-warning',{onclick: ctrl.unChooseCategories},[
                            m('i.fa.fa-minus-circle'), ' Un-Choose Categories to Remove']),
                    !ctrl.chosenCategoriesList().length ? '' :
                        m('button.btn btn btn-danger',{onclick: ctrl.showRemoveCategories},[
                            m('i.fa.fa-eraser'), ' Remove Chosen Categories'])

                ])
            )
        ]),
        m('div',{key:ctrl.categories[ctrl.curr_tab()].key},
            m.component(elementComponent, {key:'categories'}, settings, ctrl.getDefaultValues()[0], ctrl.getDefaultValues()[1], ctrl.curr_tab())),
        m('hr'),
        resetClearButtons(ctrl.reset, ctrl.clear, ctrl.curr_tab(), true)
    ]);
}

export default categoriesComponent;

