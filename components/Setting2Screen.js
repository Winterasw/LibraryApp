import { StyleSheet, Text, View, Button } from "react-native";
import React from "react";

import NewsScrollView from "./NewsScrollView";

const Setting2Screen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text>Setting 2 Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Setting2Screen;
