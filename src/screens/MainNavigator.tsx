import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { MainTabParamList } from "../navigation/types";

// Main Feature Screens
import DashboardScreen from "./DashboardScreen";
import POSNavigator from "../navigation/POSNavigator";
import CRMNavigator from "../navigation/CRMNavigator";
import ReportsNavigator from "../navigation/ReportsNavigator";
import AuditNavigator from "../navigation/AuditNavigator";
import EcommerceNavigator from "../navigation/EcommerceNavigator";
import AdminNavigator from "../navigation/AdminNavigator";
import TaxNavigator from "../navigation/TaxNavigator";
import ProjectNavigator from "../navigation/ProjectNavigator";

// Navigation Stacks
import AccountingNavigator from "../navigation/AccountingNavigator";
import InventoryNavigator from "../navigation/InventoryNavigator";
import PayrollNavigator from "../navigation/PayrollNavigator";

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
        <Tab.Screen name="POS" component={POSNavigator} />
        <Tab.Screen name="CRM" component={CRMNavigator} />
        <Tab.Screen name="Payroll" component={PayrollNavigator} />
        <Tab.Screen name="Reports" component={ReportsNavigator} />
        <Tab.Screen name="Audit" component={AuditNavigator} />
        <Tab.Screen name="Ecommerce" component={EcommerceNavigator} />

        <Tab.Screen name="Admins" component={AdminNavigator} />
        <Tab.Screen name="Statutory" component={TaxNavigator} />
        <Tab.Screen name="Projects" component={ProjectNavigator} />
      </Tab.Navigator>
      <DevScreenIndicator />
    </>
  );
}
