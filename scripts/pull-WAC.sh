#!/usr/bin/env bash

#
# Pull annotations from the tool-managed directory and save into knp_dir.
#

usage() {
  echo "Usage: $0 knp_dir tool_data_dir"
  echo "e.g., $0 data/WikipediaAnnotatedCorpus/knp data/files"
  exit 1
}

if [[ -z "$1" || ! -d "$1" || -z "$2" || ! -d "$2" ]]; then
  usage
fi
knp_dir=$1
tool_data_dir=$2

for article_set_dir in "$tool_data_dir"/wiki*; do
  [[ ! -d $article_set_dir ]] && continue
  article_set_name="${article_set_dir##*/}"  # basename

  mkdir -p "${knp_dir}/${article_set_name}"

  # process each article
  for article_dir in "$article_set_dir"/*; do
    [[ ! -d $article_dir ]] && continue
    echo "processing ${article_dir} ..."

    article_name="${article_dir##*/}"  # basename

    # obtain memo to check inappropriateness
    if [[ -s $article_dir/annotator_memo ]]; then
      memo="$(nkf -w "${article_dir}/annotator_memo")"
    else
      memo=""
    fi
    inappropriate_str="$(echo "$memo" | grep -E '★|不適')"
    if [[ -n "$inappropriate_str" ]]; then
      echo "${article_name} inappropriate: ${inappropriate_str}"
      echo "${article_name}" >> "${knp_dir}/../id/inappropriate.id"
      continue
    fi

    # merge article knp files, ensuring newline at the end of each file
    awk 1 "$article_dir/contents/${article_name}"* > "${knp_dir}/${article_set_name}/${article_name}.knp"
  done
done
