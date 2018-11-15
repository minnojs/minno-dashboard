import {is_collaboration_code} from './collaborationModel';
import fullHeight from 'utils/fullHeight';

export default collaborationComponent;

let collaborationComponent = {
    controller(){
        is_collaboration_code(m.route.param('code'))
            .then(() => {
                m.route('/');
            }).catch().then(m.redraw);



    },
    view(){
        return m('.activation.centrify', {config:fullHeight},[
            m('i.fa.fa-thumbs-down.fa-5x.m-b-1'),
            m('h5', 'There is a problem! please check your code...')]);
    }
};
