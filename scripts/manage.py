from importlib.resources import contents
import re
import argparse
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--knp-file', type=Path, required=True)
    parser.add_argument('--contents-dir', type=Path, required=True)
    args = parser.parse_args()

    contents_dir: Path = args.contents_dir
    contents_dir.mkdir(exist_ok=True)

    buff = ""
    sid = ""
    for line in args.knp_file.read_text().splitlines():
        # 種々のエラーメッセージは取り除く
        if line.startswith(";;"):
            continue
        buff += line + "\n"
        match = re.match(r'^# S-ID:([^ ]+)', line)
        if match:
            sid = match.group(1)
        elif line.strip() == "EOS":
            contents_dir.joinpath(sid).write_text(buff)
            buff = ""

    fileinfos = []
    for path in sorted([p for p in contents_dir.glob("*") if p.name != "fileinfos"]):
        if path.is_file():
            with path.open() as f:
                fileinfos.append(f.readline())
    contents_dir.joinpath("fileinfos").write_text("".join(fileinfos))


# def extract_sid(sid):
#     id_1, id_2, id_3 = sid.split('-')
#     if id_3.startswith('0') and id_1:
#         return id_1
#     else:
#         return id_2


# def extract_pid(pid):
#     id_1, id_2, id_3 = pid.split('-')
#     if id_3.startswith('0') and id_1:
#         return id_2
#     else:
#         return id_3


# def extract_tid(tid):
#     id_1, id_2, id_3 = tid.split('-')
#     if id_3.startswith('0') and id_1:
#         return id_3
#     else:
#         return 0

if __name__ == '__main__':
    main()
