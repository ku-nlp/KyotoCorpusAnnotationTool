#!/usr/bin/env perl

use strict;
use CGI;

my $cgi = new CGI;

our ($rootdir, $ext, $annot_path, $image_path);
require './cgi.conf';

# CGIヘッダの出力
print $cgi->header({type => 'text/html', charset => 'utf-8', expires => '-1d'});
print <<EOF;
<html>
<head>
<meta http-equiv="content-style-type" content="text/css; charset=utf-8">
<title>コーパス 管理ページ</title>
<style>
<!--

body {
    font:bold 16px;
    color:#444444;
    background-color:#eee;
    margin:20px;
}

.button {
    margin-right:10px;
}

-->
</style>
</head>
<body>
EOF

print "<h3>アノテータメモ入力ページ</h3>\n";

print $cgi->start_html({title => 'アノテータメモ', lang => 'ja', encoding => 'utf-8'});

# 作業者をチェック
my ($annotator_id, $password, $corpus_set_id);
if ($cgi->param('annotator_id')) {
    $annotator_id = $cgi->param('annotator_id');
    $password = $cgi->param('password');
    $corpus_set_id = $cgi->param('corpus_set_id');
    $rootdir .= "/$corpus_set_id";
}

unless ($annotator_id && $password) {
    print "<p>まずログインしてください。</p>\n";
    print $cgi->end_html;
    exit 1;
}

# ファイル名
my ($file);
if ($cgi->param('file')) {
    $file = $cgi->param('file');
}

unless ($file) {
    print "<p>annotator_memoファイルを指定してください。</p>\n";
    print $cgi->end_html;
    exit 1;
}

# 古いメモ
my ($oldmemo);
if ($cgi->param('oldmemo')) {
    $oldmemo = $cgi->param('oldmemo');
}
my $skip = $cgi->param('skip');

# form
print "<p>メモを書いてください。</p>";
print "<form method=POST action=\"save_memo.cgi\">\n";
print "<textarea name=\"newmemo\" cols=\"50\" rows=\"3\" wrap=\"soft\">$oldmemo</textarea>";
print "<p />";
print qq(<input type="image" class="button" src="$image_path/save_of.png" onmouseover="this.src='$image_path/save_on.png'" onmouseout="this.src='$image_path/save_of.png'" />);

print qq(<input type="image" class="button" onclick="this.form.reset(); return false;" src="$image_path/undo_of.png" onmouseover="this.src='$image_path/undo_on.png'" onmouseout="this.src='$image_path/undo_of.png'" />);
print "<input type=\"hidden\" name=\"file\" value=\"$file\">";
print "<input type=\"hidden\" name=\"annotator_id\" value=\"$annotator_id\">";
print "<input type=\"hidden\" name=\"password\" value=\"$password\">";
print "<input type=\"hidden\" name=\"skip\" value=\"$skip\">";
print qq(<input type="hidden" name="corpus_set_id" value="$corpus_set_id">);
print "</form>\n";

print $cgi->end_html;
