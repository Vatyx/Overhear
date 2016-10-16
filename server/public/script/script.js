var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var analyser = audioContext.createAnalyser();
var canvas = document.getElementById('analyser_render');
var ctx = canvas.getContext('2d');
analyser.connect(audioContext.destination);

var audioChunks = [];
var time = 0;
var counter = 0;
var first = true;

var fbc_array, bars, bar_x, bar_width, bar_height;

var w = new Worker("public/script/worker.js");

w.onmessage = function(event) {
	if(event.data === "disconnected") {
		w.terminate();
	}
	else{
		if(first) {
			time = audioContext.currentTime + 3;
			console.log("FIRST", time);
			first = false;
			jQuery('.loader').hide('slow', 'linear', function() {
				jQuery('#mp3_player').show('slow', 'linear')
			});
			frameLooper();	
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
			source.connect(analyser);
			analyser.connect(audioContext.destination)
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

function buttonClicked() {
	var id = document.getElementById("streamer_id").value;
	w.postMessage(["streamer_id", id]);
}

function frameLooper(){
	window.webkitRequestAnimationFrame(frameLooper);
	fbc_array = new Uint8Array(analyser.frequencyBinCount);
	analyser.getByteFrequencyData(fbc_array);
	ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
	ctx.fillStyle = '#00CCFF'; // Color of the bars
	bars = 100;
	for (var i = 0; i < bars; i++) {
		bar_x = i * 3;
		bar_width = 2;
		bar_height = -(fbc_array[i] / 2);
		//  fillRect( x, y, width, height ) // Explanation of the parameters below
		ctx.fillRect(bar_x, canvas.height, bar_width, bar_height);
	}
}
