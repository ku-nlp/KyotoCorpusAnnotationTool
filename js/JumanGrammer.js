var JumanGrammer = function () {
    this.pos_data = [];
    this.conj_data = [];
    this.conj_table = [];
    this.rel_table = [];

    this.doneNum = 0;
    this.done = false;

    // 品詞情報と活用のcontext menuのclassのマッピング
    this.context_class_table = {};
    this.direct_input_class = "conj-direct-input";

    var me = this;

    this.init = function () {
        this.setPosData();
        this.setConjTable();
        this.setRelTable();

        // すべてのデータをよみおえるまでくりかえし
        this.checkDone();

        // コンテキストメニュー
        this.setPosContextEvent();
        this.setConjContextEvent();

    };

    // me.doneNumが3になるまで再帰
    this.checkDone = function () {
        if (me.doneNum == 3) {
            me.done = true;
        } else {
            setTimeout(function () {
                me.checkDone();
            }, 1000);
        }
    };

    this.setPosData = function () {
        // 品詞
        $.ajax({
            url: JUMAN_DATA_PATH + posDataFile[LANG],
            type: "get",
            dataType: 'html',
            success: this.parsePosData(),
            async: false,
            error: function (a, b, c) {
                // console.log(c.toString());
                alert("error:read pos data");
            }
        });
    };

    this.parsePosData = function () {
        var that = this;
        return function (data) {
            var lines = data.split("\n");
            var num = lines.length;
            that.pos_data = [];
            for (var i = 0; i < num; i++) {
                var array = lines[i].split(" ");
                that.pos_data.push(array);
            }
            me.doneNum++;
            // console.log(that.pos_data);
        };

    };

    this.setConjTable = function () {
        // 活用入力
        $.ajax({
            url: JUMAN_DATA_PATH + "conj.dat",
            type: "get",
            dataType: 'html',
            success: this.parseConjData(),
            async: false,
            error: function (a, b, c) {
                // console.log(c.toString());
                alert("error:read pos data");
            }
        });
    };

    this.parseConjData = function () {
        var that = this;
        return function (data) {
            var lines = data.split("\n");
            var num = lines.length;

            for (var conj_num = 0; conj_num < num; conj_num++) {
                var array = lines[conj_num].split(" ");
                that.conj_data[conj_num] = array;

                var length = that.conj_data[conj_num].length;
                for (var i = 1; i < length; i++) {
                    var m = that.conj_data[conj_num][i].match(/(.+)(\(.+\))/);
                    if (m) {
                        that.conj_table[that.conj_data[conj_num][0] + ":" + m[1]] = m[2];
                    }
                }
            }
            me.doneNum++;
        };
    };

    this.setRelTable = function () {
        // 活用入力
        $.ajax({
            url: JUMAN_DATA_PATH + "rel.dat",
            type: "get",
            dataType: 'html',
            success: this.parseRelData(),
            async: false,
            error: function (a, b, c) {
                // console.log(c.toString());
                alert("error:read pos data");
            }
        });
    };

    this.parseRelData = function () {
        var that = this;
        return function (data) {
            // 関係入力
            var lines = data.split("\n");
            var num = lines.length;

            for (var i = 0; i < num; i++) {
                var m = lines[i].match(/([^ ]+) (.+)/);
                if (m) {
                    that.rel_table[m[1]] = m[2];
                }
            }
            me.doneNum++;
            // console.log(that.rel_table);
        };
    };


    this.setPosContextEvent = function () {

        var pos_data = this.pos_data;
        var pos_num = pos_data.length;
        var data = {};
        for (var pos_i = 0; pos_i < pos_num; pos_i++) {
            if (pos_data[pos_i].length == 1) {
                var key = pos_data[pos_i];
                data[key] = {};
                data[key].name = key;
                data[key].i = pos_i;
                data[key].j = 0;

            } else {
                key = pos_data[pos_i][0];
                data[key] = {};
                data[key].id = "pos_" + pos_i;
                data[key].name = key;

                data[key].items = {};
                // 配列の1番目以降が詳細
                for (var pos_j = 1; pos_j < pos_data[pos_i].length; pos_j++) {
                    var name = pos_data[pos_i][pos_j];
                    data[key].items[name] = {};
                    data[key].items[name].name = name;
                    data[key].items[name].i = pos_i;
                    data[key].items[name].j = pos_j;
                }
            }
        }

        $(function () {
            /**************************************************
             * Context-Menu with Sub-Menu
             **************************************************/
            $.contextMenu({
                selector: '.context-menu-sub.pos',
                trigger: 'left', //hover
                autoHide: true,
                delay: 100,
                callback: function (key, options) {
                    // dataからi(pos_i)とj(pos_j)を取得
                    if (options.items[key] != undefined) {
                        var i = options.items[key].i;
                        var j = options.items[key].j;
                    } else {
                        for (var elem in options.items) {
                            var obj = options.items[elem]["items"];
                            if (obj && (key in obj)) {
                                i = obj[key].i;
                                j = obj[key].j;
                                break;
                            }
                        }
                    }
                    var m_num = this[0].m_num;
                    myWmrphFrame.reset_pos(m_num, i, j);
                },
                items: data
            });
        });
    };

    // 活用形のcontext menu
    this.setConjContextEvent = function () {
        for (var i = 0; i < this.pos_data.length; i++) {
            var data = {};
            var pos = this.pos_data[i][0];
            var label = pos + ":*";
            var conj_types = this.rel_table[label];

            if (conj_types) {
                var className = "conj-" + i + "-0";
                var selector = "." + className;
                this.context_class_table[label] = className;
                this.makeConjContextMenu(label, selector, true); //true:活用形あり

            } else if (this.pos_data[i].length > 0) {
                for (var j = 1; j < this.pos_data[i].length; j++) {
                    label = pos + ":" + this.pos_data[i][j];
                    className = "conj-" + i + "-" + j;
                    selector = "." + className;
                    conj_types = this.rel_table[label];

                    if (conj_types) {
                        this.context_class_table[label] = className;
                        this.makeConjContextMenu(label, selector, true); //true:活用形あり
                    }
                }
            }
        }
        // 活用がないもの(直接入力)
        selector = "." + this.direct_input_class;
        this.makeConjContextMenu("", selector, false); //直接入力のみ

    };

    // context menu作成
    this.makeConjContextMenu = function (label, selector, conjFlag) {
        var data = {};
        if (conjFlag) {
            var name = "";
            var conj_types = this.rel_table[label];
            for (var i = 0; i < this.conj_data.length; i++) {
                var re = new RegExp(this.conj_data[i][0]);

                if (!conj_types.match(re)) {
                    continue;
                }
                var key = this.conj_data[i][0];
                data[key] = {};
                data[key].name = key;
                data[key].items = {};

                for (var j = 1; j < this.conj_data[i].length; j++) {
                    var type = this.conj_data[i][j];
                    var type_key = key + type;
                    data[key].items[type_key] = {};
                    data[key].items[type_key].name = type;
                    data[key].items[type_key].i = i;
                    data[key].items[type_key].j = j;
                }
            }
        }

        data["直接入力"] = {};
        data["直接入力"].name = "直接入力";

        $(function () {
            $.contextMenu({
                selector: selector,
                trigger: 'left', //hover
                autoHide: true,
                delay: 100,
                callback: function (key, options) {
                    var m_num = this[0].m_num;
                    if (key == "直接入力") {
                        myWmrphFrame.target_m_num = m_num;
                        document.getElementById("conj-textbox").value = "";
                        $('#conj-input-dialog').dialog('open');

                    } else {
                        // conjデータのインデックス取得
                        for (var elem in options.items) {
                            var obj = options.items[elem]["items"];
                            if (obj && (key in obj)) {
                                i = obj[key].i;
                                j = obj[key].j;
                                break;
                            }
                        }
                        myWmrphFrame.reset_conj(m_num, i, j);
                    }
                },
                items: data
            });
        });

    };

};
