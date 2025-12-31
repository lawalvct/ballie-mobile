import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { MainTabParamList } from "../navigation/types";

// Main Feature Screens
import DashboardScreen from "./DashboardScreen";
import POSScreen from "./POSScreen";
import CRMScreen from "./CRMScreen";
import ReportsScreen from "./ReportsScreen";
import AuditScreen from "./AuditScreen";
import EcommerceScreen from "./EcommerceScreen";
import PayrollScreen from "./PayrollScreen";
import AdminsScreen from "./AdminsScreen";
import StatutoryScreen from "./StatutoryScreen";

// Navigation Stacks
import AccountingNavigator from "../navigation/AccountingNavigator";
import InventoryNavigator from "../navigation/InventoryNavigator";

// Custom Tab Bar
import CustomTabBar from "../components/CustomTabBar";
import { DevScreenIndicator } from "../components/DevScreenIndicator";

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}>
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Accounting" component={AccountingNavigator} />
        <Tab.Screen name="Inventory" component={InventoryNavigator} />
        <Tab.Screen name="POS" component={POSScreen} />
        <Tab.Screen name="CRM" component={CRMScreen} />
        <Tab.Screen name="Reports" component={ReportsScreen} />
        <Tab.Screen name="Audit" component={AuditScreen} />
        <Tab.Screen name="Ecommerce" component={EcommerceScreen} />
        <Tab.Screen name="Payroll" component={PayrollScreen} />
        <Tab.Screen name="Admins" component={AdminsScreen} />
        <Tab.Screen name="Statutory" component={StatutoryScreen} />
      </Tab.Navigator>
      <DevScreenIndicator />
    </>
  );
}
