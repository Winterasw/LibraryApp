import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
} from "react-native";
import LottieView from "lottie-react-native";
import welcomeAnim from "../assets/welcome.json"; // ไฟล์ checkmark animation
import * as SecureStore from "expo-secure-store";
const SettingsScreen = ({ navigation }) => {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [logoutAnim, setLogoutAnim] = useState(false);
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("studentId");
    await SecureStore.deleteItemAsync("password");
    setLogoutAnim(true),
      setTimeout(() => {
        setLogoutAnim(false);
        setConfirmLogout(false);
        console.log("log out!");
        navigation.reset({
          index: 0,
          routes: [{ name: "SignIn" }],
        });
      }, 2500);
  };

  return (
    <View style={styles.container}>
      {/* โลโก้ ให้อยู่ตรงกลางบนปุ่มเปลี่ยนภาษา */}
      <Image
        source={{
          uri: "https://upload.wikimedia.org/wikipedia/commons/8/8c/New_logo_spu_%28Converted%29.png",
        }}
        style={styles.logo}
      />

      {/* รายการเมนู */}
      <View style={styles.menuContainer}>
        <TouchableOpacity onPress={() => console.log("คำถามที่พบบ่อย")}>
          <Text style={styles.menuText}>คำถามที่พบบ่อย</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log("เกี่ยวกับเรา")}>
          <Text style={styles.menuText}>เกี่ยวกับเรา</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log("นโยบายความเป็นส่วนตัว")}>
          <Text style={styles.menuText}>นโยบายความเป็นส่วนตัว</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log("ให้คะแนนฉัน")}>
          <Text style={styles.menuText}>ให้คะแนนฉัน</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => setConfirmLogout(true)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteText}>ออกจากระบบ</Text>
      </TouchableOpacity>
      {/* Logout Confirmation */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmLogout}
        onRequestClose={() => {
          setConfirmLogout(!confirmLogout);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text
              style={{
                fontSize: 17,
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              คุณต้องออกจากระบบใช่หรือไม่
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.Twobutton, styles.buttonClose]}
                onPress={() => setConfirmLogout(!confirmLogout)}
              >
                <Text style={styles.textStyle}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.Twobutton, styles.buttonConfirm]}
                onPress={() => handleLogout()}
              >
                <Text style={styles.textStyle}>ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Animation */}

      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutAnim}
        onRequestClose={() => {
          setLogoutAnim(!logoutAnim);
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
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 20 },
  backButton: { position: "absolute", top: 20, left: 10, padding: 10 },
  logo: {
    width: 180,
    height: 60,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  languageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 20,
  },
  languageText: { fontSize: 18 },
  changeText: { fontSize: 18, color: "blue" },
  menuContainer: { marginTop: 10 },
  menuText: { fontSize: 18, marginVertical: 10 },
  deleteButton: { marginTop: 30, alignItems: "center" },
  deleteText: { color: "red", fontSize: 18 },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 15,
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
    height: "20%",
    justifyContent: "center",
  },

  modalText: {
    fontSize: 18,
    marginTop: 10,
    textAlign: "center",
  },
  buttonContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  Twobutton: {
    marginTop: 20,
    borderRadius: 40,
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 2,
  },
  buttonConfirm: {
    backgroundColor: "#ED008C",
  },
  buttonClose: {
    marginTop: 20,
    backgroundColor: "#adadad",
  },
});

export default SettingsScreen;
