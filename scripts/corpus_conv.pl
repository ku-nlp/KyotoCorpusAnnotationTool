#!/usr/bin/env perl

use utf8;
binmode(STDIN, ':encoding(utf8)');
binmode(STDOUT, ':encoding(utf8)');

# コーパスのformat変換
#
# $i.knp : 文節番号なし，形態素内部コードあり
# $i.KNP : feature(<..>)なし，文節番号あり，形態素内部コードなし
#          文ID以外の削除，カタカナ読み変換，活用なしの場合の原型削除
#                          (ヴ，ヵ，ヶは残る)
# $i.num : KNPに加えて，位置情報への変換
#
# Usage: corpus_conv.pl KNP < $i.knp > $i.KNP
#        corpus_conv.pl num < $i.knp > $i.num
#        corpus_conv.pl num_w_id < $i.knp > $i.num (形態素内部コードあり)
#        corpus_conv.pl knp < $i.KNP > $i.knp

$POS = "/path/to/pos.dat";
$CONJ = "/pas/to/conj.dat";

if (@ARGV == 0 || $ARGV[0] !~ /KNP|num|knp/) {
    die "Invalide option";
}
$dir = $ARGV[0];

# 品詞，活用の読み込み

if ($dir eq "knp") {

    open(POS, $POS) || die "Cannot open POS.\n";
    $i = 1;
    while ( <POS> ) {
	chomp;
	@tmp = split;
	$pos{$tmp[0]} = $i++;
	if ($#tmp >= 1) {
	    for($j = 1; $j <= $#tmp; $j++) {
		$pos2{$tmp[$j]} = $j;
	    }
	}
    }
    close(POS);

    open(CONJ, $CONJ) || die "Cannot open CONJ.\n";
    $i = 1;
    while ( <CONJ> ) {
	chomp;
	@tmp = split;
	$conj{$tmp[0]} = $i++;
	if($#tmp >= 1) {
	    for($j = 1; $j <= $#tmp; $j++) {
		$tmp[$j] =~ /^(.+)\(.*\)$/;
		$conj2{"$tmp[0]:$1"} = $j;
	    }
	}
    }
    close(CONJ);
}

$pos{'*'} = 0;
$pos2{'*'} = 0;
$conj{'*'} = 0;
$conj2{'*'} = 0;

# 各文のformat変換

$line = 1;

while( <STDIN> ){
    if(/^(\# S-ID:[\d\-]+)/){
	# if ($dir ne "knp") {
	#     $_ = "$1\n";
	# }
	print;
	$count{'*'} = 0;
	$count{'+'} = 0;
	$pos_count = 0;
    }
    elsif(/^EOS/){
	print;
    }
    elsif($dir ne "knp" &&  /^([\*\+]) (-?\d+[DPIA])\s?(.*)\n$/) {
	print "$1 $count{$1} $2";
	$count{$1} ++;
	my $rel_str = $3;
	$rel_str =~ s/<NE[:-][^>]+>//g; # currently, delete NE tags
	print " $rel_str" if $rel_str;
	print "\n";
    }
    elsif($dir eq "knp" &&  /^([\*\+]) (\d+) (-?\d+[DPIA])\s?(.*)\n$/) {
	print "$1 $3\n";
	$count{$1} ++;
    }
    elsif ($dir ne "knp") {
	chomp;
	@list = split;
	$list[1] =~ tr/ァ-ン/ぁ-ん/;
	$list[2] = "*" if ($list[7] eq "*");

	# 意味情報は品詞変更のみ残す
	if ($list[11] =~ /^\"品詞変更:/) {
	    $list[11] = ' ' . $list[11];
	}
	else {
	    $list[11] = '';
	}

	if ($dir eq "num") {
	    printf("%d-%d %s %s %s %s %s %s%s\n",
		   $pos_count, length($list[0]),
		   $list[1],
		   $list[2],
		   $list[3],
		   $list[5],
		   $list[7],
		   $list[9],
		   $list[11]);
	    $pos_count += length($list[0]);
	} elsif ($dir eq "num_w_id") {
	    printf("%d-%d %s %s %s %s %s %s %s %s %s %s%s\n",
		   $pos_count, length($list[0]),
		   @list[1..11]);
	    $pos_count += length($list[0]);
	} elsif ($dir eq "KNP") {
	    printf("%s %s %s %s %s %s %s\n",
		   $list[0],
		   $list[1],
		   $list[2],
		   $list[3],
		   $list[5],
		   $list[7],
		   $list[9]);
	}
    }
    elsif ($dir eq "knp") {
	chomp;
	@list = split;

	$list[2] = $list[0] if ($list[2] eq "*");

	print STDERR "Data Error(pos).($line:$_)\n"
	    unless defined($pos{$list[3]});
	splice(@list, 4, 0, $pos{$list[3]});
	print STDERR "Data Error(pos2).($line:$_)\n"
	    unless defined($pos2{$list[5]});
	splice(@list, 6, 0, $pos2{$list[5]});
	print STDERR "Data Error(conj).($line:$_)\n"
	    unless defined($conj{$list[7]});
	splice(@list, 8, 0, $conj{$list[7]});

	if ($list[9] eq '*') {
	    splice(@list, 10, 0, '0');
	}
	else{
	    $tmp = "$list[7]:$list[9]";
	    print STDERR "Data Error(conj2).$tmp($line:$_)\n"
		unless defined($conj2{$tmp});
	    splice(@list, 10, 0, $conj2{$tmp});
	}
	print "@list\n";
    }
    $line++;
}
