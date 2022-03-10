import {
    showClearOrReset,
    showRestrictions,
    editStimulusObject,
    clone,
    resetClearButtons
} from '../resources/utilities.js';

let exampleComponent = {
    controller:controller,
    view:view
};

function controller(settings, defaultSettings, exampleParameters){
    let exampleBlock = settings.exampleBlock;
    let element = settings.exampleBlock.examplePrimeStimulus;
    let stimuliList = defaultSettings.exampleBlock.examplePrimeStimulus.mediaArray;
    let fields = {
        newStimulus : m.prop(''),
        selectedStimuli: m.prop(''),
    };
    return {fields, reset, clear, set, get, exampleParameters,
        addStimulus, updateSelectedStimuli, removeChosenStimuli, removeAllStimuli, resetStimuliList};

    function reset(){showClearOrReset(exampleBlock, defaultSettings.exampleBlock, 'reset');}
    function clear(){showClearOrReset(exampleBlock, exampleParameters.slice(-1)[0],'clear');}

    function get(name, object, parameter){
        if(object && parameter){
            if (parameter === 'font-size')
                return parseFloat((exampleBlock[name][object][parameter].replace('em','')));
            return exampleBlock[name][object][parameter];
        }
        if(name && object) return exampleBlock[name][object];
        return exampleBlock[name];
    }
    function set(name, object, parameter){
        return function(value){
            if(name.includes('Duration')) return exampleBlock[name] = Math.abs(value);
            if(object && parameter) {
                if (parameter === 'font-size'){
                    value = Math.abs(value);
                    if (value === 0){
                        showRestrictions('Font\'s size must be bigger than 0.', 'error');
                        return exampleBlock[name][object][parameter];
                    }
                    return exampleBlock[name][object][parameter] = value + 'em';
                }
                return exampleBlock[name][object][parameter] = value;
            }
            if(name && object) return exampleBlock[name][object] = value;
            return exampleBlock[name] = value;
        };
    }
    function addStimulus(event){
        let new_stimuli = fields.newStimulus();
        event = event.target.id; //button name, to know the kind of the stimulus added
        element.mediaArray.push( (event === 'addWord') ? {word : new_stimuli} : {image : new_stimuli});
        fields.newStimulus(''); //reset the field
    }
    function updateSelectedStimuli(select){
        let list = element.mediaArray.filter((val,i) => select.target.options[i].selected);
        fields.selectedStimuli(list);
    }

    function removeChosenStimuli(){
        element.mediaArray = element.mediaArray.filter((element)=>!fields.selectedStimuli().includes(element));
        fields.selectedStimuli([]);
    }

    function removeAllStimuli(){element.mediaArray.length = 0;}
    function resetStimuliList(){element.mediaArray = clone(stimuliList);}
}

function view(ctrl){
    return m('.space' , [
        ctrl.exampleParameters.slice(0,-1).map(function(row){
            return m('.row.line', [
                m('.col-md-4',
                    row.desc ?
                        [
                            m('span', [' ', row.label, ' ']),
                            m('i.fa.fa-info-circle.text-muted',{title:row.desc})
                        ]
                        : m('span', [' ', row.label])
                ),
                m('.col-md-3.col-lg-2', m('input[type=number].form-control',{placeholder:'0', onchange: m.withAttr('value', ctrl.set(row.name, 'number')), value: ctrl.get(row.name), min:0}))
            ]);
        }),
        m('.row.space',
            m('.col-md-5',
                m('p.h4','Example Target Stimulus: ',
                    m('i.fa.fa-info-circle.text-muted',{
                        title:'Here you can set the number of trials in each block.\nBelow you can add add additional blocks.'}
                    )
                )
            )
        ),
        m('.row.space.line',[
            m('.col-md-4',[
                m('span', [' ', 'Example Target Stimulus']),
            ]),
            m('.col-md-8',[
                m('.row',[
                    m('.col-sm-5', m('span' ,'Name of target stimulus for logging: ')),
                    m('.col-sm-4', m('input[type=text].form-control', {value:ctrl.get('exampleTargetStimulus', 'nameForLogging') ,onchange:m.withAttr('value', ctrl.set('exampleTargetStimulus', 'nameForLogging'))}))
                ]),
                m('.row.space',[
                    m('.col-sm-5', m('span' ,'Use the same media array as the first Target Category')),
                    m('.col-sm-4', m('input[type=checkbox]', {onclick: m.withAttr('checked', ctrl.set('exampleTargetStimulus', 'sameAsTargets')), checked: ctrl.get('exampleTargetStimulus', 'sameAsTargets')}))
                ])
            ])
        ]),
        m('.row.line',[
            m('.col-md-4','Example Fixation Stimulus'),
            editStimulusObject('exampleFixationStimulus', ctrl.get, ctrl.set)
        ]),
        m('.row.line',[
            m('.col-md-4', 'Example Mask Stimulus'),
            editStimulusObject('exampleMaskStimulus', ctrl.get, ctrl.set)
        ]),
        m('.row.space.line',[
            m('.col-md-4',[
                m('span', [' ', 'Example Prime Stimulus']),
            ]),
            m('.col-md-8',[
                m('.row',[
                    m('.col-sm-5', m('span' ,'Name of prime stimulus for logging: ')),
                    m('.col-sm-4', m('input[type=text].form-control', {value:ctrl.get('examplePrimeStimulus', 'nameForLogging') ,onchange:m.withAttr('value', ctrl.set('examplePrimeStimulus', 'nameForLogging'))}))
                ]),
                m('.row.space',[
                    m('.col-sm-5', 'Media objects for this category'),
                    m('.col-sm-5',
                        m('input[type=text].form-control',
                            {placeholder:'Enter media content here', 'aria-label':'Enter media content', 'aria-describedby':'basic-addon2', value: ctrl.fields.newStimulus(), oninput: m.withAttr('value', ctrl.fields.newStimulus)}),
                        m('.btn-group btn-group-toggle', [
                            m('button[type=button].btn btn-secondary',
                                {disabled:!ctrl.fields.newStimulus().length, id:'addWord', onclick: (e) => ctrl.addStimulus(e)},[
                                    m('i.fa.fa-plus'), 'Add Word'
                                ]),
                            m('button[type=button].btn btn-secondary', {disabled:!ctrl.fields.newStimulus().length, id:'addImage', onclick: (e) => ctrl.addStimulus(e)},[
                                m('i.fa.fa-plus'), 'Add Image'
                            ])
                        ]),
                        m('select.form-control', {multiple : 'multiple', size : '4' ,onchange:(e) => ctrl.updateSelectedStimuli(e)},[
                            ctrl.get('examplePrimeStimulus', 'mediaArray').map(function(object){
                                let value = object.word ? object.word : object.image;
                                let option = value + (object.word ? ' [Word]' : ' [Image]');
                                return m('option', {value:value, selected : ctrl.fields.selectedStimuli().includes(object)}, option);
                            })
                        ]),
                        m('.btn-group-vertical.space',[
                            m('button.btn btn btn-warning', {title:'To select multiple stimuli, please press the ctrl key while selecting the desired stimuli', disabled: !ctrl.fields.selectedStimuli().length, onclick:ctrl.removeChosenStimuli},'Remove Chosen Stimuli'),
                            m('button.btn btn btn-warning', {onclick:ctrl.removeAllStimuli},'Remove All Stimuli'),
                            m('button.btn btn btn-warning', {onclick: ctrl.resetStimuliList},'Reset Stimuli List')
                        ])
                    ),
                ])
            ])
        ]), resetClearButtons(ctrl.reset, ctrl.clear)
    ]);
}

export default exampleComponent;
