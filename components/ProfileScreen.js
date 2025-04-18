import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import React, { useState, useLayoutEffect, useEffect } from "react";
import { AntDesign } from "@expo/vector-icons";
import { db } from "./firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
} from "firebase/firestore"; // แก้จาก addDoc เป็น setDoc

const profileImage = {
  uri: "https://cdn.readawrite.com/articles/5887/5886037/thumbnail/small.gif?1",
};

const ProfileScreen = ({ navigation, route }) => {
  // console.log("ProfileScreen: Received route:", JSON.stringify(route, null, 2));

  const [hasBooking, setHasBooking] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState(null);
  const userData = route.params?.userData; // ใช้ Optional Chaining (?.)

  useEffect(() => {
    const userRef = doc(db, "user", userData.studentID);
    const unsubscribeUser = onSnapshot(
      userRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const updatedUserData = docSnapshot.data();
          setUpdatedUserData(updatedUserData);
          console.log("Real-time Updated  User Data: ", updatedUserData);

          // ตรวจสอบการจองห้อง แล้วแสดงผล View
          if (updatedUserData.bookingroom || updatedUserData.bookingfloor) {
            setHasBooking(true);
          } else {
            setHasBooking(false);
          }
        } else {
          console.log("Document does not exist");
          setHasBooking(false);
        }
      },
      (error) => {
        console.error("Error listening to document:", error);
      }
    );

    // คืนค่าฟังก์ชัน unsubscribe เมื่อ component ถูก unmount
    return () => {
      unsubscribeUser();
    };
  }, [userData?.studentID]);

  const cancelBooking = async () => {
    try {
      const userRef = doc(db, "user", userData.studentID);
      const roomRef = doc(db, "meeting_rooms", userData.bookingroom);
      const roomData = await getDoc(roomRef);
      const roomBookings = roomData.data().bookings;
      await setDoc(
        userRef,
        {
          bookingroom: "",
          bookingstart: "",
          bookingend: "",
          bookingfloor: "",
        },
        { merge: true }
      );

      const updatedBookings = {
        ...roomBookings,
        [userData.bookingstart]: {
          ...roomBookings[userData.bookingstart],
          status: "available",
          userId: null,
        },
      };

      await setDoc(roomRef, { bookings: updatedBookings }, { merge: true });

      console.log("Booking canceled successfully!");
    } catch (error) {
      console.error("Error canceling booking:", error);
      Alert.alert("Failed to cancel booking.");
    }
  }; // ใช้ useLayoutEffect เพื่อเพิ่มปุ่มฟันเฟืองใน header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ width: "170%", marginRight: 20, backgroundColor: "Green" }}
          onPress={() => navigation.navigate("Setting")}
        >
          <AntDesign name="setting" size={27} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* ส่วนโปรไฟล์ */}
      <View
        style={{
          backgroundColor: "#f5f5f5",
          marginHorizontal: 20,
          marginTop: 20,
          borderRadius: 15,
          padding: 20,
          alignItems: "center",
        }}
      >
        <Image
          source={profileImage}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />

        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 10 }}>
          {userData.username}
        </Text>
        <Text style={{ fontSize: 20 }}>{userData.studentID}</Text>
        <Text style={{ color: "gray", marginTop: 1 }}>📧 {userData.email}</Text>
      </View>

      {/* แสดงข้อมูลการจองห้อง */}
      {hasBooking ? (
        <View
          style={{
            backgroundColor: "#ED008C",
            marginHorizontal: 20,
            marginTop: 20,
            borderRadius: 15,
            padding: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>ห้องที่จอง</Text>
          <Text style={{ color: "white", fontSize: 16 }}>
            เวลา {updatedUserData.bookingstart} - {updatedUserData.bookingend}
          </Text>
          <Text style={{ color: "white", fontSize: 16 }}>
            เลขที่ห้อง {updatedUserData.bookingroom} ชั้น{" "}
            {updatedUserData.bookingfloor}
          </Text>

          {/* ปุ่มยกเลิกการจอง */}
          <TouchableOpacity
            onPress={cancelBooking}
            style={{
              marginTop: 15,
              backgroundColor: "white",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "#e91e63", fontWeight: "bold" }}>
              ยกเลิกการจองห้อง
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text style={{ color: "gray", fontSize: 16 }}>ไม่มีการจองห้อง</Text>
        </View>
      )}
    </View>
  );
};

export default ProfileScreen;
