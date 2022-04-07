#!/usr/bin/env bash

scripts_dir=$(dirname "$0")
echo "$scripts_dir" | grep -q '^/' 2> /dev/null > /dev/null
if [[ $? -ne 0 ]]; then
    scripts_dir="$(pwd)/$scripts_dir"
fi

usage() {
    echo "$0 input.txt"
    exit 1
}

in=$1

if [[ ! -f $in ]]; then
    usage
fi

base=$(basename "$in" .txt)
basedir=$(dirname "$in")
if [[ ! -f "$basedir/$base.txt" ]]; then
    usage
fi

cat "$in" | juman -i \# | knp -tab -anaphora -ne-crf -process-paren | perl $scripts_dir/case-structure2rel.perl > $base.knp
perl "${scripts_dir}/../cgi/manage.pl" "$base.knp"

tar zcf "$base.tar.gz" "$base"
rm -rf "$base"
rm -f "$base.knp"

mkdir -p "$base"

mv -f "$base.tar.gz" "$base"
date=$(date +%Y-%m-%d)
echo "$USER	$date 00:00" > "$base/dirinfo"
