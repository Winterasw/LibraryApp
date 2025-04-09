import * as React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation, NavigationContainer } from "@react-navigation/native";

import {
  MaterialCommunityIcons,
  Foundation,
  Ionicons,
  AntDesign,
} from "@expo/vector-icons";

import Setting2Screen from "./components/Setting2Screen";
import SplashScreen from "./components/SplashScreen";
import SignInScreen from "./components/SignInScreen";
import SignUpScreen from "./components/SignUpScreen";
import ForgotPasswordScreen from "./components/ForgotPasswordScreen";
import HomeScreen from "./components/HomeScreen";
import BookingScreen from "./components/BookingScreen";
import ProfileScreen from "./components/ProfileScreen";
import RoomDetailScreen from "./components/RoomDetailScreen";
import SettingScreen from "./components/SettingScreen";
import OTPVerificationScreen from "./components/OTPVerificationScreen";
import ResetPasswordScreen from "./components/ResetPasswordScreen";
import BooklistScreen from "./components/BooklistScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
          backgroundColor: "white",
        },
        headerTintColor: "black",
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen name="HomeStack" component={HomeScreen} />
      <Stack.Screen name="Booklist" component={BooklistScreen} />
    </Stack.Navigator>
  );
}
function ProfileStack() {
  const navigation = useNavigation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
          backgroundColor: "white",
        },
        headerTintColor: "black",
        headerTitleAlign: "center",
        headerTitle: () => (
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText}>Profile</Text>
            <View style={styles.iconContainer}>
              {/* <TouchableOpacity
                style={{ paddingBottom: 5 }}
                onPress={() => navigation.navigate("Setting2")}
              >
                <AntDesign name="setting" size={24} color="black" />
              </TouchableOpacity> */}
            </View>
          </View>
        ),
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Setting" component={SettingScreen} />
      <Stack.Screen name="Setting2" component={Setting2Screen} />
    </Stack.Navigator>
  );
}

function BookingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
          backgroundColor: "white",
        },

        headerTintColor: "black",
        headerTitleAlign: "center",
        headerTitle: () => (
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitleText}>Book Now!</Text>
            <View style={styles.iconContainer}>
              <AntDesign name="bells" size={24} color="black" />
            </View>
          </View>
        ),
      }}
    >
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen
          name="OTPVerificationScreen"
          component={OTPVerificationScreen}
        />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 0,
          backgroundColor: "#ED008C",
          borderTopEndRadius: 30,
          borderTopStartRadius: 30,
          paddingTop: 20,
          height: 80,
        },

        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.4)",
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconComponent;
          if (route.name === "HomeTab") {
            iconComponent = Foundation;
            iconName = "home";
          } else if (route.name === "ProfileTab") {
            iconComponent = Ionicons;
            iconName = "person-circle-outline";
          } else if (route.name === "BookingTab") {
            iconComponent = MaterialCommunityIcons;
            iconName = "sofa-outline";
          }
          const Icon = iconComponent;
          return <Icon name={iconName} size={size + 5} color={color} />;
        },
      })}
    >
      <Tab.Screen name="BookingTab" component={BookingStack} />
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
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
});
