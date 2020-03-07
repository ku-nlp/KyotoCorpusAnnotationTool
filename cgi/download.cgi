#!/usr/local/bin/perl

use strict;
use CGI;

# �ե�������֤��롼�ȥǥ��쥯�ȥ������
our ($rootdir, $ext);
require './cgi.conf';

my $cgi = new CGI;
my $skip = $cgi->param('skip');
my $corpus_set_id = $cgi->param('corpus_set_id');
my $article_id = $cgi->param('article_id');
$rootdir .= "/$corpus_set_id";
my $filename = "$article_id.$ext";
my $filepath = "$rootdir/$article_id/$filename";

# # ��ȼԤ�����å�
# my ($annotator_id, $password);
# if ($cgi->param('annotator_id')) {
#     $annotator_id = $cgi->param('annotator_id');
#     $password = $cgi->param('password');
#     if (!defined($PASSWD{$annotator_id}) ||
# 	$password ne $PASSWD{$annotator_id}) {
# 	print "<p>�ѥ���ɤ��㤤�ޤ���</p>\n";
# 	print $cgi->end_html;
# 	exit 1;    }
# }
# else {
#     print "<p>�ޤ������󤷤Ƥ���������</p>\n";
#     print $cgi->end_html;
#     exit 1;
# }

# ��ȼԤ�����å�
my ($annotator_id);
if ($cgi->param('annotator_id')) {
    $annotator_id = $cgi->param('annotator_id');
}
else {
    &default_page();
    exit 1;
}

unless (-f $filepath) {
    &default_page();
    exit 1;
}

print "Content-Type: application/x-tgz\n"; # ; name=\"$filename\"
print "Content-Disposition: attachment; filename=$filename\n\n";

open(F, $filepath);
while (<F>) {
    print;
}
close(F);

# ��������ι���
my $date = sprintf("%d-%02d-%02d %02d:%02d", (localtime)[5] + 1900, (localtime)[4] + 1, (localtime)[3,2,1]);
my $infoname = "$rootdir/$article_id/dirinfo";
my (@buf);
if (-f $infoname) {
    open(INFO, $infoname);
    while (<INFO>) {
	push(@buf, $_);
    }
    close(INFO);
}

# ���Ǥ��Խ���ʤ�й������ʤ�
if ($buf[0] !~ /^\* /) {
    open(INFO, "> $infoname");
    print INFO "\* $annotator_id\t$date\n";
    for my $line (@buf) {
	print INFO $line;
    }
    close(INFO);
}

exit 0;


sub default_page {
    # CGI�إå��ν���
    print $cgi->header({type => 'text/html', charset => 'euc-jp', expires => '-1d'});
    print $cgi->start_html({title => '�����ǡ��� ���������', lang => 'ja', encoding => 'euc-jp'});
    print "<h1>�ط������ѥ� �����ǡ������������</h1><br>\n";
    print "<p>̾�������Ϥ��Ƥ���������</p>\n" unless $annotator_id;
    print "<p>����$article_id���ߤĤ���ޤ���</p>\n" unless -f $filepath;
    print "<form method=POST action=\"download.cgi\">\n";
    print "<table>\n";
    print "<tr><th align=left>̾��</th><td><input name=\"annotator_id\" size=\"10\"></td></tr>\n";
    print "<tr><th align=left>����ID</th><td><input name=\"article_id\" value=\"$article_id\" size=\"9\"></td></tr>\n";
    print qq(<input type="hidden" name="skip" value="$skip">);
    print "<tr><th></th><td><input type=\"submit\" value=\"����\"></td></tr>\n";
    print "</form>\n";
    print "</table>\n";
    print $cgi->end_html;
}
