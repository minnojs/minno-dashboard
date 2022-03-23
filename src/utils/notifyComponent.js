export let createNotifications = function(){
    const state = [];
    return {show_success, show_danger, view};

    function show(value, time = 6000){
        state.push(value);
        m.redraw();
        setTimeout(()=>{state.pop(value);  m.redraw();}, time);
    }

    function show_success(value){
        return show({value, type:'success'});
    }

    function show_danger(value){
        return show({value, type:'danger'});
    }


    function view(){
        return state.map(notes => m('.note.alert.animated.fade', {class: notes.type==='danger' ? 'alert-danger' : 'alert-success'},[
            notes.value
        ]));

    }
};