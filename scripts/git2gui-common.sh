#!/usr/bin/env bash

date_for_backup=$(date +%Y%m%d%H%M)
date_for_dirinfo=$(date "+%Y-%m-%d %H:%M")

process_article() {
  manage_pl=$1
  article_knp_file=$2
  dest_dir_top=$3

  echo "processing $article_knp_file ..."

  # split an article to sentences and make "fileinfos (output is a dir)"
  perl "$manage_pl" "$article_knp_file"
  article_dir_name=$(basename "$article_knp_file" .knp)

  if [[ -d "$article_dir_name" ]]; then
    dest_dir=$dest_dir_top/$article_dir_name
    if [ ! -d "$dest_dir" ]; then
      echo "Not found: $dest_dir"
      return
    fi

    # make a backup
    if [[ -f "$dest_dir/$article_dir_name.tar.gz" ]]; then
      mv "$dest_dir/$article_dir_name.tar.gz" "$dest_dir/$article_dir_name.${date_for_backup}_system.tar.gz"
    fi

    # make a tarball of the article
    tar zcf "$dest_dir/$article_dir_name.tar.gz" "$article_dir_name"

    # update dirinfo
    echo "system	$date_for_dirinfo" > "$dest_dir/dirinfo.new"
    if [[ -f "$dest_dir/dirinfo" ]]; then
      cat "$dest_dir/dirinfo" >> "$dest_dir/dirinfo.new"
      mv "$dest_dir/dirinfo" "$dest_dir/dirinfo.$date_for_backup"
    fi
    mv "$dest_dir/dirinfo.new" "$dest_dir/dirinfo"
    rm -rf "$article_dir_name"
  fi
}
