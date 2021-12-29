import {clone, showRestrictions} from '../resources/utilities.js';

let elementComponent = {
    controller: controller,
    view: view,
};

function controller(object, settings,stimuliList, startStimulusList ,index){
    let element = settings[object.key];
    if (Array.isArray(element)) element = element[index]; //in case of 'categories' in BIAT
    let fields = {
        newStimulus : m.prop(''),
        elementType: m.prop(object.key.toLowerCase().includes('categor') ? 'Category' : 'Attribute'),
        titleType: m.prop(element.title.media.word === undefined ? 'image' : 'word'),
        titleHidden: m.prop(this.titleType === 'word'), //weather the category design flag will be visible
        selectedStimuli: m.prop(''),
        stimuliHidden: m.prop(true),
        startStimulus: m.prop(settings.parameters.showStimuliWithInst),
        newStartStimulus: m.prop(''), //startStimulus
        startStimuliHidden: m.prop(this.startStimulus),
        selectedStartStimuli: m.prop(''),
        isNewCategory: index > 1 ? m.prop(true) : m.prop(false) //if it's a new category (mot first or second) there won't be an option to reset stimuli lists
    };
    return {fields, set, get, addStimulus, updateSelectedStimuli,removeChosenStimuli, removeAllStimuli,
        updateTitleType, removeChosenStartStimuli, resetStimuliList};
    
    function get(name, media, type, startStimulus){
        if (name === 'title' && media === 'startStimulus' && type === 'media'){ //in case of getting startStimulus stimuli list
            if (element.title.startStimulus.media.word !== undefined)
            {
                if (element.title.startStimulus.media.word === '') return [];
                return element.title.startStimulus.media.word.split(', ');
            }
            else{
                if (element.title.startStimulus.media.image === '') return [];
                return [element.title.startStimulus.media.image];
            }
        }
        if (name === 'title' && !media && !type) //special case - return the title's value (word/image)
        { 
            if (element.title.media.word === undefined) return element.title.media.image;
            return element.title.media.word;
        }
        if (media && type){
            if (type === 'font-size')
                return parseFloat((element[name][media][type].replace('em','')));
            else if (startStimulus){
                if (startStimulus === 'font-size')
                    return parseFloat((element[name][media][type][startStimulus].replace('em','')));
                return element[name][media][type][startStimulus];
            }
            return element[name][media][type];
        }
        else if (media === 'color') //case of stimulusCss
            return element[name][media];
        else if (media === 'font-size') return parseFloat((element[name][media]).substring(0,3));
        return element[name]; 
    }
    function set(name, media, type, startStimulus){
        return function(value){
            if (media && type){
                if (type === 'font-size'){
                    value = Math.abs(value);
                    if (!value){
                        showRestrictions('error','Font\'s size must be bigger than 0.', 'Error');
                        return element[name][media][type];
                    }
                    return element[name][media][type] = value + 'em';
                }
                else if (startStimulus !=null){ //in case of startStimulus
                    if(startStimulus === 'font-size'){
                        value = Math.abs(value);
                        if (!value){
                            showRestrictions('error','Font\'s size must be bigger than 0.', 'Error');
                            return element[name][media][type][startStimulus];
                        }
                        return element[name][media][type][startStimulus] = value + 'em';
                    }
                    return element[name][media][type][startStimulus] = value;
                }
                return element[name][media][type] = value;
            }
            else if (media === 'color') return element[name][media] = value;
            else if (media === 'font-size'){
                value = Math.abs(value);
                if (!value){
                    showRestrictions('error','Font\'s size must be bigger than 0.', 'Error');
                    return element[name][media];
                }
                return element[name][media] = value + 'em';
            }
            return element[name]= value;
        };
    }
    function updateTitleType(){
        return function(type){
            fields.titleType(type);
            let object = element.title.media;
            let category;
            object.word ? category = object.word : category = object.image;
            if (type === 'word'){
                element.title.media = {};
                element.title.media = {word: category};
            }
            else{
                element.title.media = {};
                element.title.media = {image: category};
            }
        };
    }
    function addStimulus(event, startStimulus = false){
        let new_stimuli = !startStimulus ? fields.newStimulus() : fields.newStartStimulus();
        event = event.target.id; //get the button name, to know the kind of the stimulus added
        if (event === 'addWord'){
            if (!startStimulus) element.stimulusMedia.push({word : new_stimuli});
            else{
                let mediaStr;
                if (!element.title.startStimulus.media.word) {
                    removeAllStimuli(event, true);
                    mediaStr = new_stimuli;
                }
                else if (element.title.startStimulus.media.word === '')
                    mediaStr = element.title.startStimulus.media.word + new_stimuli;
                else mediaStr = element.title.startStimulus.media.word +', '+new_stimuli;
                element.title.startStimulus.media = {word : mediaStr};
            }
        }
        else { //addImage
            if (!startStimulus) element.stimulusMedia.push({image : new_stimuli});
            else{
                removeAllStimuli(event, true);
                element.title.startStimulus.media = {image: new_stimuli};
            }
        }
        if (!startStimulus) fields.newStimulus(''); //reset the field
        else fields.newStartStimulus('');
    }

    function updateSelectedStimuli(select, startStimulus = false){
        let list =[];
        if (!startStimulus) {
            list = element.stimulusMedia.filter((val,i) => select.target.options[i].selected);
            fields.selectedStimuli(list);
        }
        else{
            for (let i = 0; i < select.target.options.length; i++)
                if (select.target.options[i].selected) list.push(select.target.options[i].value);
            fields.selectedStartStimuli(list);
        }
    }
    function removeChosenStimuli(){
        element.stimulusMedia = element.stimulusMedia.filter((element)=>!fields.selectedStimuli().includes(element));
        fields.selectedStimuli([]);
    }
    function removeChosenStartStimuli(e){
        let selected = fields.selectedStartStimuli();
        let stimuli = element.title.startStimulus.media;
        if (!stimuli.word) { //in case of a single image
            removeAllStimuli(e, true);
            fields.selectedStartStimuli([]);
            return; 
        }
        else stimuli = element.title.startStimulus.media.word.split(', ');
        let new_str = '';
        for (let i = 0 ; i < stimuli.length; i++){
            if (selected.includes(stimuli[i])){
                if (stimuli.length === 1) new_str = '';
                else if (i === stimuli.length - 1) new_str = new_str.slice(0,-2);
                continue;
            }
            if (stimuli.length === 1) new_str = stimuli[i];
            else if (i === stimuli.length - 1) new_str = new_str + stimuli[i];
            else new_str = new_str + stimuli[i] + ', ';
        }
        element.title.startStimulus.media.word = new_str;
        fields.selectedStartStimuli([]);
    }
    function removeAllStimuli(e,startStimulus = false){
        if (!startStimulus) element.stimulusMedia.length = 0;
        else {
            if (element.title.startStimulus.media.word)
                element.title.startStimulus.media.word = '';
            else element.title.startStimulus.media.image = '';
        }
    }
    function resetStimuliList(e,flag = false){
        flag ? element.title.startStimulus = clone(startStimulusList) : element.stimulusMedia = clone(stimuliList);
    }
}

