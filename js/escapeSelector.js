//
// Code taken from https://github.com/jquery/jquery/blob/d0ce00cdfa680f1f0c38460bc51ea14079ae8b07/src/selector/escapeSelector.js
//

// CSS string/identifier serialization
// https://drafts.csswg.org/cssom/#common-serializing-idioms
var rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;

function fcssescape(ch, asCodePoint) {
    if (asCodePoint) {
        // U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
        if (ch === '\0') {
            return '\uFFFD';
        }

        // Control characters and (dependent upon position) numbers get escaped as code points
        return `${ch.slice(0, -1)}\\${ch.charCodeAt(ch.length - 1).toString(16)} `;
    }

    // Other potentially-special ASCII characters get backslash-escaped
    return `\\${ch}`;
}

jQuery.escapeSelector = function (sel) {
    return `${sel}`.replace(rcssescape, fcssescape);
};
