ws = new WebSocket("ws://localhost:3000/ws");

doit = function(msg){
  ws.send(msg);
}

ws.onopen = function()
{ // Web Socket is connected, send data using send()
  ws.send("Message to send");
  // alert("Message is sent...");
  console.log("Websocket successfully connected")
};

// ws.onmessage = function (evt) 
// { 
//   console.log(evt.data)
// };

ws.onclose = function()
{ 
  // websocket is closed.
  alert("Connection is closed..."); 
};

var audioContext = new (window.AudioContext || window.webkitAudioContext)();

ws.binaryType = 'arraybuffer'
ws.onmessage = function(message) {
  var arrayBuffer = message.data // wav from server, as arraybuffer
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