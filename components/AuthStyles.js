import { StyleSheet } from "react-native";

const AuthStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingHorizontal: 35,
  },
  topContainer: {
    alignItems: "center",
    // backgroundColor: "green",
    marginTop: 50,
  },
  logo: {
    width: 80,

    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subText: {
    color: "#888888",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  inputContainer: {
    width: "100%",
    alignItems: "flex-start",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    color: "#EC008C",
    marginBottom: 20,
  },
  button: {
    width: "100%",
    backgroundColor: "#EC008C",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signUpText: {
    color: "#EC008C",
    marginTop: 20,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: 10,
    borderRadius: 50,
  },

  // 🔹 **แก้ปุ่ม Sign In / Sign Up ให้สมมาตร**
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#eee",
    borderRadius: 25,
    width: "100%", // Changed to 100%
    maxWidth: 350, // Added maxWidth to control width
    padding: 5,
    justifyContent: "space-around", // Changed to space-around
    marginBottom: 20,
  },
  tabButton: {
    flex: 0.5, // Changed to 0.5
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#ff0080",
  },
  activeText: {
    color: "white",
    fontWeight: "bold",
  },
  inactiveText: {
    color: "gray",
  },
  errorText : {
    textAlign: "right",
    color : 'red'
  }
});

export default AuthStyles;
