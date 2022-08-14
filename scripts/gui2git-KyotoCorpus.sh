#!/usr/bin/env bash

# $0 ~kawahara/public_html/annotation/KyotoCorpus

usage() {
  echo "Usage: $0 gui_top_dir"
  echo "e.g., $0 ~/public_html/annotation/KyotoCorpus"
  exit 1
}

if [[ -z "$1" || ! -d "$1/data/files" ]]; then
  usage
fi
gui_data_dir=$1/data/files

scripts_dir=$(echo "$0" | xargs dirname)
manage_pl=$scripts_dir/manage.pl
corpus_conv_pl=$scripts_dir/corpus_conv.pl

mkdir -p knp
cd knp || exit 1

for set_dir in $gui_data_dir/95*; do
  if [[ -d "$set_dir" ]]; then
    set_id=$(basename $set_dir)
    : > $set_id.knp
    for aid_full in $set_dir/*; do
      if [[ -d $aid_full ]]; then
        aid=$(basename "$aid_full")
        tar zxf $aid_full/$aid.tar.gz
        perl $manage_pl $aid + > /dev/null

        echo $aid
        cat $aid.knp >> $set_id.knp
        rm -rf $aid $aid.knp
      fi
    done
  fi
done
cd ..

# For KyotoCorpus without Mainichi CD-ROM
mkdir -p num

for f in knp/*.knp; do
  base=$(basename $f .knp)
  echo $base
  perl $corpus_conv_pl num_w_id < $f > num/$base.num
done

echo 'Do "cp -f knp/95*.knp /somewhere/KyotoCorpusFull/knp"'
echo 'and "cp -f num/95*.num /somewhere/KyotoCorpus/dat/num"'
