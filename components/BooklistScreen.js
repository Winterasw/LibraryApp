import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Picker } from "@react-native-picker/picker";
import { db } from "./firebaseConfig";
import {
  doc,
  setDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore"; // แก้จาก addDoc เป็น setDoc

const BooklistScreen = ({ navigation, route }) => {
  // console.log("BooklistScreen Received route:", JSON.stringify(route, null, 2));
  const userData = route.params.userData;
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [updatedUserData, setUpdatedUserData] = useState(null);

  useEffect(() => {
    const userRef = doc(db, "user", userData.studentID);
    const unsubscribeUser = onSnapshot(
      userRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const updatedUserData = docSnapshot.data();
          setUpdatedUserData(updatedUserData);
          // console.log("Real-time Updated  Bookilist Screen: ", updatedUserData);
        } else {
          console.log("Document does not exist");
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

  // ฟังก์ชันดึงข้อมูลจาก OpenLibrary API
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
      ];
      const responses = await Promise.all(urls.map((url) => fetch(url)));
      const dataList = await Promise.all(responses.map((res) => res.json()));

      // console.log("Received data:", data);
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

  const filteredBooks = books.filter((book) => {
    const matchesTitle = book.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || book.category === selectedCategory;
    return matchesTitle && matchesCategory;
  });

  const deleteLikedBooks = async (book) => {
    const userRef = doc(db, "user", userData.studentID);

    try {
      await setDoc(userRef, { likedbooks: arrayRemove(book) }, { merge: true });
      console.log(`Deleted "${book}" from liked books`);
    } catch (error) {
      console.error("Error adding liked book:", error);
    }
  };
  const addLikedBooks = async (book) => {
    const userRef = doc(db, "user", userData.studentID);

    try {
      await setDoc(
        userRef,
        { likedbooks: arrayUnion(book) }, // เพิ่มค่าหนังสือเข้าอาร์เรย์
        { merge: true }
      );
      console.log(`Added "${book}" to liked books`);
    } catch (error) {
      console.error("Error adding liked book:", error);
    }
  };
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="ค้นหาชื่อหนังสือ..."
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
      />
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={styles.picker}
          itemStyle={styles.pickerItem} // Style for individual items (iOS)
        >
          <Picker.Item label="All Categories" value="all" />
          <Picker.Item label="Fiction" value="fiction" />
          <Picker.Item label="Arts" value="arts" />
          <Picker.Item label="Animals" value="animals" />
          <Picker.Item
            label="Science & Mathematics"
            value="science&mathematics"
          />
          <Picker.Item label="History" value="history" />
          <Picker.Item label="Cooking" value="cooking" />
          <Picker.Item label="Business & Finance" value="business&finance" />
        </Picker>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="60" color="black" />
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item, index) => index.toString()}
          initialNumToRender={5} // เริ่มด้วยแค่ 5 รายการ
          maxToRenderPerBatch={10} // โหลดเพิ่มครั้งละ 10
          windowSize={5} // ขนาดของหน้าต่างที่เรนเดอร์ล่วงหน้า
          removeClippedSubviews={true} // ตัดอันที่ไม่โชว์บนจอออก
          renderItem={({ item }) => {
            const isLiked = updatedUserData?.likedbooks?.includes(item.title);
            return (
              <TouchableOpacity>
                <View style={styles.bookItem}>
                  <Image
                    source={{ uri: item.cover_url }}
                    style={styles.coverImage}
                  />
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.author}>{item.author}</Text>
                    <Text style={styles.category}>{item.category}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        isLiked
                          ? deleteLikedBooks(item.title)
                          : addLikedBooks(item.title)
                      }
                      style={{ marginTop: 10 }}
                    >
                      <Ionicons
                        name={isLiked ? "heart-sharp" : "heart-outline"}
                        size={30}
                        color={isLiked ? "#ED008C" : "black"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "white",
  },
  searchInput: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 20,
    fontSize: 17,
  },
  pickerContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  picker: {
    height: 60,
    width: "100%",
    color: "#333",
  },
  pickerItem: {
    height: 50,
    fontSize: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  bookItem: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginHorizontal: 10,
  },
  coverImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  author: {
    fontSize: 16,
    color: "#777",
    marginBottom: 5,
  },
  summary: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    lineHeight: 20,
  },
  category: {
    fontSize: 14,
    color: "#2a9d8f",
    marginBottom: 5,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    paddingRight: 195,
  },
  headerTitleText: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default BooklistScreen;
