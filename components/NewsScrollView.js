import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";

const newsData = [
  {
    id: 1,
    title: "ประกาศ! ขยายเวลาเปิด-ปิดห้องสมุด",
    description:
      "ห้องสมุดมหาวิทยาลัยศรีปทุม ประกาศขยายเวลาเปิด-ปิดทำการ เริ่มตั้งแต่วันที่ 1 พฤศจิกายน 2566 เป็นต้นไป เปิดให้บริการถึง 20.00 น. ทุกวัน! เพื่ออำนวยความสะดวกแก่นักศึกษาและบุคลากร",
    image: "https://us-fbcloud.net/picpost/data/211/211457-qgfq00-1.n.jpg", // Example: SPU Library
  },
  {
    id: 2,
    title: "กิจกรรม Meet & Greet นักเขียน",
    description:
      "ขอเชิญนักศึกษาและผู้สนใจร่วมกิจกรรม Meet & Greet กับนักเขียนชื่อดัง คุณ... ในวันที่ 15 พฤศจิกายน 2566 เวลา 13.00 น. ณ ห้องประชุม ชั้น 8 อาคาร 5",
    image: "https://www2.spu.ac.th/images/campuslife/20170214134425hM1325C.jpg", // Example: Book event
  },
  {
    id: 3,
    title: "อบรมการใช้งานฐานข้อมูลออนไลน์",
    description:
      "ห้องสมุดจัดอบรมการใช้งานฐานข้อมูลออนไลน์ ฟรี! เรียนรู้เทคนิคการค้นคว้าและเข้าถึงข้อมูลวิชาการอย่างมีประสิทธิภาพ วันที่ 22 พฤศจิกายน 2566 เวลา 10.00 น. - 12.00 น. ลงทะเบียนด่วน! จำนวนจำกัด",
    image:
      "https://www.9experttraining.com/sites/default/files/styles/mobile_course/public/images/training-course/database-concept-design-course-03.png?itok=7WoqkwKl", // Example: Online database training
  },
  {
    id: 4,
    title: "SPU Library: เปิดตัวโซนใหม่ Co-Working Space",
    description:
      "SPU Library เปิดตัวโซนใหม่ Co-Working Space พื้นที่ทำงานร่วมสมัย ตอบโจทย์นักศึกษายุคดิจิทัล พร้อมสิ่งอำนวยความสะดวกครบครัน มาลองใช้บริการกันได้แล้ววันนี้!",
    image:
      "https://cdn.prod.website-files.com/604a97c70aee09eed25ce991/61897a35583a9b51db018d3e_MartinPublicSeating-97560-Importance-School-Library-blogbanner1.jpg",
  },
  {
    id: 5,
    title: "SPU Library: บริการยืม-คืนหนังสือด้วยตนเอง",
    description:
      "SPU Library บริการยืม-คืนหนังสือด้วยตนเองผ่านตู้ Kiosk อำนวยความสะดวก รวดเร็ว ทันใจ ไม่ต้องต่อคิว!",
    image:
      "https://images.theconversation.com/files/45159/original/rptgtpxd-1396254731.jpg?ixlib=rb-4.1.0&q=45&auto=format&w=754&fit=clip",
  },
];

const { height, width } = Dimensions.get("window");

const NewsScrollView = () => {
  return (
    <View style={styles.container}>
      {newsData.map((news) => (
        <View key={news.id} style={styles.newsBlock}>
          <Image source={{ uri: news.image }} style={styles.image} />
          <Text style={styles.title}>{news.title}</Text>
          <Text style={styles.description}>{news.description}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  newsBlock: {
    width: width - 40, // ลดขนาดให้ห่างจากขอบจอ
    height: height - 10, // ลดขนาดให้ห่างจากขอบจอ

    alignItems: "center",
    // backgroundColor: "#E6E6E6",
    padding: 20,
    borderRadius: 20, // กรอบมน
    overflow: "hidden", // ป้องกันไม่ให้เนื้อหาภายในหลุดออกจากกรอบ
    margin: 20, // ระยะห่างจากขอบจอ
  },
  image: {
    width: "100%", // ปรับให้รูปไม่กว้างเกินไป
    height: "50%",
    resizeMode: "cover",
    borderRadius: 10, // กรอบมนให้กับรูปภาพ
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    marginTop: 5,
    textAlign: "center",
    width: "80%",
  },
});

export default NewsScrollView;
