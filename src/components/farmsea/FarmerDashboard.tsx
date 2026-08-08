'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFarmSeaStore, type ViewType } from '@/store/useFarmSeaStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Package, Plus, CheckCircle, Clock, Truck, Leaf, Shield,
  Sparkles, TrendingUp, BarChart3, Award, FileText,
} from 'lucide-react';

const CATEGORIES = ['VEGETABLES', 'FRUITS', 'OILS', 'SPICES', 'GRAINS', 'DAL', 'SUGAR', 'FRESH_MEATS', 'FLOWERS', 'PICKLES', 'THOKKU', 'HEALTHY_SNACKS', 'FERTILIZERS', 'HONEY', 'SEEDS', 'FARMING_ITEMS', 'SECOND_HAND_MACHINES', 'MILK', 'CURD', 'GHEE', 'BUTTER', 'PANEER', 'BUTTERMILK', 'CONDENSED_MILK'];

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
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#65a30d' : score >= 40 ? '#ca8a04' : '#dc2626';
  return (
    <div className="flex flex-col items-center">
      <svg width={160} height={100} className="overflow-visible">
        <path d={`M ${80 - r} 80 A ${r} ${r} 0 0 1 ${80 + r} 80`} fill="none" stroke="#e5e7eb" strokeWidth={10} strokeLinecap="round" />
        <path d={`M ${80 - r} 80 A ${r} ${r} 0 0 1 ${80 + r} 80`} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={Math.PI * r} strokeDashoffset={Math.PI * r - (score / 100) * Math.PI * r} />
        <text x={80} y={75} textAnchor="middle" className="fill-foreground text-2xl font-bold" fontSize={28}>{score}</text>
        <text x={80} y={95} textAnchor="middle" className="fill-muted-foreground" fontSize={12}>Trust Score</text>
      </svg>
    </div>
  );
}

