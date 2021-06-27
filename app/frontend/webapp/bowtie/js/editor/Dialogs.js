/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs a new open dialog.
 */
var OpenDialog = function () {
    var iframe = document.createElement('iframe');
    iframe.style.backgroundColor = 'transparent';
    iframe.allowTransparency = 'true';
    iframe.style.borderStyle = 'none';
    iframe.style.borderWidth = '0px';
    iframe.style.overflow = 'hidden';
    iframe.frameBorder = '0';

    // Adds padding as a workaround for box model in older IE versions
    var dx = (mxClient.IS_VML && (document.documentMode == null || document.documentMode < 8)) ? 20 : 0;

    iframe.setAttribute('width', (((Editor.useLocalStorage) ? 640 : 320) + dx) + 'px');
    iframe.setAttribute('height', (((Editor.useLocalStorage) ? 480 : 220) + dx) + 'px');
    iframe.setAttribute('src', OPEN_DIALOG);

    this.container = iframe;
};

var LoginDialog = function () {
    var iframe = document.createElement('iframe');
    iframe.style.backgroundColor = 'transparent';
    iframe.allowTransparency = 'true';
    iframe.style.borderStyle = 'none';
    iframe.style.borderWidth = '0px';
    iframe.style.overflow = 'hidden';
    iframe.frameBorder = '0';

    // Adds padding as a workaround for box model in older IE versions
    var dx = (mxClient.IS_VML && (document.documentMode == null || document.documentMode < 8)) ? 20 : 0;

    iframe.setAttribute('width', ((300 + dx) + 'px'));
    iframe.setAttribute('height', ((300 + dx) + 'px'));
    iframe.setAttribute('src', LOGIN_FORM);

    this.container = iframe;
};

/**
 * Bowtie++ feature
 * Risk Dialog to show risk computation
 */
var RiskDialog = function () {
    var iframe = document.createElement('iframe');
    iframe.style.backgroundColor = 'transparent';
    iframe.allowTransparency = 'true';
    iframe.style.borderStyle = 'none';
    iframe.style.borderWidth = '0px';
    iframe.style.overflow = 'hidden';
    iframe.frameBorder = '0';
    // Adds padding as a workaround for box model in older IE versions
    var dx = (mxClient.IS_VML && (document.documentMode == null || document.documentMode < 8)) ? 20 : 0;

    iframe.setAttribute('width', 1000 + 'px');
    iframe.setAttribute('height', 750 + 'px');
    iframe.setAttribute('src', RISK_DIALOG);
    this.container = iframe;
}
/**
 * Constructs a new color dialog.
 */
var ColorDialog = function (editorUi, color, apply, cancelFn) {
    this.editorUi = editorUi;

    var input = document.createElement('input');
    input.style.marginBottom = '10px';
    input.style.width = '216px';

    // Required for picker to render in IE
    if (mxClient.IS_IE) {
        input.style.marginTop = '10px';
        document.body.appendChild(input);
    }

    this.init = function () {
        if (!mxClient.IS_TOUCH) {
            input.focus();
        }
    };

    var picker = new jscolor.color(input);
    picker.pickerOnfocus = false;
    picker.showPicker();

    var div = document.createElement('div');
    jscolor.picker.box.style.position = 'relative';
    jscolor.picker.box.style.width = '230px';
    jscolor.picker.box.style.height = '100px';
    jscolor.picker.box.style.paddingBottom = '10px';
    div.appendChild(jscolor.picker.box);

    var center = document.createElement('center');

    function createRecentColorTable() {
        var table = addPresets((ColorDialog.recentColors.length == 0) ? ['FFFFFF'] :
            ColorDialog.recentColors, 11, 'FFFFFF', true);
        table.style.marginBottom = '8px';

        return table;
    };

    function addPresets(presets, rowLength, defaultColor, addResetOption) {
        rowLength = (rowLength != null) ? rowLength : 12;
        var table = document.createElement('table');
        table.style.borderCollapse = 'collapse';
        table.setAttribute('cellspacing', '0');
        table.style.marginBottom = '20px';
        table.style.cellSpacing = '0px';
        var tbody = document.createElement('tbody');
        table.appendChild(tbody);

        var rows = presets.length / rowLength;

        for (var row = 0; row < rows; row++) {
            var tr = document.createElement('tr');

            for (var i = 0; i < rowLength; i++) {
                (function (clr) {
                    var td = document.createElement('td');
                    td.style.border = '1px solid black';
                    td.style.padding = '0px';
                    td.style.width = '16px';
                    td.style.height = '16px';

                    if (clr == null) {
                        clr = defaultColor;
                    }

                    if (clr == 'none') {
                        td.style.background = 'url(\'' + Dialog.prototype.noColorImage + '\')';
                    } else {
                        td.style.backgroundColor = '#' + clr;
                    }

                    tr.appendChild(td);

                    if (clr != null) {
                        td.style.cursor = 'pointer';

                        mxEvent.addListener(td, 'click', function () {
                            if (clr == 'none') {
                                picker.fromString('ffffff');
                                input.value = 'none';
                            } else {
                                picker.fromString(clr);
                            }
                        });
                    }
                })(presets[row * rowLength + i]);
            }

            tbody.appendChild(tr);
        }

        if (addResetOption) {
            var td = document.createElement('td');
            td.setAttribute('title', mxResources.get('reset'));
            td.style.border = '1px solid black';
            td.style.padding = '0px';
            td.style.width = '16px';
            td.style.height = '16px';
            td.style.backgroundImage = 'url(\'' + Dialog.prototype.closeImage + '\')';
            td.style.backgroundPosition = 'center center';
            td.style.backgroundRepeat = 'no-repeat';
            td.style.cursor = 'pointer';

            tr.appendChild(td);

            mxEvent.addListener(td, 'click', function () {
                ColorDialog.resetRecentColors();
                table.parentNode.replaceChild(createRecentColorTable(), table);
            });
        }

        center.appendChild(table);

        return table;
    };

    div.appendChild(input);
    mxUtils.br(div);

    // Adds recent colors
    createRecentColorTable();

    // Adds presets
    var table = addPresets(this.presetColors);
    table.style.marginBottom = '8px';
    table = addPresets(this.defaultColors);
    table.style.marginBottom = '16px';

    div.appendChild(center);

    var buttons = document.createElement('div');
    buttons.style.textAlign = 'right';
    buttons.style.whiteSpace = 'nowrap';

    var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
        editorUi.hideDialog();

        if (cancelFn != null) {
            cancelFn();
        }
    });
    cancelBtn.className = 'geBtn';

    if (editorUi.editor.cancelFirst) {
        buttons.appendChild(cancelBtn);
    }

    var applyFunction = (apply != null) ? apply : this.createApplyFunction();

    var applyBtn = mxUtils.button(mxResources.get('apply'), function () {
        var color = input.value;
        ColorDialog.addRecentColor(color, 12);

        if (color != 'none' && color.charAt(0) != '#') {
            color = '#' + color;
        }

        applyFunction(color);
        editorUi.hideDialog();
    });
    applyBtn.className = 'geBtn gePrimaryBtn';
    buttons.appendChild(applyBtn);

    if (!editorUi.editor.cancelFirst) {
        buttons.appendChild(cancelBtn);
    }

    if (color != null) {
        if (color == 'none') {
            picker.fromString('ffffff');
            input.value = 'none';
        } else {
            picker.fromString(color);
        }
    }

    div.appendChild(buttons);
    this.picker = picker;
    this.colorInput = input;

    // LATER: Only fires if input if focused, should always
    // fire if this dialog is showing.
    mxEvent.addListener(div, 'keydown', function (e) {
        if (e.keyCode == 27) {
            editorUi.hideDialog();

            if (cancelFn != null) {
                cancelFn();
            }

            mxEvent.consume(e);
        }
    });

    this.container = div;
};

/**
 * Creates function to apply value
 */
ColorDialog.prototype.presetColors = ['E6D0DE', 'CDA2BE', 'B5739D', 'E1D5E7', 'C3ABD0', 'A680B8', 'D4E1F5', 'A9C4EB', '7EA6E0', 'D5E8D4', '9AC7BF', '67AB9F', 'D5E8D4', 'B9E0A5', '97D077', 'FFF2CC', 'FFE599', 'FFD966', 'FFF4C3', 'FFCE9F', 'FFB570', 'F8CECC', 'F19C99', 'EA6B66'];

/**
 * Creates function to apply value
 */
ColorDialog.prototype.defaultColors = ['none', 'FFFFFF', 'E6E6E6', 'CCCCCC', 'B3B3B3', '999999', '808080', '666666', '4D4D4D', '333333', '1A1A1A', '000000', 'FFCCCC', 'FFE6CC', 'FFFFCC', 'E6FFCC', 'CCFFCC', 'CCFFE6', 'CCFFFF', 'CCE5FF', 'CCCCFF', 'E5CCFF', 'FFCCFF', 'FFCCE6',
    'FF9999', 'FFCC99', 'FFFF99', 'CCFF99', '99FF99', '99FFCC', '99FFFF', '99CCFF', '9999FF', 'CC99FF', 'FF99FF', 'FF99CC', 'FF6666', 'FFB366', 'FFFF66', 'B3FF66', '66FF66', '66FFB3', '66FFFF', '66B2FF', '6666FF', 'B266FF', 'FF66FF', 'FF66B3', 'FF3333', 'FF9933', 'FFFF33',
    '99FF33', '33FF33', '33FF99', '33FFFF', '3399FF', '3333FF', '9933FF', 'FF33FF', 'FF3399', 'FF0000', 'FF8000', 'FFFF00', '80FF00', '00FF00', '00FF80', '00FFFF', '007FFF', '0000FF', '7F00FF', 'FF00FF', 'FF0080', 'CC0000', 'CC6600', 'CCCC00', '66CC00', '00CC00', '00CC66',
    '00CCCC', '0066CC', '0000CC', '6600CC', 'CC00CC', 'CC0066', '990000', '994C00', '999900', '4D9900', '009900', '00994D', '009999', '004C99', '000099', '4C0099', '990099', '99004D', '660000', '663300', '666600', '336600', '006600', '006633', '006666', '003366', '000066',
    '330066', '660066', '660033', '330000', '331A00', '333300', '1A3300', '003300', '00331A', '003333', '001933', '000033', '190033', '330033', '33001A'];

/**
 * Creates function to apply value
 */
ColorDialog.prototype.createApplyFunction = function () {
    return mxUtils.bind(this, function (color) {
        var graph = this.editorUi.editor.graph;

        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(this.currentColorKey, color);
            this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [this.currentColorKey],
                'values', [color], 'cells', graph.getSelectionCells()));
        } finally {
            graph.getModel().endUpdate();
        }
    });
};

/**
 *
 */
ColorDialog.recentColors = [];

/**
 * Adds recent color for later use.
 */
ColorDialog.addRecentColor = function (color, max) {
    if (color != null) {
        mxUtils.remove(color, ColorDialog.recentColors);
        ColorDialog.recentColors.splice(0, 0, color);

        if (ColorDialog.recentColors.length >= max) {
            ColorDialog.recentColors.pop();
        }
    }
};