function view(ctrl) {
    return m('.space', [
        m('.row.line', [
            m('.col-md-4',[
                m('span', ctrl.fields.elementType()+' name logged in the data file '),
                m('i.fa.fa-info-circle.text-muted',{title:'Will appear in the data and in the default feedback message.'})
            ]),
            m('.col-md-4', [
                m('input[type=text].form-control',{value:ctrl.get('name'), oninput:m.withAttr('value', ctrl.set('name'))})
            ])
        ]),
        m('.row.line', [
            m('.col-md-4',[
                m('span', ctrl.fields.elementType()+' name presented in the task '),
                m('i.fa.fa-info-circle.text-muted',{title:'Name of the ' +ctrl.fields.elementType()+' presented in the task'}),
            ]),
            m('.col-md-4', [
                m('input[type=text].form-control',{value: ctrl.get('title'), oninput:m.withAttr('value', ctrl.set('title', 'media', ctrl.fields.titleType()))}),
                m('select.custom-select',{value: ctrl.get('title','media','word') === undefined ? 'image' : 'word', onchange:m.withAttr('value',ctrl.updateTitleType())},[
                    ctrl.fields.titleType(ctrl.get('title','media','word') === undefined ? 'image' : 'word'),
                    ctrl.fields.titleHidden(ctrl.fields.titleType() === 'word'),
                    m('option', 'word'),
                    m('option', 'image')
                ])
            ]),
            !ctrl.fields.titleHidden() ? '' :
                m('.col-md-4',[
                    m('.row',[
                        m('.col-sm-4',[
                            m('span', 'Font\'s color: '),
                            m('input[type=color].form-control',{value: ctrl.get('title','css','color'), onchange:m.withAttr('value', ctrl.set('title','css','color'))})
                        ]),
                        m('.col-sm-4',[
                            m('span', 'Font\'s size: '),
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
                            title:'Enter text (word) or image name (image). Set the path to the folder of images in the General Parameters page'
                        }))
                    )
                ),
                m('.row',
                    m('.col-md-6',
                        m('input[type=text].form-control', {placeholder:'Enter Stimulus content here', 'aria-label':'Enter Stimulus content', value: ctrl.fields.newStimulus(), oninput: m.withAttr('value', ctrl.fields.newStimulus)})
                    )
                ),
                m('.row',
                    m('.col-md-7',[
                        m('.btn-group btn-group-toggle', [
                            m('button[type=button].btn btn-outline-secondary',{disabled:!ctrl.fields.newStimulus().length, id:'addWord', onclick: ctrl.addStimulus},[
                                m('i.fa.fa-plus'), 'Add Word'
                            ]),
                            m('button[type=button].btn btn-outline-secondary', {disabled:!ctrl.fields.newStimulus().length, id:'addImage', onclick: ctrl.addStimulus},[
                                m('i.fa.fa-plus'), 'Add Image'
                            ])
                        ])
                    ])
                ),
                m('.row',[
                    m('.col-md-6',
                        m('select.form-control', {multiple : 'multiple', size : '8' ,onchange: (e) => ctrl.updateSelectedStimuli(e)},[
                            ctrl.get('stimulusMedia').some(object => object.word) ? ctrl.fields.stimuliHidden(true) : ctrl.fields.stimuliHidden(false),
                            ctrl.get('stimulusMedia').map(function(object){
                                let value = object.word ? object.word : object.image;
                                let option = value + (object.word ? ' [Word]' : ' [Image]');
                                return m('option', {value:value, selected : ctrl.fields.selectedStimuli().includes(object)}, option);
                            })
                        ])
                    ),
                    m('.col-md-6',
                        !ctrl.fields.stimuliHidden() ? '' :
                            m('.col-md-7',[
                                m('u','Stimuli font\'s design:'),m('br'),
                                m('label','Font\'s color: '),m('br'),
                                m('input[type=color].form-control', {value: ctrl.get('stimulusCss','color'), onchange:m.withAttr('value', ctrl.set('stimulusCss','color'))}),
                                m('br'), m('label', 'Font\'s size:'), m('br'),
                                m('input[type=number].form-control', {placeholder:'1', value:ctrl.get('stimulusCss','font-size') ,min: '0' ,onchange:m.withAttr('value', ctrl.set('stimulusCss','font-size'))})
                            ])
                    )
                ])
            ]),
            ///startStimulus
            !ctrl.fields.startStimulus() ? '' :
                m('.col-md-6', [
                    m('.row',
                        m('.col-md-12',
                            m('p.h4','Stimuli Presented with Instructions: ', m('i.fa.fa-info-circle.text-muted',{
                                title:'Here You can enter only one type of stimuli (image or words), if you enter an image you can only enter one and with its file extension.'
                            }))
                        )
                    ),
                    m('.row',
                        m('.col-md-6',
                            m('input[type=text].form-control', {placeholder:'Enter Stimulus content here', 'aria-label':'Enter Stimulus content', value: ctrl.fields.newStartStimulus(), oninput: m.withAttr('value', ctrl.fields.newStartStimulus)})
                        )
                    ),
                    m('.row',
                        m('.col-md-7',
                            m('.btn-group btn-group-toggle', [
                                m('button[type=button].btn btn-outline-secondary',{disabled:!ctrl.fields.newStartStimulus().length, id:'addWord', onclick: (e) => ctrl.addStimulus(e,true)},[
                                    m('i.fa.fa-plus'), 'Add Word'
                                ]),
                                m('button[type=button].btn btn-outline-secondary', {disabled:!ctrl.fields.newStartStimulus().length, id:'addImage', onclick: (e) => ctrl.addStimulus(e,true)},[
                                    m('i.fa.fa-plus'), 'Add Image'
                                ])
                            ])
                        )
                    ),
                    m('.row',[
                        m('.col-md-6',
                            m('select.form-control', {multiple : 'multiple', size : '8' ,onchange: (e) => ctrl.updateSelectedStimuli(e, true)},[
                                !ctrl.fields.startStimulus()  ||
                                ctrl.get('title','startStimulus','media').some(object => object.includes('.')) ||
                                !ctrl.get('title','startStimulus','media').length ? ctrl.fields.startStimuliHidden(false) : ctrl.fields.startStimuliHidden(true),
                                ctrl.get('title','startStimulus','media').map(function(object){
                                    let type = object.includes('.') ? ' [Image]' : ' [Word]';
                                    let option = object + type;
                                    return m('option', {value:object, selected : ctrl.fields.selectedStartStimuli().includes(object)} ,option);
                                })
                            ])
                        ),
                        m('.col-md-6',
                            !ctrl.fields.startStimuliHidden() ? '' :
                                m('.col-md-7',[
                                    m('u','Stimuli font\'s design:'),m('br'),
                                    m('label','Font\'s color: '),m('br'),
                                    m('input[type=color].form-control', {value: ctrl.get('title','startStimulus','css','color'), onchange:m.withAttr('value', ctrl.set('title','startStimulus','css','color'))}),
                                    m('br'), m('label', 'Font\'s size:'), m('br'),
                                    m('input[type=number].form-control', {placeholder:'1', value:ctrl.get('title','startStimulus','css','font-size') ,min: '0' ,onchange:m.withAttr('value', ctrl.set('title','startStimulus','css','font-size'))})
                                ])
                        )
                    ])
                ])
        ]),
        m('.row',[
            m('.col-md-6.space',
                m('.btn-group-vertical', [
                    m('button.btn btn btn-warning', {title:'To select multiple stimuli, please press the ctrl key while selecting the desired stimuli', disabled: !ctrl.fields.selectedStimuli().length, onclick:ctrl.removeChosenStimuli}, 'Remove Chosen Stimuli'),
                    m('button.btn btn btn-warning', {onclick:ctrl.removeAllStimuli},'Remove All Stimuli'),
                    ctrl.fields.isNewCategory() ? '' : m('button.btn btn btn-warning', {onclick:(e) => ctrl.resetStimuliList(e)}, 'Reset Stimuli List'),
                ])),
            ///startStimulus
            !ctrl.fields.startStimulus() ? '' :
                m('.col-md-6.space',[
                    m('.btn-group-vertical', [
                        m('button.btn btn btn-warning', {title:'To select multiple stimuli, please press the ctrl key while selecting the desired stimuli', disabled: !ctrl.fields.selectedStartStimuli().length, onclick: (e) => ctrl.removeChosenStartStimuli(e)}, 'Remove Chosen Stimuli'),
                        m('button.btn btn btn-warning', {onclick: (e) => ctrl.removeAllStimuli(e,true)}, 'Remove All Stimuli'),
                        ctrl.fields.isNewCategory() ? '' : m('button.btn btn btn-warning', {onclick:(e) => ctrl.resetStimuliList(e,true)}, 'Reset Stimuli List'),
                    ])
                ])
        ]),
    ]);
}

export default elementComponent;

