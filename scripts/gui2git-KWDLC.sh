#!/usr/bin/env bash

# $0 /mnt/zamia/web_storage/htdocs/annotation/corpus-simple

usage() {
  echo "Usage: $0 gui_top_dir"
  echo "e.g., $0 ~/public_html/annotation/KWDLC"
  exit 1
}

if [[ -z "$1" || ! -d "$1/data/files" ]]; then
  usage
fi
gui_data_dir=$1/data/files

scripts_dir=$(dirname -- "$0")

mkdir -p knp
cd knp || exit 1

for set_dir in $gui_data_dir/w201106-*; do
  if [[ -d "$set_dir" ]]; then
    set_id=$(basename $set_dir)

    # w201106-00022 and w201106-00025 are not annotated
    if [[ "$set_id" = "w201106-00022" || "$set_id" = "w201106-00025" ]]; then
      continue
    fi
    mkdir -p "$set_id"

    # process each article
    for aid_full in $set_dir/*; do
      if [[ -d $aid_full ]]; then
        aid=$(basename $aid_full)

        # obtain memo to check inappropriateness
        if [[ -s "$aid_full/annotator_memo" ]]; then
          memo=$(nkf -w $aid_full/annotator_memo)
        else
          memo=""
        fi
        inappropriate_str=$(echo $memo | grep -E '★|不適')
        if [[ -n "$inappropriate_str" ]]; then
          echo "$aid inappropriate"
          continue
        fi

        tar zxf $aid_full/$aid.tar.gz
        perl $scripts_dir/manage.pl $aid + > /dev/null

        echo $aid
        mv $aid.knp $set_id
        rm -rf $aid
      fi
    done
  fi
done
cd ..
