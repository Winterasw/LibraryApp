import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, TextInput } from "react-native";
import AuthStyles from "./AuthStyles";

const SignInScreen = ({ navigation }) => {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
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
      navigation.replace("Main");
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
    </View>
  );
};

export default SignInScreen;
