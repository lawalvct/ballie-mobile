import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import DashboardScreen from "./DashboardScreen";
import AccountingScreen from "./AccountingScreen";
import InventoryScreen from "./InventoryScreen";
import ReportsScreen from "./ReportsScreen";
import CRMScreen from "./CRMScreen";
import CustomTabBar from "../components/CustomTabBar";

export default function MainNavigator() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderScreen = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardScreen />;
      case "accounting":
        return <AccountingScreen />;
      case "inventory":
        return <InventoryScreen />;
      case "reports":
        return <ReportsScreen />;
      case "crm":
        return <CRMScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderScreen()}</View>
      <CustomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
