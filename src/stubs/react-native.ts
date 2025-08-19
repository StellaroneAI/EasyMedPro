import React from 'react';
export const View: React.FC<any> = ({ children, ...props }) => <div {...props}>{children}</div>;
export const Text: React.FC<any> = ({ children, ...props }) => <span {...props}>{children}</span>;
export const Pressable: React.FC<any> = ({ children, onPress, ...props }) => (
  <button onClick={onPress} {...props}>{children}</button>
);
export const TouchableOpacity = Pressable;
export const Image: React.FC<any> = (props) => <img {...props} />;
export const StyleSheet = { create: (styles: any) => styles };
export const ActivityIndicator: React.FC<any> = () => <div>Loading...</div>;
export const NativeModules: any = {};
export const Platform = { OS: 'web' };
export class NativeEventEmitter {
  addListener() { return { remove() {} }; }
  removeAllListeners() {}
}
export default {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  NativeModules,
  Platform,
  NativeEventEmitter,
};
