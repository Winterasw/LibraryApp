import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { AntDesign } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import successAnim from "../assets/success.json"; // ไฟล์ checkmark animation

const RoomDetailScreen = ({ route, navigation }) => {
  // console.log(
  //   "RoomDetailScreen: Received route:",
  //   JSON.stringify(route, null, 2)
  // );

  const defaultImage =
    "https://developers.google.com/static/maps/documentation/streetview/images/error-image-generic.png";

  const userData = route.params.userData;
  const room = route.params.room;
  const [bookings, setBookings] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [secondModalVisible, setSecondModalVisible] = useState(false);
  const [timeConfirm, setTimeConfirm] = useState(""); // ค่า "" เริ่มต้นเพราะถ้า null จะอ่านค่า useEffect ไม่ได้
  const [alertModal, setAlertModal] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState("");
  const [loading, setLoading] = useState(true);
  const [isBookingExpired, setIsBookingExpired] = useState(false);

  // ฟังก์ชั่นอ่านค่า parameter จาก timeslot
  useEffect(() => {
    if (timeConfirm !== null) {
      // console.log("Updated timeConfirm:", timeConfirm);
    }
  }, [timeConfirm]);

  // ฟังการเปลี่ยนแปลงใน Firestore แบบเรียลไทม์
  useEffect(() => {
    const roomRef = doc(db, "meeting_rooms", room.room_number);

    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.data();
        // console.log(roomData);
        const bookingsArray = Object.keys(roomData.bookings).map((key) => ({
          timeSlot: key,
          ...roomData.bookings[key],
        }));
        bookingsArray.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)); // เรียงลำดับเวลา
        setBookings(bookingsArray);
      }
    });

    return () => unsubscribe(); // หยุดฟังข้อมูลเมื่อ component ถูก unmount
  }, [room.room_number]);

  useEffect(() => {
    const roomRef = doc(db, "meeting_rooms", room.room_number);
    const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.data();
        const bookingsArray = Object.keys(roomData.bookings).map((key) => ({
          timeSlot: key,
          ...roomData.bookings[key],
        }));
        bookingsArray.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
        setBookings(bookingsArray);
      }
    });

    return () => unsubscribeRoom();
  }, [room.room_number]);

  useEffect(() => {
    const userRef = doc(db, "user", userData.studentID);
    const unsubscribeUser = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const updatedUserData = docSnapshot.data();
        setUpdatedUserData(updatedUserData);
      } else {
        console.log("Document does not exist");
      }
    });

    return () => unsubscribeUser();
  }, [userData?.studentID]);

  // ฟังก์ชันอัปเดต Booking Status ใน Firestore
  const updateBookingStatus = async (timeConfirm, newStatus, user) => {
    try {
      const userRef = doc(db, "user", user);
      const roomRef = doc(db, "meeting_rooms", room.room_number);
      const updatedBooking = {
        ...bookings.find((b) => b.timeSlot === timeConfirm.timeSlot), // ค้นหา timeslot ที่ต้องการอัปเดต
        status: newStatus,
        userId: user,
      };

      const updatedBookings = {
        ...Object.fromEntries(bookings.map((b) => [b.timeSlot, b])), // แปลง bookings เป็น object
        [timeConfirm.timeSlot]: updatedBooking, // อัปเดต timeslot ที่ต้องการ
      };
      await setDoc(
        userRef,
        {
          bookingroom: room.room_number,
          bookingstart: timeConfirm.start,
          bookingend: timeConfirm.end,
          bookingfloor: room.floor,
        },
        { merge: true }
      ); // อัปเดตใน Firestore
      await setDoc(roomRef, { bookings: updatedBookings }, { merge: true }); // อัปเดตใน Firestore

      console.log("Booking updated successfully!");
    } catch (error) {
      console.error("Error updating booking:", error);
      Alert.alert("Failed to update booking.");
    }
  };

  // Render timeslot
  const renderBookingItem = ({ item }) => (
    <TouchableOpacity
      disabled={item.status === "booked" || updatedUserData.bookingroom != ""}
      onPress={() => {
        // console.log("Log items : ", item);
        setTimeConfirm(item);
        setModalVisible(false); // ปิด Modal แรก
        setSecondModalVisible(true);
      }}
    >
      <View
        style={[
          styles.timeSlot,
          item.status === "booked" && styles.disabledTimeSlot,
          updatedUserData.bookingroom != "" && styles.disabledTimeSlot,
        ]}
      >
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

  const confirmBooking = () => {
    setSecondModalVisible(!secondModalVisible);
    console.log(
      "Room info | ",
      " Floor : ",
      room.floor,
      " | Room Number : ",
      room.room_number,
      " | Equipment : ",
      room.equipment,
      " | Capacity : ",
      room.capacity
    );

    updateBookingStatus(timeConfirm, "booked", userData.studentID); // กดเพื่ออัปเดตเป็น "booked"
    console.log("time start : ", timeConfirm.start);
    console.log("time end : ", timeConfirm.end);
    setAlertModal(true);
    setTimeout(() => {
      setAlertModal(false);
    }, 2500); // 2000 = 2 วินาที
  };

  const checkExpiration = async () => {
    const currentTime = Timestamp.now(); // เวลาปัจจุบันใน UTC
    const bookingEnd = Timestamp.fromDate(new Date("2025-04-23T12:00:00Z")); // เวลาสิ้นสุด
    console.log(currentTime.seconds);

    if (currentTime.seconds >= bookingEnd.seconds) {
      console.log("Expired");
      cancelBooking();
    } else {
      console.log("Still counting...");
    }
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     checkExpiration();
  //   }, 2000);
  //   return () => clearInterval(interval); // ยกเลิก interval เมื่อ component ถูก unmount
  // }, []);

  return (
    <View style={styles.container}>
      {/* ข้อมูลห้องและการจอง */}
      <View style={styles.container1}>
        <Text style={[styles.mainText, styles.mainHeaderText]}>
          {room.roomname}
        </Text>

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

        <Image
          source={{ uri: room.url || defaultImage }}
          style={styles.image}
        />
      </View>

      {/* ปุ่มเปิด Modal */}
      <TouchableOpacity
        style={[styles.button, styles.buttonOpen]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.textStyle}>Show Time</Text>
      </TouchableOpacity>

      {/* first Modal */}
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
      {/* Confirm booking,Second modal*/}
      <Modal
        animationType="fade"
        transparent={true}
        visible={secondModalVisible}
        onRequestClose={() => {
          console.log("Modal has been closed.");
          setSecondModalVisible(!secondModalVisible);
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
              Confirm booking
            </Text>
            {/* View แสดงรายการการจอง */}
            <View>
              <View style={[{ marginBottom: 20 }]}>
                <Text style={styles.mainText}>{`Floor: ${room.floor}`}</Text>
                <Text
                  style={styles.mainText}
                >{`Room Number: ${room.room_number}`}</Text>
              </View>
              <View>
                <Text style={[styles.mainText, styles.mainHeaderText]}>
                  อุปกรณ์
                </Text>
                <Text style={styles.mainText}>{`${room.equipment}`}</Text>
                <Text
                  style={[styles.mainText, styles.mainHeaderText]}
                >{` ขนาดห้อง ${room.capacity > 10 ? "ใหญ่" : "เล็ก"} `}</Text>
                <Text style={styles.mainText}>{` ${room.capacity} คน`}</Text>
                <Text
                  style={[styles.mainText, styles.mainHeaderText]}
                >{`เวลา ${timeConfirm.start} - ${timeConfirm.end}`}</Text>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.Twobutton, styles.buttonClose]}
                onPress={() => setSecondModalVisible(!secondModalVisible)}
              >
                <Text style={styles.textStyle}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.Twobutton, styles.buttonConfirm]}
                onPress={() => confirmBooking()}
              >
                <Text style={styles.textStyle}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Alert confirm modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={alertModal}
        onRequestClose={() => {
          setAlertModal(!alertModal);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <LottieView
              source={successAnim}
              autoPlay
              loop={false}
              style={{ width: 120, height: 120 }}
            />
            <Text style={styles.mainText}>จองห้องสำเร็จ!!!</Text>
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
  disabledTimeSlot: {
    opacity: 0.5,
  },
  button: {
    borderRadius: 40,
    padding: 12,
    elevation: 2,
    paddingHorizontal: 20,
  },
  buttonOpen: {
    backgroundColor: "#ED008C",
  },
  buttonClose: {
    marginTop: 20,
    backgroundColor: "#adadad",
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
  image: {
    width: "100%",
    height: "60%",
    resizeMode: "cover",
    marginTop: 15,
    borderRadius: 15,
  },
};

export default RoomDetailScreen;
