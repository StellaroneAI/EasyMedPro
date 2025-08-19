export const speak = (_text: string, _options?: any) => {};
export default { speak };
export function speak(_text: string, _options?: any) {
  console.warn('Speech.speak is not implemented on web');
}
