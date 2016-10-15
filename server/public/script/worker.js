var audioChunks = [];
var time = 0;
var counter = 0;
var firstMax = 10;

ws = new WebSocket("ws://ec2-52-36-25-96.us-west-2.compute.amazonaws.com:3000/ws");

function _base64ToArrayBuffer(base64) {
    var binary_string =  atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

ws.onopen = function() {
  console.log("Websocket successfully connected")
}

ws.onmessage = function(message) {
	var bufferArray = _base64ToArrayBuffer(message.data);
	audioChunks.push(bufferArray);
	counter++;
	if(counter == 10) {
		postMessage(audioChunks);
	}
}

ws.onclose = function() {
  console.log("Disconnected from host");
  postMessage("disconnected");
};

self.onmessage = function(event) {
	if(event.data === "empty")
	{
		postMessage(audioChunks);
		audioChunks = [];	
	}
}