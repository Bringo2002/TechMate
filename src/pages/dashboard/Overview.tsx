import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MetricCard } from "../../components/dashboard/cards/OverviewCard";
import { ServiceCard } from "../../components/dashboard/cards/ServiceCard";
import { LineChart, BarChart, RequestBreakdownPie } from "../../components/dashboard/charts";
import { RecentRequestsTable } from "../../components/dashboard/tables/RecentRequestsTable";
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
import { useDashboard } from "../../hooks/useDashboard";
import { useAuth } from "../../hooks/useAuth";
import { motion } from "framer-motion";

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { verifyToken } = useAuth(); 
  const { metrics, services, chartData, pieData, recentRequests } = useDashboard();
  const [loading, setLoading] = useState(true);

  const metricIcons: Record<string, React.ReactNode> = {
    "Total Users": <Users className="w-6 h-6 text-cyan-400" />,
    "Total Messages": <MessageSquare className="w-6 h-6 text-purple-400" />,
    "Open Requests": <FolderOpen className="w-6 h-6 text-green-400" />,
    "Web Services": <Globe className="w-6 h-6 text-pink-400" />,
  };

  const serviceIcons: Record<string, React.ReactNode> = {
    "Web App Development": <Globe className="w-6 h-6 text-cyan-400" />,
    "Mobile Apps": <Smartphone className="w-6 h-6 text-purple-400" />,
    "Desktop Software": <Monitor className="w-6 h-6 text-pink-400" />,
    "MVPs & Prototypes": <Zap className="w-6 h-6 text-yellow-400" />,
    "Custom APIs & Backend": <Database className="w-6 h-6 text-orange-400" />,
  };

  useEffect(() => {
    const checkAuth = async () => {
      const valid = await verifyToken();
      if (!valid) navigate("/login");
      else setLoading(false);
    };
    checkAuth();
  }, [navigate, verifyToken]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#01062d]">
        <motion.div
          className="w-12 h-12 rounded-full border-4 border-cyan-400 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );

  return (
    <>
      {/* Metrics */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.1 },
          },
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {metrics.map((metric) => (
          <motion.div key={metric.title} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
            <MetricCard {...metric} icon={metricIcons[metric.title]} futuristic />
          </motion.div>
        ))}
      </motion.div>

      {/* Services */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        {services.map((service) => (
          <ServiceCard key={service.title} {...service} icon={serviceIcons[service.title]} futuristic />
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2 glass-card"
        >
          <h2 className="section-title text-cyan-400">Sales Overview</h2>
          <LineChart data={chartData} futuristic />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card"
        >
          <h2 className="section-title text-purple-400">Request Breakdown</h2>
          <RequestBreakdownPie data={pieData} futuristic />
        </motion.div>
      </div>

      {/* Bar Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card"
        >
          <h2 className="section-title text-orange-400">Monthly Summary</h2>
          <BarChart data={chartData} futuristic />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card"
        >
          <h2 className="section-title text-green-400">Recent Requests</h2>
          <RecentRequestsTable data={recentRequests} futuristic />
        </motion.div>
      </div>
    </>
  );
};


export default Overview;
