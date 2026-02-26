import React from "react";
import ModuleScreenLayout from "../components/ModuleScreenLayout";
import AdminOverview from "../components/admins/AdminOverview";
import RoleDistribution from "../components/admins/RoleDistribution";
import UserManagement from "../components/admins/UserManagement";

export default function AdminsScreen() {
  return (
    <ModuleScreenLayout>
      <AdminOverview />
      <RoleDistribution />
      <UserManagement />
    </ModuleScreenLayout>
  );
}
