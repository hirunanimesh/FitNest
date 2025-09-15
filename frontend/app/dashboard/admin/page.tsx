import React from "react";
import { DashboardStats } from "./components/dashboard-stats";
import { DashboardCharts } from "./components/dashboard-charts";

function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="border-b border-gray-700 pb-6 p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 text-lg">
          Monitor your platform's performance and manage operations
        </p>
      </div>

      {/* Stats Overview */}
      <div className="px-6">
        <h2 className="text-xl font-semibold text-white mb-4">Platform Overview</h2>
        <DashboardStats />
      </div>
      
      {/* Charts Section */}
      <div className="px-6 pb-3">
        <DashboardCharts />
      </div>
    </div>
  );
}

export default AdminDashboardPage;
