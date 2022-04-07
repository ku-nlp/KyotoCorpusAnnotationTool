#!/usr/bin/env perl

use strict;
use CGI;

my $cgi = new CGI;

our ($rootdir, $ext, $annot_path, $image_path);
require './cgi.conf';
my $corpus_set_id = $cgi->param('corpus_set_id');
$rootdir .= "/$corpus_set_id";
my $skip = $cgi->param('skip');

# CGIヘッダの出力
print $cgi->header({type => 'text/html', charset => 'utf-8', expires => '-1d'});
print <<EOF;
<html>
<head>
<meta http-equiv="content-style-type" content="text/css; charset=utf-8">
<title>アノテータメモページ</title>
<style>
<!--

body {
    margin:20px;
    font:bold 16px;
    color:#444444;
    background-color:#eee;
}

#fileinfo{
    margin-top:20px;
    border:1px solid #EEEEEE;
    padding:10px 15px;
    background-color:#DDDDDD;
}

.a_memo{
    margin-top:20px;
}

.mng {
  # margin:20px;
}

-->
</style>
</head>
<body>
EOF

print "<h3>アノテータメモページ</h3>\n";

print $cgi->start_html({title => 'アノテータメモ', lang => 'ja', encoding => 'utf-8'});

# 作業者をチェック
my ($annotator_id, $password);
if ($cgi->param('annotator_id')) {
    $annotator_id = $cgi->param('annotator_id');
    $password = $cgi->param('password');
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

# 新しいメモ
my ($newmemo);
if ($cgi->param('newmemo')) {
    $newmemo = $cgi->param('newmemo');
}

# ファイルに書き込み
unless(-f $file && not -w $file){
    open(MEMO, ">$file");
    print MEMO $newmemo;
    close MEMO;

    print "<div id='fileinfo'>$fileに以下の内容を書き込みました。</div>";
    print "<p class='a_memo'>$newmemo</p>";

    print "<form method=POST action=\"list.cgi\">\n";
    print qq(<input type="image" class="mng" src="$image_path/mng_of.png" onmouseover="this.src='$image_path/mng_on.png'" onmouseout="this.src='$image_path/mng_of.png'">);
    print "<input type=\"hidden\" name=\"annotator_id\" value=\"$annotator_id\">";
    print "<input type=\"hidden\" name=\"password\" value=\"$password\">";
    print "<input type=\"hidden\" name=\"skip\" value=\"$skip\">";
    print qq(<input type="hidden" name="corpus_set_id" value="$corpus_set_id">);
    print "</form>\n";
}else{
    print "<p>$fileに書き込めません。</p>\n";
    print $cgi->end_html;
    exit 1;
}

print $cgi->end_html;
