from flask import Flask, render_template, send_from_directory, request
from threading import Thread
import sys
from audio_capture import AudioCapturer
from websocket import *
from base64 import b64encode
import logging
import wave
import cStringIO

# log everything to stdout
root = logging.getLogger()
root.setLevel(logging.DEBUG)

ch = logging.StreamHandler(sys.stdout)
ch.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
root.addHandler(ch)
# end logging stuff

app = Flask(__name__)
TEMPLATES_AUTO_RELOAD = True

ac = None
websocket_client = None
websocket_url = None

count = 0

def process_callback(data):
    buffer = cStringIO.StringIO()
    wf = wave.open(buffer, 'wb')
    wf.setnchannels(AudioCapturer.CHANNELS)
    wf.setsampwidth(ac.sample_size)
    wf.setframerate(AudioCapturer.RATE)
    wf.writeframes(b''.join(data))
    wf.close()
    websocket_client.send(base64encode(buffer.getvalue()))
    #global count
    #print count
    #count += 1


@app.route('/<path:filename>')
def serve_static(filename):
    root_dir = os.path.dirname(os.getcwd())
    directory = os.path.join(root_dir, 'static')
    print 'directory is: ', directory
    return send_from_directory(directory, filename)


@app.route('/')
def main():
    # return "Running now..."
    print "Running now..."
    return render_template('layout.html')


@app.route('/run')
def run():
    global ac, process_callback, websocket_client, websocket_url
    if ac:
        ac.run(process_callback=process_callback)
    else:
        ac = AudioCapturer()
        websocket_client = create_connection(websocket_url)
        ac.run(process_callback=process_callback)
    return 'run'


@app.route('/pause', methods=['GET'])
def pause():
    global ac
    if ac is not None:
        ac.pause()
    else:
        return 'AudioCapturer must be running before attempting to pause.'
    return "oh man we are just so paused, just wait, just you wait"

@app.route('/test', methods=['GET'])
def test():
   return "hey this is a test" 


@app.route('/stop', methods=["GET"])
def stop():
    global ac, websocket_client
    if ac is not None and websocket_client is not None:
	    ac.stop()
    else:
        return 'AudioCapturer must be running before attempting to stop.'

    ac = None
    websocket_client = None
    return "oh shit you just stopped all the music man, welcome to lame town"


def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()

@app.route('/shutdown')
def shutdown():
    shutdown_server()
    return 'Server shutting down...'

if __name__ == '__main__':
    port_number = None
    try:
        port_number = sys.argv[1]
        websocket_url = sys.argv[2]
    except IndexError:
        print "input argv not correct"
    app.run(port=port_number)
    #ws = create_connection("ws://localhost:8080/websocket")
