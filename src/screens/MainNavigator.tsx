import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import DashboardScreen from "./DashboardScreen";
import AccountingScreen from "./AccountingScreen";
import InventoryScreen from "./InventoryScreen";
import POSScreen from "./POSScreen";
import CRMScreen from "./CRMScreen";
import ReportsScreen from "./ReportsScreen";
import AuditScreen from "./AuditScreen";
import EcommerceScreen from "./EcommerceScreen";
import PayrollScreen from "./PayrollScreen";
import AdminsScreen from "./AdminsScreen";
import StatutoryScreen from "./StatutoryScreen";
import AccountGroupScreen from "./AccountGroupScreen";
import AccountGroupCreateScreen from "./AccountGroupCreateScreen";
import CustomTabBar from "../components/CustomTabBar";

export default function MainNavigator() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderScreen = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardScreen />;
      case "accounting":
        return <AccountingScreen navigation={{ navigate: setActiveTab }} />;
      case "inventory":
        return <InventoryScreen />;
      case "pos":
        return <POSScreen />;
      case "crm":
        return <CRMScreen />;
      case "reports":
        return <ReportsScreen />;
      case "audit":
        return <AuditScreen />;
      case "ecommerce":
        return <EcommerceScreen />;
      case "payroll":
        return <PayrollScreen />;
      case "admins":
        return <AdminsScreen />;
      case "statutory":
        return <StatutoryScreen />;
      case "accountgroup":
        return (
          <AccountGroupScreen
            navigation={{
              navigate: setActiveTab,
              goBack: () => setActiveTab("accounting"),
            }}
          />
        );
      case "accountgroupcreate":
        return (
          <AccountGroupCreateScreen
            navigation={{
              navigate: setActiveTab,
              goBack: () => setActiveTab("accountgroup"),
            }}
          />
        );
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
