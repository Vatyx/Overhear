from flask import Flask
from threading import Thread
import sys
from audio_capture import AudioCapturer
from websocket import *
from base64 import b64encode

app = Flask(__name__)

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


@app.route('/')
def main():
    return "Running now..."


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
    ac.pause()
    return 'pause'


@app.route('/stop')
def stop():
    global ac, websocket_client
    ac.stop()
    websocket_client.close()
    ac = None
    websocket_client = None
    return 'stop'


if __name__ == '__main__':
    port_number = None
    try:
        port_number = sys.argv[1]
        websocket_url = sys.argv[2]
    except IndexError:
        print "input argv not correct"
    app.run(port=port_number)
    #ws = create_connection("ws://localhost:8080/websocket")