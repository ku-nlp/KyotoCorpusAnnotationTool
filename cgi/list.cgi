#!/usr/bin/env perl

use strict;
use CGI;

# �ե�������֤��롼�ȥǥ��쥯�ȥ������
our ($rootdir, $ext, $annot_path, $image_path);
require './cgi.conf';
my %PASSWD = (annotator_a => 'password_a', annotator_b => 'password_b');
my $cgi = new CGI;
print $cgi->header({type => 'text/html', charset => 'euc-jp', expires => '-1d'});

print <<EOF;
<html>
<head>
<meta http-equiv="content-style-type" content="text/css; charset=euc-jp">
<title>�����ѥ� �����ڡ���</title>
<style>
<!--
body {
    font-size: 14px;
    background-color:#eee;
    margin:20px;
}

form {
    margin: 0px;
}

table, td, th {
    border-collapse: collapse;
    border: 1px solid #FFFFFF;
}

th {
    font-size: 10pt;
    font:bold 16px;
    color:#444444;
    background-color:#c6c6c6;
}

td, th {
    padding: 5px;
}
-->
</style>
</head>
<body>
EOF

print "<h3>�����ѥ� �����ڡ���</h3>\n";

# ��ȼԤ�����å�
my ($annotator_id, $password, $corpus_set_id);
if ($cgi->param('annotator_id')) {
    $annotator_id = $cgi->param('annotator_id');
    $corpus_set_id = $cgi->param('corpus_set_id');
    $rootdir .= "/$corpus_set_id";
    $password = $cgi->param('password');
    if (!defined($PASSWD{$annotator_id}) || 
	$password ne $PASSWD{$annotator_id}) {
	print "<p>�ѥ���ɤ��㤤�ޤ���</p>\n";
	print $cgi->end_html;
	exit 1;
    }
}
else {
    print "<p>�ޤ������󤷤Ƥ���������</p>\n";
    print $cgi->end_html;
    exit 1;
}

print "<table>\n";
print "<tr><th>ID</th><th>����ID</th><th>������</th><th>�ǽ���������</th><th>���Υơ���</th><th>���Υơ������</th><th>���������<th>HTML</th><th>�Խ�</th></th><th>���ơ�����</th></tr>";

my $dircount = 0;
my $skip = $cgi->param('skip');
for my $dir (sort({$a <=> $b} glob("$rootdir/*"))) {
    next unless -d $dir;
    my ($dirname) = ($dir =~ m/^$rootdir\/(.+)/);
    my $filename = "$dir/$dirname.$ext";
    next unless -f $filename;
    my $filesize = sprintf("%.1fK", (stat($filename))[7] / 1000);

    my $infoname = "$dir/dirinfo";
    my ($annotator, $lastdate, $editing_flag, $current_annotator);
    if (-f $infoname) {
	open(INFO, $infoname);
	($annotator, $lastdate) = split(/\t/, <INFO>);
	if ($annotator =~ s/^\* //) { # �Խ���ΤȤ�
	    $editing_flag = 1;
	    $current_annotator = $annotator;
	    # ($annotator, $lastdate) = split(/\t/, <INFO>); # �ǽ�����
	    if ($annotator =~ s/^\* //) {
		print "<p>���顼��������ޤ�����</p>\n";
		print $cgi->end_html;
	    }
	}
	close(INFO);
    }

    my ($charged);
    my $chargename = "$dir/charge";
    if (-f $chargename) {
	open(INFO, $chargename);
	$charged = <INFO>;
	chomp($charged);
	close(INFO);
    }
	

    my $annotator_memo_name = "$dir/annotator_memo";
    my @memolines = ();
    my $memo;
    if (-f $annotator_memo_name){
	open(MEMO, $annotator_memo_name);
	while (<MEMO>){
	    $memo .= $_;
	    chomp;
	    push(@memolines, $_);
	}
	close MEMO;
    }
	$dircount++;

    my $memo_print = join(" ", @memolines);
	my $skip_flag=0;
	if($memo_print =~ /��/ || $memo_print =~ /��Ŭ/ )
	{
		$skip_flag =1;
	}
    $memo_print = substr($memo_print, 0, 36 - length(" ...")) . " ..." if (length($memo_print) > 36);

	if ($annotator !~ s/^\* //) { # �Խ���Ǥʤ���
		if($skip && $skip_flag ==1)
		{
			next;
		}
	}
	

    print qq(<tr valign="top">);
    print qq(<td align="right">$dircount</td>);
    # $dircount++;

    if ($annotator_id eq $charged) {
	print qq(<td><span style="color: red">$dirname</span></td>);
    }
    else {
	print qq(<td>$dirname</td>);
    }
    print qq(<td align="right">$filesize</td><td>$lastdate</td><td>$annotator</td>);

    # ���
    print qq(<td><form method=POST action="memo.cgi">);
    print qq(<input type="hidden" name="annotator_id" value="$annotator_id">);
    print qq(<input type="hidden" name="corpus_set_id" value="$corpus_set_id">);
    print qq(<input type="hidden" name="password" value="$password">);
    print qq(<input type="hidden" name="skip" value="$skip">);
    print qq(<input type="hidden" name="oldmemo" value="$memo">);
    print qq(<input type="hidden" name="file" value="$annotator_memo_name">);
    print qq(<input type="image" src="$image_path/edit_of.png" onmouseover="this.src='$image_path/edit_on.png'" onmouseout="this.src='$image_path/edit_of.png'"> $memo_print);

    # Download
    print qq(</form></td>);
    print qq(<td><form method=POST action="download.cgi">);
    print qq(<input type="hidden" name="annotator_id" value="$annotator_id">);
    print qq(<input type="hidden" name="corpus_set_id" value="$corpus_set_id">);
    print qq(<input type="hidden" name="article_id" value="$dirname">);
    print qq(<input type="hidden" name="skip" value="$skip">);
    print qq(<input type="image" src="$image_path/dl_of.png" onmouseover="this.src='$image_path/dl_on.png'" onmouseout="this.src='$image_path/dl_of.png'" value="Download" >);
    print qq(</form></td>);

    # HTML
    print qq(<td><form method=POST action="html.cgi">);
    print qq(<input type="hidden" name="annotator_id" value="$annotator_id">);
    print qq(<input type="hidden" name="corpus_set_id" value="$corpus_set_id">);
    print qq(<input type="hidden" name="article_id" value="$dirname">);
    print qq(<input type="image" src="$image_path/html_of.png" onmouseover="this.src='$image_path/html_on.png'" onmouseout="this.src='$image_path/html_of.png'" value="HTML">);
    print qq(</form></td>);

    # ���Υơ������ġ��뵯ư
    print qq(<td><input type="image" src="$image_path/edit_of.png" onmouseover="this.src='$image_path/edit_on.png'" onmouseout="this.src='$image_path/edit_of.png'" value="�Խ�" onClick="window.open('$annot_path?article_id=$dirname&corpus_set_id=$corpus_set_id&annotator_id=$annotator_id&password=$password&skip=$skip','newWin')">);

    print qq(</td>);

    # ���ơ�����
    if ($editing_flag) {
	print qq(<td>${current_annotator}���Խ���</td>);
    }
    else {
	print qq(<td><br></td>);
    }
    print "</tr>";
}

print "</table>";

print $cgi->end_html;
