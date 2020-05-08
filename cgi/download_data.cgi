#!/usr/bin/env perl

use strict;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use File::Path;
use File::Copy;
use Archive::Tar;

my $tar = Archive::Tar->new;

# ファイルを置くルートディレクトリの設定
our ($rootdir, $ext);
require './cgi.conf';

my $cgi = new CGI;
my $article_id = $cgi->param('article_id');
my $corpus_set_id = $cgi->param('corpus_set_id');
$rootdir .= "/$corpus_set_id";
my $filename = "$article_id.$ext";
my $filedir = "$rootdir/$article_id/";
my $filepath = "$rootdir/$article_id/$filename";
my $fileinfo = "fileinfos";
my $dirinfo = "dirinfo";

# 作業者をチェック
my ($annotator_id);
if ($cgi->param('annotator_id')) {
    $annotator_id = $cgi->param('annotator_id');

    # ヘッダー出力
    print $cgi->header({type => 'text/xml', charset => 'utf-8', expires => '-1d'});
    print "<result>";

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
        # print "<lockuser>$buf[0]</lockuser>\n";
        open(INFO, "> $infoname");
        print INFO "\* $annotator_id\t$date\n";
        for my $line (@buf) {
            print INFO $line;
        }
        close(INFO);

        # annotator以外のユーザがロックしている
    } elsif ($buf[0] !~ /^\* $annotator_id\s+/) {
        my $error_message = "別のユーザーによってロックされています。";
        &default_page($error_message);
    }

} else {
    my $error_message = "annotator_idが指定されていません";
    &default_page($error_message);
}

unless (-f $filepath) {
    my $error_message = "$filepathが見つかりません。";
    &default_page($error_message);
}

# バックアップファイル作成
if ($cgi->param('backupFlag')) {
    my $backupFlag = $cgi->param('backupFlag');
    if($backupFlag == 1) {
        &save_old_file($filepath, $annotator_id);
    }
}


# read
$tar->setcwd($filedir);
unless ($tar->read($filepath)) {
    my $error_message = "$filepathが読み込めません。";
    &default_page($error_message);
}

# 読み込み対象のファイルの内容を返却
my $info = $tar->get_content("$article_id/$fileinfo");
for (split /^/, $info) {
    if($_ =~ /# S-ID:(\S+)/) {
        # archiveからフィイル内容取得
        my $content = $tar->get_content("$article_id/$1");
        print "<file>";
        print "<id>$1</id><data>";
        print $cgi->escapeHTML($content);
        print "</data></file>";
    }
}
close(F);
print "</result>";
exit 1;

sub default_page {
    my ($error_message) = @_;
    die("$error_message\n");
}

sub save_old_file {
    my $date = sprintf("%d%02d%02d%02d%02d", (localtime)[5] + 1900, (localtime)[4] + 1, (localtime)[3,2,1]);
    my ($file, $annotator_id) = @_;
    my $suffix = "$date" . "_" . "$annotator_id";
    my $prefix = $file;
    $prefix =~ s/.$ext//;
    my $new_file = "$prefix.$suffix.$ext";
    copy($file, $new_file);
}
