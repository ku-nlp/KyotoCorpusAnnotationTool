#!/usr/bin/env bash

set -euo pipefail

knp_dir="$1"
deploy_dir="$2"

here="$(realpath "$(dirname "$0")")"

for knp_file in "${knp_dir}"/*.knp; do
  doc_id="$(basename "${knp_file}" .knp)"
  group_id="$(echo "${doc_id}" | cut -c 1-8)"
  group_dir="${deploy_dir}/${group_id}"
  mkdir -p "${group_dir}" || exit 1
  cp "${knp_file}" "${group_dir}/${doc_id}.knp"
  # create ${group_dir}/${doc_id} directory
  (cd "${group_dir}" && perl "${here}/../cgi/manage.pl" "${doc_id}.knp")
  doc_dir="${group_dir}/${doc_id}"
  tar zcf "${group_dir}/${doc_id}.tar.gz" "${doc_dir}" && rm -rf "${doc_dir}"
  rm -f "${group_dir}/${doc_id}.knp"
  mkdir -p "${doc_dir}"
  mv -f "${group_dir}/${doc_id}.tar.gz" "${doc_dir}/"
  echo "${USER}	$(date +%Y-%m-%d) 00:00" > "${doc_dir}/dirinfo"
done
