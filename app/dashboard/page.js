"use client";
import { useEffect, useState } from "react";
import { Bird, TrendingUp, Users, DollarSign, Clock, Star, Flag, Briefcase, GraduationCap, MapPin, Phone, Mail, Globe, Building2, Wallet } from "lucide-react";
import { databases, appwriteConfig } from "@/hooks/appwrite_config";
import { useAuth } from "@/hooks/AuthContext";
import { Query } from "appwrite";
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

function FreelancerDashboard({ user, role, userData }) {
  const [stats, setStats] = useState({
    successScore: 0,
    rating: 0,
    responseTime: '0hr',
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
    const fetchDashboardData = async () => {
      if (!user?.$id) return;

      try {
        // Use existing freelancer data
        if (role.freelancerData) {
          console.log("Using existing freelancer data:", role.freelancerData);
          const profile = role.freelancerData;
          setFreelancerProfile(profile);

          // Set stats from profile data
          setStats({
            successScore: Math.round((profile.completed_jobs?.length || 0) / ((profile.completed_jobs?.length || 0) + (profile.cancelled_jobs?.length || 0) || 1) * 100),
            rating: profile.rating || 0,
            responseTime: '1hr',
            level: profile.level || 1,
            flags: profile.flags || [],
            xp: profile.xp || 0
          });

          // Set earnings from profile data
          setEarnings({
            total: profile.totalEarnings || 0,
            monthly: profile.monthlyEarnings || 0,
            outstanding: profile.outstandingAmount || 0,
            forWithdrawal: profile.withdrawableAmount || 0
          });

          // Set orders from profile data
          setOrders({
            completed: profile.completed_jobs?.length || 0,
            active: profile.assigned_jobs?.length || 0,
            cancelled: profile.cancelled_jobs?.length || 0
          });
        }

        // Fetch jobs/orders
        console.log("Fetching jobs...");
        const jobsResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.jobCollectionID,
          [Query.equal("assigned_freelancer", user.$id)]
        );
        console.log("Jobs Response:", jobsResponse);

        if (jobsResponse.documents.length > 0) {
          const jobs = jobsResponse.documents;
          
          // Update orders if we have job data
          setOrders(prev => ({
            ...prev,
            active: jobs.filter(job => !job.completed_status && job.assigned_freelancer).length
          }));

          // Update rating if we have rated jobs
          const ratedJobs = jobs.filter(job => job.completed_status && job.rating);
          if (ratedJobs.length > 0) {
            const avgRating = ratedJobs.reduce((acc, job) => acc + job.rating, 0) / ratedJobs.length;
            setStats(prev => ({
              ...prev,
              rating: avgRating.toFixed(1)
            }));
          }

          // Prepare earnings data for chart
          const monthlyData = jobs.reduce((acc, job) => {
            if (job.completed_status) {
              const month = new Date(job.completed_at).toLocaleString('default', { month: 'short' });
              acc[month] = (acc[month] || 0) + (job.budget || 0);
            }
            return acc;
          }, {});

          setEarningsData(Object.entries(monthlyData).map(([month, earnings]) => ({
            name: month,
            earnings
          })));
        }

      } catch (error) {
        console.error('Error fetching freelancer data:', error);
      }
    };

    fetchDashboardData();
  }, [user, role]);

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
                className="rounded-full mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4" />
            )}
            <h2 className="text-xl font-bold">{freelancerProfile?.full_name}</h2>
            <p className="text-muted-foreground">{freelancerProfile?.profile_heading}</p>
            <div className="mt-4 space-y-2 w-full">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{freelancerProfile?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{freelancerProfile?.mobile_number || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{freelancerProfile?.city}, {freelancerProfile?.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="text-sm">{freelancerProfile?.highest_qualification}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">{freelancerProfile?.experience} years experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="col-span-2 space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <h3 className="text-2xl font-bold">{stats.level}</h3>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">XP: {stats.xp}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <h3 className="text-2xl font-bold">{stats.rating} / 5</h3>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">Success Score: {stats.successScore}%</p>
              </div>
            </div>
          </div>

          {/* Skills & Certifications */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="font-semibold mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {freelancerProfile?.role_designation?.map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {skill}
                </span>
              ))}
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
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <h3 className="text-2xl font-bold">₹{earnings.total}</h3>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Earnings</p>
              <h3 className="text-2xl font-bold">₹{earnings.monthly}</h3>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <h3 className="text-2xl font-bold">₹{earnings.outstanding}</h3>
            </div>
            <DollarSign className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Withdrawable</p>
              <h3 className="text-2xl font-bold">₹{earnings.forWithdrawal}</h3>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Orders Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed Orders</p>
              <h3 className="text-2xl font-bold">{orders.completed}</h3>
            </div>
            <Bird className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Orders</p>
              <h3 className="text-2xl font-bold">{orders.active}</h3>
            </div>
            <Bird className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cancelled Orders</p>
              <h3 className="text-2xl font-bold">{orders.cancelled}</h3>
            </div>
            <Bird className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Earnings Chart */}
        <div className="rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Earnings Over Time</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="earnings" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Distribution */}
        <div className="rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Orders Distribution</h2>
          <div className="h-[300px]">
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
                >
                  {[
                    { name: 'Active', value: orders.active },
                    { name: 'Completed', value: orders.completed },
                    { name: 'Cancelled', value: orders.cancelled }
                  ].map((entry, index) => (
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

function ClientDashboard({ user, role, userData }) {
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
    wallet: 0
  });
  const [jobsData, setJobsData] = useState([]);
  const [clientProfile, setClientProfile] = useState(null);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user?.$id) return;

      try {
        // Use existing client data
        if (role.clientData) {
          console.log("Using existing client data:", role.clientData);
          const profile = role.clientData;
          setClientProfile(profile);
          
          // Set basic stats from profile
          setStats(prev => ({
            ...prev,
            level: profile.level || 1,
            xp: profile.xp || 0,
            rating: profile.rating || 0,
            wallet: profile.wallet || 0
          }));
        }

        // Fetch jobs created by client
        console.log("Fetching client jobs...");
        const jobsResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.jobCollectionID,
          [Query.equal("job_created_by", user.$id)]
        );
        console.log("Jobs Response:", jobsResponse);

        const jobs = jobsResponse.documents;
        const activeJobs = jobs.filter(job => !job.completed_status && job.assigned_freelancer).length;
        const completedJobs = jobs.filter(job => job.completed_status).length;
        const cancelledJobs = jobs.filter(job => job.cancelled_status).length;

        // Calculate total and monthly spending
        const totalSpent = jobs.reduce((acc, job) => acc + (job.budget || 0), 0);
        const thisMonth = new Date().getMonth();
        const monthlySpent = jobs
          .filter(job => new Date(job.created_at).getMonth() === thisMonth)
          .reduce((acc, job) => acc + (job.budget || 0), 0);

        setStats(prev => ({
          ...prev,
          totalJobs: jobs.length,
          activeJobs,
          completedJobs,
          cancelledJobs,
          totalSpent,
          monthlySpent
        }));

        // Prepare jobs data for chart
        const monthlyData = jobs.reduce((acc, job) => {
          const month = new Date(job.created_at).toLocaleString('default', { month: 'short' });
          acc[month] = (acc[month] || 0) + (job.budget || 0);
          return acc;
        }, {});

        setJobsData(Object.entries(monthlyData).map(([month, spent]) => ({
          name: month,
          spent
        })));

      } catch (error) {
        console.error('Error fetching client data:', error);
      }
    };

    fetchClientData();
  }, [user, role]);

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
                className="rounded-full mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4" />
            )}
            <h2 className="text-xl font-bold">{clientProfile?.full_name}</h2>
            <p className="text-muted-foreground">{clientProfile?.company_name}</p>
            <div className="mt-4 space-y-2 w-full">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{clientProfile?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{clientProfile?.mobile_number || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{clientProfile?.city}, {clientProfile?.state}, {clientProfile?.country}</span>
              </div>
              {clientProfile?.website_link?.length > 0 && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <a href={clientProfile.website_link[0]} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                    Website
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="text-sm">{clientProfile?.organization_type}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="col-span-2 space-y-6">
          {/* Client Level & Rating */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <h3 className="text-2xl font-bold">{stats.level}</h3>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">XP: {stats.xp}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <h3 className="text-2xl font-bold">{stats.rating} / 5</h3>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">Success Rate: {Math.round((stats.completedJobs / (stats.totalJobs || 1)) * 100)}%</p>
              </div>
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
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <h3 className="text-2xl font-bold">₹{stats.totalSpent}</h3>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">Monthly: ₹{stats.monthlySpent}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Posted Jobs</p>
              <h3 className="text-2xl font-bold">{stats.totalJobs}</h3>
            </div>
            <Briefcase className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
              <h3 className="text-2xl font-bold">{stats.activeJobs}</h3>
            </div>
            <Briefcase className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <h3 className="text-2xl font-bold">{stats.completedJobs}</h3>
            </div>
            <Briefcase className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cancelled</p>
              <h3 className="text-2xl font-bold">{stats.cancelledJobs}</h3>
            </div>
            <Briefcase className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Spending Chart */}
        <div className="rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Spending</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={jobsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="spent" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jobs Distribution */}
        <div className="rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Jobs Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: stats.activeJobs },
                    { name: 'Completed', value: stats.completedJobs },
                    { name: 'Cancelled', value: stats.cancelledJobs }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Active', value: stats.activeJobs },
                    { name: 'Completed', value: stats.completedJobs },
                    { name: 'Cancelled', value: stats.cancelledJobs }
                  ].map((entry, index) => (
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

export default function DashboardPage() {
  const { user, role, userData } = useAuth();

  if (!user) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Please Login</h1>
          <p className="text-muted-foreground">
            You need to be logged in to view the dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Render based on role
  if (role.active === 'client') {
    return <ClientDashboard user={user} role={role} userData={userData} />;
  }

  return <FreelancerDashboard user={user} role={role} userData={userData} />;
}