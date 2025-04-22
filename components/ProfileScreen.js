import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useState, useLayoutEffect, useEffect } from "react";
import { AntDesign } from "@expo/vector-icons";
import { db } from "./firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore"; // แก้จาก addDoc เป็น setDoc
import LottieView from "lottie-react-native";
import successAnim from "../assets/success.json"; // ไฟล์ checkmark animation
import { useComposedEventHandler } from "react-native-reanimated";

const ProfileScreen = ({ navigation, route }) => {
  // console.log("ProfileScreen: Received route:", JSON.stringify(route, null, 2));

  const [hasBooking, setHasBooking] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likedBooks, setLikedBooks] = useState([]);
  const [booksDetails, setBooksDetails] = useState([]);
  const [deleteBook, setDeleteBook] = useState(false);
  const [handleDelete, setHandleDelete] = useState("");

  const userData = route.params?.userData; // ใช้ Optional Chaining (?.)

  useEffect(() => {
    const userRef = doc(db, "user", userData.studentID);
    const unsubscribeUser = onSnapshot(
      userRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const updatedUserData = docSnapshot.data();
          setUpdatedUserData(updatedUserData);
          setLikedBooks(updatedUserData.likedbooks);
          // console.log("Real-time Updated  User Data: ", updatedUserData);
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

  useEffect(() => {}, []);

  const cancelBooking = async () => {
    // animation สำเร็จ
    setModalVisible(true);
    setTimeout(() => {
      setModalVisible(false);
    }, 2500);
    setConfirmModal(false);

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

  useEffect(() => {
    const fetchBooksDetails = async () => {
      if (!likedBooks.length) return; // ถ้าไม่มีหนังสือใน likedBooks ไม่ต้องค้นหา
      setLoading(true);

      try {
        // $encodeURIComponent() ป้องกันข้อผิดพลาดจากอักขระพิเศษในข้อความ
        const promises = likedBooks.map((title) =>
          fetch(
            `https://openlibrary.org/search.json?title=${encodeURIComponent(
              title
            )}`
          )
            .then((response) => response.json())
            .then((data) => {
              // ดึงเฉพาะข้อมูลของหนังสือเล่มแรกในผลการค้นหา
              if (data.docs && data.docs.length > 0) {
                const book = data.docs[0];
                return {
                  title: book.title,
                  author: book.author_name
                    ? book.author_name.join(", ")
                    : "Unknown Author",
                  cover_url: book.cover_i
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
                    : "https://via.placeholder.com/100x150",
                };
              }
            })
        );

        const results = await Promise.all(promises); // รอให้ทุกคำสั่งเสร็จสิ้น
        setBooksDetails(results.filter(Boolean)); // กรองข้อมูลที่ไม่ใช่ null หรือ undefined
        // console.log("Fetched book details:", results);
      } catch (error) {
        console.error("Error fetching book details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooksDetails();
  }, [likedBooks]); // เรียกใช้เมื่อ likedBooks เปลี่ยน

  const handleDeleteBookConfirm = (book) => {
    setHandleDelete(book);
    setDeleteBook(true);
  };
  const deleteLikedBooks = async () => {
    const book = handleDelete;
    console.log(book);

    const userRef = doc(db, "user", userData.studentID);

    try {
      await setDoc(userRef, { likedbooks: arrayRemove(book) }, { merge: true });
      console.log(`Deleted "${book}" from liked books`);
    } catch (error) {
      console.error("Error adding liked book:", error);
    }

    setDeleteBook(false);
    setModalVisible(true);
    setTimeout(() => {
      setModalVisible(false);
    }, 1500);
  };

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
          source={{ uri: userData.profilepic }}
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
            onPress={() => setConfirmModal(true)}
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

      <View style={[{ margin: 20 }]}>
        <Text style={{ marginVertical: 10, fontSize: 17, fontWeight: "bold" }}>
          {" "}
          🩷 หนังสือที่ชอบ
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="black" />
        ) : (
          <FlatList
            data={booksDetails}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleDeleteBookConfirm(item.title)}
              >
                <View style={styles.likedbooksCard}>
                  <Image
                    source={{ uri: item.cover_url }}
                    style={styles.likedbooksImage}
                  />
                  <View style={styles.textContainer}>
                    <Text style={styles.likedbooksTitle}>{item.title}</Text>
                    <Text style={styles.likedbooksAuthor}>{item.author}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Confirm Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModal}
        onRequestClose={() => {
          setConfirmModal(!confirmModal);
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
              คุณต้องการยกเลิกการจองห้องหรือไม่
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.Twobutton, styles.buttonClose]}
                onPress={() => setConfirmModal(!confirmModal)}
              >
                <Text style={styles.textStyle}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.Twobutton, styles.buttonConfirm]}
                onPress={() => cancelBooking()}
              >
                <Text style={styles.textStyle}>ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Cancel Animation Modal */}
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
              source={successAnim}
              autoPlay
              loop={false}
              style={{ width: 120, height: 120 }}
            />
          </View>
        </View>
      </Modal>

      {/* Delete like books */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteBook}
        onRequestClose={() => {
          setDeleteBook(!deleteBook);
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
              ลบหนังสือออกจากหนังสือที่ชอบ
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.Twobutton, styles.buttonClose]}
                onPress={() => setDeleteBook(!deleteBook)}
              >
                <Text style={styles.textStyle}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.Twobutton, styles.buttonConfirm]}
                onPress={() => deleteLikedBooks(likedBooks)}
              >
                <Text style={styles.textStyle}>ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
  likedbooksCard: {
    width: 120,
    marginRight: 10,
    alignItems: "center",
  },

  likedbooksImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginBottom: 5,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
  },

  likedbooksTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },

  likedbooksAuthor: {
    fontSize: 10,
    color: "#777",
    textAlign: "center",
  },
});

export default ProfileScreen;
