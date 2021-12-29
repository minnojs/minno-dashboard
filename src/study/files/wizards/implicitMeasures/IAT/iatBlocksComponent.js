import {showClearOrReset, resetClearButtons} from '../resources/utilities.js';

let iatBlocksComponent = {
    controller:controller,
    view:view
};

function controller(settings, defaultSettings, rows){
    let blocks = settings.blocks;
    return {reset, clear, set, get, rows};

    function reset(){showClearOrReset(blocks, defaultSettings.blocks,'reset');}
    function clear(){showClearOrReset(blocks, rows.slice(-1)[0],'clear');}

    function get(name){ return blocks[name]; }
    function set(name, type){
        if (type === 'checkbox') return function(value){return blocks[name] = value; };
        return function(value) {return blocks[name] = Math.abs(Math.round(value));};
    }
}

function view(ctrl){
    return m('.col-12',[
        m('.row',[
            m('.col-md-8',
                ctrl.rows.slice(0,-1).map(function(row) {
                    return m('.row.line', [
                        m('.col-sm-4.space',[
                            m('span', [' ', row.label, ' ']),
                            m('i.fa.fa-info-circle.text-muted',{
                                title:row.desc
                            }),
                        ]),
                        m('.col-sm-8.space',
                            row.name ?  //case of randomBlockOrder & randomAttSide
                                m('input[type=checkbox]', {onclick: m.withAttr('checked', ctrl.set(row.name,'checkbox')), checked: ctrl.get(row.name)})
                                : [
                                    m('.row', [
                                        m('.col-sm-6', 'Number of trials: '),
                                        m('.col-sm-4', [
                                            m('input[type=number].form-control',{placeholder:'0', onchange: m.withAttr('value', ctrl.set(row.numTrialBlocks, 'number')), value: ctrl.get(row.numTrialBlocks), min:'0'})
                                        ])
                                    ]),
                                    m('.row.space',[
                                        m('.col-sm-6', 'Number of mini-blocks: '),
                                        m('.col-sm-4', [
                                            m('input[type=number].form-control',{placeholder:'0', onchange: m.withAttr('value', ctrl.set(row.numMiniBlocks, 'number')), value: ctrl.get(row.numMiniBlocks), min:'0'})
                                        ])
                                    ])
                                ]
                        )
                    ]);
                }
                )),
            m('.col-md-4.double_space',
                m('.alert.alert-info',[
                    m('h4','More information:'),
                    m('p','By default, we separate each block into mini-blocks of four trials. In Blocks 3, 4, 6, and 7, '+
                                    'exactly one item from each of the four groups (attributes and categories) appears in each mini-block. In Blocks 1, 2, and 5, '+
                                    'two trials of each group (category or attribute) will appear in each mini-block. Tony Greenwald recommended using that feature, '+
                                    'to avoid same-key runs, based on internal testing in his lab. In Project Implicit, our tests so far found no effect of this feature on the validity of any IAT.'+
                                    ' To cancel this feature, set Number of mini-blocks to 1, in each block.'),
                    m('hr'),
                    m('p','To cancel a block, set the number of trials to 0 (useful for 5-blocks IATs).')
                ])
            )
        ]),
        m('.row',resetClearButtons(ctrl.reset, ctrl.clear))
    ]);
}


export default iatBlocksComponent;

