var queue = buckets.Queue();
var time = 0;
var counter = 0;
var firstMax = 20;

ws = new WebSocket("ws://ec2-52-36-25-96.us-west-2.compute.amazonaws.com:3000/ws");
var Base64Binary = {
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	/* will return a  Uint8Array type */
	decodeArrayBuffer: function(input) {
		var bytes = (input.length/4) * 3;
		var ab = new ArrayBuffer(bytes);
		this.decode(input, ab);

		return ab;
	},

	removePaddingChars: function(input){
		var lkey = this._keyStr.indexOf(input.charAt(input.length - 1));
		if(lkey == 64){
			return input.substring(0,input.length - 1);
		}
		return input;
	},

	decode: function (input, arrayBuffer) {
		//get last chars to see if are valid
		input = this.removePaddingChars(input);
		input = this.removePaddingChars(input);

		var bytes = parseInt((input.length / 4) * 3, 10);

		var uarray;
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		var j = 0;

		if (arrayBuffer)
			uarray = new Uint8Array(arrayBuffer);
		else
			uarray = new Uint8Array(bytes);

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		for (i=0; i<bytes; i+=3) {
			//get the 3 octects in 4 ascii chars
			enc1 = this._keyStr.indexOf(input.charAt(j++));
			enc2 = this._keyStr.indexOf(input.charAt(j++));
			enc3 = this._keyStr.indexOf(input.charAt(j++));
			enc4 = this._keyStr.indexOf(input.charAt(j++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			uarray[i] = chr1;
			if (enc3 != 64) uarray[i+1] = chr2;
			if (enc4 != 64) uarray[i+2] = chr3;
		}

		return uarray;
	}
}

function _base64ToArrayBuffer(base64) {
	return Base64Binary.decodeArrayBuffer(base64);
}

ws.onopen = function() {
  console.log("Websocket successfully connected")
}

ws.onmessage = function(message) {
	var bufferArray = _base64ToArrayBuffer(message.data);
	// audioChunks.push(bufferArray);
	queue.enqueue(bufferArray);
	counter++;
	if(counter === firstMax) { //code is only ran once
		postMessage(queue);
		queue.clear();	
	}
}

ws.onclose = function() {
  console.log("Disconnected from host");
  postMessage("disconnected");
};

self.onmessage = function(event) {
	if(event.data === "empty")
	{
		postMessage(queue);
		queue.clear();
	}
}