/**
 * Adds recent color for later use.
 */
ColorDialog.resetRecentColors = function () {
    ColorDialog.recentColors = [];
};

/**
 * Constructs a new user control dialog.
 */
var UserControlDialog = function (editorUi) {
    var div = document.createElement('div');
    div.setAttribute('align', 'center');

    var h3 = document.createElement('h3');
    mxUtils.write(h3, mxResources.get('userControl'));
    div.appendChild(h3);

    var img = document.createElement('img');
    img.style.border = '0px';
    img.setAttribute('width', '176');
    img.setAttribute('width', '151');
    img.setAttribute('src', IMAGE_PATH + '/logo.png');
    div.appendChild(img);

    var user = {
        "username": localStorage.getItem("username"),
        "fullname": localStorage.getItem("fullname"),
        "token": localStorage.getItem("token")
    };

    mxUtils.br(div);
    //mxUtils.write(div, 'Powered by mxGraph ' + mxClient.VERSION);
    if (user.token) {
        mxUtils.write(div, 'Logged in.');
        mxUtils.br(div);
        mxUtils.write(div, 'Username: ' + user.username);
        mxUtils.br(div);
        mxUtils.write(div, 'Fullname: ' + user.fullname);
        mxUtils.br(div);
        mxUtils.write(div, 'Token: ' + user.token);
    } else {
        mxUtils.write(div, 'Currently not logged in');
    }

    mxUtils.br(div);
    mxUtils.br(div);

    var closeBtn = mxUtils.button(mxResources.get('close'), function () {
        editorUi.hideDialog();
    });
    closeBtn.className = 'geBtn gePrimaryBtn';

    div.appendChild(closeBtn);

    this.container = div;
};

/**
 * New Bowtie++ OpenFromDbDialog which launch new VueJs DiagramSearchVue
 */
var OpenFromDBDialog = function (width, height) {

    const iframe_holder = document.createElement('div')
    iframe_holder.setAttribute("style", "background:url(../images/loading.gif) center center no-repeat;")

    var iframe = document.createElement('iframe');
    iframe.style.backgroundColor = 'transparent';
    iframe.allowTransparency = 'true';
    iframe.style.borderStyle = 'none';
    iframe.style.borderWidth = '0px';
    iframe.style.overflow = 'hidden';
    iframe.frameBorder = '0';
    // Adds padding as a workaround for box model in older IE versions
    var dx = (mxClient.IS_VML && (document.documentMode == null || document.documentMode < 8)) ? 20 : 0;

    iframe.setAttribute('width', width + 'px');
    iframe.setAttribute('height', height + 'px');
    iframe.setAttribute('src', DIAGRAM_SEARCH_DIALOG);
    iframe_holder.appendChild(iframe)
    this.container = iframe_holder;
};

var OpenVersioningDialog = function (width, height) {


    const iframe_holder = document.createElement('div')
    iframe_holder.setAttribute("style", "background:url(../images/loading.gif) center center no-repeat;")

    var iframe = document.createElement('iframe');
    iframe.style.backgroundColor = 'transparent';
    iframe.allowTransparency = 'true';
    iframe.style.borderStyle = 'none';
    iframe.style.borderWidth = '0px';
    iframe.style.overflow = 'hidden';
    iframe.frameBorder = '0';
    // Adds padding as a workaround for box model in older IE versions
    var dx = (mxClient.IS_VML && (document.documentMode == null || document.documentMode < 8)) ? 20 : 0;

    iframe.setAttribute('width', width + 'px');
    iframe.setAttribute('height', height + 'px');
    iframe.setAttribute('src', window.VERSIONING_SEARCH);
    iframe_holder.appendChild(iframe)
    this.container = iframe_holder;
};

/**
 * New Bowtie++ ManageRolesDialog which launch new VueJs RoleManagerVue
 */
var ManageRolesDialog = function (width, height) {

    const iframe_holder = document.createElement('div')
    iframe_holder.setAttribute("style", "background:url(../images/loading.gif) center center no-repeat;")

    var iframe = document.createElement('iframe');
    iframe.style.backgroundColor = 'transparent';
    iframe.allowTransparency = 'true';
    iframe.style.borderStyle = 'none';
    iframe.style.borderWidth = '0px';
    iframe.style.overflow = 'hidden';
    iframe.frameBorder = '0';
    // Adds padding as a workaround for box model in older IE versions
    var dx = (mxClient.IS_VML && (document.documentMode == null || document.documentMode < 8)) ? 20 : 0;

    iframe.setAttribute('width', width + 'px');
    iframe.setAttribute('height', height + 'px');
    iframe.setAttribute('src', ROLE_MANAGER_DIALOG);
    iframe_holder.appendChild(iframe)
    this.container = iframe_holder;
};


/**
 * Constructs a new role dialog to share a diagram (role = reader || writer).
 */
var RoleDialog = function (editorUi, fn, cancelFn) {
    var row, td;

    var table = document.createElement('table');
    var tbody = document.createElement('tbody');
    table.style.marginTop = '8px';

    row = document.createElement('tr');
    td = document.createElement('td');
    td.style.whiteSpace = 'nowrap';
    td.style.fontSize = '10pt';
    td.style.width = '120px';
    mxUtils.write(td, mxResources.get('share'));
    row.appendChild(td);
    tbody.appendChild(row);

    row = document.createElement('tr');
    var nameInput = document.createElement('input');
    nameInput.type = 'email';
    nameInput.value = '';
    nameInput.placeholder = 'Email of user to share with';
    nameInput.style.marginLeft = '4px';
    nameInput.style.width = '180px';

    var role = document.createElement('select');
    role.style.marginLeft = '4px';
    role.style.marginTop = '10px';
    var owner = document.createElement('option');
    owner.value = 'writer';
    mxUtils.write(owner, 'Writer');

    var readonly = document.createElement('option');
    readonly.value = 'reader';
    mxUtils.write(readonly, 'Reader');

    let isRiskSharedDiv = document.createElement('div')
    let isRiskShared = document.createElement('input')
    // isRiskShared.className = "form-check-input me-1"
    isRiskShared.type = "checkbox"
    isRiskShared.checked = true
    isRiskShared.value = "true"
    isRiskShared.addEventListener('click', function (e) {
        if (isRiskShared.value === "true") {
            isRiskShared.value = "false"
        } else {
            isRiskShared.value = "true"
        }
    })

    isRiskSharedDiv.innerText = "Share risk computation"
    isRiskSharedDiv.style.marginLeft = '4px'
    isRiskSharedDiv.style.marginTop = '10px'
    isRiskSharedDiv.style.marginBottom = '10px'
    isRiskSharedDiv.appendChild(isRiskShared)

    role.appendChild(owner);
    role.appendChild(readonly);
    row.appendChild(nameInput);
    row.appendChild(role);
    row.appendChild(isRiskSharedDiv);
    tbody.appendChild(row);

    row = document.createElement('tr');
    td = document.createElement('td');

    var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
        editorUi.hideDialog();

        if (cancelFn != null) {
            cancelFn();
        }
    });
    cancelBtn.className = 'geBtn';

    if (editorUi.editor.cancelFirst) {
        td.appendChild(cancelBtn);
    }

    mxEvent.addListener(nameInput, 'keypress', function (e) {
        if (e.keyCode == 13) {
            genericBtn.click();
        }
    });
    mxEvent.addListener(role, 'keypress', function (e) {
        if (e.keyCode == 13) {
            genericBtn.click();
        }
    });

    var genericBtn = mxUtils.button(mxResources.get('save'), mxUtils.bind(this, function () {
        var user = nameInput.value;
        editorUi.hideDialog();
        // console.log('user', user, 'role', role.value);
        fn(user, role.value, isRiskShared.value);
    }));
    genericBtn.className = 'geBtn gePrimaryBtn';
    td.appendChild(genericBtn);

    if (!editorUi.editor.cancelFirst) {
        td.appendChild(cancelBtn);
    }

    row.appendChild(td);
    tbody.appendChild(row);
    table.appendChild(tbody);
    this.container = table;
}

/**
 * Constructs a new filename dialog.
 */
