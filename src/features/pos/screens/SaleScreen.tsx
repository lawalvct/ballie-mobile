import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { POSStackParamList } from "../../../navigation/types";
import { BRAND_COLORS, SEMANTIC_COLORS } from "../../../theme/colors";
import { usePosInitData, usePosSession } from "../hooks/usePos";
import { useCart } from "../context/CartContext";
import CartSheet from "../components/CartSheet";
import PaymentModal from "../components/PaymentModal";
import type { PosProduct } from "../types";

type Props = NativeStackScreenProps<POSStackParamList, "POSSale">;

function formatCurrency(n: number | string): string {
  const val = typeof n === "string" ? parseFloat(n) : n;
  return `₦${val.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function ProductCard({
  product,
  onPress,
}: {
  product: PosProduct;
  onPress: () => void;
}) {
  const price = parseFloat(product.selling_price);
  const stock = product.current_stock;
  const outOfStock = product.maintain_stock && stock <= 0;

  let stockColor = "#DEF7EC";
  let stockTextColor = "#03543F";
  let stockLabel = `${stock} in stock`;
  if (outOfStock) {
    stockColor = "#FDE8E8";
    stockTextColor = "#9B1C1C";
    stockLabel = "Out of stock";
  } else if (product.maintain_stock && stock <= 5) {
    stockColor = "#FDF6B2";
    stockTextColor = "#723B13";
    stockLabel = `${stock} left`;
  }

  return (
    <TouchableOpacity
      style={[styles.productCard, outOfStock && styles.productCardDisabled]}
      onPress={onPress}
      disabled={outOfStock}
      activeOpacity={0.7}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.productImage} />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.productImageIcon}>📦</Text>
        </View>
      )}
      <Text style={styles.productName} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.productPrice}>{formatCurrency(price)}</Text>
      {product.maintain_stock && (
        <View style={[styles.stockBadge, { backgroundColor: stockColor }]}>
          <Text style={[styles.stockText, { color: stockTextColor }]}>{stockLabel}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function SaleScreen({ navigation }: Props) {
  const { hasActiveSession } = usePosSession();
  const { products, categories, isLoading, isRefreshing, refresh } = usePosInitData(hasActiveSession);
  const cart = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory) {
      result = result.filter((p) => p.category_id === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
      );
    }
    return result;
  }, [products, selectedCategory, searchQuery]);

  const handleAddToCart = useCallback(
    (product: PosProduct) => {
      cart.addItem(product);
    },
    [cart],
  );

  const renderProduct = useCallback(
    ({ item }: { item: PosProduct }) => (
      <ProductCard product={item} onPress={() => handleAddToCart(item)} />
    ),
    [handleAddToCart],
  );

  if (!hasActiveSession) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar style="dark" />
        <View style={styles.noSessionContainer}>
          <Text style={styles.noSessionIcon}>💳</Text>
          <Text style={styles.noSessionTitle}>No Active Session</Text>
          <Text style={styles.noSessionSubtitle}>
            Open a cash register session to start selling
          </Text>
          <TouchableOpacity
            style={styles.goToSessionButton}
            onPress={() => navigation.navigate("POSSession")}>
            <LinearGradient
              colors={[BRAND_COLORS.gold, "#c9a556"]}
              style={styles.goToSessionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Text style={styles.goToSessionText}>Open Session</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="dark" />

      {/* Top Bar: Search */}
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryBar}
        contentContainerStyle={styles.categoryContent}>
        <TouchableOpacity
          style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
          onPress={() => setSelectedCategory(null)}>
          <Text
            style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={`cat-${cat.id}`}
            style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}>
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat.id && styles.categoryChipTextActive,
              ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product Grid */}
      {isLoading ? (
        <ActivityIndicator size="large" color={BRAND_COLORS.gold} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => `product-${item.id}`}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          onRefresh={refresh}
          refreshing={isRefreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}

      {/* Cart Summary Bar */}
      {cart.itemCount > 0 && (
        <TouchableOpacity style={styles.cartBar} onPress={() => setShowCart(true)} activeOpacity={0.9}>
          <LinearGradient
            colors={[BRAND_COLORS.darkPurple, "#5a4a7e"]}
            style={styles.cartBarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}>
            <View style={styles.cartBarLeft}>
              <View style={styles.cartCountBadge}>
                <Text style={styles.cartCountText}>{cart.itemCount}</Text>
              </View>
              <Text style={styles.cartBarLabel}>
                {cart.items.length} item{cart.items.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <Text style={styles.cartBarTotal}>{formatCurrency(cart.grandTotal)}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Cart Sheet */}
      <CartSheet
        visible={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={() => {
          setShowCart(false);
          setShowPayment(true);
        }}
      />

      {/* Payment Modal */}
      <PaymentModal
        visible={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={() => {
          setShowPayment(false);
          navigation.navigate("POSTransactions");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f5f5" },

  // No session
  noSessionContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  noSessionIcon: { fontSize: 64, marginBottom: 16 },
  noSessionTitle: { fontSize: 22, fontWeight: "bold", color: BRAND_COLORS.darkPurple, marginBottom: 8 },
  noSessionSubtitle: { fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 24 },
  goToSessionButton: { borderRadius: 12, width: "100%", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  goToSessionGradient: { padding: 16, borderRadius: 12, alignItems: "center" },
  goToSessionText: { fontSize: 16, fontWeight: "bold", color: "#fff" },

  // Top bar
  topBar: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#f3f4f6", borderRadius: 12, paddingHorizontal: 14, height: 44 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: BRAND_COLORS.darkPurple },
  clearSearch: { fontSize: 16, color: "#9ca3af", padding: 4 },

  // Categories
  categoryBar: { maxHeight: 52, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  categoryContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#f3f4f6", marginRight: 4 },
  categoryChipActive: { backgroundColor: BRAND_COLORS.darkPurple },
  categoryChipText: { fontSize: 13, fontWeight: "500", color: "#6b7280" },
  categoryChipTextActive: { color: "#fff" },

  // Product grid
  productList: { padding: 12, paddingBottom: 100 },
  productRow: { gap: 12, paddingHorizontal: 4 },
  productCard: { flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 12, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  productCardDisabled: { opacity: 0.5 },
  productImage: { width: "100%", height: 100, borderRadius: 10, marginBottom: 8, backgroundColor: "#f3f4f6" },
  productImagePlaceholder: { width: "100%", height: 100, borderRadius: 10, marginBottom: 8, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" },
  productImageIcon: { fontSize: 32 },
  productName: { fontSize: 14, fontWeight: "600", color: BRAND_COLORS.darkPurple, marginBottom: 4, height: 36 },
  productPrice: { fontSize: 16, fontWeight: "bold", color: BRAND_COLORS.gold, marginBottom: 6 },
  stockBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  stockText: { fontSize: 11, fontWeight: "600" },

  // Cart bar
  cartBar: { position: "absolute", bottom: 0, left: 0, right: 0 },
  cartBarGradient: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16 },
  cartBarLeft: { flexDirection: "row", alignItems: "center" },
  cartCountBadge: { backgroundColor: BRAND_COLORS.gold, width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", marginRight: 10 },
  cartCountText: { fontSize: 13, fontWeight: "bold", color: "#fff" },
  cartBarLabel: { fontSize: 15, color: "rgba(255,255,255,0.9)" },
  cartBarTotal: { fontSize: 18, fontWeight: "bold", color: "#fff" },

  // Empty
  emptyContainer: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#6b7280" },
});
