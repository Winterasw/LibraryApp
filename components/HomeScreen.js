import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore"; // แก้จาก addDoc เป็น setDoc
import { Ionicons, AntDesign } from "@expo/vector-icons";

const HomeScreen = ({ navigation, route }) => {
  // console.log("HomeScreen: Received route:", JSON.stringify(route, null, 2));
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [recentChanges, setRecentChanges] = useState([]);
  // ตรวจสอบและดึงค่า userData
  const userData = route.params?.userData; // ใช้ Optional Chaining (?.)
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
  {
    /* For Dev */
  }
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
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const urls = [
        "https://openlibrary.org/subjects/fiction.json?limit=20",
        "https://openlibrary.org/subjects/cooking.json?limit=20",
        "https://openlibrary.org/subjects/history.json?limit=20",
        "https://openlibrary.org/subjects/arts.json?limit=20",
        "https://openlibrary.org/subjects/animals.json?limit=20",
        "https://openlibrary.org/subjects/science&mathematics.json?limit=20",
        "https://openlibrary.org/subjects/business&finance.json?limit=20",
      ];
      const responses = await Promise.all(urls.map((url) => fetch(url)));
      const dataList = await Promise.all(responses.map((res) => res.json()));

      // console.log("Received data:", data);
      //  Fetch หนังสือทั้งหมด
      const allBooks = dataList.flatMap((data) =>
        data.works.map((item) => ({
          title: item.title,
          author: item.authors
            ? item.authors.map((author) => author.name).join(", ")
            : "Unknown Author",
          category: data.name, // คุณสามารถปรับให้เข้ากับหมวดหมู่จริง
          cover_url: item.cover_id
            ? `https://covers.openlibrary.org/b/id/${item.cover_id}-L.jpg`
            : "https://via.placeholder.com/100x150",
        }))
      );
      // Fetch หนังสือแนะนำ
      const fetchRecommendedBooks = async () => {
        try {
          const response = await fetch(
            "https://openlibrary.org/subjects/bestsellers.json?limit=10"
          );
          const data = await response.json();

          const booksData = data.works.map((item) => ({
            title: item.title,
            author: item.authors
              ? item.authors.map((author) => author.name).join(", ")
              : "Unknown Author",
            summary: item.description || "No description available",
            cover_url: item.cover_id
              ? `https://covers.openlibrary.org/b/id/${item.cover_id}-L.jpg`
              : "https://via.placeholder.com/100x150",
          }));

          setRecommendedBooks(booksData);
        } catch (error) {
          console.error("Error fetching recommended books:", error);
        }
      };

      const fetchB = async () => {
        try {
          const response = await fetch(
            "https://openlibrary.org/subjects/juvenile.json?limit=10"
          );
          const data = await response.json();

          const booksData = data.works.map((item) => ({
            title: item.title,
            author: item.authors
              ? item.authors.map((author) => author.name).join(", ")
              : "Unknown Author",
            summary: item.description || "No description available",
            cover_url: item.cover_id
              ? `https://covers.openlibrary.org/b/id/${item.cover_id}-L.jpg`
              : "https://via.placeholder.com/100x150",
          }));

          setRecentChanges(booksData);
        } catch (error) {
          console.error("Error fetching recommended books:", error);
        }
      };
      fetchB();
      fetchRecommendedBooks();
      setBooks(allBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View>
          <Text
            style={{
              marginLeft: 35,
              marginTop: 20,
              fontSize: 23,
              fontWeight: "bold",
            }}
          >
            Welcome {userData.username}!
          </Text>
        </View>

        <View style={styles.topIconContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Booklist", { userData })}
          >
            <View style={styles.bookIcon}>
              <Ionicons name="book" size={35} color="black" />
            </View>
          </TouchableOpacity>
        </View>

        {/* For Dev ปุ่มเพิ่มข้อมูล  !*/}
        {/* <TouchableOpacity style={styles.addButton} onPress={addBookingData}>
          <Text style={styles.addButtonText}>เพิ่มข้อมูลจองห้อง</Text>
        </TouchableOpacity> */}
        <View style={[{ margin: 20 }]}>
          <Text style={styles.sectionTitle}>🔥 หนังสือยอดนิยม</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="50" color="black" />
            </View>
          ) : (
            <FlatList
              data={recommendedBooks}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.recommendCard}>
                  <Image
                    source={{ uri: item.cover_url }}
                    style={styles.recommendImage}
                  />

                  <Text style={styles.recommendTitle}>{item.title}</Text>
                  <Text style={styles.recommendAuthor}>{item.author}</Text>
                </View>
              )}
            />
          )}
          <Text style={styles.sectionTitle}>📚 หนังสือแนะนำ</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="50" color="black" />
            </View>
          ) : (
            <FlatList
              data={recentChanges}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.recommendCard}>
                  <Image
                    source={{ uri: item.cover_url }}
                    style={styles.recommendImage}
                  />

                  <Text style={styles.recommendTitle}>{item.title}</Text>
                  <Text style={styles.recommendAuthor}>{item.author}</Text>
                </View>
              )}
            />
          )}
        </View>
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
    marginTop: 40,
  },
  bookIcon: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d4d4d4",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginLeft: 10,
    marginBottom: 10,
  },

  recommendCard: {
    width: 120,
    marginRight: 10,
    alignItems: "center",
  },

  recommendImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginBottom: 5,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 3,
  },

  recommendTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },

  recommendAuthor: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
});

export default HomeScreen;
