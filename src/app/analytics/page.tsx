"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Eye, Package, Activity, Sparkles, Lock, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AnalyticsStats } from "@/types/analytics";
import { toast } from "sonner";
import { LiveActivityTicker } from "@/components/organisms/live-activity-ticker";
import { LiveStatsPanel } from "@/components/organisms/live-stats-panel";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";

const KIND_COLORS = {
  agent: '#84cc16',
  skill: '#10b981',
  command: '#06b6d4',
  mcp: '#8b5cf6'
};

export default function AnalyticsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  // Check authentication on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/analytics/auth");
        const data = await res.json();
        setAuthenticated(data.authenticated);
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch analytics data when authenticated
  useEffect(() => {
    if (!authenticated) return;

    async function fetchStats() {
      setLoading(true);
      try {
        const [statsRes, waitlistRes] = await Promise.all([
          fetch(`/api/analytics/stats?days=${days}`),
          fetch("/api/waitlist")
        ]);

        const statsData = await statsRes.json();
        const waitlistData = await waitlistRes.json();

        setStats(statsData);
        setWaitlistCount(waitlistData.total || 0);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [days, authenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);

    try {
      const res = await fetch("/api/analytics/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        toast.error("Invalid password");
        return;
      }

      toast.success("Access granted");
      setAuthenticated(true);
    } catch (error) {
      toast.error("Authentication failed");
    } finally {
      setLoggingIn(false);
    }
  };

  // Login screen
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-300 via-emerald-300 to-teal-300 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-300 via-emerald-300 to-teal-300 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="rounded-xl border border-black/20 bg-white/90 backdrop-blur p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-lime-500/20 flex items-center justify-center">
                <Lock className="w-8 h-8 text-lime-600" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-black text-center mb-2">
              Analytics Dashboard
            </h2>
            <p className="text-black/60 text-center mb-6 text-sm">
              This page is restricted. Enter password to access.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter analytics password"
                  required
                  autoFocus
                  disabled={loggingIn}
                />
              </div>

              <Button
                type="submit"
                disabled={loggingIn}
                className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold"
              >
                {loggingIn ? "Authenticating..." : "Access Dashboard"}
              </Button>

              <div className="pt-4 border-t border-black/10">
                <Link href="/">
                  <Button variant="ghost" className="w-full text-black/60">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main analytics dashboard
  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-300 via-emerald-300 to-teal-300">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
            <p className="text-black/60">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const topItems = (stats.topItems || []).slice(0, 10);
  const kindDistribution = Object.entries(stats.byKind || {}).map(([name, value]) => ({
    name,
    value,
    color: KIND_COLORS[name as keyof typeof KIND_COLORS] || '#94a3b8'
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-300 via-emerald-300 to-teal-300">
      {/* Header */}
      <div className="border-b border-black/20 bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-4 py-2 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-black/80 hover:text-black transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="flex items-center gap-2">
            <Lock size={14} className="text-lime-600" />
            <span className="text-xs font-semibold text-black/60">Authenticated</span>
          </div>
        </div>
      </div>

      {/* Main Content - Optimized Single Page Layout */}
      <div className="max-w-[1800px] mx-auto px-4 py-2">
        {/* Header - Compact */}
        <div className="rounded-lg border border-black/20 bg-white/90 backdrop-blur p-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-black">Analytics + Live Feed</h1>
              <p className="text-xs text-black/60">Last {days} days • Updates every 5s</p>
            </div>
            <div className="flex items-center gap-2">
              {[7, 30, 90].map(d => (
                <Button
                  key={d}
                  onClick={() => setDays(d)}
                  variant={days === d ? "default" : "outline"}
                  size="sm"
                  className={days === d ? "bg-lime-500 text-black hover:bg-lime-600 text-xs px-2 py-1 h-7" : "text-xs px-2 py-1 h-7"}
                >
                  {d}d
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {/* Total Events */}
          <div className="rounded-lg border border-black/20 bg-white/90 backdrop-blur p-3">
            <div className="flex items-center justify-between mb-1">
              <Activity size={16} className="text-lime-600" />
              <TrendingUp size={14} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-black mb-0.5">
              {stats.totalEvents?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-black/60">Total Events</div>
          </div>

          {/* Unique Visitors */}
          <div className="rounded-lg border border-black/20 bg-white/90 backdrop-blur p-3">
            <div className="flex items-center justify-between mb-1">
              <Eye size={16} className="text-blue-600" />
              <TrendingUp size={14} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-black mb-0.5">
              {stats.uniqueVisitors?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-black/60">Unique Visitors</div>
          </div>

          {/* Items Viewed */}
          <div className="rounded-lg border border-black/20 bg-white/90 backdrop-blur p-3">
            <div className="flex items-center justify-between mb-1">
              <Package size={16} className="text-purple-600" />
              <TrendingUp size={14} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-black mb-0.5">
              {stats.itemsViewed?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-black/60">Items Viewed</div>
          </div>

          {/* Waitlist */}
          <div className="rounded-lg border border-black/20 bg-white/90 backdrop-blur p-3">
            <div className="flex items-center justify-between mb-1">
              <Users size={16} className="text-orange-600" />
              <Sparkles size={14} className="text-lime-600" />
            </div>
            <div className="text-2xl font-black text-black mb-0.5">
              {waitlistCount.toLocaleString()}
            </div>
            <div className="text-xs text-black/60">Waitlist Signups</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          {/* Top Items */}
          <div className="rounded-lg border border-black/20 bg-white/90 backdrop-blur p-3">
            <h3 className="text-sm font-black text-black mb-2">Top Viewed Items</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topItems}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0000001a" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 10, fill: '#000000aa' }}
                />
                <YAxis tick={{ fontSize: 10, fill: '#000000aa' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#84cc16" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Kind Distribution */}
          <div className="rounded-lg border border-black/20 bg-white/90 backdrop-blur p-3">
            <h3 className="text-sm font-black text-black mb-2">Views by Type</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={kindDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {kindDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Timeline */}
        {stats.dailyEvents && stats.dailyEvents.length > 0 && (
          <div className="rounded-lg border border-black/20 bg-white/90 backdrop-blur p-3 mb-3">
            <h3 className="text-sm font-black text-black mb-2">Activity Timeline</h3>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={stats.dailyEvents}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0000001a" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#000000aa' }}
                />
                <YAxis tick={{ fontSize: 10, fill: '#000000aa' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#84cc16"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEvents)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Raw Stats */}
        <div className="rounded-lg border border-black/20 bg-white/90 backdrop-blur p-3 mb-3">
          <h3 className="text-sm font-black text-black mb-2">Additional Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-black/60 mb-0.5">Avg. Views/Day</div>
              <div className="text-base font-bold text-black">
                {Math.round((stats.totalEvents || 0) / days)}
              </div>
            </div>
            <div>
              <div className="text-black/60 mb-0.5">Most Popular Type</div>
              <div className="text-base font-bold text-black capitalize">
                {Object.entries(stats.byKind || {}).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-black/60 mb-0.5">Search Events</div>
              <div className="text-base font-bold text-black">
                {stats.searchCount || 0}
              </div>
            </div>
            <div>
              <div className="text-black/60 mb-0.5">Bundle Downloads</div>
              <div className="text-base font-bold text-black">
                {stats.bundleDownloads || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Live Activity Feed Section */}
        <div className="rounded-lg border border-black/20 bg-white/90 backdrop-blur p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black text-black">🔴 Live Activity Stream</h3>
            <p className="text-xs text-black/60">
              Real-time platform activity
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Live Stats */}
            <div className="lg:col-span-4 h-[300px]">
              <LiveStatsPanel />
            </div>

            {/* Live Activity Feed */}
            <div className="lg:col-span-8 h-[300px]">
              <div className="h-full rounded-lg border border-black/20 bg-white/90 backdrop-blur overflow-hidden">
                <LiveActivityTicker />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-black/50 py-2">
          <p>Auto-refresh • {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
