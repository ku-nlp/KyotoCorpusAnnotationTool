#!/usr/bin/env bash

# pull annotations from the tool-managed directory and save into knp_dir

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

for article_set_dir in "$tool_data_dir"/w201106-*; do
  [[ ! -d $article_set_dir ]] && continue
  article_set_name="${article_set_dir##*/}"  # basename

  # w201106-00022 and w201106-00025 are not annotated
  if [[ $article_set_name = "w201106-00022" || $article_set_name = "w201106-00025" ]]; then
    continue
  fi
  mkdir -p "${knp_dir}/${article_set_name}"

  # process each article
  for article_dir in "$article_set_dir"/*; do
    [[ ! -d $article_dir ]] && continue
    echo "processing $article_dir ..."

    article_name="${article_dir##*/}"  # basename

    # obtain memo to check inappropriateness
    if [[ -s "$article_dir/annotator_memo" ]]; then
      memo="$(nkf -w "$article_dir/annotator_memo")"
    else
      memo=""
    fi
    inappropriate_str="$(echo "$memo" | grep -E '★|不適')"
    if [[ -n "$inappropriate_str" ]]; then
      echo "$article_name inappropriate: $inappropriate_str"
      continue
    fi

    # merge article knp files
    cat "$article_dir/contents/${article_name}"* > "${knp_dir}/${article_set_name}/${article_name}.knp"
  done
done
