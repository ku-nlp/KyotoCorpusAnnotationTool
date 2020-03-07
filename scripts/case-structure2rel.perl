#!/usr/bin/env perl

# KNPの格解析結果(-anaphora)から新アノテーションツールの書式に変換する
# knp -caseを使う場合は --case をつける

use strict;
use Getopt::Long;

our (%opt);
&GetOptions(\%opt, 'case');

our %CaseTransTable = (
	  'ヲメグル' => 'ヲメグッテ', 
	  'ヲツウズル' => 'ヲツウジテ', 
	  'ヲツウジル' => 'ヲツウジテ', 
	  'ヲフクメル' => 'ヲフクメテ', 
	  'ニカラム' => 'ニカランデ', 
	  'ニソウ' => 'ニソッテ', 
	  'ニムケル' => 'ニムケテ', 
	  'ニトモナウ' => 'ニトモナッテ', 
	  'ニモトヅク' => 'ニモトヅイテ', 
	  'ヲノゾク' => 'ヲノゾイテ', 
	  'ニヨル' => 'ニヨッテ', 
	  'ニタイスル' => 'ニタイシテ', 
	  'ニカワル' => 'ニカワッテ', 
	  'ニオク' => 'ニオイテ', 
	  'ニツク' => 'ニツイテ', 
	  'ニトル' => 'ニトッテ', 
	  'ニクワエル' => 'ニクワエテ', 
	  'ニカギル' => 'ニカギッテ', 
	  'ニツヅク' => 'ニツヅイテ', 
	  'ニアワセル' => 'ニアワセテ', 
	  'ニクラベル' => 'ニクラベテ', 
	  'ニナラブ' => 'ニナランデ', 
	  'トスル' => 'トシテ', 
	  'ニヨルヌ' => 'ニヨラズ', 
	  'ニカギルヌ' => 'ニカギラズ', 
	  'ニスル' => 'ニシテ'
	 );

my ($sid, @sids, @eids, @lines, %sid2count, %t_id2str);
my $scount = 0;
my $tcount = 0;
while (<STDIN>) {
    if (/^\# S-ID:([^ :]+)/) {
	$sid = $1;
	unshift(@sids, $sid);
	$sid2count{$sid} = $scount;
	print;
	$tcount = 0;
	$scount++;
	@lines = ();
    }
    elsif (/^EO[SP]/) {
	$tcount = 0;
	for my $line (@lines) {
	    if ($line =~ /^\+/) {
		&process_tag_line($line);
		$tcount++;
	    }
	    else {
		print $line;
	    }
	}
	print "EOS\n";
    }
    elsif (/^\+/) {
	if (/<EID:(\d+)>/) {
	    push(@{$eids[$1]}, {sid => $sid, t_id => $tcount});
	}
	$tcount++;
	push(@lines, $_);
    }
    elsif (/^\*/) {
	push(@lines, $_);
    }
    else { # 形態素行
	if (/<(?:準)?内容語>/) {
	    $t_id2str{$sid}{$tcount - 1} = (split(' ', $_))[0];
	    # printf STDERR "sid=%s tcount=%s: %s\n", $sid, $tcount - 1, $t_id2str{$sid}{$tcount - 1};
	}
	push(@lines, $_);
    }
}


sub get_id_from_eid {
    my ($eid, $sid, $in_t_id, $in_t_sid_diff, $current_t_id) = @_;

    if ($eids[$eid]) { # 近いmentionからidをとる
	my $i = scalar(@{$eids[$eid]}) - 1;
	while ($i >= 0) {
	    if (defined($current_t_id) && $eids[$eid][$i]{sid} eq $sid && $eids[$eid][$i]{t_id} == $current_t_id) { # 自分自身ではない (for coreference)
		;
	    }
	    else {
		return ($eids[$eid][$i]{t_id}, $sid2count{$sid} - $sid2count{$eids[$eid][$i]{sid}});
	    }
	    $i--;
	}
	die "Error occurs for EID:$eid in $sid!";
    }
    else {
	return ($in_t_id, $in_t_sid_diff);
    }
}

