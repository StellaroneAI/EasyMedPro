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
export default {
  onSpeechStart: null,
  onSpeechEnd: null,
  onSpeechResults: null,
  start: async () => {
    console.warn('Voice.start is not implemented on web');
  },
  stop: async () => {
    console.warn('Voice.stop is not implemented on web');
  },
  removeAllListeners: () => {},
};
