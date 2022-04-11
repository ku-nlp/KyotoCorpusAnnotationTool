#!/usr/bin/env bash

set -euo pipefail

knp_dir="$1"
DEPLOY_DIR="$2"
PROJECT_DIR="$(dirname "$(realpath "$(dirname "$0")")")"
export DEPLOY_DIR PROJECT_DIR

deploy-single-file() {
  knp_file="$1"
  doc_id="$(basename "${knp_file}" .knp)"
  group_id="$(echo "${doc_id}" | cut -c 1-8)"
  group_dir="${DEPLOY_DIR}/${group_id}"
  mkdir -p "${group_dir}" || exit 1
  cp "${knp_file}" "${group_dir}/${doc_id}.knp"
  # create ${group_dir}/${doc_id} directory
  (cd "${group_dir}" && perl "${PROJECT_DIR}/cgi/manage.pl" "${doc_id}.knp")
  doc_dir="${group_dir}/${doc_id}"
  tar zcf "${group_dir}/${doc_id}.tar.gz" "${doc_dir}" && rm -rf "${doc_dir}"
  rm -f "${group_dir}/${doc_id}.knp"
  mkdir -p "${doc_dir}"
  mv -f "${group_dir}/${doc_id}.tar.gz" "${doc_dir}/"
  echo "${USER}	$(date +%Y-%m-%d) 00:00" > "${doc_dir}/dirinfo"
}

export -f deploy-single-file

sudo chown -R "${USER}:user" "${DEPLOY_DIR}"/*

find "${knp_dir}" -type f -name "*.knp" -print0 | xargs -0 -n 1 -P 24 -I{} bash -c 'deploy-single-file "{}"'

# Apache web server manipulates files as user "www-data"
sudo chown -R www-data:www-data "${DEPLOY_DIR}"/*
