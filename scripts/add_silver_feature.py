import argparse
import re
import sys
import textwrap
from typing import Any
from pathlib import Path

from rhoknp import KNP, Document
from rhoknp.props import FeatureDict, MemoTag, SemanticsDict
from rhoknp.cohesion import RelTagList
from rhoknp.utils.reader import chunk_by_document
from tqdm import tqdm

BASE_PHRASE_FEATURES: tuple[str, ...] = (
    # type
    "用言:動",
    "用言:形",
    "用言:判",
    "体言",
    "非用言格解析:動",
    "非用言格解析:形",
    # modality
    "モダリティ-疑問",
    "モダリティ-意志",
    "モダリティ-勧誘",
    "モダリティ-命令",
    "モダリティ-禁止",
    "モダリティ-評価:弱",
    "モダリティ-評価:強",
    "モダリティ-認識-推量",
    "モダリティ-認識-蓋然性",
    "モダリティ-認識-証拠性",
    "モダリティ-依頼Ａ",
    "モダリティ-依頼Ｂ",
    # tense
    "時制:過去",
    "時制:非過去",
    # negation
    "否定表現",
    # clause
    "節-主辞",
    "節-区切",
)

IGNORE_VALUE_FEATURE_PAT = re.compile(r"節-(前向き)?機能疑?")


def remove_unmaintained_features(document: Document) -> None:
    for morpheme in document.morphemes:
        feature_dict = FeatureDict()
        if morpheme.base_phrase.head == morpheme:
            feature_dict["基本句-主辞"] = True
        if "基本句-主辞" in morpheme.features:
            feature_dict["基本句-主辞"] = morpheme.features["基本句-主辞"]
        morpheme.features = feature_dict
        morpheme.semantics.clear()

    keys = [feature.split(":")[0] for feature in BASE_PHRASE_FEATURES]
    for base_phrase in document.base_phrases:
        feature_dict = FeatureDict(
            {
                key: base_phrase.features[key]
                for key in keys
                if key in base_phrase.features and is_target_base_phrase_feature(key, base_phrase.features[key])
            }
        )
        base_phrase.features = feature_dict

    for phrase in document.phrases:
        phrase.features.clear()


def is_target_base_phrase_feature(k: str, v: Any) -> bool:
    name = k + (f":{v}" if isinstance(v, str) and IGNORE_VALUE_FEATURE_PAT.match(k) is None else "")
    return name in BASE_PHRASE_FEATURES


def batch_add_silver_features(documents: list[Document]) -> list[Document]:
    knp = KNP(options=["-tab", "-dpnd-fast", "-read-feature"])
    for document in tqdm(documents):
        yield add_silver_features(document, knp)


