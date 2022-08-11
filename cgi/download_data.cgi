#!/usr/bin/env perl

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use File::Path;
use File::Copy;

# ファイルを置くルートディレクトリの設定
our ($rootdir, $ext);
require './cgi.conf';

my $cgi = new CGI;
my $article_id = $cgi->param('article_id');
my $corpus_set_id = $cgi->param('corpus_set_id');
my $article_dir = "$rootdir/$corpus_set_id/$article_id";
my $dirinfo_path = "$article_dir/dirinfo";
my $contents_dir = "$article_dir/contents";
my $fileinfos_path = "$contents_dir/fileinfos";

# 作業者をチェック
my ($annotator_id);
if ($cgi->param('annotator_id')) {
    $annotator_id = $cgi->param('annotator_id');

    # ヘッダー出力
    print $cgi->header({ type => 'text/xml', charset => 'utf-8', expires => '-1d' });
    print "<result>";

    # ロックユーザーかチェック
    my $date = sprintf("%d-%02d-%02d %02d:%02d", (localtime)[5] + 1900, (localtime)[4] + 1, (localtime)[3, 2, 1]);
    my (@buf);
    if (-f $dirinfo_path) {
        open(INFO, $dirinfo_path);
        while (<INFO>) {
            push(@buf, $_);
        }
        close(INFO);
    }

    # ロックされていない
    if ($buf[0] !~ /^\* /) {
        # print "<lockuser>$buf[0]</lockuser>\n";
        open(INFO, "> $dirinfo_path");
        print INFO "\* $annotator_id\t$date\n";
        for my $line (@buf) {
            print INFO $line;
        }
        close(INFO);

        # annotator以外のユーザがロックしている
    } elsif ($buf[0] !~ /^\* $annotator_id\s+/) {
        &default_page("別のユーザーによってロックされています。");
    }
} else {
    &default_page("annotator_idが指定されていません");
}

unless (-d $contents_dir) {
    &default_page("$contents_dir が見つかりません。");
}

# バックアップディレクトリ作成
if ($cgi->param('backupFlag')) {
    my $backupFlag = $cgi->param('backupFlag');
    if ($backupFlag == 1) {
        &save_old_dir($contents_dir, $annotator_id);
    }
}

# read
unless (open(FILEINFOS, $fileinfos_path)){
    &default_page("$fileinfos_path が読み込めません。");
}
while (my $line = <FILEINFOS>) {
    if ($line =~ /# S-ID:(\S+)/) {
        # ファイル内容取得
        unless (open(CONTENT, "$contents_dir/$1")){
            &default_page("$contents_dir/$1が読み込めません。");
        }
        my $content = "";
        while (my $ln = <CONTENT>) {
            $content .= $ln;
        }
        close(CONTENT);
        print "<file>";
        print "<id>$1</id><data>";
        print $cgi->escapeHTML($content);
        print "</data></file>";
    }
}
close(FILEINFOS);

print "</result>";
exit 1;

sub default_page {
    my ($error_message) = @_;
    die("$error_message\n");
}

sub save_old_dir {
    my $date = sprintf("%d%02d%02d%02d%02d", (localtime)[5] + 1900, (localtime)[4] + 1, (localtime)[3, 2, 1]);
    my ($dir, $annotator_id) = @_;
    my $suffix = "$date" . "_" . "$annotator_id";
    my $new_dir = "contents.$suffix";
    copy($dir, $new_dir);
}
