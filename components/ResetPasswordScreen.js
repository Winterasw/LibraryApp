import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function ResetPasswordScreen({ navigation }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = () => {
    if (password.length >= 8) {
      setError("");
      navigation.navigate("SignIn"); // ✅ ไปหน้า Sign In
    } else {
      setError("Password must be at least 8 characters");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset your password.</Text>
      <Text style={styles.subtitle}>
        If you need help resetting your password, we can help by sending you a link.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New password</Text>
        <TextInput
          style={styles.input}
          placeholder="New password"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: password.length >= 8 ? "#FF007F" : "#ccc" }]}
        disabled={password.length < 8}
        onPress={handleResetPassword}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff", // พื้นหลังสีขาว
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    padding: 12,
    backgroundColor: "#EAEAEA",
    borderRadius: 25, // ปรับให้ขอบโค้ง
    textAlign: "left",
    paddingLeft: 15,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 12,
  },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 25, // ปรับขอบให้โค้งมน
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});