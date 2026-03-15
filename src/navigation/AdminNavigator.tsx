import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AdminStackParamList } from "./types";

import AdminDashboardScreen from "../features/admin/screens/AdminDashboardScreen";
import UserListScreen from "../features/admin/screens/UserListScreen";
import UserCreateScreen from "../features/admin/screens/UserCreateScreen";
import UserShowScreen from "../features/admin/screens/UserShowScreen";
import UserEditScreen from "../features/admin/screens/UserEditScreen";
import RoleListScreen from "../features/admin/screens/RoleListScreen";
import RoleCreateScreen from "../features/admin/screens/RoleCreateScreen";
import RoleShowScreen from "../features/admin/screens/RoleShowScreen";
import RoleEditScreen from "../features/admin/screens/RoleEditScreen";
import PermissionMatrixScreen from "../features/admin/screens/PermissionMatrixScreen";

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f5f5f5" },
        animation: "slide_from_right",
      }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="UserList" component={UserListScreen} />
      <Stack.Screen name="UserCreate" component={UserCreateScreen} />
      <Stack.Screen name="UserShow" component={UserShowScreen} />
      <Stack.Screen name="UserEdit" component={UserEditScreen} />
      <Stack.Screen name="RoleList" component={RoleListScreen} />
      <Stack.Screen name="RoleCreate" component={RoleCreateScreen} />
      <Stack.Screen name="RoleShow" component={RoleShowScreen} />
      <Stack.Screen name="RoleEdit" component={RoleEditScreen} />
      <Stack.Screen
        name="PermissionMatrix"
        component={PermissionMatrixScreen}
      />
    </Stack.Navigator>
  );
}
