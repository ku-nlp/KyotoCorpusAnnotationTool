// // file save

// var container = document.querySelector('#container');
// // var typer = container.querySelector('[contenteditable]');
// var output = container.querySelector('output');

// const MIME_TYPE = 'text/plain';

// var cleanUp = function(a) {
//     a.textContent = 'Downloaded';
//     a.dataset.disabled = true;

//     // Need a small delay for the revokeObjectURL to work properly.
//     setTimeout(function() {
// 	window.URL.revokeObjectURL(a.href);
//     }, 1500);
// };

// var downloadFile = function() {
//     window.URL = window.webkitURL || window.URL;
//     window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder ||
// 	window.MozBlobBuilder;

//     var prevLink = output.querySelector('a');
//     if (prevLink) {
// 	window.URL.revokeObjectURL(prevLink.href);
// 	output.innerHTML = '';
//     }

//     var str = lines.join("\n");
//     var blob = new Blob([str], {type:MIME_TYPE});
//     var url = URL.createObjectURL(blob);
    
//     var a = document.createElement('a');
//     // a.download = container.querySelector('input[type="text"]').value;
//     a.download = "sample.txt";
//     a.href = url
//     a.textContent = 'Download ready';

//     a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
//     a.draggable = true; // Don't really need, but good practice.
//     a.classList.add('dragout');

//     output.appendChild(a);

//     a.onclick = function(e) {
// 	if ('disabled' in this.dataset) {
// 	    return false;
// 	}

// 	cleanUp(this);
//     };
// };

// var _gaq = _gaq || [];
// _gaq.push(['_setAccount', 'UA-22014378-1']);
// _gaq.push(['_trackPageview']);

// (function() {
//     var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
//     // ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
//     var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
// })();
