export  default observer;

function observer(){
    let channels = {};
    return {
        on(channel,cb){
            channels[channel] || (channels[channel] = []);
            channels[channel].push(cb);
        },
        off(cb){
            for (let channel in channels) {
                let index = channels[channel].indexOf(cb);
                if (index > -1) channels[channel].splice(index, 1);
            }
        },
        trigger(channel, ...args){
            if (!channels[channel]) return;
            channels[channel].forEach(cb => cb.apply(null, args));
        }
    };
}
