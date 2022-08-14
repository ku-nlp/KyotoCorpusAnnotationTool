#!/usr/bin/env bash

# $0 KWDLC/knp /mnt/zamia/web_storage/htdocs/annotation/corpus-simple

usage() {
  echo "Usage: $0 knp_dir tool_data_dir"
  echo "e.g., $0 data/KWDLC/knp data/files"
  exit 1
}

scripts_dir=$(dirname -- "$0")
# shellcheck source=scripts/git2gui-common.sh
source "$scripts_dir/git2gui-common.sh"

if [[ -z "$1" || ! -d "$1" || -z "$2" || ! -d "$2" ]]; then
  usage
fi
knp_dir=$1
tool_data_dir=$2

for article_set_dir in "$knp_dir"/w201106-*; do
  article_set_name=$(basename "$article_set_dir")

  # process each article
  for article_knp_file in "$article_set_dir"/*.knp; do
    article_name=$(basename "$article_knp_file" .knp)
    process_article "$article_knp_file" "${tool_data_dir}/${article_set_name}/${article_name}"
  done
done
