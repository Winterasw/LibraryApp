import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("SignIn");
    }, 2000);

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SPU</Text>
      <Text style={styles.subText}>Library</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EC008C",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    color: "#fff",
    fontSize: 50,
    fontWeight: "bold",
  },
  subText: {
    color: "#fff",
    fontSize: 20,
  },
});
