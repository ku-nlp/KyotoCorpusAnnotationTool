#!/usr/bin/env bash

#
# Pull annotations from the tool-managed directory and save into knp_dir.
#

usage() {
  echo "Usage: $0 knp_dir tool_data_dir"
  echo "e.g., $0 data/KyotoCorpus/knp data/files"
  exit 1
}

if [[ -z "$1" || ! -d "$1" || -z "$2" || ! -d "$2" ]]; then
  usage
fi
knp_dir=$1
tool_data_dir=$2
dat_dir=$3

scripts_dir=$(dirname -- "$0")

for article_set_dir in "$tool_data_dir"/95*; do
  [[ ! -d $article_set_dir ]] && continue
  article_set_name="${article_set_dir##*/}"  # basename

  knp_file="${knp_dir}/${article_set_name}.knp"
  : > "$knp_file"
  for article_dir in "$article_set_dir"/*; do
    [[ ! -d $article_dir ]] && continue
    article_name="${article_dir##*/}"  # basename

    # merge article knp files, ensuring newline at the end of each file
    awk 1 "$article_dir/contents/${article_name}"* >> "$knp_file"
  done
done

# For KyotoCorpus without Mainichi CD-ROM
if [[ -n $dat_dir ]]; then
  for f in "$knp_dir"/*.knp; do
    base=$(basename "$f" .knp)
    echo "$base"
    perl "$scripts_dir/corpus_conv.pl" num_w_id < "$f" > "$dat_dir/num/$base.num"
  done
fi
