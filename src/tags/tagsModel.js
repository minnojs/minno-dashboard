import {fetchJson} from 'utils/modelHelpers';
import {tagsUrl, studyUrl} from 'modelUrls';



function tag_url(tag_id)
{
    return `${tagsUrl}/${encodeURIComponent(tag_id)}`;
}

function study_url(study_id) {
    return `${studyUrl}/${encodeURIComponent(study_id)}/tags`;
}


function study_tag_url(study_id, tag_id) {
    return `${studyUrl}/${encodeURIComponent(study_id)}/tags/${encodeURIComponent(tag_id)}`;
}

export let toogle_tag_to_study = (study_id, tag_id, used) => {
    if(used)
        return add_tag_to_study(study_id, tag_id);
    return delete_tag_from_study(study_id, tag_id);
};

export let add_tag_to_study = (study_id, tag_id) => fetchJson(study_tag_url(study_id, tag_id), {
    method: 'post'
});


export let delete_tag_from_study = (study_id, tag_id) => fetchJson(study_tag_url(study_id, tag_id), {
    method: 'delete'
});

export let get_tags = () => fetchJson(tagsUrl, {
    method: 'get'
});


export let get_tags_for_study = (study_id) => fetchJson(study_url(study_id), {
    method: 'get'
});

export let remove_tag = (tag_id) => fetchJson(tag_url(tag_id), {
    method: 'delete'
});

export let add_tag = (tag_text, tag_color) => fetchJson(tagsUrl, {
    method: 'post',
    body: {tag_text, tag_color}
});

export let edit_tag = (tag_id, tag_text, tag_color) => fetchJson(tag_url(tag_id), {
    method: 'put',
    body: {tag_text, tag_color}
});

export let view_create = (ctrl) =>
{
    return   m('p', [

        m('input.form-control', {placeholder: 'tag_text', value: ctrl.tag_text(), oninput: m.withAttr('value', ctrl.tag_text)}),
        m('p',[
            m('button',  {style: {'background-color': '#E7E7E7', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('E7E7E7');}}, ' A '),
            m('button',  {style: {'background-color': '#B6CFF5', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('B6CFF5');}}, ' A '),
            m('button',  {style: {'background-color': '#98D7E4', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('98D7E4');}}, ' A '),
            m('button',  {style: {'background-color': '#E3D7FF', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('E3D7FF');}}, ' A '),
            m('button',  {style: {'background-color': '#FBD3E0', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FBD3E0');}}, ' A '),
            m('button',  {style: {'background-color': '#F2B2A8', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('F2B2A8');}}, ' A ')
        ]),
        m('p',[
            m('button',  {style: {'background-color': '#C2C2C2', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('C2C2C2');}}, ' A '),
            m('button',  {style: {'background-color': '#4986E7', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('4986E7');}}, ' A '),
            m('button',  {style: {'background-color': '#2DA2BB', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('2DA2BB');}}, ' A '),
            m('button',  {style: {'background-color': '#B99AFF', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('B99AFF');}}, ' A '),
            m('button',  {style: {'background-color': '#F691B2', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('F691B2');}}, ' A '),
            m('button',  {style: {'background-color': '#FB4C2F', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FB4C2F');}}, ' A ')
        ]),
        m('p',[
            m('button',  {style: {'background-color': '#FFC8AF', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FFC8AF');}}, ' A '),
            m('button',  {style: {'background-color': '#FFDEB5', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FFDEB5');}}, ' A '),
            m('button',  {style: {'background-color': '#FBE9E7', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FBE9E7');}}, ' A '),
            m('button',  {style: {'background-color': '#FDEDC1', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FDEDC1');}}, ' A '),
            m('button',  {style: {'background-color': '#B3EFD3', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('B3EFD3');}}, ' A '),
            m('button',  {style: {'background-color': '#A2DCC1', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('A2DCC1');}}, ' A ')
        ]),
        m('p',[
            m('button',  {style: {'background-color': '#FF7537', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FF7537');}}, ' A '),
            m('button',  {style: {'background-color': '#FFAD46', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('FFAD46');}}, ' A '),
            m('button',  {style: {'background-color': '#EBDBDE', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('EBDBDE');}}, ' A '),
            m('button',  {style: {'background-color': '#CCA6AC', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('CCA6AC');}}, ' A '),
            m('button',  {style: {'background-color': '#42D692', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('42D692');}}, ' A '),
            m('button',  {style: {'background-color': '#16A765', 'border': '1px solid'}, onclick: function(){ctrl.tag_color('16A765');}}, ' A ')
        ]),

        m('span.h3',  {style: {'background-color': '#' + ctrl.tag_color()}}, ctrl.tag_text()),

        m('p', {class: ctrl.error()? 'alert alert-danger' : ''}, ctrl.error())

    ]);
};