#!/usr/bin/env perl

use strict;
use CGI;

my $cgi = new CGI;

# CGI�إå��ν���
print $cgi->header({type => 'text/html', charset => 'euc-jp', expires => '-1d'});
print $cgi->start_html({title => '�����ǡ��� ���åץ���', lang => 'ja', encoding => 'euc-jp'});

print "download����";
print $cgi->end_html;
