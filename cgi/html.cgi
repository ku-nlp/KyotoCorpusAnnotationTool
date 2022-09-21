#!/usr/bin/env perl

# use strict;
use CGI;
use File::Path;

# ファイルを置くルートディレクトリの設定
our ($rootdir);
require './cgi.conf';

my $cgi = new CGI;

my $article_id = $cgi->param('article_id');
my $corpus_set_id = $cgi->param('corpus_set_id');
my $contents_dir = "$rootdir/$corpus_set_id/$article_id/contents";
my $out_html = "$rootdir/../out-html";

# 作業者をチェック
my ($annotator_id);
if ($cgi->param('annotator_id')) {
    $annotator_id = $cgi->param('annotator_id');
} else {
    &default_page();
    exit 1;
}

unless (-e $contents_dir) {
    &default_page();
    exit 1;
}

`awk 1 $contents_dir/$article_id* > $out_html/$article_id.knp`;
my $html = `perl $rootdir/../../cgi/kc_annotation_per-article.perl $out_html/$article_id.knp`;
print $cgi->header({ type => 'text/html', charset => 'UTF-8', expires => '-1d' });
print $cgi->start_html({ title => '記事データ ダウンロード', lang => 'ja', encoding => 'utf-8' });
print $html;
print $cgi->end_html;

exit 0;

sub default_page {
    # CGIヘッダの出力
    print $cgi->header({ type => 'text/html', charset => 'utf-8', expires => '-1d' });
    print $cgi->start_html({ title => '記事データ ダウンロード', lang => 'ja', encoding => 'utf-8' });
    print "<h1>関係コーパス 記事データダウンロード</h1><br>\n";
    print "<p>名前を入力してください。</p>\n" unless $annotator_id;
    print "<p>記事$article_idがみつかりません。</p>\n" unless -f $filepath;
    print "<form method=POST action=\"download.cgi\">\n";
    print "<table>\n";
    print "<tr><th align=left>名前</th><td><input name=\"annotator_id\" size=\"10\"></td></tr>\n";
    print "<tr><th align=left>記事ID</th><td><input name=\"article_id\" value=\"$article_id\" size=\"9\"></td></tr>\n";
    print "<tr><th></th><td><input type=\"submit\" value=\"送信\"></td></tr>\n";
    print "</form>\n";
    print "</table>\n";
    print $cgi->end_html;
}
