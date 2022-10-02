#!/usr/bin/env bash

set -euo pipefail

knp_dir="$1"
DEPLOY_DIR="$2"
PROJECT_DIR="$(dirname "$(realpath "$(dirname "$0")")")"
export DEPLOY_DIR PROJECT_DIR

help() {
cat << EOD
Usage: $0 <knp_dir> <deploy_dir>
Arguments:
  <knp_dir>    knp directory where parsed knp files exist
  <deploy_dir> the root directory under which the annotation tool manipulates files
EOD
}

if [[ $# -ne 2 ]]; then
  help
  exit 1
fi

deploy-single-file() {
  knp_file="$1"
  doc_id="$(basename "${knp_file}" .knp)"
  group_id="$(echo "${doc_id}" | cut -c 1-13)"  # fix here depending on your corpus
  article_dir="${DEPLOY_DIR}/${group_id}/${doc_id}"
  contents_dir="${article_dir}/contents"
  mkdir -p "${contents_dir}" || exit 1
  # create contents directory
  python3 "${PROJECT_DIR}/scripts/manage.py" --knp-file "${knp_file}" --contents-dir "${contents_dir}"
  echo "${USER}	$(date +%Y-%m-%d) 00:00" > "${article_dir}/dirinfo"
}

export -f deploy-single-file

# sudo chown -R "${USER}:user" "${DEPLOY_DIR}"/*

find "${knp_dir}" -type f -name "*.knp" -print0 | xargs -0 -n 1 -P 24 -I{} bash -cx 'deploy-single-file "{}"'

# Apache web server manipulates files as user "www-data"
# sudo chown -R www-data:www-data "${DEPLOY_DIR}"/*
