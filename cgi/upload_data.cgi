#!/usr/local/bin/perl

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use File::Path;
use Archive::Tar;
use Archive::Tar::Constant; # 定数をインポートする

# ファイルを置くルートディレクトリの設定
our ($rootdir, $ext);
require './cgi.conf';

my $cgi = new CGI;
my $tar = Archive::Tar->new;

# 記事IDをチェック
my $article_id = $cgi->param('article_id');

# corpus set IDをチェック
my $corpus_set_id = $cgi->param('corpus_set_id');
$rootdir .= "/$corpus_set_id";

# 作業者をチェック
my ($annotator_id);
if ($cgi->param('annotator_id')) {
    $annotator_id = $cgi->param('annotator_id');
}

# ファイル名
my ($filename);
if ($cgi->param('filename')) {
    $filename = $cgi->param('filename');
}

# コンテンツ取得
my ($content);
if ($cgi->param('content')) {
    $content = $cgi->param('content');
}

my ($quitFlg);
if ($cgi->param('quitFlg')) {
    $quitFlg = $cgi->param('quitFlg');
}

unless ($annotator_id) {
    &default_page("annotator_idが指定されていません。");
}
unless ($article_id) {
    &default_page("記事IDが指定されていません。");
}

# 記事情報をチェック
my $infoname = "$rootdir/$article_id/dirinfo";
my (@buf);
open(INFO, $infoname);
while (<INFO>) {
    push(@buf, $_);
}
close(INFO);
my ($info_annotator) = ($buf[0] =~ /^\* (\S+)/);
if ($annotator_id ne $info_annotator) {
    &default_page("権限がありません。");
}

if($quitFlg) {
    # 記事情報を更新
    my ($buf);
    open(INFO, "> $infoname");
    my $date = sprintf("%d-%02d-%02d %02d:%02d", (localtime)[5] + 1900, (localtime)[4] + 1, (localtime)[3,2,1]);
    my $skipped = 0;
    for my $line (@buf) {
        # skip lines starting by '*' at the beginning of the file
        if ($line =~ /^\* / && !$skipped) {
            $skipped = 1;
        } else {
            print INFO $line;
        }
    }
    close(INFO);

} else {
    unless ($content) {
        &default_page("データが空です。");
    }

    unless ($filename) {
        &default_page("ファイル名が指定されていません。");
    }

    my $archivepath = "$rootdir/$article_id/$article_id.$ext";
    unless ($tar->read($archivepath)) {
        &default_page("ファイル読み込みエラーです。");
    }

    unless ($tar->replace_content("$article_id/$filename", $content)) {
        &default_page("保存処理中にエラーが発生しました。");
    }

    unless ($tar->write($archivepath, COMPRESS_GZIP)) {
        &default_page("ファイル圧縮中にエラーが発生しました。");
    }

    # 記事情報を更新
    my ($buf);
    open(INFO, "> $infoname");
    my $date = sprintf("%d-%02d-%02d %02d:%02d", (localtime)[5] + 1900, (localtime)[4] + 1, (localtime)[3,2,1]);
    print INFO "* $annotator_id\t$date\n";
    print INFO "$annotator_id\t$date\n";
    for my $line (@buf) {
        print INFO $line;
    }
    close(INFO);

}

# 成功
# CGIヘッダの出力
print $cgi->header({type => 'text/xml', charset => 'utf-8', expires => '-1d'});
print "<result>ok</result>";

sub default_page {
    my ($error_message) = @_;
    die("$error_message\n");
}
