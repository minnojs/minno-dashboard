import {clone, showRestrictions} from './utilities.js';

let elementComponent = {
    controller:controller,
    view:view,
};

function controller(object, settings, stimuliList){
    let element = settings[object.key];
    let fields = {
        newStimulus : m.prop(''),
        elementType: m.prop(object.key.includes('attribute') ? 'Attribute' : 'Category'),
        titleType: m.prop(element.title.media.word === undefined ? 'image' : 'word'),
        titleHidden: m.prop(this.titleType === 'word'), //weather the category design flag will be visible
        selectedStimuli: m.prop(''),
        stimuliHidden: m.prop(true),
    }; 
    return {fields, set, get, addStimulus, updateSelectedStimuli,removeChosenStimuli, removeAllStimuli,
        updateTitleType, resetStimuliList};
    
    function get(name, media ,type){
        if (name === 'title' && media == null && type == null) { //special case - return the title's value (word/image)
            if (element.title.media.word === undefined) return element.title.media.image;
            return element.title.media.word;
        }
        if (media !=null && type!=null) {
            if (type === 'font-size') {
                return parseFloat((element[name][media][type].replace('em','')));
            }
            return element[name][media][type];
        }
        else if (media ==='color') //case of stimulusCss
            return element[name][media];
        else if (media === 'font-size') return parseFloat((element[name][media]).substring(0,3));
        return element[name]; 
    }
    function set(name, media, type){
        return function(value){ 
            if (media !=null && type!=null) {
                if (type === 'font-size') {
                    value = Math.abs(value);
                    if (value === 0) {
                        showRestrictions('error', 'Font\'s size must be bigger than 0', 'Error');
                        return element[name][media][type]; 
                    }
                    return element[name][media][type] = value + 'em';
                }
                return element[name][media][type] = value;
            }
            else if (media === 'color') return element[name][media] = value;
            else if (media === 'font-size') {
                value = Math.abs(value);
                if (value === 0) {
                    showRestrictions('error','Font\'s size must be bigger than 0', 'Error');
                    return element[name][media];
                }
                return element[name][media] = value + 'em';
            }
            return element[name] = value; 
        };
    }

    function updateTitleType() {
        return function (type) {
            fields.titleType(type);
            let object = element.title.media;
            let category = object.word !== undefined ? object.word : object.image;
            if (type === 'word') {
                element.title.media = {};
                element.title.media = {word: category};
            }
            else {
                element.title.media = {};
                element.title.media = {image: category};
            }
        };
    }
    function addStimulus(event){
        let new_stimuli = fields.newStimulus();
        event = event.target.id; //button name, to know the kind of the stimulus added
        element.stimulusMedia.push( (event === 'addWord') ? {word : new_stimuli} : {image : new_stimuli});
        fields.newStimulus(''); //reset the field               
    }
    function updateSelectedStimuli(select){
        let list = element.stimulusMedia.filter((val,i) => select.target.options[i].selected);
        fields.selectedStimuli(list);
    }

    function removeChosenStimuli() {
        element.stimulusMedia = element.stimulusMedia.filter((element)=>!fields.selectedStimuli().includes(element));
        fields.selectedStimuli([]);
    }

    function removeAllStimuli() {element.stimulusMedia.length = 0;}
    function resetStimuliList() {element.stimulusMedia = clone(stimuliList);}
}

