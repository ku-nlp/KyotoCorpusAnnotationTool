#!/usr/bin/env perl

# % $0 950101003.knp > 950101003.html

use strict;
use warnings;
use utf8;
use List::Util;
use File::Basename;

binmode STDOUT, ":encoding(utf8)";
binmode STDERR, ":encoding(utf8)";
binmode STDIN, ":encoding(utf8)";

my $article = basename $ARGV[0];
$article =~ s/\/+$//;

open IN, "<:encoding(utf8)", $ARGV[0] or die "Can't open $ARGV[0]: $!";
$/ = "EOS\n";
my @sentences = <IN>;
close IN;

print "<html><head><title>$article</title><meta http-equiv=\"content-type\" content=\"application/html; charset=UTF-8\" /></head>";
print "<link rel=\"stylesheet\" type=\"text/css\" href=\"kc_annotation_per-article.css\" />";
print "<body>";

our %SID2SCOUNT;
my $scount = 0;
for my $sentence (@sentences) {

    my @lines = split /\n/, $sentence;

    print STDERR "$lines[0]\n";

    my $sid;
    my $bnst_total = -1;
    my %dep_parent; # keyの文節の係り先を返す
    my %dep_type;
    my %dep_children; # keyの文節の係り元を返す
    my %bnst2case;
    my %bnst2ne;
    my %morph_h;
    my %bnst_or_tag;
    my $bnst_flag;

    for (@lines) {
        chomp;
        if (/^\#/) {
            if (/^\# S-ID:(\S+)/) {
                $sid = $1;
                $SID2SCOUNT{$sid} = $scount++;
            }
        } elsif (/^\*/) {
            $bnst_flag = 1;
        } elsif (/^\+/) {
            /^[+*] ([-0-9]*)([ADIP])/;
            $dep_parent{++$bnst_total} = $1;
            $dep_type{$bnst_total} = '<span id=deptype>' . $2 . '</span>';
            push @{$dep_children{$1}}, $bnst_total;
            $bnst2case{$bnst_total} = &get_case($_, $sid);
            $bnst2ne{$bnst_total} = &get_NE($_);
            $bnst_or_tag{$bnst_total} = $bnst_flag == 1 ?
                '文節区切り' : 'タグ区切り';
            $bnst_flag = 0;
        } elsif ($_ eq 'EOS') {

        } else {
            push @{$morph_h{$bnst_total}}, [ (split / /)[0, 1, 2, 3, 5, 7, 9] ];
        }
    }

    print "<h2><u>■ S-ID:$sid</u></h2>";

    print "<table>";

    print "<tr><th id=synsemhead>係り受け</th><th id=synsemhead>意味関係</th></tr>";

    for my $myid (sort {$a <=> $b} keys %dep_parent) {
        my $mrph;
        for my $morph_a (@{$morph_h{$myid}}) {
            $mrph .= ${$morph_a}[0];
        }
        #$mrph = "<a href=\"$sent-morph.html#$myid\" target=\"$sent-morph\">".$mrph."</a>";
        $mrph .= "<span id=kakari-keisen>";
        for my $currentid ((1 + $myid) .. $bnst_total) {
            # 自分の親か？
            if ($dep_parent{$myid} == $currentid) {
                # 自分より前の文節の親でもあるか？
                if (List::Util::min(@{$dep_children{$dep_parent{$myid}}}) < $myid) {
                    $mrph .= $dep_type{$myid};
                    #$mrph .= '┫';
                } else {
                    $mrph .= $dep_type{$myid};
                    #$mrph .= '┓';
                }
            }
            # 自分の親はまだ先か？
            elsif ($dep_parent{$myid} > $currentid) {
                # 今の文節は自分より前の文節の親か？
                if (defined $dep_children{$currentid} &&
                    List::Util::min(@{$dep_children{$currentid}}) < $myid) {
                    $mrph .= '<span id=cross>╋</span>';
                } else {
                    $mrph .= '━';
                }
            }
            # 自分の親はもう出たか？
            else {
                #今の文節は自分より前の文節の親か？
                if (defined $dep_children{$currentid} &&
                    List::Util::min(@{$dep_children{$currentid}}) < $myid) {
                    $mrph .= '┃';
                } else {
                    $mrph .= ' ';
                }
            }
        }
        $mrph .= "</span>";
        print "<tr><td id=dep>";
        print $mrph;
        print "</td><td id=sem>";
        print '&nbsp;&nbsp;';
        print $bnst2case{$myid} if defined $bnst2case{$myid} && $bnst2case{$myid} ne '';
        if (defined $bnst2case{$myid} && $bnst2case{$myid} ne ''
            && defined $bnst2ne{$myid} && $bnst2ne{$myid} ne '') {
            print ',&nbsp;';
        }
        print $bnst2ne{$myid} if defined $bnst2ne{$myid} && $bnst2ne{$myid} ne '';
        print '&nbsp;&nbsp;';
        print "</td></tr>";
    }

    print "</table>";

    print "<p />";

    print "<table>";

    print "<tr><th>表出形</th><th>読み</th><th>原形</th><th>品詞</th><th>活用</th></tr>";
    for my $myid (sort {$a <=> $b} keys %morph_h) {
        for my $i (0 .. $#{$morph_h{$myid}}) {
            my $morph_a = ${$morph_h{$myid}}[$i];

            if ($i == 0) {
                print "<tr>";
                print "<td colspan=\"5\" id=";
                print $bnst_or_tag{$myid} eq '文節区切り' ?
                    'bnst-kugiri' : 'tag-kugiri';
                print ">";
                print "<a name=$myid>";
                print $bnst_or_tag{$myid};
                print "</a>";
                print "</td>";
                print "</tr>";
            }

            print "<tr>";
            print "<td id=morphrow>${$morph_a}[0]</td>";
            print "<td id=morphrow>${$morph_a}[1]</td>";
            print "<td id=morphrow>${$morph_a}[2]</td>";
            print "<td id=morphrow>";
            print ${$morph_a}[3] eq '*' ? '' : ${$morph_a}[3];
            print ' ';
            print ${$morph_a}[4] eq '*' ? '' : ${$morph_a}[4];
            print "</td>";
            print "<td id=morphrow>";
            print ${$morph_a}[5] eq '*' ? '' : ${$morph_a}[5];
            print ' ';
            print ${$morph_a}[6] eq '*' ? '' : ${$morph_a}[6];
            print "</td>";
            print "</tr>";
        }
    }
    print "</table>";
}

