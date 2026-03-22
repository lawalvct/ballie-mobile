import { StyleSheet } from "react-native";
import { BRAND_COLORS } from "../../../../theme/colors";

export const tabStyles = StyleSheet.create({
  tabContent: { paddingHorizontal: 20, paddingTop: 16 },

  // Cards
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: BRAND_COLORS.darkPurple, marginBottom: 12 },
  cardBody: { fontSize: 14, lineHeight: 20, color: "#374151" },

  // Breakdown rows (Overview)
  breakdownRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  breakdownLabel: { fontSize: 12, color: "#6b7280", width: 80 },
  breakdownBar: { flex: 1, height: 6, backgroundColor: "#e5e7eb", borderRadius: 3, overflow: "hidden" },
  breakdownFill: { height: "100%", borderRadius: 3 },
  breakdownValue: { fontSize: 12, fontWeight: "600", color: "#374151", width: 24, textAlign: "right" },

  // Summary grid (Overview)
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  summaryItem: { width: "46%", alignItems: "center", paddingVertical: 12, backgroundColor: "#f9fafb", borderRadius: 12 },
  summaryValue: { fontSize: 18, fontWeight: "bold", color: BRAND_COLORS.darkPurple },
  summaryLabel: { fontSize: 11, color: "#6b7280", marginTop: 2 },

  // Info rows (Overview)
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  infoLabel: { fontSize: 13, color: "#6b7280" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#374151", maxWidth: "60%", textAlign: "right" },

  // Add button
  addBtn: { backgroundColor: BRAND_COLORS.gold, paddingVertical: 12, borderRadius: 12, alignItems: "center", marginBottom: 14 },
  addBtnText: { fontSize: 14, fontWeight: "700", color: "#1a0f33" },

  // Inline form
  inlineForm: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 14 },
  formInput: { backgroundColor: "#f9fafb", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", fontSize: 14, color: "#1f2937", marginBottom: 10 },
  miniLabel: { fontSize: 12, fontWeight: "600", color: "#6b7280", marginBottom: 6 },
  chipRow: { flexDirection: "row", gap: 6, marginBottom: 10 },
  miniChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: "#f3f4f6", marginRight: 4 },
  miniChipActive: { backgroundColor: BRAND_COLORS.darkPurple },
  miniChipText: { fontSize: 12, fontWeight: "500", color: "#6b7280", textTransform: "capitalize" },
  miniChipTextActive: { color: "#fff" },
  formSubmitBtn: { backgroundColor: BRAND_COLORS.gold, paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 4 },
  formSubmitBtnText: { fontSize: 14, fontWeight: "700", color: "#1a0f33" },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  switchLabel: { fontSize: 14, color: "#374151", fontWeight: "500" },

  // Empty tab
  emptyTab: { alignItems: "center", paddingVertical: 40 },
  emptyTabIcon: { fontSize: 40, marginBottom: 8 },
  emptyTabText: { fontSize: 14, color: "#6b7280" },

  // Task card
  taskCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  taskHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  taskTitle: { fontSize: 14, fontWeight: "600", color: "#1f2937", flex: 1, marginRight: 8 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  priorityBadgeText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  taskMeta: { flexDirection: "row", gap: 12, marginBottom: 8 },
  taskMetaText: { fontSize: 12, color: "#6b7280" },
  taskActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: "#f3f4f6", marginRight: 6 },
  statusChipText: { fontSize: 11, fontWeight: "500", color: "#6b7280" },
  deleteIcon: { fontSize: 18, marginLeft: 8 },

  // Milestone card
  milestoneCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  milestoneHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkBtn: { marginTop: 2 },
  milestoneTitle: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  completedText: { textDecorationLine: "line-through", color: "#9ca3af" },
  milestoneMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  milestoneAmount: { fontSize: 13, fontWeight: "700", color: BRAND_COLORS.darkPurple },
  billableBadge: { backgroundColor: "#dbeafe", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  billableBadgeText: { fontSize: 10, fontWeight: "600", color: "#2563eb" },
  invoiceBadge: { backgroundColor: "#d1fae5", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  invoiceBadgeText: { fontSize: 10, fontWeight: "600", color: "#065f46" },
  milestoneActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  milestoneDue: { fontSize: 12, color: "#6b7280" },
  milestoneActionBtns: { flexDirection: "row", alignItems: "center", gap: 8 },
  invoiceBtn: { backgroundColor: BRAND_COLORS.gold, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  invoiceBtnText: { fontSize: 12, fontWeight: "700", color: "#1a0f33" },

  // Expense card
  expenseCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  expenseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  expenseTitle: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  expenseMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  categoryBadge: { backgroundColor: "#f3f4f6", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  categoryBadgeText: { fontSize: 10, fontWeight: "600", color: "#6b7280", textTransform: "capitalize" },
  expenseDate: { fontSize: 11, color: "#9ca3af" },
  expenseAmount: { fontSize: 16, fontWeight: "bold", color: "#dc2626" },
  expenseFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  expenseCreator: { fontSize: 12, color: "#6b7280" },
  expenseVoucher: { fontSize: 11, color: BRAND_COLORS.blue, fontWeight: "600" },

  // Note card
  noteCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  noteHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  noteAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: BRAND_COLORS.darkPurple, alignItems: "center", justifyContent: "center" },
  noteAvatarText: { fontSize: 14, fontWeight: "bold", color: "#fff" },
  noteNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  noteName: { fontSize: 13, fontWeight: "600", color: "#1f2937" },
  internalBadge: { backgroundColor: "#fef3c7", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  internalBadgeText: { fontSize: 9, fontWeight: "600", color: "#92400e" },
  noteTime: { fontSize: 11, color: "#9ca3af" },
  noteContent: { fontSize: 14, lineHeight: 20, color: "#374151" },

  // File card
  fileCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  fileIcon: { fontSize: 28 },
  fileName: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  fileMeta: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
});