var FilenameDialog = function (editorUi, filename, buttonText, fn, label, validateFn, content, helpLink, closeOnBtn, cancelFn) {
    closeOnBtn = (closeOnBtn != null) ? closeOnBtn : true;
    var row, td;

    var table = document.createElement('table');
    var tbody = document.createElement('tbody');
    table.style.marginTop = '8px';

    row = document.createElement('tr');

    td = document.createElement('td');
    td.style.whiteSpace = 'nowrap';
    td.style.fontSize = '10pt';
    td.style.width = '120px';
    mxUtils.write(td, (label || mxResources.get('filename')) + ':');

    row.appendChild(td);

    var nameInput = document.createElement('input');
    nameInput.setAttribute('value', filename || '');
    nameInput.style.marginLeft = '4px';
    nameInput.style.width = '180px';

    if (localStorage.getItem('is_public') === null) {
        localStorage.setItem('is_public', 'false')
    }


    var tags_row = document.createElement('tr')
    var tags_td = document.createElement('td')
    tags_td.style.whiteSpace = 'nowrap';
    tags_td.style.fontSize = '10pt';
    tags_td.style.width = '120px';

    mxUtils.write(tags_td, "Diagram tags" + ': ');
    let icon = document.createElement("img")
    icon.setAttribute("src", "/images/question-circle-solid.svg")
    icon.setAttribute("title", "Tags are like keywords for diagrams, separated by commas.")
    icon.setAttribute("style", "width:15px;margin-top:2px;")
    tags_td.appendChild(icon)


    // var info_div = document.createElement("div")
    // info_div.setAttribute("class", "info")

    /* let info_span = document.createElement("div")
    info_span.setAttribute("class", "extra-info")
    info_span.innerText = "Tags are used as keywords for diagrams." +
        "You can enter as much as you want separated by a comma."
    info_div.appendChild(icon)
    info_div.appendChild(info_span)
    tags_td.appendChild(info_div)*/
    /*var info_canvas = document.createElement("canvas")
    info_canvas.setAttribute("id","canvas")
    info_canvas.setAttribute("width","50")
    info_canvas.setAttribute("height","50")
    info_canvas.setAttribute("font-family","fontawesome")
    var ctx = info_canvas.getContext('2d')
    ctx.font = '20px FontAwesome' //0xe086
    ctx.fillText(String.fromCharCode('\uF047'), 10, 50);
    tags_td.appendChild(info_canvas)*/
    tags_row.appendChild(tags_td);
    var tags_td_input = document.createElement('td')
    var tags_input = document.createElement('input')
    tags_input.setAttribute('value', '');
    tags_input.style.marginLeft = '4px';
    tags_input.style.width = '180px';

    tags_td_input.appendChild(tags_input)
    tags_row.appendChild(tags_td_input)

    const public_row = document.createElement('tr')
    const public_td = document.createElement('td')
    var check_box = document.createElement('input')
    check_box.setAttribute("type", "checkbox")
    check_box.setAttribute("id", "public_checkbox")

    if (localStorage.getItem('is_public') === 'true') {
        check_box.checked = true;
    }

    var checkBox_label = document.createElement('label')
    checkBox_label.setAttribute("for", "checkbox")
    mxUtils.write(checkBox_label, "Public")
    public_td.appendChild(check_box)
    public_td.appendChild(checkBox_label)
    public_row.appendChild(public_td)

    check_box.addEventListener('click', () => {
        switch (localStorage.getItem('is_public').toLowerCase().trim()) {
            case 'false':
                localStorage.setItem('is_public', 'true');
                break;
            default:
                localStorage.setItem('is_public', 'false');
                break;
        }
        // that way if the checkbox isn't clicked once we can send a null value
    })

    var genericBtn = mxUtils.button(buttonText, function () {
        if (validateFn == null || validateFn(nameInput.value)) {
            if (closeOnBtn) {
                editorUi.hideDialog();
            }
            const tags_splitted = tags_input.value.replace(' ', '').split(',')
            // const is_public = localStorage.getItem('is_public')
            fn(nameInput.value, tags_splitted);
        }
    });
    genericBtn.className = 'geBtn gePrimaryBtn';

    this.init = function () {
        if (label == null && content != null) {
            return;
        }

        nameInput.focus();

        if (mxClient.IS_FF || document.documentMode >= 5 || mxClient.IS_QUIRKS) {
            nameInput.select();
        } else {
            document.execCommand('selectAll', false, null);
        }

        // Installs drag and drop handler for links
        if (Graph.fileSupport) {
            // Setup the dnd listeners
            var dlg = table.parentNode;
            var graph = editorUi.editor.graph;
            var dropElt = null;

            mxEvent.addListener(dlg, 'dragleave', function (evt) {
                if (dropElt != null) {
                    dropElt.style.backgroundColor = '';
                    dropElt = null;
                }

                evt.stopPropagation();
                evt.preventDefault();
            });

            mxEvent.addListener(dlg, 'dragover', mxUtils.bind(this, function (evt) {
                // IE 10 does not implement pointer-events so it can't have a drop highlight
                if (dropElt == null && (!mxClient.IS_IE || document.documentMode > 10)) {
                    dropElt = nameInput;
                    dropElt.style.backgroundColor = '#ebf2f9';
                }

                evt.stopPropagation();
                evt.preventDefault();
            }));

            mxEvent.addListener(dlg, 'drop', mxUtils.bind(this, function (evt) {
                if (dropElt != null) {
                    dropElt.style.backgroundColor = '';
                    dropElt = null;
                }

                if (mxUtils.indexOf(evt.dataTransfer.types, 'text/uri-list') >= 0) {
                    nameInput.value = decodeURIComponent(evt.dataTransfer.getData('text/uri-list'));
                    genericBtn.click();
                }

                evt.stopPropagation();
                evt.preventDefault();
            }));
        }
    };

    td = document.createElement('td');
    td.appendChild(nameInput);
    row.appendChild(td);

    if (label != null || content == null) {
        tbody.appendChild(row);
    }
    tbody.appendChild(tags_row)
    tbody.appendChild(public_row)
    if (content != null) {
        row = document.createElement('tr');
        td = document.createElement('td');
        td.colSpan = 2;
        td.appendChild(content);
        row.appendChild(td);
        tbody.appendChild(row);
    }

    row = document.createElement('tr');
    td = document.createElement('td');
    td.colSpan = 2;
    td.style.paddingTop = '20px';
    td.style.whiteSpace = 'nowrap';
    td.setAttribute('align', 'right');

    var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
        editorUi.hideDialog();

        if (cancelFn != null) {
            cancelFn();
        }
    });
    cancelBtn.className = 'geBtn';

    if (editorUi.editor.cancelFirst) {
        td.appendChild(cancelBtn);
    }

    if (helpLink != null) {
        var helpBtn = mxUtils.button(mxResources.get('help'), function () {
            window.open(helpLink);
        });

        helpBtn.className = 'geBtn';
        td.appendChild(helpBtn);
    }

    mxEvent.addListener(nameInput, 'keypress', function (e) {
        if (e.keyCode == 13) {
            genericBtn.click();
        }
    });

    td.appendChild(genericBtn);

    if (!editorUi.editor.cancelFirst) {
        td.appendChild(cancelBtn);
    }

    row.appendChild(td);
    tbody.appendChild(row);
    table.appendChild(tbody);

    this.container = table;
};

/**
 * Construct a new input dialog
 */
var InputDialog = function (editorUi, defaultValue, buttonText, fn, label, validateFn, content, helpLink, closeOnBtn, cancelFn) {
    closeOnBtn = (closeOnBtn != null) ? closeOnBtn : true;
    var row, td;

    var table = document.createElement('table');
    var tbody = document.createElement('tbody');
    table.style.marginTop = '8px';

    row = document.createElement('tr');

    td = document.createElement('td');
    td.style.whiteSpace = 'nowrap';
    td.style.fontSize = '10pt';
    td.style.width = '120px';
    mxUtils.write(td, (label || mxResources.get('filename')) + ':');

    row.appendChild(td);

    var nameInput = document.createElement('input');
    nameInput.setAttribute('value', defaultValue || '');
    nameInput.style.marginLeft = '4px';
    nameInput.style.width = '180px';

    var genericBtn = mxUtils.button(buttonText, function () {
        if (validateFn == null || validateFn(nameInput.value)) {
            if (closeOnBtn) {
                editorUi.hideDialog();
            }

            fn(nameInput.value);
        }
    });
    genericBtn.className = 'geBtn gePrimaryBtn';

    this.init = function () {
        if (label == null && content != null) {
            return;
        }

        nameInput.focus();

        if (mxClient.IS_FF || document.documentMode >= 5 || mxClient.IS_QUIRKS) {
            nameInput.select();
        } else {
            document.execCommand('selectAll', false, null);
        }

        // Installs drag and drop handler for links
        if (Graph.fileSupport) {
            // Setup the dnd listeners
            var dlg = table.parentNode;
            var graph = editorUi.editor.graph;
            var dropElt = null;

            mxEvent.addListener(dlg, 'dragleave', function (evt) {
                if (dropElt != null) {
                    dropElt.style.backgroundColor = '';
                    dropElt = null;
                }

                evt.stopPropagation();
                evt.preventDefault();
            });

            mxEvent.addListener(dlg, 'dragover', mxUtils.bind(this, function (evt) {
                // IE 10 does not implement pointer-events so it can't have a drop highlight
                if (dropElt == null && (!mxClient.IS_IE || document.documentMode > 10)) {
                    dropElt = nameInput;
                    dropElt.style.backgroundColor = '#ebf2f9';
                }

                evt.stopPropagation();
                evt.preventDefault();
            }));

            mxEvent.addListener(dlg, 'drop', mxUtils.bind(this, function (evt) {
                if (dropElt != null) {
                    dropElt.style.backgroundColor = '';
                    dropElt = null;
                }

                if (mxUtils.indexOf(evt.dataTransfer.types, 'text/uri-list') >= 0) {
                    nameInput.value = decodeURIComponent(evt.dataTransfer.getData('text/uri-list'));
                    genericBtn.click();
                }

                evt.stopPropagation();
                evt.preventDefault();
            }));
        }
    };

    td = document.createElement('td');
    td.appendChild(nameInput);
    row.appendChild(td);

    if (label != null || content == null) {
        tbody.appendChild(row);
    }

    if (content != null) {
        row = document.createElement('tr');
        td = document.createElement('td');
        td.colSpan = 2;
        td.appendChild(content);
        row.appendChild(td);
        tbody.appendChild(row);
    }

    row = document.createElement('tr');
    td = document.createElement('td');
    td.colSpan = 2;
    td.style.paddingTop = '20px';
    td.style.whiteSpace = 'nowrap';
    td.setAttribute('align', 'right');

    var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
        editorUi.hideDialog();

        if (cancelFn != null) {
            cancelFn();
        }
    });
    cancelBtn.className = 'geBtn';

    if (editorUi.editor.cancelFirst) {
        td.appendChild(cancelBtn);
    }

    if (helpLink != null) {
        var helpBtn = mxUtils.button(mxResources.get('help'), function () {
            window.open(helpLink);
        });

        helpBtn.className = 'geBtn';
        td.appendChild(helpBtn);
    }

    mxEvent.addListener(nameInput, 'keypress', function (e) {
        if (e.keyCode == 13) {
            genericBtn.click();
        }
    });

    td.appendChild(genericBtn);

    if (!editorUi.editor.cancelFirst) {
        td.appendChild(cancelBtn);
    }

    row.appendChild(td);
    tbody.appendChild(row);
    table.appendChild(tbody);

    this.container = table;
}

/**
 * Constructs a new textarea dialog.
 */
var TextareaDialog = function (editorUi, title, url, fn, cancelFn, cancelTitle, w, h, addButtons, noHide, noWrap, applyTitle) {
    w = (w != null) ? w : 300;
    h = (h != null) ? h : 120;
    noHide = (noHide != null) ? noHide : false;
    var row, td;

    var table = document.createElement('table');
    var tbody = document.createElement('tbody');

    row = document.createElement('tr');

    td = document.createElement('td');
    td.style.fontSize = '10pt';
    td.style.width = '100px';
    mxUtils.write(td, title);

    row.appendChild(td);
    tbody.appendChild(row);

    row = document.createElement('tr');
    td = document.createElement('td');

    var nameInput = document.createElement('textarea');

    if (noWrap) {
        nameInput.setAttribute('wrap', 'off');
    }

    nameInput.setAttribute('spellcheck', 'false');
    nameInput.setAttribute('autocorrect', 'off');
    nameInput.setAttribute('autocomplete', 'off');
    nameInput.setAttribute('autocapitalize', 'off');

    mxUtils.write(nameInput, url || '');
    nameInput.style.resize = 'none';
    nameInput.style.width = w + 'px';
    nameInput.style.height = h + 'px';

    this.textarea = nameInput;

    this.init = function () {
        nameInput.focus();
        nameInput.scrollTop = 0;
    };

    td.appendChild(nameInput);
    row.appendChild(td);

    tbody.appendChild(row);

    row = document.createElement('tr');
    td = document.createElement('td');
    td.style.paddingTop = '14px';
    td.style.whiteSpace = 'nowrap';
    td.setAttribute('align', 'right');

    var cancelBtn = mxUtils.button(cancelTitle || mxResources.get('cancel'), function () {
        editorUi.hideDialog();

        if (cancelFn != null) {
            cancelFn();
        }
    });
    cancelBtn.className = 'geBtn';

    if (editorUi.editor.cancelFirst) {
        td.appendChild(cancelBtn);
    }

    if (addButtons != null) {
        addButtons(td);
    }

    if (fn != null) {
        var genericBtn = mxUtils.button(applyTitle || mxResources.get('apply'), function () {
            if (!noHide) {
                editorUi.hideDialog();
            }

            fn(nameInput.value);
        });

        genericBtn.className = 'geBtn gePrimaryBtn';
        td.appendChild(genericBtn);
    }

    if (!editorUi.editor.cancelFirst) {
        td.appendChild(cancelBtn);
    }

    row.appendChild(td);
    tbody.appendChild(row);
    table.appendChild(tbody);
    this.container = table;
};

