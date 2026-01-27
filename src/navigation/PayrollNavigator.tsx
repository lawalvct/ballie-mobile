import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { PayrollStackParamList } from "./types";
import PayrollScreen from "../screens/PayrollScreen";
import PayrollActionsScreen from "../screens/PayrollActionsScreen";

const Stack = createNativeStackNavigator<PayrollStackParamList>();

export default function PayrollNavigator() {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress" as any, () => {
      navigation.reset({
        index: 0,
        routes: [{ name: "PayrollHome" as any }],
      });
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f5f5f5" },
        animation: "slide_from_right",
      }}>
      <Stack.Screen
        name="PayrollHome"
        component={PayrollScreen}
        options={{ title: "Payroll" }}
      />
      <Stack.Screen
        name="PayrollActions"
        component={PayrollActionsScreen}
        options={{ title: "All Payroll Actions" }}
      />
    </Stack.Navigator>
  );
}