def add_silver_features(orig_document: Document, knp: KNP) -> Document:
    # Store manually annotated features
    rel_tag_lists: list[RelTagList] = []
    base_phrase_features: list[FeatureDict] = []  # NE, NE-OPTIONAL
    memo_tags: list[MemoTag] = []
    for base_phrase in orig_document.base_phrases:
        rel_tag_lists.append(base_phrase.rel_tags)
        memo_tags.append(base_phrase.memo_tag)
        base_phrase_features.append(base_phrase.features)

    semantics: list[SemanticsDict] = []
    special_conjtypes: dict[int, tuple] = {}
    special_conjforms: dict[int, tuple] = {}
    special_poses: dict[int, tuple] = {}
    for morpheme in orig_document.morphemes:
        semantics.append(morpheme.semantics)
        # Change morpheme attributes that KNP does not support to avoid parsing errors.
        # Changed attributes are restored after parsing.
        if morpheme.conjtype == "ナ形容詞" and morpheme.conjform == "ダ列文語基本形":
            special_conjforms[morpheme.global_index] = (morpheme.conjform, morpheme.conjform_id)
            (morpheme.conjform, morpheme.conjform_id) = ("ダ列基本連体形", 3)
        if morpheme.conjtype == "なり列" and morpheme.conjform == "古語基本形(なり)":
            special_conjtypes[morpheme.global_index] = (morpheme.conjtype, morpheme.conjtype_id)
            (morpheme.conjtype, morpheme.conjtype_id) = ("判定詞", 25)
            special_conjforms[morpheme.global_index] = (morpheme.conjform, morpheme.conjform_id)
            (morpheme.conjform, morpheme.conjform_id) = ("基本形", 2)
        if morpheme.pos == "未定義語" and morpheme.subpos == "未対応表現":
            special_poses[morpheme.global_index] = (morpheme.pos, morpheme.pos_id, morpheme.subpos, morpheme.subpos_id)
            (morpheme.pos, morpheme.pos_id, morpheme.subpos, morpheme.subpos_id) = ("副詞", 8, "*", 0)

    # Add silver features
    try:
        document = knp.apply_to_document(orig_document)
    except:
        print(orig_document.to_knp())
        raise

    # Validate processed document
    for morpheme1, morpheme2 in zip(orig_document.morphemes, document.morphemes):
        for attr in (
            "surf", "reading", "lemma", "pos", "pos_id", "subpos", "subpos_id", "conjtype", "conjtype_id", "conjform"
        ):
            value1, value2 = getattr(morpheme1, attr), getattr(morpheme2, attr)
            assert value1 == value2, f"{attr}: {document.doc_id} {value1} != {value2}"

    for base_phrase1, base_phrase2 in zip(orig_document.base_phrases, document.base_phrases):
        for attr in ("text", "parent_index", "dep_type"):
            value1, value2 = getattr(base_phrase1, attr), getattr(base_phrase2, attr)
            assert value1 == value2, f"{attr}: {document.doc_id} {value1} != {value2}"

    for phrase1, phrase2 in zip(orig_document.phrases, document.phrases):
        for attr in ("text", "parent_index", "dep_type"):
            value1, value2 = getattr(phrase1, attr), getattr(phrase2, attr)
            assert value1 == value2, f"{attr}: {document.doc_id} {value1} != {value2}"

    # Remove unmaintained features in-place
    remove_unmaintained_features(document)

    # Restore manually annotated features
    for base_phrase, rel_tags, memo_tag, features in zip(
        document.base_phrases, rel_tag_lists, memo_tags, base_phrase_features
    ):
        base_phrase.rel_tags = rel_tags
        base_phrase.memo_tag = memo_tag
        base_phrase.features.update(features)

    for morpheme, semantics in zip(document.morphemes, semantics):
        morpheme.semantics.update(semantics)
        if special_conjtype := special_conjtypes.get(morpheme.global_index):
            morpheme.conjtype, morpheme.conjtype_id = special_conjtype
        if special_conjform := special_conjforms.get(morpheme.global_index):
            morpheme.conjform, morpheme.conjform_id = special_conjform
        if special_pos := special_poses.get(morpheme.global_index):
            morpheme.pos, morpheme.pos_id, morpheme.subpos, morpheme.subpos_id = special_pos

    return document


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", type=Path, nargs="*", help="path or glob to input knp dir")
    # parser.add_argument("--jobs", "-j", default=1, type=int, help="number of jobs")
    parser.add_argument(
        "--doc-id-format", default="default", type=str, help="doc id format to identify document boundary"
    )
    args = parser.parse_args()

    for path in args.paths:
        if path.exists() is False:
            print(f"{path} not found and skipped", file=sys.stderr)
            continue
        for knp_file in path.glob("**/*.knp") if path.is_dir() else [path]:
            with knp_file.open(mode="r") as f:
                documents = [
                    Document.from_knp(knp_text) for knp_text in chunk_by_document(f, doc_id_format=args.doc_id_format)
                ]
            documents_with_silver = batch_add_silver_features(documents)
            output_knp_text = "".join(document.to_knp() for document in documents_with_silver)
            knp_file.write_text(output_knp_text)

    # chunk_size = len(knp_texts) // args.jobs + int(len(knp_texts) % args.jobs > 0)
    # iterable = [
    #     (knp_texts[slice(start, start + chunk_size)], output_root) for start in range(0, len(knp_texts), chunk_size)
    # ]
    # with mp.Pool(args.jobs) as pool:
    #     pool.starmap(assign_features_and_save, iterable)


