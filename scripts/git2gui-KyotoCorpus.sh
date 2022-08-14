#!/usr/bin/env bash

# $0 KyotoCorpusFull/knp ~kawahara/public_html/annotation/KyotoCorpus

usage() {
  echo "Usage: $0 knp_dir tool_data_dir"
  echo "e.g., $0 data/KyotoCorpusFull/knp data/files"
  exit 1
}

if [[ -z "$1" || ! -d "$1" || -z "$2" || ! -d "$2" ]]; then
  usage
fi
knp_dir=$1
tool_data_dir=$2

scripts_dir=$(dirname -- "$0")
# shellcheck source=scripts/git2gui-common.sh
source "$scripts_dir/git2gui-common.sh"

orig_dir=$(pwd)

for knp_file in "$knp_dir"/*.knp; do
  echo "processing $knp_file ..."

  article_set_name="$(basename "$knp_file" .knp)"

  temp_dir="$(mktemp -d --suffix "$article_set_name")"
  cd "$temp_dir" || continue
  # split a knp file to articles into currento directory
  perl "$scripts_dir/split-article.perl" "$(readlink -f "$knp_file")"
  cd "$orig_dir" || continue

  # process each article
  for article_knp_file in "$temp_dir"/*.knp; do
    article_name=$(basename "$article_knp_file" .knp)
    process_article "$article_knp_file" "${tool_data_dir}/${article_set_name}/${article_name}"
  done
done
