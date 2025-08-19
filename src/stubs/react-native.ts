import React from 'react';

export const View: React.FC<any> = ({ children, ...props }) => <div {...props}>{children}</div>;
export const Text: React.FC<any> = ({ children, ...props }) => <span {...props}>{children}</span>;
export const ScrollView: React.FC<any> = ({ children, ...props }) => <div {...props}>{children}</div>;
export const TouchableOpacity: React.FC<any> = ({ children, ...props }) => <button {...props}>{children}</button>;
export const Pressable = TouchableOpacity;
export const Image: React.FC<any> = ({ source, ...props }) => {
  const src = typeof source === 'string' ? source : source?.uri;
  return <img src={src} {...props} />;
};
export const ActivityIndicator: React.FC<any> = () => <div>Loading...</div>;
export const TextInput: React.FC<any> = (props) => <input {...props} />;
export const StyleSheet = { create: (styles: any) => styles };

export default {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Image,
  ActivityIndicator,
  TextInput,
  StyleSheet,
};
