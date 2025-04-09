import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

const SettingsScreen = ({ language, setLanguage, navigation }) => {
  return (
    <View style={styles.container}>
      {/* โลโก้ ให้อยู่ตรงกลางบนปุ่มเปลี่ยนภาษา */}
      <Image
        source={{
          uri: "https://upload.wikimedia.org/wikipedia/commons/8/8c/New_logo_spu_%28Converted%29.png",
        }}
        style={styles.logo}
      />

      {/* การตั้งค่าภาษา */}
      <View style={styles.languageContainer}>
        <Text style={styles.languageText}>
          {language === "en" ? "Language" : "ภาษา"}
        </Text>
        <TouchableOpacity
          onPress={() => setLanguage(language === "en" ? "th" : "en")}
        >
          <Text style={styles.changeText}>
            {language === "en" ? "Change" : "เปลี่ยน"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* รายการเมนู */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("InfoScreen", { title: "FAQ", type: "faq" })
          }
        >
          <Text style={styles.menuText}>
            {language === "en" ? "FAQ" : "คำถามที่พบบ่อย"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("InfoScreen", {
              title: "About Us",
              type: "about",
            })
          }
        >
          <Text style={styles.menuText}>
            {language === "en" ? "About Us" : "เกี่ยวกับเรา"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("InfoScreen", {
              title: "Privacy Policy",
              type: "privacy",
            })
          }
        >
          <Text style={styles.menuText}>
            {language === "en" ? "Privacy Policy" : "นโยบายความเป็นส่วนตัว"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log("Rate Us Pressed")}>
          <Text style={styles.menuText}>
            {language === "en" ? "Rate Us" : "ให้คะแนนฉัน"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log("Logout Pressed")}>
          <Text style={styles.menuText}>
            {language === "en" ? "Logout" : "ออกจากระบบ"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ลบบัญชี */}
      <TouchableOpacity style={styles.deleteButton}>
        <Text style={styles.deleteText}>
          {language === "en" ? "Delete This Account" : "ลบบัญชีนี้"}
        </Text>
      </TouchableOpacity>
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
});

export default SettingsScreen;
