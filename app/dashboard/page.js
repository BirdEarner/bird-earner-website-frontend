"use client";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/services/api";
import {
  Bird, TrendingUp, Users, DollarSign, Clock, Star, Flag,
  Briefcase, GraduationCap, MapPin, Phone, Mail, Globe,
  Building2, Wallet, XCircle
} from "lucide-react";
import { useAuth } from "@/hooks/AuthContext";
import Image from "next/image";
import {
  LineChart,
  Line,
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function StatCard({ label, value, icon: Icon, iconColor }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <Icon className={`h-8 w-8 ${iconColor}`} />
      </div>
    </div>
  );
}

function FreelancerDashboard({ user, role, userData, dashboardData }) {
  const [stats, setStats] = useState({
    successScore: 0,
    rating: 0,
    responseTime: '< 1hr',
    level: 1,
    flags: [],
    xp: 0
  });
  const [earnings, setEarnings] = useState({
    total: 0,
    monthly: 0,
    outstanding: 0,
    forWithdrawal: 0
  });
  const [orders, setOrders] = useState({
    completed: 0,
    active: 0,
    cancelled: 0
  });
  const [earningsData, setEarningsData] = useState([]);
  const [freelancerProfile, setFreelancerProfile] = useState(null);

  useEffect(() => {
    if (userData) {
      setFreelancerProfile(userData);
    }

    if (dashboardData) {
      const data = dashboardData;
      const completedJobs = data.completedJobs || 0;
      const cancelledJobs = data.cancelledJobs || 0;
      const total = completedJobs + cancelledJobs;
      setStats({
        successScore: total > 0 ? Math.round((completedJobs / total) * 100) : 0,
        rating: data.rating || 0,
        responseTime: '< 1hr',
        level: data.level || 1,
        flags: [],
        xp: data.xp || 0
      });

      setEarnings({
        total: data.totalEarnings || 0,
        monthly: data.monthlyEarnings || 0,
        outstanding: data.outstandingAmount || 0,
        forWithdrawal: data.withdrawableAmount || 0
      });

      setOrders({
        completed: data.completedJobs || 0,
        active: data.activeJobs || 0,
        cancelled: data.cancelledJobs || 0
      });

      if (data.chartData) {
        setEarningsData(data.chartData);
      }
    }
  }, [userData, dashboardData]);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Profile Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="col-span-1 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            {freelancerProfile?.profile_photo ? (
              <Image
                src={freelancerProfile.profile_photo}
                alt="Profile"
                width={100}
                height={100}
                className="rounded-full mb-4 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-purple-600">
                  {freelancerProfile?.full_name?.charAt(0) || user?.name?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <h2 className="text-xl font-bold">{freelancerProfile?.full_name || user?.name}</h2>
            <p className="text-muted-foreground text-sm">{freelancerProfile?.profile_heading || 'Freelancer'}</p>
            <div className="mt-4 space-y-2 w-full text-left">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{freelancerProfile?.email || user?.email}</span>
              </div>
              {freelancerProfile?.mobile_number && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{freelancerProfile.mobile_number}</span>
                </div>
              )}
              {(freelancerProfile?.city || freelancerProfile?.state) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{[freelancerProfile.city, freelancerProfile.state].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {freelancerProfile?.highest_qualification && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{freelancerProfile.highest_qualification}</span>
                </div>
              )}
              {freelancerProfile?.experience != null && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{freelancerProfile.experience} years experience</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <h3 className="text-2xl font-bold">{stats.level}</h3>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">XP: {stats.xp}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <h3 className="text-2xl font-bold">{stats.rating.toFixed(1)} / 5</h3>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Success Score: {stats.successScore}%</p>
            </div>
          </div>

          {/* Skills */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="font-semibold mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {freelancerProfile?.role_designation?.length > 0 ? (
                freelancerProfile.role_designation.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No skills listed yet.</p>
              )}
            </div>
            {freelancerProfile?.certifications?.length > 0 && (
              <>
                <h3 className="font-semibold mt-4 mb-2">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {freelancerProfile.certifications.map((cert, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {cert}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Earnings" value={`₹${earnings.total}`} icon={DollarSign} iconColor="text-green-500" />
        <StatCard label="Monthly Earnings" value={`₹${earnings.monthly}`} icon={DollarSign} iconColor="text-blue-500" />
        <StatCard label="Outstanding" value={`₹${earnings.outstanding}`} icon={DollarSign} iconColor="text-orange-500" />
        <StatCard label="Withdrawable" value={`₹${earnings.forWithdrawal}`} icon={Wallet} iconColor="text-purple-500" />
      </div>

      {/* Orders Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Completed Orders" value={orders.completed} icon={Bird} iconColor="text-green-500" />
        <StatCard label="Active Orders" value={orders.active} icon={Clock} iconColor="text-blue-500" />
        <StatCard label="Cancelled Orders" value={orders.cancelled} icon={XCircle} iconColor="text-red-500" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Earnings Over Time</h2>
          <div className="h-[300px]">
            {earningsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend />
                  <Line type="monotone" dataKey="earnings" stroke="#8884d8" name="Earnings (₹)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No earnings data yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Orders Distribution</h2>
          <div className="h-[300px]">
            {(orders.completed + orders.active + orders.cancelled) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Active', value: orders.active },
                      { name: 'Completed', value: orders.completed },
                      { name: 'Cancelled', value: orders.cancelled }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {[orders.active, orders.completed, orders.cancelled].map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No order data yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientDashboard({ user, role, userData, dashboardData }) {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    cancelledJobs: 0,
    totalSpent: 0,
    monthlySpent: 0,
    level: 1,
    xp: 0,
    rating: 0,
    wallet: 0,
    availableBalance: 0,
    reservedAmount: 0,
  });
  const [jobsData, setJobsData] = useState([]);
  const [clientProfile, setClientProfile] = useState(null);

  useEffect(() => {
    if (userData) {
      setClientProfile(userData);
    }

    if (dashboardData) {
      const data = dashboardData;
      setStats({
        totalJobs: data.postedJobs || 0,
        activeJobs: data.activeJobs || 0,
        completedJobs: data.completedJobs || 0,
        cancelledJobs: data.cancelledJobs || 0,
        totalSpent: data.totalSpent || 0,
        monthlySpent: data.monthlySpent || 0,
        level: data.level || 1,
        xp: data.xp || 0,
        rating: data.rating || 0,
        wallet: data.walletBalance || 0,
        availableBalance: data.availableBalance || 0,
        reservedAmount: data.reservedAmount || 0,
      });

      if (data.chartData) {
        setJobsData(data.chartData);
      }
    }
  }, [userData, dashboardData]);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Profile Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="col-span-1 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            {clientProfile?.profile_photo ? (
              <Image
                src={clientProfile.profile_photo}
                alt="Profile"
                width={100}
                height={100}
                className="rounded-full mb-4 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-purple-600">
                  {clientProfile?.full_name?.charAt(0) || user?.name?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <h2 className="text-xl font-bold">{clientProfile?.full_name || user?.name}</h2>
            <p className="text-muted-foreground text-sm">{clientProfile?.company_name || 'Client'}</p>
            <div className="mt-4 space-y-2 w-full text-left">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{clientProfile?.email || user?.email}</span>
              </div>
              {clientProfile?.mobile_number && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{clientProfile.mobile_number}</span>
                </div>
              )}
              {(clientProfile?.city || clientProfile?.state || clientProfile?.country) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{[clientProfile.city, clientProfile.state, clientProfile.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {clientProfile?.website_link?.length > 0 && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href={clientProfile.website_link[0]} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline truncate">
                    {clientProfile.website_link[0]}
                  </a>
                </div>
              )}
              {clientProfile?.organization_type && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{clientProfile.organization_type}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <h3 className="text-2xl font-bold">{stats.level}</h3>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">XP: {stats.xp}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <h3 className="text-2xl font-bold">{stats.rating.toFixed ? stats.rating.toFixed(1) : stats.rating} / 5</h3>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Success Rate: {stats.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Wallet & Spending */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <h3 className="text-2xl font-bold">₹{stats.wallet}</h3>
                </div>
                <Wallet className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Available: ₹{stats.availableBalance} · Reserved: ₹{stats.reservedAmount}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <h3 className="text-2xl font-bold">₹{stats.totalSpent}</h3>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">This month: ₹{stats.monthlySpent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Posted Jobs" value={stats.totalJobs} icon={Briefcase} iconColor="text-purple-500" />
        <StatCard label="Active Jobs" value={stats.activeJobs} icon={Clock} iconColor="text-blue-500" />
        <StatCard label="Completed" value={stats.completedJobs} icon={Bird} iconColor="text-green-500" />
        <StatCard label="Cancelled" value={stats.cancelledJobs} icon={XCircle} iconColor="text-red-500" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Spending Over Time</h2>
          <div className="h-[300px]">
            {jobsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={jobsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend />
                  <Line type="monotone" dataKey="spent" stroke="#8884d8" name="Spending (₹)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No spending data yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Jobs Distribution</h2>
          <div className="h-[300px]">
            {stats.totalJobs > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Active', value: stats.activeJobs },
                      { name: 'Completed', value: stats.completedJobs },
                      { name: 'Cancelled', value: stats.cancelledJobs },
                    ].filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {[stats.activeJobs, stats.completedJobs, stats.cancelledJobs].map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No job data yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, role, userData, loading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      setStatsLoading(true);
      setStatsError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
          credentials: 'include'
        });
        if (res.ok) {
          const result = await res.json();
          if (result.success) {
            setDashboardData(result.data);
          } else {
            setStatsError(result.message || 'Failed to load stats.');
          }
        } else {
          setStatsError(`Error ${res.status}: Failed to load dashboard stats.`);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setStatsError('Network error. Could not load dashboard stats.');
      } finally {
        setStatsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user, role.active]); // Re-fetch when the active role switches

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Please <a href="/sign-in" className="text-purple-600 underline">sign in</a> to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground capitalize">
          Viewing as: <span className="font-medium text-purple-600">{role.active}</span>
        </p>
      </div>

      {statsError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {statsError}
        </div>
      )}

      {statsLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      ) : role.active === 'freelancer' ? (
        <FreelancerDashboard user={user} role={role} userData={userData} dashboardData={dashboardData} />
      ) : (
        <ClientDashboard user={user} role={role} userData={userData} dashboardData={dashboardData} />
      )}
    </div>
  );
}