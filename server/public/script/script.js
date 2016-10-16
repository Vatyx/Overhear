var audioContext = new (window.AudioContext || window.webkitAudioContext)();

var audioChunks = [];
var time = 10;
var counter = 0;
var first = true;

var w = new Worker("public/script/worker.js");

w.onmessage = function(event) {
	if(event.data === "disconnected") {
		w.terminate();
	}
	else{
		if(first) {
			time = audioContext.currentTime + 2;
			console.log("FIRST", time);
			first = false;
		}
		audioChunks = event.data;
		counter = 0;
		playAudio();
	}
}

function playAudio() {
	while(counter < audioChunks.length) {
		var arrayBuffer = audioChunks[counter];

        audioContext.decodeAudioData(arrayBuffer, function(buffer){
            var source = audioContext.createBufferSource();
            source.buffer = buffer
            source.connect(audioContext.destination)
            source.start(time);
            time += source.buffer.duration
		console.log(time);
        }, function(){
            console.log('error')
        });
        counter++

	}

	w.postMessage("empty");
}

function _base64ToArrayBuffer(base64) {
	var binary_string =  window.atob(base64);
	var len = binary_string.length;
	var bytes = new Uint8Array( len );
	for (var i = 0; i < len; i++)        {
		bytes[i] = binary_string.charCodeAt(i);
	}
	return bytes.buffer;
}
