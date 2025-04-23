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
import HomeScreen from "./components/HomeScreen";
import BookingScreen from "./components/BookingScreen";
import ProfileScreen from "./components/ProfileScreen";
import RoomDetailScreen from "./components/RoomDetailScreen";
import SettingScreen from "./components/SettingScreen";
import BooklistScreen from "./components/BooklistScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- Default Stack Screen Options ---
// Define common options to avoid repetition and ensure consistency
const defaultStackScreenOptions = {
  headerStyle: {
    elevation: 0, // Android
    shadowOpacity: 0, // iOS
    borderBottomWidth: 0, // iOS
    backgroundColor: "white",
  },
  headerTintColor: "black", // Color of back button and title (if not customized)
  headerTitleAlign: "center", // Ensure title is centered by default
  headerBackTitleVisible: false, // <<< Add this to hide back button label globally for stacks
};

function HomeStack({ route }) {
  // console.log("HomeStack received params:", route.params);
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen
        name="HomeStack"
        component={HomeScreen}
        initialParams={route?.params}
        // options={{ headerTitle: "Home" }} // Example of setting simple title
      />
      <Stack.Screen
        name="Booklist"
        component={BooklistScreen}
        initialParams={route?.params}
        options={{ headerTitle: "Book Shelf" }} // Set title directly here
      />
    </Stack.Navigator>
  );
}
function ProfileStack({ route }) {
  // const navigation = useNavigation(); // Not needed here
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={route?.params}
        options={{
          // Use options here for screen-specific settings
          headerTitle: () => (
            <Text style={styles.headerTitleText}>Profile</Text>
          ), // Simple title, navigator handles centering
          // headerRight is defined in ProfileScreen using useLayoutEffect
        }}
      />
      <Stack.Screen
        name="Setting"
        component={SettingScreen}
        options={{ headerTitle: "Settings" }} // Simple title
      />
      <Stack.Screen
        name="Setting2"
        component={Setting2Screen}
        options={{ headerTitle: "Setting 2" }} // Simple title
      />
    </Stack.Navigator>
  );
}

function BookingStack({ route }) {
  return (
    <Stack.Navigator screenOptions={defaultStackScreenOptions}>
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        initialParams={route?.params}
        options={{
          // Custom header title with icon
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              {/* Add an empty view on the left for balance if needed, or adjust padding */}
              <Text style={styles.headerTitleText}>Book Now!</Text>
            </View>
          ),
          // headerTitleAlign: 'center' is already set globally
        }}
      />
      <Stack.Screen
        name="RoomDetail"
        component={RoomDetailScreen}
        initialParams={route?.params}
        options={{ headerTitle: "Room Details" }} // Simple title
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        // Apply default options here too for consistency if needed
        screenOptions={{
          ...defaultStackScreenOptions, // Include defaults
          headerShown: false, // Keep this to hide header for Splash/SignIn/Main container
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainTabNavigator({ route }) {
  // console.log("MainTabNavigator received params:", route.params);
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false, // Header is handled by inner Stack Navigators
        tabBarStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 0,
          backgroundColor: "#ED008C",
          borderTopEndRadius: 30,
          borderTopStartRadius: 30,
          paddingTop: 10, // Adjusted padding
          height: 70, // Adjusted height
          position: "absolute", // Optional: if you want it to overlay content slightly
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.5)", // Slightly more visible inactive
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let IconComponent; // Renamed for clarity
          if (route.name === "HomeTab") {
            IconComponent = Foundation;
            iconName = "home";
          } else if (route.name === "ProfileTab") {
            IconComponent = Ionicons;
            iconName = "person-circle-outline";
          } else if (route.name === "BookingTab") {
            IconComponent = MaterialCommunityIcons;
            iconName = "sofa-outline";
          }
          // Fallback if IconComponent is not assigned
          if (!IconComponent) return null;

          return (
            <IconComponent
              name={iconName}
              size={size + (focused ? 5 : 2)}
              color={color}
            />
          ); // Slightly larger when focused
        },
      })}
    >
      {/* Pass initialParams down to the *screens* inside the stack, not the stack itself */}
      <Tab.Screen
        name="BookingTab"
        component={BookingStack}
        initialParams={route?.params}
      />
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        initialParams={route?.params}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        initialParams={route?.params}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center items horizontally
    width: "100%", // Take full width available
    // backgroundColor: "lightblue", // For debugging layout
    position: "relative", // Needed for absolute positioning of icon
  },
  headerTitleText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center", // Ensure text itself is centered
    // flexGrow: 1, // Allow text to take available space
  },
  iconContainer: {
    position: "absolute", // Position icon absolutely relative to the container
    right: 16, // Adjust as needed for padding
    // width: 40, // Keep consistent width if needed
    // alignItems: "flex-end", // Align icon to the right
  },
  logo: {
    // Style for logo in HomeScreen header (if needed, but seems defined there)
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
});
