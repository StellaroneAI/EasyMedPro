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

export default new VoiceStub();