if __name__ == "__main__":
    main()


def test_jumanpp_augmenter():
    knp_text = textwrap.dedent(
        """\
        # S-ID:w201106-0000060050-1 JUMAN:6.1-20101108 KNP:3.1-20101107 DATE:2011/06/21 SCORE:-44.94406 MOD:2017/10/15 MEMO:
        * 2D
        + 1D
        コイン こいん コイン 名詞 6 普通名詞 1 * 0 * 0
        + 3D <rel type="ガ" target="不特定:人"/><rel type="ヲ" target="コイン" sid="w201106-0000060050-1" id="0"/>
        トス とす トス 名詞 6 サ変名詞 2 * 0 * 0
        を を を 助詞 9 格助詞 1 * 0 * 0
        * 2D
        + 3D
        ３ さん ３ 名詞 6 数詞 7 * 0 * 0
        回 かい 回 接尾辞 14 名詞性名詞助数辞 3 * 0 * 0
        * -1D
        + -1D <rel type="ガ" target="不特定:人"/><rel type="ガ" mode="？" target="読者"/><rel type="ガ" mode="？" target="著者"/><rel type="ヲ" target="トス" sid="w201106-0000060050-1" id="1"/>
        行う おこなう 行う 動詞 2 * 0 子音動詞ワ行 12 基本形 2
        。 。 。 特殊 1 句点 1 * 0 * 0
        EOS
        # S-ID:w201106-0000060050-2 JUMAN:6.1-20101108 KNP:3.1-20101107 DATE:2011/06/21 SCORE:-64.95916 MOD:2013/04/13
        * 1D
        + 1D <rel type="ノ" target="コイン" sid="w201106-0000060050-1" id="0"/>
        表 おもて 表 名詞 6 普通名詞 1 * 0 * 0
        が が が 助詞 9 格助詞 1 * 0 * 0
        * 2D
        + 2D <rel type="ガ" target="表" sid="w201106-0000060050-2" id="0"/><rel type="外の関係" target="数" sid="w201106-0000060050-2" id="2"/>
        出た でた 出る 動詞 2 * 0 母音動詞 1 タ形 10
        * 5D
        + 5D <rel type="ノ" target="出た" sid="w201106-0000060050-2" id="1"/>
        数 かず 数 名詞 6 普通名詞 1 * 0 * 0
        だけ だけ だけ 助詞 9 副助詞 2 * 0 * 0
        、 、 、 特殊 1 読点 2 * 0 * 0
        * 4D
        + 4D
        フィールド ふぃーるど フィールド 名詞 6 普通名詞 1 * 0 * 0
        上 じょう 上 接尾辞 14 名詞性名詞接尾辞 2 * 0 * 0
        の の の 助詞 9 接続助詞 3 * 0 * 0
        * 5D
        + 5D <rel type="修飾" target="フィールド上" sid="w201106-0000060050-2" id="3"/><rel type="修飾" mode="AND" target="数" sid="w201106-0000060050-2" id="2"/>
        モンスター もんすたー モンスター 名詞 6 普通名詞 1 * 0 * 0
        を を を 助詞 9 格助詞 1 * 0 * 0
        * -1D
        + -1D <rel type="ヲ" target="モンスター" sid="w201106-0000060050-2" id="4"/><rel type="ガ" target="不特定:状況"/>
        破壊 はかい 破壊 名詞 6 サ変名詞 2 * 0 * 0
        する する する 動詞 2 * 0 サ変動詞 16 基本形 2
        。 。 。 特殊 1 句点 1 * 0 * 0
        EOS
        """
    )
    document_with_silver = list(batch_add_silver_features([Document.from_knp(knp_text)]))[0]
    expected = textwrap.dedent(
        """\
        # S-ID:w201106-0000060050-1 JUMAN:6.1-20101108 KNP:3.1-20101107 DATE:2011/06/21 SCORE:-44.94406 MOD:2017/10/15 MEMO:
        * 2D
        + 1D <体言>
        コイン こいん コイン 名詞 6 普通名詞 1 * 0 * 0 NIL <基本句-主辞>
        + 3D <rel type="ガ" target="不特定:人"/><rel type="ヲ" target="コイン" sid="w201106-0000060050-1" id="0"/><体言><非用言格解析:動>
        トス とす トス 名詞 6 サ変名詞 2 * 0 * 0 NIL <基本句-主辞>
        を を を 助詞 9 格助詞 1 * 0 * 0 NIL
        * 2D
        + 3D <体言>
        ３ さん ３ 名詞 6 数詞 7 * 0 * 0 NIL <基本句-主辞>
        回 かい 回 接尾辞 14 名詞性名詞助数辞 3 * 0 * 0 NIL
        * -1D
        + -1D <rel type="ガ" target="不特定:人"/><rel type="ガ" mode="？" target="読者"/><rel type="ガ" mode="？" target="著者"/><rel type="ヲ" target="トス" sid="w201106-0000060050-1" id="1"/><用言:動><時制:非過去><節-主辞><節-区切>
        行う おこなう 行う 動詞 2 * 0 子音動詞ワ行 12 基本形 2 NIL <基本句-主辞>
        。 。 。 特殊 1 句点 1 * 0 * 0 NIL
        EOS
        # S-ID:w201106-0000060050-2 JUMAN:6.1-20101108 KNP:3.1-20101107 DATE:2011/06/21 SCORE:-64.95916 MOD:2013/04/13
        * 1D
        + 1D <rel type="ノ" target="コイン" sid="w201106-0000060050-1" id="0"/><体言>
        表 おもて 表 名詞 6 普通名詞 1 * 0 * 0 NIL <基本句-主辞>
        が が が 助詞 9 格助詞 1 * 0 * 0 NIL
        * 2D
        + 2D <rel type="ガ" target="表" sid="w201106-0000060050-2" id="0"/><rel type="外の関係" target="数" sid="w201106-0000060050-2" id="2"/><用言:動><時制:過去><節-主辞>
        出た でた 出る 動詞 2 * 0 母音動詞 1 タ形 10 NIL <基本句-主辞>
        * 5D
        + 5D <rel type="ノ" target="出た" sid="w201106-0000060050-2" id="1"/><体言>
        数 かず 数 名詞 6 普通名詞 1 * 0 * 0 NIL <基本句-主辞>
        だけ だけ だけ 助詞 9 副助詞 2 * 0 * 0 NIL
        、 、 、 特殊 1 読点 2 * 0 * 0 NIL
        * 4D
        + 4D <体言>
        フィールド ふぃーるど フィールド 名詞 6 普通名詞 1 * 0 * 0 NIL <基本句-主辞>
        上 じょう 上 接尾辞 14 名詞性名詞接尾辞 2 * 0 * 0 NIL
        の の の 助詞 9 接続助詞 3 * 0 * 0 NIL
        * 5D
        + 5D <rel type="修飾" target="フィールド上" sid="w201106-0000060050-2" id="3"/><rel type="修飾" mode="AND" target="数" sid="w201106-0000060050-2" id="2"/><体言>
        モンスター もんすたー モンスター 名詞 6 普通名詞 1 * 0 * 0 NIL <基本句-主辞>
        を を を 助詞 9 格助詞 1 * 0 * 0 NIL
        * -1D
        + -1D <rel type="ヲ" target="モンスター" sid="w201106-0000060050-2" id="4"/><rel type="ガ" target="不特定:状況"/><用言:動><時制:非過去><節-主辞><節-区切>
        破壊 はかい 破壊 名詞 6 サ変名詞 2 * 0 * 0 NIL <基本句-主辞>
        する する する 動詞 2 * 0 サ変動詞 16 基本形 2 NIL
        。 。 。 特殊 1 句点 1 * 0 * 0 NIL
        EOS
        """
    )
    assert document_with_silver.to_knp() == expected
