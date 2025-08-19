
export const Audio = {
  requestPermissionsAsync: async () => ({ status: 'granted' }),
  Sound: class {
    async loadAsync() {}
    async playAsync() {}
    unloadAsync() {}
  }
};

export default { Audio };