/**
 * Constructs a two new textarea dialog, on for title and one for description of element.
 */
var InfoTextDialog = function (editorUi, title, title1, url, url1, fn, cancelFn, cancelTitle, w, h, addButtons, noHide, noWrap, applyTitle) {
    w = (w != null) ? w : 300;
    h = (h != null) ? h : 120;
    noHide = (noHide != null) ? noHide : false;
    var row, td;

    var table = document.createElement('table');
    var tbody = document.createElement('tbody');

    row = document.createElement('tr');

    td = document.createElement('td');
    td.style.fontSize = '10pt';
    td.style.width = '100px';
    mxUtils.write(td, title);

    row.appendChild(td);
    tbody.appendChild(row);


    var nameInput = document.createElement('textarea');
    var nameInput1 = document.createElement('textarea');

    if (noWrap) {
        nameInput.setAttribute('wrap', 'off');
        nameInput1.setAttribute('wrap', 'off');

    }

    nameInput.setAttribute('spellcheck', 'false');
    nameInput.setAttribute('autocorrect', 'off');
    nameInput.setAttribute('autocomplete', 'off');
    nameInput.setAttribute('autocapitalize', 'off');

    nameInput1.setAttribute('spellcheck', 'false');
    nameInput1.setAttribute('autocorrect', 'off');
    nameInput1.setAttribute('autocomplete', 'off');
    nameInput1.setAttribute('autocapitalize', 'off');

    mxUtils.write(nameInput, url || '');
    nameInput.style.resize = 'none';
    nameInput.style.width = w + 'px';
    nameInput.style.height = 20 + 'px';
    nameInput1.style.marginBottom = "10px";


    mxUtils.write(nameInput1, url1 || '');
    nameInput1.style.resize = 'none';
    nameInput1.style.width = w + 'px';
    nameInput1.style.height = h + 'px';
    nameInput1.style.marginTop = "10px";

    this.textarea = nameInput;

    this.init = function () {
        nameInput.focus();
        nameInput.scrollTop = 0;
    };

    row = document.createElement('tr');
    td = document.createElement('td');

    td.appendChild(nameInput);

    row = document.createElement('tr');

    td.style.fontSize = '10pt';
    td.style.width = '100px';
    mxUtils.write(td, title1);

    td.appendChild(nameInput1)
    row.appendChild(td);

    tbody.appendChild(row);

    row = document.createElement('tr');
    td = document.createElement('td');
    td.style.paddingTop = '14px';
    td.style.whiteSpace = 'nowrap';
    td.setAttribute('align', 'right');

    var cancelBtn = mxUtils.button(cancelTitle || mxResources.get('cancel'), function () {
        editorUi.hideDialog();

        if (cancelFn != null) {
            cancelFn();
        }
    });
    cancelBtn.className = 'geBtn';

    if (editorUi.editor.cancelFirst) {
        td.appendChild(cancelBtn);
    }

    if (addButtons != null) {
        addButtons(td);
    }

    if (fn != null) {
        var genericBtn = mxUtils.button(applyTitle || mxResources.get('apply'), function () {
            if (!noHide) {
                editorUi.hideDialog();
            }

            fn(nameInput.value, nameInput1.value);
        });

        genericBtn.className = 'geBtn gePrimaryBtn';
        td.appendChild(genericBtn);
    }

    if (!editorUi.editor.cancelFirst) {
        td.appendChild(cancelBtn);
    }

    row.appendChild(td);
    tbody.appendChild(row);
    table.appendChild(tbody);
    this.container = table;
};


/**
 * Constructs a new edit file dialog.
 */
var EditDiagramDialog = function (editorUi) {
    var div = document.createElement('div');
    div.style.textAlign = 'right';
    var textarea = document.createElement('textarea');
    textarea.setAttribute('wrap', 'off');
    textarea.setAttribute('spellcheck', 'false');
    textarea.setAttribute('autocorrect', 'off');
    textarea.setAttribute('autocomplete', 'off');
    textarea.setAttribute('autocapitalize', 'off');
    textarea.style.overflow = 'auto';
    textarea.style.resize = 'none';
    textarea.style.width = '600px';
    textarea.style.height = '370px';
    textarea.style.marginBottom = '16px';

    textarea.value = mxUtils.getPrettyXml(editorUi.editor.getGraphXml());
    div.appendChild(textarea);

    this.init = function () {
        textarea.focus();
    };

    // Enables dropping files
    if (Graph.fileSupport) {
        function handleDrop(evt) {
            evt.stopPropagation();
            evt.preventDefault();

            if (evt.dataTransfer.files.length > 0) {
                var file = evt.dataTransfer.files[0];
                var reader = new FileReader();

                reader.onload = function (e) {
                    textarea.value = e.target.result;
                };

                reader.readAsText(file);
            } else {
                textarea.value = editorUi.extractGraphModelFromEvent(evt);
            }
        };

        function handleDragOver(evt) {
            evt.stopPropagation();
            evt.preventDefault();
        };

        // Setup the dnd listeners.
        textarea.addEventListener('dragover', handleDragOver, false);
        textarea.addEventListener('drop', handleDrop, false);
    }

    var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
        editorUi.hideDialog();
    });
    cancelBtn.className = 'geBtn';

    if (editorUi.editor.cancelFirst) {
        div.appendChild(cancelBtn);
    }

    var select = document.createElement('select');
    select.style.width = '180px';
    select.className = 'geBtn';

    if (editorUi.editor.graph.isEnabled()) {
        var replaceOption = document.createElement('option');
        replaceOption.setAttribute('value', 'replace');
        mxUtils.write(replaceOption, mxResources.get('replaceExistingDrawing'));
        select.appendChild(replaceOption);
    }

    var newOption = document.createElement('option');
    newOption.setAttribute('value', 'new');
    mxUtils.write(newOption, mxResources.get('openInNewWindow'));

    if (EditDiagramDialog.showNewWindowOption) {
        select.appendChild(newOption);
    }

    if (editorUi.editor.graph.isEnabled()) {
        var importOption = document.createElement('option');
        importOption.setAttribute('value', 'import');
        mxUtils.write(importOption, mxResources.get('addToExistingDrawing'));
        select.appendChild(importOption);
    }

    div.appendChild(select);

    var okBtn = mxUtils.button(mxResources.get('ok'), function () {
        // Removes all illegal control characters before parsing
        var data = editorUi.editor.graph.zapGremlins(mxUtils.trim(textarea.value));
        var error = null;

        if (select.value == 'new') {
            window.openFile = new OpenFile(function () {
                editorUi.hideDialog();
                window.openFile = null;
            });

            window.openFile.setData(data, null);
            window.open(editorUi.getUrl());
        } else if (select.value == 'replace') {
            editorUi.editor.graph.model.beginUpdate();
            try {
                editorUi.editor.setGraphXml(mxUtils.parseXml(data).documentElement);
                // LATER: Why is hideDialog between begin-/endUpdate faster?
                editorUi.hideDialog();
            } catch (e) {
                error = e;
            } finally {
                editorUi.editor.graph.model.endUpdate();
            }
        } else if (select.value == 'import') {
            editorUi.editor.graph.model.beginUpdate();
            try {
                var doc = mxUtils.parseXml(data);
                var model = new mxGraphModel();
                var codec = new mxCodec(doc);
                codec.decode(doc.documentElement, model);

                var children = model.getChildren(model.getChildAt(model.getRoot(), 0));
                editorUi.editor.graph.setSelectionCells(editorUi.editor.graph.importCells(children));

                // LATER: Why is hideDialog between begin-/endUpdate faster?
                editorUi.hideDialog();
            } catch (e) {
                error = e;
            } finally {
                editorUi.editor.graph.model.endUpdate();
            }
        }

        if (error != null) {
            mxUtils.alert(error.message);
        }
    });
    okBtn.className = 'geBtn gePrimaryBtn';
    div.appendChild(okBtn);

    if (!editorUi.editor.cancelFirst) {
        div.appendChild(cancelBtn);
    }

    this.container = div;
};

/**
 *
 */
EditDiagramDialog.showNewWindowOption = true;

/**
 * Constructs a new export dialog.
 */
