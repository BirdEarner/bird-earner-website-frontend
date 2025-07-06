"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, DollarSign, UserCheck, HelpCircle } from "lucide-react";
import { useAdminAuth } from "@/hooks/AdminAuthContext";
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const lineData = [
  { name: 'Jan', clients: 40, freelancers: 30 },
  { name: 'Feb', clients: 30, freelancers: 25 },
  { name: 'Mar', clients: 50, freelancers: 45 },
  { name: 'Apr', clients: 27, freelancers: 20 },
  { name: 'May', clients: 18, freelancers: 15 },
  { name: 'Jun', clients: 23, freelancers: 20 },
];

const pieData = [
  { name: 'Pending Payouts', value: 4 },
  { name: 'Completed', value: 8 },
  { name: 'Processing', value: 2 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function SuperAdminDashboard() {
  const { isAuthenticated, loading, admin } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push('/money_plant/sign-in');
    }
  }, [loading, isAuthenticated, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-purple-50/50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-purple-50/50">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Super Admin Dashboard
        </h1>
        <p className="text-black/70">
          Welcome back{admin?.name ? `, ${admin.name}` : ''}! Here's an overview of your platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Clients",
            value: "234",
            icon: Users,
            trend: "+12.5%",
          },
          {
            title: "Total Freelancers",
            value: "123",
            icon: UserCheck,
            trend: "+8.2%",
          },
          {
            title: "Pending Payouts",
            value: "$12,345",
            icon: DollarSign,
            trend: "+23.1%",
          },
          {
            title: "Active FAQs",
            value: "32",
            icon: HelpCircle,
            trend: "+4.3%",
          },
        ].map((card, index) => (
          <div
            key={index}
            className="rounded-xl border border-purple-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <card.icon className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-black/70">
                {card.title}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-black">{card.value}</span>
              <span className="text-sm text-green-500">{card.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Line Chart */}
        <div className="rounded-xl border border-purple-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-black">User Growth</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="clients" 
                  stroke="#8884d8" 
                  name="Clients"
                />
                <Line 
                  type="monotone" 
                  dataKey="freelancers" 
                  stroke="#82ca9d" 
                  name="Freelancers"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="rounded-xl border border-purple-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-black">Payout Status</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 