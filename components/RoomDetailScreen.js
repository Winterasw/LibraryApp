import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { db } from "./firebaseConfig";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { AntDesign } from "@expo/vector-icons";
const RoomDetailScreen = ({ route, navigation }) => {
  const room = route.params.room;
  const [bookings, setBookings] = useState([]); // State สำหรับ timeslot
  const [modalVisible, setModalVisible] = useState(false);

  // ฟังการเปลี่ยนแปลงใน Firestore แบบเรียลไทม์
  useEffect(() => {
    const roomRef = doc(db, "meeting_rooms", room.room_number); // ระบุ document ใน Firestore
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.data();
        // console.log(roomData);

        const bookingsArray = Object.keys(roomData.bookings).map((key) => ({
          timeSlot: key,
          ...roomData.bookings[key],
        }));
        bookingsArray.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)); // เรียงลำดับเวลา
        setBookings(bookingsArray); // อัปเดต State เพื่อรีเรนเดอร์ UI
      }
    });

    return () => unsubscribe(); // หยุดฟังข้อมูลเมื่อ component ถูก unmount
  }, [room.room_number]);

  // ฟังก์ชันอัปเดต Booking Status ใน Firestore
  const updateBookingStatus = async (timeSlot, newStatus, user) => {
    try {
      const roomRef = doc(db, "meeting_rooms", room.room_number);
      const updatedBooking = {
        ...bookings.find((b) => b.timeSlot === timeSlot), // ค้นหา timeslot ที่ต้องการอัปเดต
        status: newStatus,
        userId: user,
      };

      const updatedBookings = {
        ...Object.fromEntries(bookings.map((b) => [b.timeSlot, b])), // แปลง bookings เป็น object
        [timeSlot]: updatedBooking, // อัปเดต timeslot ที่ต้องการ
      };

      await setDoc(roomRef, { bookings: updatedBookings }, { merge: true }); // อัปเดตใน Firestore

      Alert.alert("Booking updated successfully!");
    } catch (error) {
      console.error("Error updating booking:", error);
      Alert.alert("Failed to update booking.");
    }
  };

  // Render timeslot
  const renderBookingItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        updateBookingStatus(item.timeSlot, "booked", "user123"); // กดเพื่ออัปเดตเป็น "booked"
      }}
    >
      <View style={styles.timeSlot}>
        <View>
          <Text style={styles.modalText}>{`${item.start} - ${item.end}`}</Text>
        </View>
        <View>
          {item.status === "available" ? (
            <AntDesign name="checkcircleo" size={24} color="#33DB00" />
          ) : (
            <AntDesign name="closecircleo" size={24} color="#EA3323" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ข้อมูลห้องและการจอง */}
      <View style={styles.container1}>
        <Text style={styles.mainText}>{`Floor: ${room.floor}`}</Text>
        <Text
          style={styles.mainText}
        >{`Room Number: ${room.room_number}`}</Text>
      </View>
      <View style={styles.container2}>
        <Text style={[styles.mainText, styles.mainHeaderText]}>อุปกรณ์</Text>
        <Text style={styles.mainText}>{`${room.equipment}`}</Text>
        <Text style={[styles.mainText, styles.mainHeaderText]}>{` ขนาดห้อง ${
          room.capacity > 10 ? "ใหญ่" : "เล็ก"
        } `}</Text>
        <Text style={styles.mainText}>{` ${room.capacity} คน`}</Text>
      </View>

      {/* ปุ่มเปิด Modal */}
      <TouchableOpacity
        style={[styles.button, styles.buttonOpen]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.textStyle}>Show Time</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          console.log("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text
              style={[
                styles.modalText,
                { fontWeight: "bold", marginBottom: 20 },
              ]}
            >
              Choose booking time.
            </Text>
            {/* FlatList แสดงรายการการจอง */}
            <FlatList
              data={bookings}
              keyExtractor={(item, index) => item.timeSlot}
              renderItem={renderBookingItem}
            />
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = {
  container: { flex: 1, padding: 30, backgroundColor: "white" },
  container1: {
    backgroundColor: "#F4F3F3",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    borderRadius: 50,
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  container2: {
    backgroundColor: "#F4F3F3",
    alignItems: "center",
    flex: 5,
    borderRadius: 50,
    paddingVertical: 20,
    paddingHorizontal: 50,
    marginBottom: 15,
  },
  timeSlot: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 30,
    width: "100%",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#dbd9d9",
    borderRadius: 50,
  },
  button: {
    borderRadius: 40,
    padding: 12,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#ED008C",
  },
  buttonClose: {
    marginTop: 20,
    paddingHorizontal: 50,
    backgroundColor: "#330000",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 17,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 30,
    padding: 35,
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
  },
  modalText: {
    textAlign: "center",
    fontSize: 17,
  },
  mainText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 7,
  },
  mainHeaderText: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "bold",
  },
};

export default RoomDetailScreen;
