// Centralized hook for managing TechMate dashboard mock data

import { useState, useEffect } from "react";
import { MetricCardProps } from "../components/dashboard/cards/OverviewCard";
import { ServiceCardProps } from "../components/dashboard/cards/ServiceCard";
import { Request } from "../types";
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

// Chart data for line/bar charts
interface ChartData {
  month: string;
  value: number;
}

// Pie chart data structure
interface PieData {
  label: string;
  value: number;
  color: string;
}


// Aggregated dashboard data structure
interface DashboardData {
  metrics: MetricCardProps[];
  services: ServiceCardProps[];
  chartData: ChartData[];
  pieData: PieData[];
  recentRequests: Request[];
}

// ✅ Custom hook to provide dashboard data with proper return type
export const useDashboard = (): DashboardData => {
  const [data, setData] = useState<DashboardData>({
    metrics: [],
    services: [],
    chartData: [],
    pieData: [],
    recentRequests: [],
  });

  useEffect(() => {
    const mockMetrics: MetricCardProps[] = [
      {
        title: "Total Users",
        value: "12,480",
        change: "+8.2% last month",
        changeType: "positive",
        icon: <Users className="w-6 h-6 text-white" />,
        color: "bg-blue-500",
      },
      {
        title: "Total Messages",
        value: "1,240",
        change: "+8.2% last month",
        changeType: "positive",
        icon: <MessageSquare className="w-6 h-6 text-white" />,
        color: "bg-blue-500",
      },
      {
        title: "Open Requests",
        value: "307",
        change: "+10.5% month",
        changeType: "positive",
        icon: <FolderOpen className="w-6 h-6 text-white" />,
        color: "bg-orange-500",
      },
      {
        title: "Web Services",
        value: "12",
        change: "+5% month",
        changeType: "positive",
        icon: <Globe className="w-6 h-6 text-white" />,
        color: "bg-green-500",
      },
    ];

    const mockServices: ServiceCardProps[] = [
      {
        icon: <Globe className="w-6 h-6 text-white" />,
        title: "Web App Development",
        description: "Tailored web apps built to solve real problems and power your business.",
        color: "accentGreen",
      },
      {
        icon: <Smartphone className="w-6 h-6 text-white" />,
        title: "Mobile Apps",
        description: "Android and iOS apps designed to scale your business.",
        color: "accentBlue",
      },
      {
        icon: <Monitor className="w-6 h-6 text-white" />,
        title: "Desktop Software",
        description: "Custom desktop apps for Windows, macOS, and Linux.",
        color: "accentOrange",
      },
      {
        icon: <Zap className="w-6 h-6 text-white" />,
        title: "MVPs & Prototypes",
        description: "Quickly turn ideas into MVPs and prototypes to test and validate.",
        color: "accentPurple",
      },
      {
        icon: <Database className="w-6 h-6 text-white" />,
        title: "Custom APIs & Backend",
        description: "Robust backend systems built for your exact requirements.",
        color: "accentPurple",
      },
    ];

    const mockChartData: ChartData[] = [
      { month: "Jan", value: 20 },
      { month: "Feb", value: 35 },
      { month: "Mar", value: 25 },
      { month: "Apr", value: 45 },
      { month: "May", value: 55 },
      { month: "Jun", value: 70 },
      { month: "Dec", value: 85 },
    ];

    const mockPieData: PieData[] = [
      { label: "Open", value: 30, color: "#3B82F6" },
      { label: "In Progress", value: 40, color: "#10B981" },
      { label: "Closed", value: 30, color: "#F59E0B" },
    ];

    const mockRecentRequests: Request[] = [
      { id: 1, service: "Client Onboarding", client: "Acme Corp", status: "Pending", date: "2025-08-20" },
      { id: 2, service: "Bug Fix: Login", client: "Beta Ltd", status: "In Progress", date: "2025-08-21" },
      { id: 3, service: "Feature: Dark Mode", client: "Gamma Inc", status: "Completed", date: "2025-08-19" },
      { id: 4, service: "Performance Audit", client: "Delta LLC", status: "Pending", date: "2025-08-18" },
    ];

    // eslint-disable-next-line react-hooks/set-state-in-effect -- initializing mock data
    setData({
      metrics: mockMetrics,
      services: mockServices,
      chartData: mockChartData,
      pieData: mockPieData,
      recentRequests: mockRecentRequests,
    });
  }, []);

  return data;
};
