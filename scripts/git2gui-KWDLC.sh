#!/usr/bin/env bash

# $0 KWDLC/knp /mnt/zamia/web_storage/htdocs/annotation/corpus-simple

usage() {
  echo "Usage: $0 knp_dir gui_top_dir"
  echo "e.g., $0 KWDLC/knp ~/public_html/annotation/KWDLC"
  exit 1
}

scripts_dir=$(dirname -- "$0")
# shellcheck source=scripts/git2gui-common.sh
source "$scripts_dir/git2gui-common.sh"

if [[ -z "$1" || ! -d "$1" || -z "$2" || ! -d "$2/data/files" ]]; then
  usage
fi
knp_dir=$1
gui_data_dir=$2/data/files
orig_dir=$(pwd)

for set_dir_path in $knp_dir/w201106-*; do
  set_dir_name=$(basename $set_dir_path)
  cd "$set_dir_path" || continue

  # process each article
  for article_knp_file in *.knp; do
    process_article $scripts_dir/manage.pl $article_knp_file $gui_data_dir/$set_dir_name
  done
  cd "$orig_dir" || exit 1
done
