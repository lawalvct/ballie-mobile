// ── POS Cart Context ─────────────────────────────────────────────────────────
import React, { createContext, useContext, useReducer, useCallback } from "react";
import type { CartItem, CartPayment, PosProduct } from "../types";

// ── State ────────────────────────────────────────────────────────────────────
interface CartState {
  items: CartItem[];
  payments: CartPayment[];
  customerId: number | null;
  customerName: string | null;
  notes: string;
}

const initialState: CartState = {
  items: [],
  payments: [],
  customerId: null,
  customerName: null,
  notes: "",
};

// ── Computed ─────────────────────────────────────────────────────────────────
function computeLineTotals(
  unitPrice: number,
  quantity: number,
  discount: number,
  taxRate: number,
): { line_subtotal: number; line_discount: number; line_tax: number; line_total: number } {
  const line_subtotal = quantity * unitPrice;
  const line_discount = discount;
  const line_tax = (line_subtotal - line_discount) * (taxRate / 100);
  const line_total = line_subtotal - line_discount + line_tax;
  return { line_subtotal, line_discount, line_tax, line_total };
}

// ── Actions ──────────────────────────────────────────────────────────────────
type CartAction =
  | { type: "ADD_ITEM"; product: PosProduct }
  | { type: "REMOVE_ITEM"; productId: number }
  | { type: "UPDATE_QUANTITY"; productId: number; quantity: number }
  | { type: "UPDATE_DISCOUNT"; productId: number; discount: number }
  | { type: "SET_CUSTOMER"; customerId: number | null; customerName: string | null }
  | { type: "SET_NOTES"; notes: string }
  | { type: "SET_PAYMENTS"; payments: CartPayment[] }
  | { type: "CLEAR_CART" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const p = action.product;
      const existing = state.items.find((i) => i.product_id === p.id);
      if (existing) {
        const newQty = existing.quantity + 1;
        return {
          ...state,
          items: state.items.map((i) =>
            i.product_id === p.id
              ? {
                  ...i,
                  quantity: newQty,
                  ...computeLineTotals(i.unit_price, newQty, i.discount_amount, i.tax_rate),
                }
              : i,
          ),
        };
      }
      const unitPrice = parseFloat(p.selling_price);
      const taxRate = parseFloat(p.tax_rate);
      const newItem: CartItem = {
        product_id: p.id,
        name: p.name,
        sku: p.sku,
        image_url: p.image_url,
        unit_price: unitPrice,
        quantity: 1,
        discount_amount: 0,
        tax_rate: taxRate,
        available_stock: p.current_stock,
        ...computeLineTotals(unitPrice, 1, 0, taxRate),
      };
      return { ...state, items: [...state.items, newItem] };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.product_id !== action.productId),
      };

    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.product_id !== action.productId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product_id === action.productId
            ? {
                ...i,
                quantity: action.quantity,
                ...computeLineTotals(i.unit_price, action.quantity, i.discount_amount, i.tax_rate),
              }
            : i,
        ),
      };
    }

    case "UPDATE_DISCOUNT":
      return {
        ...state,
        items: state.items.map((i) =>
          i.product_id === action.productId
            ? {
                ...i,
                discount_amount: action.discount,
                ...computeLineTotals(i.unit_price, i.quantity, action.discount, i.tax_rate),
              }
            : i,
        ),
      };

    case "SET_CUSTOMER":
      return { ...state, customerId: action.customerId, customerName: action.customerName };

    case "SET_NOTES":
      return { ...state, notes: action.notes };

    case "SET_PAYMENTS":
      return { ...state, payments: action.payments };

    case "CLEAR_CART":
      return initialState;

    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────────────────
interface CartContextValue {
  items: CartItem[];
  payments: CartPayment[];
  customerId: number | null;
  customerName: string | null;
  notes: string;
  itemCount: number;
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  totalPaid: number;
  changeAmount: number;
  remainingBalance: number;
  addItem: (product: PosProduct) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updateDiscount: (productId: number, discount: number) => void;
  setCustomer: (id: number | null, name: string | null) => void;
  setNotes: (notes: string) => void;
  setPayments: (payments: CartPayment[]) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.line_subtotal, 0);
  const totalDiscount = state.items.reduce((sum, i) => sum + i.line_discount, 0);
  const totalTax = state.items.reduce((sum, i) => sum + i.line_tax, 0);
  const grandTotal = state.items.reduce((sum, i) => sum + i.line_total, 0);
  const totalPaid = state.payments.reduce((sum, p) => sum + p.amount, 0);
  const changeAmount = Math.max(0, totalPaid - grandTotal);
  const remainingBalance = Math.max(0, grandTotal - totalPaid);

  const addItem = useCallback((product: PosProduct) => dispatch({ type: "ADD_ITEM", product }), []);
  const removeItem = useCallback((productId: number) => dispatch({ type: "REMOVE_ITEM", productId }), []);
  const updateQuantity = useCallback((productId: number, quantity: number) => dispatch({ type: "UPDATE_QUANTITY", productId, quantity }), []);
  const updateDiscount = useCallback((productId: number, discount: number) => dispatch({ type: "UPDATE_DISCOUNT", productId, discount }), []);
  const setCustomer = useCallback((id: number | null, name: string | null) => dispatch({ type: "SET_CUSTOMER", customerId: id, customerName: name }), []);
  const setNotes = useCallback((notes: string) => dispatch({ type: "SET_NOTES", notes }), []);
  const setPayments = useCallback((payments: CartPayment[]) => dispatch({ type: "SET_PAYMENTS", payments }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        payments: state.payments,
        customerId: state.customerId,
        customerName: state.customerName,
        notes: state.notes,
        itemCount,
        subtotal,
        totalDiscount,
        totalTax,
        grandTotal,
        totalPaid,
        changeAmount,
        remainingBalance,
        addItem,
        removeItem,
        updateQuantity,
        updateDiscount,
        setCustomer,
        setNotes,
        setPayments,
        clearCart,
      }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
