var audioContext = new (window.AudioContext || window.webkitAudioContext)();

var audioChunks = [];
var time = 0;
var counter = 0;

var w = new Worker("public/script/worker.js");

w.onmessage = function(event) {
	if(event.data === "disconnected") {
		w.terminate();
	}
	else{
		audioChunks = event.data;
		counter = 0;
		playAudio();
	}
}

function playAudio() {
	while(counter < audioChunks.length) {
		var arrayBuffer = audioChunks[counter];

		var data = new DataView(arrayBuffer);
		var audio = new Int16Array(data.byteLength / Int16Array.BYTES_PER_ELEMENT);
		var len = audio.length;
		for (var jj = 0; jj < len; ++jj) {
			audio[jj] = data.getInt16(jj * Int16Array.BYTES_PER_ELEMENT, true);
		}

		var right = new Float32Array(audio.length);

		var channleCounter = 0;
		for (var i = 0; i < audio.length; ) {
			var normalizedRight = audio[i] / 32768;

			i = i + 1;
			right[channleCounter] = normalizedRight;

			channleCounter++;
		}

		var source = audioContext.createBufferSource();

		var audioBuffer = audioContext.createBuffer(1, right.length, 44100 * 2);
		audioBuffer.getChannelData(0).set(right);

		source.buffer = audioBuffer;

		source.connect(audioContext.destination);

		source.start(time);
		time += audioBuffer.duration;

		counter++;
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
