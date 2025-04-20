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
import { Picker } from "@react-native-picker/picker";

const BooklistScreen = ({ navigation }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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
        "https://openlibrary.org/subjects/business&finance.json?limit=20",
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

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText}>Book Shelf</Text>
        </View>
      ),
    });
  }, [navigation]);

  // const filteredBooks = books.filter((book) =>
  //   book.title.toLowerCase().includes(searchText.toLowerCase())
  // );

  const filteredBooks = books.filter((book) => {
    const matchesTitle = book.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || book.category === selectedCategory;
    return matchesTitle && matchesCategory;
  });
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="ค้นหาชื่อหนังสือ..."
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
      />
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="All Categories" value="all" />
        <Picker.Item label="Fiction" value="fiction" />
        <Picker.Item label="General" value="general" />
        <Picker.Item label="Arts" value="arts" />
        <Picker.Item label="Animals" value="animals" />
        <Picker.Item
          label="Science & Mathematics"
          value="science&mathematics"
        />
        <Picker.Item label="Business & Finance" value="business&finance" />
        <Picker.Item label="History" value="history" />
        <Picker.Item label="Cooking" value="cooking" />
      </Picker>
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
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => alert(item.title)}>
              <View style={styles.bookItem}>
                <Image
                  source={{ uri: item.cover_url }}
                  style={styles.coverImage}
                />
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.author}>{item.author}</Text>
                  <Text style={styles.category}>{item.category}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
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
    fontSize: 16,
  },
  picker: {
    height: 60,
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 8,
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
