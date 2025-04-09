import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import React, { useState, useLayoutEffect } from "react";
import { AntDesign } from "@expo/vector-icons";

const profileImage = {
  uri: "https://cdn.readawrite.com/articles/5887/5886037/thumbnail/small.gif?1",
};

const ProfileScreen = ({ navigation }) => {
  const [hasBooking, setHasBooking] = useState(true);

  const cancelBooking = () => {
    Alert.alert("ยกเลิกการจองห้องสำเร็จ!!!", "", [
      { text: "ตกลง", onPress: () => setHasBooking(false) },
    ]);
  };

  // ใช้ useLayoutEffect เพื่อเพิ่มปุ่มฟันเฟืองใน header
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
          สุธี รวยมาก
        </Text>
        <Text style={{ fontSize: 20 }}> 6500000</Text>
        <Text style={{ color: "gray", marginTop: 1 }}>
          📧 suthi.rue@spumail.net
        </Text>
      </View>

      {/* แสดงข้อมูลการจองห้อง */}
      {hasBooking ? (
        <View
          style={{
            backgroundColor: "#e91e63",
            marginHorizontal: 20,
            marginTop: 20,
            borderRadius: 15,
            padding: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>วัน 16-2-2025</Text>
          <Text style={{ color: "white", fontSize: 16 }}>เวลา 9:00-10:00</Text>
          <Text style={{ color: "white", fontSize: 16 }}>
            ห้องที่จอง 408 ชั้น 4
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
