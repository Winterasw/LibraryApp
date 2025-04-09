import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; 

const ForgotPasswordScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState(""); // เก็บค่าหมายเลขโทรศัพท์
  const [error, setError] = useState(""); // ข้อความแจ้งเตือนเมื่อกรอกผิด

  // ฟังก์ชันตรวจสอบหมายเลขโทรศัพท์
  const validatePhoneNumber = (input) => {
    const numericInput = input.replace(/\D/g, ""); // ลบอักขระที่ไม่ใช่ตัวเลข
    setPhoneNumber(numericInput);

    if (numericInput.length !== 9) {
      setError("Please enter a valid 9-digit Thai phone number.");
    } else {
      setError(""); // ไม่มี error ถ้ากรอกถูกต้อง
    }
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Forgot password?</Text>
      <Text style={styles.subText}>
        If you need help resetting your password we can help by sending you link.
      </Text>

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={20} color="gray" style={styles.icon} />
        <TextInput 
          style={styles.input} 
          placeholder="+66 912345678"
          keyboardType="numeric"
          placeholderTextColor="gray"
          maxLength={9} // จำกัดให้พิมพ์ได้แค่ 9 ตัว
          value={phoneNumber}
          onChangeText={validatePhoneNumber}
        />
      </View>

      {/* Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Continue Button */}
      <TouchableOpacity 
      style={[styles.button, { backgroundColor: phoneNumber.length === 9 ? "#FF007F" : "#ccc" }]} 
      disabled={phoneNumber.length !== 9} // ปิดปุ่มถ้าเบอร์โทรไม่ครบ 9 ตัว
      onPress={() => navigation.navigate("OTPVerificationScreen")} // เปลี่ยนเป็นชื่อหน้าที่จะไป
      >
      <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.signUpText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

// สไตล์ของหน้า Forgot Password
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
    borderRadius: 10,
    paddingHorizontal: 15,
    width: "100%",
    height: 50,
    marginBottom: 5,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  button: {
    borderRadius: 25,
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signUpText: {
    marginTop: 20,
    color: "gray",
    fontSize: 14,
  },
});

export default ForgotPasswordScreen;