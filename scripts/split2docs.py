#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
"""
__author__ = 'Yuta Hayashibe'
__version__ = ""
__copyright__ = ""
__license__ = "GPL v3"


import codecs
import sys
sys.stdin = codecs.getreader('UTF-8')(sys.stdin)
sys.stdout = codecs.getwriter('UTF-8')(sys.stdout)
sys.stderr = codecs.getwriter('UTF-8')(sys.stderr)


import optparse
import os


import random
def main():
    oparser = optparse.OptionParser()
    oparser.add_option("-i", "--input", dest="input", default="-")
    oparser.add_option("-o", "--output", dest="output", default=None)
    oparser.add_option("-n", "--num", dest="num", type="int", default=None)
    oparser.add_option(
        "--verbose", dest="verbose", action="store_true", default=False)
    (opts, args) = oparser.parse_args()

    if opts.input == "-":
        inf = sys.stdin
    else:
        inf = codecs.open(opts.input, "r", "utf8")

    docid2txt = {}
    docid = None
    for line in inf:
        if line.startswith(u"# S-ID:"):
            sep_start = line.find(u" ", 7)
            if sep_start == 8:
                sep_start += line.find(u" ", 8)
            sep_end = line.find(u" ", sep_start +1)

            sid = line[sep_start:sep_end].lstrip().rstrip()
            docid = sid[:sid.rfind(u"-")].lstrip().rstrip()
            newdocid = docid.replace(u"-", u"__")
            newsid = sid.replace(docid, newdocid)
            line = u"# S-ID:%s%s" % (newsid, line[sep_end:])
        docid2txt[docid] = docid2txt.get(docid, u"") + line

    docids = docid2txt.keys()
    random.shuffle(docids)

    for n, (docid, txt) in enumerate(docid2txt.items()):
        if (opts.num is not None) and (n >= opts.num):
            break
        outname = os.path.join(opts.output, docid) + ".txt"
        with codecs.open(outname, "w", "utf8") as outf:
            outf.write(txt)



if __name__ == '__main__':
    main()
