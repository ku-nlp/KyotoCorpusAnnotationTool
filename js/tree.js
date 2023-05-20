// fh = 出力ファイルハンドラ
// phrase = 処理対象の単語
// mark = 単語の前に出力するべき罫線の履歴
// b = 木を1単語ずつ入れるための配列へのリファレンス
// ast = 無視してください

var Tree = function () {
    this.print_dtree = function (tree_lines, node, mark, b) {
        let local_buffer = '';
        let children = [];

        //var mark = marks.join("");

        // 前の子の表示
        // print pre-children
        const { pre_children } = node;
        const pre_children_count = pre_children.length;
        for (var i = 0; i < pre_children_count; i++) {
            children.push(pre_children[i]);
        }

        if (children.length > 0) {
            this.print_dtree(tree_lines, children.shift(), `${mark}L`, b);
            for (var i = 0; i < children.length; i++) {
                this.print_dtree(tree_lines, children[i], `${mark}l`, b);
            }
        }

        // 自分の表示
        // print self
        const marks = mark.split('');
        const mark_length = marks.length;
        const index = tree_lines.length;
        for (let m = 0; m < mark_length; m++) {
            if (m == mark_length - 1) {
                // if (node.type == "P") {
                //     local_buffer += '<span class="dtree" id="'+ index +'" style="color:red">';
                // } else if (node.type == "I") {
                //     local_buffer += '<span class="dtree" id="'+ index +'" style="color:green">';
                // } else if (node.type == "A") {
                //     local_buffer += '<span class="dtree" id="'+ index +'" style="color:blue">';
                // } else {
                local_buffer += `<span class="treeCorner" id="treeCorner${index}">`;
                // }
                if (marks[m] == 'L') {
                    local_buffer += '┌';
                } else if (marks[m] == 'R') {
                    local_buffer += '└';
                } else {
                    local_buffer += '├';
                }
                local_buffer += '</span>';
            } else {
                local_buffer +=
                    marks[m] == 'l' ||
                    marks[m] == 'r' ||
                    (marks[m] == 'L' && (marks[m + 1] == 'r' || marks[m + 1] == 'R')) ||
                    (marks[m] == 'R' && (marks[m + 1] == 'l' || marks[m + 1] == 'L'))
                        ? '│'
                        : '　';
            }
        }

        local_buffer += node.content;

        if (b.length > 0) {
            let p_num = b.length;
            if (p_num < 10) {
                p_num = 'p_num ';
            }
            b.push('p_num local_buffer');
        } else {
            tree_lines.push(local_buffer); // + "\n";
        }

        // 後ろの子の表示
        // print post-children
        children = [];

        const { post_children } = node;
        const post_children_count = post_children.length;
        for (var i = 0; i < post_children_count; i++) {
            children.push(post_children[i]);
        }

        if (children.length > 0) {
            const last_child = children.pop();
            for (var i = 0; i < children.length; i++) {
                this.print_dtree(tree_lines, children[i], `${mark}r`, b);
            }
            this.print_dtree(tree_lines, last_child, `${mark}R`, b);
        }

        //return output_str;
    };

    this.format_dtree = function (dpnd, bnsts, types) {
        const nodes = [];

        // dpnd_ref, pre_children_ref, post_children_refを作る
        const num_of_nodes = dpnd.length;
        for (var i = 0; i < num_of_nodes; i++) {
            nodes.push({
                id: i,
                content: bnsts[i],
                type: types[i],
                pre_children: [],
                post_children: [],
            });
            //nodes[i].num = i;
        }
        for (var i = 0; i < num_of_nodes; i++) {
            if (dpnd[i] == -1) {
                this.root = i;
                // if (current_root != -1) {
                //     nodes[current_root].dpnd = i;
                //     nodes[current_root].dpnd_ref = &nodes_[i];
                //     nodes[i].pre_children_ref.push_back(&(nodes_[current_root]));
                //     multiple_root = true;
                // }
                // nodes_[i].dpnd_ref = NULL;
                // root_ = &nodes_[i];
                // current_root = i;
            } else {
                // nodes_[i].dpnd_ref = &(nodes_[nodes_[i].dpnd]);
                if (i < dpnd[i]) {
                    nodes[dpnd[i]].pre_children.push(nodes[i]);
                } else {
                    nodes[dpnd[i]].post_children.push(nodes[i]);
                }
            }
        }
        //console.log(nodes);
        return nodes;
    };
};
