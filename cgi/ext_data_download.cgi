#!/usr/bin/env perl

use strict;
use CGI;
use File::Path;
use Archive::Tar;

my $tar = Archive::Tar->new;

# ファイルを置くルートディレクトリの設定
our ($rootdir, $ext);
require './cgi.conf';

my $cgi = new CGI;
my $article_id = $cgi->param('article_id');
# my $article_id = "tsubame00343"; # for test

my $filename = "$article_id.$ext";
my $filedir = "$rootdir/$article_id/";
my $filepath = "$rootdir/$article_id/$filename";
my $fileinfo = "fileinfos";
my $dirinfo = "dirinfo";

# ヘッダー出力
print $cgi->header({type => 'text/xml', charset => 'utf-8', expires => '-1d'});
print "<result>";
# print "<test>$filepath</test>";


# 作業者をチェック
my ($annotator_id);
if ($cgi->param('annotator_id')) {
    $annotator_id = $cgi->param('annotator_id');
    print "<user>$annotator_id</user>";


    # ロックユーザーかチェック
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

    # ロックされていない
    if ($buf[0] !~ /^\* /) {
        print "<luser>$buf[0]</luser>";
        open(INFO, "> $infoname");
        print INFO "\* $annotator_id\t$date\n";
        for my $line (@buf) {
            print INFO $line;
        }
        close(INFO);

# annotator以外のユーザがロックしている
    } elsif ($buf[0] !~ /^\* $annotator_id\s+/) {
        &default_page();
        exit 1;
    }

} else {
    &default_page();
    exit 1;
}

unless (-f $filepath) {
    &default_page();
    exit 1;
}

# gzip形式で圧縮されているtarファイルの展開
chdir($filedir);
# バックアップファイル作成
&save_old_file($filename);
# 展開
$tar->read($filename);
$tar->extract;

# filenameと同名のdirが展開されているので移動
my $extractdir = "$filedir/$article_id";
chdir($extractdir);

my @file;
# fileinfoを開く
open(F, $fileinfo);
while (<F>) {
    if($_ =~ /# S-ID:(\S+)/) {
        # TODO:ファイルがない時のエラー処理をいれる
        print "<file><id>$1</id><data>";
        open(F2, $1);
        while (<F2>) {
            print $cgi->escapeHTML($_);
        }
        close(F2);
        print "</data></file>";
    }
}
close(F);
print "</result>";

# ディレクトリ削除
chdir($filedir);
my @rmdir = ($extractdir);
rmtree(@rmdir);

# exit 0;
exit 1;

# &default_page();

sub default_page {
    # CGIヘッダの出力
    print $cgi->header({type => 'text/xml', charset => 'utf-8', expires => '-1d'});
    print "<def>error</def>";

    # print $cgi->start_html({title => '記事データ ダウンロード', lang => 'ja', encoding => 'utf-8'});
    # print "<h1>関係コーパス 記事データダウンロード</h1><br>\n";
    # print "<p>名前を入力してください。</p>\n" unless $annotator_id;
    # print "<p>記事$article_idがみつかりません。</p>\n" unless -f $filepath;
    # print "<form method=POST action=\"download.cgi\">\n";
    # print "<table>\n";
    # print "<tr><th align=left>名前</th><td><input name=\"annotator_id\" size=\"10\"></td></tr>\n";
    # print "<tr><th align=left>記事ID</th><td><input name=\"article_id\" value=\"$article_id\" size=\"9\"></td></tr>\n";
    # print "<tr><th></th><td><input type=\"submit\" value=\"送信\"></td></tr>\n";
    # print "</form>\n";
    # print "</table>\n";
    # print $cgi->end_html;
}

sub save_old_file {
    my $date = sprintf("%d-%02d-%02d %02d:%02d", (localtime)[5] + 1900, (localtime)[4] + 1, (localtime)[3,2,1]);
    # my ($file) = @_;
    # my $suffix = 1;

    # while (-f "$file.$suffix") {
    #     $suffix++;
    # }
    # rename($file, "$file.$suffix");
}
