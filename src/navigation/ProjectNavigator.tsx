import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { ProjectStackParamList } from "./types";

import ProjectListScreen from "../features/projects/screens/ProjectListScreen";
import ProjectCreateScreen from "../features/projects/screens/ProjectCreateScreen";
import ProjectEditScreen from "../features/projects/screens/ProjectEditScreen";
import ProjectDetailScreen from "../features/projects/screens/ProjectDetailScreen";
import ProjectReportsScreen from "../features/projects/screens/ProjectReportsScreen";

const Stack = createNativeStackNavigator<ProjectStackParamList>();

export default function ProjectNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f5f5f5" },
        animation: "slide_from_right",
      }}>
      <Stack.Screen name="ProjectList" component={ProjectListScreen} />
      <Stack.Screen name="ProjectCreate" component={ProjectCreateScreen} />
      <Stack.Screen name="ProjectEdit" component={ProjectEditScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen name="ProjectReports" component={ProjectReportsScreen} />
    </Stack.Navigator>
  );
}
