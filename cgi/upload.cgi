#!/usr/bin/env perl

use strict;
use CGI;

# �ե�������֤��롼�ȥǥ��쥯�ȥ������
our ($rootdir, $ext);
require './cgi.conf';

my $cgi = new CGI;

# CGI�إå��ν���
print $cgi->header({type => 'text/html', charset => 'euc-jp', expires => '-1d'});
print $cgi->start_html({title => '�����ǡ��� ���åץ���', lang => 'ja', encoding => 'euc-jp'});

# ����ID������å�
my ($article_id);
if ($cgi->param('article_id')) {
    $article_id = $cgi->param('article_id');
}

# ��ȼԤ�����å�
my ($annotator_id, $password);
if ($cgi->param('annotator_id')) {
    $annotator_id = $cgi->param('annotator_id');
    $password = $cgi->param('password');
}


# �ե�����̾
my ($filename);
if ($cgi->param('upfile')) {
    $filename = $cgi->param('upfile');
}

unless ($article_id && $annotator_id && $filename) {
    # print "<p>����ID�����Ϥ��Ƥ���������</p>\n";
    # print "<p>̾�������Ϥ��Ƥ���������</p>\n";
    &default_page();
    exit 1;
}

# �������������å�
my $infoname = "$rootdir/$article_id/dirinfo";
my (@buf);
open(INFO, $infoname);
while (<INFO>) {
    push(@buf, $_);
}
close(INFO);
my ($info_annotator) = ($buf[0] =~ /^\* (\S+)/);
if ($annotator_id ne $info_annotator) {
    print "<p>���ʤ��ϥ��åץ��ɤǤ��ޤ���</p>\n";
    &default_page();
    exit 1;
}

# ���åץ��ɤ��줿�ե�����ξ�����������
my ($fh);
unless ($fh = $cgi->upload('upfile')) {      # �ե�����ϥ�ɥ�
    print "<p>��Ф���ե����������Ǥ���������</p>\n";
    &default_page();
    exit 1;
}

my $filepath = "$rootdir/$article_id/$article_id.$ext-$$";
my $filetype = $cgi->uploadInfo($filename)->{'Content-Type'};

# �ե������񤭽Ф�
unless (open OUT, "> $filepath") {
    print "<p>�ե�����������˥��顼��ȯ�����ޤ�����</p>\n",
	$cgi->end_html;
    exit 1;
}

my ($buf);
my $size = 0;
while (my $bytes = read($fh, $buf, 1024)) {
    print OUT $buf;
    $size += $bytes;
}
close OUT;

if ($size == 0) {
    print "<p>�ե����뤬�ɤ߹���ޤ���Ǥ�����</p>\n",
	$cgi->end_html;
    exit 1;
}

# ����

# ��������򹹿�
open(INFO, "> $infoname");
my $date = sprintf("%d-%02d-%02d %02d:%02d", (localtime)[5] + 1900, (localtime)[4] + 1, (localtime)[3,2,1]);
print INFO "$annotator_id\t$date\n";
for my $line (@buf) {
    print INFO $line;
}
close(INFO);

# �ܽ񤭹���
my $last_filepath = "$rootdir/$article_id/$article_id.$ext";
&save_old_file($last_filepath);
rename($filepath, $last_filepath);

print <<EOF;
<h3>�����ǡ���������դ��ޤ�����</h3>
<ul>
 <li> ̾��: $annotator_id
 <li> �����ֹ�: $article_id
 <li> ��������: $date
 <li> �ե�����̾: $filename ($size bytes)
</ul>
EOF

print qq(<form method=POST action="list.cgi">\n);
print qq(<input type="hidden" name="annotator_id" value="$annotator_id">\n);
print qq(<input type="hidden" name="password" value="$password">\n);
print qq(<tr><th></th><td><input type="submit" value="���"></td></tr>\n);
print qq(</form>\n);
print $cgi->end_html;


sub default_page {
    print qq(<h3>�����ǡ����Υ��åץ���</h3><br>\n);
    print qq(<form method=POST enctype="multipart/form-data" action="upload.cgi">\n);
    print qq(<input type="hidden" name="password" value="$password">\n);
    print qq(<table>\n);
    print qq(<tr><th align=left>̾��</th><td><input name="annotator_id" value="$annotator_id" size="10"></td></tr>\n);
    print qq(<tr><th align=left>����ID</th><td><input name="article_id" value="$article_id" size="30"></td></tr>\n);
    print qq(<tr><th align=left>�ե�����</th><td><input name="upfile" type="file" size="60"></td></tr>\n);
    print qq(<tr><th></th><td><input type="submit" value="����"></td></tr>\n);
    print qq(</form>\n);
    print qq(</table>\n);
    print $cgi->end_html;
}

sub save_old_file {
    my ($file) = @_;
    my $suffix = 1;

    while (-f "$file.$suffix") {
	$suffix++;
    }
    rename($file, "$file.$suffix");
}
