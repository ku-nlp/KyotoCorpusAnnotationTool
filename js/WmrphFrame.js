function removeSpaces(inputObj) {
    inputObj.value = inputObj.value.replace(/ +/g, "");
}

var WmrphFrame = function () {

    this.title = "";
    this.active_b_num_start = -1;
    this.active_b_num_end = -1;
    this.bnst_data_btype_new_m = {};
    this.bnst_data_btype_new_label = {};
    this.target_m_num = null;

    const me = this;              //Eventのコールバック等から利用

    // 初期化
    this.init = function () {
        this.title = "";
        this.active_b_num_start = -1;
        this.active_b_num_end = -1;
        this.bnst_data_btype_new_m = {};
        this.bnst_data_btype_new_label = {};

        this.removeContent();
        this.wmrph_table = null;
    };


    // 形態素編集画面の要素削除
    this.removeContent = function () {
        $("#wmrph_content").empty();
    };

    // OKボタン
    this.ok = function () {
        // 更新
        if (this.reset_bnst()) {
            // 文節画面、全文画面更新
            myRelationFrame.update();
            this.init();
        }
    };

    // 追加ボタン
    this.add = function () {
        this.insert_mrph(this.active_b_num_end, false)(); //insert_mrphはfunctionを返すので呼び出しのための()
    };

    // 活用型、活用形更新
    this.dialog_input_done = function (input_text) {

        if (!input_text.match(/:/)) {
            alert('入力形式が不正です');
            return;
        }
        modify_flag = '*';
        current_modify_flag = '*';
        const first = input_text.split(':')[0];
        const second = input_text.split(':')[1];

        // 活用型、活用形
        myRelationFrame.mrph_data_all[this.target_m_num][7] = first;
        myRelationFrame.mrph_data_all[this.target_m_num][9] = second;
        const new_label = `${first}:${second}`;

        // tableの値更新
        const elem = document.getElementById(`conj-${this.target_m_num}`);
        elem.innerHTML = new_label;

    };

    // 品詞変更
    this.reset_pos = function (m_num, i, j) {
        modify_flag = '*';
        modify_flag2 = '*';
        current_modify_flag = '*';

        let label = `${myRelationFrame.mrph_data_all[m_num][3]}:${myRelationFrame.mrph_data_all[m_num][5]}`;
        const old_types = myJumanGrammer.rel_table[label];

        if (LANG == 'ja') {
            if (j != 0) {
                label = `${myJumanGrammer.pos_data[i][0]}:${myJumanGrammer.pos_data[i][j]}`;
                myRelationFrame.mrph_data_all[m_num][3] = myJumanGrammer.pos_data[i][0];
                myRelationFrame.mrph_data_all[m_num][4] = i + 1;
                myRelationFrame.mrph_data_all[m_num][5] = myJumanGrammer.pos_data[i][j];
            } else {
                label = myJumanGrammer.pos_data[i][0];
                myRelationFrame.mrph_data_all[m_num][3] = myJumanGrammer.pos_data[i][0];
                myRelationFrame.mrph_data_all[m_num][4] = i + 1;
                myRelationFrame.mrph_data_all[m_num][5] = '*';
            }
            myRelationFrame.mrph_data_all[m_num][6] = j;
        } else {
            label = myJumanGrammer.pos_data[i][j];
            myRelationFrame.mrph_data_all[m_num][3] = myJumanGrammer.pos_data[i][j];
            myRelationFrame.mrph_data_all[m_num][4] = 0;
            myRelationFrame.mrph_data_all[m_num][5] = '*';
            myRelationFrame.mrph_data_all[m_num][6] = 0;
        }

        // 更新
        var elem = document.getElementById(`pos-${m_num}`);
        elem.innerHTML = label;

        label = `${myRelationFrame.mrph_data_all[m_num][3]}:${myRelationFrame.mrph_data_all[m_num][5]}`;
        const new_types = myJumanGrammer.rel_table[label];
        if (old_types == new_types) {
            ;
        } else {
            const conjElem = document.getElementById(`conj-${m_num}`);
            conjElem.className = `${this.getConjContextClass(label)} conj`;
        }

        if (new_types) {
            var elem = document.getElementById(`conj-${m_num}`);
            elem.innerHTML = '？';
            return;
        }
        var elem = document.getElementById(`conj-${m_num}`);

        elem.innerHTML = 'なし';
        myRelationFrame.mrph_data_all[m_num][2] = myRelationFrame.mrph_data_all[m_num][0];
        myRelationFrame.mrph_data_all[m_num][7] = '*';
        myRelationFrame.mrph_data_all[m_num][8] = 0;
        myRelationFrame.mrph_data_all[m_num][9] = '*';
        myRelationFrame.mrph_data_all[m_num][10] = 0;
    };

    // 活用更新
    this.reset_conj = function (m_num, i, j) {
        modify_flag = '*';
        current_modify_flag = '*';

        const label = `${myJumanGrammer.conj_data[i][0]}:${myJumanGrammer.conj_data[i][j]}`;
        myRelationFrame.mrph_data_all[m_num][7] = myJumanGrammer.conj_data[i][0];
        myRelationFrame.mrph_data_all[m_num][8] = i + 1;
        myRelationFrame.mrph_data_all[m_num][9] = myJumanGrammer.conj_data[i][j];
        myRelationFrame.mrph_data_all[m_num][9] = myRelationFrame.mrph_data_all[m_num][9].replace(/\(.*\)$/, "");
        myRelationFrame.mrph_data_all[m_num][10] = j;

        // 原形の（例えば）「な」を「だ」に置き換える
        const m2 = myJumanGrammer.conj_data[i][j].match(/\((.*)\)/);
        if (!m2) {
            return;
        }
        const v = m2[1];
        for (let k = 0; k < myJumanGrammer.conj_data.length; k++) {
            if (myJumanGrammer.conj_data[i][k]) {
                var m3 = myJumanGrammer.conj_data[i][k].match(/^基本形\((.*)\)$/);
                if (m3) {
                    var orig = m3[1];
                    var genkei_id = `#genkei-${m_num}`;
                    var genkei = $(genkei_id).val();
                    var replaced = new RegExp(`${v}$`);
                    genkei = genkei.replace(replaced, orig);
                    $(genkei_id).val(genkei);
                    myRelationFrame.mrph_data_all[m_num][2] = genkei;
                }
            }
        }

        // 更新
        const elem = document.getElementById(`conj-${m_num}`);
        elem.innerHTML = label;
    };


    // 文節の表示
    this.show_bnst = function (b_num, un_initialize_flag) {
        if (this.active_b_num_start == -1) {

            // 文節形態素編集フレームを開く
            innerLayout.open("south");
            $("#wmrph_buttons").show();

            if (!un_initialize_flag) {
                current_modify_flag = null;
            }

            this.active_b_num_start = b_num;
            this.active_b_num_end = b_num;

            // ### "OK" "追加"などのボタンを配置するフレームを準備
            // tableタイトル行をつくる
            const table = document.createElement("table");
            table.id = "wmrph-table";
            // table.setAttribute("border", "0");
            // table.setAttribute("cellSpacing", "5px");
            // table.setAttribute("cellPadding", "10px");
            const thead = document.createElement("thead");
            const tr = document.createElement("tr");

            const cols = WmrphMenuArray.length;
            for (let j = 0; j < cols; j++) {
                if (WmrphMenuArray[j].title != undefined) {
                    var td = document.createElement("td");
                    var text = WmrphMenuArray[j].title;
                    var title = document.createTextNode(text);
                    if (text != "") {
                        td.className = "kb_bg";
                    }
                    td.appendChild(title);
                    tr.appendChild(td);
                }
            }
            thead.appendChild(tr);
            table.appendChild(thead);
            $("#wmrph_content").append(table);

            for (var i = myRelationFrame.bnst_data_start[b_num]; i < myRelationFrame.bnst_data_start[b_num + 1]; i++) {
                if (TREE_MODE == 'R') {
                    this.show_mrph(i, b_num, i == myRelationFrame.bnst_data_start[b_num] ? myRelationFrame.bnst_data_btype[b_num] : '', "top");
                } else {
                    this.show_mrph(i, b_num, myRelationFrame.bnst_data_btype[b_num], "top");
                }
            }

        } else if (b_num == this.active_b_num_end + 1) {
            this.active_b_num_end = b_num;
            for (i = myRelationFrame.bnst_data_start[b_num]; i < myRelationFrame.bnst_data_start[b_num + 1]; i++) {
                this.show_mrph(i, b_num, i == myRelationFrame.bnst_data_start[b_num] ? myRelationFrame.bnst_data_btype[b_num] : '', "top");
            }
        } else {
            alert('連続する文節しか修正できません.');
            return;
        }
    };

    // 形態素行表示
    this.show_mrph = function (m_num, b_num, b_type, direction) {

        // 最初の形態素は強制的にBにする
        if (m_num == 0 && b_type != '*') {
            b_type = '*';
        }

        // 行 element作成
        const row = document.createElement("div");
        row.id = m_num;
        row.className = "row";
        $("#wmrph_content").append(row);

        var label;
        let suffix;

        this.bnst_data_btype_new_m[m_num] = b_type;

        // 文節区切りボタン
        const btypeBtn = document.createElement("img");

        if (b_type == '*') {
            this.bnst_data_btype_new_label[m_num] = 'B';
            myRelationFrame.mrph_data_start[m_num] = 1;
            btypeBtn.src = `${IMAGE_PATH}b_of.png`;
            // 最初の形態素はBから変更できないようにする。
            if (m_num > 0) {
                $(btypeBtn).mouseover(function () {
                    this.src = `${IMAGE_PATH}b_on.png`;
                });
                $(btypeBtn).mouseout(function () {
                    this.src = `${IMAGE_PATH}b_of.png`;
                });
            }
        } else if (b_type == '+') {
            this.bnst_data_btype_new_label[m_num] = 'T';
            myRelationFrame.mrph_data_start[m_num] = 1;
            btypeBtn.src = `${IMAGE_PATH}t_of.png`;
            $(btypeBtn).mouseover(function () {
                this.src = `${IMAGE_PATH}t_on.png`;
            });
            $(btypeBtn).mouseout(function () {
                this.src = `${IMAGE_PATH}t_of.png`;
            });
        } else {
            this.bnst_data_btype_new_label[m_num] = '&nbsp;&nbsp;';
            myRelationFrame.mrph_data_start[m_num] = 0;
            btypeBtn.src = `${IMAGE_PATH}emp_of.png`;
            $(btypeBtn).mouseover(function () {
                this.src = `${IMAGE_PATH}emp_on.png`;
            });
            $(btypeBtn).mouseout(function () {
                this.src = `${IMAGE_PATH}emp_of.png`;
            });
        }

        // btypeBtn.label = this.bnst_data_btype_new_label[m_num];
        // btypeBtn.innerHTML = this.bnst_data_btype_new_label[m_num];
        btypeBtn.className = "btype";

        // table body
        const table = document.getElementById("wmrph-table");

        const tbody = document.createElement("tbody");
        const tr = document.createElement("tr");

        let td = document.createElement("td");
        td.appendChild(btypeBtn);

        const btype_btn_click = function (m_num) {
            return function () {
                modify_flag = '*';
                current_modify_flag = '*';

                const btype = me.bnst_data_btype_new_label[m_num];

                if (btype == 'B') {
                    me.bnst_data_btype_new_m[m_num] = '+';
                    me.bnst_data_btype_new_label[m_num] = 'T';
                    this.src = `${IMAGE_PATH}t_g_of.png`;
                    $(this).mouseover(function () {
                        this.src = `${IMAGE_PATH}t_g_on.png`;
                    });
                    $(this).mouseout(function () {
                        this.src = `${IMAGE_PATH}t_g_of.png`;
                    });
                } else if (btype == 'T') {
                    myRelationFrame.mrph_data_start[m_num] = 0;
                    me.bnst_data_btype_new_m[m_num] = '';
                    me.bnst_data_btype_new_label[m_num] = '&nbsp;';
                    this.src = `${IMAGE_PATH}emp_g_of.png`;
                    $(this).mouseover(function () {
                        this.src = `${IMAGE_PATH}emp_g_on.png`;
                    });
                    $(this).mouseout(function () {
                        this.src = `${IMAGE_PATH}emp_g_of.png`;
                    });
                } else {
                    myRelationFrame.mrph_data_start[m_num] = 1;
                    me.bnst_data_btype_new_m[m_num] = '*';
                    me.bnst_data_btype_new_label[m_num] = 'B';
                    this.src = `${IMAGE_PATH}b_g_of.png`;
                    $(this).mouseover(function () {
                        this.src = `${IMAGE_PATH}b_g_on.png`;
                    });
                    $(this).mouseout(function () {
                        this.src = `${IMAGE_PATH}b_g_of.png`;
                    });
                }
            };
        };
        // 文節タイプボタンのクリックイベントを設定（最初の形態素以外）
        if (m_num > 0) {
            $(btypeBtn).click(btype_btn_click(m_num));
        }

        tr.appendChild(td);

        // 表記
        const hyoki = document.createElement("div");
        hyoki.className = "hyoki";
        var input = document.createElement("input");
        input.type = "text";
        input.value = myRelationFrame.mrph_data_all[m_num][0];
        hyoki.appendChild(input);
        const hyoki_change = function (m_num) {
            return function () {
                modify_flag = '*';
                modify_flag2 = '*';
                current_modify_flag = '*';
                removeSpaces(this);
                myRelationFrame.mrph_data_all[m_num][0] = this.value;
            };
        };
        $(input).change(hyoki_change(m_num));

        td = document.createElement("td");
        td.appendChild(hyoki);
        tr.appendChild(td);

        if (myRelationFrame.mrph_data_all[m_num][12] && myRelationFrame.mrph_data_all[m_num][12].match(/NE:[^\>]+\>/)) {
            // 背景をColorNeにして編集できないようにする
            input.disabled = true;
            input.style.backgroundColor = ColorNE;
        }

        // 読み
        const yomi = document.createElement("div");
        yomi.className = "yomi";
        var input = document.createElement("input");
        input.type = "text";
        if (myRelationFrame.mrph_data_all[m_num][1] != undefined) {
            input.value = myRelationFrame.mrph_data_all[m_num][1];
        }
        yomi.appendChild(input);
        const yomi_change = function (m_num) {
            return function () {
                modify_flag = '*';
                current_modify_flag = '*';
                removeSpaces(this);
                myRelationFrame.mrph_data_all[m_num][1] = this.value;
            };
        };
        $(input).change(yomi_change(m_num));

        td = document.createElement("td");
        td.appendChild(yomi);
        tr.appendChild(td);

        // 原形
        const genkei = document.createElement("div");
        genkei.className = "genkei";
        // genkei.innerHTML = myRelationFrame.mrph_data_all[m_num][2];
        var input = document.createElement("input");
        input.type = "text";
        input.id = `genkei-${row.id}`;
        if (myRelationFrame.mrph_data_all[m_num][2] != undefined) {
            input.value = myRelationFrame.mrph_data_all[m_num][2];
        }
        genkei.appendChild(input);
        const genkei_change = function (m_num) {
            return function () {
                modify_flag = '*';
                current_modify_flag = '*';
                removeSpaces(this);
                myRelationFrame.mrph_data_all[m_num][2] = this.value;
            };
        };
        $(input).change(genkei_change(m_num));

        td = document.createElement("td");
        td.appendChild(genkei);
        tr.appendChild(td);

        // 品詞
        var label = "&nbsp;";
        if ((myRelationFrame.mrph_data_all[m_num][5] != undefined) && (myRelationFrame.mrph_data_all[m_num][3] != undefined)) {
            label = myRelationFrame.mrph_data_all[m_num][5] == '*' ? myRelationFrame.mrph_data_all[m_num][3] : `${myRelationFrame.mrph_data_all[m_num][3]}:${myRelationFrame.mrph_data_all[m_num][5]}`;
        }

        td = document.createElement("td");
        td.innerHTML = label;
        td.m_num = m_num;
        td.id = `pos-${m_num}`;
        td.className = "context-menu-sub pos";
        tr.appendChild(td);

        // 活用 --> 〜型:〜形(〜) or なし
        //if (LANG == 'ja') {
        label = "なし";
        if (myRelationFrame.mrph_data_all[m_num][7] != undefined && myRelationFrame.mrph_data_all[m_num][7] != '*') {
            label = `${myRelationFrame.mrph_data_all[m_num][7]}:${myRelationFrame.mrph_data_all[m_num][9]}`;
            suffix = myJumanGrammer.conj_table[label];
            if (suffix != undefined) {
                label += suffix;
            }
        }

        td = document.createElement("td");
        let label2 = "";
        if ((myRelationFrame.mrph_data_all[m_num][3] != undefined) && (myRelationFrame.mrph_data_all[m_num][5] != undefined)) {
            label2 = `${myRelationFrame.mrph_data_all[m_num][3]}:${myRelationFrame.mrph_data_all[m_num][5]}`;
        }

        td.innerHTML = label;
        td.className = `${this.getConjContextClass(label2)} conj`;
        td.id = `conj-${m_num}`;
        td.m_num = m_num;
        tr.appendChild(td);
        //        }

        // 意味情報
        const imi = document.createElement("div");
        imi.className = "imi";
        // genkei.innerHTML = myRelationFrame.mrph_data_all[m_num][2];
        var input = document.createElement("input");
        input.type = "text";
        input.id = `imi-${row.id}`;
        if (myRelationFrame.mrph_data_all[m_num][11] != undefined) {
            input.value = myRelationFrame.mrph_data_all[m_num][11];
        }
        imi.appendChild(input);
        const imi_change = function (m_num) {
            return function () {
                modify_flag = '*';
                current_modify_flag = '*';
                this.value = this.value.replace(/^\s+|\s+$/g, '');
                myRelationFrame.mrph_data_all[m_num][11] = this.value === '' ? "NIL" : this.value;
            };
        };
        $(input).change(imi_change(m_num));

        td = document.createElement("td");
        td.appendChild(imi);
        tr.appendChild(td);

        //     ### 複製ボタン
        const cpBtn = document.createElement("img");
        cpBtn.className = "copy";
        cpBtn.onclick = this.insert_mrph(b_num, m_num - myRelationFrame.bnst_data_start[b_num] + 1);
        cpBtn.src = `${IMAGE_PATH}copy_of.png`;
        $(cpBtn).mouseover(function () {
            this.src = `${IMAGE_PATH}copy_on.png`;
        });
        $(cpBtn).mouseout(function () {
            this.src = `${IMAGE_PATH}copy_of.png`;
        });

        $(row).append(cpBtn);
        td = document.createElement("td");
        td.appendChild(cpBtn);
        tr.appendChild(td);

        //     ### 削除ボタン
        const delBtn = document.createElement("img");
        delBtn.src = `${IMAGE_PATH}del_of.png`;
        $(delBtn).mouseover(function () {
            this.src = `${IMAGE_PATH}del_on.png`;
        });
        $(delBtn).mouseout(function () {
            this.src = `${IMAGE_PATH}del_of.png`;
        });

        delBtn.className = "delete";
        delBtn.onclick = this.delete_mrph(b_num, m_num, false); //第3引数が偽ならdelete
        td = document.createElement("td");
        td.appendChild(delBtn);
        tr.appendChild(td);

        //     ### クリアボタン
        const clBtn = document.createElement("img");
        clBtn.src = `${IMAGE_PATH}clear_of.png`;
        $(clBtn).mouseover(function () {
            this.src = `${IMAGE_PATH}clear_on.png`;
        });
        $(clBtn).mouseout(function () {
            this.src = `${IMAGE_PATH}clear_of.png`;
        });

        clBtn.onclick = this.delete_mrph(b_num, m_num, true); //第3引数が真ならclear
        td = document.createElement("td");
        td.appendChild(clBtn);
        tr.appendChild(td);
        tbody.appendChild(tr);
        table.appendChild(tbody);
    };

    this.getConjContextClass = function (label2) {
        return label2 in myJumanGrammer.context_class_table ? myJumanGrammer.context_class_table[label2] : myJumanGrammer.direct_input_class;
    };


    // 形態素の追加・複製のfunctionを返す
    this.insert_mrph = function (b_num, flag) {
        // event用のfunctionを返す
        return function () {
            try {
                let m_num = flag ? myRelationFrame.bnst_data_start[b_num] + flag : myRelationFrame.bnst_data_start[b_num + 1];

                // 固有表現中であれば追加を許可しない
                if (myRelationFrame.mrph_data_all[m_num - 1] && myRelationFrame.mrph_data_all[m_num] && (myRelationFrame.mrph_data_all[m_num - 1][12] && myRelationFrame.mrph_data_all[m_num][12]) && (flag && myRelationFrame.mrph_data_all[m_num - 1][12].match(/\<NE:[^\>]+\>/) ||
                    myRelationFrame.mrph_data_all[m_num][12].match(/\<NE:[^:]+:middle\>/) ||
                    myRelationFrame.mrph_data_all[m_num][12].match(/\<NE:[^:]+:tail\>/))) {
                    alert('固有表現タグをはずしてから編集してください');
                    return;
                }

                modify_flag = '*';
                current_modify_flag = '*';

                for (let i = b_num + 1; i <= myRelationFrame.bnst_num; i++) {
                    myRelationFrame.bnst_data_start[i]++;
                }

                // myRelationFrame.increment_mrph_num();
                myRelationFrame.mrph_num++;

                if (!flag) {
                    // 追加
                    m_num = myRelationFrame.bnst_data_start[b_num + 1] - 1;

                    myRelationFrame.mrph_data_all.splice(m_num, 0, ['', '', '', '', '', '', '', '*', 0, '*', 0, "", ""]);
                    myRelationFrame.mrph_data_start.splice(m_num, 0, 0);

                    if (TREE_MODE == 'R') {
                        me.show_mrph(m_num, b_num, '', "top");
                    } else {
                        me.show_mrph(m_num, b_num, '*', "top");
                    }
                } else {
                    // 複製
                    modify_flag2 = '*';
                    m_num = myRelationFrame.bnst_data_start[b_num] + flag;

                    const new_array = [];
                    for (let i = 0, l = myRelationFrame.mrph_data_all[m_num - 1].length; i < l; i++) {
                        new_array[i] = myRelationFrame.mrph_data_all[m_num - 1][i];
                    }

                    myRelationFrame.mrph_data_all.splice(m_num, 0, new_array);
                    myRelationFrame.mrph_data_start.splice(m_num, 0, 0);

                    const b_num_start = me.active_b_num_start;
                    const b_num_end = me.active_b_num_end;

                    me.active_b_num_start = -1;

                    // me.init();
                    me.removeContent();

                    for (b_num = b_num_start; b_num <= b_num_end; b_num++) {
                        me.show_bnst(b_num, true); // un_initialize_flagをtrueに
                    }
                }

            } catch (e) {
                alert(e);
            }

        };
    };

    // 形態素の削除
    this.delete_mrph = function (b_num, m_num, clearflag) {
        return function () {
            try {
                if (myRelationFrame.mrph_data_all[m_num][12]
                    && myRelationFrame.mrph_data_all[m_num][12].match(/\<NE:[^\>]+\>/)) {
                    alert('固有表現タグをはずしてから編集してください');
                    return;
                }

                modify_flag = '*';
                current_modify_flag = '*';

                if (clearflag) {
                    // 表記、読み、原形をクリア
                    for (var i = 0; i < 3; i++) {
                        myRelationFrame.mrph_data_all[m_num][i] = "";
                    }
                } else {
                    // 削除
                    modify_flag2 = '*';

                    for (var i = b_num + 1; i <= myRelationFrame.bnst_num; i++) {
                        myRelationFrame.bnst_data_start[i]--;
                    }

                    myRelationFrame.mrph_num--;

                    myRelationFrame.mrph_data_all[m_num] = undefined;
                    myRelationFrame.mrph_data_all.splice(m_num, 1);
                    myRelationFrame.mrph_data_start.splice(m_num, 1);
                }

                const b_num_start = me.active_b_num_start;
                const b_num_end = me.active_b_num_end;
                me.active_b_num_start = -1;

                me.removeContent();

                for (b_num = b_num_start; b_num <= b_num_end; b_num++) {
                    me.show_bnst(b_num, true);
                }

            } catch (e) {
                alert(e);
            }
        };
    };

    // 形態素・文節 修正結果反映
    this.reset_bnst = function () {
        try {

            const start = myRelationFrame.bnst_data_start[this.active_b_num_start];
            const end = myRelationFrame.bnst_data_start[this.active_b_num_end + 1];
            let count = 0;

            // clearされた形態素
            for (var i = 0; i < myRelationFrame.mrph_num; i++) {
                if (!myRelationFrame.mrph_data_all[i][0]) {
                    myRelationFrame.mrph_data_start[i] = 0;
                }
            }

            for (i = start; i < end; i++) {
                if (myRelationFrame.mrph_data_start[i] == 1) {
                    count++;
                }
            }

            // 文節数の差
            const diff = count - (this.active_b_num_end - this.active_b_num_start + 1);

            // なくなった形態素の処理
            for (i = 0; i < myRelationFrame.mrph_num; i++) {
                if (!myRelationFrame.mrph_data_all[i][0]) {
                    myRelationFrame.mrph_data_all[i] = undefined;
                    myRelationFrame.mrph_data_all.splice(i, 1);
                    myRelationFrame.mrph_data_start.splice(i, 1);
                    i--;
                    myRelationFrame.mrph_num--;
                }
            }

            // 文節開始位置(形態素番号)の修正
            const old_bnst_num = myRelationFrame.bnst_num;
            myRelationFrame.bnst_num = 0;
            for (i = 0; i < myRelationFrame.mrph_num; i++) {
                if (myRelationFrame.mrph_data_start[i] == 1) {
                    myRelationFrame.bnst_data_start[myRelationFrame.bnst_num] = i;
                    myRelationFrame.bnst_num++;
                }
            }

            myRelationFrame.bnst_data_start[myRelationFrame.bnst_num] = myRelationFrame.mrph_num; // 末尾の印

            var isRoot = false;
            for (i = this.active_b_num_start; i <= this.active_b_num_end; i++) {
                if (myRelationFrame.bnst_data_dpnd[i] == -1) {
                    var isRoot = true;
                    break;
                }
            }

            // 係先(文節番号)の修正
            if (diff != 0) {

                // 格のdependencyを修正
                const curSntIndex = myRelationFrame.currentShowIndex;
                for (let si = curSntIndex; si < inputFileList.length; si++) {
                    for (i = 0; i < old_bnst_num; i++) {
                        const sid = inputFileList[si];
                        const contextInfo = inputDataList[sid].contextinfo[i];
                        for (const kaku in contextInfo) {
                            for (j = 0; j < contextInfo[kaku].Data.length; j++) {
                                const data = contextInfo[kaku].Data[j];
                                if (data.dependant
                                    && data.dependant > this.active_b_num_start
                                    && data.SID == inputFileList[curSntIndex]) {
                                    data.dependant = parseInt(data.dependant, 10) + diff;
                                }
                            }
                        }
                    }
                }

                for (i = 0;
                     (TREE_MODE == 'R' && i < this.active_b_num_start) ||
                     (TREE_MODE == 'LR' && i < old_bnst_num);
                     i++) {

                    // 表示中の文節列のどこかに係る場合 (どこに係るかは未定義にする)
                    if (i != this.active_b_num_start
                        && this.active_b_num_start <= myRelationFrame.bnst_data_dpnd[i]
                        && myRelationFrame.bnst_data_dpnd[i] <= this.active_b_num_end) {
                        myRelationFrame.bnst_data_dpnd[i] = TREE_MODE == 'R' ? -1 : this.active_b_num_start;
                    }
                    // 表示中の文節列より後に係る場合
                    else if (myRelationFrame.bnst_data_dpnd[i] > this.active_b_num_end) {
                        myRelationFrame.bnst_data_dpnd[i] = parseInt(myRelationFrame.bnst_data_dpnd[i], 10) + parseInt(diff, 10);
                    }
                }

                // 文節をくっつけたとき
                if (diff < 0) {
                    // 後から前にずらす
                    for (i = (this.active_b_num_end + diff + 1);
                         i < myRelationFrame.bnst_num; i++) {
                        // ルートをずらさない
                        if (TREE_MODE == 'R') {
                            myRelationFrame.bnst_data_dpnd[i] = myRelationFrame.bnst_data_dpnd[i - diff] == -1 ? -1 : parseInt(myRelationFrame.bnst_data_dpnd[i - diff], 10) + parseInt(diff, 10);
                        } else {
                            myRelationFrame.bnst_data_dpnd[i] = myRelationFrame.bnst_data_dpnd[i - diff];
                        }

                        myRelationFrame.bnst_data_type[i] = myRelationFrame.bnst_data_type[i - diff];
                        myRelationFrame.bnst_data_btype[i] = myRelationFrame.bnst_data_btype[i - diff];
                        myRelationFrame.bnst_data_f[i] = myRelationFrame.bnst_data_f[i - diff];
                        myRelationFrame.contextinfo[i] = jQuery.extend(true, {}, myRelationFrame.contextinfo[i - diff]);
                    }
                }

                // 文節を分割したとき
                else {
                    // console.log("diff > 0");
                    // 前から後にずらす
                    if (TREE_MODE == 'R') {
                        for (i = (myRelationFrame.bnst_num - 1); i >= (this.active_b_num_end + diff + 1); i--) {
                            // ルートをずらさない
                            myRelationFrame.bnst_data_dpnd[i] = myRelationFrame.bnst_data_dpnd[i - diff] == -1 ? -1 : parseInt(myRelationFrame.bnst_data_dpnd[i - diff], 10) + parseInt(diff, 10);
                            myRelationFrame.bnst_data_type[i] = myRelationFrame.bnst_data_type[i - diff];
                            myRelationFrame.bnst_data_btype[i] = myRelationFrame.bnst_data_btype[i - diff];
                            myRelationFrame.bnst_data_f[i] = myRelationFrame.bnst_data_f[i - diff];
                            myRelationFrame.bnst_data_f[i - diff] = '';
                            myRelationFrame.contextinfo[i] = jQuery.extend(true, {}, myRelationFrame.contextinfo[i - diff]);
                            myRelationFrame.contextinfo[i - diff] = '';
                        }
                    } else {
                        for (i = (myRelationFrame.bnst_num - 1); i >= (this.active_b_num_end + diff + 1); i--) {
                            myRelationFrame.bnst_data_dpnd[i] = parseInt(myRelationFrame.bnst_data_dpnd[i - diff], 10);
                            myRelationFrame.bnst_data_type[i] = myRelationFrame.bnst_data_type[i - diff];
                            myRelationFrame.bnst_data_btype[i] = myRelationFrame.bnst_data_btype[i - diff];
                            myRelationFrame.bnst_data_f[i] = myRelationFrame.bnst_data_f[i - diff];
                            myRelationFrame.bnst_data_f[i - diff] = '';
                            myRelationFrame.contextinfo[i] = jQuery.extend(true, {}, myRelationFrame.contextinfo[i - diff]);
                            myRelationFrame.contextinfo[i - diff] = '';
                        }
                    }
                }
                if (TREE_MODE == 'R') {
                    for (i = this.active_b_num_start;
                         i <= (this.active_b_num_end + diff); i++) {
                        myRelationFrame.bnst_data_dpnd[i] = -1;
                        // myRelationFrame.bnst_data_f[i] = ''; // タグ情報をクリアしない
                    }
                } else {
                    var i;
                    if (diff > 0) {
                        myRelationFrame.bnst_data_dpnd[this.active_b_num_end + diff] = myRelationFrame.bnst_data_dpnd[this.active_b_num_start];
                        for (i = this.active_b_num_start;
                             i < (this.active_b_num_end + diff); i++) {
                            //if (myRelationFrame.bnst_data_dpnd[i] != -1) {
                            myRelationFrame.bnst_data_dpnd[i] = i + 1;
                            //}
                        }
                    } else if (isRoot) {
                        myRelationFrame.bnst_data_dpnd[this.active_b_num_start] = -1;
                        for (i = this.active_b_num_start + 1;
                             i <= (this.active_b_num_end + diff); i++) {
                            myRelationFrame.bnst_data_dpnd[i] = this.active_b_num_start;
                        }
                    } else {
                        //myRelationFrame.bnst_data_dpnd[this.active_b_num_end + diff] -= diff;
                        // for (i = this.active_b_num_start;
                        //      i <= (this.active_b_num_end + diff); i++) {
                        //     //if (myRelationFrame.bnst_data_dpnd[i] != -1) {
                        //     myRelationFrame.bnst_data_dpnd[i] = i + 1;
                        //     //}
                        // }
                    }
                }
            }

            // 対象文節中のマーク (*, +)
            let bnst_num = 0;
            const modify_bnst = {};
            for (i = 0; i < myRelationFrame.mrph_num; i++) {
                if (myRelationFrame.mrph_data_start[i] == 1) {
                    if (bnst_num >= this.active_b_num_start && bnst_num <= this.active_b_num_end + diff && myRelationFrame.bnst_data_btype[bnst_num] != this.bnst_data_btype_new_m[i]) {
                        myRelationFrame.bnst_data_btype[bnst_num] = this.bnst_data_btype_new_m[i];
                        var b_i = myRelationFrame.orig_bnst_num[bnst_num];
                        modify_bnst[b_i] = true;
                    }
                    bnst_num++;
                }
            }

            // 基本句行と文節行のマッピングの更新
            let orig_bnst_num = 0;
            myRelationFrame.orig_bnst_data_num = {}; //初期化
            for (i = 0; i < bnst_num; i++) {
                if (myRelationFrame.bnst_data_btype[i] == "*") {
                    myRelationFrame.orig_bnst_data_num[i] = orig_bnst_num;
                    myRelationFrame.orig_bnst_data_start[i] = 1;
                    myRelationFrame.orig_bnst_data_end[i] = 1;
                    orig_bnst_num++;
                } else {
                    myRelationFrame.orig_bnst_data_end[i] = 1;
                    myRelationFrame.orig_bnst_data_end[i - 1] = 0; //ひとつ前の値を0に
                    myRelationFrame.orig_bnst_data_num[i] = orig_bnst_num - 1;
                }
            }

            // myRelationFrame.bnst_data_btype[bnst_num] = '*';
            myRelationFrame.bnst_num = bnst_num; // redundant

            for (i = old_bnst_num - 1; i >= myRelationFrame.bnst_num; i--) {
                myRelationFrame.bnst_data_dpnd.pop();
            }

            const orig_diff = orig_bnst_num - myRelationFrame.orig_bnst_num; //文節の差分
            if (orig_diff != 0) {

                // 係先(文節番号)の修正
                for (i = 0;
                     (TREE_MODE == 'R' && i < this.active_b_num_start) ||
                     (TREE_MODE == 'LR' && i < myRelationFrame.bnst_num);
                     i++) {

                    // 基本句の属している文節の番号を取得
                    var b_i = myRelationFrame.orig_bnst_data_num[i];

                    // 表示中の文節列のどこかに係る場合 (どこに係るかは未定義にする)
                    if ((this.active_b_num_start <= myRelationFrame.bnst_data_dpnd[i]) &&
                        myRelationFrame.bnst_data_dpnd[i] <= this.active_b_num_end) {
                        if ((myRelationFrame.orig_bnst_data_end[i] == 1) &&
                            (myRelationFrame.bnst_data_dpnd[i] == -1)) {
                            myRelationFrame.orig_bnst_data_dpnd[b_i] = TREE_MODE == 'R' ? -1 : this.active_b_num_end;
                        }
                    }
                    // 表示中の文節列より後に係る場合
                    else if (myRelationFrame.bnst_data_dpnd[i] > this.active_b_num_end && myRelationFrame.orig_bnst_data_end[i] == 1) {
                        myRelationFrame.orig_bnst_data_dpnd[b_i] = parseInt(myRelationFrame.orig_bnst_data_dpnd[b_i], 10) + parseInt(orig_diff, 10);
                        // console.log(b_i + " " + myRelationFrame.orig_bnst_data_dpnd[b_i]);
                    }
                }

                // 文節をくっつけた場合
                if (orig_diff < 0) {
                    // console.log("diff < 0");
                    // 後から前にずらす
                    for (i = (this.active_b_num_end + orig_diff + 1);
                         i < myRelationFrame.bnst_num; i++) {

                        if (myRelationFrame.bnst_data_btype[i] == "*") {
                            var b_i = myRelationFrame.orig_bnst_data_num[i]; //基本句番号iに対応する文節番号
                            var b_i_diff = parseInt(b_i, 10) - parseInt(orig_diff, 10);
                            myRelationFrame.orig_bnst_data_dpnd[b_i] = parseInt(myRelationFrame.orig_bnst_data_dpnd[b_i_diff], 10) + parseInt(orig_diff, 10);
                            myRelationFrame.orig_bnst_data_type[b_i] = myRelationFrame.orig_bnst_data_type[b_i_diff] || "D";
                            myRelationFrame.orig_bnst_data_f[b_i] = myRelationFrame.orig_bnst_data_f[b_i_diff];
                        }
                    }

                } else { // 文節が増えた場合
                    // 前から後ろにずらす
                    for (i = (myRelationFrame.bnst_num - 1);
                         i >= (this.active_b_num_end + orig_diff); i--) {

                        if (myRelationFrame.bnst_data_btype[i] == "*") {
                            var b_i = myRelationFrame.orig_bnst_data_num[i]; //基本句番号iに対応する文節番号
                            var b_i_diff = parseInt(b_i, 10) - parseInt(orig_diff, 10);
                            myRelationFrame.orig_bnst_data_dpnd[b_i] = myRelationFrame.orig_bnst_data_dpnd[b_i_diff] == -1 ? -1 : parseInt(myRelationFrame.orig_bnst_data_dpnd[b_i_diff], 10) + parseInt(orig_diff, 10);
                            myRelationFrame.orig_bnst_data_type[b_i] = myRelationFrame.orig_bnst_data_type[b_i_diff] || "D";
                            myRelationFrame.orig_bnst_data_f[b_i] = myRelationFrame.orig_bnst_data_f[b_i_diff];
                            myRelationFrame.orig_bnst_data_f[b_i_diff] = '';
                        }
                    }

                }

            }

            // for (var b_i = 0; b_i < myRelationFrame.orig_bnst_num; b_i++) {
            //     if(modify_bnst[b_i - orig_diff]) {
            //         myRelationFrame.orig_bnst_data_f[b_i] = '';
            //     }
            // }

            for (i = 0; i < myRelationFrame.bnst_num; i++) {
                var b_i = myRelationFrame.orig_bnst_data_num[i];
                if ((myRelationFrame.orig_bnst_data_end[i] == 1) &&
                    (myRelationFrame.bnst_data_dpnd[i] == -1)) {
                    myRelationFrame.orig_bnst_data_dpnd[b_i] = -1;
                } else if (myRelationFrame.orig_bnst_data_end[i] == 1) {
                    var j = myRelationFrame.bnst_data_dpnd[i]; //かかりうけ先
                    var b_j = myRelationFrame.orig_bnst_data_num[j]; //jの文節番号
                    myRelationFrame.orig_bnst_data_dpnd[b_i] = b_j;
                }
            }

            for (i = myRelationFrame.orig_bnst_num - 1; i >= orig_bnst_num; i--) {
                myRelationFrame.orig_bnst_data_dpnd.pop();
            }

            myRelationFrame.orig_bnst_num = orig_bnst_num;

            return true;

        } catch (e) {
            alert(e);
            return false;
        }

    };

};
