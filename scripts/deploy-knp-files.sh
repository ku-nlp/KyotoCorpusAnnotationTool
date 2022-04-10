#!/usr/bin/env bash

set -euo pipefail

knp_dir="$1"
deploy_dir="$2"

here="$(realpath "$(dirname "$0")")"

for knp_file in "${knp_dir}"/*.knp; do
  doc_id="$(basename "${knp_file}" .knp)"
  group_id="$(echo "${doc_id}" | cut -c 1-7)"
  mkdir -p "${deploy_dir}/${group_id}"
  cd "${deploy_dir}/${group_id}"
  cp "${knp_file}" ./
  perl "${here}/../cgi/manage.pl" "${doc_id}.knp"
  tar zcf "${doc_id}.tar.gz" "${doc_id}"
  rm -rf "${doc_id}"
  rm -f "${doc_id}.knp"
  mkdir -p "${doc_id}"
  mv -f "${doc_id}.tar.gz" "${doc_id}"
  echo "${USER}	$(date +%Y-%m-%d) 00:00" > "${doc_id}/dirinfo"
done
