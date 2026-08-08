'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFarmSeaStore } from '@/store/useFarmSeaStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Truck, Package, Clock, CheckCircle, MapPin, Star,
  BarChart3, DollarSign, Route, Zap, Timer, TrendingUp,
} from 'lucide-react';

const deliveryStatusColor = (s: string) => {
  switch (s) {
    case 'DELIVERED': return 'bg-green-100 text-green-800';
    case 'ASSIGNED': return 'bg-yellow-100 text-yellow-800';
    case 'PICKED_UP': return 'bg-blue-100 text-blue-800';
    case 'IN_TRANSIT': return 'bg-blue-100 text-blue-800';
    case 'FAILED': case 'CANCELLED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function DeliveryDashboard() {
  const { user, currentView } = useFarmSeaStore();
  const { toast } = useToast();

  const deliveryProfile = user?.profile as Record<string, unknown> | null;
  const profileId = deliveryProfile?.id as string;

  const [assignments, setAssignments] = useState<Record<string, unknown>[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState<Record<string, unknown> | null>(null);
  const [salary, setSalary] = useState<Record<string, unknown> | null>(null);

  const fetchAssignments = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/delivery?deliveryPersonId=${profileId}`);
      const data = await res.json();
      if (data.success) { setAssignments(data.assignments); setStats(data.stats); }
    } catch { /* empty */ } finally { setLoading(false); }
  }, [profileId]);

  const fetchPerformance = useCallback(async () => {
    if (!profileId) return;
    try {
      const res = await fetch(`/api/delivery/performance?id=${profileId}`);
      const data = await res.json();
      if (data.success) setPerformance(data);
    } catch { /* empty */ }
  }, [profileId]);

  const fetchSalary = useCallback(async () => {
    if (!profileId) return;
    try {
      const res = await fetch(`/api/delivery/salary?id=${profileId}`);
      const data = await res.json();
      if (data.success) setSalary(data);
    } catch { /* empty */ }
  }, [profileId]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);
  useEffect(() => { fetchPerformance(); fetchSalary(); }, [fetchPerformance, fetchSalary]);

  const handleStatusUpdate = async (assignmentId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/delivery', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) { toast({ title: 'Status updated', description: newStatus }); fetchAssignments(); }
      else { toast({ title: 'Error', description: data.error, variant: 'destructive' }); }
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  // Assignments View
  if (currentView === 'delivery-assignments') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Assigned Orders</h2>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Assigned', value: stats.assigned || 0, color: 'bg-yellow-50 border-yellow-200', icon: Package },
            { label: 'In Transit', value: stats.inTransit || 0, color: 'bg-blue-50 border-blue-200', icon: Truck },
            { label: 'Delivered', value: stats.delivered || 0, color: 'bg-green-50 border-green-200', icon: CheckCircle },
            { label: 'Failed', value: stats.failed || 0, color: 'bg-red-50 border-red-200', icon: Zap },
          ].map((s, i) => (
            <Card key={i} className={`border ${s.color}`}>
              <CardContent className="p-3 flex items-center gap-3">
                <s.icon className="w-6 h-6 text-muted-foreground" />
                <div><div className="text-2xl font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />) :
        assignments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><Truck className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No assigned orders</p></div>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-340px)] overflow-y-auto custom-scrollbar">
            {assignments.map((a: Record<string, unknown>) => {
              const order = a.order as Record<string, unknown>;
              const customer = order?.customer as Record<string, unknown>;
              return (
                <Card key={a.id as string}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <div className="font-bold">{order?.orderNumber as string}</div>
                        <div className="text-xs text-muted-foreground">{customer?.name as string} · {customer?.phone as string}</div>
                      </div>
                      <Badge className={deliveryStatusColor(a.status as string)}>{(a.status as string).replace(/_/g, ' ')}</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                      <div className="flex items-start gap-2 text-muted-foreground"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>Pickup: {a.pickupAddress as string}</span></div>
                      <div className="flex items-start gap-2 text-muted-foreground"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>Drop: {a.dropAddress as string}</span></div>
                    </div>
                    {a.routeDistanceKm && <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1"><Route className="w-3 h-3" /> {a.routeDistanceKm as number} km · Est. {a.estimatedTimeMin as number} min</div>}
                    <div className="flex flex-wrap gap-2">
                      {(a.status as string) === 'ASSIGNED' && <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleStatusUpdate(a.id as string, 'PICKED_UP')}><Package className="w-3 h-3 mr-1" /> Picked Up</Button>}
                      {(a.status as string) === 'PICKED_UP' && <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleStatusUpdate(a.id as string, 'IN_TRANSIT')}><Truck className="w-3 h-3 mr-1" /> In Transit</Button>}
                      {(a.status as string) === 'IN_TRANSIT' && <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusUpdate(a.id as string, 'DELIVERED')}><CheckCircle className="w-3 h-3 mr-1" /> Delivered</Button>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Performance View
  if (currentView === 'delivery-performance') {
    const avg = performance?.avgMetrics as Record<string, number> | null;
    const latest = performance?.latestRecord as Record<string, unknown> | null;
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Performance Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Orders Completed', value: avg?.avgOrdersCompleted || 0, icon: Package, color: 'text-green-600' },
            { label: 'Avg Delivery Time', value: `${avg?.avgDeliveryTime || 0} min`, icon: Timer, color: 'text-blue-600' },
            { label: 'Avg Rating', value: `${avg?.avgRating || 0}/5`, icon: Star, color: 'text-amber-500' },
            { label: 'Punctuality', value: `${avg?.avgPunctuality || 0}%`, icon: TrendingUp, color: 'text-green-600' },
          ].map((m, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <m.icon className={`w-8 h-8 mx-auto mb-2 ${m.color}`} />
                <div className="text-2xl font-bold">{m.value}</div>
                <div className="text-xs text-muted-foreground">{m.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Simple bar chart for performance history */}
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Performance</CardTitle></CardHeader>
          <CardContent>
            {(performance?.performanceRecords as Record<string, unknown>[])?.length ? (
              <div className="space-y-2">
                {(performance.performanceRecords as Record<string, unknown>[]).map((r: Record<string, unknown>, i: number) => {
                  const maxOrders = Math.max(...(performance?.performanceRecords as Record<string, unknown>[]).map((x) => x.ordersCompleted as number), 1);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm w-16 text-muted-foreground">{r.month as string}</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${((r.ordersCompleted as number) / maxOrders) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{r.ordersCompleted as number}</span>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-4">No performance data yet</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Salary View
  if (currentView === 'delivery-salary') {
    const summary = salary?.summary as Record<string, number> | null;
    const latestRecord = salary?.latestRecord as Record<string, unknown> | null;
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Salary Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Earnings', value: `₹${summary?.totalEarnings || 0}`, icon: DollarSign, color: 'text-green-600' },
            { label: 'Base Salary', value: `₹${summary?.totalBaseSalary || 0}`, icon: DollarSign, color: 'text-gray-600' },
            { label: 'Bonus & Incentives', value: `₹${summary?.totalBonus || 0}`, icon: Zap, color: 'text-orange-500' },
            { label: 'Monthly Average', value: `₹${summary?.averageMonthlySalary || 0}`, icon: BarChart3, color: 'text-blue-600' },
          ].map((m, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <m.icon className={`w-8 h-8 mx-auto mb-2 ${m.color}`} />
                <div className="text-2xl font-bold">{m.value}</div>
                <div className="text-xs text-muted-foreground">{m.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Monthly earnings chart */}
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Earnings</CardTitle></CardHeader>
          <CardContent>
            {(salary?.salaryRecords as Record<string, unknown>[])?.length ? (
              <div className="space-y-2">
                {(salary.salaryRecords as Record<string, unknown>[]).map((r: Record<string, unknown>, i: number) => {
                  const maxSalary = Math.max(...(salary?.salaryRecords as Record<string, unknown>[]).map((x) => x.totalSalary as number), 1);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm w-16 text-muted-foreground">{r.month as string}</span>
                      <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                        <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-lg transition-all" style={{ width: `${((r.totalSalary as number) / maxSalary) * 100}%` }} />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold">₹{r.totalSalary as number}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-4">No salary data yet</p>}
          </CardContent>
        </Card>
        {latestRecord && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader><CardTitle className="text-base">Latest Salary Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Base Salary</span><span className="font-medium">₹{latestRecord.baseSalary}</span></div>
              <div className="flex justify-between"><span>Performance Bonus</span><span className="font-medium text-green-600">+₹{latestRecord.performanceBonus}</span></div>
              <div className="flex justify-between"><span>Incentives</span><span className="font-medium text-orange-600">+₹{latestRecord.incentives}</span></div>
              <div className="flex justify-between"><span>Deductions</span><span className="font-medium text-red-600">-₹{latestRecord.deductions}</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span className="text-green-700">₹{latestRecord.totalSalary}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Status</span><Badge className={latestRecord.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{latestRecord.status as string}</Badge></div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return null;
}
