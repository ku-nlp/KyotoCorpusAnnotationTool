////////////////////////////////////
//  結果データパース処理
////////////////////////////////////
// 入力データリスト
inputDataList = {};
backupDataList = {};
// 入力ファイルIDリスト
inputFileList = [];

// CaseOrderにsetする
var order = -100; // CaseOrderのなかの最小値からはじめる
CompoundCases.forEach(function (kaku) {
    CaseOrder[kaku] = --order;
});

function parseString(strData) {
    // console.log("parse start");
    const bnst_data_btype = [];
    const bnst_data_dpnd = [];
    const bnst_data_type = [];
    const bnst_data_f = [];
    const bnst_data_start = [];
    const orig_bnst_data_num = []; //文節番号を格納

    const mrph_data_all = [];
    const mrph_data_start = [];

    const orig_bnst_data_start = [];
    const orig_bnst_data_end = [];
    const orig_bnst_data_dpnd = [];
    const orig_bnst_data_type = [];
    const orig_bnst_data_f = [];

    // var khnk_data_btype = [];
    // var bnst_data_dpnd = [];
    // var bnst_data_start = [];
    // var bnst_data_type = [];
    // var bnst_data_f = [];

    let bnst_num = 0; // 文節番号
    let orig_bnst_num = 0;
    let mrph_num = 0;

    // var lines = strData.split("\n"); // 行ごとに配列にいれる
    const lines = strData.split('\n'); // 行ごとに配列にいれる
    const fileInfo = lines[0]; // 1行目がファイル情報になっている

    // # S-ID:tsubame00-0000000100-343-3 JUMAN:8.0-20121220 KNP:4.0-20121220 DATE:2013/01/17 SCORE:-35.21807
    // var match = fileInfo.match(/\sMEMO(.+)$/);
    // var match = fileInfo.match(/#\s(.+)$/);
    let match = fileInfo.match(/#\s(S-ID:(\S+)\s.+)$/);
    if (match) {
        var memo = match[1]; // memoを取得
        var sen_id = match[2];
    }

    //undef @[orig_bnst_data_start;
    let input_sentence = '';
    let bnst_start_flag = false;

    // 1行目はファイル情報なので2行目から(indexは1から)
    for (var i = 1; i < lines.length; i++) {
        const line = lines[i];

        // "*" or "+" はじまりの行かチェック
        match = line.match(/^([\*\+])/);

        if (match) {
            // タイプをセット
            bnst_data_btype[bnst_num] = match[1];

            // 基本句
            if (bnst_data_btype[bnst_num] == '+') {
                if (bnst_start_flag) {
                    orig_bnst_data_start[bnst_num] = 1;
                    orig_bnst_data_end[bnst_num] = 1;
                    bnst_data_btype[bnst_num] = '*'; //文節はじまりは * にする。
                    bnst_start_flag = false;
                } else {
                    orig_bnst_data_end[bnst_num - 1] = 0;
                    orig_bnst_data_end[bnst_num] = 1;
                }

                orig_bnst_data_num[bnst_num] = orig_bnst_num - 1; //基本句番号が bnst_num のときの文節番号
                mrph_data_start[mrph_num] = 1; // 文節始まり
                bnst_data_start[bnst_num] = mrph_num;

                // さらに"*", "+"以降のデータをparse
                var dpnd = line.match(/^[\*\+] ([\-0-9]+)([DPIA])/);
                if (dpnd) {
                    bnst_data_dpnd[bnst_num] = dpnd[1]; // 数字
                    bnst_data_type[bnst_num] = dpnd[2]; // [DPIA]のうちのどれか一文字
                } else {
                    bnst_data_dpnd[bnst_num] = -1;
                    bnst_data_type[bnst_num] = 'D';
                }

                // 文節のdependencyがundefinedになっていれば基本句を-1に設定しておく。
                // 基本句がルートでなくれば画面上depedencyが未設定（緑色）になり、
                // 保存時にエラーメッセージが表示される。
                if (orig_bnst_data_end[bnst_num] == 1) {
                    var b_i = orig_bnst_data_num[bnst_num]; //before(orig_bnst_num)
                    if (orig_bnst_data_dpnd[b_i] == undefined) {
                        bnst_data_dpnd[bnst_num] = -1;
                        // orig_bnst_data_num[dpnd[1]]はまだ設定されていないので、
                        // 文節dependencyの自動修復はここではできない。
                        // var b_j = orig_bnst_data_num[dpnd[1]];
                        // orig_bnst_data_dpnd[b_i] = b_j;
                        // orig_bnst_data_type[b_i] = type;
                    }
                }

                // 文節のfeature
                match2 = line.match(/^[\*\+] ([\-0-9]+)([DPIA]) (.+)$/);
                bnst_data_f[bnst_num] = match2 ? match2[3] : '';

                bnst_num += 1;
                // khnk_num += 1;

                // 文節
            } else if (match[1] == '*') {
                var match2 = line.match(/^[\*\+] ([\-0-9]+)([DPIA])/);
                if (match2) {
                    orig_bnst_data_dpnd[orig_bnst_num] = match2[1]; // 数字
                    orig_bnst_data_type[orig_bnst_num] = match2[2]; // [DPIA]のうちのどれか一文字
                } else {
                    orig_bnst_data_dpnd[orig_bnst_num] = undefined;
                    orig_bnst_data_type[orig_bnst_num] = 'D';
                }

                // 文節のfeature
                match2 = line.match(/^[\*\+] ([\-0-9]+)([DPIA]) (.+)$/);
                orig_bnst_data_f[orig_bnst_num] = match2 ? match2[3] : undefined;

                bnst_start_flag = true;
                orig_bnst_num++;
            }
        } else if (/^EOS/.test(line)) {
            bnst_data_start[bnst_num] = mrph_num; // 末尾の印
            break;
        } else {
            // 形態素情報
            re = / (\"[^\"]+\") ?(<.+>)?/;

            match2 = line.match(re); // 意味情報を記憶
            // line.replace(re,''); // 意味情報を記憶 <= 上の処理でmatch2に意味情報が入るので不要

            mrph_data_all[mrph_num] = line.split(/ +/, 13); // 形態素の配列にいれる
            if (match2 && match2[1]) {
                // 意味情報がある場合
                mrph_data_all[mrph_num][12] = match2[2]; // うしろの2つに意味情報をいれる
                mrph_data_all[mrph_num][11] = match2[1];
            }
            input_sentence += LANG == 'en' ? `${mrph_data_all[mrph_num][0]} ` : mrph_data_all[mrph_num][0];
            mrph_num += 1;
        }
    }

    let optionDict;
    const contextinfo = [];
    const caseBox = {};

    // 各文節のfeatureをみて関係タグ情報を読み出す
    for (var i = 0; i < bnst_num; i++) {
        var re = /\<省略処理なし-([^\>]+)\>/g;
        while ((match = re.exec(bnst_data_f[i]))) {
            optionDict[match[1]] = 1;
        }

        // re = /(<rel type="\S+" target="\S+"(?: sid="\S*" id="\S*")?\/>)/g;
        re = /(<rel type="\S+"(?: mode="\S+")? target=".+?"(?: sid="\S*" id="\S*")?\/>)/g;
        while ((match = re.exec(bnst_data_f[i]))) {
            const feature = match[1];
            // console.log(feature);
            match2 = feature.match(/\<C定義文;(\d+):([^\>]+)/);
            if (match2) {
                // 定義文ならスルー
            } else {
                // 関係タグのフォーマット
                match2 = feature.match(/<rel type="(\S+)"(?: mode="\S+")? target="(.+?)" sid="(\S*)" id="(\S*)"\/>/); //sidは空のこともありうる

                if (!match2) {
                    match2 = feature.match(/<rel type="(\S+)"(?: mode="\S+")? target="(.+?)"\/>/);
                }
                if (!match2) {
                    continue;
                }

                var type = match2[1];
                var target = match2[2];
                var sid = null;
                var targetId = null;
                if (match2.length > 3) {
                    sid = match2[3];
                    targetId = match2[4];
                }

                var relation = type;
                var sentence = '';
                var andor = '';
                // var temp = target;

                // 関係に @EQUAL_OPT がついていれば削除し、equaloptに反映する
                var equalopt = EQUAL_OPT.length;
                for (; equalopt > 0; equalopt -= 1) {
                    const key = EQUAL_OPT[equalopt - 1];
                    const re3 = new RegExp(key);
                    //var match3 = type.match(/(.+)$key(≒)?/);
                    var match3 = type.match(re3);
                    if (match3) {
                        //relation = match3[1] + match3[2];
                        relation = type.replace(key, '');
                        break;
                    }
                }

                // 関係に ≒ がついていれば削除し、semiequalフラグをたてる
                match3 = relation.match(/(.+)≒$/);
                var semiequal = 0;
                if (match3) {
                    relation = match3[1];
                    semiequal = 1;
                } else {
                    semiequal = 0;
                }

                match3 = feature.match(/mode="(\S+?)"/);
                if (match3) {
                    andor = match3[1];
                }

                // 関係タグを関係ごとに保存
                if (typeof caseBox[relation] == 'undefined') {
                    caseBox[relation] = 1;
                }

                if (sentence == '文外' || !sid || sentence || !targetId) {
                    targetId = -1;
                }

                // alert ("DEBUG i relation temp  sentence bnst")

                if (typeof contextinfo[i] == 'undefined') {
                    contextinfo[i] = {};
                }

                // 関係タグごとのハッシュ初期化
                if (typeof contextinfo[i][relation] == 'undefined') {
                    contextinfo[i][relation] = {};
                    contextinfo[i][relation]['Basic'] = { relation: relation, flag: 0 };

                    if (typeof contextinfo[i][relation].Data == 'undefined') {
                        contextinfo[i][relation].Data = [];
                    }
                }

                contextinfo[i][relation].Data.push({
                    data: target,
                    SID: sid,
                    sentence: sentence,
                    dependant: targetId,
                    equalopt: equalopt,
                    semiequal: semiequal,
                    andor: andor,
                });
            }
        }

        // NE解析結果
        match = bnst_data_f[i].match(/\<NE:([^\>]+)\>/);
        if (match) {
            relation = 'NE';

            if (!contextinfo[i]) {
                contextinfo[i] = {};
            }
            contextinfo[i][relation] = {};
            contextinfo[i][relation].Data = [];
            contextinfo[i][relation].Data[0] = { data: match[1] };

            if (typeof caseBox[relation] == 'undefined') {
                caseBox[relation] = 1;
            }

            if (match[1].match(/OPTIONAL/)) {
                contextinfo[i]['NE-OPT-TYPE'] = {};
                contextinfo[i]['NE-OPT-TYPE'].Data = [];
                contextinfo[i]['NE-OPT-TYPE'].Data[0] = { data: '0' };

                match2 = bnst_data_f[i].match(/\<NE-OPTIONAL:([^:]+):(\d)\>/);
                if (match2) {
                    contextinfo[i]['NE-OPT-TYPE'].Data[0].data = match2[2];
                    var ne_opt = match2[1];
                    for (let j = 0; j < NE_OPT_TAG.length; j++) {
                        const ne_tag = NE_OPT_TAG[j];
                        contextinfo[i][`NE-OPT-${ne_tag}`] = {};
                        contextinfo[i][`NE-OPT-${ne_tag}`].Data = [];
                        var re = new RegExp(ne_tag);
                        const ne_type_num = ne_opt.match(re) ? 1 : 0;
                        contextinfo[i][`NE-OPT-${ne_tag}`].Data[0] = { data: ne_type_num };
                    }
                }
            }
        }

        match = bnst_data_f[i].match(/\<memo text=\"(.*?)\"\/>/);
        if (match) {
            relation = 'memo';
            relation = 'メモ';

            if (!contextinfo[i]) {
                contextinfo[i] = {};
            }
            contextinfo[i][relation] = {};
            contextinfo[i][relation].Data = [];
            contextinfo[i][relation].Data[0] = { data: match[1] };

            if (typeof caseBox[relation] == 'undefined') {
                caseBox[relation] = 1;
            }
        }
    } //for

    if (typeof caseBox['ガ'] == 'undefined') {
        caseBox['ガ'] = 1;
    }
    let caseBoxNum = 0;
    const caseName = [];
    const sorted_keys = Object.keys(caseBox).sort(function (a, b) {
        return CaseOrder[b] - CaseOrder[a];
    }); // CaseBoxのkeyをCaseOrderのvalueにもとづいてソート
    for (var i = 0; i < sorted_keys.length; i++) {
        // CaseOrderの値が大きいものから0はじまりの連番をふる
        caseBoxNum += 1;
        caseBox[sorted_keys[i]] = caseBoxNum;
        caseName[caseBox[sorted_keys[i]]] = sorted_keys[i];
    }

    if (TREE_MODE == 'R') {
        // 以前の編集でおかしくなった可能性があるため
        // 最後の文節・基本句の係受け先を-1に設定しておく。
        bnst_data_dpnd[bnst_data_dpnd.length - 1] = -1;
        orig_bnst_data_dpnd[orig_bnst_data_dpnd.length - 1] = -1;
    }

    inputDataList[sen_id] = {};
    inputDataList[sen_id].bnst_data_btype = bnst_data_btype;
    inputDataList[sen_id].bnst_data_dpnd = bnst_data_dpnd;
    inputDataList[sen_id].bnst_data_start = bnst_data_start;
    inputDataList[sen_id].bnst_data_type = bnst_data_type;
    inputDataList[sen_id].bnst_data_f = bnst_data_f;
    inputDataList[sen_id].bnst_num = bnst_num;
    inputDataList[sen_id].mrph_num = mrph_num;

    inputDataList[sen_id].orig_bnst_data_num = orig_bnst_data_num;
    inputDataList[sen_id].orig_bnst_data_start = orig_bnst_data_start;
    inputDataList[sen_id].orig_bnst_data_end = orig_bnst_data_end;
    inputDataList[sen_id].orig_bnst_data_dpnd = orig_bnst_data_dpnd;
    inputDataList[sen_id].orig_bnst_data_type = orig_bnst_data_type;
    inputDataList[sen_id].orig_bnst_data_f = orig_bnst_data_f;
    inputDataList[sen_id].orig_bnst_num = orig_bnst_num;

    inputDataList[sen_id].mrph_data_all = mrph_data_all;
    inputDataList[sen_id].mrph_data_start = mrph_data_start;
    inputDataList[sen_id]['contextinfo'] = contextinfo;
    inputDataList[sen_id]['caseBox'] = caseBox;
    inputDataList[sen_id]['caseBoxNum'] = caseBoxNum;
    inputDataList[sen_id]['caseName'] = caseName;
    inputDataList[sen_id].memo = memo;
    inputDataList[sen_id].fileInfo = fileInfo;
    inputDataList[sen_id]['input_sentence'] = input_sentence;
    inputFileList.push(sen_id);

    backupDataList[sen_id] = jQuery.extend(true, {}, inputDataList[sen_id]);
}
