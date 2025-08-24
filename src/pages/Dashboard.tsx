import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { MetricCard } from "../components/dashboard/cards/OverviewCard";
import { ServiceCard } from "../components/dashboard/cards/ServiceCard";
import { LineChart, BarChart, RequestBreakdownPie } from "../components/dashboard/charts";
import { RecentRequestsTable } from "../components/dashboard/tables/RecentRequestsTable";
import {
  Users,
  MessageSquare,
  FolderOpen,
  Globe,
  Smartphone,
  Monitor,
  Zap,
  Database,
} from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { useAuth } from "../hooks/useAuth";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { verifyToken } = useAuth(); // JWT verification
  const { metrics, services, chartData, pieData, recentRequests } = useDashboard();
  const [loading, setLoading] = useState(true);

  // Map metric titles to icons
  const metricIcons: Record<string, React.ReactNode> = {
    "Total Users": <Users className="w-6 h-6 text-white" />,
    "Total Messages": <MessageSquare className="w-6 h-6 text-white" />,
    "Open Requests": <FolderOpen className="w-6 h-6 text-white" />,
    "Web Services": <Globe className="w-6 h-6 text-white" />,
  };

  // Map service titles to icons
  const serviceIcons: Record<string, React.ReactNode> = {
    "Web App Development": <Globe className="w-6 h-6 text-white" />,
    "Mobile Apps": <Smartphone className="w-6 h-6 text-white" />,
    "Desktop Software": <Monitor className="w-6 h-6 text-white" />,
    "MVPs & Prototypes": <Zap className="w-6 h-6 text-white" />,
    "Custom APIs & Backend": <Database className="w-6 h-6 text-white" />,
  };

  // Verify JWT token on page load
  useEffect(() => {
    const checkAuth = async () => {
      const valid = await verifyToken();
      if (!valid) {
        navigate("/login"); // Redirect if not authenticated
      } else {
        setLoading(false); // Show dashboard only after verification
      }
    };
    checkAuth();
  }, [navigate, verifyToken]);

  // Show loading state while verifying token
  if (loading) return <p className="text-center mt-20 text-white">Verifying session...</p>;

  return (
    <DashboardLayout>
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            {...metric}
            icon={metricIcons[metric.title]}
          />
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {services.map((service) => (
          <ServiceCard
            key={service.title}
            {...service}
            icon={serviceIcons[service.title]}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Line Chart: Sales Overview */}
        <div className="lg:col-span-2 bg-dashboard-background rounded-xl p-6 border border-dashboard-accentBlue shadow-md hover:shadow-lg transition duration-300">
          <h2 className="text-xl font-semibold text-dashboard-accentBlue mb-4">Sales Overview</h2>
          <LineChart data={chartData} />
        </div>

        {/* Pie Chart: Request Breakdown */}
        <div className="bg-dashboard-background rounded-xl p-6 border border-dashboard-accentPurple shadow-md hover:shadow-lg transition duration-300">
          <h2 className="text-xl font-semibold text-dashboard-accentPurple mb-4">Request Breakdown</h2>
          <RequestBreakdownPie data={pieData} />
        </div>
      </div>

      {/* Bar Chart + Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart: Monthly Summary */}
        <div className="bg-dashboard-background rounded-xl p-6 border border-dashboard-accentOrange shadow-md hover:shadow-lg transition duration-300">
          <h2 className="text-xl font-semibold text-dashboard-accentOrange mb-4">Monthly Summary</h2>
          <BarChart data={chartData} />
        </div>

        {/* Table: Recent Requests */}
        <div className="bg-dashboard-background rounded-xl p-6 border border-dashboard-accentGreen shadow-md hover:shadow-lg transition duration-300">
          <h2 className="text-xl font-semibold text-dashboard-accentGreen mb-4">Recent Requests</h2>
          <RecentRequestsTable data={recentRequests} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
