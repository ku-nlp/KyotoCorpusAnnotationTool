#!/usr/bin/env perl

# KNP解析結果を文単位に分割と，その管理ファイル(fileinfos)の作成

# 引数が file の場合 : 1. (なければ)directoryの作成，directory内消去
#		       2. その中へのファイル分割，
# 		       3. fileinfosの作成
#
# 引数が directory + の場合 : directory内のファイルをまとめて .knp に
#
# 引数が directory の場合 : fileinfosの更新

@fileinfos = ();

# 引数がfileの場合

if (-f $ARGV[0] && $ARGV[0] =~ /([^\/\\]+)\.knp.*$/) {

    $dir = $1;
    if (-d $dir) {
	unlink(glob("$dir/*"));
    } else {
	mkdir($dir, 0755);
    }

    open(INPUT, $ARGV[0]); 
    while ( <INPUT> ) {

	if (/^# S\-ID:([^ ]+)/) {
	    $file_name = $1;
	    open(OUTPUT, "> $dir/$file_name") || die;
            print OUTPUT;
	} elsif (/^EOS/) {
            print OUTPUT;
	    close(OUTPUT);
	} elsif (/^;;/) {
	    ; # 種々のエラーメッセージは取り除く
	} else {
	    print OUTPUT;
	}
    }
    close(INPUT);
}

# 引数がdirectoryの場合 : ファイルのまとめ，またはfileinfosの更新

elsif (-d $ARGV[0]) {

    $dir = $ARGV[0];

    if ($ARGV[1] eq '+') {
	$merge_p = 1;
	$ARGV[0] =~ /([^\/\\]+)(\/)?$/;
	open(OUT, "> $1.knp");
    } else {
	$merge_p = 0;
    }
}

else {
    die;
}

# fileinfosの更新

$file_num = 0;
opendir(DIR, $dir);
foreach $file_name (&make_list()) {
    open(FILE, "$dir/$file_name");

    if ($merge_p) {
	while ( <FILE> ) {
	    $_ .= "\n" unless /\n$/;
	    print OUT;
	}
    }

    $_ = <FILE>;
    close(FILE);

    $fileinfos[$file_num] = $_;
    $file_num++;
}

if ($merge_p) {
    close(OUT);
} else {
    open(FILEINFOS, "> $dir/fileinfos");
    for ($i = 0; $i < $file_num; $i++) {
	print FILEINFOS $fileinfos[$i];
    }
    close(FILEINFOS);
}

# sub extract_sid {
#     my ($sid) = @_;

#     #my ($id) = ($sid =~ /(\d+)$/);
#     my ($id) = ($sid =~ /(\d+?)-\d+$/);
#     return $id;
# }

# sub extract_pid {
#     my ($pid) = @_;

#     my ($id) = ($pid =~ /(\d+)$/);
#     return $id;
# }

sub make_list {
    my (@list);

    for my $file_name (readdir(DIR)) {
	next if ($file_name !~ /[0-9\-]$/);
	next if ($file_name eq 'fileinfos');
	next if ($file_name =~ /tar\.gz/);
	push(@list, $file_name);
    }

    return sort({&extract_sid($a) <=> &extract_sid($b) or
					 &extract_pid($a) <=> &extract_pid($b) or 
					 &extract_tid($a) <=> &extract_tid($b)} @list);
}

sub extract_sid {
    my ($sid) = @_;

    #my ($id) = ($sid =~ /(\d+)$/);
    my ($id_1,$id_2,$id_3) = ($sid =~ /(?:(\d+)-)?(\d+?)-(\d+)$/);
	if($id_3 =~ /^0/ && $id_1)
	{
		return $id_1;
	}
	else
	{
		return $id_2;
	}
}


sub extract_pid {
    my ($pid) = @_;
    my ($id_1,$id_2,$id_3) = ($pid =~ /(?:(\d+)-)?(\d+?)-(\d+)$/);
	if($id_3 =~ /^0/ && $id_1)
	{
		return $id_2;
	}
	else
	{
		return $id_3;
	}
}


sub extract_tid {
    my ($pid) = @_;
    my ($id_1,$id_2,$id_3) = ($pid =~ /(?:(\d+)-)?(\d+?)-(\d+)$/);
	if($id_3 =~ /^0/ && $id_1)
	{
		return $id_3;
	}
	else
	{
		return 0;
	}

}
