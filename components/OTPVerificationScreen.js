import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const OTPVerificationScreen = ({ navigation }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // เก็บค่า OTP ทีละช่อง
  const [error, setError] = useState(""); // ข้อความแจ้งเตือน
  const [timer, setTimer] = useState(300); // ตั้งเวลา 5 นาที (300 วินาที)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // แปลงวินาทีเป็น นาที:วินาที
  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  // เมื่อผู้ใช้กรอก OTP
  const handleOtpChange = (value, index) => {
    let newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, "").slice(-1); // รับแค่ตัวเลข 1 ตัว
    setOtp(newOtp);

    // ตรวจสอบว่ากรอกครบ 6 หลักหรือยัง
    if (newOtp.join("").length === 6) {
      setError("");
    } else {
      setError("Please enter a 6-digit OTP.");
    }
  };

  // ฟังก์ชัน Verify OTP
  const handleVerifyOTP = () => {
    if (otp.join("").length === 6) {
      navigation.navigate("ResetPasswordScreen"); // ✅ ไปหน้า Reset Password
    } else {
      setError("Invalid OTP. Please check again.");
    }
  };

  // ฟังก์ชัน Resend OTP
  const handleResend = () => {
    setTimer(300); // รีเซ็ตเวลา 5 นาที
    setOtp(["", "", "", "", "", ""]); // ล้าง OTP
    setError(""); // ล้าง error
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot password?</Text>
      <Text style={styles.subText}>
        Please enter the 6-digit code sent to you at {"\n"}
        <Text style={styles.phoneText}>+66 81 111 1111</Text>
      </Text>

      {/* OTP Input */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpBox}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
          />
        ))}
      </View>

      {/* Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Timer */}
      <Text style={styles.timerText}>
        This code will expire in <Text style={styles.boldText}>{formatTime()} minutes</Text>
      </Text>

      {/* Verify Button */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: otp.join("").length === 6 ? "#FF007F" : "#ccc" }]} 
        disabled={otp.join("").length !== 6} 
        onPress={() => navigation.navigate("ResetPassword")} // เปลี่ยนจาก "NewPasswordScreen" เป็น "ResetPassword"
      >
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>

      {/* Resend Code */}
      <TouchableOpacity onPress={handleResend}>
        <Text style={styles.resendText}>Resend Code</Text>
      </TouchableOpacity>
    </View>
  );
};

// สไตล์ของหน้า OTP Verification
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
  phoneText: {
    fontWeight: "bold",
    color: "#000",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  otpBox: {
    width: 50,
    height: 50,
    backgroundColor: "#F3F3F3",
    textAlign: "center",
    fontSize: 18,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    alignSelf: "center",
  },
  timerText: {
    fontSize: 14,
    color: "gray",
    marginBottom: 20,
  },
  boldText: {
    fontWeight: "bold",
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
  resendText: {
    marginTop: 20,
    color: "#FF007F",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default OTPVerificationScreen;
