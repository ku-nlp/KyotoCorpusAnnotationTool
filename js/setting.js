DOWNLOAD_URL = "cgi/download_data.cgi";
UPLOAD_URL = "cgi/upload_data.cgi";
IMAGE_PATH = "css/images/";

LANG = 'ja';
TREE_MODE = 'R';

posDataFile = {
    ja: 'pos.dat',
    en: 'pos_en.dat',
    zh: 'pos.dat'
};

JUMAN_DATA_PATH = 'juman_grammar/';

CaseOrder = {
    "ガ": 11,
    "ヲ": 10,
    "ニ": 9,
    "ト": 8,
    "デ": 7,
    "カラ": 6,
    "ヨリ": 5,
    "ヘ": 4,
    "マデ": 3,
    "時間": 1,
    "外の関係": -1,
    "ガ２": -2,
    "ノ": -3,
    "ノ？": -4,
    "修飾": -5,
    "トイウ": -6,
    "=": -7,
    "マデニ": -8,
    "判ガ": -9,
    "NE": -20,
    "メモ": -100
};
CompoundCases = "ヲメグッテ ヲツウジテ ヲフクメテ ニカランデ ニソッテ ニムケテ ニトモナッテ ニカンシテ ニモトヅイテ ヲノゾイテ ニヨッテ ニタイシテ ニカワッテ ニオイテ ニツイテ ニトッテ ニクワエテ ニカギッテ ニツヅイテ ニアワセテ ニクラベテ ニナランデ トシテ ニヨラズ ニカギラズ ニシテ".split(' ');
NETags = 'ORGANIZATION PERSON LOCATION ARTIFACT DATE TIME MONEY PERCENT OPTIONAL'.split(' ');
NE_OPT_TAG = 'ORGANIZATION PERSON LOCATION ARTIFACT DATE TIME MONEY PERCENT NONE'.split(' ');
NE_OPT_TYPE = '0 1 2 3 4'.split(' ');
EQUAL_OPT = ['構', '役']; // KNPの素性として出力する情報
EQUAL_OPT_KEY = ['構文', '役職']; // gui_rで表示する名前

MODIFY_MODE = {"OVERWRITE": 0, "ADD_OR": 1, "ADD_AND": 2, "ADD_QUESTION": 3};
MODIFY_MODE_DESC = {"OVERWRITE": '修正', "ADD_OR": '追加(OR)', "ADD_AND": '追加(AND)', "ADD_QUESTION": '追加(？)'};
MODIFY_MODE_FILE = {0: '', 1: 'OR', 2: 'AND', 3: '？'};
MODIFY_MODE_SRC = {
    "OVERWRITE": {"on": 'css/images/menu_04_on.png', "of": 'css/images/menu_04_of.png'},
    "ADD_OR": {"on": 'css/images/menu_06_on.png', "of": 'css/images/menu_06_of.png'},
    "ADD_AND": {"on": 'css/images/menu_05_on.png', "of": 'css/images/menu_05_of.png'},
    "ADD_QUESTION": {"on": 'css/images/menu_07_on.png', "of": 'css/images/menu_07_of.png'}
};
EQUAL_OPT_DELETE = "(?:≒)?(?:構|役)?(?:≒)?";
ColorADD_OR = '#698C00';
ColorADD_AND = '#3F75B7';
ColorADD_QUESTION = '#F88E67';
ColorNE = '#F7E1BB';
STRONG_SUFFIX = /^(?:率|通り|どおり|方|がた|かた|型|形|用|製|家|者|数|費|入り|いり|あけ|上|じょう|作り|づくり|ずみ|無し|なし|増|減|的だ|化|さ|都|道|府|県|郡|市|村|町|区|州)$/;

BnstColor = '#F9D9D5';
BackgroundColor = '#A6A6A6';
BnstAnotherColor = '#D0E9AB';

WmrphMenuArray = [{"title": ""},
    {"title": "表記"},
    {"title": "読み"},
    {"title": "原形"},
    {"title": "品詞"},
    {"title": "活用形"},
    {"title": "意味情報"},
    {"title": ""},
    {"title": ""},
    {"title": ""}
];
