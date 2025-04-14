import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import { db } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const BookingScreen = ({ navigation, route }) => {
  console.log("BookingScreen: Received route:", JSON.stringify(route, null, 2));

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("floor4");
  const [items, setItems] = useState([
    { label: "ชั้น 4", value: "floor4" },
    { label: "ชั้น 5", value: "floor5" },
    { label: "ชั้น 6", value: "floor6" },
  ]);
  const [selectedFloorData, setSelectedFloorData] = useState([]);

  useEffect(() => {
    const fetchFloorData = async () => {
      try {
        const floorRef = collection(db, "meeting_rooms"); // Collection ของ meeting_rooms
        const querySnapshot = await getDocs(floorRef);
        const roomsData = [];

        querySnapshot.forEach((doc) => {
          const roomData = doc.data();
          roomsData.push(roomData);
        });

        // ดึงข้อมูลห้องตามชั้น
        const filteredRooms = roomsData.filter(
          (room) => room.floor.toString() === value.replace("floor", "")
        );
        setSelectedFloorData(filteredRooms);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    fetchFloorData();
  }, [value]);

  const handleRoomPress = (room) => {
    navigation.navigate("RoomDetail", { room });
    // console.log(room);
  };

  return (
    <ScrollView style={styles.container}>
      <View>
        <View style={styles.dropDownPicker}>
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            placeholder="เลือกชั้น"
            style={{
              backgroundColor: "white",
              borderColor: "gray",
              borderWidth: 1,
              borderRadius: 25,
              paddingLeft: 20,
            }}
            dropDownContainerStyle={{ backgroundColor: "#fafafa" }}
            textStyle={{ fontSize: 16, color: "black" }}
            placeholderStyle={{ color: "gray", fontStyle: "italic" }}
            labelStyle={{ fontWeight: "bold" }}
            selectedItemLabelStyle={{ color: "grey" }}
            selectedItemContainerStyle={{ backgroundColor: "#F4F3F3" }}
          />
        </View>
        <View style={styles.content}>
          {selectedFloorData.map((room) => (
            <TouchableOpacity
              key={room.room_number}
              onPress={() => handleRoomPress(room)}
            >
              <View style={styles.roomBox}>
                <View style={styles.leftRoomBox}>
                  <Text style={styles.contentText}>ชั้น {room.floor}</Text>
                  <Text style={styles.contentText}>
                    เลขห้อง {room.room_number}
                  </Text>
                </View>
                <View style={styles.rightRoomBox}>
                  <Ionicons name="people" size={20} color="#ED008C" />
                  <Text style={[styles.contentText, { color: "#ED008C" }]}>
                    {room.capacity} คน
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default BookingScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  dropDownPicker: {
    padding: 30,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  roomBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F4F3F3",
    borderRadius: 20,
    padding: 35,
    marginBottom: 20,
    width: "90%",
  },
  contentText: {
    fontSize: 18,
  },
  rightRoomBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "23%",
  },
});