var ExportDialog = function (editorUi) {
    var graph = editorUi.editor.graph;
    var bounds = graph.getGraphBounds();
    var scale = graph.view.scale;

    var width = Math.ceil(bounds.width / scale);
    var height = Math.ceil(bounds.height / scale);

    var row, td;

    var table = document.createElement('table');
    var tbody = document.createElement('tbody');
    table.setAttribute('cellpadding', (mxClient.IS_SF) ? '0' : '2');

    row = document.createElement('tr');

    td = document.createElement('td');
    td.style.fontSize = '10pt';
    td.style.width = '100px';
    mxUtils.write(td, mxResources.get('filename') + ':');

    row.appendChild(td);

    var nameInput = document.createElement('input');
    nameInput.setAttribute('value', editorUi.editor.getOrCreateFilename());
    nameInput.style.width = '180px';

    td = document.createElement('td');
    td.appendChild(nameInput);
    row.appendChild(td);

    tbody.appendChild(row);

    row = document.createElement('tr');

    td = document.createElement('td');
    td.style.fontSize = '10pt';
    mxUtils.write(td, mxResources.get('format') + ':');

    row.appendChild(td);

    var imageFormatSelect = document.createElement('select');
    imageFormatSelect.style.width = '180px';

    var pngOption = document.createElement('option');
    pngOption.setAttribute('value', 'png');
    mxUtils.write(pngOption, mxResources.get('formatPng'));
    imageFormatSelect.appendChild(pngOption);

    var gifOption = document.createElement('option');

    /*
    if (ExportDialog.showGifOption) {
        gifOption.setAttribute('value', 'gif');
        mxUtils.write(gifOption, mxResources.get('formatGif'));
        imageFormatSelect.appendChild(gifOption);
    }
    */
    var jpgOption = document.createElement('option');
    jpgOption.setAttribute('value', 'jpg');
    mxUtils.write(jpgOption, mxResources.get('formatJpg'));
    imageFormatSelect.appendChild(jpgOption);
    /*
    var pdfOption = document.createElement('option');
    pdfOption.setAttribute('value', 'pdf');
    mxUtils.write(pdfOption, mxResources.get('formatPdf'));
    imageFormatSelect.appendChild(pdfOption);
    */
    var svgOption = document.createElement('option');
    svgOption.setAttribute('value', 'svg');
    mxUtils.write(svgOption, mxResources.get('formatSvg'));
    imageFormatSelect.appendChild(svgOption);

    if (ExportDialog.showXmlOption) {
        var xmlOption = document.createElement('option');
        xmlOption.setAttribute('value', 'xml');
        mxUtils.write(xmlOption, mxResources.get('formatXml'));
        imageFormatSelect.appendChild(xmlOption);
    }

    td = document.createElement('td');
    td.appendChild(imageFormatSelect);
    row.appendChild(td);

    tbody.appendChild(row);

    row = document.createElement('tr');

    td = document.createElement('td');
    td.style.fontSize = '10pt';
    mxUtils.write(td, mxResources.get('zoom') + ' (%):');

    row.appendChild(td);

    var zoomInput = document.createElement('input');
    zoomInput.setAttribute('type', 'number');
    zoomInput.setAttribute('value', '100');
    zoomInput.style.width = '180px';

    td = document.createElement('td');
    td.appendChild(zoomInput);
    row.appendChild(td);

    tbody.appendChild(row);

    row = document.createElement('tr');

    td = document.createElement('td');
    td.style.fontSize = '10pt';
    mxUtils.write(td, mxResources.get('width') + ':');

    row.appendChild(td);

    var widthInput = document.createElement('input');
    widthInput.setAttribute('value', width);
    widthInput.style.width = '180px';

    td = document.createElement('td');
    td.appendChild(widthInput);
    row.appendChild(td);

    tbody.appendChild(row);

    row = document.createElement('tr');

    td = document.createElement('td');
    td.style.fontSize = '10pt';
    mxUtils.write(td, mxResources.get('height') + ':');

    row.appendChild(td);

    var heightInput = document.createElement('input');
    heightInput.setAttribute('value', height);
    heightInput.style.width = '180px';

    td = document.createElement('td');
    td.appendChild(heightInput);
    row.appendChild(td);

    tbody.appendChild(row);

    row = document.createElement('tr');

    td = document.createElement('td');
    td.style.fontSize = '10pt';
    mxUtils.write(td, mxResources.get('background') + ':');

    row.appendChild(td);

    var transparentCheckbox = document.createElement('input');
    transparentCheckbox.setAttribute('type', 'checkbox');
    transparentCheckbox.checked = graph.background == null || graph.background == mxConstants.NONE;

    td = document.createElement('td');
    td.appendChild(transparentCheckbox);
    mxUtils.write(td, mxResources.get('transparent'));

    row.appendChild(td);

    tbody.appendChild(row);

    row = document.createElement('tr');

    td = document.createElement('td');
    td.style.fontSize = '10pt';
    mxUtils.write(td, mxResources.get('borderWidth') + ':');

    row.appendChild(td);

    var borderInput = document.createElement('input');
    borderInput.setAttribute('type', 'number');
    borderInput.setAttribute('value', ExportDialog.lastBorderValue);
    borderInput.style.width = '180px';

    td = document.createElement('td');
    td.appendChild(borderInput);
    row.appendChild(td);

    tbody.appendChild(row);
    table.appendChild(tbody);

    // Handles changes in the export format
    function formatChanged() {
        var name = nameInput.value;
        var dot = name.lastIndexOf('.');

        if (dot > 0) {
            nameInput.value = name.substring(0, dot + 1) + imageFormatSelect.value;
        } else {
            nameInput.value = name + '.' + imageFormatSelect.value;
        }

        if (imageFormatSelect.value === 'xml') {
            zoomInput.setAttribute('disabled', 'true');
            widthInput.setAttribute('disabled', 'true');
            heightInput.setAttribute('disabled', 'true');
            borderInput.setAttribute('disabled', 'true');
        } else {
            zoomInput.removeAttribute('disabled');
            widthInput.removeAttribute('disabled');
            heightInput.removeAttribute('disabled');
            borderInput.removeAttribute('disabled');
        }

        if (imageFormatSelect.value === 'png' || imageFormatSelect.value === 'svg') {
            transparentCheckbox.removeAttribute('disabled');
        } else {
            transparentCheckbox.setAttribute('disabled', 'disabled');
        }
    };

    mxEvent.addListener(imageFormatSelect, 'change', formatChanged);
    formatChanged();

    function checkValues() {
        if (widthInput.value * heightInput.value > MAX_AREA || widthInput.value <= 0) {
            widthInput.style.backgroundColor = 'red';
        } else {
            widthInput.style.backgroundColor = '';
        }

        if (widthInput.value * heightInput.value > MAX_AREA || heightInput.value <= 0) {
            heightInput.style.backgroundColor = 'red';
        } else {
            heightInput.style.backgroundColor = '';
        }
    };

    mxEvent.addListener(zoomInput, 'change', function () {
        var s = Math.max(0, parseFloat(zoomInput.value) || 100) / 100;
        zoomInput.value = parseFloat((s * 100).toFixed(2));

        if (width > 0) {
            widthInput.value = Math.floor(width * s);
            heightInput.value = Math.floor(height * s);
        } else {
            zoomInput.value = '100';
            widthInput.value = width;
            heightInput.value = height;
        }

        checkValues();
    });

    mxEvent.addListener(widthInput, 'change', function () {
        var s = parseInt(widthInput.value) / width;

        if (s > 0) {
            zoomInput.value = parseFloat((s * 100).toFixed(2));
            heightInput.value = Math.floor(height * s);
        } else {
            zoomInput.value = '100';
            widthInput.value = width;
            heightInput.value = height;
        }

        checkValues();
    });

    mxEvent.addListener(heightInput, 'change', function () {
        var s = parseInt(heightInput.value) / height;

        if (s > 0) {
            zoomInput.value = parseFloat((s * 100).toFixed(2));
            widthInput.value = Math.floor(width * s);
        } else {
            zoomInput.value = '100';
            widthInput.value = width;
            heightInput.value = height;
        }

        checkValues();
    });

    row = document.createElement('tr');
    td = document.createElement('td');
    td.setAttribute('align', 'right');
    td.style.paddingTop = '22px';
    td.colSpan = 2;

    var saveBtn = mxUtils.button(mxResources.get('export'), mxUtils.bind(this, function () {
        if (parseInt(zoomInput.value) <= 0) {
            mxUtils.alert(mxResources.get('drawingEmpty'));
        } else {
            var name = nameInput.value;
            var format = imageFormatSelect.value;
            var s = Math.max(0, parseFloat(zoomInput.value) || 100) / 100;
            var b = Math.max(0, parseInt(borderInput.value));
            var bg = graph.background;

            if ((format == 'svg' || format == 'png') && transparentCheckbox.checked) {
                bg = null;
            } else if (bg == null || bg == mxConstants.NONE) {
                bg = '#ffffff';
            }

            ExportDialog.lastBorderValue = b;
            ExportDialog.exportFile(editorUi, name, format, bg, s, b);
        }
    }));
    saveBtn.className = 'geBtn gePrimaryBtn';

    var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
        editorUi.hideDialog();
    });
    cancelBtn.className = 'geBtn';

    if (editorUi.editor.cancelFirst) {
        td.appendChild(cancelBtn);
        td.appendChild(saveBtn);
    } else {
        td.appendChild(saveBtn);
        td.appendChild(cancelBtn);
    }

    row.appendChild(td);
    tbody.appendChild(row);
    table.appendChild(tbody);
    this.container = table;
};

/**
 * Remembers last value for border.
 */
ExportDialog.lastBorderValue = 0;

/**
 * Global switches for the export dialog.
 */
ExportDialog.showGifOption = true;

/**
 * Global switches for the export dialog.
 */
ExportDialog.showXmlOption = true;

/**
 * Hook for getting the export format. Returns null for the default
 * intermediate XML export format or a function that returns the
 * parameter and value to be used in the request in the form
 * key=value, where value should be URL encoded.
 */
ExportDialog.exportFile = function (editorUi, name, format, bg, s, b) {
    var graph = editorUi.editor.graph;

    function download(data) {
        var file = new Blob([data], {type: format});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, name);
        else { // Others
            var a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    if (format === 'xml') {
        xml = mxUtils.getXml(editorUi.editor.getGraphXml());

        //Convert risk objects (threats and consequences) to xml

        let dataObject = new Object();
        dataObject.threats = [];
        dataObject.consequences = [];
        let encoder = new mxCodec(mxUtils.createXmlDocument());
        if (editorUi.editor.graph.threats.length > 0) {
            // Convert threats object into generic javascript Object
            let threatsObjects = [];
            editorUi.editor.graph.threats.forEach(threat => {
                threatObject = {...threat};
                barriersObjects = [];
                threat.barriers.forEach(barrier => {
                    barriersObjects.push({...barrier})
                });
                threatObject._barriers = barriersObjects;
                threatObject._matrix = {...threat._matrix};
                threatsObjects.push(threatObject);
            });
            dataObject.threats = threatsObjects;
        }

        if (editorUi.editor.graph.consequences.length > 0) {

            // Convert threats object into generic javascript Object
            let consequencesObjects = [];
            editorUi.editor.graph.consequences.forEach(consequence => {
                consequenceObject = {...consequence};
                barriersObjects = [];
                consequence.barriers.forEach(barrier => {
                    barriersObjects.push({...barrier})
                });
                consequenceObject._barriers = barriersObjects;
                consequencesObjects.push(consequenceObject);
            });
            dataObject.consequences = consequencesObjects;
        }

        let result = encoder.encode(dataObject);
        let dataXml = mxUtils.getXml(result);

        //Append dataXml to the graph xml and embed it inside a root diagram xml tag
        xml = "<diagram>" + xml + dataXml + "</diagram>";
        download(xml);
        //ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(editorUi.editor.getGraphXml()), name, format);
    } else if (format === 'svg') {
        svg = mxUtils.getXml(graph.getSvg(bg, s, b));
        download(svg);
        //ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(graph.getSvg(bg, s, b)), name, format);
    } else if (format === 'png' || format === 'jpg') {
        const svg = mxUtils.getXml(graph.getSvg(bg, s, b));

        function svgToPng(svg, callback) {
            const url = getSvgUrl(svg);
            svgUrlToFormat(url, (imgData) => {
                callback(imgData);
                URL.revokeObjectURL(url);
            });
        }

        function getSvgUrl(svg) {
            var svg64 = btoa(unescape(encodeURIComponent(svg)));
            var b64start = 'data:image/svg+xml;base64,';
            return b64start + svg64;
        }

        function svgUrlToFormat(svgUrl, callback) {
            // console.log(svgUrl)
            const svgImage = new Image();
            svgImage.crossOrigin = "*";
            // imgPreview.style.position = 'absolute';
            // imgPreview.style.top = '-9999px';
            document.body.appendChild(svgImage);
            svgImage.onload = function () {
                const canvas = document.createElement('canvas');
                canvas.width = svgImage.clientWidth;
                canvas.height = svgImage.clientHeight;
                const canvasCtx = canvas.getContext('2d');
                try {
                    canvasCtx.drawImage(svgImage, 0, 0);
                    let trueFormat = format;
                    if (format === 'jpg') {
                        trueFormat = "jpeg"
                    }
                    const type = "image/" + trueFormat
                    const imgData = canvas.toDataURL(type);
                    callback(imgData);
                } catch (e) {
                    alert("Unexpected error occured during export")
                }
                svgImage.onerror = function () {
                    console.log("could not load image")
                }
                document.body.removeChild(svgImage);
            };
            svgImage.src = svgUrl;
        }

        svgToPng(svg, (imgData) => {
            const pngImage = document.createElement('img');
            document.body.appendChild(pngImage);
            pngImage.src = imgData;
            var a = document.createElement("a"),
                url = imgData;
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);

        });

        /*

        var bounds = graph.getGraphBounds();

        // New image export
        var xmlDoc = mxUtils.createXmlDocument();
        var root = xmlDoc.createElement('output');
        xmlDoc.appendChild(root);

        // Renders graph. Offset will be multiplied with state's scale when painting state.
        var xmlCanvas = new mxXmlCanvas2D(root);
        xmlCanvas.translate(Math.floor((b / s - bounds.x) / graph.view.scale),
            Math.floor((b / s - bounds.y) / graph.view.scale));
        xmlCanvas.scale(s / graph.view.scale);

        var imgExport = new mxImageExport()

        imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);

        // Puts request data together
        var param = 'xml=' + encodeURIComponent(mxUtils.getXml(root));
        var w = Math.ceil(bounds.width * s / graph.view.scale + 2 * b);
        var h = Math.ceil(bounds.height * s / graph.view.scale + 2 * b);

        // Requests image if request is valid
        if (param.length <= MAX_REQUEST_SIZE && w * h < MAX_AREA)
        {
            mxClient.NO_FO = true
            editorUi.hideDialog();
            var req = new mxXmlRequest(EXPORT_URL, 'format=' + format +
                '&filename=' + encodeURIComponent(name) +
                '&bg=' + ((bg != null) ? bg : 'none') +
                '&w=' + w + '&h=' + h + '&' + param);
            req.simulate(document, '_blank');
        }
        else
        {
            mxUtils.alert(mxResources.get('drawingTooLarge'));
        }

         */
    } else if (format === 'pdf' || 'gif') {
        alert("Those parameters are not yet supported")
    }
};

