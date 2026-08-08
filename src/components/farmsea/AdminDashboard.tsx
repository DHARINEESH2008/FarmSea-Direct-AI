'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFarmSeaStore } from '@/store/useFarmSeaStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Users, Package, DollarSign, BarChart3, Shield, AlertTriangle,
  CheckCircle, XCircle, Ban, Search, TrendingUp,
} from 'lucide-react';

export default function AdminDashboard() {
  const { currentView } = useFarmSeaStore();
  const { toast } = useToast();

  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [warnings, setWarnings] = useState<Record<string, unknown>[]>([]);
  const [suspensions, setSuspensions] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin?type=analytics');
      const data = await res.json();
      if (data.success) setAnalytics(data.analytics);
    } catch { /* empty */ }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      if (search) params.set('status', search);
      const res = await fetch(`/api/admin?type=users&${params}`);
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch { /* empty */ } finally { setLoading(false); }
  }, [roleFilter, search]);

  const fetchWarnings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin?type=warnings');
      const data = await res.json();
      if (data.success) { setWarnings(data.warnings || []); setSuspensions(data.activeSuspensions || []); }
    } catch { /* empty */ }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchWarnings(); }, [fetchWarnings]);

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (data.success) { toast({ title: 'Success', description: data.message }); fetchUsers(); fetchAnalytics(); }
      else { toast({ title: 'Error', description: data.error, variant: 'destructive' }); }
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const getVerificationStatus = (u: Record<string, unknown>) => {
    const profile = u.profile as Record<string, unknown> | null;
    return profile?.verificationStatus as string || 'N/A';
  };

  // Analytics View
  if (currentView === 'admin-analytics') {
    const a = analytics;
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Analytics Dashboard</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: a?.totalUsers || 0, icon: Users, color: 'bg-green-50 border-green-200' },
            { label: 'Total Orders', value: a?.totalOrders || 0, icon: Package, color: 'bg-orange-50 border-orange-200' },
            { label: 'Revenue', value: `₹${a?.totalRevenue || 0}`, icon: DollarSign, color: 'bg-emerald-50 border-emerald-200' },
            { label: 'Products', value: a?.totalProducts || 0, icon: BarChart3, color: 'bg-lime-50 border-lime-200' },
          ].map((k, i) => (
            <Card key={i} className={`border ${k.color}`}>
              <CardContent className="p-4">
                <k.icon className="w-6 h-6 text-muted-foreground mb-2" />
                <div className="text-2xl font-bold">{k.value}</div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Users by Role</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(a?.usersByRole as Record<string, unknown>[])?.map((r: Record<string, unknown>, i: number) => {
                  const max = Math.max(...(a?.usersByRole as Record<string, unknown>[]).map((x) => x.count as number), 1);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm w-20 text-muted-foreground">{(r.role as string).replace(/_/g, ' ')}</span>
                      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${((r.count as number) / max) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium">{r.count as number}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Orders by Status</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(a?.ordersByStatus as Record<string, unknown>[])?.map((r: Record<string, unknown>, i: number) => {
                  const colors: Record<string, string> = { DELIVERED: 'bg-green-500', PENDING: 'bg-yellow-500', IN_TRANSIT: 'bg-blue-500', CANCELLED: 'bg-red-500' };
                  const max = Math.max(...(a?.ordersByStatus as Record<string, unknown>[]).map((x) => x.count as number), 1);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm w-28 text-muted-foreground">{(r.status as string).replace(/_/g, ' ')}</span>
                      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors[r.status as string] || 'bg-gray-500'}`} style={{ width: `${((r.count as number) / max) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium">{r.count as number}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-base">Top Product Categories</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(a?.productsByCategory as Record<string, unknown>[])?.slice(0, 10).map((r: Record<string, unknown>, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-green-50 text-sm">
                    <span>{(r.category as string).replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground">{r.count as number} products · {r.totalSold as number} sold</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Users View
  if (currentView === 'admin-users') {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-xl font-bold">User Management</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 pl-9 w-full sm:w-48" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Roles</option>
              <option value="FARMER">Farmer</option>
              <option value="FISHER">Fisher</option>
              <option value="DELIVERY">Delivery</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>
        </div>
        <div className="max-h-[calc(100vh-240px)] overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />) :
            users.map((u: Record<string, unknown>) => (
              <Card key={u.id as string}>
                <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-green-700">{(u.name as string)?.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{u.name as string}</div>
                      <div className="text-xs text-muted-foreground truncate">{u.email as string} · {(u.role as string)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={getVerificationStatus(u) === 'VERIFIED' ? 'bg-green-100 text-green-800' : getVerificationStatus(u) === 'SUSPENDED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                      {getVerificationStatus(u)}
                    </Badge>
                    {getVerificationStatus(u) === 'PENDING' && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8" onClick={() => handleUserAction(u.id as string, 'verify')}><CheckCircle className="w-3 h-3 mr-1" /> Verify</Button>
                        <Button size="sm" variant="destructive" className="h-8" onClick={() => handleUserAction(u.id as string, 'reject')}><XCircle className="w-3 h-3 mr-1" /> Reject</Button>
                      </>
                    )}
                    {getVerificationStatus(u) === 'VERIFIED' && (
                      <Button size="sm" variant="outline" className="h-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleUserAction(u.id as string, 'suspend')}><Ban className="w-3 h-3 mr-1" /> Suspend</Button>
                    )}
                    {getVerificationStatus(u) === 'SUSPENDED' && (
                      <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUserAction(u.id as string, 'activate')}><CheckCircle className="w-3 h-3 mr-1" /> Activate</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Warnings View
  if (currentView === 'admin-warnings') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Fisher Warnings &amp; Suspensions</h2>
        {/* Warning stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Warnings', value: warnings.length, color: 'bg-orange-50 border-orange-200' },
            { label: 'Active Suspensions', value: suspensions.length, color: 'bg-red-50 border-red-200' },
            { label: 'Unacknowledged', value: warnings.filter((w) => !(w.acknowledgedAt as boolean)).length, color: 'bg-yellow-50 border-yellow-200' },
            { label: 'Acknowledged', value: warnings.filter((w) => w.acknowledgedAt as boolean).length, color: 'bg-green-50 border-green-200' },
          ].map((s, i) => (
            <Card key={i} className={`border ${s.color}`}><CardContent className="p-3 text-center"><div className="text-2xl font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></CardContent></Card>
          ))}
        </div>
        {/* Active Suspensions */}
        {suspensions.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader><CardTitle className="text-base text-red-800">Active Suspensions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {suspensions.map((s: Record<string, unknown>, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-white border border-red-200">
                  <div className="font-medium">{(s.fisher as Record<string, unknown>)?.user?.name as string}</div>
                  <div className="text-sm text-muted-foreground">{s.reason as string} · Ends: {new Date(s.suspensionEnd as string).toLocaleDateString('en-IN')}</div>
                  <div className="text-xs mt-1">Duration: {s.durationDays as number} days · Warnings: {s.warningCount as number}/3</div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {/* Warning list */}
        <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto custom-scrollbar">
          {warnings.map((w: Record<string, unknown>, i: number) => (
            <Card key={i}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{(w.fisher as Record<string, unknown>)?.user?.name as string}</div>
                  <div className="text-sm text-muted-foreground">Warning #{w.warningNumber as number} · {w.ignoredOrders as number} ignored orders</div>
                  <div className="text-xs text-muted-foreground">{w.reason as string}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={w.severity === 'HIGH' || w.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : w.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}>{w.severity as string}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {warnings.length === 0 && <div className="text-center py-8 text-muted-foreground"><Shield className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No warnings issued</p></div>}
        </div>
      </div>
    );
  }

  // Moderation View
  if (currentView === 'admin-moderation') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Moderation Log</h2>
        <div className="text-center py-12 text-muted-foreground">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">Moderation Actions</p>
          <p className="text-sm">All admin moderation actions are logged here for transparency</p>
        </div>
      </div>
    );
  }

  return null;
}
