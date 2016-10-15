ws = new WebSocket("ws://ec2-52-36-25-96.us-west-2.compute.amazonaws.com:3000/ws");
ws.binaryType = "arraybuffer"

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
  var arrayBuffer = _base64ToArrayBuffer(message.data) // wav from server, as arraybuffer
  var source = audioContext.createBufferSource();
  audioContext.decodeAudioData(arrayBuffer, function(buffer){
    source.buffer = buffer
    source.connect(audioContext.destination)
    source.start(time);
    time += source.buffer.duration
  }, function(err){
    console.log('error', err);
  })
};