/**
 * Hook for getting the export format. Returns null for the default
 * intermediate XML export format or a function that returns the
 * parameter and value to be used in the request in the form
 * key=value, where value should be URL encoded.
 */
ExportDialog.saveLocalFile = function (editorUi, data, filename, format) {
    if (data.length < MAX_REQUEST_SIZE) {
        editorUi.hideDialog();
        var req = new mxXmlRequest(LOCAL_SAVE_URL, 'xml=' + encodeURIComponent(data) + '&filename=' +
            encodeURIComponent(filename) + '&format=' + format);
        req.simulate(document, '_blank');
    } else {
        mxUtils.alert(mxResources.get('drawingTooLarge'));
        mxUtils.popup(xml);
    }
};

/**
 * Constructs a new metadata dialog.
 */
var EditDataDialog = function (ui, cell) {
    var div = document.createElement('div');
    var graph = ui.editor.graph;

    div.style.height = '600px';
    div.style.overflow = 'auto';

    var value = graph.getModel().getValue(cell);

    // Converts the value to an XML node
    if (!mxUtils.isNode(value)) {
        var doc = mxUtils.createXmlDocument();
        var obj = doc.createElement('object');
        obj.setAttribute('label', value || '');
        value = obj;
    }

    // Creates the dialog contents
    var form = new mxForm('properties');
    form.table.style.width = '100%';
    form.table.style.paddingRight = '20px';

    var attrs = value.attributes;
    var names = [];
    var texts = [];
    var count = 0;

    // FIXME: Fix remove button for quirks mode
    var addRemoveButton = function (text, name) {
        text.parentNode.style.marginRight = '12px';

        var removeAttr = document.createElement('a');
        var img = mxUtils.createImage(Dialog.prototype.closeImage);
        img.style.height = '9px';
        img.style.fontSize = '9px';
        img.style.marginBottom = (mxClient.IS_IE11) ? '-1px' : '5px';

        removeAttr.className = 'geButton';
        removeAttr.setAttribute('title', mxResources.get('delete'));
        removeAttr.style.margin = '0px';
        removeAttr.style.width = '14px';
        removeAttr.style.height = '14px';
        removeAttr.style.fontSize = '14px';
        removeAttr.style.cursor = 'pointer';
        removeAttr.style.marginLeft = '6px';
        removeAttr.appendChild(img);

        var removeAttrFn = (function (name) {
            return function () {
                var count = 0;

                for (var j = 0; j < names.length; j++) {
                    if (names[j] == name) {
                        texts[j] = null;
                        form.table.deleteRow(count);

                        break;
                    }

                    if (texts[j] != null) {
                        count++;
                    }
                }
            };
        })(name);

        mxEvent.addListener(removeAttr, 'click', removeAttrFn);

        text.parentNode.style.whiteSpace = 'nowrap';
        text.parentNode.appendChild(removeAttr);
    };

    var addTextArea = function (index, name, value) {
        names[index] = name;
        texts[index] = form.addTextarea(names[count] + ':', value, 2);
        texts[index].style.width = '100%';

        addRemoveButton(texts[index], name);
    };

    var temp = [];

    for (var i = 0; i < attrs.length; i++) {
        if (attrs[i].nodeName != 'label' && attrs[i].nodeName != 'placeholders') {
            temp.push({name: attrs[i].nodeName, value: attrs[i].nodeValue});
        }
    }

    // Sorts by name
    temp.sort(function (a, b) {
        if (a.name < b.name) {
            return -1;
        } else if (a.name > b.name) {
            return 1;
        } else {
            return 0;
        }
    });

    for (var i = 0; i < temp.length; i++) {
        addTextArea(count, temp[i].name, temp[i].value);
        count++;
    }

    div.appendChild(form.table);

    var newProp = document.createElement('div');
    newProp.style.whiteSpace = 'nowrap';
    newProp.style.marginTop = '6px';

    var nameInput = document.createElement('input');
    nameInput.setAttribute('placeholder', mxResources.get('enterPropertyName'));
    nameInput.setAttribute('type', 'text');
    nameInput.setAttribute('size', (mxClient.IS_IE || mxClient.IS_IE11) ? '18' : '22');
    nameInput.style.marginLeft = '2px';

    newProp.appendChild(nameInput);
    div.appendChild(newProp);

    var addBtn = mxUtils.button(mxResources.get('addProperty'), function () {
        var name = nameInput.value;

        // Avoid ':' in attribute names which seems to be valid in Chrome
        if (name.length > 0 && name != 'label' && name != 'placeholders' && name.indexOf(':') < 0) {
            try {
                var idx = mxUtils.indexOf(names, name);

                if (idx >= 0 && texts[idx] != null) {
                    texts[idx].focus();
                } else {
                    // Checks if the name is valid
                    var clone = value.cloneNode(false);
                    clone.setAttribute(name, '');

                    if (idx >= 0) {
                        names.splice(idx, 1);
                        texts.splice(idx, 1);
                    }

                    names.push(name);
                    var text = form.addTextarea(name + ':', '', 2);
                    text.style.width = '100%';
                    texts.push(text);
                    addRemoveButton(text, name);

                    text.focus();
                }

                nameInput.value = '';
            } catch (e) {
                mxUtils.alert(e);
            }
        } else {
            mxUtils.alert(mxResources.get('invalidName'));
        }
    });

    this.init = function () {
        if (texts.length > 0) {
            texts[0].focus();
        } else {
            nameInput.focus();
        }
    };

    addBtn.setAttribute('disabled', 'disabled');
    addBtn.style.marginLeft = '10px';
    addBtn.style.width = '144px';
    newProp.appendChild(addBtn);

    var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
        ui.hideDialog.apply(ui, arguments);
    });
    cancelBtn.className = 'geBtn';

    var applyBtn = mxUtils.button(mxResources.get('apply'), function () {
        try {
            ui.hideDialog.apply(ui, arguments);

            // Clones and updates the value
            value = value.cloneNode(true);
            var removeLabel = false;

            for (var i = 0; i < names.length; i++) {
                if (texts[i] == null) {
                    value.removeAttribute(names[i]);
                } else {
                    value.setAttribute(names[i], texts[i].value);
                    removeLabel = removeLabel || (names[i] == 'placeholder' &&
                        value.getAttribute('placeholders') == '1');
                }
            }

            // Removes label if placeholder is assigned
            if (removeLabel) {
                value.removeAttribute('label');
            }

            // Updates the value of the cell (undoable)
            graph.getModel().setValue(cell, value);
        } catch (e) {
            mxUtils.alert(e);
        }
    });
    applyBtn.className = 'geBtn gePrimaryBtn';

    function updateAddBtn() {
        if (nameInput.value.length > 0) {
            addBtn.removeAttribute('disabled');
        } else {
            addBtn.setAttribute('disabled', 'disabled');
        }
    };

    mxEvent.addListener(nameInput, 'keyup', updateAddBtn);

    // Catches all changes that don't fire a keyup (such as paste via mouse)
    mxEvent.addListener(nameInput, 'change', updateAddBtn);

    var buttons = document.createElement('div');
    buttons.style.marginTop = '18px';
    buttons.style.textAlign = 'right';

    if (ui.editor.graph.getModel().isVertex(cell) || ui.editor.graph.getModel().isEdge(cell)) {
        var replace = document.createElement('span');
        replace.style.marginRight = '10px';
        var input = document.createElement('input');
        input.setAttribute('type', 'checkbox');
        input.style.marginRight = '6px';

        if (value.getAttribute('placeholders') == '1') {
            input.setAttribute('checked', 'checked');
            input.defaultChecked = true;
        }

        mxEvent.addListener(input, 'click', function () {
            if (value.getAttribute('placeholders') == '1') {
                value.removeAttribute('placeholders');
            } else {
                value.setAttribute('placeholders', '1');
            }
        });

        replace.appendChild(input);
        mxUtils.write(replace, mxResources.get('placeholders'));

        if (EditDataDialog.placeholderHelpLink != null) {
            var link = document.createElement('a');
            link.setAttribute('href', EditDataDialog.placeholderHelpLink);
            link.setAttribute('title', mxResources.get('help'));
            link.setAttribute('target', '_blank');
            link.style.marginLeft = '10px';
            link.style.cursor = 'help';

            var icon = document.createElement('img');
            icon.setAttribute('border', '0');
            icon.setAttribute('valign', 'middle');
            icon.style.marginTop = (mxClient.IS_IE11) ? '0px' : '-4px';
            icon.setAttribute('src', Editor.helpImage);
            link.appendChild(icon);

            replace.appendChild(link);
        }

        buttons.appendChild(replace);
    }

    if (ui.editor.cancelFirst) {
        buttons.appendChild(cancelBtn);
        buttons.appendChild(applyBtn);
    } else {
        buttons.appendChild(applyBtn);
        buttons.appendChild(cancelBtn);
    }

    div.appendChild(buttons);
    this.container = div;
};

/**
 * Optional help link.
 */
EditDataDialog.placeholderHelpLink = null;


/**
 * Constructs a new link dialog.
 */
