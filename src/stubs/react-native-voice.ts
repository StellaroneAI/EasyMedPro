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
