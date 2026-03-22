import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "./types";

import ProfileScreen from "../features/profile/screens/ProfileScreen";
import EditProfileScreen from "../features/profile/screens/EditProfileScreen";
import ChangePasswordScreen from "../features/profile/screens/ChangePasswordScreen";
import EmailVerificationScreen from "../features/profile/screens/EmailVerificationScreen";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f5f5f5" },
        animation: "slide_from_right",
      }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="ProfileEdit" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
    </Stack.Navigator>
  );
}
