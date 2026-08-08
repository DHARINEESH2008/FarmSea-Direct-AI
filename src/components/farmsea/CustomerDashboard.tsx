'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFarmSeaStore, type ViewType, type CartItem } from '@/store/useFarmSeaStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Search, ShoppingCart, Star, Leaf, Fish, MapPin, Filter,
  Sparkles, TrendingUp, Clock, Package, ChevronDown, Minus, Plus, Trash2, X,
} from 'lucide-react';

const CATEGORIES = [
  'VEGETABLES', 'FRUITS', 'OILS', 'SPICES', 'GRAINS', 'DAL', 'SUGAR', 'FRESH_MEATS',
  'FLOWERS', 'PICKLES', 'HONEY', 'MILK', 'CURD', 'GHEE', 'FRESH_FISH', 'LIVE_FISH',
  'DRY_FISH', 'FISH_PICKLES', 'NETS', 'FERTILIZERS', 'SEEDS', 'ORGANIC_MANURE',
];

const categoryLabels: Record<string, string> = {
  VEGETABLES: 'Vegetables', FRUITS: 'Fruits', OILS: 'Oils', SPICES: 'Spices',
  GRAINS: 'Grains', DAL: 'Dal', SUGAR: 'Sugar', FRESH_MEATS: 'Fresh Meats',
  FLOWERS: 'Flowers', PICKLES: 'Pickles', HONEY: 'Honey', SEEDS: 'Seeds',
  MILK: 'Milk', CURD: 'Curd', GHEE: 'Ghee', FRESH_FISH: 'Fresh Fish',
  LIVE_FISH: 'Live Fish', DRY_FISH: 'Dry Fish', FISH_PICKLES: 'Fish Pickles',
  NETS: 'Nets', FERTILIZERS: 'Fertilizers', ORGANIC_MANURE: 'Organic Manure',
  THOKKU: 'Thokku', HEALTHY_SNACKS: 'Healthy Snacks', FARMING_ITEMS: 'Farming Items',
  FISH_WASTE: 'Fish Waste', FISH_MASALAS: 'Fish Masalas',
  FISH_BONE_POWDER: 'Fish Bone Powder', BOATS: 'Boats',
  ICE_BOXES: 'Ice Boxes', SECOND_HAND_MACHINES: 'Used Machines',
  BUTTER: 'Butter', PANEER: 'Paneer', BUTTERMILK: 'Buttermilk',
  CONDENSED_MILK: 'Condensed Milk', FISH_TYPES: 'Fish Types',
  FISH_MANURE: 'Fish Manure', FISH_COMPOST: 'Fish Compost', FISH_FEED: 'Fish Feed',
};

function FreshnessBadge({ score }: { score: number | null }) {
  if (!score) return <span className="text-xs text-gray-400">N/A</span>;
  const color = score >= 90 ? 'bg-green-100 text-green-800 border-green-200' :
    score >= 70 ? 'bg-lime-100 text-lime-800 border-lime-200' :
    score >= 50 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
    'bg-red-100 text-red-800 border-red-200';
  const label = score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Poor';
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {score}% {label}
    </span>
  );
}

function FreshnessCircle({ score, size = 48 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 90 ? '#16a34a' : score >= 70 ? '#65a30d' : score >= 50 ? '#ca8a04' : '#dc2626';
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={3} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        className="fill-foreground text-[10px] font-bold" transform={`rotate(90, ${size / 2}, ${size / 2})`}>
        {score}%
      </text>
    </svg>
  );
}