print "</body></html>";

sub get_case {
    my ($str, $current_sid) = @_;

    my @result_a;
    while ($str =~ /<rel type="([^"]+)"([^>]*)>/g) {
        my $marker = $1;
        my $one_str = $2;
        my ($word, $sid, $id);
        $one_str =~ /target="([^"]+)"/;
        $word = $1;
        if ($one_str =~ /sid="([^"]+)"/) { # 著者・読者はsid, idなし
            $sid = $1;
        }
        if ($one_str =~ / id="([^"]+)"/) {
            $id = $1;
        }

        if (!$sid || $sid eq $current_sid) {
            push @result_a, "<span id=caseword>$word</span>:<span id=casemarker>$marker</span>";
        } else {
            my $dist = abs($SID2SCOUNT{$current_sid} - $SID2SCOUNT{$sid});
            push @result_a, "<span id=caseword>$word</span>:<span id=casemarker>$marker</span>:<span id=caseposition>${dist}文前</span>";
        }
    }

    # メモ
    if ($str =~ /<memo text=\"(.*?)\"/) {
        push @result_a, "<span id=memo>メモ:$1</span>";
    }

    return join(',&nbsp;', @result_a);
}

sub get_NE {
    my $str = shift;
    my @NEs = $str =~ /<NE\:(.+?)>/g;
    my @result_a;
    for my $ne (@NEs) {
        $ne =~ /^(.*?):(.+?)$/;
        my $ne_type = $1;
        my $ne_word = $2;
        die "Unexpected NE: $ne" unless defined $ne_type && defined $ne_word;
        push @result_a, "<span id=neword>$ne_word</span>:<span id=netype>$ne_type</span>";
    }

    return join(',&nbsp;', @result_a);
}
