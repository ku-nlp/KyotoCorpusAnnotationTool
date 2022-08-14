#!/usr/bin/env bash

# $0 KyotoCorpusFull/knp ~kawahara/public_html/annotation/KyotoCorpus

usage() {
  echo "Usage: $0 knp_dir gui_top_dir"
  echo "e.g., $0 KyotoCorpusFull/knp ~/public_html/annotation/KyotoCorpus"
  exit 1
}

scripts_dir=$(dirname -- "$0")
split_article=$scripts_dir/split-article.perl
source "$scripts_dir/git2gui-common.sh"

if [[ -z "$1" || ! -d "$1" || -z "$2" || ! -d "$2/data/files" ]]; then
  usage
fi
knp_dir=$1
gui_data_dir=$2/data/files
orig_dir=$(pwd)

for knp_file in $knp_dir/*.knp; do
  knp_file_abs_path=$(readlink -f $knp_file)

  echo "processing $knp_file ..."
  set_dir_name=$(basename $knp_file .knp)
  mkdir $set_dir_name
  cd "$set_dir_name" || continue

  # split a knp file to articles
  perl $split_article $knp_file_abs_path

  # process each article
  for article_knp_file in *.knp; do
    process_article $scripts_dir/manage.pl $article_knp_file $gui_data_dir/$set_dir_name
  done

  cd $orig_dir || exit 1
  rm -rf $set_dir_name
done
