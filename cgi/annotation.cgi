#!/usr/bin/env perl

use strict;
use CGI;

my $cgi = new CGI;

# CGIヘッダの出力
print $cgi->header({ type => 'text/html', charset => 'utf-8', expires => '-1d' });
print $cgi->start_html({ title => '記事データ アップロード', lang => 'ja', encoding => 'utf-8' });

print "download画面";
print $cgi->end_html;
