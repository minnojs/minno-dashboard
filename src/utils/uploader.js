const DRAGOVER_CLASS = 'is-dragover';
function dragdrop(element, options) {
    options = options || {};

    element.addEventListener('dragover', activate);
    element.addEventListener('dragleave', deactivate);
    element.addEventListener('dragend', deactivate);
    element.addEventListener('drop', deactivate);
    element.addEventListener('drop', update);

    function activate(e) {
        e.preventDefault();
        e.stopPropagation(); // so that only the lowest level element gets focused
        element.classList.add(DRAGOVER_CLASS);
    }
    function deactivate() {
        element.classList.remove(DRAGOVER_CLASS);
    }
    function update(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadonchange(options)(e);
        m.redraw();
    }
}

export const uploadConfig = ctrl => (element, isInitialized) => {
    if (!isInitialized) {
        dragdrop(element, {onchange: ctrl.onchange});
    }
};

export const uploadBox = args => m('form.upload', {method:'post', enctype:'multipart/form-data', config:uploadConfig(args)},[
    m('i.fa.fa-download .fa-3x.m-b-1'),
    m('input.box__file', {id:'upload', type:'file', name:'files[]', 'data-multiple-caption':'{count} files selected', multiple:true, onchange: uploadonchange(args)}),
    m('label', {for:'upload'},
        m('strong', 'Choose a file'),
        m('span', ' or drag it here')
    )
]);

// call onchange with files
export const uploadonchange = args => e => {
    const dt = e.dataTransfer || e.target;
    const cb = args.onchange;

    if (typeof cb !== 'function') return;

    if (dt.items && dt.items.length && 'webkitGetAsEntry' in dt.items[0]) {
        entriesApi(dt.items, cb);
    } else if ('getFilesAndDirectories' in dt) {
        newDirectoryApi(dt, cb);
    } else if (dt.files) {
        arrayApi(dt, cb);
    } else cb();
};

// API implemented in Firefox 42+ and Edge
function newDirectoryApi(input, cb) {
    const fd = new FormData(), files = [];
    const iterate = function(entries, path, resolve) {
        const promises = [];
        entries.forEach(function(entry) {
            promises.push(new Promise(function(resolve) {
                if ('getFilesAndDirectories' in entry) {
                    entry.getFilesAndDirectories().then(function(entries) {
                        iterate(entries, entry.path + '/', resolve);
                    });
                } else {
                    if (entry.name) {
                        const p = (path + entry.name).replace(/^[/\\]/, '');
                        fd.append('files[]', entry, p);
                        files.push(p);
                    }
                    resolve();
                }
            }));
        });
        Promise.all(promises).then(resolve);
    };
    input.getFilesAndDirectories().then(function(entries) {
        new Promise(function(resolve) {
            iterate(entries, '/', resolve);
        }).then(cb.bind(null, fd, files));
    });
}

// old prefixed API implemented in Chrome 11+ as well as array fallback
function arrayApi(input, cb) {
    const fd = new FormData(), files = [];
    [].slice.call(input.files).forEach(function(file) {
        fd.append('files[]', file, file.webkitRelativePath || file.name);
        files.push(file.webkitRelativePath || file.name);
    });
    cb(fd, files);
}

// old drag and drop API implemented in Chrome 11+
function entriesApi(items, cb) {
    const fd = new FormData(), files = [], rootPromises = [];

    function readEntries(entry, reader, oldEntries, cb) {
        const dirReader = reader || entry.createReader();
        dirReader.readEntries(function(entries) {
            const newEntries = oldEntries ? oldEntries.concat(entries) : entries;
            if (entries.length) {
                setTimeout(readEntries.bind(null, entry, dirReader, newEntries, cb), 0);
            } else {
                cb(newEntries);
            }
        });
    }

    function readDirectory(entry, path, resolve) {
        if (!path) path = entry.name;
        readEntries(entry, 0, 0, function(entries) {
            const promises = [];
            entries.forEach(function(entry) {
                promises.push(new Promise(function(resolve) {
                    if (entry.isFile) {
                        entry.file(function(file) {
                            const p = path + '/' + file.name;
                            fd.append('files[]', file, p);
                            files.push(p);
                            resolve();
                        }, resolve.bind());
                    } else readDirectory(entry, path + '/' + entry.name, resolve);
                }));
            });
            Promise.all(promises).then(resolve.bind());
        });
    }

    [].slice.call(items).forEach(function(entry) {
        entry = entry.webkitGetAsEntry();
        if (entry) {
            rootPromises.push(new Promise(function(resolve) {
                if (entry.isFile) {
                    entry.file(function(file) {
                        fd.append('files[]', file, file.name);
                        files.push(file.name);
                        resolve();
                    }, resolve.bind());
                } else if (entry.isDirectory) {
                    readDirectory(entry, null, resolve);
                }
            }));
        }
    });
    Promise.all(rootPromises).then(cb.bind(null, fd, files));
}