var LinkDialog = function (editorUi, initialValue, btnLabel, fn) {
    var div = document.createElement('div');
    mxUtils.write(div, mxResources.get('editLink') + ':');

    var inner = document.createElement('div');
    inner.className = 'geTitle';
    inner.style.backgroundColor = 'transparent';
    inner.style.borderColor = 'transparent';
    inner.style.whiteSpace = 'nowrap';
    inner.style.textOverflow = 'clip';
    inner.style.cursor = 'default';

    if (!mxClient.IS_VML) {
        inner.style.paddingRight = '20px';
    }

    var linkInput = document.createElement('input');
    linkInput.setAttribute('value', initialValue);
    linkInput.setAttribute('placeholder', 'http://www.example.com/');
    linkInput.setAttribute('type', 'text');
    linkInput.style.marginTop = '6px';
    linkInput.style.width = '400px';
    linkInput.style.backgroundImage = 'url(\'' + Dialog.prototype.clearImage + '\')';
    linkInput.style.backgroundRepeat = 'no-repeat';
    linkInput.style.backgroundPosition = '100% 50%';
    linkInput.style.paddingRight = '14px';

    var cross = document.createElement('div');
    cross.setAttribute('title', mxResources.get('reset'));
    cross.style.position = 'relative';
    cross.style.left = '-16px';
    cross.style.width = '12px';
    cross.style.height = '14px';
    cross.style.cursor = 'pointer';

    // Workaround for inline-block not supported in IE
    cross.style.display = (mxClient.IS_VML) ? 'inline' : 'inline-block';
    cross.style.top = ((mxClient.IS_VML) ? 0 : 3) + 'px';

    // Needed to block event transparency in IE
    cross.style.background = 'url(' + IMAGE_PATH + '/transparent.gif)';

    mxEvent.addListener(cross, 'click', function () {
        linkInput.value = '';
        linkInput.focus();
    });

    inner.appendChild(linkInput);
    inner.appendChild(cross);
    div.appendChild(inner);

    this.init = function () {
        linkInput.focus();

        if (mxClient.IS_FF || document.documentMode >= 5 || mxClient.IS_QUIRKS) {
            linkInput.select();
        } else {
            document.execCommand('selectAll', false, null);
        }
    };

    var btns = document.createElement('div');
    btns.style.marginTop = '18px';
    btns.style.textAlign = 'right';

    mxEvent.addListener(linkInput, 'keypress', function (e) {
        if (e.keyCode == 13) {
            editorUi.hideDialog();
            fn(linkInput.value);
        }
    });

    var cancelBtn = mxUtils.button(mxResources.get('cancel'), function () {
        editorUi.hideDialog();
    });
    cancelBtn.className = 'geBtn';

    if (editorUi.editor.cancelFirst) {
        btns.appendChild(cancelBtn);
    }

    var mainBtn = mxUtils.button(btnLabel, function () {
        editorUi.hideDialog();
        fn(linkInput.value);
    });
    mainBtn.className = 'geBtn gePrimaryBtn';
    btns.appendChild(mainBtn);

    if (!editorUi.editor.cancelFirst) {
        btns.appendChild(cancelBtn);
    }

    div.appendChild(btns);

    this.container = div;
};

/**
 *
 */
var OutlineWindow = function (editorUi, x, y, w, h) {
    var graph = editorUi.editor.graph;

    var div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.border = '1px solid whiteSmoke';
    div.style.overflow = 'hidden';

    this.window = new mxWindow(mxResources.get('outline'), div, x, y, w, h, true, true);
    this.window.destroyOnClose = false;
    this.window.setMaximizable(false);
    this.window.setResizable(true);
    this.window.setClosable(true);
    this.window.setVisible(true);

    this.window.setLocation = function (x, y) {
        var iw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var ih = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        x = Math.max(0, Math.min(x, iw - this.table.clientWidth));
        y = Math.max(0, Math.min(y, ih - this.table.clientHeight - 48));

        if (this.getX() != x || this.getY() != y) {
            mxWindow.prototype.setLocation.apply(this, arguments);
        }
    };

    mxEvent.addListener(window, 'resize', mxUtils.bind(this, function () {
        var x = this.window.getX();
        var y = this.window.getY();

        this.window.setLocation(x, y);
    }));

    var outline = editorUi.createOutline(this.window);

    this.window.addListener(mxEvent.RESIZE, mxUtils.bind(this, function () {
        outline.update(false);
        outline.outline.sizeDidChange();
    }));

    this.window.addListener(mxEvent.SHOW, mxUtils.bind(this, function () {
        outline.suspended = false;
        outline.outline.refresh();
        outline.update();
    }));

    this.window.addListener(mxEvent.HIDE, mxUtils.bind(this, function () {
        outline.suspended = true;
    }));

    this.window.addListener(mxEvent.NORMALIZE, mxUtils.bind(this, function () {
        outline.suspended = false;
        outline.update();
    }));

    this.window.addListener(mxEvent.MINIMIZE, mxUtils.bind(this, function () {
        outline.suspended = true;
    }));

    var outlineCreateGraph = outline.createGraph;
    outline.createGraph = function (container) {
        var g = outlineCreateGraph.apply(this, arguments);
        g.gridEnabled = false;
        g.pageScale = graph.pageScale;
        g.pageFormat = graph.pageFormat;
        g.background = graph.background;
        g.pageVisible = graph.pageVisible;

        var current = mxUtils.getCurrentStyle(graph.container);
        div.style.backgroundColor = current.backgroundColor;

        return g;
    };

    function update() {
        outline.outline.pageScale = graph.pageScale;
        outline.outline.pageFormat = graph.pageFormat;
        outline.outline.pageVisible = graph.pageVisible;
        outline.outline.background = graph.background;

        var current = mxUtils.getCurrentStyle(graph.container);
        div.style.backgroundColor = current.backgroundColor;

        if (graph.view.backgroundPageShape != null && outline.outline.view.backgroundPageShape != null) {
            outline.outline.view.backgroundPageShape.fill = graph.view.backgroundPageShape.fill;
        }

        outline.outline.refresh();
    };

    outline.init(div);

    editorUi.editor.addListener('resetGraphView', update);
    editorUi.addListener('pageFormatChanged', update);
    editorUi.addListener('backgroundColorChanged', update);
    editorUi.addListener('backgroundImageChanged', update);
    editorUi.addListener('pageViewChanged', function () {
        update();
        outline.update(true);
    });

    if (outline.outline.dialect == mxConstants.DIALECT_SVG) {
        var zoomInAction = editorUi.actions.get('zoomIn');
        var zoomOutAction = editorUi.actions.get('zoomOut');

        mxEvent.addMouseWheelListener(function (evt, up) {
            var outlineWheel = false;
            var source = mxEvent.getSource(evt);

            while (source != null) {
                if (source == outline.outline.view.canvas.ownerSVGElement) {
                    outlineWheel = true;
                    break;
                }

                source = source.parentNode;
            }

            if (outlineWheel) {
                if (up) {
                    zoomInAction.funct();
                } else {
                    zoomOutAction.funct();
                }

                mxEvent.consume(evt);
            }
        });
    }
};

/**
 *
 */
