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
  getDoc, // Keep getDoc for initial fetch if needed, but prioritize onSnapshot
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import LottieView from "lottie-react-native";
import successAnim from "../assets/success.json"; // ไฟล์ checkmark animation
// Removed unused import: import { useComposedEventHandler } from "react-native-reanimated";

const ProfileScreen = ({ navigation, route }) => {
  const [hasBooking, setHasBooking] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState(null);
  const [roomDataRealtime, setRoomDataRealtime] = useState(null); // <-- State for real-time room data
  const [confirmModal, setConfirmModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true); // Loading for liked books
  const [likedBooks, setLikedBooks] = useState([]);
  const [booksDetails, setBooksDetails] = useState([]);
  const [deleteBook, setDeleteBook] = useState(false);
  const [handleDelete, setHandleDelete] = useState("");

  const userData = route.params?.userData; // Store initial data (Now just userData)

  // --- useEffect for User Data ---
  useEffect(() => {
    if (!userData?.studentID) {
      // Changed from initialUserData
      console.error("User data or studentID is missing.");
      // Handle missing initial data, maybe navigate back or show error
      return;
    }
    const userRef = doc(db, "user", userData.studentID); // Changed from initialUserData
    const unsubscribeUser = onSnapshot(
      userRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setUpdatedUserData(data);
          setLikedBooks(data.likedbooks || []); // Ensure likedBooks is always an array
          // Check booking status based on updated data
          setHasBooking(!!(data.bookingroom && data.bookingstart)); // Simpler check
        } else {
          console.log("User document does not exist:", userData.studentID); // Changed from initialUserData
          setUpdatedUserData(null); // Clear data if document is deleted
          setHasBooking(false);
          setRoomDataRealtime(null); // Clear room data if user doc is gone
        }
      },
      (error) => {
        console.error("Error listening to user document:", error);
        // Optionally show an error message to the user
      }
    );

    return () => unsubscribeUser(); // Cleanup listener on unmount
  }, [userData?.studentID]); // Depend only on studentID from route params (Now just userData)

  // --- useEffect for Room Data (depends on updatedUserData) ---
  useEffect(() => {
    let unsubscribeRoom = null;
    // Only listen if there's a booking room ID in the updated user data
    if (updatedUserData?.bookingroom) {
      const roomRef = doc(db, "meeting_rooms", updatedUserData.bookingroom);
      unsubscribeRoom = onSnapshot(
        roomRef,
        (roomSnap) => {
          if (roomSnap.exists()) {
            setRoomDataRealtime(roomSnap.data());
            // console.log("Real-time Room Data:", roomSnap.data());
          } else {
            console.warn(
              "Booked room document does not exist:",
              updatedUserData.bookingroom
            );
            setRoomDataRealtime(null); // Clear room data if it doesn't exist
            // Optional: Maybe automatically clear the user's booking info here if the room is gone
          }
        },
        (error) => {
          console.error("Error listening to room document:", error);
          setRoomDataRealtime(null); // Clear on error
        }
      );
    } else {
      // If user has no booking room, clear the realtime room data
      setRoomDataRealtime(null);
    }

    // Cleanup function for the room listener
    return () => {
      if (unsubscribeRoom) {
        unsubscribeRoom();
      }
    };
  }, [updatedUserData?.bookingroom]); // Re-run only when the booking room changes

  // --- useEffect for Liked Books Details ---
  useEffect(() => {
    const fetchBooksDetails = async () => {
      if (!likedBooks || likedBooks.length === 0) {
        setBooksDetails([]); // Clear details if no liked books
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const promises = likedBooks.map((title) =>
          fetch(
            `https://openlibrary.org/search.json?title=${encodeURIComponent(
              title
            )}&limit=1` // Add limit=1 for efficiency
          )
            .then((response) => response.json())
            .then((data) => {
              if (data.docs && data.docs.length > 0) {
                const book = data.docs[0];
                return {
                  title: book.title,
                  author: book.author_name
                    ? book.author_name.join(", ")
                    : "Unknown Author",
                  cover_url: book.cover_i
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
                    : "https://via.placeholder.com/100x150", // Default placeholder
                };
              }
              return null; // Return null if book not found
            })
            .catch((err) => {
              console.error(`Error fetching details for "${title}":`, err);
              return null; // Return null on fetch error
            })
        );

        const results = await Promise.all(promises);
        setBooksDetails(results.filter(Boolean)); // Filter out null results
      } catch (error) {
        console.error("Error fetching book details:", error);
        setBooksDetails([]); // Clear details on major error
      } finally {
        setLoading(false);
      }
    };

    fetchBooksDetails();
  }, [likedBooks]); // Re-run when likedBooks array changes

  // --- Cancel Booking Function ---
  const cancelBooking = async () => {
    // --- Pre-checks ---
    if (!updatedUserData?.studentID) {
      console.error(
        "User data or studentID is not available for cancellation."
      );
      Alert.alert("ข้อผิดพลาด", "ข้อมูลผู้ใช้ไม่พร้อมใช้งาน");
      setConfirmModal(false);
      return;
    }
    if (!updatedUserData.bookingroom || !updatedUserData.bookingstart) {
      console.log("No active booking found in user data.");
      Alert.alert("ไม่มีการจอง", "ไม่พบข้อมูลการจองในโปรไฟล์ของคุณ");
      setConfirmModal(false);
      return;
    }
    // Check if real-time room data is loaded
    if (!roomDataRealtime) {
      console.warn(
        "Room data not loaded yet or room doesn't exist. Trying to clear user booking anyway."
      );
      // Optionally wait a bit or proceed to clear user data only
      // Alert.alert("กรุณารอสักครู่", "กำลังโหลดข้อมูลห้อง...");
      // setConfirmModal(false);
      // return;

      // --- Attempt to clear user booking even if room data is missing ---
      try {
        const userRef = doc(db, "user", updatedUserData.studentID);
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
        console.log("User booking info cleared (room data was missing).");
        setConfirmModal(false);
        setModalVisible(true); // Show success animation
        setTimeout(() => setModalVisible(false), 2500);
        Alert.alert(
          "สำเร็จ",
          "ข้อมูลการจองของคุณถูกล้างแล้ว (ไม่พบข้อมูลห้อง)"
        );
      } catch (error) {
        console.error(
          "Error clearing user booking info when room data missing:",
          error
        );
        setConfirmModal(false);
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถล้างข้อมูลการจองของผู้ใช้ได้");
      }
      return; // Exit after attempting to clear user data
    }

    // --- Proceed with cancellation ---
    setConfirmModal(false); // Close confirmation modal first

    try {
      const userRef = doc(db, "user", updatedUserData.studentID);
      const roomRef = doc(db, "meeting_rooms", updatedUserData.bookingroom); // Path is correct now

      // Use the real-time room data
      const currentRoomBookings = roomDataRealtime.bookings;

      // Check if the specific booking slot exists in the real-time data
      if (
        !currentRoomBookings ||
        !currentRoomBookings[updatedUserData.bookingstart]
      ) {
        console.warn(
          "Booking slot not found in real-time room data:",
          updatedUserData.bookingstart
        );
        // Still clear the user's booking info as it might be outdated
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
        console.log(
          "User booking info cleared (booking slot missing in room)."
        );
        setModalVisible(true); // Show success animation
        setTimeout(() => setModalVisible(false), 2500);
        Alert.alert(
          "สำเร็จ",
          "ข้อมูลการจองของคุณถูกล้างแล้ว (แต่ไม่พบช่องเวลาในข้อมูลห้องล่าสุด)"
        );
        return; // Exit after clearing user data
      }

      // 1. Update user document first (to immediately reflect change in UI)
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

      // 2. Prepare updated bookings for the room using real-time data
      const updatedRoomBookings = {
        ...currentRoomBookings,
        [updatedUserData.bookingstart]: {
          ...currentRoomBookings[updatedUserData.bookingstart], // Keep existing slot data
          status: "available",
          userId: null, // Clear the user ID
        },
      };

      // 3. Update room document
      await setDoc(roomRef, { bookings: updatedRoomBookings }, { merge: true });

      console.log("Booking canceled successfully using real-time data!");
      setModalVisible(true); // Show success animation
      setTimeout(() => setModalVisible(false), 2500);
      // No need for another alert, animation is enough
    } catch (error) {
      console.error("Error canceling booking:", error);
      // Hide animation modal if error occurs during cancellation steps
      setModalVisible(false);
      Alert.alert(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถยกเลิกการจองได้ กรุณาลองใหม่อีกครั้ง"
      );
    }
  };

  // --- Delete Liked Book Functions ---
  const handleDeleteBookConfirm = (bookTitle) => {
    setHandleDelete(bookTitle); // Store the title to be deleted
    setDeleteBook(true); // Open confirmation modal
  };

  const deleteLikedBooks = async () => {
    const bookTitleToDelete = handleDelete; // Get the title from state
    if (!bookTitleToDelete || !updatedUserData?.studentID) {
      console.error("Book title or user ID missing for deletion.");
      setDeleteBook(false);
      return;
    }

    const userRef = doc(db, "user", updatedUserData.studentID);
    setDeleteBook(false); // Close confirmation modal

    try {
      await setDoc(
        userRef,
        { likedbooks: arrayRemove(bookTitleToDelete) }, // Use arrayRemove with the specific title
        { merge: true }
      );
      console.log(`Deleted "${bookTitleToDelete}" from liked books`);
      setHandleDelete(""); // Clear the stored title

      // Show success animation
      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
      }, 1500);
    } catch (error) {
      console.error("Error deleting liked book:", error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถลบหนังสือที่ชอบได้");
    }
  };

  // --- Header Button ---
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          // style={{ width: "170%", marginRight: 20, backgroundColor: "Green" }} // Adjusted style for better touch area
          style={{ padding: 10, marginRight: 5 }} // Simpler padding
          onPress={() => navigation.navigate("Setting")}
        >
          <AntDesign name="setting" size={27} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // --- Render ---
  // Display updated data if available, otherwise use data from route params
  const displayData = updatedUserData || userData;

  if (!displayData) {
    // Show loading indicator or a placeholder if no data is available at all
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ED008C" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Profile Info */}
      <View style={styles.profileCard}>
        <Image
          source={{
            uri: displayData.profilepic || "https://via.placeholder.com/100",
          }} // Add placeholder
          style={styles.profileImage}
        />
        <Text style={styles.profileUsername}>{displayData.username}</Text>
        <Text style={styles.profileStudentID}>{displayData.studentID}</Text>
        <Text style={styles.profileEmail}>📧 {displayData.email}</Text>
      </View>

      {/* Booking Info - Use hasBooking state derived from updatedUserData */}
      {hasBooking ? (
        <View style={styles.bookingCard}>
          <Text style={styles.bookingHeader}>ห้องที่จอง</Text>
          <Text style={styles.bookingText}>
            {/* Display data from updatedUserData */}
            เวลา {updatedUserData?.bookingstart} - {updatedUserData?.bookingend}
          </Text>
          <Text style={styles.bookingText}>
            เลขที่ห้อง {updatedUserData?.bookingroom} ชั้น{" "}
            {updatedUserData?.bookingfloor}
          </Text>
          {/* Cancel Button */}
          <TouchableOpacity
            onPress={() => setConfirmModal(true)}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>ยกเลิกการจองห้อง</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.noBookingContainer}>
          <Text style={styles.noBookingText}>ไม่มีการจองห้อง</Text>
        </View>
      )}

      {/* Liked Books Section */}
      <View style={styles.likedBooksSection}>
        <Text style={styles.likedBooksHeader}>🩷 หนังสือที่ชอบ</Text>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="black"
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={booksDetails}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `${item.title}-${index}`} // More robust key
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
                    <Text style={styles.likedbooksTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.likedbooksAuthor} numberOfLines={1}>
                      {item.author}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.noLikedBooksText}>ยังไม่มีหนังสือที่ชอบ</Text>
            } // Show message if list is empty
          />
        )}
      </View>

      {/* --- Modals --- */}

      {/* Cancel Booking Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModal}
        onRequestClose={() => setConfirmModal(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.confirmModalText}>
              คุณต้องการยกเลิกการจองห้องหรือไม่
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.Twobutton, styles.buttonClose]}
                onPress={() => setConfirmModal(false)}
              >
                <Text style={styles.textStyle}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.Twobutton, styles.buttonConfirm]}
                onPress={cancelBooking} // Call the updated function
              >
                <Text style={styles.textStyle}>ยืนยัน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success/Action Animation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <LottieView
              source={successAnim}
              autoPlay
              loop={false}
              style={{ width: 120, height: 120 }}
            />
            {/* Optional: Add dynamic text here based on action */}
          </View>
        </View>
      </Modal>

      {/* Delete Liked Book Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteBook}
        onRequestClose={() => setDeleteBook(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.confirmModalText}>
              ลบหนังสือ "{handleDelete}" ออกจากรายการที่ชอบ?
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.Twobutton, styles.buttonClose]}
                onPress={() => {
                  setDeleteBook(false);
                  setHandleDelete("");
                }} // Clear title on cancel
              >
                <Text style={styles.textStyle}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.Twobutton, styles.buttonConfirm]}
                onPress={deleteLikedBooks} // Call delete function
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

// --- Styles --- (Refactored for clarity)
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  profileCard: {
    backgroundColor: "#f5f5f5",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#ED008C",
  },
  profileUsername: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  profileStudentID: {
    fontSize: 18, // Slightly smaller
    color: "#555",
  },
  profileEmail: {
    color: "gray",
    marginTop: 5,
    fontSize: 14,
  },
  bookingCard: {
    backgroundColor: "#ED008C",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bookingText: {
    color: "white",
    fontSize: 16,
    marginBottom: 4,
  },
  cancelButton: {
    marginTop: 15,
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: "#ED008C",
    fontWeight: "bold",
    fontSize: 16,
  },
  noBookingContainer: {
    // flex: 1, // Removed flex: 1 to prevent pushing content down excessively
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30, // Increased margin
    paddingVertical: 20,
  },
  noBookingText: {
    color: "gray",
    fontSize: 16,
  },
  likedBooksSection: {
    marginHorizontal: 20,
    marginTop: 20,
    flexShrink: 1, // Prevent section from growing too large if many books
  },
  likedBooksHeader: {
    marginBottom: 10, // Adjusted margin
    fontSize: 17,
    fontWeight: "bold",
  },
  likedbooksCard: {
    width: 120,
    marginRight: 10,
    alignItems: "center",
    height: 190, // Increased height slightly
    justifyContent: "flex-start", // Align items to top
    paddingBottom: 5,
  },
  likedbooksImage: {
    width: 100, // Adjusted size
    height: 140, // Adjusted size
    borderRadius: 8,
    marginBottom: 8, // Increased margin
    // Removed shadow from image, card has shadow
  },
  textContainer: {
    flex: 1, // Allow text container to fill remaining space
    justifyContent: "center",
    alignItems: "center", // Center text horizontally
    width: "100%", // Ensure it takes full width of card
    paddingHorizontal: 5,
  },
  likedbooksTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
  },
  likedbooksAuthor: {
    fontSize: 10,
    color: "#777",
    textAlign: "center",
  },
  noLikedBooksText: {
    textAlign: "center",
    color: "grey",
    marginTop: 20,
    fontStyle: "italic",
  },
  // --- Modal Styles ---
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30, // Consistent padding
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "85%", // Slightly wider modal
    // Removed fixed height, let content determine height
    justifyContent: "center",
  },
  confirmModalText: {
    fontSize: 17,
    textAlign: "center",
    marginBottom: 25, // Increased margin
    lineHeight: 24, // Improve readability
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around", // Use space-around for better spacing
    width: "100%",
    marginTop: 10, // Add some top margin
  },
  Twobutton: {
    borderRadius: 25, // More rounded buttons
    paddingHorizontal: 25, // More horizontal padding
    paddingVertical: 12,
    elevation: 2,
    minWidth: 100, // Ensure minimum button width
    alignItems: "center", // Center text in button
  },
  buttonConfirm: {
    backgroundColor: "#ED008C",
  },
  buttonClose: {
    backgroundColor: "#adadad",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16, // Consistent font size
  },
});

export default ProfileScreen;
