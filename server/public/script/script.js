var audioContext = new (window.AudioContext || window.webkitAudioContext)();

var queue = buckets.Queue();
var audioChunks = [];
var time = 0;
var counter = 0;
var minSize = 3;
var completelyEmpty = false;

var w = new Worker("public/script/worker.js");

w.onmessage = function(event) {
	if(event.data === "disconnected") {
		w.terminate();
	}
	else{
		while(event.data.isEmpty() !== false) {
			queue.enqueue(event.data.dequeue());
		}
		// audioChunks = event.data;
		counter = 0;
		if(completelyEmpty === true) {
			playAudio();
			completelyEmpty = false;
		}
	}
}

function playAudio() {
	while(queue.isEmpty() !== false) {
		var arrayBuffer = queue.dequeue();

        audioContext.decodeAudioData(arrayBuffer, function(buffer){
            var source = audioContext.createBufferSource();
            source.buffer = buffer
            source.connect(audioContext.destination)
            source.start(time);
            time += source.buffer.duration
        }, function(){
            console.log('error')
        });

        if(queue.size() < minSize) {
        	w.postMessage("empty");
        }
	}
	completelyEmpty = true;
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
