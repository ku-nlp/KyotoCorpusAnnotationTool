# コーパス管理ページメモ (2008-11-26 Ryohei Sasano)

## 使い方

- `cgi.conf` を適当に編集

- `cgi.conf` で指定したディレクトリに、管理したいデータをコピー

- `html.cgi` を適当に編集
  - html ファイルを生成するための一時ファイルを出力するディレクトリ（デフォルトでは `$out_html = "$rootdir/../out-html"`）
  - `CorpusProject/scripts/manage.pl` のパスを正しく設定
