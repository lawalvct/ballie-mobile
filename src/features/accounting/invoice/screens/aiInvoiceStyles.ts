/* ─── AI Invoice Screen — Styles ───────────────────────────────────────────
 *  Extracted from AIInvoiceScreen.tsx to keep the screen file short.
 * ─────────────────────────────────────────────────────────────────────────── */

import { StyleSheet, Dimensions } from "react-native";
import { BRAND_COLORS } from "../../../../theme/colors";

const { width: SCREEN_W } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  /* ── Content ── */
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 40,
  },
  previewInner: {
    padding: 16,
    paddingBottom: 40,
  },

  /* ── Hero card ── */
  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
    marginBottom: 8,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },

  /* ── Input card ── */
  inputCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  micButtonActive: {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
  },
  micIcon: {
    fontSize: 18,
  },
  listeningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  listeningText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#991b1b",
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1f2937",
    minHeight: 110,
    backgroundColor: "#fafafa",
    lineHeight: 22,
  },
  charCountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  voiceHint: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ef4444",
  },
  charCount: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: "auto",
  },

  /* ── Chips ── */
  chipSectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 10,
  },
  chipScroll: {
    marginBottom: 20,
  },
  chipContainer: {
    gap: 10,
    paddingRight: 8,
  },
  chip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BRAND_COLORS.gold,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: SCREEN_W * 0.7,
  },
  chipText: {
    fontSize: 13,
    color: BRAND_COLORS.darkPurple,
    lineHeight: 18,
  },

  /* ── Error ── */
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#991b1b",
    lineHeight: 20,
  },

  /* ── Generate button ── */
  generateBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
  },
  generateBtnGradient: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 14,
  },
  generateBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  disabledBtn: {
    opacity: 0.45,
  },

  /* ── Loading ── */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  loadingTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: BRAND_COLORS.darkPurple,
    marginTop: 20,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 6,
    textAlign: "center",
  },
  loadingDots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND_COLORS.gold,
  },

  /* ── Preview — Type badge ── */
  typeBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  typeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  salesBadge: {
    backgroundColor: "#dcfce7",
  },
  purchaseBadge: {
    backgroundColor: "#dbeafe",
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  voucherTypeName: {
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
  },

  /* ── Preview — Cards ── */
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  matchedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  matchIcon: {
    fontSize: 16,
  },
  matchedText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
  },
  unmatchedRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  warnIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  unmatchedText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#92400e",
  },
  unmatchedHint: {
    fontSize: 12,
    color: "#b45309",
    marginTop: 2,
  },

  /* ── Date ── */
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },

  /* ── Items ── */
  itemRow: {
    paddingVertical: 10,
  },
  itemRowWarning: {
    backgroundColor: "#fffbeb",
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: -4,
  },
  itemRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  itemMatchIcon: {
    fontSize: 14,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  itemMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 28,
  },
  itemQty: {
    fontSize: 14,
    color: "#6b7280",
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  itemNotFound: {
    paddingLeft: 28,
    fontSize: 12,
    color: "#b45309",
    marginTop: 4,
    fontStyle: "italic",
  },
  itemStock: {
    paddingLeft: 28,
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  /* ── Totals ── */
  totalsCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  grandTotalRow: {
    borderTopWidth: 1.5,
    borderTopColor: BRAND_COLORS.gold,
    marginTop: 8,
    paddingTop: 12,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.darkPurple,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: BRAND_COLORS.darkPurple,
  },

  /* ── Interpretation ── */
  interpretationCard: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  interpretationLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND_COLORS.blue,
    marginBottom: 6,
  },
  interpretationText: {
    fontSize: 14,
    color: "#1e40af",
    lineHeight: 20,
  },

  /* ── Warning banner ── */
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  warningBannerIcon: {
    fontSize: 18,
  },
  warningBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#92400e",
    lineHeight: 19,
  },

  /* ── Action buttons ── */
  actionSection: {
    gap: 10,
    marginTop: 4,
  },
  submitDirectBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  applyFormBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  actionBtnGradient: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 14,
  },
  submitDirectText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  applyFormText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  tryAgainBtn: {
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 14,
    backgroundColor: "#fff",
  },
  tryAgainText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
});
