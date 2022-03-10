import {clone, resetClearButtons, showRestrictions} from '../resources/utilities';
import messages from '../../../../../utils/messagesComponent';

let blocksComponent = {
    controller:controller,
    view:view
};

function controller(settings, defaultSettings, rows){
    let blocks = settings.trialsByBlock;
    let chooseFlag = m.prop(false);
    let chosenBlocksList = m.prop([]);
    let chooseClicked = m.prop(false);
    let clearBlock = rows.slice(-1)[0];
    
    return {showReset, showClear, set, get, blocks, getParameters, setParameters, unChooseCategories,
        chooseFlag, addBlock, showRemoveBlocks, chosenBlocksList, updateChosenBlocks, chooseBlocks, rows};

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
            Object.assign(blocks, clone(defaultSettings.trialsByBlock));
            if(blocks.length > 5){
                blocks.length = 5;
            }
            settings.switchSideBlock = defaultSettings.switchSideBlock;
            settings.blockOrder = defaultSettings.blockOrder;
            chosenBlocksList().length = 0;
        }
    }
    function showClear(){
        beforeClearReset('clear', clear);
        function clear(){
            blocks.forEach(element => {
                element.instHTML = '';
                element.miniBlocks = 0;
                element.singleAttTrials = 0;
                element.sharedAttTrials = 0;
                element.categoryTrials = 0;
            });
            settings.switchSideBlock = 0;
            settings.blockOrder = defaultSettings.blockOrder;
        }
    }

    function get(name, index){ return blocks[index][name]; }
    function set(name, index, type){ 
        if (type === 'text') return function(value){return blocks[index][name] = value; };
        return function(value){return blocks[index][name] = Math.abs(Math.round(value));};
    }
    function getParameters(name){return settings[name]; }
    function setParameters(name, type){
        if (type === 'select') return function(value){return settings[name] = value; };
        return function(value){return settings[name] = Math.abs(Math.round(value));};
    }
    function unChooseCategories(){
        chooseFlag(false);
        chosenBlocksList().length = 0;
    }
    function updateChosenBlocks(e, index){
        if (chosenBlocksList().includes(index) && !e.target.checked){
            let i = chosenBlocksList().indexOf(index);
            if (i !== -1) {
                chosenBlocksList().splice(i, 1);
            }
            return;
        } 
        if (e.target.checked) chosenBlocksList().push(index);
    }
    function chooseBlocks(){
        if (blocks.length < 4) {
            showRestrictions('error','It\'s not possible to remove blocks because there must be at least 3 blocks.', 'Error in Removing Chosen Blocks');
            return;
        }
        chooseFlag(true);
        if(!chooseClicked()){  //show info message only for the first time the choose button has been clicked
            showRestrictions('info', 'To choose blocks to remove, please tik the checkbox near the wanted block, and to remove them click the \'Remove Chosen Blocks\' button.', 'Choose Blocks to Remove');
            chooseClicked(true);
        }
    }
    function addBlock(){
        blocks.push(clone(clearBlock));
        blocks.slice(-1)[0]['block'] = blocks.length;
    }
    function showRemoveBlocks(){
        if ((blocks.length - chosenBlocksList().length) < 3){
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
                blocks.splice(chosenBlocksList()[i],1);
            
            for (let i = 0; i < blocks.length; i++) 
                blocks[i]['block'] = i+1;
            
            chosenBlocksList().length = 0;
            chooseFlag(true);
        }
    }
}

function view(ctrl){
    return m('.space' , [
        ctrl.rows.slice(0,2).map(function(row) {
            return m('.row.line', [
                m('.col-md-3',[
                    m('span', [' ', row.label, ' ']),
                    m('i.fa.fa-info-circle.text-muted',{
                        title:row.desc
                    })
                ]),
                row.options ?
                    m('.col-md-2',
                        m('select.form-control',{value: ctrl.getParameters(row.name), onchange:m.withAttr('value',ctrl.setParameters(row.name, 'select'))},[
                            row.options.map(function(option){return m('option', option);})])
                    )
                    : m('.col-md-2.col-lg-1',
                        m('input[type=number].form-control',{placeholder:'0', value: ctrl.getParameters(row.name), onchange:m.withAttr('value',ctrl.setParameters(row.name)), min:0})
                    )
            ]);
        }),
        ctrl.blocks.map(function(block) {
            let index = ctrl.blocks.indexOf(block);
            return m('.row.line', [
                m('.col-md-3',[
                    !ctrl.chooseFlag() ? ' ' :
                        m('input[type=checkbox]', {checked : ctrl.chosenBlocksList().includes(index), onclick: (e) => ctrl.updateChosenBlocks(e, index)}),
                    m('span', [' ','Block '+parseInt(index+1), ' ']),
                    index !== 0 ? ' ' :
                        m('i.fa.fa-info-circle.text-muted', {
                            title:'By default, this is the practice block that shows only the attributes and not the category. ' +
                            'Because of that, the number of category trials is 0. ' +
                            'You can change that if you want.'
                        }),
                ]),
                m('.col-md-9',[
                    ctrl.rows.slice(2,-1).map(function(row) {
                        return m('.row.space', [
                            m('.col-md-5.space',[
                                m('span', [' ', row.label, ' ']),
                                m('i.fa.fa-info-circle.text-muted',{
                                    title:row.desc
                                }),
                            ]),
                            row.name === 'instHTML' ?
                                m('.col-md-5', [
                                    m('textarea.form-control',{rows:5, oninput: m.withAttr('value', ctrl.set(row.name, index, 'text')), value: ctrl.get(row.name, index)})
                                ]) :
                                m('.col-md-3.col-lg-2',
                                    m('input[type=number].form-control',{placeholder:'0', onchange: m.withAttr('value', ctrl.set(row.name, index,'number')), value: ctrl.get(row.name, index), min:0})
                                )
                        ]);
                    })
                ])
            ]);
        }),
        m('.row.space',
            m('.col-sm-8',
                m('.btn-group btn-group-toggle', [
                    ctrl.blocks.length > 29 ? '' : //limit number of blocks to 30
                        m('button.btn btn btn-info',{onclick: ctrl.addBlock},
                            m('i.fa.fa-plus'),' Add Block'),
                    !ctrl.chooseFlag() ?
                        m('button.btn btn btn-warning',{onclick: ctrl.chooseBlocks},
                            m('i.fa.fa-check'), ' Choose Blocks to Remove')
                        : m('button.btn btn btn-warning',{onclick: ctrl.unChooseCategories},[
                            m('i.fa.fa-minus-circle'), ' Un-Choose Categories to Remove']),
                    !ctrl.chosenBlocksList().length ? '' :
                        m('button.btn btn btn-danger',{onclick: ctrl.showRemoveBlocks, disabled: !ctrl.chosenBlocksList().length},
                            m('i.fa.fa-minus-square'), ' Remove Chosen Blocks')
                ])
            )
        ), resetClearButtons(ctrl.showReset, ctrl.showClear)
    ]);
}

export default blocksComponent;

