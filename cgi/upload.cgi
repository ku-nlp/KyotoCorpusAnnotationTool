#!/usr/bin/env perl

use strict;
use CGI;

# ファイルを置くルートディレクトリの設定
our ($rootdir, $ext);
require './cgi.conf';

my $cgi = new CGI;

# CGIヘッダの出力
print $cgi->header({type => 'text/html', charset => 'euc-jp', expires => '-1d'});
print $cgi->start_html({title => '記事データ アップロード', lang => 'ja', encoding => 'euc-jp'});

# 記事IDをチェック
my ($article_id);
if ($cgi->param('article_id')) {
    $article_id = $cgi->param('article_id');
}

# 作業者をチェック
my ($annotator_id, $password);
if ($cgi->param('annotator_id')) {
    $annotator_id = $cgi->param('annotator_id');
    $password = $cgi->param('password');
}


# ファイル名
my ($filename);
if ($cgi->param('upfile')) {
    $filename = $cgi->param('upfile');
}

unless ($article_id && $annotator_id && $filename) {
    # print "<p>記事IDを入力してください。</p>\n";
    # print "<p>名前を入力してください。</p>\n";
    &default_page();
    exit 1;
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
    print "<p>あなたはアップロードできません。</p>\n";
    &default_page();
    exit 1;
}

# アップロードされたファイルの情報を取得する
my ($fh);
unless ($fh = $cgi->upload('upfile')) {      # ファイルハンドル
    print "<p>提出するファイルを選んでください。</p>\n";
    &default_page();
    exit 1;
}

my $filepath = "$rootdir/$article_id/$article_id.$ext-$$";
my $filetype = $cgi->uploadInfo($filename)->{'Content-Type'};

# ファイルを書き出す
unless (open OUT, "> $filepath") {
    print "<p>ファイルを処理中にエラーが発生しました。</p>\n",
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
    print "<p>ファイルが読み込めませんでした。</p>\n",
	$cgi->end_html;
    exit 1;
}

# 成功

# 記事情報を更新
open(INFO, "> $infoname");
my $date = sprintf("%d-%02d-%02d %02d:%02d", (localtime)[5] + 1900, (localtime)[4] + 1, (localtime)[3,2,1]);
print INFO "$annotator_id\t$date\n";
for my $line (@buf) {
    print INFO $line;
}
close(INFO);

# 本書き込み
my $last_filepath = "$rootdir/$article_id/$article_id.$ext";
&save_old_file($last_filepath);
rename($filepath, $last_filepath);

print <<EOF;
<h3>記事データを受け付けました。</h3>
<ul>
 <li> 名前: $annotator_id
 <li> 記事番号: $article_id
 <li> 受付日時: $date
 <li> ファイル名: $filename ($size bytes)
</ul>
EOF

print qq(<form method=POST action="list.cgi">\n);
print qq(<input type="hidden" name="annotator_id" value="$annotator_id">\n);
print qq(<input type="hidden" name="password" value="$password">\n);
print qq(<tr><th></th><td><input type="submit" value="戻る"></td></tr>\n);
print qq(</form>\n);
print $cgi->end_html;


sub default_page {
    print qq(<h3>記事データのアップロード</h3><br>\n);
    print qq(<form method=POST enctype="multipart/form-data" action="upload.cgi">\n);
    print qq(<input type="hidden" name="password" value="$password">\n);
    print qq(<table>\n);
    print qq(<tr><th align=left>名前</th><td><input name="annotator_id" value="$annotator_id" size="10"></td></tr>\n);
    print qq(<tr><th align=left>記事ID</th><td><input name="article_id" value="$article_id" size="30"></td></tr>\n);
    print qq(<tr><th align=left>ファイル</th><td><input name="upfile" type="file" size="60"></td></tr>\n);
    print qq(<tr><th></th><td><input type="submit" value="送信"></td></tr>\n);
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
