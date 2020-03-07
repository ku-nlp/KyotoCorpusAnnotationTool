
// RelationFrameクラス
var RelationFrame = function() {

    this.edit_i = 0;
    this.bnst_data_dpnd_back = null;
    this.orig_bnst_data_dpnd_back = null;

    // 初期化
    this.bnst_data_dpnd = null;
    this.bnst_data_start = null;
    this.bnst_data_type = null;
    this.bnst_data_f = null;
    this.bnst_num = null;

    this.sentence_table = null;

    this.orig_bnst_data_num = null;
    this.orig_bnst_data_start = null;
	this.orig_bnst_data_end = null;
	this.orig_bnst_data_dpnd = null;
	this.orig_bnst_data_type = null;
	this.orig_bnst_data_f = null;

    this.mrph_data_all = null;
    this.mrph_data_start = null;

    this.currentCellId = null;
    this.textBeforeSelect = "";
    this.modifyMode = MODIFY_MODE.OVERWRITE;
	// document.getElementById("modify_mode").innerHTML = MODIFY_MODE_DESC.OVERWRITE;
	document.getElementById("modify_mode").src = MODIFY_MODE_SRC.OVERWRITE.of;
    $("#modify_mode").mouseover(function() {
        this.src = MODIFY_MODE_SRC.OVERWRITE.on;
    });
    $("#modify_mode").mouseout(function() {
        this.src = MODIFY_MODE_SRC.OVERWRITE.of;
    });

    this.input_sentence = null;
    this.comment = null;
    this.contextinfo = null;
    this.caseBox = null;
    this.caseBoxNum = null;
    this.caseName = null;
    this.fileInfo = null;
    this.memo = "";
    
    this.select_mode = false;

    this.wrongTreeState = false;
    this.bnstTreeMap = null;

    // 品詞マーク
    this.pos_mark = {
	    '特殊':     '*',
	    '動詞':     'v',
	    '形容詞':   'j',
	    '判定詞':   'c',
	    '助動詞':   'x',
	    '名詞':     'n',
	    '固有名詞': 'N', //特別
	    '人名':     'J', //特別
	    '地名':     'C', //特別
	    '組織名':   'A', //特別
	    '指示詞':   'd',
	    '副詞':     'a',
	    '助詞':     'p',
	    '接続詞':   'c',
	    '連体詞':   'm',
	    '感動詞':   '!',
	    '接頭辞':   'p',
	    '接尾辞':   's',
	    '未定義語':  '?'
    };

    this.currentShowIndex = "";

    // 文節画面初期化
    this.init = function() {
	    this.currentShowIndex = 0;
	    // inputFileListの先頭のデータをセット
	    this.initInputData();	
	    // 構文木文節テーブルの表示
	    this.makeCaseTable();
	    // 構文木の線引き
	    this.draw_matrix();
	    // 文情報表示
	    this.show_sentence_info();
        
        // 全文表示
        this.show_prev_sentence();
        this.draw_matrix_prev();

        // メニュー初期化
	    this.initMenu();
        this.initTreeHistory();
    };

    // 要素削除
    this.removeContent = function(removePrev) {
        //$('#out').find("*").addBack().off();
        for (var i = 0; i < this.bnst_num; i++) { 
            $.contextMenu('destroy',"#treeCorner" + i);
        }
        //$.contextMenu('destroy');
        $('#out').empty();
        if (removePrev) {
            $('#all-sentence').empty();
        }
    };

    // 文節クリックイベント
    this.clickBnst = function(elem) {
	    if (this.select_mode) {
	        this.append_thissentence_tag(elem.id);
	    } else {
            var bnstId = elem.id.match(/bnst([0-9]+)/)[1];
            if (this.selectedCorner >= 0) {
                var m = elem.id.match("bnst(.*)");
                var srcId = this.selectedCorner;
                if (this.wrongTreeState) {
                    //bnstId = this.bnstTreeMap[bnstId];
                    srcId = this.bnstTreeMap[srcId];
                }
                if (bnstId == srcId) {
                    bnstId = -1;
                }
                this.reset_dpnd(srcId, bnstId, "D");
                this.selectedCorner = -1;
                $(".treeCorner").removeClass("selected");
            } else {
	            $('#dialogdemo1').dialog('close');
	            $('#dialogdemone').dialog('close');
                myWmrphFrame.show_bnst(parseInt(bnstId), 0);
	        }
        }
    };

    // タグ選択モードの切り替え
    this.switch_select_mode = function(enable) {
	    if (this.select_mode == enable) {
	        return;
	    }
	    var tag_id = '#' +  this.currentCellId;
	    var m = tag_id.match(/tag(.*)_(.*)/);
	    var i = parseInt(m[1],10);// + 1;
	    var kaku = this.caseName[m[2]];
	    
	    if (enable) {
            var $td = $("td" + tag_id);
            $td.css("background-color", '#DBD0E1'); //SlateBlue1

	        var newText = "選択中";
            var $span = $("span", tag_id);
            $span.text(newText);
            $span.css("color", "white");
            
	    } else {
	        this.make_string(i, kaku);
	    }
	    $("#dialog-tree-select").toggleClass("ui-state-disabled");
	    $("#dialog-menu-cancel").toggleClass("ui-state-disabled");
	    this.select_mode = enable;
    };

    // ナビゲーション
    this.navigate = function(i) {

	    this.switch_select_mode(false);

	    if((this.currentShowIndex + i) >= inputFileList.length) {
	        alert("これが最後の文です");
	        return;
	    } else if((this.currentShowIndex + i) < 0) {
	        alert("これが最初の文です");
	        return;
	    }
        
        // 構文木文節テーブル削除
        var removePrev = true;
        this.removeContent(removePrev);
	    
        // データ読み込み/初期化
	    this.currentShowIndex += i;
	    this.initInputData();

	    // 構文木文節テーブルの表示
	    this.makeCaseTable();

	    // 構文木の線引き
	    this.draw_matrix();

	    // 文情報表示
	    this.show_sentence_info();

        // メニュー初期化
	    this.initMenu();
        this.initTreeHistory();

        // 初期化
        innerLayout.close("south");
        myWmrphFrame = new WmrphFrame();
        myWmrphFrame.init();

    };

    // 前の文
    this.goto_prev_command = function() {
        if (this.wrongTreeState) {
	        $('#wrong-tree-dialog').dialog('open');
            return;
        }
        if(modify_flag == "*") {
	        $('#prev-dialog').dialog('open');
            return;
        }
        this.jump(-1);
    };

    // 次の文
    this.goto_next_command = function() {
        if (this.wrongTreeState) {
	        $('#wrong-tree-dialog').dialog('open');
            return;
        }
        if(modify_flag == "*") {
	        $('#next-dialog').dialog('open');
            return;
        }
        this.jump(1);
    };

    // ジャンプ
    this.jump = function(i) {
	$('#dialogdemo1').dialog('close');
        $('#dialogdemone').dialog('close');
	this.navigate(i);
        $('#all-sentence').empty();
        this.show_prev_sentence();
        this.draw_matrix_prev();
        this.scrollToCurrentSentence();
        var sid = inputFileList[this.currentShowIndex];
        backupDataList[sid] = jQuery.extend(true, {}, inputDataList[sid]);
    };

    // UNDO
    this.undo = function() {
        var sid = inputFileList[this.currentShowIndex];
        inputDataList[sid] = jQuery.extend(true, {}, backupDataList[sid]);
    };

    this.updateUndoRedoBtn = function() {
        if (this.edit_i == 0) {
            $('#undoBtn').prop("disabled",true);
        } else {
            $('#undoBtn').prop("disabled",false);
        }
        if (this.edit_i < this.bnst_data_dpnd_back.length-1) {
            $('#redoBtn').prop("disabled",false);
        } else {
            $('#redoBtn').prop("disabled",true);
        }
    }

    this.undoTree = function() {
        this.edit_i -= 1;
        this.bnst_data_dpnd = jQuery.extend(true, [], this.bnst_data_dpnd_back[this.edit_i]);
        this.orig_bnst_data_dpnd = jQuery.extend(true, [], this.orig_bnst_data_dpnd_back[this.edit_i]);
        if (TREE_MODE == 'R') {
            this.draw_matrix_ja();
        } else if (TREE_MODE == 'LR') {
            this.draw_matrix_en();
        }         
        this.updateUndoRedoBtn();
    }

    this.redoTree = function() {
        this.edit_i += 1;
        this.bnst_data_dpnd = jQuery.extend(true, [], this.bnst_data_dpnd_back[this.edit_i]);
        this.orig_bnst_data_dpnd = jQuery.extend(true, [], this.orig_bnst_data_dpnd_back[this.edit_i]);
        // this.bnst_data_dpnd = this.bnst_data_dpnd_back[this.edit_i];
        // this.orig_bnst_data_dpnd = this.orig_bnst_data_dpnd_back[this.edit_i];
        if (TREE_MODE == 'R') {
            this.draw_matrix_ja();
        } else if (TREE_MODE == 'LR') {
            this.draw_matrix_en();
        }         
        this.updateUndoRedoBtn();
    }

    // 更新
    this.update = function() {
        var sid = inputFileList[this.currentShowIndex];
        inputDataList[sid]["bnst_num"] = this.bnst_num;
        inputDataList[sid]["mrph_num"] = this.mrph_num;
        inputDataList[sid]["caseBoxNum"] = this.caseBoxNum;

        // 係わり受けの編集をしないLRモードでは、全文表示を更新する
        var removePrev = TREE_MODE == 'LR' ? false : true;
        this.removeContent(removePrev);
	    // 構文木文節テーブルの表示
	    this.makeCaseTable();
	    // 構文木の線引き
        if (TREE_MODE == 'R') {
            this.draw_matrix_ja();
        } else if (TREE_MODE == 'LR') {
            this.draw_matrix_en();
        } 
	    //this.draw_matrix();
        // 全文表示
        if (removePrev) {
            this.show_prev_sentence();
            this.draw_matrix_prev();
        }

        this.initTreeHistory();
    };

    // MEMO表示
    this.show_sentence_info = function() {
	    document.getElementById("comment").innerHTML = "";
        var memo_text = "";
	    var m = this.comment.match(/MEMO:(.*)/);
        var text = "";
        if(m) {
            text = m[1];
            this.comment = this.comment.replace(/(MEMO:.*)/, "");
        }

	    $("#comment").html(this.comment);
        $("#memo").val(text);
	    $("#sentence").html(this.input_sentence);
    };

    // 検索
    this.search = function(txt) {
        // txtが空の場合
        if(txt == "") {
            return;
        }

        if(modify_flag == "*") {
            alert("Saveされていません");
            return;
        }

        var jump_id = null;
        // 次を検索
        for(var i=this.currentShowIndex+1; i<inputFileList.length; i++) {
	        var sid = inputFileList[i]; // センテンスIDを取得

            // fileinfoを検索
            if(sid && (inputDataList[sid]["memo"] != undefined)) {
                var match = inputDataList[sid]["memo"].match(txt);
                if(match) {
                    jump_id = i - this.currentShowIndex;
                    break;
                }
            }
            // input_sentenceを検索
            if(sid && (inputDataList[sid]["input_sentence"] != undefined)) {
                var match = inputDataList[sid]["input_sentence"].match(txt);
                if(match) {
                    jump_id = i - this.currentShowIndex;
                    break;
                }
            }
        }

        if(jump_id == null) {
            // 前を検索
            for(var i=0; i<this.currentShowIndex; i++) {
	            var sid = inputFileList[i]; // センテンスIDを取得
                // fileinfoを検索
                if(sid && (inputDataList[sid]["memo"] != undefined)) {
                    var match = inputDataList[sid]["memo"].match(txt);
                    if(match) {
                        jump_id = i - this.currentShowIndex;
                        break;
                    }
                }
                // input_sentenceを検索
                if(sid && (inputDataList[sid]["input_sentence"] != undefined)) {
                    var match = inputDataList[sid]["input_sentence"].match(txt);
                    if(match) {
                        jump_id = i - this.currentShowIndex;
                        break;
                    }
                }
            }
        }

        if(jump_id) {
            this.jump(jump_id);
            return;
        }

    };

    this.initTreeHistory = function() {
        this.edit_i = 0;
        this.bnst_data_dpnd_back = [];
        this.orig_bnst_data_dpnd_back = [];
        this.bnst_data_dpnd_back[this.edit_i] = jQuery.extend(true, [], this.bnst_data_dpnd);
        this.orig_bnst_data_dpnd_back[this.edit_i] = jQuery.extend(true, [], this.orig_bnst_data_dpnd);
        this.updateUndoRedoBtn();
    }

    this.initMenu = function() {
	    
	    $('#case_list').empty();
	    for (var caseName in CaseOrder) {
	        var classStr = "kaku";	    
	        if (this.caseBox[caseName]) {
		        classStr = "kaku disabled";
	        }

	        $('#case_list').append('<li><a class="' + classStr + '">' + caseName + '</a></li>');
		if (CaseOrder[caseName] <= -100) {
		    break;
		}
	    }
	    $('#compound_case_list').empty();
	    for (var i = 0; i < CompoundCases.length; i++) {
	        var classStr = "kaku";
	        var caseName = CompoundCases[i];
	        if (this.caseBox[caseName]) {
		        classStr = "kaku disabled";
	        }

	        $('#compound_case_list').append('<li><a class="' + classStr + '">' + caseName + '</a></li>');
	    }
    };
    
    // set data
    this.initInputData = function() {
	    var sid = inputFileList[this.currentShowIndex]; // センテンスIDを取得

	    this.comment = inputDataList[sid]["memo"];
	    this.fileInfo = inputDataList[sid]["fileInfo"];
	    this.contextinfo = inputDataList[sid]["contextinfo"];
	    this.caseBox = inputDataList[sid]["caseBox"];
	    this.caseBoxNum = inputDataList[sid]["caseBoxNum"];
	    this.caseName = inputDataList[sid]["caseName"];
        this.input_sentence = inputDataList[sid]["input_sentence"];

	    this.bnst_data_btype = inputDataList[sid]["bnst_data_btype"];
		this.bnst_data_dpnd = inputDataList[sid]["bnst_data_dpnd"];
		this.bnst_data_start = inputDataList[sid]["bnst_data_start"];
		this.bnst_data_type = inputDataList[sid]["bnst_data_type"];
		this.bnst_data_f = inputDataList[sid]["bnst_data_f"];
		this.bnst_num = inputDataList[sid]["bnst_num"];
		this.mrph_num = inputDataList[sid]["mrph_num"];
	    this.orig_bnst_data_num = inputDataList[sid]["orig_bnst_data_num"];

	    this.orig_bnst_data_start = inputDataList[sid]["orig_bnst_data_start"];
	    this.orig_bnst_data_end = inputDataList[sid]["orig_bnst_data_end"];
	    this.orig_bnst_data_dpnd = inputDataList[sid]["orig_bnst_data_dpnd"];
	    this.orig_bnst_data_type = inputDataList[sid]["orig_bnst_data_type"];
	    this.orig_bnst_data_f = inputDataList[sid]["orig_bnst_data_f"];
		this.orig_bnst_num = inputDataList[sid]["orig_bnst_num"];

	    this.mrph_data_all = inputDataList[sid]["mrph_data_all"];
	    this.mrph_data_start = inputDataList[sid]["mrph_data_start"];
    };

    // this.removeBnst = function (bnst_index) {
    //     this.bnst_data_btype.splice(bnst_index);
    //     this.bnst_data_dpnd.splice(bnst_index);
    //     this.bnst_data_start.splice(bnst_index);
    //     this.bnst_data_type.splice(bnst_index);
    //     this.bnst_num--;
    //     this.orig_bnst_data_num.splice(bnst_index);
    //     this.orig_bnst_data_start.splice(bnst_index);
    //     this.orig_bnst_data_end.splice(bnst_index);
    //     this.orig_bnst_data_dpnd.splice(bnst_index);
    //     this.orig_bnst_data_type.splice(bnst_index);
    //     this.orig_bnst_data_f.splice(bnst_index);
    //     this.orig_bnst_num--;

    //     for (var i = 0; i <= this.bnst_num; i++) {
    //         if (this.bnst_data_dpnd[i] > bnst_index) {
    //             this.bnst_data_dpnd[i]--;
    //             this.orig_bnst_data_dpnd[i]--;
    //         } 
    //     }
        
    // }

    // 構文木context menu
    this.setBnstContextEvent = function(bnst_index) {
        
        // var pos_data = this.pos_data;
        // var pos_num = pos_data.length;
        var types = ["D", "P", "A", "I"];
        var data = {};
        data[0] = {
            id : 0,
            name : "ROOT",
            //data[i].items = {},
            target : -1,
            type : 0
        };
        var targetIndex = this.wrongTreeState ? this.bnstTreeMap[bnst_index] : bnst_index;
        for (var i = 0; i < this.bnst_num; i++) {
            if (targetIndex == i) {
                continue;
            }

            data[i+1] = {
                id : i+1,
                name : this.sentence_table[i],            
                //data[i].items = {},
                target : i,
                type : 0
            };
            // 配列の1番目以降が詳細
            // for (var j = 0; j < types.length; j++) {
            //     var key = i + "_" + j;
            //     data[i].items[key] = {};
            //     data[i].items[key].name = types[j];
            //     data[i].items[key].i = '' + i;
            //     data[i].items[key].j = '' + j;
            // }
        }
        
        $.contextMenu('destroy',"#treeCorner" + bnst_index);
        
        $(function(){
            /**************************************************
             * Context-Menu with Sub-Menu
             **************************************************/
            $.contextMenu({
                selector: '#treeCorner' + bnst_index,
                trigger: 'left',
                className: "limit-context-size",
                autoHide: true,
                delay: 100,
                callback: function(key, options) {
                    // dataからi(pos_i)とj(pos_j)を取得
                    var target
                    var typeIndex;
                    if(options.items[key] != undefined) {
                        target = options.items[key].target;
                        typeIndex = options.items[key].type;
                    } else {
                        for(var elem in options.items) {
                            var obj = options.items[elem]["items"];
                            if(obj && (key in obj)) {
                                target = obj[key].target;
                                typeIndex = obj[key].type;
                                break;
                            }
                        }
                    }
                    var srcId = this[0].id;
                    var m = srcId.match(/treeCorner(.*)/);
                    var src = m[1];
                    if (myRelationFrame.wrongTreeState) {
                        src = myRelationFrame.bnstTreeMap[src];
                        //target = myRelationFrame.bnstTreeMap[target];
                    }
                    myRelationFrame.reset_dpnd(src, target, types[typeIndex]);
                },
                items: data
            });
        });
    };

    // テーブル初期化
    this.makeCaseTableEn = function () {

	    // 構文木を生成
	    this.sentence_table = [];
	    var i = 0;
	    for(var m_num=0; m_num < this.mrph_data_all.length; m_num++) {
            if(this.mrph_data_start[m_num] == 1) { // 文節始まり
		        i++;
                if (m_num > 0) {
                    this.sentence_table[i-1] += '</span>';
                }
                this.sentence_table[i-1] = '<span class="bnst" id="bnst'+ (i-1) +'">';
		        this.sentence_table[i-1] += this.mrph_data_all[m_num][0];
            } else {
		        this.sentence_table[i-1] += this.mrph_data_all[m_num][0];
            }
            // 品詞情報取得
            var label;
            var mark;
            label = this.mrph_data_all[m_num][3];
            if (this.mrph_data_all[m_num][5] == '固有名詞' ||
                this.mrph_data_all[m_num][5] == '人名' ||
                this.mrph_data_all[m_num][5] == '地名' ||
                this.mrph_data_all[m_num][5] == '組織名') {
                label = this.mrph_data_all[m_num][5];
            }
            mark = this.pos_mark[label];
            if (mark == undefined) {
                //label = this.mrph_data_all[m_num][2];
                //mark = "[" + this.pos_mark[label] + "]";
                mark = "[" + label.substring(0,2) + "]";
            }
            this.sentence_table[i-1] += mark;
	    }

        var tree = new Tree();
        var nodes = tree.format_dtree(this.bnst_data_dpnd, this.sentence_table, this.bnst_data_type);
        var tree_lines = [];
        tree.print_dtree(tree_lines, nodes[tree.root], "", []);
        //console.log(tree_lines);

	    var cols = this.caseBoxNum + 1;

	    var table = document.createElement("table");
        table.id = "editable-table";
	    table.setAttribute("border", "1");
	    table.setAttribute("cellSpacing", "0px");
	    table.setAttribute("cellPadding", "0px");
	    var thead = document.createElement("thead");
	    var tr = document.createElement("tr");

	    for (var j = 0; j <= cols; j++) {

            var td = document.createElement("td");
            td.setAttribute("align", "center");
            if(j==0){
		        var title = document.createTextNode("");
            } else if(j==1){
		        var title = document.createTextNode("構文木");
            } else {
                // 格名
		        var title = document.createTextNode(this.caseName[j-1]);
            }
            td.appendChild(title);
            tr.appendChild(td);
	    }
	    thead.appendChild(tr);
	    var tbody = document.createElement("tbody");
	    for(var ti = 0; ti < this.bnst_num; ti++){
            var tr = document.createElement("tr");
            for(var j = 0; j <= cols; j++){
                var kaku = this.caseName[j];
		        var td = document.createElement("td");
		        
                if (j==0) {
		            var topElem = document.createElement("div");
                    topElem.className = "top en";		            
                    var title = document.createElement("div");
                    title.className = "tableWord";
			        title.id = "tableWord" + ti;
                    title.innerHTML = this.mrph_data_all[ti][0];
			        topElem.appendChild(title);
                    td.appendChild(topElem);
                    
                } else if (j==1){
                    td.className = "rel-tree";
		            var topElem = document.createElement("div");
		            //topElem.setAttribute("align", "left");
                    topElem.className = "top en";
		            
                    //if(sentence_table[ti]) {
			        if (tree_lines[ti]) {
                        var title = document.createElement("div");
                        title.className = "treeEn";
			            title.id = "tree" + ti;
			            //title.innerHTML = sentence_table[ti];
                        title.innerHTML = tree_lines[ti];
			            topElem.appendChild(title);

                        //this.setBnstContextEvent(ti);
		            }
		            // for(var t_i=1; t_i<this.bnst_num; t_i++) {
			        //     var elem = document.createElement("div");
			        //     elem.id = ti + "_" + t_i;
			            
			        //     if(t_i > ti) {
			        //         elem.innerHTML = "　";
                    //         elem.className = "tree";
			        //     } else {
			        //         elem.innerHTML = "";
                    //         elem.className = "nil";
			        //     }
			            
			        //     topElem.appendChild(elem);
		            // }
                    td.appendChild(topElem);
                    
		        } else {
		            td.id = "tag" + ti + "_" + (j-1);
		            td.setAttribute("align", "center");
                    if(kaku == 'メモ') {
                        var title = null;
		                td.innerHTML='<input type="text" name="name" id="' + ti 
		                    +'" style="width: 200px; " class="memo_tag text ui-widget-content ui-corner-all" value=""'
		                    + ' onblur="memo_tag_blur(this)"/>';
                    } else {
		                var title = document.createElement("span");
                    }

		            
		            var titleText = "";
		            if(this.contextinfo[ti]) {
			            if(this.contextinfo[ti][this.caseName[j-1]]) {
                            // タグ
			                titleText = this.make_string(ti,this.caseName[j-1]);
                            
                            if(kaku == 'メモ') {

	                            var tag = this.contextinfo[ti][kaku];
                                var val = tag.Data[0].data;

                                var title = titleText.innerHTML;
		                        td.innerHTML='<input type="text" name="name" id="' + ti
		                            +'" style="width: 200px" class="memo_tag text ui-widget-content ui-corner-all" value="'
                                    + val
		                            + '" onblur="memo_tag_blur(this)"/>';
                            } else {
			                    title.innerHTML = titleText;
                            }

                            if(kaku == 'NE') {
                                td.style.backgroundColor = ColorNE;
                            }
			            }
		            }
                    if(title != undefined) {
		                td.appendChild(title);
                    }
		            td.className = "tag";

                    if(title != undefined && title.style != undefined) {
			if (this.check_have_extra_tag(this.contextinfo, ti, kaku)) {
	                    color = 'red';
	                } else {
                            var flag = 0;
	                    color = 'black';
	                }
                        title.style.color = color;
                    }
		        }
                
		        tr.appendChild(td);
		        
            }
            tbody.appendChild(tr);
	    }
	    table.appendChild(thead);
	    table.appendChild(tbody);
	    document.getElementById("out").appendChild(table);

        // 改行させないため動的に min-width をセット
        // 一旦改行が発生しないくらいの幅を設定てから解像度にあわせてmaxWidthを取得
        $(".rel-tree").css("min-width", 2000);
        var maxWidth = 0;
        $(".top").each(function(i) {
            var width = $(this).get(0).offsetWidth + 10; // need +1 for firefox and more for IE... looks OK with 10
            if(maxWidth < width) {
                maxWidth = width;
            }
        });
        $(".rel-tree").css("min-width", maxWidth);

    };

    // テーブル初期化
    this.makeCaseTableJa = function () {

	    // 構文木を生成
	    var sentence_table = [];
	    var i = 0;
	    for(var m_num=0; m_num < this.mrph_data_all.length; m_num++) {
            if(this.mrph_data_start[m_num] == 1) { // 文節始まり
		        i++;
		        sentence_table[i-1] = this.mrph_data_all[m_num][0];
            } else {
		        sentence_table[i-1] += this.mrph_data_all[m_num][0];
            }
            // 品詞情報取得
            var label = this.mrph_data_all[m_num][3];
            if (this.mrph_data_all[m_num][5] == '固有名詞' ||
                this.mrph_data_all[m_num][5] == '人名' ||
                this.mrph_data_all[m_num][5] == '地名' ||
                this.mrph_data_all[m_num][5] == '組織名') {
                label = this.mrph_data_all[m_num][5];
            }
            var mark = this.pos_mark[label];
            sentence_table[i-1] += mark;
	    }

	    var cols = this.caseBoxNum;

	    var table = document.createElement("table");
        table.id = "editable-table";
	    table.setAttribute("border", "1");
	    table.setAttribute("cellSpacing", "0px");
	    table.setAttribute("cellPadding", "0px");
	    var thead = document.createElement("thead");
	    var tr = document.createElement("tr");

	    for (var j = 0; j <= cols; j++) {

            var td = document.createElement("td");
            td.setAttribute("align", "center");
            if(j==0){
		        var title = document.createTextNode("構文木");
            }else{
                // 格名
		        var title = document.createTextNode(this.caseName[j]);
            }
            td.appendChild(title);
            tr.appendChild(td);
	    }
	    thead.appendChild(tr);
	    var tbody = document.createElement("tbody");
	    for(var ti = 0; ti < this.bnst_num; ti++){
            var tr = document.createElement("tr");
            for(var j = 0; j <= cols; j++){
                var kaku = this.caseName[j];
		        var td = document.createElement("td");
                td.className = "rel-tree";
		        
		        if(j==0){
		            var topElem = document.createElement("div");
		            //topElem.setAttribute("align", "right");
                    topElem.className = "top ja";
		            
                    if(sentence_table[ti]) {
			            var title = document.createElement("div");
                        title.className = "title bnst";
			            title.id = "bnst" + ti;
			            title.innerHTML = sentence_table[ti];
			            topElem.appendChild(title);

		            }
		            for(var t_i=1; t_i<this.bnst_num; t_i++) {
			            var elem = document.createElement("div");
			            elem.id = ti + "_" + t_i;
			            
			            if(t_i > ti) {
			                elem.innerHTML = "　";
                            elem.className = "tree";
			            } else {
			                elem.innerHTML = "";
                            elem.className = "nil";
			            }
			            
			            topElem.appendChild(elem);
		            }
                    td.appendChild(topElem);
                    
		        } else {
		            td.id = "tag" + ti + "_" + j;
		            td.setAttribute("align", "center");
                    if(kaku == 'メモ') {
                        var title = null;
		                td.innerHTML='<input type="text" name="name" id="' + ti 
		                    +'" style="width: 200px; " class="memo_tag text ui-widget-content ui-corner-all" value=""'
		                    + ' onblur="memo_tag_blur(this)"/>';
                    } else {
		                var title = document.createElement("span");
                    }

		            
		            var titleText = "";
		            if(this.contextinfo[ti]) {
			            if(this.contextinfo[ti][this.caseName[j]]) {
                            // タグ
			                titleText = this.make_string(ti,this.caseName[j]);
                            
                            if(kaku == 'メモ') {

	                            var tag = this.contextinfo[ti][kaku];
                                var val = tag.Data[0].data;

                                var title = titleText.innerHTML;
		                        td.innerHTML='<input type="text" name="name" id="' + ti
		                            +'" style="width: 200px" class="memo_tag text ui-widget-content ui-corner-all" value="'
                                    + val
		                            + '" onblur="memo_tag_blur(this)"/>';
                            } else {
			                    title.innerHTML = titleText;
                            }

                            if(kaku == 'NE') {
                                td.style.backgroundColor = ColorNE;
                            }
			            }
		            }
                    if(title != undefined) {
		                td.appendChild(title);
                    }
		            td.className = "tag";

                    if(title != undefined && title.style != undefined) {
			if (this.check_have_extra_tag(this.contextinfo, ti, kaku)) {
	                    color = 'red';
	                } else {
                            var flag = 0;
	                    color = 'black';
	                }
                        title.style.color = color;
                    }
		        }
                
		        tr.appendChild(td);
		        
            }
            tbody.appendChild(tr);
	    }
	    table.appendChild(thead);
	    table.appendChild(tbody);
	    document.getElementById("out").appendChild(table);

        // 改行させないため動的に min-width をセット
        // 一旦改行が発生しないくらいの幅を設定てから解像度にあわせてmaxWidthを取得
        $(".rel-tree").css("min-width", 2000);
        var maxWidth = 0;
        $(".top").each(function(i) {
            var width = $(this).get(0).offsetWidth + 10; // need +1 for firefox and more for IE... looks OK with 10
            if(maxWidth < width) {
                maxWidth = width;
            }
        });
        $(".rel-tree").css("min-width", maxWidth);

    };

    
    // 行列の各項表示
    this.draw_matrix_en = function () {
        var tree = new Tree();
        var nodes = tree.format_dtree(this.bnst_data_dpnd, this.sentence_table, this.bnst_data_type);
        var tree_lines = [];
        tree.print_dtree(tree_lines, nodes[tree.root], "", []);

        var wrongTreeState = false;
        this.bnstTreeMap = new Array();
        for (var i = 0; i < tree_lines.length; i++) {
            var m = tree_lines[i].match(/<span class="bnst" id="bnst([0-9]+)">/);
            if (m[1] != i) {
                wrongTreeState = true;
                $("#tree"+i).css("background-color", "#F18787");
            } else {
                $("#tree"+i).css("background-color", "");
            }
            this.bnstTreeMap[i] = m[1];
        }
        this.wrongTreeState = wrongTreeState;
        // if (this.wrongTreeState) {
        //     $(".rel-tree").css("background-color", "#F18787");
        // } else {
        //     $(".rel-tree").css("background-color", "");
        // }

        //console.log(tree_lines);

        for (var i = 0; i < this.bnst_num; i++) {
            $("div#tree" + i).html(tree_lines[i]);
            //this.setBnstContextEvent(i);
        }

    };

    // 行列の各項表示
    this.draw_matrix_ja = function () {
	    //構文木の線引き
	    var para_row;
	    var active_column = new Array();
	    var bmark, crossflag;

	    for (var i=0; i<this.bnst_num; i++) {
	        active_column[i] = 0;
	    }

        var last_id = this.bnst_num - 1;
        $("div#bnst" + last_id + ".title.bnst").css('background-color', BnstColor);

	    for (i = 0; i < (this.bnst_num - 1); i++) {
	        if (this.bnst_data_dpnd[i] == -1) {
		        // color = 'green';
                // $("div#" + i + ".title.bnst").css('background-color', 'green');
                $("div#bnst" + i + ".title.bnst").css('background-color', BnstAnotherColor);
	        }
	        else {
                $("div#bnst" + i + ".title.bnst").css('background-color', BnstColor);
	        }
	        
	        if (this.bnst_data_type[i] == 'P') {
		        para_row = 1;
	        } else {
		        para_row = 0;
	        }

	        if (this.orig_bnst_data_end[i] == 0) {
		        bmark = 1;
	        }
	        else {
		        bmark = 0;
	        }

	        for (var j = i + 1; j < this.bnst_num; j++) {
		        crossflag = 0;
		        var id = "#" + i + "_" + j;
		        var elem = $(id)[0];
                
		        if (j < this.bnst_data_dpnd[i]) {
		            if (active_column[j] == 2) {
			            crossflag = 1;
			            if (para_row == 1) {
			                elem.innerHTML = "╋";
			                elem.className = "tree vertical edit";
                            elem.style.backgroundColor = BnstAnotherColor;
                        } else {
			                elem.innerHTML = "╂";
			                elem.className = "tree vertical edit";
                            elem.style.backgroundColor = BnstAnotherColor;
                        }
		            } else if (active_column[j] == 1) {
			            crossflag = 1;
			            if (para_row == 1) {
			                elem.innerHTML = "┿";
			                elem.className = "tree vertical edit";
                            elem.style.backgroundColor = BnstAnotherColor;
			            } else {
			                elem.innerHTML = "┼";
			                elem.className = "tree vertical edit";
                            elem.style.backgroundColor = BnstAnotherColor;			            }
		            } else {
			            if (para_row == 1) {
			                elem.innerHTML = "━";
			                elem.className = "tree";
                            elem.style.backgroundColor = "";
			            } else {
			                elem.innerHTML = "─";
			                elem.className = "tree";
                            elem.style.backgroundColor = "";
			            }
		            }
		        }
		        else if (j == this.bnst_data_dpnd[i]) {
		            if (this.bnst_data_type[i] == "P") {
			            elem.innerHTML = "Ｐ";
		            } else if (this.bnst_data_type[i] == "I") {
			            elem.innerHTML = "Ｉ";
		            } else if (this.bnst_data_type[i] == "A") {
			            elem.innerHTML = "Ａ";
		            } else {
			            if (active_column[j] == 2) {
			                elem.innerHTML = "┨";
			                elem.className = "tree vertical edit";
			            } else if (active_column[j] == 1) {
			                elem.innerHTML = "┤";
			                elem.className = "tree vertical edit";
			            } else {
			                elem.innerHTML = "┐";
			                elem.className = "tree vertical edit";
			            }
		            }

		            if (active_column[j] == 2) {
			            ;		//すでにＰからの太線があればそのまま
		            } else if (para_row) {
			            active_column[j] = 2;
		            } else {
			            active_column[j] = 1;
		            }
		        } else {
		            if (active_column[j] == 2) {
			            elem.innerHTML = "┃";
			            elem.className = "tree vertical edit";
		            } else if (active_column[j] == 1) {
			            elem.innerHTML = "│";
			            elem.className = "tree vertical edit";
		            } else {
			            elem.innerHTML = "　";
			            elem.className = "tree";
		            }
		        }
		        if (bmark == 1 && crossflag == 0) {
                    elem.style.backgroundColor = BnstColor;
		            if (this.orig_bnst_data_end[j] == 1) {
			            bmark = 0;
		            }
		        }
	        }
	    }

    };


    // 依存構造修正
    this.reset_dpnd = function(i, j, type) {
        modify_flag = '*';
        modify_flag2 = '*';

        // iが新しいルート
        if ( j == -1) {
            // 古いルートの依存先をiに変更
            for (var k = 0; k < this.bnst_data_dpnd.length; k++) {
                if (this.bnst_data_dpnd[k] == -1) {
                    this.bnst_data_dpnd[k] = i;
                    this.bnst_data_type[k] = "D";
                    if(this.orig_bnst_data_end[k] == 1) {
                        // 係り受け先の基本句の属している文節の番号を取得
                        var b_k = this.orig_bnst_data_num[k]; //before(orig_bnst_num)
                        var b_i = this.orig_bnst_data_num[i]; //after
                        
                        if(b_i == undefined) {
                            b_i = -1;
                        }
                        this.orig_bnst_data_dpnd[b_k] = b_i;
                        this.orig_bnst_data_type[b_k] = type;
                    }
                    break; // currently only 1 root hopefully
                }                
            }
        }        
        this.bnst_data_dpnd[i] = j;
        this.bnst_data_type[i] = type;

        // reset orig_bnst
        if(this.orig_bnst_data_end[i] == 1) {
            // 係り受け先の基本句の属している文節の番号を取得
            var b_i = this.orig_bnst_data_num[i]; //before(orig_bnst_num)
            var b_j = this.orig_bnst_data_num[j]; //after

            if(b_j == undefined) {
                b_j = -1;
            }
            this.orig_bnst_data_dpnd[b_i] = b_j;
            this.orig_bnst_data_type[b_i] = type;
        }
        
        if (TREE_MODE == 'R') {
            this.draw_matrix_ja();
        } else if (TREE_MODE == 'LR') {
            this.draw_matrix_en();
        } 

        this.edit_i += 1;
        this.bnst_data_dpnd_back[this.edit_i] = jQuery.extend(true, [], this.bnst_data_dpnd);
        this.orig_bnst_data_dpnd_back[this.edit_i] = jQuery.extend(true, [], this.orig_bnst_data_dpnd);
        this.bnst_data_dpnd_back.splice(this.edit_i+1, this.bnst_data_dpnd_back.length - this.edit_i);
        this.orig_bnst_data_dpnd_back.splice(this.edit_i+1, this.bnst_data_dpnd_back.length - this.edit_i);
        this.updateUndoRedoBtn();

    };


    this.show_prev_sentence = function () {
        if (TREE_MODE == 'R') {
            this.show_prev_sentence_ja();
        } else if (TREE_MODE == 'LR') {
            this.show_prev_sentence_en();
        }
    }

    this.draw_matrix = function () {
        if (TREE_MODE == 'R') {
            this.draw_matrix_ja();
        } else if (TREE_MODE == 'LR') {
            //this.draw_matrix_en();
        }
    }

    this.draw_matrix_prev = function () {
        if (TREE_MODE == 'R') {
            this.draw_matrix_prev_ja();
        } else if (TREE_MODE == 'LR') {
            //this.draw_matrix_en();
        }
    }

    this.makeCaseTable = function () {
        if (TREE_MODE == 'R') {
            this.makeCaseTableJa();
        } else if (TREE_MODE == 'LR') {
            this.makeCaseTableEn();
        }
    }

    // 全文の構文木を表示
    this.show_prev_sentence_ja = function() {

        for(var si=0; si<inputFileList.length; si++) {
	        var sid = inputFileList[si]; // センテンスIDを取得

		    var bnst_num = inputDataList[sid]["bnst_num"];
		    var mrph_data_all = inputDataList[sid]["mrph_data_all"];
		    var mrph_data_start = inputDataList[sid]["mrph_data_start"];

	        var sentence_table = [];
	        var j = 0;

	        for(var m_num=0; m_num < mrph_data_all.length; m_num++) {
                if(mrph_data_start[m_num] == 1) { // 文節始まり
		            j++;
		            sentence_table[j-1] = mrph_data_all[m_num][0];
                } else {
		            sentence_table[j-1] += mrph_data_all[m_num][0];
                }
                // 品詞情報取得
                var label = mrph_data_all[m_num][3];
                if (mrph_data_all[m_num][5] == '固有名詞' ||
                    mrph_data_all[m_num][5] == '人名' ||
                    mrph_data_all[m_num][5] == '地名' ||
                    mrph_data_all[m_num][5] == '組織名') {
                    label = mrph_data_all[m_num][5];
                }
                var mark = this.pos_mark[label];
                sentence_table[j-1] += this.pos_mark[label]; // 品詞マークをつける
            }
	        var table = document.createElement("table");
            table.className = "prev_table";

	        var tbody = document.createElement("tbody");
	        for(var ti = 0; ti < bnst_num; ti++){

                var tr = document.createElement("tr");
		        var td = document.createElement("td");
                td.setAttribute("min-width", "100");
                
			    var topElem = document.createElement("div");
		        //topElem.setAttribute("align", "right");
                topElem.className = "prev top ja";
                
                if(sentence_table[ti]) {
			        var title = document.createElement("div");
                    title.className = "title_bnst";
			        title.id = /*"prev_" + */  si + "_bnst" + ti;
			        title.innerHTML = sentence_table[ti];
			        topElem.appendChild(title);
		        }

		        for(var t_i=1; t_i<bnst_num; t_i++) {
			        var elem = document.createElement("div");
			        elem.id = "prev_" + sid + "_" + ti + "_" + t_i;
                    
			        if(t_i > ti) {
			            elem.innerHTML = "　";
                        elem.className = "tree";
			        } else {
			            elem.innerHTML = "";
                        elem.className = "nil";
			        }
			        topElem.appendChild(elem);

		        }

                td.appendChild(topElem);
		        tr.appendChild(td);
                tbody.appendChild(tr);

            }

	        table.appendChild(tbody);

            var elem = document.createElement("div");
            var title = document.createElement("div");
            var senid = parseInt(si) + 1;
            title.innerHTML = "S-ID:" + sid + "(" + senid + "文目)";
            title.className = "sid";
            title.id = "title-" + sid;
            elem.appendChild(title);

            elem.appendChild(table);

            $("#all-sentence").append(elem);

        }
    };


    // 全文の構文木を表示
    this.show_prev_sentence_en = function() {

        for(var si=0; si<inputFileList.length; si++) {
	        var sid = inputFileList[si]; // センテンスIDを取得

		    var bnst_num = inputDataList[sid]["bnst_num"];
		    var mrph_data_all = inputDataList[sid]["mrph_data_all"];
		    var mrph_data_start = inputDataList[sid]["mrph_data_start"];

	        var sentence_table = [];
	        var j = 0;

	        for(var m_num=0; m_num < mrph_data_all.length; m_num++) {
                if(mrph_data_start[m_num] == 1) { // 文節始まり
		            j++;
		            sentence_table[j-1] = mrph_data_all[m_num][0];
                } else {
		            sentence_table[j-1] += mrph_data_all[m_num][0];
                }
                // 品詞情報取得
                var label;
                var mark;
                label = mrph_data_all[m_num][3];
                if (mrph_data_all[m_num][5] == '固有名詞' ||
                    mrph_data_all[m_num][5] == '人名' ||
                    mrph_data_all[m_num][5] == '地名' ||
                    mrph_data_all[m_num][5] == '組織名') {
                    label = mrph_data_all[m_num][5];
                }
                mark = this.pos_mark[label];
                if (mark == undefined) {
                    //label = mrph_data_all[m_num][2];
                    mark = "[" + label.substring(0,2) + "]";
                }
                sentence_table[j-1] += mark;

                // var label;
                // //if (LANG == 'ja') {
                //     label = mrph_data_all[m_num][3];
                //     if (mrph_data_all[m_num][5] == '固有名詞' ||
                //         mrph_data_all[m_num][5] == '人名' ||
                //         mrph_data_all[m_num][5] == '地名' ||
                //         mrph_data_all[m_num][5] == '組織名') {
                //         label = mrph_data_all[m_num][5];
                //     }
                // } else if (LANG == 'en') {
                //     label = mrph_data_all[m_num][2];                    
                // }
                // var mark = this.pos_mark[label];
                // sentence_table[j-1] += this.pos_mark[label]; // 品詞マークをつける
            }

            var tree = new Tree();
            var nodes = tree.format_dtree(inputDataList[sid].bnst_data_dpnd, sentence_table, inputDataList[sid].bnst_data_type);
            var tree_lines = [];
            tree.print_dtree(tree_lines, nodes[tree.root], "", []);
            //console.log(tree_lines);

	        var table = document.createElement("table");
            table.className = "prev_table";

	        var tbody = document.createElement("tbody");
	        for(var ti = 0; ti < bnst_num; ti++){

                var tr = document.createElement("tr");
		        var td = document.createElement("td");
                td.setAttribute("min-width", "100");
                
			    var topElem = document.createElement("div");
		        //topElem.setAttribute("align", "left");
                topElem.className = "prev top en";
                
                //if(sentence_table[ti]) {
                if (tree_lines[ti]) {
			        var title = document.createElement("div");
                    title.className = "title_bnst";
			        title.id = /*"prev_" + */  si + "_bnst" + ti;
			        //title.innerHTML = sentence_table[ti];
                    title.innerHTML = tree_lines[ti];
			        topElem.appendChild(title);
		        }

		        // for(var t_i=1; t_i<bnst_num; t_i++) {
			    //     var elem = document.createElement("div");
			    //     elem.id = "prev_" + sid + "_" + ti + "_" + t_i;
                    
			    //     if(t_i > ti) {
			    //         elem.innerHTML = "　";
                //         elem.className = "tree";
			    //     } else {
			    //         elem.innerHTML = "";
                //         elem.className = "nil";
			    //     }
			    //     topElem.appendChild(elem);

		        // }

                td.appendChild(topElem);
		        tr.appendChild(td);
                tbody.appendChild(tr);

            }

	        table.appendChild(tbody);

            var elem = document.createElement("div");
            var title = document.createElement("div");
            var senid = parseInt(si) + 1;
            title.innerHTML = "S-ID:" + sid + "(" + senid + "文目)";
            title.className = "sid";
            title.id = "title-" + sid;
            elem.appendChild(title);

            elem.appendChild(table);

            $("#all-sentence").append(elem);

        }
    };

    // 全文画面の係り受け線描画
    this.draw_matrix_prev_ja = function () {
        
        for(var si=0; si<inputFileList.length; si++) {
	        var sid = inputFileList[si]; // センテンスIDを取得

	        var bnst_data_btype = inputDataList[sid]["bnst_data_btype"];
		    var bnst_data_dpnd = inputDataList[sid]["bnst_data_dpnd"];
		    var bnst_data_start = inputDataList[sid]["bnst_data_start"];
		    var bnst_data_type = inputDataList[sid]["bnst_data_type"];
		    var bnst_data_f = inputDataList[sid]["bnst_data_f"];
		    var bnst_num = inputDataList[sid]["bnst_num"];
		    var orig_bnst_data_end = inputDataList[sid]["orig_bnst_data_end"];
		    var mrph_data_all = inputDataList[sid]["mrph_data_all"];
		    var mrph_data_start = inputDataList[sid]["mrph_data_start"];

	        //構文木の線引き
	        var para_row;
	        var active_column = new Array();
	        var bmark, crossflag;

	        for (var i=0; i<bnst_num; i++) {
	            active_column[i] = 0;
	        }
            
	        // tag[tag_num-1].bgcol = "bnst_color";
	        for (i = 0; i < (bnst_num - 1); i++) {
                if (bnst_data_dpnd[i] == -1) {
                    $("div#" + si + "_" + i + ".title_bnst").css('background-color', BnstAnotherColor);
                }

	            if (bnst_data_type[i] == 'P') {
		            para_row = 1;
	            } else {
		            para_row = 0;
	            }

	            if (orig_bnst_data_end[i] == 0) {
		            bmark = 1;
	            }
	            else {
		            bmark = 0;
	            }

	            for (var j = i + 1; j < bnst_num; j++) {
		            crossflag = 0;
		            var id = "#prev_" + sid + "_" + i + "_" + j;
		            var elem = $(id)[0];

		            if (j < bnst_data_dpnd[i]) {

		                if (active_column[j] == 2) {
			                crossflag = 1;
			                if (para_row == 1) {
			                    elem.innerHTML = "╋";
			                    elem.className = "tree vertical";
                                elem.style.backgroundColor = BnstAnotherColor;
			                } else {
			                    elem.innerHTML = "╂";
			                    elem.className = "tree vertical";
                                elem.style.backgroundColor = BnstAnotherColor;
			                }
		                } else if (active_column[j] == 1) {
			                crossflag = 1;
			                if (para_row == 1) {
			                    elem.innerHTML = "┿";
			                    elem.className = "tree vertical";
                                elem.style.backgroundColor = BnstAnotherColor;
			                } else {
			                    elem.innerHTML = "┼";
			                    elem.className = "tree vertical";
                                elem.style.backgroundColor = BnstAnotherColor;
			                }
		                } else {
			                if (para_row == 1) {
			                    elem.innerHTML = "━";
			                    elem.className = "tree";
			                } else {
			                    elem.innerHTML = "─";
			                    elem.className = "tree";
			                }
		                }
		            }
		            else if (j == bnst_data_dpnd[i]) {

		                if (bnst_data_type[i] == "P") {
			                elem.innerHTML = "Ｐ";
		                } else if (bnst_data_type[i] == "I") {
			                elem.innerHTML = "Ｉ";
		                } else if (bnst_data_type[i] == "A") {
			                elem.innerHTML = "Ａ";
		                } else {
			                if (active_column[j] == 2) {
			                    elem.innerHTML = "┨";
			                    elem.className = "tree vertical";
			                } else if (active_column[j] == 1) {
			                    elem.innerHTML = "┤";
			                    elem.className = "tree vertical";
			                } else {
			                    elem.innerHTML = "┐";
			                    elem.className = "tree vertical";
			                }
		                }

		                if (active_column[j] == 2) {
			                ;		//すでにＰからの太線があればそのまま
		                } else if (para_row) {
			                active_column[j] = 2;
		                } else {
			                active_column[j] = 1;
		                }
		            } else {

		                if (active_column[j] == 2) {
			                elem.innerHTML = "┃";
			                elem.className = "tree vertical";
		                } else if (active_column[j] == 1) {
			                elem.innerHTML = "│";
			                elem.className = "tree vertical";
		                } else {
			                elem.innerHTML = "　";
			                elem.className = "tree";
		                }
		            }
		            if (bmark == 1 && crossflag == 0) {
                        // 全文画面でも色つける場合はコメントを外す
                        // elem.style.backgroundColor = BnstColor;
		                if (orig_bnst_data_end[j] == 1) {
			                bmark = 0;
		                }
		            }
	            }
	        }


        }

    };

    this.highlight_target = function(tag_span, highlight) {
	    var selectedId = $(tag_span).attr('id');
	    var m = selectedId.match(/tag_(.*)_(.*)_(.*)/);
	    var bnst = parseInt(m[1],10);// + 1;
	    var kaku = m[2];
	    var tag_index = parseInt(m[3],10);
	    var tagData = this.contextinfo[bnst][kaku]['Data'][tag_index];
	    //alert("search " + kaku + " " + bnst + " " + tag_index);
	    if (tagData.dependant < 0) {
	        return;
	    }
	    var si = 0;
	    for (var si=0; si<=this.currentShowIndex; si++) {
	        if (tagData.SID == inputFileList[si]) {
		        break;
	        }
	    }
	    var color = highlight ? 'blue' : 'black';
	    var target_div = $('div#' + si + "_bnst" + tagData.dependant + ".title_bnst"); 
	    target_div.css("color" , color);
	    if (si == this.currentShowIndex) {		
	        var target_current_div = $('div#bnst' + tagData.dependant + ".title.bnst"); 
	        target_current_div.css("color" , color);
	    } else {
	        this.scrollToSentence(tagData.SID);
	    }
    }

    this.click_corner = function(corner) {
	    if (this.select_mode) {
            return;
	    }
        if ($(corner).hasClass("selected")) {
            $(".treeCorner").removeClass("selected");
            this.selectedCorner = -1;
            return;
        }
        $(".treeCorner").removeClass("selected");
        $(corner).addClass("selected");
	    var selectedCorner = $(corner).attr('id');
	    var m = selectedCorner.match(/treeCorner(.*)/);
	    this.selectedCorner = parseInt(m[1],10);
    }

    this.click_cell = function(cell) {

	    if (this.select_mode) {
	        return;
	    }
        
        if (this.wrongTreeState) {
	        $('#wrong-tree-dialog').dialog('open');
            return;
        }

        if (myWmrphFrame.active_b_num_start != -1) {
            myWmrphFrame.ok();
            innerLayout.close("south");

            // resetされたため対応するDOM要素がない状態
	        var id = $(cell).attr('id');
            cell = $('#' + id);
        }

	    $("#accordion, #accordion-sub").accordion({
	        header: "h3",
	        autoHeight:false,
		    collapsible: true,
	        heightStyle: "content"
	    });

	    var selectedId = $(cell).attr('id');
	    if (kaku != 'メモ') {
	        myRelationFrame.currentCellId = selectedId;
	    }
	    
	    var m = selectedId.match(/tag(.*)_(.*)/);
	    var i = parseInt(m[1],10);// + 1;
	    var kaku = this.caseName[m[2]];

        // // activeなセルを初期化
        $(".active").removeClass("active");
        $(".active-ne").removeClass("active-ne");

	    if (kaku == 'NE') {
	        $('#dialogdemo1').dialog('close');
	        this.populate_ne_tag_edit(i, kaku);
	        $('#dialogdemone').dialog({modal:false});
	        $('#dialogdemone').dialog('open');
            $(cell).addClass("active-ne");
	    } else if (kaku =='メモ') {
	        
	    } else {
	        $('#dialogdemone').dialog('close');
	        this.populate_tag_edit();	    
	        $('#dialogdemo1').dialog({modal:false});
	        $('#dialogdemo1').dialog('open');
            $(cell).addClass("active");
	    }

    };

    // 
    this.populate_ne_tag_edit = function(sentence_index, kaku) {
	    var tag_id = this.currentCellId;
	    if (!tag_id) {
	        return;
	    }
	    $( ".ne#accordion" ).accordion({ active: 0 });	

	    var m = tag_id.match(/tag(.*)_(.*)/);
	    var sidx = parseInt(m[1],10);// + 1;

	    $('#ne_tag_list').empty(); 
	    $('#ne_tag_input').empty(); 

	    $('#ne_tag_list').append("<ul>");
	    for (var i = 0; i<NETags.length; i++) {
	        //$('#ne_tag_list').append('<li><a class="ne_tag">' +  NETags[i] + '</a></li>') 
	        var checked = "";
	        if (this.contextinfo[sidx] 
		        && this.contextinfo[sidx][kaku] 
		        && this.contextinfo[sidx][kaku].Data[0].data.search(NETags[i]) >= 0) {
		        checked = 'checked="checked"';
	        }
	        $('#ne_tag_list').append('<li><input type="radio" class="ne_radio" name="ne_radio" ' + checked + 'id="' 
				                     + i + '"><a class="ne_tag">' +  NETags[i] + '</a></input></li>') 

	    } 
	    this.clear_ne_opt();
	    if (this.contextinfo[sidx] 
	        && this.contextinfo[sidx][kaku] 
	        && this.contextinfo[sidx][kaku].Data[0].data.search("OPTIONAL") >= 0) {
	        this.populate_ne_opt(sidx);
	    }
	    $('#ne_tag_list').append("</ul>");
	    var inputList = this.ne_candidate(sidx); 
	    for (var i=0; i<inputList.length; i++) {
	        $('#ne_tag_input').append('<p><input type="submit"  class="ne_button" id="ne_button_' + i + '" value="' + inputList[i]+ '"/></p>');
	    }

	    var oldtag
	    var oldtext = "";
	    if (this.contextinfo[sidx] && typeof(this.contextinfo[sidx][kaku]) != 'undefined') {
	        m = this.contextinfo[sidx][kaku].Data[0].data.match(/([^:]+):(.+)/);
	        oldtag = m[1];
	        oldtext = m[2];
	    }
	    
	    $('#ne_tag_input').append('<p><input type="text" name="name" id="ne_edit_text" style="width: 60%" class="text ui-widget-content ui-corner-all" value="'
				      + oldtext  + '"/><img class="setBtn" src="css/images/set_of.png" onmouseover="this.src=\'css/images/set_on.png\'" onmouseout="this.src=\'css/images/set_of.png\'" onclick="ne_mode_free()" id="ne_free_input"/></p>');

    };

    // NEオプション クリアー
    this.clear_ne_opt = function() {
	    $('#ne_opt_tag_list').empty(); 	
    };

    // NEオプション
    this.populate_ne_opt = function(sidx) {
	    $('#ne_opt_tag_list').empty(); 	
	    //$('#ne_opt_tag_list').append('<fieldset>');
	    var genHtml = '<fieldset>';
	    for (var i = 0; i<NE_OPT_TAG.length; i++) {
	        var checked = "";
	        if (this.contextinfo[sidx] 
		        && this.contextinfo[sidx]['NE-OPT-' + NE_OPT_TAG[i]] 
		        && this.contextinfo[sidx]['NE-OPT-' + NE_OPT_TAG[i]].Data[0].data) {
		        checked = 'checked="checked"';
	        }

	        genHtml += '<li><input type="checkbox" class="ne_opt_check" name="ne_check" '+ checked +'  id="' 
		        + i + '"><a class="ne_tag">' +  NE_OPT_TAG[i] + '</a></input></li>';
	    }

	    genHtml += "<p>Type:</p>";
	    for (var i = 0; i<NE_OPT_TYPE.length; i++) {
	        var checked = "";
	        if (this.contextinfo[sidx] 
		        && this.contextinfo[sidx]['NE-OPT-TYPE'] 
		        && this.contextinfo[sidx]['NE-OPT-TYPE'].Data[0].data == NE_OPT_TYPE[i]) {
		        checked = 'checked="checked"';
	        }

	        genHtml += '&nbsp;<input type="radio" class="ne_opt_radio" name="ne_opt_radio" '+ checked +'  id="' 
				+ i + '"><a class="ne_tag">' +  NE_OPT_TYPE[i] + '</a></input>';
	    }
	    genHtml += '</fieldset>';
	    $('#ne_opt_tag_list').append(genHtml);

    };


    this.populate_tag_edit = function() {

	    var tag_id = this.currentCellId;
	    if (!tag_id) {
	        return;
	    }
	    var m = tag_id.match(/tag(.*)_(.*)/);
	    var i = parseInt(m[1],10);// + 1;
	    var kaku = this.caseName[m[2]];

	    $('#tag_delete_list').empty();
	    $('#tag_edit_list').empty();
	    $('#tag_nearly_list').empty();
	    $('#tag_equalopt1_list').empty();
	    $('#tag_equalopt2_list').empty();
            $('h3.equalopt').hide();

	    var tag_id = '#' + tag_id;
	    var tags = $("span", tag_id).text();
	    if (!tags) {
	        $('h3.semiequal').hide();
		$('h3.delete').hide();
	        return;
	    }
	    $('h3.semiequal').show();
	    $('h3.delete').show();

	    var tagData = this.contextinfo[i][kaku].Data;

	    for (var k = 0; k < tagData.length; k++) {
	        var tag = tagData[k];
	        $('#tag_delete_list').append('<p><input type="checkbox" class="delcheck" id="' + k + '" value="0" checked="checked"/>' 
				                         + tag.data + '</p>');

	        $('#tag_nearly_list').append('<li><a href="#" class="nearly" id="' + k + '">' 
					                     + tag.data 
					                     + (tag.equalopt ? '[' + EQUAL_OPT[tag.equalopt - 1] + ']' : "")
					                     + (tag.semiequal ? '[≒]' : "")
					                     + '</a></li>');
		if (kaku == "=") {
                    $('h3.equalopt').show();
	            $('#tag_equalopt1_list').append('<li><a href="#" class="equalopt1" id="' + k + '">' 
					            + tag.data 
					            + (tag.equalopt ? '[' + EQUAL_OPT[tag.equalopt - 1] + ']' : "")
					            + (tag.semiequal ? '[≒]' : "")
					            + '</a></li>');		    
		    $('#tag_equalopt2_list').append('<li><a href="#" class="equalopt2" id="' + k + '">' 
					            + tag.data 
					            + (tag.equalopt ? '[' + EQUAL_OPT[tag.equalopt - 1] + ']' : "")
					            + (tag.semiequal ? '[≒]' : "")
					            + '</a></li>');		    
		}

	        if (tag['dependant'] >= 0) {
		        $('#tag_edit_list').append('<input type="text" name="name" id="edit_' + k 
					                       +'" style="width: 60%" class="text ui-widget-content ui-corner-all" value="'
					                       + tag.data + '"/>');
		        $('#tag_edit_list').append(
			    //'<input type="submit" class="edit_ok" id="' + k + '" value="設定"/>');
			    '<img src="css/images/set_of.png" onmouseover="this.src=\'css/images/set_on.png\'" onmouseout="this.src=\'css/images/set_of.png\'" class="edit_ok setBtn" id="' + k + '"/>')
		    // set-on
	        }
	    }
	    
	   // $('#tag_delete_list').append('<p><input type="submit" id="delbtn" value="削除"/></p>');
           $('#tag_delete_list').append('<p><img src="css/images/del_of.png" onmouseover="this.src=\'css/images/del_on.png\'" onmouseout="this.src=\'css/images/del_of.png\'" id="delbtn"/></p>');

    };

    // タグ追加
    this.append_tag = function(tag_name) {

        // タグ選択モード
	    if (this.select_mode) {
	        return;
	    }

        if (this.wrongTreeState) {
	        $('#wrong-tree-dialog').dialog('open');
            return;
        }

        // フリー入力フォームの値が空の場合
        if(tag_name == ""){
            alert("タグを入力してください");
            return;
        }

	    var sentence_id = inputFileList[this.currentShowIndex]; 
	    var tag_id = this.currentCellId;
	    var m = tag_id.match(/tag(.*)_(.*)/);
	    var bnst_index = parseInt(m[1],10);// + 1;
	    var kaku = this.caseName[m[2]];

	    if (tag_name == "不特定:人") {
	        tag_name += $("#people_count").val();
	    } else if (tag_name == "不特定:物") {
	        tag_name += $("#things_count").val();
	    } else if (tag_name == "不特定:状況") {
	        tag_name += $("#status_count").val();
	    }

	    this.remake_bnst_context_data(-1,  
				                      // this.bnst_data_start,
				                      // this.bnst_data_dpnd,
				                      // this.mrph_data_all,
				                      inputDataList[sentence_id]["bnst_data_start"],
				                      inputDataList[sentence_id]["bnst_data_dpnd"],
				                      inputDataList[sentence_id]["mrph_data_all"],
				                      -1,
				                      tag_name, bnst_index, this.mrph_num, kaku);	
        
        // 特殊タグを含むかどうかによって色を設定
	if (this.check_have_extra_tag(this.contextinfo, bnst_index, kaku)) {
	    color = 'red';
	} else {
	    color = 'black';
	}
        $("#" + tag_id + "> span").css("color" , color);
	    
    };


    this.append_thissentence_tag = function(clicked_id) {
	    var fullId = this.currentShowIndex + "_" + clicked_id;
	    this.append_sentence_tag (fullId);
    };

    // 構文木からのタグ追加
    this.append_sentence_tag = function(clicked_id) {
	    
	    if (!this.select_mode) {
	        return;
	    }

	    var m = clicked_id.split('_bnst');
	    var sentence_index = m[0];

	    if (sentence_index > this.currentShowIndex) {
	        alert("構文木から省略先の文節を選択するか、「選択待ち」の部分を再度クリックしてキャンセルしてください");
	        return;
	    }

	    this.switch_select_mode(false);
	    
	    var target_id = parseInt(m[1]);
	    
	    var tag_id = this.currentCellId;
	    var m = tag_id.match(/tag(.*)_(.*)/);
	    var i = parseInt(m[1],10);// + 1;

	    var sentence_id = inputFileList[sentence_index];
	    var kaku = this.caseName[m[2]];

	    this.remake_bnst_context_data(sentence_index, 
				                      inputDataList[sentence_id]["bnst_data_start"],
				                      inputDataList[sentence_id]["bnst_data_dpnd"],
				                      inputDataList[sentence_id]["mrph_data_all"],
				                      target_id,
				                      " ", i, 
                                      inputDataList[sentence_id]["mrph_num"], kaku);

    };

    // タグ削除
    this.delete_tag = function(tag_index) {

	    if (this.select_mode) {
	        return;
	    }

	    var tag_id = this.currentCellId;
	    var m = tag_id.match(/tag(.*)_(.*)/);
	    var i = parseInt(m[1],10);// + 1;
	    var kaku = this.caseName[m[2]];

	    var taginfo = this.contextinfo[i][kaku].Data;

	    // contextinfoの更新
	    if (taginfo.length > 1) {
	        taginfo.splice(tag_index, 1);
	    }
	    else {
	        delete (this.contextinfo[i][kaku]);
            this.contextinfo[i][kaku] = {};
            this.contextinfo[i][kaku]["Data"] = [];
	    }
	    taginfo[0].andor = '';

            this.rewrite_bnst_feature_for_ellipsis(i, kaku, -1); 
    

	    // 色の更新
	    if (this.check_have_extra_tag(this.contextinfo, i, kaku)) {
		color = 'red';
	    } else {
		color = 'black';
	    }

	    // 表示文字列の更新
	    this.make_string(i, kaku);
        $("#" + tag_id + "> span").css("color" , color);
    };

    // 格追加
    this.add_col = function(title) {
        var i,j;
        
	var table = document.getElementsByTagName("table")[0];
	var col = table.rows[0].cells.length;
	for (j = 0; j < col; j++) {
	    if (table.rows[0].cells[j].textContent == title) {
		return;
	    }
	}
	this.caseName[this.caseName.length] = title;
        
        // 格の数を更新する
        this.caseBoxNum += 1;

	var isMemo = (title == 'メモ');
	for (i = 0; i < table.rows.length; i++) {
            // 全ての行に１列ずつ追加
            var newCell = table.rows[i].insertCell(-1);
	    newCell.align = "center";
            // タイトル行
            if(i==0) {
		newCell.innerHTML = title;
	    } else {		
	        newCell.id = "tag" + (i -1) + "_" + col;
	        newCell.setAttribute("class", "tag");
	        if (isMemo) {
		    newCell.innerHTML='<input type="text" name="name" id="' + (i - 1) 
		        +'" style="width: 80%" class="memo_tag text ui-widget-content ui-corner-all" value="'
		        + '" onblur="memo_tag_blur(this)"/>';
	        } else {
		    newCell.innerHTML="<span></span>";
	        }
            }
        }	
    };

    // 修正モードの変更
    this.change_mode = function(mode) {
	    this.modifyMode = MODIFY_MODE[mode];
	    document.getElementById("modify_mode").src = MODIFY_MODE_SRC[mode].of;
        $("#modify_mode").mouseover(function() {
            this.src = MODIFY_MODE_SRC[mode].on;
        });
        $("#modify_mode").mouseout(function() {
            this.src = MODIFY_MODE_SRC[mode].of;
        });
    };

    // weak_suffixのチェック
    this.check_weak_suffix = function (m) {
	    if (m[3] == '接尾辞') {
	        if (!m[2].match(STRONG_SUFFIX) && 
		        m[5] != '名詞性名詞助数辞' && 
		        m[5] != '形容詞性述語接尾辞' && 
		        m[5] != '動詞性接尾辞') {
		        return 1;
	        }
	    }
	    return 0;
    };

    // メモタグ
    this.memo_mode = function(i, input, kaku) {
	    var oldtext = "";
	    var isUpdate = false;
	    if (this.contextinfo[i] && this.contextinfo[i][kaku]) {
	        oldtext = this.contextinfo[i][kaku].Data[0].data;
	        isUpdate = true;
	    }

	    // 文字列がなくなったとき
	    if (!input && isUpdate) {
            modify_flag = '*';
	        this.delete_bnst_feature_for_ellipsis(i, kaku);
	        delete this.contextinfo[i][kaku];
	    }
	    // 文字列が編集されたとき
	    else if (oldtext != input) {
            modify_flag = '*';
	        // feature の更新
	        if (isUpdate) {
		        this.delete_bnst_feature_for_ellipsis(i, kaku);
		        delete this.contextinfo[i][kaku];
	        }

	        this.rewrite_bnst_feature_for_ellipsis(i, kaku, 0, -1, input, 0, 0, 0,
						                           inputFileList[this.currentShowIndex], "", 1);
	        
	        // 表示文字列の更新
	        this.make_string(i, kaku);

	    }
    };

    // NEタグ
    this.ne_mode = function(input, isDelete) {
	    var netag = "";
	    
	    $($(".ne_radio:checked").get().reverse()).each(function() {	    
	        var ne_tag_index = $(this).attr('id'); //.children("a").text();
	        netag = NETags[ne_tag_index];
	    });
	    if (!netag && !isDelete) {
	        alert("先にタグを選択してください");
	        return;
	    }

	    var sentence_id = inputFileList[this.currentShowIndex]; 
	    var tag_id = this.currentCellId;
	    var m = tag_id.match(/tag(.*)_(.*)/);
	    var i = parseInt(m[1],10);// + 1;
	    var kaku = this.caseName[m[2]];
		
	    // $case は 'NE'
	    var m2, oldtag;
	    var oldtext = "";
	    if (this.contextinfo[i] && typeof(this.contextinfo[i][kaku]) != 'undefined') {
	        m2 = this.contextinfo[i][kaku].Data[0].data.match(/([^:]+):(.+)/);
	        oldtag = m2[1];
	        oldtext = m2[2];
	    }

	    if (netag) {
	        // 変更なし
	        if ((input == oldtext && netag == oldtag) ||
		        (!input && !oldtext)) {
		        return;
	        }

	        // 不正な入力のチェック1
	        var check = input;
	        var my_mrph_num = this.bnst_data_start[i+1] - 1;
	        var mrph = this.mrph_data_all[my_mrph_num][0];
	        var my_i = i;
            // 入力文字列が選択中の形態素に含まれている場合、入力を許可する
            var selected_mrph = $("#ne_button_0").val();
            if (selected_mrph && selected_mrph.indexOf(check) == -1) {
	            // 対象文節中の形態素で終っているかをチェック
	            var re = new RegExp(mrph + "$");
	            while (check.search(re) == -1 && my_mrph_num >= 1 && my_mrph_num >= this.bnst_data_start[i]) {
		            my_mrph_num--;
		            mrph = this.mrph_data_all[my_mrph_num][0];
	                re = new RegExp(mrph + "$");
	            }
	            if (my_mrph_num < this.bnst_data_start[i] && input) {
		            alert('終了文字が不正です');
		            return;
	            }
	            // 形態素区切りで始まっているかをチェック
	            re = new RegExp(mrph + "$");
	            while (mrph && check.search(re) >= 0) {
		            check = check.replace(re,"");
		            my_mrph_num--;
		            if (my_mrph_num < 0) {
		                break;
		            }
		            mrph = this.mrph_data_all[my_mrph_num][0];
		            re = new RegExp(mrph + "$");
		            if (!this.mrph_data_start[my_mrph_num + 1]) {
		                continue;
		            }
		            // 前のNEを含んでいないかチェック
		            my_i--;
		            if (check
		                && this.contextinfo[my_i]
		                && typeof(this.contextinfo[my_i][kaku]) != "undefined"
		                && this.contextinfo[my_i][kaku].Data[0].data) {
		                alert('他のＮＥを含んでいます');
		                return;
		            }
	            }
	            if (check) {
		            alert('開始文字が不正です');
		            return;
	            }
            }
	    }

	    // 文字列がなくなったとき
	    if (isDelete || !input) {

	        this.delete_bnst_feature_for_ne(i);
	        //this.renew_flag_for_ne(i, j, oldtext, 1);
	        this.delete_mrph_feature_for_ne(i, oldtext);
 	        delete this.contextinfo[i][kaku];
            $("#" + tag_id + "> span").css("color" , 'black');

	        if (oldtag.search("OPTIONAL") >= 0) {
		        this.renew_ne_opt(i, kaku);
	        }
	        this.make_string(i, kaku);
	    }
	    
	    // 文字列が編集されたとき
	    else {
	        // feature の更新
	        if (oldtext) {
		        this.delete_bnst_feature_for_ne(i);
		        //this.renew_flag_for_ne(i, j, oldtext, 1);
		        this.delete_mrph_feature_for_ne(i, oldtext);
		        delete this.contextinfo[i][kaku];
	        }
	        this.write_bnst_feature_for_ne(i, input, netag);
	        this.write_mrph_feature_for_ne(i, input, netag);
	        
	        this.make_string(i, kaku);	
            $("#" + tag_id).css("background-color" , ColorNE);
            $("#" + tag_id).addClass("netag");

	        var ne_tag = [];
	        var ne_type;
	        $($(".ne_opt_check:checked").get()).each(function() {	    
		        var ne_opt_index = $(this).attr('id'); 
		        ne_tag.push(NE_OPT_TAG[ne_opt_index]);
	        });
	        $($(".ne_opt_radio:checked").get()).each(function() {	    
		        var ne_type_index = $(this).attr('id');
		        ne_type = NE_OPT_TYPE[ne_type_index];
	        });

	        this.renew_ne_opt(i, kaku, ne_tag, ne_type);
	    }
    };

    // NE オプションの更新
    this.update_ne_opt = function() {
	    var tag_id = this.currentCellId;
	    var m = tag_id.match(/tag(.*)_(.*)/);
	    var i = parseInt(m[1],10);// + 1;
	    var kaku = this.caseName[m[2]];

	    var ne_tag = [];
	    var ne_type;
	    $($(".ne_opt_check:checked").get()).each(function() {	    
		    var ne_opt_index = $(this).attr('id'); 
		    ne_tag.push(NE_OPT_TAG[ne_opt_index]);
	    });
	    $($(".ne_opt_radio:checked").get()).each(function() {	    
		    var ne_type_index = $(this).attr('id');
		    ne_type = NE_OPT_TYPE[ne_type_index];
	    });
        
	    this.renew_ne_opt(i, kaku, ne_tag, ne_type);
    };

    // NEタグ削除
    this.delete_ne_tag = function () {
	    this.ne_mode("", true);
    }
    
    // NEタグ 文節feature書き込み
    this.write_bnst_feature_for_ne = function (current_bnst, ne, tag, type, possibility) {
        modify_flag = '*';
	    
	    this.bnst_data_f[current_bnst] += "<NE:"+tag+":"+ne+">";
	    this.create_contextinfo(current_bnst, "NE");
	    this.contextinfo[current_bnst].NE.Data[0].data = tag+":"+ne;
    }

    // NEタグ 形態素feature書き込み
    this.write_mrph_feature_for_ne = function (current_bnst, ne, tag) {

	    var my_mrph_num = this.bnst_data_start[current_bnst + 1] - 1;
	    var mrph = this.mrph_data_all[my_mrph_num][0];
	    var re = new RegExp(mrph+"$");
	    while (my_mrph_num > 0  && ne.search(re) == -1) { // TODO added my_mrph_num >= 0. Is it ok?
 	        my_mrph_num--;
	        mrph = this.mrph_data_all[my_mrph_num][0];
	        re = new RegExp(mrph+"$");
	    }
	    
	    this.mrph_data_all[my_mrph_num][12] += ne == mrph ? 
	        "<NE:"+tag+":single>" : "<NE:"+tag+":tail>";

	    if (my_mrph_num <= 0) {
	        return;
	    }
	    var re = new RegExp(mrph+"$");
	    ne = ne.replace(re,"");
	    my_mrph_num--;
	    mrph = this.mrph_data_all[my_mrph_num][0];
	    
	    while (ne) {
	        this.mrph_data_all[my_mrph_num][12] += ne == mrph ? 
		        "<NE:"+tag+":head>" : "<NE:"+tag+":middle>";

	        re = new RegExp(mrph+"$");
	        ne = ne.replace(re,"");
	        my_mrph_num--;
	        if (my_mrph_num < 0) {
		        break;
	        }
	        mrph = this.mrph_data_all[my_mrph_num][0];
	    }
    };

    // NEオプション更新
    this.renew_ne_opt = function (current_bnst, kaku, ne_tag, ne_type) {

	    if (ne_type) {
	        this.create_contextinfo(current_bnst, 'NE-OPT-TYPE');
	        this.contextinfo[current_bnst]['NE-OPT-TYPE'].Data[0].data = ne_type;
	    } 
	    if (ne_tag) {
	        for (var i = 0; i < ne_tag.length; i++) {
		        this.create_contextinfo(current_bnst, 'NE-OPT-' + ne_tag[i]);
		        this.contextinfo[current_bnst]['NE-OPT-' + ne_tag[i]].Data[0].data = 1;
	        }
	    }

	    this.bnst_data_f[current_bnst] = this.bnst_data_f[current_bnst].replace(/<NE-OPTIONAL:[^\>]*\>/,"");
	    if (!this.contextinfo[current_bnst][kaku] || 
	        this.contextinfo[current_bnst][kaku].Data[0].data.search("OPTIONAL") == -1) {
	        return;
	    }

	    var ne_opt;
        modify_flag = '*';
	    for (var i = 0; i < NE_OPT_TAG.length; i++) {
	        var ne_tag = NE_OPT_TAG[i];
	        if (this.contextinfo[current_bnst]
		        && this.contextinfo[current_bnst]['NE-OPT-' + ne_tag]
		        && this.contextinfo[current_bnst]['NE-OPT-' + ne_tag].Data[0].data) {
                if(ne_opt != undefined) {
		            ne_opt +=  "," + ne_tag;
                } else {
		            ne_opt = ne_tag;
                }
	        }
	    }
	    if (!ne_opt) {
	        ne_opt = "NONE";
	    }
	    ne_opt += ":";
	    var ne_opt_type = this.contextinfo[current_bnst]['NE-OPT-TYPE'];
	    ne_opt += ne_opt_type ? ne_opt_type.Data[0].data : "0";
	    this.bnst_data_f[current_bnst] += "<NE-OPTIONAL:" + ne_opt + ">";
    };   
    
    // NEタグ候補を返す
    this.ne_candidate = function(i) {
    	var candidate = [];
	    
    	for (var mrph_tail_num = this.bnst_data_start[i]; 
    	     mrph_tail_num < this.bnst_data_start[i + 1]; mrph_tail_num++) {
	        
    	    if ((this.mrph_data_all[mrph_tail_num][3].search(/^(名詞|接尾辞)$/)) == -1) {
		        continue;
	        }
	        var mrph_start_num = mrph_tail_num;
    	    var mrph = "";
	        
    	    while (0 <= mrph_start_num) {
    		    mrph = this.mrph_data_all[mrph_start_num][0] + mrph;
		        
    		    if (this.mrph_data_all[mrph_start_num][3].search(/^(名詞|接頭辞|接尾辞)$/) >= 0) {
    		        candidate.push(mrph);
    		    }
    		    else if (this.mrph_data_all[mrph_start_num][0].search(/^[一・]$/) == -1 &&
    			         mrph_tail_num - mrph_start_num > 8) {
    		        break;
    		    }
    		    mrph_start_num--;
    	    }
    	}
    	return candidate;
    };

    // context情報をリメイク
    this.remake_bnst_context_data = function(sentence_index, b_strt, b_dpnd, m_d_all, cand_b, string, current_bnst, mn_all, kaku) {

	    modify_flag = '*';
	    var equalopt = 0;
	    var semiequal = 0;	// ここでは必ず = である

	    if (this.check_have_extra_tag(this.contextinfo, current_bnst, kaku)) {
	        var color = 'red';
	    }
	    else {
	        color = 'black';
	    }
	    var tag_id = this.currentCellId;
        $("#" + tag_id + "> span").css("color" , color);
	    // var j = this.bnst_num+this.caseBox[kaku];

	    var mark = -1;
	    // 上書きならば
	    if (this.modifyMode == MODIFY_MODE.OVERWRITE || 
		    !this.contextinfo[current_bnst] ||
		    !this.contextinfo[current_bnst][kaku]) {
		    mark = 0;
	    } 
	    // 追加ならば
	    else {
		    mark = (this.contextinfo[current_bnst][kaku]['Data']).length;
	    }
	    
	    var sentence_id = sentence_index < 0 ? "文外" : inputFileList[sentence_index];
	    
	    // 文字列があったのに消されたとき (削除, 文字列編集) $string == undef, $cand_b == -2
	    if (! (string || cand_b == -1)) {
	        this.delete_bnst_feature_for_ellipsis(current_bnst, kaku);
	        //string_deleted(current_bnst, j, kaku); // TODO
	        delete this.contextinfo[current_bnst][kaku];
	        //&remake_menus($current_bnst, $j, $case); // TODO
	        return;
	    }
	    // 一人称などの特殊タグのとき
	    else if (cand_b == -1) {
	        this.rewrite_bnst_feature_for_ellipsis(current_bnst, kaku, mark, cand_b, string, 
						       equalopt, semiequal, MODIFY_MODE_FILE[this.modifyMode],
						                           sentence_id);
	        return;
	    }
	    
	    var bf_cand = "";

	    // 文章中から選択したとき
	    if (sentence_index >= 0) {
	        var stop = null;
	        var start = b_strt[cand_b];    // 配列へのリファレンスによる配列要素へのアクセス
            if (cand_b > b_strt.length) {
		        stop = mn_all-1;
	        } else {
		        stop = b_strt[cand_b+1]-1;
	        }
	        
	        // 開始点
	        for (var a = start; a <= stop; a++){
		        if (m_d_all[a][3] != '特殊' || // 特殊以外
		            m_d_all[a][5] == '記号' && // 特殊なら記号だけ可
		            m_d_all[a][0] != '・') {   // ただし、"・"は除く
		            start = a;
		            break;
		        }
	        }
	        for (var a = stop; a >= start; a--) {
		        if ((!m_d_all[a][3].match(/^(?:特殊|助詞|助動詞|判定詞)$/) && 
		             !(this.check_weak_suffix(m_d_all[a]))) || 
		            (m_d_all[a][3] == '特殊' && m_d_all[a][5] == '記号'&& m_d_all[a][0] != '・')) {
		            stop = a;
		            break;
		        }
	        }
	        
	        // 要素の作成
	        for (var a = start; a <= stop; a++) {
		        bf_cand += m_d_all[a][0];
	        }
	    }
	    else {
	        // console.log("TODO do we use this case. string=$string");
	        bf_cand = string;
	    }
	    
	    // 関係の継承
	    
	    // いままで関係がなかったとき
	this.rewrite_bnst_feature_for_ellipsis(current_bnst, kaku, mark, cand_b, bf_cand, 
						   equalopt, semiequal, MODIFY_MODE_FILE[this.modifyMode],
						                       sentence_id);
    };

    // 文節feature更新
    this.rewrite_bnst_feature_for_ellipsis = function(current_bnst, kaku, mark, cand_b, bf_cand, equalopt, semiequal, andor, filename, prev_s, undelete) {

        modify_flag = '*';

	if (mark > -1) {
	    // すでについているタグを削除 (上書き時のみ)
	    if (!undelete && this.modifyMode == MODIFY_MODE.OVERWRITE) {
		if (this.contextinfo[current_bnst] 
		    && this.contextinfo[current_bnst][kaku] 
		    && this.contextinfo[current_bnst][kaku]['Data']) {
	            this.contextinfo[current_bnst][kaku]['Data'].length = 0;
		}
	    }
	    
	    this.create_contextinfo(current_bnst, kaku);
	
	    this.contextinfo[current_bnst][kaku]['Basic'] = { "relation":kaku, "flag":0 };
	    this.contextinfo[current_bnst][kaku]['Data'][mark] = { "data":bf_cand, "SID":filename, 
								   "sentence":sentence, 
								   "dependant":cand_b, 
								   "equalopt":equalopt,
								   "andor":andor,
								   "semiequal":semiequal};
	}
	
	this.delete_bnst_feature_for_ellipsis(current_bnst, kaku);

	var tagCount = this.contextinfo[current_bnst][kaku]['Data'].length;
	for (var tagi = 0; tagi < tagCount; tagi++) {
	    var tagData = this.contextinfo[current_bnst][kaku]['Data'][tagi];
	    var equalStr = tagData.equalopt ? EQUAL_OPT[tagData.equalopt-1]:""; 
	    equalStr += tagData.semiequal ? '≒':"";
	    
	    // 不特定など
	    if (kaku == 'メモ') {
	        this.bnst_data_f[current_bnst] += '<memo text="' + tagData.data + '"/>';
	    } else {

		var mode = '';
		if (tagi > 0 && tagData.andor != '') {
		    mode = '" mode="' + tagData.andor;
		}
		
	        var sentence =  tagData.dependant == -1 ? "" : tagData.SID;
	        if (sentence) {
		    this.bnst_data_f[current_bnst] += '<rel type="' + kaku + equalStr + mode
			+ '" target="' + tagData.data + '" sid="' + sentence + '" id="' + tagData.dependant + '"/>';
	        } else {
		    this.bnst_data_f[current_bnst] += '<rel type="' + kaku + equalStr + mode
			+ '" target="' + tagData.data + '"/>';
	        }
	    }	    
	}
	//console.log("rewritten: " + this.bnst_data_f[current_bnst]);
	this.make_string(current_bnst, kaku);

    };

    // context情報生成
    this.create_contextinfo = function(current_bnst, kaku) {
	    // alert("create_contextinfo");
	    if (!this.contextinfo[current_bnst]) {
	        this.contextinfo[current_bnst] = {};
	    }
        
	    if (!this.contextinfo[current_bnst][kaku]) {
	        this.contextinfo[current_bnst][kaku] = {};
	    }
        
	    if (!this.contextinfo[current_bnst][kaku]['Data']) {
	        this.contextinfo[current_bnst][kaku]['Data'] = [];
	    }
	    if (kaku && kaku.search('NE') >= 0) {
	        this.contextinfo[current_bnst][kaku]['Data'][0] = { "data":"" };
	    }
    };

    // タグ編集
    this.edit_tag = function(tag_index) {

	    var tag_id = this.currentCellId;
	    var m = tag_id.match(/tag(.*)_(.*)/);
	    var i = parseInt(m[1],10);// + 1;
	    var kaku = this.caseName[m[2]];

	    var inputId = '#edit_'+tag_index;
	    var input = $(inputId).val();

	    // 最後に追加したものを編集する
	    var tagData = this.contextinfo[i][kaku]['Data'][tag_index];
	    var oldtext = tagData.data;
	    
	    // 文字列がなくなったとき
	    if (input.length == 0) {
		    //&delete_mode($i, $j, $case, $mark); // TODO
	    }
	    // 文字列が編集されたとき
	    else if (oldtext != input) {

	        // feature の更新
	        this.rewrite_bnst_feature_for_ellipsis(i, kaku, tag_index, 
						       tagData.dependant, 
						       input, 
						       tagData.equalopt, 
						       tagData.semiequal, 
						       tagData.andor,
						       tagData.SID, 0, 1);

	    }
    };

    // equalオプション 変更
    this.change_equal_opt = function (equalopt, tag_index) {

	    var tag_id = this.currentCellId;
	    var m = tag_id.match(/tag(.*)_(.*)/);
	    var i = parseInt(m[1],10);// + 1;
	    var kaku = this.caseName[m[2]];

	    modify_flag = '*';
	    var tagData = this.contextinfo[i][kaku].Data[tag_index];
        var target = tagData.data;

	    if (equalopt) {
	        if (tagData.equalopt == equalopt) {
		        tagData.equalopt = 0;
	        } else {
	            tagData.equalopt = equalopt;
	        }
	    }
	    else { // nearly_equal
	        // トグル
	        if (tagData.semiequal) {
		    tagData.semiequal = 0;
	        }
	        else {
		    tagData.semiequal = 1;
	        }
	    }


	this.rewrite_bnst_feature_for_ellipsis(i, kaku, tag_index, 
					                           tagData.dependant, 
					                           tagData.data,  
					                           tagData.equalopt,
					                           tagData.semiequal,
 						                   tagData.andor,
					                           tagData.SID, 
					                           0, 1); 

	    this.make_string(i, kaku);	

    };
    
    // feature削除
    this.delete_bnst_feature_for_ellipsis = function(current_bnst,  kaku) {
        
	var re, re2;
	
	var kakuEqual = kaku.replace(/\(/g, '\\(').replace(/\)/g, '\\)') + EQUAL_OPT_DELETE;
	if (kaku == 'メモ') {
	    re = new RegExp('\<memo text=".*?"\/\>');	    
	} else {
	    re = new RegExp('\<rel type="' + kakuEqual + '".*?\/\>','g');
	    // re2 = new RegExp('\<mode rel="' + kakuEqual + '".*?\/\>','g');
	    // this.bnst_data_f[current_bnst] = this.bnst_data_f[current_bnst].replace(re2,"");
	}
	
	this.bnst_data_f[current_bnst] = this.bnst_data_f[current_bnst].replace(re,"");

	//re = new RegExp("\<省略処理なし-" + kaku + "\>");
	//this.bnst_data_f[current_bnst] = this.bnst_data_f[current_bnst].replace(re,"");
    };

    // NEタグ 文節feature削除
    this.delete_bnst_feature_for_ne = function(current_bnst) {
        modify_flag = '*';
	    var re = new RegExp("\<(NE:[^\>]+)\>","g");
	    this.bnst_data_f[current_bnst] = this.bnst_data_f[current_bnst].replace(re,"");
    };

    // NEタグ 形態素feature削除
    this.delete_mrph_feature_for_ne = function(current_bnst, ne) {
	    var my_mrph_num = this.bnst_data_start[current_bnst + 1] - 1;
	    var mrph = this.mrph_data_all[my_mrph_num][0];
	    var re = new RegExp(mrph + "$");
	    while (ne.search(re) == -1 && my_mrph_num > 0) {
	        my_mrph_num--;
	        mrph = this.mrph_data_all[my_mrph_num][0];
	        var re = new RegExp(mrph + "$");
	    }
	    while (ne) {
	        if (ne.search(mrph) == -1) { //不正なタグへの対処
		        break;
	        }
	        var re = new RegExp(mrph + "$");
	        ne = ne.replace(re,"");
            if (this.mrph_data_all[my_mrph_num].length > 12)
                this.mrph_data_all[my_mrph_num][12] = this.mrph_data_all[my_mrph_num][12].replace(/\<(NE:[^\>]+)\>/,"");
            // Originally, only element 12 was updated.
            // For some data though, it's also needed to cleanup element 11 to remove all traces
            // of the NE tag.
            if (this.mrph_data_all[my_mrph_num].length > 11)
                this.mrph_data_all[my_mrph_num][11] = this.mrph_data_all[my_mrph_num][11].replace(/\<(NE:[^\>]+)\>/,"");

	        my_mrph_num--;
	        if (my_mrph_num < 0) {
		        break;
	        }
	        mrph = this.mrph_data_all[my_mrph_num][0];	    
	    }
    };

    // タグ表示文字列更新、featureを返却
    this.make_string = function (current_bnst, kaku) {
	    
	    // 追加したとき、最後の要素が追加したものなので、それを最後になればよい
	    var bnst_f = "";
	    if (this.contextinfo[current_bnst]) {
	        var tagAll = this.contextinfo[current_bnst][kaku];
	        if (typeof(tagAll) != 'undefined') {
		        var caseNum = tagAll.Data.length;
		        for (var i = 0; i < caseNum; i++) {
		            var tagData = tagAll.Data[i];
		            
		            var nprev = 0;
		            for (var j=this.currentShowIndex; j>=0; j--) {
			            if (tagData.SID == inputFileList[j]) {
			                break;
			            }
			            nprev++;
		            }
		            
		            if (bnst_f.length > 0) {
				bnst_f += "【" + tagData.andor.toLowerCase()+ "】";
			    }
		            if (nprev > 0 && nprev <= this.currentShowIndex) {
			            bnst_f += "(" + nprev + "文前)";
		            }
			    var sub_span_id = "tag_" + current_bnst + "_" + kaku + "_" + i;
		            bnst_f += '<span class="tag_sub_span" id="' + sub_span_id + '">' + tagData.data + '</span>';

		            if (tagData.equalopt) {
			            bnst_f += '[' + EQUAL_OPT[tagData.equalopt - 1] + ']';	    
		            }
		            if (tagData.semiequal) {
			            bnst_f += '[≒]';
		            }
		        }
	        }
	    }
	    var tag_id = this.currentCellId;
	    if (tag_id) {
	        tag_id = '#' + tag_id;
            var $span = $("span", tag_id);
            $span.html(bnst_f);

		if (this.check_have_extra_tag(this.contextinfo, current_bnst, kaku)) {
                    color = 'red';
	        } else {
	            color = 'black';
	        }
		$span.css("color", color);

	        $("td" + tag_id).css("background-color", "");
	        this.populate_tag_edit();
	    }
	    return bnst_f;

    };

    // 特殊タグを含んでいるかどうかチェック
    this.check_have_extra_tag = function(info, i, kaku) {
        if(info[i] != undefined && info[i][kaku] != undefined && info[i][kaku]["Data"] != undefined) {
            for (var k=0; k<info[i][kaku]["Data"].length; k++) {
                if (info[i][kaku]["Data"][k]["dependant"] == -1) {
                    return 1;
                }
            }
        }
        return 0;
    };

    
    ///////////////////////
    // 出力
    //////////////////////
    this.write_sentense = function(ii, jj) {
        try {          

            var root_count = 0;
            for (var i = 0; i < this.bnst_num; i++) {
                if (this.bnst_data_dpnd[i] == -1) {
                    root_count += 1;
                    if (root_count > 1) {
                        alert("係り受け先が設定されていない文節があります.");
                        return false;
                    }
                }
            }

            // date = strftime("%Y/%m/%d", localtime);
            var date = new Date();  
            var year = date.getFullYear();  
            var month = date.getMonth() + 1;  
            var day = date.getDate();  
            if ( month < 10 ) {
                month = '0' + month;
            }
            if ( day < 10 ) {
                day = '0' + day;
            }
            var date = year + '/' + month + '/' + day;

            var output_lines = [];

            // info
	        if (this.fileInfo.match(/MOD:/)) {
                this.fileInfo = this.fileInfo.replace(/MOD:[^ ]*/, "MOD:" + date);
	        }
	        else {
	        	this.fileInfo = this.fileInfo + " MOD:" + date;
	        }
            // memo
            var text = $("#memo").val();
	        if (text != undefined) {
                if(this.fileInfo.match(/MEMO:.*/)) {
                    this.fileInfo =	this.fileInfo.replace(/MEMO:.*/, "MEMO:" + text);
                } else {
	        	    this.fileInfo = this.fileInfo + " MEMO:" + text;
	            }
            }

            var sid = inputFileList[this.currentShowIndex];
	        inputDataList[sid]["memo"] = this.fileInfo;
	        inputDataList[sid]["fileInfo"] = this.fileInfo;

            output_lines.push(this.fileInfo);

	        var output_sentence = '';
            var j = 0;
            for (var i = 0; i < this.mrph_num; i++) {
    	        if (this.mrph_data_start[i] == 1) {
                    var bline = null;
                    var tline = null;
                    //  文節行
                    if(this.bnst_data_btype[j] == '*') {
    	                if (TREE_MODE == 'LR' || j != (this.bnst_num - 1)) {
                            var b_id = this.orig_bnst_data_num[j];
                            bline = "* " + this.orig_bnst_data_dpnd[b_id] + this.orig_bnst_data_type[b_id];
                        } else {
                            bline = "* -1D";
                        }
                        var orig_b_num = this.orig_bnst_data_num[j];
                        var orig_f = this.orig_bnst_data_f[orig_b_num];
                        if(orig_f) {
                            bline = bline + " " + orig_f;
                        }
                        if (bline.indexOf("undef") != -1) {
                            alert("不正文節データのため保存できません：" + bline);
                            return false;
                        }
                        output_lines.push(bline);
                    }

    	            if (TREE_MODE == 'LR' || j != (this.bnst_num - 1)) {
                        tline = "+ " + this.bnst_data_dpnd[j] + this.bnst_data_type[j];
    	            } else {
    		            // 最後の文節
                        tline = "+ -1D";
    	            }

    	            if (this.bnst_data_f[j]) {
                        tline = tline + " " + this.bnst_data_f[j];
    	            }
                    if (tline.indexOf("undef") != -1) {
                        alert("不正基本区データのため保存できません：" + tline);
                        return false;
                    }
                    output_lines.push(tline);
    	            j++;
    	        }

                var mrph = this.mrph_data_all[i];
                if (LANG == 'en') {
	                output_sentence += mrph[0] + ' ';
                } else {
	                output_sentence += mrph[0];
                }
    	        if (this.mrph_data_all[i][0] === '' ||
    	            this.mrph_data_all[i][1] === '' ||
    	            this.mrph_data_all[i][2] === '' ||
    	            this.mrph_data_all[i][3] === '' ||
    	            this.mrph_data_all[i][4] === '' ||
    	            this.mrph_data_all[i][5] === '' ||
    	            this.mrph_data_all[i][6] === '' ||
    	            this.mrph_data_all[i][7] === '' ||
    	            this.mrph_data_all[i][8] === '' ||
    	            this.mrph_data_all[i][9] === '' ||
    	            this.mrph_data_all[i][10] === '' ||
                    this.mrph_data_all[i][11] === '') {

                    alert(i + "番目の文節データの情報が不十分です.");
                    return false;
    	        }

                output_lines.push(this.mrph_data_all[i].join(" "));
            }
            // console.log(output_lines.join("\n"));
            output_lines.push("EOS");
            
            if (output_sentence != this.input_sentence) {
    	        alert("入力データと修正データが不整合です.\n【入力データ】" 
                      + this.input_sentence + "\n【修正データ】" + output_sentence + "\n");
                return false;
            }

	        var m = this.fileInfo.match(/S-ID:(\S+)/);
            if(m) {
                var filename = m[1];
                uploadData(filename, output_lines.join("\n"));
            } else {
                alert("filenameが不明です");
                return false;
            }
            
        } catch(e) {
            alert(e);
            return false;
        }

        return true;
    };

    // fileinfoからfile名取得
    this.getFileName = function() {
	    var m = this.fileInfo.match(/S-ID:(\S+)/);
        if(m) {
            var filename = m[1];
            return filename;
        }
        return null;
    };

    // 現在の文にスクロール
    this.scrollToCurrentSentence = function() {
        var i = this.currentShowIndex;
	    var sid = inputFileList[i]; // センテンスIDを取得        
	    this.scrollToSentence(sid);
        // var $target = $("#title-" + sid);
        // var $pane = $(".ui-layout-west");
        // var y = $pane.scrollTop();
        // var targetPositionTop = $target.offset().top;
        // targetPositionTop = targetPositionTop + y;

        // $(".ui-layout-west").animate({
        //     scrollTop: targetPositionTop
        // }, 200);
    };
 
   // 指定の文にスクロール
    this.scrollToSentence = function(sid) {
        if (sid == undefined)
            return;
        sid = sid.replace(/\./g, '\\.');
        var $target = $("#title-" + sid);
        var $pane = $(".ui-layout-west");
        var y = $pane.scrollTop();
        var targetPositionTop = $target.offset().top;
        targetPositionTop = targetPositionTop + y;

        $(".ui-layout-west").animate({
            scrollTop: targetPositionTop
        }, 200);
    };
    


};
