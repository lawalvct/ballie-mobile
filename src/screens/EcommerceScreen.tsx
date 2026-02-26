import React from "react";
import ModuleScreenLayout from "../components/ModuleScreenLayout";
import RevenueCard from "../components/ecommerce/RevenueCard";
import OrderStats from "../components/ecommerce/OrderStats";
import OrderFilters from "../components/ecommerce/OrderFilters";
import OrderTable from "../components/ecommerce/OrderTable";
import StoreSettings from "../components/ecommerce/StoreSettings";

export default function EcommerceScreen() {
  return (
    <ModuleScreenLayout>
      <RevenueCard />
      <OrderStats />
      <OrderFilters />
      <OrderTable />
      <StoreSettings />
    </ModuleScreenLayout>
  );
}
