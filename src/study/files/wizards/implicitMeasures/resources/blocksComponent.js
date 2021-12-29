import {resetClearButtons, showClearOrReset} from './utilities.js';

let blocksComponent = {
    controller:controller,
    view:view
};

function controller(settings, defaultSettings, rows){
    let blocks = settings.blocks;
    return {set, get, rows:rows.slice(0,-1), reset, clear};

    function reset(){showClearOrReset(blocks, defaultSettings.blocks, 'reset');}
    function clear(){showClearOrReset(blocks, rows.slice(-1)[0], 'clear');}
    function get(name){return blocks[name];}
    function set(name, type){
        if (type === 'number') return function(value){return blocks[name] = Math.abs(Math.round(value));};
        return function(value){return blocks[name] = value;};
    }
}
function view(ctrl, settings){
    return m('.space' , [
        //create numbers inputs
        ctrl.rows.map(function(row){
            //if user chooses not to have a practice block set its parameter to 0
            if (row.name === 'nPracticeBlockTrials' && settings.parameters.practiceBlock === false) {
                settings.blocks.nPracticeBlockTrials = 0;
                return;
            }
            return m('.row.line', [
                m('.col-md-4',
                    row.desc ?
                        [
                            m('span', [' ', row.label, ' ']),
                            m('i.fa.fa-info-circle.text-muted',{title:row.desc})
                        ]
                        : m('span', [' ', row.label])
                ),
                m('.col-md-4.col-lg-2',
                    row.options ?
                        m('select.form-control',{value: ctrl.get(row.name), onchange:m.withAttr('value',ctrl.set(row.name))},[
                            row.options.map(function(option){return m('option', option);})
                        ])
                        : row.name.includes('random') ?
                            m('input[type=checkbox]', {onclick: m.withAttr('checked', ctrl.set(row.name,'checkbox')), checked: ctrl.get(row.name)})
                            : m('input[type=number].form-control',{placeholder:'0', onchange: m.withAttr('value', ctrl.set(row.name, 'number')), value: ctrl.get(row.name), min:0})
                )
            ]);
        }), resetClearButtons(ctrl.reset, ctrl.clear)
    ]);
}

export default blocksComponent;
