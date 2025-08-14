import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

export default function HelloButton() {
  const [count, setCount] = useState(0);
  return (
    <View>
      <Pressable onPress={() => setCount(c => c + 1)}>
        <Text>Hello</Text>
      </Pressable>
      <Text testID="count">{count}</Text>
    </View>
  );
}
