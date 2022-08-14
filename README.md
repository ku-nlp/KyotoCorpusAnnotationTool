# 京大コーパスアノテーションツール

本パッケージに下記二つのバージョンが含まれている。

- right dependencyと日本語のみに対応したバージョン
- left/right dependencyと日本語、英語、中国語に対応したバージョン

## Requirements

- Perl 5.30.0+
- Python 3.7+
- Perl modules: CGI, File::Copy::Recursive

## インストール手順

``public_html``以下の任意のディレクトリ（以下、``annot``とする）に``git clone``などで取得したパッケージを配置する。

## コーパスデータ設定

- ``cgi/cgi.confのrootdir``変数に、管理したいデータのパスを設定する。
    - デフォルトは``data/files``
- データを設置する
    - ``/path/to/txt-files``以下に``.txt``という拡張子をもつテキストファイルを置く
    - 以下の手順で、テキストファイルからデータを生成 (日本語の場合; JUMAN/KNPが必要)
```
mkdir data/files/foo
cd  data/files/foo
find /path/to/txt-files/ -type f | grep txt$ | xargs -t -l -P 3 bash ../../../scripts/conv-auto-annotation-data-from-txt.sh
```
- ``$rootdir/../out-html`` というディレクトリを作っておく。
    - デフォルトは``data/out-html``
- ``left/right dependency``対応版の、言語ごとの設定は``cgi/cgi_{ja,en,zh}.conf``に入力する。

## UI設定

必要に応じて、下記ファイルを編集してバージョンごとのUI設定を変更する（カスタマイズが特に必要なければ設定不要）。

- ``js/setting.js``
- ``js/setting_{ja,en,zh}.js``

## 起動
1.
    - right dependency、日本語のみに対応したツールは``http://xxx/<username>/annot/`` からアクセスする。
    - left/right dependencyの日本語、英語、中国語に対応したツールは``http://xxx/<username>/annot/{ja,en,zh}.html``からアクセスする
2. ユーザ名、パスワードを入力し、データセットを選択する。
    - cgi/list.cgiもしくはcgi/list_{ja,en,zh}.cgi 9行目のPASSWDでユーザ名、パスワードを設定しておく必要がある。
3. 編集したい記事の編集ボタンを押すとHTMLのページがロードされアノテーションツールが起動する。

## 操作方法

### メニュー

#### 「格追加」メニュー

メニュー項目から追加したい格を選択するとカラムが追加される

### 検索

検索ボックスに文字列もしくは文情報を入力し検索ボタンをクリックする
次の文を検索し、なければ前の文に戻る。

### 編集ページ

#### 構文木
- 係り受け関係の表示。
- 文節をクリックで形態素・文節情報画面を開く

#### タグ表示
- タグの表示
- セルをクリックで、タグ編集ダイアログを表示。

#### タグ編集ダイアログ
- 編集：編集可能な項目はここでまとめて行う
- 削除：削除を一括で行う
- タグ選択/キャンセル

### 形態素・文節操作フレーム
- フレーム区切りの真ん中のボタン(close)を押すとフレームを閉じる。
- 完了ボタンを押すとフレームを閉じる。
  フレーム自体を非表示にするだけでこの時はデータの保存処理を行わないので、
  再度開くとデータは残った状態。

- 完了ボタン：
  編集を完了しフレームを閉じる。文脈情報表示フレームの更新を行う

- 品詞：
  ドロップダウンで選択。
  テキスト部分を更新する。活用形の更新は未実装。

- 活用形：
  ドロップダウンで選択。
  テキスト部分を更新する。

### 全文表示フレーム
