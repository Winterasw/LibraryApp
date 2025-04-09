import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore"; // แก้จาก addDoc เป็น setDoc

import NewsScrollView from "./NewsScrollView";
import { Ionicons, AntDesign } from "@expo/vector-icons";

const HomeScreen = ({ navigation }) => {
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <Image
            source={require("./picture/spu_logo.png")}
            style={styles.logo}
          />
          <Text style={styles.headerTitleText}>Home</Text>
          <View style={styles.iconContainer}>
            <AntDesign name="bells" size={24} color="black" />
          </View>
        </View>
      ),
    });
  }, [navigation]);

  const addBookingData = async () => {
    const floors = [4, 5, 6]; // ตัวอย่างชั้น
    const equipmentOptions = [
      ["Projector", "Whiteboard"],
      ["TV", "Microphone"],
      ["Projector", "Whiteboard", "TV"],
    ];
    const times = Array.from({ length: 10 }, (_, i) => {
      const hour = 8 + i;
      return `${hour.toString().padStart(2, "0")}:00`;
    });

    try {
      for (let i = 0; i < floors.length; i++) {
        const floor = floors[i]; // ดึงชั้นจาก array floors

        for (let j = 0; j < 6; j++) {
          // สมมติว่ามี 6 ห้องต่อชั้น
          const room_number = `${floor}${(j + 1).toString().padStart(2, "0")}`; // เช่น 401, 402, ..., 406
          const roomId = room_number; // room1, room2, ..., room18
          const capacity = 10 + ((i * 6 + j) % 5) * 10; // คำนวณจำนวนคน (10, 20, 30, ...)
          const equipment =
            equipmentOptions[(i * 6 + j) % equipmentOptions.length];

          // สร้างข้อมูลห้องและเวลา booking รวมกัน
          const roomData = {
            room_number,
            floor,
            capacity,
            equipment,
            bookings: {},
          };

          // เพิ่มข้อมูลการจองใน bookings ของแต่ละห้อง
          for (const time of times) {
            const endHour = (parseInt(time.split(":")[0]) + 1)
              .toString()
              .padStart(2, "0");

            // ใช้เวลาเป็นเอกลักษณ์
            const docId = `${time}`;

            roomData.bookings[docId] = {
              start: time,
              end: `${endHour}:00`,
              status: "available",
              userId: null, // กำหนดว่าเริ่มต้นไม่มีการจอง
            };
          }

          // เพิ่มข้อมูลห้องและการจองทั้งหมดใน Firestore ในครั้งเดียว
          await setDoc(doc(db, "meeting_rooms", roomId), roomData);

          console.log(`✅ เพิ่มข้อมูลห้อง + เวลา ${roomId}`);
        }
      }

      Alert.alert("เพิ่มข้อมูลห้อง + เวลา ครบเรียบร้อย ✅");
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error);
      Alert.alert("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.topIconContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("Booklist")}>
            <View style={styles.bookIcon}>
              <Ionicons name="book" size={35} color="black" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 🆕 ปุ่มเพิ่มข้อมูล */}
        <TouchableOpacity style={styles.addButton} onPress={addBookingData}>
          <Text style={styles.addButtonText}>เพิ่มข้อมูลจองห้อง</Text>
        </TouchableOpacity>

        <NewsScrollView />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    alignItems: "center",
  },
  topIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 20,
  },
  bookIcon: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "grey",
    borderRadius: 100,
    width: 80,
    height: 80,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  headerTitleText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  iconContainer: {
    width: 40,
    alignItems: "flex-end",
  },

  // 🆕 สไตล์ของปุ่มเพิ่มข้อมูล
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 20,
    alignSelf: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default HomeScreen;
