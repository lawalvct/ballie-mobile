import React from "react";
import ModuleScreenLayout from "../components/ModuleScreenLayout";
import InventoryOverview from "../components/inventory/InventoryOverview";
import QuickActions from "../components/inventory/QuickActions";
import ProductsSection from "../components/inventory/ProductsSection";
import CategorySection from "../components/inventory/CategorySection";
import StockManagement from "../components/inventory/StockManagement";
import UnitsAndReports from "../components/inventory/UnitsAndReports";

export default function InventoryScreen() {
  return (
    <ModuleScreenLayout>
      <InventoryOverview />
      <QuickActions />
      <ProductsSection />
      <CategorySection />
      <StockManagement />
      <UnitsAndReports />
    </ModuleScreenLayout>
  );
}