export default function CustomerDashboard() {
  const { user, currentView, setCurrentView, cart, addToCart, removeFromCart, updateCartQty, cartTotal, clearCart, cartOpen, setCartOpen } = useFarmSeaStore();
  const { toast } = useToast();

  // Products
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sellerType, setSellerType] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // AI Recommendations
  const [recommendations, setRecommendations] = useState<Record<string, unknown>[]>([]);
  const [recType, setRecType] = useState('nearest');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (sellerType) params.set('sellerType', sellerType);
      if (sortBy) params.set('sortBy', sortBy);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch { /* empty */ } finally { setLoading(false); }
  }, [search, category, sellerType, sortBy]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const res = await fetch(`/api/orders?customerId=${user.id}`);
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch { /* empty */ } finally { setOrdersLoading(false); }
  }, [user]);

  const fetchRecommendations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/ai/recommendations?userId=${user.id}&type=${recType}`);
      const data = await res.json();
      if (data.success) setRecommendations(data.recommendations);
    } catch { /* empty */ }
  }, [user, recType]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { fetchRecommendations(); }, [fetchRecommendations]);

  const handleAddToCart = (p: Record<string, unknown>) => {
    const item: CartItem = {
      id: `cart-${Date.now()}`,
      productId: p.id as string,
      productName: p.name as string,
      price: p.price as number,
      quantity: 1,
      unit: p.unit as string,
      sellerId: p.sellerId as string,
      sellerType: p.sellerType as string,
    };
    addToCart(item);
    toast({ title: 'Added to cart', description: `${p.name}` });
  };

  const handlePlaceOrder = async () => {
    if (!user || cart.length === 0) return;
    try {
      const items = cart.map((c) => ({ productId: c.productId, quantity: c.quantity }));
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.id, items,
          deliveryAddress: 'Demo Address, Chennai 600001',
          paymentMethod: 'COD',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Order placed!', description: `Order ${data.order.orderNumber}` });
        clearCart();
        setCartOpen(false);
        fetchOrders();
      } else {
        toast({ title: 'Order failed', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not place order', variant: 'destructive' });
    }
  };

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

  // Browse View
  if (currentView === 'customer-browse') {
    return (
      <div className="space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search vegetables, fish, fruits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-11 text-base"
            />
          </div>
          <Button variant="outline" className="h-12 gap-2" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4" /> Filters
            {(category || sellerType) && <span className="w-2 h-2 rounded-full bg-orange-500" />}
          </Button>
        </div>

        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{categoryLabels[c] || c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Seller Type</label>
                <select
                  value={sellerType}
                  onChange={(e) => setSellerType(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">All Sellers</option>
                  <option value="FARMER">Farmer</option>
                  <option value="FISHER">Fisher</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                  <option value="freshness">Freshest</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* AI Recommendations Panel */}
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <CardTitle className="text-base">AI Recommendations</CardTitle>
              </div>
              <div className="flex gap-1">
                {['nearest', 'freshest', 'cheapest', 'highest_rated'].map((t) => (
                  <button key={t} onClick={() => setRecType(t)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      recType === t ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                    {t === 'nearest' ? 'Nearest' : t === 'freshest' ? 'Freshest' : t === 'cheapest' ? 'Cheapest' : 'Top Rated'}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {recommendations.length === 0 && <p className="text-sm text-muted-foreground">Loading AI suggestions...</p>}
              {recommendations.map((rec: Record<string, unknown>, i: number) => {
                const prod = rec.product as Record<string, unknown>;
                return (
                  <button key={i} onClick={() => handleAddToCart(prod)}
                    className="flex-shrink-0 w-40 p-3 rounded-xl bg-white border border-green-100 hover:border-green-300 hover:shadow-md transition-all text-left">
                    <div className="text-xs text-muted-foreground mb-1">#{i + 1} · AI Score: <span className="text-green-600 font-bold">{rec.aiScore as number}</span></div>
                    <div className="text-sm font-semibold truncate">{prod.name as string}</div>
                    <div className="text-sm text-orange-600 font-bold mt-1">₹{prod.price as number}/{prod.unit as string}</div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-40 w-full rounded-lg mb-3" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2 mt-2" /></CardContent></Card>
          )) : products.map((p) => (
            <Card key={p.id as string} className="group hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative">
                <div className="h-40 bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center">
                  {(p.sellerType as string) === 'FISHER' ? <Fish className="w-16 h-16 text-blue-300" /> : <Leaf className="w-16 h-16 text-green-300" />}
                </div>
                {(p.isOrganic as boolean) && (
                  <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs">Organic</Badge>
                )}
                <Badge className="absolute top-2 right-2 bg-white/90 text-xs">
                  {(p.sellerType as string) === 'FISHER' ? 'Fisher' : 'Farmer'}
                </Badge>
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-base leading-tight">{p.name as string}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.sellerName as string} · {categoryLabels[p.category as string] || (p.category as string)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-700">₹{p.price as number}</div>
                    <div className="text-xs text-muted-foreground">per {p.unit as string}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FreshnessBadge score={p.freshnessScore as number | null} />
                  {(p.avgRating as number) > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-600">
                      <Star className="w-3 h-3 fill-current" /> {p.avgRating as number}
                    </span>
                  )}
                </div>
                <Button className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold"
                  onClick={() => handleAddToCart(p)}>
                  <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {!loading && products.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm">Try adjusting your filters or search</p>
          </div>
        )}

        {/* Cart Sheet */}
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetContent className="w-full sm:max-w-md flex flex-col">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Your Cart ({cart.length})
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto py-4 space-y-3 custom-scrollbar">
              {cart.length === 0 && <p className="text-center text-muted-foreground py-8">Your cart is empty</p>}
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 p-3 rounded-xl bg-green-50/50 border">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{item.productName}</div>
                    <div className="text-sm text-green-700 font-bold">₹{item.price}/{item.unit}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateCartQty(item.productId, item.quantity - 1)} className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button onClick={() => updateCartQty(item.productId, item.quantity + 1)} className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
                    <button onClick={() => removeFromCart(item.productId)} className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
            <SheetFooter className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-green-700">₹{Math.round(cartTotal() * 100) / 100}</span>
              </div>
              <div className="text-xs text-muted-foreground">Free delivery on orders above ₹500</div>
              <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-base"
                onClick={handlePlaceOrder} disabled={cart.length === 0}>
                Place Order
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Orders View
  if (currentView === 'customer-orders') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">My Orders</h2>
        {ordersLoading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div> :
        orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No orders yet</p>
            <p className="text-sm">Start shopping to see your orders here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
            {orders.map((o: Record<string, unknown>) => (
              <Card key={o.id as string}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <div className="font-bold">{o.orderNumber as string}</div>
                      <div className="text-xs text-muted-foreground">{new Date(o.createdAt as string).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColor(o.status as string)}>{(o.status as string).replace(/_/g, ' ')}</Badge>
                      <span className="text-lg font-bold text-green-700">₹{o.totalAmount as number}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {(o.items as Record<string, unknown>[])?.map((item: Record<string, unknown>) => (
                      <div key={item.id as string} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.productName as string} × {item.quantity as number} {item.unit as string}</span>
                        <span>₹{item.subtotal as number}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // AI View redirect - handled by page.tsx
  if (currentView === 'customer-ai') {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading AI Features...</div>;
  }

  // Circular Economy redirect - handled by page.tsx
  if (currentView === 'customer-circular') {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading Circular Economy...</div>;
  }

  // Bookings placeholder
  if (currentView === 'customer-bookings') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">My Bookings</h2>
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">Pre-book Harvests &amp; Catch</p>
          <p className="text-sm">Book fresh produce before it&apos;s harvested or caught</p>
        </div>
      </div>
    );
  }

  return null;
}
