const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.autoCancelBooking = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async (context) => {
    const now = new Date().toISOString(); // เวลาปัจจุบันใน UTC
    const userCollection = admin.firestore().collection("user");
    console.log(`Current time: ${now}`);

    try {
      const querySnapshot = await userCollection
        .where("bookingend", "<=", now)
        .get();

      if (querySnapshot.empty) {
        console.log("No expired bookings found.");
        return null;
      }

      querySnapshot.forEach(async (doc) => {
        try {
          const userData = doc.data();
          console.log(`Processing booking for user: ${doc.id}`);

          // ตรวจสอบว่ามีค่าที่จำเป็นครบก่อนดำเนินการ
          if (!userData.bookingroom || !userData.bookingstart) {
            console.log(`Invalid booking data for user: ${doc.id}`);
            return;
          }

          // ลบข้อมูลการจองใน Firestore
          await doc.ref.update({
            bookingroom: "",
            bookingstart: "",
            bookingend: "",
            bookingfloor: "",
          });

          const roomRef = admin
            .firestore()
            .collection("meeting_rooms")
            .doc(userData.bookingroom);
          const roomData = await roomRef.get();

          if (!roomData.exists) {
            console.log(`Room not found: ${userData.bookingroom}`);
            return;
          }

          const roomBookings = roomData.data().bookings || {};

          const updatedBookings = {
            ...roomBookings,
            [userData.bookingstart]: {
              ...roomBookings[userData.bookingstart],
              status: "available",
              userId: null,
            },
          };

          // อัปเดตสถานะห้อง
          await roomRef.update({ bookings: updatedBookings });

          console.log(`Booking canceled successfully for user: ${doc.id}`);
        } catch (error) {
          console.error(`Error processing booking for user: ${doc.id}`, error);
        }
      });

      console.log("Auto cancellation task completed.");
    } catch (error) {
      console.error("Error in auto cancellation task:", error);
    }

    return null;
  });
