#!/usr/local/bin/perl

use strict;
use CGI;

my $cgi = new CGI;

our ($rootdir, $ext, $annot_path, $image_path);
require './cgi.conf';
my $corpus_set_id = $cgi->param('corpus_set_id');
$rootdir .= "/$corpus_set_id";
my $skip = $cgi->param('skip');

# CGI�إå��ν���
print $cgi->header({type => 'text/html', charset => 'euc-jp', expires => '-1d'});
print <<EOF;
<html>
<head>
<meta http-equiv="content-style-type" content="text/css; charset=euc-jp">
<title>���Υơ������ڡ���</title>
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

print "<h3>���Υơ������ڡ���</h3>\n";

print $cgi->start_html({title => '���Υơ������', lang => 'ja', encoding => 'euc-jp'});

# ��ȼԤ�����å�
my ($annotator_id, $password);
if ($cgi->param('annotator_id')) {
    $annotator_id = $cgi->param('annotator_id');
    $password = $cgi->param('password');
}

unless ($annotator_id && $password) {
    print "<p>�ޤ������󤷤Ƥ���������</p>\n";
    print $cgi->end_html;
    exit 1;
}

# �ե�����̾
my ($file);
if ($cgi->param('file')) {
    $file = $cgi->param('file');
}

unless ($file) {
    print "<p>annotator_memo�ե��������ꤷ�Ƥ���������</p>\n";
    print $cgi->end_html;
    exit 1;
}

# ���������
my ($newmemo);
if ($cgi->param('newmemo')) {
    $newmemo = $cgi->param('newmemo');
}

# �ե�����˽񤭹���
unless(-f $file && not -w $file){
    open(MEMO, ">$file");
    print MEMO $newmemo;
    close MEMO;

    print "<div id='fileinfo'>$file�˰ʲ������Ƥ�񤭹��ߤޤ�����</div>";
    print "<p class='a_memo'>$newmemo</p>";

    print "<form method=POST action=\"list.cgi\">\n";
    print qq(<input type="image" class="mng" src="$image_path/mng_of.png" onmouseover="this.src='$image_path/mng_on.png'" onmouseout="this.src='$image_path/mng_of.png'">);
    print "<input type=\"hidden\" name=\"annotator_id\" value=\"$annotator_id\">";
    print "<input type=\"hidden\" name=\"password\" value=\"$password\">";
    print "<input type=\"hidden\" name=\"skip\" value=\"$skip\">";
    print qq(<input type="hidden" name="corpus_set_id" value="$corpus_set_id">);
    print "</form>\n";
}else{
    print "<p>$file�˽񤭹���ޤ���</p>\n";
    print $cgi->end_html;
    exit 1;
}

print $cgi->end_html;
