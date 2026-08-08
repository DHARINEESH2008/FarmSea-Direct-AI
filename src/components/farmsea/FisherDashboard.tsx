'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFarmSeaStore } from '@/store/useFarmSeaStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Fish, Plus, CheckCircle, Clock, Truck, AlertTriangle, Shield, ShieldOff,
  Sparkles, TrendingUp, BarChart3, Cloud, Clock as ClockIcon, Anchor, XCircle,
} from 'lucide-react';

const CATEGORIES = ['LIVE_FISH', 'FRESH_FISH', 'FISH_TYPES', 'FISH_PICKLES', 'DRY_FISH', 'FISH_MASALAS', 'FISH_WASTE', 'FISH_BONE_POWDER', 'FISH_MANURE', 'FISH_COMPOST', 'FISH_FEED', 'NETS', 'BOATS', 'ICE_BOXES'];

const statusColor = (s: string) => {
  switch (s) {
    case 'DELIVERED': return 'bg-green-100 text-green-800';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'ACCEPTED': case 'PREPARING': case 'READY_FOR_PICKUP': return 'bg-amber-100 text-amber-800';
    case 'PICKED_UP': case 'IN_TRANSIT': return 'bg-blue-100 text-blue-800';
    case 'CANCELLED': case 'REFUNDED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

function TrustGauge({ score }: { score: number }) {
  const r = 60;
  const circ = Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#65a30d' : score >= 40 ? '#ca8a04' : '#dc2626';
  return (
    <div className="flex flex-col items-center">
      <svg width={160} height={100} className="overflow-visible">
        <path d={`M ${80 - r} 80 A ${r} ${r} 0 0 1 ${80 + r} 80`} fill="none" stroke="#e5e7eb" strokeWidth={10} strokeLinecap="round" />
        <path d={`M ${80 - r} 80 A ${r} ${r} 0 0 1 ${80 + r} 80`} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} />
        <text x={80} y={75} textAnchor="middle" className="fill-foreground text-2xl font-bold" fontSize={28}>{score}</text>
        <text x={80} y={95} textAnchor="middle" className="fill-muted-foreground" fontSize={12}>Trust Score</text>
      </svg>
    </div>
  );
}

export default function FisherDashboard() {
  const { user, currentView } = useFarmSeaStore();
  const { toast } = useToast();

  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'FRESH_FISH', price: '', unit: 'kg', quantity: '', description: '' });
  const [warnings, setWarnings] = useState<Record<string, unknown>[]>([]);
  const [suspensions, setSuspensions] = useState<Record<string, unknown>[]>([]);

  const fisherProfile = user?.profile as Record<string, unknown> | null;
  const trustScore = fisherProfile ? 68 : 50;

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [prodRes, ordRes, warnRes] = await Promise.all([
        fetch(`/api/products?sellerType=FISHER`),
        fetch(`/api/orders?sellerId=${user.id}`),
        fetch(`/api/admin?type=warnings${fisherProfile ? `&fisherId=${fisherProfile.id}` : ''}`),
      ]);
      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      const warnData = await warnRes.json();
      if (prodData.success) setProducts(prodData.products);
      if (ordData.success) setOrders(ordData.orders);
      if (warnData.success) { setWarnings(warnData.warnings || []); setSuspensions(warnData.activeSuspensions || []); }
    } catch { /* empty */ } finally { setLoading(false); }
  }, [user, fisherProfile]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddProduct = async () => {
    if (!user || !newProduct.name || !newProduct.price) {
      toast({ title: 'Error', description: 'Name and price are required', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: user.id, sellerType: 'FISHER', name: newProduct.name,
          category: newProduct.category, price: parseFloat(newProduct.price),
          unit: newProduct.unit, quantityAvailable: parseFloat(newProduct.quantity) || 50,
          description: newProduct.description, freshnessScore: 85 + Math.random() * 15,
          catchDate: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (res.ok) { toast({ title: 'Product added!' }); setAddDialogOpen(false); setNewProduct({ name: '', category: 'FRESH_FISH', price: '', unit: 'kg', quantity: '', description: '' }); fetchData(); }
      else { toast({ title: 'Failed', description: data.error, variant: 'destructive' }); }
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const handleRejectOrder = (orderId: string) => {
    toast({ title: 'Order rejected', description: 'This may count towards your warning system.' });
  };

  // Warning/Suspension Banner
  const activeSuspension = suspensions.length > 0 ? suspensions[0] as Record<string, unknown> : null;
  const warningCount = warnings.length;
  const isSuspended = activeSuspension !== null;

  // Products View
  if (currentView === 'fisher-products') {
    return (
      <div className="space-y-4">
        {isSuspended && (
          <Alert className="border-red-300 bg-red-50">
            <ShieldOff className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Account Suspended</strong> — You have {warningCount}/3 warnings. Suspension ends: {new Date(activeSuspension.suspensionEnd as string).toLocaleDateString('en-IN')}
            </AlertDescription>
          </Alert>
        )}
        {!isSuspended && warningCount > 0 && (
          <Alert className="border-orange-300 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Warning: {warningCount}/3</strong> — {3 - warningCount} more warning(s) will result in a 2-day suspension. Ignored orders contribute to warnings.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">My Products</h2>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white h-11 gap-2" disabled={isSuspended}><Plus className="w-4 h-4" /> Add Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2"><Label>Product Name</Label><Input placeholder="e.g. Fresh Pomfret" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="h-11" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Category</Label><select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">{CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}</select></div>
                  <div className="space-y-2"><Label>Unit</Label><select value={newProduct.unit} onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option>kg</option><option>piece</option><option>dozen</option><option>box</option></select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" placeholder="200" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="h-11" /></div>
                  <div className="space-y-2"><Label>Quantity (kg/pieces)</Label><Input type="number" placeholder="50" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })} className="h-11" /></div>
                </div>
                <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Describe your catch..." value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} rows={3} /></div>
              </div>
              <DialogFooter><Button onClick={handleAddProduct} className="bg-green-600 hover:bg-green-700 text-white">Add Product</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />) :
          products.filter((p) => p.sellerId === user?.id).map((p) => (
            <Card key={p.id as string} className="overflow-hidden">
              <div className="h-28 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center"><Fish className="w-12 h-12 text-blue-200" /></div>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div><h3 className="font-semibold">{p.name as string}</h3><p className="text-xs text-muted-foreground">{(p.category as string).replace(/_/g, ' ')}</p></div>
                  <span className="text-lg font-bold text-green-700">₹{p.price as number}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Stock: {p.quantityAvailable as number}</span>
                  <span className="text-muted-foreground">Sold: {p.soldCount as number}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {!loading && products.filter((p) => p.sellerId === user?.id).length === 0 && (
          <div className="text-center py-12 text-muted-foreground"><Fish className="w-12 h-12 mx-auto mb-3 opacity-50" /><p className="text-lg font-medium">No products yet</p></div>
        )}
      </div>
    );
  }

  // Orders View
  if (currentView === 'fisher-orders') {
    return (
      <div className="space-y-4">
        {isSuspended && (
          <Alert className="border-red-300 bg-red-50"><ShieldOff className="h-4 w-4 text-red-600" /><AlertDescription className="text-red-800"><strong>Suspended</strong> — Cannot accept orders</AlertDescription></Alert>
        )}
        <h2 className="text-xl font-bold">Orders Received</h2>
        {orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><Fish className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No orders received yet</p></div>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
            {orders.map((o: Record<string, unknown>) => (
              <Card key={o.id as string}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div><div className="font-bold">{o.orderNumber as string}</div><div className="text-xs text-muted-foreground">{new Date(o.createdAt as string).toLocaleDateString('en-IN')}</div></div>
                    <Badge className={statusColor(o.status as string)}>{(o.status as string).replace(/_/g, ' ')}</Badge>
                  </div>
                  <div className="space-y-1 mb-3">{(o.items as Record<string, unknown>[])?.map((item: Record<string, unknown>) => (
                    <div key={item.id as string} className="flex justify-between text-sm"><span>{item.productName as string} × {item.quantity as number}</span><span>₹{item.subtotal as number}</span></div>
                  ))}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-700">₹{o.totalAmount as number}</span>
                    <div className="flex gap-2">
                      {(o.status as string) === 'PENDING' && !isSuspended && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => toast({ title: 'Order accepted' })}><CheckCircle className="w-3 h-3 mr-1" /> Accept</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRejectOrder(o.id as string)}><XCircle className="w-3 h-3 mr-1" /> Reject</Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // AI Copilot
  if (currentView === 'fisher-ai') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">AI Copilot</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-5 h-5 text-orange-500" /> Demand Forecast</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {['Pomfret: High demand, price trending up +18%', 'Prawns: Seasonal peak, sell within 24hrs', 'Sardines: Stable demand, good volume', 'Crab: Premium market, limited supply'].map((item, i) => (
                <div key={i} className="text-sm p-2 rounded-lg bg-white border">{item}</div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><ClockIcon className="w-5 h-5 text-green-600" /> Optimal Selling Time</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="p-3 rounded-lg bg-white border"><strong>Best Time Today:</strong> 6:00 AM - 8:00 AM (morning market rush)</div>
              <div className="p-3 rounded-lg bg-white border"><strong>Weekend Premium:</strong> Saturday/Sunday prices are 10-15% higher</div>
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-100"><strong>Warning:</strong> Freshness drops rapidly. Sell within 12hrs of catch for best price.</div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Cloud className="w-5 h-5 text-blue-500" /> Weather &amp; Sea Alerts</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { text: 'Moderate waves expected — small boats advised caution', level: 'warning' },
                { text: 'Good fishing conditions tomorrow morning', level: 'good' },
                { text: 'Low tide at 3:00 PM — plan accordingly', level: 'info' },
              ].map((a, i) => (
                <div key={i} className={`text-sm p-2 rounded-lg border ${a.level === 'warning' ? 'bg-yellow-50 border-yellow-200' : a.level === 'good' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                  {a.text}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Sea Passport
  if (currentView === 'fisher-passport') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Digital Sea Passport</h2>
        <Card className="border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center"><Anchor className="w-8 h-8 text-blue-600" /></div>
                <div>
                  <h3 className="text-lg font-bold">{fisherProfile?.boatName as string || user?.name || 'My Boat'}</h3>
                  <p className="text-sm text-muted-foreground">{fisherProfile?.harborCity as string}, {fisherProfile?.harborState as string}</p>
                  {fisherProfile?.boatType && <p className="text-xs text-muted-foreground">{fisherProfile.boatType as string} · {fisherProfile.fishingArea as string}</p>}
                </div>
              </div>
              <Badge className={fisherProfile?.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                <Shield className="w-3 h-3 mr-1" /> {fisherProfile?.verificationStatus as string || 'PENDING'}
              </Badge>
            </div>
            <TrustGauge score={trustScore} />
            {/* Warning indicator */}
            <div className="flex items-center justify-center gap-1 mt-4">
              {[1, 2, 3].map((w) => (
                <div key={w} className={`w-4 h-4 rounded-full border-2 ${w <= warningCount ? 'bg-orange-500 border-orange-600' : 'bg-gray-100 border-gray-300'}`} />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">{warningCount}/3 warnings</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {[{ label: 'Total Sales', value: fisherProfile?.totalSales || 0, icon: Fish }, { label: 'Revenue', value: `₹${fisherProfile?.totalRevenue || 0}`, icon: TrendingUp }, { label: 'Boat', value: fisherProfile?.boatType || 'N/A', icon: Anchor }, { label: 'Rating', value: '4.2/5', icon: Sparkles }].map((s, i) => (
                <div key={i} className="text-center p-3 rounded-xl bg-blue-50"><s.icon className="w-5 h-5 text-blue-600 mx-auto mb-1" /><div className="text-lg font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Bookings
  if (currentView === 'fisher-bookings') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Booking Requests</h2>
        <div className="text-center py-12 text-muted-foreground"><Fish className="w-12 h-12 mx-auto mb-3 opacity-50" /><p className="text-lg font-medium">Pre-booking Requests</p></div>
      </div>
    );
  }

  return null;
}
