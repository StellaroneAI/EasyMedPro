class VoiceStub {
  onSpeechStart?: Function;
  onSpeechRecognized?: Function;
  onSpeechEnd?: Function;
  onSpeechError?: Function;
  onSpeechResults?: Function;
  onSpeechPartialResults?: Function;
  onSpeechVolumeChanged?: Function;

  start() { return Promise.resolve(); }
  stop() { return Promise.resolve(); }
  destroy() { return Promise.resolve(); }
  removeAllListeners() {}
}

const Voice = new VoiceStub();

Voice.start = async () => {
    console.warn('Voice.start is not implemented on web');
  };
Voice.stop = async () => {
    console.warn('Voice.stop is not implemented on web');
  };
Voice.removeAllListeners = () => {};

export default Voice;