export default function FarmerDashboard() {
  const { user, currentView, setCurrentView } = useFarmSeaStore();
  const { toast } = useToast();

  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'VEGETABLES', price: '', unit: 'kg', quantity: '', description: '', isOrganic: false });

  const farmerProfile = user?.profile as Record<string, unknown> | null;
  const trustScore = farmerProfile ? 72 : 50;

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [prodRes, ordRes] = await Promise.all([
        fetch(`/api/products?sellerType=FARMER`),
        fetch(`/api/orders?sellerId=${user.id}`),
      ]);
      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      if (prodData.success) setProducts(prodData.products);
      if (ordData.success) setOrders(ordData.orders);
    } catch { /* empty */ } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddProduct = async () => {
    if (!user || !newProduct.name || !newProduct.price) {
      toast({ title: 'Error', description: 'Name and price are required', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: user.id, sellerType: 'FARMER',
          name: newProduct.name,
          category: newProduct.category,
          price: parseFloat(newProduct.price),
          unit: newProduct.unit,
          quantityAvailable: parseFloat(newProduct.quantity) || 100,
          description: newProduct.description,
          isOrganic: newProduct.isOrganic,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Product added!', description: newProduct.name });
        setAddDialogOpen(false);
        setNewProduct({ name: '', category: 'VEGETABLES', price: '', unit: 'kg', quantity: '', description: '', isOrganic: false });
        fetchData();
      } else {
        toast({ title: 'Failed', description: data.error || 'Could not add product', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to add product', variant: 'destructive' });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/orders`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, status }) });
      toast({ title: 'Order updated', description: `Status: ${status}` });
      fetchData();
    } catch {
      toast({ title: 'Error', description: 'Failed to update order', variant: 'destructive' });
    }
  };

  // Products View
  if (currentView === 'farmer-products') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">My Products</h2>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white h-11 gap-2"><Plus className="w-4 h-4" /> Add Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2"><Label>Product Name</Label><Input placeholder="e.g. Organic Tomatoes" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="h-11" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Category</Label><select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">{CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}</select></div>
                  <div className="space-y-2"><Label>Unit</Label><select value={newProduct.unit} onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option>kg</option><option>g</option><option>dozen</option><option>piece</option><option>litre</option><option>bundle</option></select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" placeholder="50" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="h-11" /></div>
                  <div className="space-y-2"><Label>Quantity Available</Label><Input type="number" placeholder="100" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })} className="h-11" /></div>
                </div>
                <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Describe your product..." value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} rows={3} /></div>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newProduct.isOrganic} onChange={(e) => setNewProduct({ ...newProduct, isOrganic: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-sm font-medium">Organic Product</span></label>
              </div>
              <DialogFooter><Button onClick={handleAddProduct} className="bg-green-600 hover:bg-green-700 text-white">Add Product</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />) :
          products.filter((p) => p.sellerId === user?.id).map((p) => (
            <Card key={p.id as string} className="overflow-hidden">
              <div className="h-28 bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center">
                <Leaf className="w-12 h-12 text-green-200" />
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div><h3 className="font-semibold">{p.name as string}</h3><p className="text-xs text-muted-foreground">{(p.category as string).replace(/_/g, ' ')}</p></div>
                  <span className="text-lg font-bold text-green-700">₹{p.price as number}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Stock: {p.quantityAvailable as number} {p.unit as string}</span>
                  <span className="text-muted-foreground">Sold: {p.soldCount as number}</span>
                </div>
                {p.isOrganic && <Badge className="bg-green-100 text-green-700 border-green-200">Organic</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
        {!loading && products.filter((p) => p.sellerId === user?.id).length === 0 && (
          <div className="text-center py-12 text-muted-foreground"><Package className="w-12 h-12 mx-auto mb-3 opacity-50" /><p className="text-lg font-medium">No products yet</p><p className="text-sm">Add your first product to start selling</p></div>
        )}
      </div>
    );
  }

  // Orders View
  if (currentView === 'farmer-orders') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Orders Received</h2>
        {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />) :
        orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><Package className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No orders received yet</p></div>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
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
                      {(o.status as string) === 'PENDING' && <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateOrderStatus(o.id as string, 'ACCEPTED')}><CheckCircle className="w-3 h-3 mr-1" /> Accept</Button>}
                      {(o.status as string) === 'ACCEPTED' && <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => handleUpdateOrderStatus(o.id as string, 'PREPARING')}><Clock className="w-3 h-3 mr-1" /> Preparing</Button>}
                      {(o.status as string) === 'PREPARING' && <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleUpdateOrderStatus(o.id as string, 'READY_FOR_PICKUP')}><Truck className="w-3 h-3 mr-1" /> Ready</Button>}
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
  if (currentView === 'farmer-ai') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">AI Copilot</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-5 h-5 text-orange-500" /> Pricing Advice</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-white border text-sm"><strong>Current Market:</strong> Tomato prices are trending 12% above average this week due to monsoon disruption.</div>
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-100 text-sm"><strong>Suggestion:</strong> Consider listing at ₹45/kg instead of ₹40/kg. Demand is high and supply is constrained.</div>
              <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-sm"><strong>Organic Premium:</strong> Your organic certification allows a 15-20% premium over conventional prices.</div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-5 h-5 text-green-600" /> Demand Forecast</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {['Vegetables: +23% demand next week', 'Rice & Grains: Stable', 'Fruits: +15% (mango season ending)', 'Organic produce: +30% trending'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-white"><TrendingUp className={`w-4 h-4 ${item.includes('+') ? 'text-green-600' : 'text-gray-400'}`} /><span>{item}</span></div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Leaf className="w-5 h-5 text-green-600" /> Crop Guidance</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Based on your region and season, consider planting these high-demand crops:</p>
              {['Brinjal — Peak demand Aug-Sep', 'Drumstick — Year-round, low maintenance', 'Cluster Beans — High market price', 'Ridge Gourd — Fast growing, 45 days'].map((c, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded bg-green-50"><Leaf className="w-3 h-3 text-green-500" />{c}</div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Farm Passport
  if (currentView === 'farmer-passport') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Digital Farm Passport</h2>
        <Card className="border-2 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center"><Leaf className="w-8 h-8 text-green-600" /></div>
                <div><h3 className="text-lg font-bold">{farmerProfile?.farmName as string || user?.name || 'My Farm'}</h3><p className="text-sm text-muted-foreground">{farmerProfile?.farmCity as string}, {farmerProfile?.farmState as string}</p></div>
              </div>
              <Badge className={farmerProfile?.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                <Shield className="w-3 h-3 mr-1" /> {farmerProfile?.verificationStatus as string || 'PENDING'}
              </Badge>
            </div>
            <TrustGauge score={trustScore} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {[{ label: 'Total Sales', value: farmerProfile?.totalSales || 0, icon: Package }, { label: 'Revenue', value: `₹${farmerProfile?.totalRevenue || 0}`, icon: TrendingUp }, { label: 'Farm Size', value: `${farmerProfile?.farmSizeAcres || 0} acres`, icon: Leaf }, { label: 'Rating', value: '4.5/5', icon: Award }].map((s, i) => (
                <div key={i} className="text-center p-3 rounded-xl bg-green-50"><s.icon className="w-5 h-5 text-green-600 mx-auto mb-1" /><div className="text-lg font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Bookings
  if (currentView === 'farmer-bookings') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Booking Requests</h2>
        <div className="text-center py-12 text-muted-foreground"><FileText className="w-12 h-12 mx-auto mb-3 opacity-50" /><p className="text-lg font-medium">Pre-booking Requests</p><p className="text-sm">Customers can pre-book your upcoming harvest</p></div>
      </div>
    );
  }

  return null;
}
