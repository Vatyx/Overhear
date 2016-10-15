ws = new WebSocket("ws://ec2-52-36-25-96.us-west-2.compute.amazonaws.com:3000/ws");
ws.binaryType = "arraybuffer"

var time = 0

function _base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

ws.onopen = function()
{ // Web Socket is connected, send data using send()
  ws.send("Message to send");
  // alert("Message is sent...");
  console.log("Websocket successfully connected")
};

 //ws.onmessage = function (evt)
 //{
 //  console.log(_base64ToArrayBuffer(evt.data))
 //  //console.log(evt.data);
 //};

ws.onclose = function()
{ 
  // websocket is closed.
  alert("Connection is closed..."); 
};

var audioContext = new (window.AudioContext || window.webkitAudioContext)();

ws.onmessage = function(message) {
    var arrayBuffer = _base64ToArrayBuffer(message.data); // wav from server, as arraybuffer
  //var source = audioContext.createBufferSource();
  //audioContext.decodeAudioData(arrayBuffer, function(buffer){
  //  source.buffer = buffer
  //  source.connect(audioContext.destination)
  //  source.start(time);
  //  time += source.buffer.duration
  //}, function(err){
  //  console.log('error', err);
  //})
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

                    var audioBuffer = audioContext.createBuffer(1, right.length, 44100);
                    audioBuffer.getChannelData(0).set(right);


                    source.buffer = audioBuffer;

                    source.connect(audioContext.destination);

                    source.start(time);
                    time += audioBuffer.duration;

};
