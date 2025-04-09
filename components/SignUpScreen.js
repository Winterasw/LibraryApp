import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import AuthStyles from "./AuthStyles";

const SignUpScreen = ({ navigation }) => {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});

  // ตรวจสอบ email ต้องเป็น @spumail.net หรือ @spumail.com
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@(spumail\.net|spumail\.com)$/;
    return regex.test(email);
  };

  // ตรวจสอบว่า name ไม่มีตัวเลข
  const validateName = (name) => {
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(name);
  };

  // ตรวจสอบว่าเป็นตัวเลขเท่านั้น
  const isNumeric = (value) => {
    return /^[0-9]+$/.test(value);
  };

  // ตรวจสอบข้อมูลก่อนสมัคร
  const handleSignUp = () => {
    let newErrors = {};

    if (!studentId) {
      newErrors.studentId = "Student ID is required";
    } else if (!isNumeric(studentId)) {
      newErrors.studentId = "Student ID must contain only numbers";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Email must be @spumail.net or @spumail.com";
    }

    if (!name) {
      newErrors.name = "Name is required";
    } else if (!validateName(name)) {
      newErrors.name = "Name cannot contain numbers";
    }

    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!isNumeric(phone)) {
      newErrors.phone = "Phone number must contain only numbers";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("SignIn"); // ไปที่หน้า Sign In หลังจากสมัครเสร็จ
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
        <Text style={AuthStyles.subText}>Please sign up to login.</Text>
        <View style={AuthStyles.tabContainer}>
          <TouchableOpacity
            style={AuthStyles.tabButton}
            onPress={() => navigation.navigate("SignIn")}
          >
            <Text style={AuthStyles.inactiveText}>Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[AuthStyles.tabButton, AuthStyles.activeTab]}
          >
            <Text style={AuthStyles.activeText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Input Fields */}
      <View style={AuthStyles.inputContainer}>
        <Text style={AuthStyles.label}>Student ID</Text>
        <TextInput
          style={[AuthStyles.input, errors.studentId && AuthStyles.inputError]}
          placeholder="Your student ID"
          keyboardType="numeric"
          value={studentId}
          onChangeText={setStudentId}
        />
        {errors.studentId && (
          <Text style={AuthStyles.errorText}>{errors.studentId}</Text>
        )}

        <Text style={AuthStyles.label}>Password</Text>
        <TextInput
          style={[AuthStyles.input, errors.password && AuthStyles.inputError]}
          placeholder="Your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {errors.password && (
          <Text style={AuthStyles.errorText}>{errors.password}</Text>
        )}

        <Text style={AuthStyles.label}>Email</Text>
        <TextInput
          style={[AuthStyles.input, errors.email && AuthStyles.inputError]}
          placeholder="Your email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        {errors.email && (
          <Text style={AuthStyles.errorText}>{errors.email}</Text>
        )}

        <Text style={AuthStyles.label}>Name</Text>
        <TextInput
          style={[AuthStyles.input, errors.name && AuthStyles.inputError]}
          placeholder="Your name"
          value={name}
          onChangeText={setName}
        />
        {errors.name && <Text style={AuthStyles.errorText}>{errors.name}</Text>}

        <Text style={AuthStyles.label}>Phone number</Text>
        <TextInput
          style={[AuthStyles.input, errors.phone && AuthStyles.inputError]}
          placeholder="Your phone number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        {errors.phone && (
          <Text style={AuthStyles.errorText}>{errors.phone}</Text>
        )}
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity style={AuthStyles.button} onPress={handleSignUp}>
        <Text style={AuthStyles.buttonText}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUpScreen;
