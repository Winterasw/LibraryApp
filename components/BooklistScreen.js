import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { db } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

import { doc, setDoc } from "firebase/firestore"; // ใช้ Firestore

const addBooks = async () => {
  const books = [
    {
      title: "The Great Adventure",
      author: "John Doe",
      summary: "A thrilling tale of exploration and courage.",
      category: "Fiction",
      cover_url: "https://via.placeholder.com/150?text=The+Great+Adventure",
      status: "available",
    },
    {
      title: "Science Wonders",
      author: "Jane Smith",
      summary: "Discover the amazing world of science.",
      category: "Science",
      cover_url: "https://via.placeholder.com/150?text=Science+Wonders",
      status: "borrowed",
    },
    {
      title: "Cooking 101",
      author: "Chef A",
      summary: "Learn the basics of cooking delicious meals.",
      category: "Cooking",
      cover_url: "https://via.placeholder.com/150?text=Cooking+101",
      status: "available",
    },
    {
      title: "History Unveiled",
      author: "Dr. B",
      summary: "Delve into the secrets of world history.",
      category: "History",
      cover_url: "https://via.placeholder.com/150?text=History+Unveiled",
      status: "borrowed",
    },
    {
      title: "Mystery of the Moon",
      author: "Alice Cooper",
      summary: "An enigmatic journey to the moon's depths.",
      category: "Mystery",
      cover_url: "https://via.placeholder.com/150?text=Mystery+Moon",
      status: "available",
    },
    {
      title: "The Art of Living",
      author: "Sophia Lee",
      summary: "Insights into living a balanced and fulfilling life.",
      category: "Self-help",
      cover_url: "https://via.placeholder.com/150?text=The+Art+of+Living",
      status: "available",
    },
    {
      title: "Space Odyssey",
      author: "Neil Armstrong",
      summary: "Explore the vast universe in this epic tale.",
      category: "Sci-Fi",
      cover_url: "https://via.placeholder.com/150?text=Space+Odyssey",
      status: "available",
    },
    {
      title: "Business Tactics",
      author: "Elon Tusk",
      summary: "Learn strategies to excel in business.",
      category: "Business",
      cover_url: "https://via.placeholder.com/150?text=Business+Tactics",
      status: "borrowed",
    },
    {
      title: "Art Beyond Boundaries",
      author: "Picasso Jr.",
      summary: "Unleashing creativity in modern art.",
      category: "Art",
      cover_url: "https://via.placeholder.com/150?text=Art+Beyond",
      status: "available",
    },
    {
      title: "Travel Diaries",
      author: "Nomad X",
      summary: "Journeys across breathtaking destinations.",
      category: "Travel",
      cover_url: "https://via.placeholder.com/150?text=Travel+Diaries",
      status: "available",
    },
  ];

  try {
    for (let i = 0; i < books.length; i++) {
      const bookId = `book${i + 1}`; // สร้าง ID สำหรับหนังสือแต่ละเล่ม เช่น book1, book2,...
      const bookRef = doc(db, "books", bookId); // อ้างอิงไปยังเอกสาร
      await setDoc(bookRef, books[i]); // เพิ่มข้อมูลลงใน Firestore
      console.log(`✅ Book ${bookId} added successfully!`);
    }
    alert("Books added successfully!");
  } catch (error) {
    console.error("❌ Error adding books:", error);
    alert("Failed to add books.");
  }
};

const BooklistScreen = ({ navigation }) => {
  const [books, setBooks] = useState([]);

  // ฟังก์ชันดึงข้อมูลจาก Firestore
  const fetchBooks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "books"));
      const booksData = querySnapshot.docs.map((doc) => doc.data());
      setBooks(booksData);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>Book Shelf</Text>
        </View>
      ),
    });
  }, [navigation]);
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={addBooks}>
        <Text>Add book</Text>
      </TouchableOpacity>

      <FlatList
        data={books}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.bookItem}>
            {/* ถ้าต้องการใส่ภาพปกหนังสือ */}
            <Image source={{ uri: item.cover_url }} style={styles.coverImage} />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.author}>{item.author}</Text>
              <Text style={styles.summary}>{item.summary}</Text>
              <Text style={styles.category}>{item.category}</Text>
              {/* ตรวจสอบสถานะของหนังสือใน renderItem */}
              <Text
                style={[
                  styles.status,
                  item.status === "available"
                    ? styles.available
                    : styles.borrowed,
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#eaeaea", // เปลี่ยนพื้นหลัง
  },
  bookItem: {
    flexDirection: "row", // จัดเรียงแนวนอน
    backgroundColor: "#ffffff", // สีพื้นหลังของหนังสือ
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000", // เงาของกล่อง
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // สำหรับ Android
  },
  coverImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginRight: 15,
  },
  textContainer: {
    flex: 1, // ทำให้ข้อความใช้พื้นที่ที่เหลือ
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333", // สีของชื่อเรื่อง
    marginBottom: 5,
  },
  author: {
    fontSize: 16,
    color: "#777", // สีของผู้เขียน
    marginBottom: 5,
  },
  summary: {
    fontSize: 14,
    color: "#555", // สีของสรุป
    marginBottom: 5,
    lineHeight: 20,
  },
  category: {
    fontSize: 14,
    color: "#2a9d8f", // สีของหมวดหมู่
    marginBottom: 5,
  },
  status: {
    fontSize: 14,
    marginTop: 5,
  },
  available: {
    color: "#2a9d8f", // สีเขียวสำหรับ "available"
  },
  borrowed: {
    color: "#e76f51", // สีแดงสำหรับ "borrowed"
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
