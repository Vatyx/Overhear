function pauseplayButton() {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			console.log(xhr.responseText);
		}
	}
	xhr.open('GET', '/pause', true);
	xhr.send(null);
}

function stopButton() {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			console.log(xhr.responseText);
		}
	}
	xhr.open('GET', '/stop', true);
	xhr.send(null);
}

