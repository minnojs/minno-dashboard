import messages from '../../../../../utils/messagesComponent';

export function clone(obj){
    return JSON.parse(JSON.stringify(obj));
}

export function resetClearButtons(reset, clear, curr_tab = null, isBiat = false){
    let showReset = !(isBiat && curr_tab > 1); //if the condition holds, don't show the reset button
    return m('.pull-xs-right',[
        m('.btn-group btn-group-toggle',[
            !showReset ? '' :
                m('button.btn btn btn-secondary',
                    {title:'Reset all current fields to default values',
                        onclick: () => reset(curr_tab)},
                    m('i.fa.fa-undo.fa-sm'), ' Reset'),
            m('button.btn btn btn-danger',
                {title:'Clears all current values',onclick:() => clear(curr_tab)},
                m('i.fa.fa-trash.fa-sm'), ' Clear'),
        ])
    ]);
}

export function pageHeadLine(task){
    return m('h1.display-4', 'Create my '+task+' script')
}

export function checkMissingElementName(element, name_to_display, error_msg){
    let containsImage = false;
    //check for missing titles and names
    if(element.name.length === 0)
        error_msg.push(name_to_display+'\'s name is missing');

    if(element.title.media.image !== undefined){
        containsImage = true;
        if(element.title.media.image.length === 0)
            error_msg.push(name_to_display+'\'s title is missing');
    }
    else{
        if(element.title.media.word.length === 0)
            error_msg.push(name_to_display+'\'s title is missing');
    }
    let stimulusMedia = element.stimulusMedia;

    //if there an empty stimuli list
    if (stimulusMedia.length === 0)
        error_msg.push(name_to_display+'\'s stimuli list is empty, please enter at least one stimulus.');

    //check if the stimuli contains images
    for(let i = 0; i < stimulusMedia.length ;i++)
        if(stimulusMedia[i].image) containsImage = true;

    if(element.title.startStimulus) //for biat only, checking if startStimulus contains image
        element.title.startStimulus.media.image ? containsImage = true : '';

    return containsImage;
}

export function checkPrime(element, name_to_display, error_msg){
    let containsImage = false;
    //check for missing titles and names
    if(element.name.length === 0)
        error_msg.push(name_to_display+'\'s name is missing');

    let mediaArray = element.mediaArray;

    //if there an empty stimuli list
    if (mediaArray.length === 0)
        error_msg.push(name_to_display+'\'s stimuli list is empty, please enter at least one stimulus.');

    //check if the stimuli contains images
    for(let i = 0; i < mediaArray.length ;i++)
        if(mediaArray[i].image) containsImage = true;

    return containsImage;
}

export function showClearOrReset(element, value, action){
    let msg_text = {
        'reset':{text:'This will delete all current properties and reset them to default values.',title:'Reset?'},
        'clear':{text: 'This will delete all current properties.', title: 'Clear?'}
    };
    return messages.confirm({header: msg_text[action].title, content:
            m('strong', msg_text[action].text)})
        .then(response => {
            if (response) {
                Object.assign(element, clone(value));
                m.redraw();
            }
        }).catch(error => messages.alert({header: msg_text[action].title , content: m('p.alert.alert-danger', error.message)}))
        .then(m.redraw());
}

export function showRestrictions(type, text, title = ''){
    if(type === 'error')
        messages.alert({header: title , content: m('p.alert.alert-danger', text)});
    if(type === 'info') messages.alert({header: title , content: m('p.alert.alert-info', text)});
}

let printFlag = m.prop(false);
export function viewOutput(ctrl, settings, toString){
    return m('.space',[
        !ctrl.error_msg.length ? '' :
            m('.alert alert-danger', [
                m('strong','Some problems were found in your script, it\'s recommended to fix them before proceeding to download:'),
                m('ul',[
                    ctrl.error_msg.map(function(err){
                        return m('li',err);
                    })
                ])
            ]),
        m('.row',
            m('.col-md-8.offset-sm-3',
                m('.btn-group', [
                    m('button.btn btn btn-success', {
                        onclick: ctrl.createFile(settings,'JS'),
                        title:'Download the JavaScript file. For more details how to use it, see the “Help” page.'}, [m('i.fa.fa-download'), ' Download Script']),
                    m('button.btn btn btn-success', {
                        onclick: ctrl.createFile(settings,'JSON'),
                        title:'Importing this file to this tool, will load all your parameters to this tool.'}, [m('i.fa.fa-download'), ' Download JSON']),
                    m('button.btn btn btn-light', {
                        onclick: () => printFlag(true)}, [m('i.fa.fa-file'), ' Print to Browser'])
                ])
            )),
        !printFlag() ? '' :
            m('.row.space',
                m('.col-md-10.offset-sm-1',
                    m('textarea.form-control', {value: toString(settings), rows:20})
                ))
    ]);
}

export function viewImport(ctrl){
    return m('.row.centrify.space',[
        m('.col-sm-5',
            m('.card.border-info.mb-3', [
                m('.card-header','Upload a JSON file: ' ),
                m('card-body.text-info',[
                    m('p.space.offset-xs-1','If you saved a JSON file from a previous session, you can upload that file here to edit the parameters.'),
                    m('input[type=file].form-control',{id:'uploadFile', onchange: ctrl.handleFile})
                ])
            ])
        )]
    );
}

export function editStimulusObject(fieldName, get, set){ //used in parameters component
    return m('.col-sm-4.col-lg-4',[
        m('.row',[
            m('.col-sm-4', m('span' ,'Font\'s color: ')),
            m('.col-sm-4', m('input[type=color].form-control', {value: get(fieldName,'css','color'), onchange:m.withAttr('value', set(fieldName,'css','color'))}))
        ]),
        m('.row.space',[
            m('.col-sm-4', m('span', 'Font\'s size:')),
            m('.col-sm-4', m('input[type=number].form-control', {placeholder:'0', value:get(fieldName,'css','font-size') ,min: '0' ,onchange:m.withAttr('value', set(fieldName,'css','font-size'))}))
        ]),
        m('.row.space',[
            m('.col-sm-4',
                !fieldName.toLowerCase().includes('maskstimulus')
                    ? m('span', 'Text: ') :  m('span', 'Image: ')),
            m('.col-sm-8',
                !fieldName.toLowerCase().includes('maskstimulus')
                    ? m('input[type=text].form-control', {value:get(fieldName,'media','word') ,onchange:m.withAttr('value', set(fieldName,'media','word'))})
                    : m('input[type=text].form-control', {value:get(fieldName,'media','image') ,onchange:m.withAttr('value', set(fieldName,'media','image'))})
            )
        ])
    ]);
}

