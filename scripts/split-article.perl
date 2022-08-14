#!/usr/bin/env perl

use Getopt::Long;
use vars qw(%opt);
use strict;

GetOptions(\%opt, 'ext=s', 'sentence', 'parenthesis');

my $ext = $opt{ext} ? $opt{ext} : 'knp';
my ($aid, $preaid);

while (<>) {
    if (/^\# S-ID: ?(\S+)/) {
	my $sid = $1;
	$sid =~ s/-0\d$// if $opt{parenthesis};
	print $sid, "\n";
	if ($sid =~ /^(.+)-(\d+)$/) {
	    $aid = $1;
	    my $snum = $2;
	    if ($preaid ne $aid or $opt{sentence}) {
		close(DAT) if defined($preaid);
		open(DAT, sprintf("> %s.%s", $opt{sentence} ? "$aid-$snum" : $aid, $ext)) or die;
		$preaid = $aid;
	    }
	}
    }
    print DAT;
}

close(DAT) if defined($preaid);
