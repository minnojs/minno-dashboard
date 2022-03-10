import {clone, resetClearButtons, showClearOrReset, showRestrictions} from '../resources/utilities.js';
import messages from '../../../../../utils/messagesComponent';

let blocksComponent = {
    controller:controller,
    view:view
};
const deafaultNumOfTrials = 40;
function controller(settings, defaultSettings, rows){
    let blocks = settings.blocks;
    let trialsInBlock = blocks.trialsInBlock;
    let chooseFlag = m.prop(false);
    let chosenBlocksList = m.prop([]);
    let chooseClicked = m.prop(false);
    return {trialsInBlock, set, get, rows, showReset, showClear,
        chooseFlag, chosenBlocksList, chooseClicked, unChooseCategories,
        chooseBlocks, addBlock, updateChosenBlocks, showRemoveBlocks};

    function beforeClearReset(action, func){
        let msg_text = {
            'reset':{text:'This will delete all current properties and reset them to default values.',title:'Reset?'},
            'clear':{text: 'This will delete all current properties.', title: 'Clear?'}
        };
        return messages.confirm({header: msg_text[action].title, content:
                m('strong', msg_text[action].text)})
            .then(response => {
                if (response) {
                    func();
                    m.redraw();
                }
            }).catch(error => messages.alert({header: msg_text[action].title , content: m('p.alert.alert-danger', error.message)}))
            .then(m.redraw());

    }
    function showReset(){
        beforeClearReset('reset', reset);
        function reset(){
            trialsInBlock.length = 3;
            Object.assign(blocks.trialsInBlock, clone(defaultSettings.blocks.trialsInBlock));
            blocks.trialsInExample = defaultSettings.blocks.trialsInExample;
            chosenBlocksList().length = 0;
        }
    }
    function showClear(){
        beforeClearReset('clear', clear);
        function clear(){
            for (let i = 0; i < trialsInBlock.length; i++) trialsInBlock[i] = 0;
            settings.blocks.trialsInExample = 0;
        }
    }
    function get(name, index){
        if(name === 'trialsInBlock')
            return trialsInBlock[index];
        return blocks[name];
    }
    function set(name, index){
        if(name === 'trialsInBlock')
            return function(value){return trialsInBlock[index] = Math.abs(Math.round(value));};
        return function(value){return blocks[name] = value;};
    }
    function updateChosenBlocks(e, index){
        if (chosenBlocksList().includes(index) && !e.target.checked){
            let i = chosenBlocksList().indexOf(index);
            if (i !== -1)
                chosenBlocksList().splice(i, 1);
            return;
        }
        if (e.target.checked) chosenBlocksList().push(index);
    }
    function chooseBlocks(){
        if (blocks.length < 2) {
            showRestrictions('It\'s not possible to remove more blocks because there must be at least one block.', 'error');
            return;
        }
        chooseFlag(true);
        if(!chooseClicked()){  //show info message only for the first time the choose button has been clicked
            showRestrictions('To choose blocks to remove, please tik the checkbox near the wanted block, and to remove them click the \'Remove Choosen Blocks\' button.','info');
            chooseClicked(true);
        }
    }
    function addBlock(){
        trialsInBlock.push(deafaultNumOfTrials);
    }
    function unChooseCategories(){
        chooseFlag(false);
        chosenBlocksList().length = 0;
    }
    function showRemoveBlocks(){
        if ((trialsInBlock.length - chosenBlocksList().length) < 1){
            showRestrictions('error','Minimum number of blocks needs to be 3, please choose less blocks to remove','Error in Removing Chosen Blocks');
            return;
        }
        return messages.confirm({header: 'Are you sure?', content:
                m('strong', 'This action is permanent')})
            .then(response => {
                if (response) {
                    removeBlocks();
                    m.redraw();
                }
                else {
                    chosenBlocksList().length = 0;
                    chooseFlag(false);
                    m.redraw();
                }
            }).catch((error) => {showRestrictions('error', 'Something went wrong on the page!\n'+error, 'Oops!');})
            .then(m.redraw());

        function removeBlocks(){

            chosenBlocksList().sort();
            for (let i = chosenBlocksList().length - 1; i >=0; i--)
                trialsInBlock.splice(chosenBlocksList()[i],1);

            chosenBlocksList().length = 0;
            chooseFlag(false);
        }
    }
}
function view(ctrl){
    return m('.space' , [
        m('.row.line', [
            m('.col-md-3',
                m('span', [' ', 'Trials In Example Block', ' ']),
                m('i.fa.fa-info-circle.text-muted',{title:'Change to 0 if you don\'t want an example block'})
            ),
            m('.col-md-3.col-lg-2',
                m('input[type=number].form-control',{onchange: m.withAttr('value', ctrl.set('trialsInExample')), value: ctrl.get('trialsInExample'), min:0}))
        ]),
        m('.row.double_space',
            m('.col-md-5',
                m('p.h5', 'Number of Trials in Each Block: ', m('i.fa.fa-info-circle.text-muted',{
                    title:'Here you can set the number of trials in each block.\nBelow you can add add additional blocks.'}
                ))
            )
        ),
        ctrl.trialsInBlock.map(function(block, index) {
            return m('.row.space', [
                m('.col-md-3',[
                    !ctrl.chooseFlag() ? ' ' :
                        m('input[type=checkbox]', {checked : ctrl.chosenBlocksList().includes(index), onclick: (e) => ctrl.updateChosenBlocks(e, index)}),
                    m('span', [' ','Block '+parseInt(index+1)])
                ]),
                m('.col-md-3.col-lg-2',
                    m('input[type=number].form-control',{onchange: m.withAttr('value', ctrl.set('trialsInBlock', index)), value: ctrl.get('trialsInBlock', index), min:0})
                )
            ]);
        }),
        m('.row.space',
            m('.col-md-9',
                m('.btn-group btn-group-toggle',[
                    m('button.btn btn btn-info',{onclick: ctrl.addBlock}, 
                        m('i.fa.fa-plus'),' Add Block'),
                    !ctrl.chooseFlag() ?
                        m('button.btn btn btn-warning',{onclick: ctrl.chooseBlocks},
                            m('i.fa.fa-check'), ' Choose Blocks to Remove')
                        : m('button.btn btn btn-warning',{onclick: ctrl.unChooseCategories},[
                            m('i.fa.fa-minus-circle'), ' Un-Choose Categories to Remove']),
                    !ctrl.chosenBlocksList().length ? '' :
                        m('button.btn btn btn-danger',{onclick: ctrl.showRemoveBlocks, disabled: !ctrl.chosenBlocksList().length},
                            m('i.fa.fa-minus-square'), ' Remove Chosen Blocks'),
                ])
            )
        ), resetClearButtons(ctrl.showReset, ctrl.showClear)
    ]);
}

export default blocksComponent;