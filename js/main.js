////////////////////////////////////
//  初期化
////////////////////////////////////
// PUSH_ONCE = -1; // # ガ格選択モードのとき > 0
// PUSH_ONCE_J = -1; // # ガ格選択モードのとき > 0
// SHOW_PREV_S = 0;  // # 前文表示ボタンを押す度に +1
// OLD_ITEM_IJ = undefined;   // # 1操作前の情報 (キャンセル用)

modify_flag = null;
modify_flag2 = null;
current_modify_flag = null;
current_modify_flag2 = null;

var param = {};
param.article_id = null;
param.corpus_set_id = null;
param.annotator_id = null;

var mrph_num = 0;


window.onload = function () {
    // 初回のみバックアップをとる
    const backupFlag = 1;
    loadData(backupFlag);
};

function loadData(backupFlag) {
    // annotationデータダウンロード、コールバックで画面表示
    const url = String(window.location);
    param.article_id = getParameterByName("article_id");
    param.corpus_set_id = getParameterByName("corpus_set_id");
    param.annotator_id = getParameterByName("annotator_id");
    const data = downloadData(param.article_id, param.corpus_set_id, param.annotator_id, backupFlag);
}

function reloadData() {
    inputDataList = {};
    inputFileList = [];
    myRelationFrame.removeContent(true);
    const backupFlag = 0;
    loadData(backupFlag);
}

function initFlag() {
    modify_flag = null;
    modify_flag2 = null;
    current_modify_flag = null;
    current_modify_flag2 = null;
}

