#!/usr/bin/env bash

#
# Push corpus directory contents to the tool-managed directory.
#

usage() {
  echo "Usage: $0 knp_dir tool_data_dir"
  echo "e.g., $0 data/KWDLC/knp data/files"
  exit 1
}

if [[ -z "$1" || ! -d "$1" || -z "$2" || ! -d "$2" ]]; then
  usage
fi
knp_dir=$1
tool_data_dir=$2

scripts_dir="$(readlink -f "$(dirname -- "$0")")"
# shellcheck source=scripts/push-common.sh
source "$scripts_dir/push-common.sh"

for article_set_dir in "$knp_dir"/wiki*; do
  article_set_name="${article_set_dir##*/}"  # basename

  # process each article
  for article_knp_file in "$article_set_dir"/*.knp; do
    article_name=$(basename "$article_knp_file" .knp)
    process_article "$article_knp_file" "${tool_data_dir}/${article_set_name}/${article_name}"
  done
done
