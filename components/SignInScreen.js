import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  StyleSheet,
} from "react-native";
import AuthStyles from "./AuthStyles";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import LottieView from "lottie-react-native";
import welcomeAnim from "../assets/welcome.json"; // ไฟล์ checkmark animation

const SignInScreen = ({ navigation }) => {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const handleSubmit = async () => {
    try {
      // ตรวจสอบว่า Student ID และ Password ไม่เป็นค่าว่าง
      let newErrors = {};

      if (!studentId) {
        newErrors.studentId = "Student ID is required";
      } else if (!/^\d+$/.test(studentId)) {
        newErrors.studentId = "Student ID must contain only numbers";
      }

      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0) {
        // ดึงข้อมูลผู้ใช้จาก Firestore
        const userRef = doc(db, "user", studentId); // ใช้ studentId เป็น document ID
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();

          // ตรวจสอบรหัสผ่าน
          if (userData.password === password) {
            console.log(
              "SignInScreen: Sending userData:",
              JSON.stringify(userData)
            );
            setAlertMessage(`Welcome ${userData.username}`);
            setModalVisible(true);
            setTimeout(() => {
              navigation.replace("Main", { userData }); // ไปยังหน้าหลัก
              setModalVisible(false);
            }, 2500); // 2000 = 2 วินาที
          } else {
            setAlertMessage("Invalid password.");
            setModalVisible(true);
            setTimeout(() => {
              setModalVisible(false);
            }, 1500);
          }
        } else {
          setAlertMessage("Student ID not found.");
          setModalVisible(true);
          setTimeout(() => {
            setModalVisible(false);
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error logging in:", error.message);
      setAlertMessage("Error", "An error occurred during login.");
      setModalVisible(true);
    }
  };

  return (
    <View style={AuthStyles.container}>
      {/* Logo */}
      <View style={AuthStyles.topContainer}>
        <Image
          source={{
            uri: "https://i.pinimg.com/564x/28/ca/4f/28ca4f0985d14ed967023d218c698475.jpg",
          }}
          style={AuthStyles.logo}
        />
        <Text style={AuthStyles.title}>WELCOME</Text>
        <Text style={AuthStyles.subText}>Please sign in to continue.</Text>

        {/* Tabs */}
        <View style={AuthStyles.tabContainer}>
          <TouchableOpacity
            style={[AuthStyles.tabButton, AuthStyles.activeTab]}
          >
            <Text style={AuthStyles.activeText}>Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={AuthStyles.tabButton}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={AuthStyles.inactiveText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Input Fields */}
      <View style={AuthStyles.inputContainer}>
        <Text style={AuthStyles.label}>Student ID</Text>
        <TextInput
          style={[
            AuthStyles.input,
            errors.studentId && AuthStyles.inputError, // ถ้ามี error ให้มีกรอบแดง
          ]}
          placeholder="Your student ID"
          placeholderTextColor="#888"
          value={studentId}
          onChangeText={setStudentId}
          keyboardType="numeric"
        />
        {errors.studentId && (
          <Text style={AuthStyles.errorText}>{errors.studentId}</Text>
        )}

        <Text style={AuthStyles.label}>Password</Text>
        <TextInput
          style={[
            AuthStyles.input,
            errors.password && AuthStyles.inputError, // ถ้ามี error ให้มีกรอบแดง
          ]}
          placeholder="Your password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {errors.password && (
          <Text style={AuthStyles.errorText}>{errors.password}</Text>
        )}
      </View>

      {/* Forgot Password Button */}
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={AuthStyles.forgotPassword}>Forgot password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity onPress={handleSubmit} style={AuthStyles.button}>
        <Text style={AuthStyles.buttonText}>Login</Text>
      </TouchableOpacity>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <LottieView
              source={welcomeAnim}
              autoPlay
              loop={false}
              style={{ width: 100, height: 100 }}
            />
            <Text style={styles.modalText}>{alertMessage}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%", // เพิ่มความกว้างของ Modal
    height: "30%", // เพิ่มความสูง
    justifyContent: "center", // จัดให้อยู่ตรงกลาง
  },
  boxText: {
    flex: 2, // ลดขนาดลง
    justifyContent: "center",
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginTop: 10,
    textAlign: "center",
  },
});
export default SignInScreen;
