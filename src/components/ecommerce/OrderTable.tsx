import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../theme/colors";

interface Order {
  orderNumber: string;
  customer: string;
  date: string;
  items: number;
  total: string;
  status: "Pending" | "In Progress" | "Delivered" | "Cancelled";
  payment: "Paid" | "Unpaid" | "Refunded" | "Partial";
}

export default function OrderTable() {
  const orders: Order[] = [
    {
      orderNumber: "ORD-2025-001",
      customer: "John Doe",
      date: "28 Dec 2025",
      items: 3,
      total: "₦45,500",
      status: "Delivered",
      payment: "Paid",
    },
    {
      orderNumber: "ORD-2025-002",
      customer: "Jane Smith",
      date: "28 Dec 2025",
      items: 1,
      total: "₦18,200",
      status: "In Progress",
      payment: "Paid",
    },
    {
      orderNumber: "ORD-2025-003",
      customer: "Acme Corp",
      date: "27 Dec 2025",
      items: 5,
      total: "₦125,000",
      status: "Pending",
      payment: "Unpaid",
    },
    {
      orderNumber: "ORD-2025-004",
      customer: "Tech Solutions",
      date: "27 Dec 2025",
      items: 2,
      total: "₦67,800",
      status: "Delivered",
      payment: "Paid",
    },
    {
      orderNumber: "ORD-2025-005",
      customer: "Global Trade",
      date: "26 Dec 2025",
      items: 4,
      total: "₦92,300",
      status: "In Progress",
      payment: "Partial",
    },
    {
      orderNumber: "ORD-2025-006",
      customer: "Mary Johnson",
      date: "26 Dec 2025",
      items: 1,
      total: "₦15,500",
      status: "Cancelled",
      payment: "Refunded",
    },
  ];

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Delivered":
        return "#10b981";
      case "In Progress":
        return "#3b82f6";
      case "Pending":
        return "#f59e0b";
      case "Cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getPaymentColor = (payment: Order["payment"]) => {
    switch (payment) {
      case "Paid":
        return "#10b981";
      case "Unpaid":
        return "#ef4444";
      case "Refunded":
        return "#6b7280";
      case "Partial":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Orders</Text>
        <Text style={styles.orderCount}>{orders.length} orders</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.orderNumberCol]}>
              Order #
            </Text>
            <Text style={[styles.headerCell, styles.customerCol]}>
              Customer
            </Text>
            <Text style={[styles.headerCell, styles.dateCol]}>Date</Text>
            <Text style={[styles.headerCell, styles.itemsCol]}>Items</Text>
            <Text style={[styles.headerCell, styles.totalCol]}>Total</Text>
            <Text style={[styles.headerCell, styles.statusCol]}>Status</Text>
            <Text style={[styles.headerCell, styles.paymentCol]}>Payment</Text>
            <Text style={[styles.headerCell, styles.actionCol]}>Action</Text>
          </View>

          {/* Table Rows */}
          {orders.map((order, index) => (
            <View
              key={index}
              style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
              <Text
                style={[
                  styles.cell,
                  styles.orderNumberCol,
                  styles.orderNumber,
                ]}>
                {order.orderNumber}
              </Text>
              <Text style={[styles.cell, styles.customerCol]}>
                {order.customer}
              </Text>
              <Text style={[styles.cell, styles.dateCol, styles.dateText]}>
                {order.date}
              </Text>
              <Text style={[styles.cell, styles.itemsCol, styles.centerText]}>
                {order.items}
              </Text>
              <Text style={[styles.cell, styles.totalCol, styles.totalText]}>
                {order.total}
              </Text>
              <View style={styles.statusColContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) },
                  ]}>
                  <Text style={styles.badgeText}>{order.status}</Text>
                </View>
              </View>
              <View style={styles.paymentColContainer}>
                <View
                  style={[
                    styles.paymentBadge,
                    { backgroundColor: getPaymentColor(order.payment) },
                  ]}>
                  <Text style={styles.badgeText}>{order.payment}</Text>
                </View>
              </View>
              <View style={styles.actionColContainer}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BRAND_COLORS.darkPurple,
  },
  orderCount: {
    fontSize: 13,
    color: "#6b7280",
  },
  table: {
    backgroundColor: SEMANTIC_COLORS.white,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: SEMANTIC_COLORS.white,
  },
  tableRowAlt: {
    backgroundColor: "#f9e6ff",
  },
  cell: {
    fontSize: 13,
    color: "#1f2937",
  },
  orderNumberCol: {
    width: 120,
  },
  customerCol: {
    width: 130,
  },
  dateCol: {
    width: 100,
  },
  itemsCol: {
    width: 60,
  },
  totalCol: {
    width: 90,
  },
  statusColContainer: {
    width: 100,
  },
  statusCol: {
    width: 100,
  },
  paymentColContainer: {
    width: 90,
  },
  paymentCol: {
    width: 90,
  },
  actionColContainer: {
    width: 80,
  },
  actionCol: {
    width: 80,
  },
  orderNumber: {
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
  },
  dateText: {
    color: "#6b7280",
  },
  centerText: {
    textAlign: "center",
  },
  totalText: {
    fontWeight: "600",
    color: "#059669",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: SEMANTIC_COLORS.white,
  },
  actionButton: {
    backgroundColor: BRAND_COLORS.darkPurple,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: SEMANTIC_COLORS.white,
  },
});