function view(ctrl) {
    return m('.space', [
        m('.row.line', [
            m('.col-sm-3',[
                m('span', ctrl.fields.elementType()+' name logged in the data file '),
                m('i.fa.fa-info-circle.text-muted',{title:'Will appear in the data and in the default feedback message.'})
            ]),
            m('.col-sm-3', m('input[type=text].form-control',{value:ctrl.get('name'), oninput: m.withAttr('value', ctrl.set('name'))})),
        ]),
        m('.row.line', [
            m('.col-sm-3',[
                m('span', ctrl.fields.elementType()+' name presented in the task '),
                m('i.fa.fa-info-circle.text-muted',{title:'Name of the ' +ctrl.fields.elementType()+' presented in the task'}),
            ]),
            m('.col-sm-3', [
                m('input[type=text].form-control',{value: ctrl.get('title'), oninput:m.withAttr('value', ctrl.set('title', 'media', ctrl.fields.titleType()))}),
            ]),
            m('.col-sm-3',
                m('.row',[
                    m('.col-sm-5',m('span', 'Category\'s Type:')),
                    m('.col-sm-7',[
                        m('select.custom-select',{value: ctrl.get('title','media','word') === undefined ? 'image' : 'word', onchange:m.withAttr('value',ctrl.updateTitleType())},[
                            ctrl.fields.titleType(ctrl.get('title','media','word') === undefined ? 'image' : 'word'),
                            ctrl.fields.titleHidden(ctrl.fields.titleType() === 'word'),
                            m('option', 'word'),
                            m('option', 'image')
                        ])
                    ])
                ])
            ),
            !ctrl.fields.titleHidden() ? '' :
                m('.col-sm-3',[
                    m('.row',[
                        m('.col-sm-5',[
                            m('span', 'Font\'s color:'),
                        ]),
                        m('.col-sm-6',[
                            m('input[type=color].form-control',{value: ctrl.get('title','css','color'), onchange:m.withAttr('value', ctrl.set('title','css','color'))})
                        ])
                    ]),
                    m('.row.space',[
                        m('.col-sm-5',[
                            m('span', 'Font\'s size:'),
                        ]),
                        m('.col-sm-6',[
                            m('input[type=number].form-control', {placeholder:'1', value:ctrl.get('title','css','font-size') ,min: '0' ,onchange:m.withAttr('value', ctrl.set('title','css','font-size'))})
                        ])
                    ])
                ])
        ]),
        m('.row',[
            m('.col-md-6',[
                m('.row',
                    m('.col-md-6',
                        m('p.h4','Stimuli: ', m('i.fa.fa-info-circle.text-muted',{
                            title:'Enter text (word) or image name with its file extension (image).\nSet the path to the folder of images in the General Parameters page.'})
                        ))
                ),
                m('.row',
                    m('.col-md-7',
                        m('input[type=text].form-control', {placeholder:'Enter Stimulus content here', 'aria-label':'Enter Stimulus content', 'aria-describedby':'basic-addon2', value: ctrl.fields.newStimulus(), oninput: m.withAttr('value', ctrl.fields.newStimulus)}
                        ))
                ),
                m('.row',
                    m('.col-md-9',
                        m('.btn-group btn-group-toggle', [
                            m('button[type=button].btn btn-secondary',{disabled:!ctrl.fields.newStimulus().length, id:'addWord', onclick: (e) => ctrl.addStimulus(e)},[
                                m('i.fa.fa-plus'), 'Add Word'
                            ]),
                            m('button[type=button].btn btn-secondary', {disabled:!ctrl.fields.newStimulus().length, id:'addImage', onclick: (e) => ctrl.addStimulus(e)},[
                                m('i.fa.fa-plus'), 'Add Image'
                            ])
                        ])
                    )
                ),
                m('.row',[
                    m('.col-md-7',
                        m('select.form-control.scroll', {multiple : 'multiple', size : '8' ,onchange:(e) => ctrl.updateSelectedStimuli(e)},[
                            ctrl.get('stimulusMedia').some(object => object.word) ? ctrl.fields.stimuliHidden(true) : ctrl.fields.stimuliHidden(false),
                            ctrl.get('stimulusMedia').map(function(object){
                                let value = object.word ? object.word : object.image;
                                let option = value + (object.word ? ' [Word]' : ' [Image]');
                                return m('option', {value:value, selected : ctrl.fields.selectedStimuli().includes(object)}, option);
                            })
                        ])
                    ),
                    m('.col-md-5',
                        !ctrl.fields.stimuliHidden() ? '' :
                            [
                                m('.row',
                                    m('.col-md-8',[
                                        m('u','Stimuli font\'s design:'),
                                    ])
                                ),
                                m('.row.space',
                                    m('.col-md-8',[
                                        m('label','Font\'s color: '),
                                        m('input[type=color].form-control', {value: ctrl.get('stimulusCss','color'), onchange: m.withAttr('value', ctrl.set('stimulusCss','color'))}),
                                    ])

                                ),
                                m('.row.space',
                                    m('.col-md-8',[

                                        m('label', 'Font\'s size:'),
                                        m('input[type=number].form-control', {placeholder:'1', value:ctrl.get('stimulusCss','font-size') ,min: '0' ,onchange: m.withAttr('value', ctrl.set('stimulusCss','font-size'))})
                                    ])
                                )
                            ]
                    )
                ])
            ])
        ]),
        m('.row',
            m('.col-md-6.space',
                m('.btn-group-vertical',[
                    m('button.btn btn btn-warning', {title:'To select multiple stimuli, please press the ctrl key while selecting the desired stimuli', disabled: !ctrl.fields.selectedStimuli().length, onclick: () => ctrl.removeChosenStimuli()},'Remove Chosen Stimuli'),
                    m('button.btn btn btn-warning', {onclick: () => ctrl.removeAllStimuli()},'Remove All Stimuli'),
                    m('button.btn btn btn-warning', {onclick: () => ctrl.resetStimuliList()},'Reset Stimuli List'),
                ])
            )
        )
    ]);
}

export default elementComponent;

