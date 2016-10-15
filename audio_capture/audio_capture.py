import pyaudio
import wave


class AudioCapturer(object):
    CHUNK = 8192
    FORMAT = pyaudio.paInt16
    CHANNELS = 2
    RATE = 44100

    def __init__(self):
        self.frames = []
        self.p = pyaudio.PyAudio()
        self.stream = self.p.open(format=AudioCapturer.FORMAT,
                                  channels=AudioCapturer.CHANNELS,
                                  rate=AudioCapturer.RATE, input=True,
                                  frames_per_buffer=AudioCapturer.CHUNK,
                                  stream_callback=lambda data, frame_count, time_info, status: self._callback(data))
        self.process_callback = None
        self.sample_size = self.p.get_sample_size(AudioCapturer.FORMAT)

    def _callback(self, data):
        if self.process_callback:
            self.process_callback(data)
        else:
            self.default_callback(data)
        return data, pyaudio.paContinue

    def default_callback(self, data):
        self.frames.append(data)

    def run(self, process_callback=None):
        self.process_callback = process_callback
        self.stream.start_stream()

    def pause(self):
        self.stream.stop_stream()

    def stop(self):
        self.stream.stop_stream()
        self.stream.close()
        self.p.terminate()

    def save_audio_file(self, filename, frames=None):
        if not frames:
            frames = self.frames
        wf = wave.open(filename, 'wb')
        wf.setnchannels(AudioCapturer.CHANNELS)
        wf.setsampwidth(self.sample_size)
        wf.setframerate(AudioCapturer.RATE)
        wf.writeframes(b''.join(frames))
        wf.close()


def test():
    import time
    AC = AudioCapturer()
    f = []
    AC.run(process_callback=lambda data: f.append(data))
    print "recording..."
    for i in xrange(1, 5):
        time.sleep(1)
    AC.stop()
    print "done..."
    AC.save_audio_file('output.wav', f)

if __name__ == '__main__':
    test()
