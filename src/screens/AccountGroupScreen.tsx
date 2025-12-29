import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../theme/colors";
import AppHeader from "../components/AppHeader";
import AccountGroupStats from "../components/accountgroup/AccountGroupStats";
import AccountGroupFilters from "../components/accountgroup/AccountGroupFilters";
import AccountGroupList from "../components/accountgroup/AccountGroupList";

export default function AccountGroupScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BRAND_COLORS.darkPurple}
      />
      <AppHeader
        businessName="Account Group"
        userName="Admin"
        userRole="Administrator"
      />

      <ScrollView style={styles.content}>
        {/* Add New Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("accountgroupcreate")}>
            <Text style={styles.addButtonText}>+ Add New Account Group</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <AccountGroupStats />

        {/* Filters Section */}
        <AccountGroupFilters />

        {/* Account Group List */}
        <AccountGroupList />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.darkPurple,
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  addButton: {
    backgroundColor: BRAND_COLORS.gold,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: BRAND_COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
});