// クエリ文字列を取得
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    const regexS = `[\\?&]${name}=([^&#]*)`;
    const regex = new RegExp(regexS);
    const results = regex.exec(window.location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// データダウンロード
function downloadData(article_id, corpus_set_id, annotator_id, backupFlag) {
    $.ajax({
        url: DOWNLOAD_URL,
        data: {
            article_id,
            corpus_set_id,
            annotator_id,
            backupFlag
        },
        type: "post",
        cache: false,
        success: showDisplay,
        error: function (a, b, c) {
            const message = getErrorMessage(a.responseText);
            alert(`データのダウンロードに失敗しました。\n${message}`);
        }
    });
}

function showDisplay(data) {
    data_list = parseResultData(data);
    for (let i = 0; i < data_list.length; i++) {
        parseString(data_list[i]);
    }
    init();
}

function parseResultData(data) {
    const retlist = [];
    const nodes = $(data).find("file");
    for (let i = 0; i < nodes.length; i++) {
        const ret = $(nodes[i]).find("data").text();
        retlist.push(ret);
    }
    return retlist;
}

// 同期ファイルアップロード
function uploadData(filename, contents) {
    const {article_id, corpus_set_id, annotator_id} = param;

    $.ajax({
        url: UPLOAD_URL,
        data: {
            article_id,
            corpus_set_id,
            annotator_id,
            filename,
            content: contents
        },
        type: "post",
        cache: false,
        success: endUpload,
        error: function (a, b, c) {
            const message = getErrorMessage(a.responseText);
            alert(`ファイルのアップロードに失敗しました。\n${message}`);
        }
    });
}

function endUpload(data) {
    myRelationFrame.removeContent();
    myRelationFrame.update();
    initFlag();
}

// 保存
function save() {
    if (myRelationFrame.wrongTreeState) {
        $('#wrong-tree-dialog').dialog('open');
        return;
    }
    // 文節画面があればとじる
    if (myWmrphFrame.active_b_num_start != -1) {
        myWmrphFrame.ok();
        innerLayout.close("south");
    }
    ;
    myRelationFrame.write_sentence();
}

// 終了
function quit() {
    if (modify_flag === "*") {
        $('#quit-dialog').dialog('open');
        return;
    }
    // サーバへ終了通知
    notify_quit();
}

// サーバへ終了通知
function notify_quit() {
    const {article_id, corpus_set_id, annotator_id} = param;
    $.ajax({
        url: UPLOAD_URL,
        data: {
            article_id,
            corpus_set_id,
            annotator_id,
            quitFlg: true
        },
        type: "post",
        cache: false,
        success: endQuit,
        error: function (a, b, c) {
            const message = getErrorMessage(a.responseText);
            alert(`終了処理に失敗しました。\n${message}`);
        }
    });
}


// 終了通知成功時のコールバック
function endQuit(data) {
    try {
        const annotator_id = getParameterByName("annotator_id");
        const password = getParameterByName("password");
        const corpus_set_id = getParameterByName("corpus_set_id");
        const skip = getParameterByName("skip");

        const search = `?annotator_id=${annotator_id}&corpus_set_id=${corpus_set_id}&password=${password}&skip=${skip}`;
        window.opener.location.search = search;

        window.close();

    } catch (e) {
        alert("終了処理に失敗しました。\n管理画面が更新できません。手動で画面を閉じてください。");
    }
}

function getErrorMessage(text) {
    const re = new RegExp("<pre>((.*)\n)+<\/pre>");
    const m = text.match(re);
    if (m) {
        return m[2];
    }
    return "";
}


function handleFileSelect(evt) {
    const {files} = evt.target; // FileList object
    // Loop through the FileList
    for (let i = 0, f; f = files[i]; i++) {
        const reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = function (e) {
            parseString(e.target.result);
        };
        // Read in the file
        reader.readAsText(f, "UTF-8");
    }

    setTimeout(function () {
        init();
    }, 500);
}

// 初期化
function init() {
    myRelationFrame = new RelationFrame();
    myWmrphFrame = new WmrphFrame();
    myJumanGrammer = new JumanGrammer();

    // 初期化
    myRelationFrame.init();
    myWmrphFrame.init();
    myJumanGrammer.init();

    initFlag();
}

// 前の文への移動
function preSentence() {
    myRelationFrame.goto_prev_command();
}

// 後ろの文への移動
function nextSentence() {
    myRelationFrame.goto_next_command();
}

// 検索
function search() {
    const txt = document.getElementById("searchText").value;
    myRelationFrame.search(txt);
}

function undoTree() {
    myRelationFrame.undoTree();
}

function redoTree() {
    myRelationFrame.redoTree();
}

function conj_input_dialog_done(that) {
    const txt = document.getElementById("conj-textbox").value;
    myWmrphFrame.dialog_input_done(txt);
}

function select_tag(that) {
    const tag_name = $(that).html();
    myRelationFrame.append_tag(tag_name);
}

function select_sentence_tag(that) {
    const element_id = $(that).attr("id");
    myRelationFrame.append_sentence_tag(element_id);
}

function select_free_tag() {
    const tag_name = document.getElementById("free_tag").value;
    myRelationFrame.append_tag($.trim(tag_name));
}

function select_tree_tag() {
    myRelationFrame.switch_select_mode(true);
}

function cancel_tree_tag() {
    myRelationFrame.switch_select_mode(false);
}

function delete_tag(index) {
    myRelationFrame.delete_tag(index);
}

function edit_tag(index) {
    myRelationFrame.edit_tag(index);
}

function edit_nearly_tag(equalopt, index) {
    myRelationFrame.change_equal_opt(equalopt, index);
}

function add_col(kaku) {
    myRelationFrame.add_col(kaku);
}

function change_mode(mode) {
    myRelationFrame.change_mode(mode);
}

function ne_mode(input) {
    var input = $("#ne_edit_text").text();
    //var input = $(input).text()
    myRelationFrame.ne_mode(input);
}

function ne_mode_free() {
    const input = $("#ne_edit_text").val();
    myRelationFrame.ne_mode(input);
}

function memo_tag_blur(that) {
    const memo_index = parseInt($(that).attr('id'), 10);
    const memo = $(that).val();
    myRelationFrame.memo_mode(memo_index, memo, "メモ");
}

function file_memo_blur() {
    modify_flag = "*";
}