sub process_tag_line {
    my ($line) = @_;

    chomp($line);
    my $addf;

    # 格解析結果
    if ($line =~ /<格解析結果:[^:>]+:[^:>]+:([^>]+)/) {
	my $str = $1;
	my %added_types;
	for my $fstr (split(';', $str)) {
	    my @list = split('/', $fstr);
	    if ($list[1] ne 'U' && $list[1] ne '-') {
		my ($type, $target, $t_id, $t_sid, $t_sid_diff, $eid);
		if ($opt{case}) {
		    ($type, $target, $t_id, $t_sid) = ($list[0], $list[2], $list[3], $list[5]); # -case用
		}
		else {
		    ($type, $target, $t_id, $t_sid_diff, $eid) = ($list[0], $list[2], $list[4], $list[3], $list[5]); # -anaphora用
		    next if $target eq '補文'; # 補文を削除
		    next if $type eq '修飾'; # 用言に対する修飾を削除
		    ($t_id, $t_sid_diff) = &get_id_from_eid($eid, $sid, $t_id, $t_sid_diff);
		    $t_sid = $sids[$t_sid_diff];
		    if ($t_id >= 0) {
			if (exists($t_id2str{$t_sid}{$t_id})) { # 文字列を取得 (格解析結果は複合名詞になっているため)
			    $target = $t_id2str{$t_sid}{$t_id};
			}
			else {
			    warn "Error in t_id2str: t_sid=$t_sid, t_id=$t_id\n";
			}
			# if ($target =~ /^[A-Z]+:(.+)/) { # 「DAT:始期日」などからNEタグを削除
			#     $target = $1;
			# }
			# $target =~ s/\|(?:著者|読者|一人称|二人称)$//; # 著者読者表現につく「|著者」などを削除
		    }
		    else {
			$target = '不特定:状況' if $target eq '不特定-その他'; # 不特定-その他 -> 不特定:状況
			$target = '不特定:人' if $target eq '不特定-人'; # 不特定-人 -> 不特定:人
		    }
		}

		if (exists($CaseTransTable{$type})) { # 複合辞の変換
		    print STDERR "OK $type -> ";
		    $type = $CaseTransTable{$type};
		    print STDERR "$type\n";
		}

		if ($added_types{$type} > 0) { # 同一の格が二つ以上ある場合
		    # print STDERR "OK duplicated type: $type\n";
		    $addf .= &sprint_rel($type, $target, $t_sid, $t_id, 1);
		}
		else {
		    $addf .= &sprint_rel($type, $target, $t_sid, $t_id, 0);
		}
		$added_types{$type}++;
	    }
	}
    }

    # 共参照
    if ($line =~ /<COREFER_ID:/) {
	if ($line =~ /<EID:(\d+)>/) {
	    my $eid = $1;
	    my ($target, $t_id, $t_sid_diff);
	    if ($line =~ /<C用;【(.+?)】/) { # 文字列を得る (初出で同一文内にcoreferしている場合は、これがない(COREFER_IDはある))
		$target = $1;

		if ($line =~ /<REFERRED:(\d+)-(\d+)/) { # REFERREDをみる
		    $t_sid_diff = $1;
		    $t_id = $2;
		}
		else {	# REFERREDがなければEIDから
		    ($t_id, $t_sid_diff) = &get_id_from_eid($eid, $sid, $t_id, $t_sid_diff, $tcount);
		}
		my $t_sid = $sids[$t_sid_diff];

		if (exists($t_id2str{$t_sid}{$t_id})) { # 文字列を取得 (格解析結果は複合名詞になっているため)
		    $target = $t_id2str{$t_sid}{$t_id};
		}
		else {
		    warn "Error in t_id2str: t_sid=$t_sid, t_id=$t_id\n";
		}

		$addf .= &sprint_rel('=', $target, $t_sid, $t_id);
	    }
	}
    }

    print $line, $addf, "\n";
}

sub sprint_rel {
    my ($type, $target, $t_sid, $t_id, $dup_mode) = @_;

    if ($dup_mode) {
	if ($t_id >= 0) {
	    return sprintf(qq(<rel type="%s" mode="AND" target="%s" sid="%s" id="%d"/>), $type, $target, $t_sid, $t_id);
	}
	else {
	    return sprintf(qq(<rel type="%s" mode="AND" target="%s"/>), $type, $target);
	}
    }
    else {
	if ($t_id >= 0) {
	    return sprintf(qq(<rel type="%s" target="%s" sid="%s" id="%d"/>), $type, $target, $t_sid, $t_id);
	}
	else {
	    return sprintf(qq(<rel type="%s" target="%s"/>), $type, $target);
	}
    }
}
