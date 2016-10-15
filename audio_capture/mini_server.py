from flask import Flask, render_template, send_from_directory
from threading import Thread
import sys
from audio_capture import AudioCapturer
from websocket import *
from base64 import b64encode
import logging

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
    print(type(data))
    websocket_client.send(base64encode(data))
    global count
    print count
    count += 1


@app.route('/js/<path:filename>')
def serve_static(filename):
    root_dir = os.path.dirname(os.getcwd())
    directory = os.path.join(root_dir, 'static', 'js')
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
        websocket_client.send("Sender connected")
        ac.run(process_callback=process_callback)
    return 'run'


@app.route('/pause')
def pause():
    global ac
    if ac is not None:
        ac.pause()
    else:
        print 'AudioCapturer must be running before attempting to pause.'
    return render_template('layout.html')


@app.route('/stop')
def stop():
    global ac, websocket_client
    if ac is not None and websocket_client is not None:
	ac.stop()
    else:
        print 'AudioCapturer must be running before attempting to stop.'

    ac = None
    websocket_client = None
    return render_template('layout.html')


if __name__ == '__main__':
    port_number = None
    try:
        port_number = sys.argv[1]
        websocket_url = sys.argv[2]
    except IndexError:
        print "input argv not correct"
    app.run(port=port_number)
    #ws = create_connection("ws://localhost:8080/websocket")