var LayersWindow = function (editorUi, x, y, w, h) {
    var graph = editorUi.editor.graph;

    var div = document.createElement('div');
    div.style.userSelect = 'none';
    div.style.background = 'whiteSmoke';
    div.style.border = '1px solid whiteSmoke';
    div.style.height = '100%';
    div.style.marginBottom = '10px';
    div.style.overflow = 'auto';

    var tbarHeight = (!EditorUi.compactUi) ? '30px' : '26px';

    var listDiv = document.createElement('div')
    listDiv.style.backgroundColor = '#e5e5e5';
    listDiv.style.position = 'absolute';
    listDiv.style.overflow = 'auto';
    listDiv.style.left = '0px';
    listDiv.style.right = '0px';
    listDiv.style.top = '0px';
    listDiv.style.bottom = (parseInt(tbarHeight) + 7) + 'px';
    div.appendChild(listDiv);

    var dragSource = null;
    var dropIndex = null;

    mxEvent.addListener(div, 'dragover', function (evt) {
        evt.dataTransfer.dropEffect = 'move';
        dropIndex = 0;
        evt.stopPropagation();
        evt.preventDefault();
    });

    // Workaround for "no element found" error in FF
    mxEvent.addListener(div, 'drop', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
    });

    var layerCount = null;
    var selectionLayer = null;

    var ldiv = document.createElement('div');

    ldiv.className = 'geToolbarContainer';
    ldiv.style.position = 'absolute';
    ldiv.style.bottom = '0px';
    ldiv.style.left = '0px';
    ldiv.style.right = '0px';
    ldiv.style.height = tbarHeight;
    ldiv.style.overflow = 'hidden';
    ldiv.style.padding = (!EditorUi.compactUi) ? '1px' : '4px 0px 3px 0px';
    ldiv.style.backgroundColor = 'whiteSmoke';
    ldiv.style.borderWidth = '1px 0px 0px 0px';
    ldiv.style.borderColor = '#c3c3c3';
    ldiv.style.borderStyle = 'solid';
    ldiv.style.display = 'block';
    ldiv.style.whiteSpace = 'nowrap';

    if (mxClient.IS_QUIRKS) {
        ldiv.style.filter = 'none';
    }

    var link = document.createElement('a');
    link.className = 'geButton';

    if (mxClient.IS_QUIRKS) {
        link.style.filter = 'none';
    }

    var removeLink = link.cloneNode();
    removeLink.innerHTML = '<div class="geSprite geSprite-delete" style="display:inline-block;"></div>';

    mxEvent.addListener(removeLink, 'click', function (evt) {
        if (graph.isEnabled()) {
            graph.model.beginUpdate();
            try {
                var index = graph.model.root.getIndex(selectionLayer);
                graph.removeCells([selectionLayer], false);

                // Creates default layer if no layer exists
                if (graph.model.getChildCount(graph.model.root) == 0) {
                    graph.model.add(graph.model.root, new mxCell());
                    graph.setDefaultParent(null);
                } else if (index > 0 && index <= graph.model.getChildCount(graph.model.root)) {
                    graph.setDefaultParent(graph.model.getChildAt(graph.model.root, index - 1));
                } else {
                    graph.setDefaultParent(null);
                }
            } finally {
                graph.model.endUpdate();
            }
        }

        mxEvent.consume(evt);
    });

    if (!graph.isEnabled()) {
        removeLink.className = 'geButton mxDisabled';
    }

    ldiv.appendChild(removeLink);

    var insertLink = link.cloneNode();
    insertLink.innerHTML = '<div class="geSprite geSprite-insert" style="display:inline-block;"></div>';

    mxEvent.addListener(insertLink, 'click', function (evt) {
        if (graph.isEnabled() && !graph.isSelectionEmpty()) {
            graph.moveCells(graph.getSelectionCells(), 0, 0, false, selectionLayer);
        }
    });

    ldiv.appendChild(insertLink);

    var renameLink = link.cloneNode();
    renameLink.innerHTML = '<div class="geSprite geSprite-dots" style="display:inline-block;"></div>';
    renameLink.setAttribute('title', mxResources.get('rename'));

    function renameLayer(layer) {
        if (graph.isEnabled() && layer != null) {
            var dlg = new FilenameDialog(editorUi, layer.value || mxResources.get('background'), mxResources.get('rename'), mxUtils.bind(this, function (newValue) {
                if (newValue != null) {
                    graph.getModel().setValue(layer, newValue);
                }
            }), mxResources.get('enterName'));
            editorUi.showDialog(dlg.container, 300, 100, true, true);
            dlg.init();
        }
    };

    mxEvent.addListener(renameLink, 'click', function (evt) {
        if (graph.isEnabled()) {
            renameLayer(selectionLayer);
        }

        mxEvent.consume(evt);
    });

    if (!graph.isEnabled()) {
        renameLink.className = 'geButton mxDisabled';
    }

    ldiv.appendChild(renameLink);

    var duplicateLink = link.cloneNode();
    duplicateLink.innerHTML = '<div class="geSprite geSprite-duplicate" style="display:inline-block;"></div>';

    mxEvent.addListener(duplicateLink, 'click', function (evt) {
        if (graph.isEnabled()) {
            var newCell = null;
            graph.model.beginUpdate();
            try {
                newCell = graph.cloneCells([selectionLayer])[0];
                newCell.value = mxResources.get('untitledLayer');
                newCell.setVisible(true);
                newCell = graph.addCell(newCell, graph.model.root);
                graph.setDefaultParent(newCell);
            } finally {
                graph.model.endUpdate();
            }

            if (newCell != null && !graph.isCellLocked(newCell)) {
                graph.selectAll(newCell);
            }
        }
    });

    if (!graph.isEnabled()) {
        duplicateLink.className = 'geButton mxDisabled';
    }

    ldiv.appendChild(duplicateLink);

    var addLink = link.cloneNode();
    addLink.innerHTML = '<div class="geSprite geSprite-plus" style="display:inline-block;"></div>';
    addLink.setAttribute('title', mxResources.get('addLayer'));

    mxEvent.addListener(addLink, 'click', function (evt) {
        if (graph.isEnabled()) {
            graph.model.beginUpdate();

            try {
                var cell = graph.addCell(new mxCell(mxResources.get('untitledLayer')), graph.model.root);
                graph.setDefaultParent(cell);
            } finally {
                graph.model.endUpdate();
            }
        }

        mxEvent.consume(evt);
    });

    if (!graph.isEnabled()) {
        addLink.className = 'geButton mxDisabled';
    }

    ldiv.appendChild(addLink);

    div.appendChild(ldiv);

    function refresh() {
        layerCount = graph.model.getChildCount(graph.model.root)
        listDiv.innerHTML = '';

        function addLayer(index, label, child, defaultParent) {
            var ldiv = document.createElement('div');
            ldiv.className = 'geToolbarContainer';

            ldiv.style.overflow = 'hidden';
            ldiv.style.position = 'relative';
            ldiv.style.padding = '4px';
            ldiv.style.height = '22px';
            ldiv.style.display = 'block';
            ldiv.style.backgroundColor = 'whiteSmoke';
            ldiv.style.borderWidth = '0px 0px 1px 0px';
            ldiv.style.borderColor = '#c3c3c3';
            ldiv.style.borderStyle = 'solid';
            ldiv.style.whiteSpace = 'nowrap';

            var left = document.createElement('div');
            left.style.display = 'inline-block';
            left.style.width = '100%';
            left.style.textOverflow = 'ellipsis';
            left.style.overflow = 'hidden';

            mxEvent.addListener(ldiv, 'dragover', function (evt) {
                evt.dataTransfer.dropEffect = 'move';
                dropIndex = index;
                evt.stopPropagation();
                evt.preventDefault();
            });

            mxEvent.addListener(ldiv, 'dragstart', function (evt) {
                dragSource = ldiv;

                // Workaround for no DnD on DIV in FF
                if (mxClient.IS_FF) {
                    // LATER: Check what triggers a parse as XML on this in FF after drop
                    evt.dataTransfer.setData('Text', '<layer/>');
                }
            });

            mxEvent.addListener(ldiv, 'dragend', function (evt) {
                if (dragSource != null && dropIndex != null) {
                    graph.addCell(child, graph.model.root, dropIndex);
                }

                dragSource = null;
                dropIndex = null;
                evt.stopPropagation();
                evt.preventDefault();
            });

            var btn = document.createElement('img');
            btn.setAttribute('draggable', 'false');
            btn.setAttribute('align', 'top');
            btn.setAttribute('border', '0');
            btn.style.cursor = 'pointer';
            btn.style.padding = '4px';
            btn.setAttribute('title', mxResources.get('lockUnlock'));

            var state = graph.view.getState(child);
            var style = (state != null) ? state.style : graph.getCellStyle(child);

            if (mxUtils.getValue(style, 'locked', '0') == '1') {
                btn.setAttribute('src', Dialog.prototype.lockedImage);
            } else {
                btn.setAttribute('src', Dialog.prototype.unlockedImage);
            }

            mxEvent.addListener(btn, 'click', function (evt) {
                if (graph.isEnabled()) {
                    var value = null;
                    graph.getModel().beginUpdate();
                    try {
                        value = (mxUtils.getValue(style, 'locked', '0') == '1') ? null : '1';
                        graph.setCellStyles('locked', value, [child]);
                    } finally {
                        graph.getModel().endUpdate();
                    }

                    if (value == '1') {
                        graph.removeSelectionCells(graph.getModel().getDescendants(child));
                    }

                    mxEvent.consume(evt);
                }
            });

            left.appendChild(btn);

            var inp = document.createElement('input');
            inp.setAttribute('type', 'checkbox');
            inp.setAttribute('title', mxResources.get('hideIt', [child.value || mxResources.get('background')]));
            inp.style.marginLeft = '4px';
            inp.style.marginRight = '6px';
            inp.style.marginTop = '4px';
            left.appendChild(inp);

            if (!graph.isEnabled()) {
                inp.setAttribute('disabled', 'disabled');
            }

            if (graph.model.isVisible(child)) {
                inp.setAttribute('checked', 'checked');
                inp.defaultChecked = true;
            }

            mxEvent.addListener(inp, 'click', function (evt) {
                if (graph.isEnabled()) {
                    graph.model.setVisible(child, !graph.model.isVisible(child));
                    mxEvent.consume(evt);
                }
            });

            mxUtils.write(left, label);
            ldiv.appendChild(left);

            if (graph.isEnabled()) {
                // Fallback if no drag and drop is available
                if (mxClient.IS_TOUCH || mxClient.IS_POINTER || mxClient.IS_VML ||
                    (mxClient.IS_IE && document.documentMode < 10)) {
                    var right = document.createElement('div');
                    right.style.display = 'block';
                    right.style.textAlign = 'right';
                    right.style.whiteSpace = 'nowrap';
                    right.style.position = 'absolute';
                    right.style.right = '6px';
                    right.style.top = '6px';

                    // Poor man's change layer order
                    if (index > 0) {
                        var img2 = document.createElement('a');

                        img2.setAttribute('title', mxResources.get('toBack'));

                        img2.className = 'geButton';
                        img2.style.cssFloat = 'none';
                        img2.innerHTML = '&#9660;';
                        img2.style.width = '14px';
                        img2.style.height = '14px';
                        img2.style.fontSize = '14px';
                        img2.style.margin = '0px';
                        img2.style.marginTop = '-1px';
                        right.appendChild(img2);

                        mxEvent.addListener(img2, 'click', function (evt) {
                            if (graph.isEnabled()) {
                                graph.addCell(child, graph.model.root, index - 1);
                            }

                            mxEvent.consume(evt);
                        });
                    }

                    if (index >= 0 && index < layerCount - 1) {
                        var img1 = document.createElement('a');

                        img1.setAttribute('title', mxResources.get('toFront'));

                        img1.className = 'geButton';
                        img1.style.cssFloat = 'none';
                        img1.innerHTML = '&#9650;';
                        img1.style.width = '14px';
                        img1.style.height = '14px';
                        img1.style.fontSize = '14px';
                        img1.style.margin = '0px';
                        img1.style.marginTop = '-1px';
                        right.appendChild(img1);

                        mxEvent.addListener(img1, 'click', function (evt) {
                            if (graph.isEnabled()) {
                                graph.addCell(child, graph.model.root, index + 1);
                            }

                            mxEvent.consume(evt);
                        });
                    }

                    ldiv.appendChild(right);
                }

                if (mxClient.IS_SVG && (!mxClient.IS_IE || document.documentMode >= 10)) {
                    ldiv.setAttribute('draggable', 'true');
                    ldiv.style.cursor = 'move';
                }
            }

            mxEvent.addListener(ldiv, 'dblclick', function (evt) {
                var nodeName = mxEvent.getSource(evt).nodeName;

                if (nodeName != 'INPUT' && nodeName != 'IMG') {
                    renameLayer(child);
                    mxEvent.consume(evt);
                }
            });

            if (graph.getDefaultParent() == child) {
                ldiv.style.background = '#e6eff8';
                ldiv.style.fontWeight = 'bold';
                selectionLayer = child;
            } else {
                mxEvent.addListener(ldiv, 'click', function (evt) {
                    if (graph.isEnabled()) {
                        graph.setDefaultParent(defaultParent);
                        graph.view.setCurrentRoot(null);
                        refresh();
                    }
                });
            }

            listDiv.appendChild(ldiv);
        };

        // Cannot be moved or deleted
        for (var i = layerCount - 1; i >= 0; i--) {
            (mxUtils.bind(this, function (child) {
                addLayer(i, child.value || mxResources.get('background'), child, child);
            }))(graph.model.getChildAt(graph.model.root, i));
        }

        removeLink.setAttribute('title', mxResources.get('removeIt', [selectionLayer.value || mxResources.get('background')]));
        insertLink.setAttribute('title', mxResources.get('moveSelectionTo', [selectionLayer.value || mxResources.get('background')]));
        duplicateLink.setAttribute('title', mxResources.get('duplicateIt', [selectionLayer.value || mxResources.get('background')]));
        renameLink.setAttribute('title', mxResources.get('renameIt', [selectionLayer.value || mxResources.get('background')]));

        if (graph.isSelectionEmpty()) {
            insertLink.className = 'geButton mxDisabled';
        }
    };

    refresh();
    graph.model.addListener(mxEvent.CHANGE, function () {
        refresh();
    });

    graph.selectionModel.addListener(mxEvent.CHANGE, function () {
        if (graph.isSelectionEmpty()) {
            insertLink.className = 'geButton mxDisabled';
        } else {
            insertLink.className = 'geButton';
        }
    });

    this.window = new mxWindow(mxResources.get('layers'), div, x, y, w, h, true, true);
    this.window.destroyOnClose = false;
    this.window.setMaximizable(false);
    this.window.setResizable(true);
    this.window.setClosable(true);
    this.window.setVisible(true);

    // Make refresh available via instance
    this.refreshLayers = refresh;

    this.window.setLocation = function (x, y) {
        var iw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var ih = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        x = Math.max(0, Math.min(x, iw - this.table.clientWidth));
        y = Math.max(0, Math.min(y, ih - this.table.clientHeight - 48));

        if (this.getX() != x || this.getY() != y) {
            mxWindow.prototype.setLocation.apply(this, arguments);
        }
    };

    mxEvent.addListener(window, 'resize', mxUtils.bind(this, function () {
        var x = this.window.getX();
        var y = this.window.getY();

        this.window.setLocation(x, y);
    }));
};
