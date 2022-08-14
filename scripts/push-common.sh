#!/usr/bin/env bash

date_for_backup=$(date +%Y%m%d%H%M)
date_for_dirinfo=$(date "+%Y-%m-%d %H:%M")

scripts_dir=$(dirname -- "$0")

process_article() {
  article_knp_file=$1
  dest_dir=$2

  echo "processing $article_knp_file ..."

  mkdir -p "$dest_dir"
  contents_dir="$dest_dir/contents"
  dirinfo_file="$dest_dir/dirinfo"

  # make a backup
  if [[ -d "$contents_dir" ]]; then
    mv "$contents_dir" "${contents_dir}.${date_for_backup}_system"
  fi

  # split an article to sentences and make "fileinfos (output is a dir)"
  python3 "$scripts_dir/manage.py" --knp-file "$article_knp_file" --contents-dir "$contents_dir"
  # update dirinfo
  echo "system	$date_for_dirinfo" > "${dirinfo_file}.new"
  if [[ -f "$dirinfo_file" ]]; then
    cat "$dirinfo_file" >> "${dirinfo_file}.new"
    mv "$dirinfo_file" "${dirinfo_file}.$date_for_backup"
  fi
  mv "${dirinfo_file}.new" "$dirinfo_file"
}
