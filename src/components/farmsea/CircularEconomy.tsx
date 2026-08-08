'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFarmSeaStore } from '@/store/useFarmSeaStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Recycle, Plus, ArrowLeftRight, HandHeart, Tag,
  Leaf, Fish, MapPin, TrendingUp, Package,
} from 'lucide-react';

const CIRCULAR_CATEGORIES = ['FISH_WASTE', 'FISH_BONE_POWDER', 'FISH_MANURE', 'FISH_COMPOST', 'FISH_FEED', 'ORGANIC_MANURE', 'FERTILIZERS'];

export default function CircularEconomy() {
  const { user, currentView, setCurrentView } = useFarmSeaStore();
  const { toast } = useToast();

  const [listings, setListings] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newListing, setNewListing] = useState({ title: '', category: 'FISH_WASTE', description: '', quantity: '', unit: 'kg', exchangeType: 'SELL', wantedItem: '', price: '', location: 'Chennai' });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/circular');
      const data = await res.json();
      if (data.success) setListings(data.listings);
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleCreate = async () => {
    if (!user || !newListing.title) {
      toast({ title: 'Error', description: 'Title is required', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/circular', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listerId: user.id, listerType: user.role,
          category: newListing.category, title: newListing.title,
          description: newListing.description,
          quantity: parseFloat(newListing.quantity) || 10,
          unit: newListing.unit,
          exchangeType: newListing.exchangeType,
          wantedItem: newListing.wantedItem || null,
          price: newListing.price ? parseFloat(newListing.price) : null,
          location: newListing.location,
        }),
      });
      const data = await res.json();
      if (res.ok) { toast({ title: 'Listing created!' }); setCreateOpen(false); setNewListing({ title: '', category: 'FISH_WASTE', description: '', quantity: '', unit: 'kg', exchangeType: 'SELL', wantedItem: '', price: '', location: 'Chennai' }); fetchListings(); }
      else { toast({ title: 'Failed', description: data.error, variant: 'destructive' }); }
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const exchangeTypeIcon = (t: string) => {
    switch (t) {
      case 'BARTER': return <ArrowLeftRight className="w-4 h-4" />;
      case 'DONATE': return <HandHeart className="w-4 h-4" />;
      case 'EXCHANGE': return <ArrowLeftRight className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const exchangeTypeColor = (t: string) => {
    switch (t) {
      case 'BARTER': return 'bg-blue-100 text-blue-800';
      case 'DONATE': return 'bg-green-100 text-green-800';
      case 'EXCHANGE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  // Marketplace
  if (currentView === 'circular-marketplace') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2"><Recycle className="w-6 h-6 text-green-600" /> Circular Marketplace</h2>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white h-11 gap-2"><Plus className="w-4 h-4" /> Create Listing</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Circular Listing</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2"><Label>Title</Label><Input placeholder="e.g. Fish waste for composting" value={newListing.title} onChange={(e) => setNewListing({ ...newListing, title: e.target.value })} className="h-11" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Category</Label><select value={newListing.category} onChange={(e) => setNewListing({ ...newListing, category: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">{CIRCULAR_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}</select></div>
                  <div className="space-y-2"><Label>Exchange Type</Label><select value={newListing.exchangeType} onChange={(e) => setNewListing({ ...newListing, exchangeType: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="SELL">Sell</option><option value="BARTER">Barter</option><option value="DONATE">Donate</option><option value="EXCHANGE">Exchange</option></select></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2"><Label>Quantity</Label><Input type="number" placeholder="10" value={newListing.quantity} onChange={(e) => setNewListing({ ...newListing, quantity: e.target.value })} className="h-11" /></div>
                  <div className="space-y-2"><Label>Unit</Label><select value={newListing.unit} onChange={(e) => setNewListing({ ...newListing, unit: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option>kg</option><option>litre</option><option>piece</option><option>bag</option></select></div>
                  <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" placeholder="Optional" value={newListing.price} onChange={(e) => setNewListing({ ...newListing, price: e.target.value })} className="h-11" /></div>
                </div>
                {newListing.exchangeType === 'BARTER' && <div className="space-y-2"><Label>Wanted Item</Label><Input placeholder="e.g. Organic compost" value={newListing.wantedItem} onChange={(e) => setNewListing({ ...newListing, wantedItem: e.target.value })} className="h-11" /></div>}
                <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Details about the item..." value={newListing.description} onChange={(e) => setNewListing({ ...newListing, description: e.target.value })} rows={3} /></div>
                <div className="space-y-2"><Label>Location</Label><Input placeholder="Chennai" value={newListing.location} onChange={(e) => setNewListing({ ...newListing, location: e.target.value })} className="h-11" /></div>
              </div>
              <DialogFooter><Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700 text-white">Create Listing</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sustainability Banner */}
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-4 flex items-center gap-4">
            <Recycle className="w-10 h-10 text-green-600 flex-shrink-0" />
            <div>
              <div className="font-semibold text-green-800">Reduce Waste, Create Value</div>
              <div className="text-sm text-green-600">Fish waste becomes organic fertilizer. Farm waste feeds fish. Together, we build a circular economy.</div>
            </div>
          </CardContent>
        </Card>

        {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />) :
        listings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><Recycle className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No circular listings yet</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((l) => (
              <Card key={l.id as string} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{l.title as string}</h3>
                    <Badge className={exchangeTypeColor(l.exchangeType as string)}>{exchangeTypeIcon(l.exchangeType as string)} {(l.exchangeType as string)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{l.description as string}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-green-700">{l.quantity as number} {l.unit as string}</span>
                    {l.price && <span className="font-bold">₹{l.price as number}</span>}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {l.location as string}</span>
                    <span>{l.listerName as string}</span>
                  </div>
                  {l.wantedItem && <div className="text-xs p-2 rounded bg-blue-50 border border-blue-100">Wants: {l.wantedItem as string}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // My Listings
  if (currentView === 'circular-my-listings') {
    const myListings = listings.filter((l) => l.listerId === user?.id);
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">My Listings</h2>
        {myListings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><Package className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No listings yet. Create your first one!</p></div>
        ) : (
          <div className="space-y-3">{myListings.map((l) => (
            <Card key={l.id as string}><CardContent className="p-4 flex items-center justify-between">
              <div><div className="font-semibold">{l.title as string}</div><div className="text-sm text-muted-foreground">{l.quantity as number} {l.unit as string} · {(l.exchangeType as string)}</div></div>
              <Badge className={exchangeTypeColor(l.exchangeType as string)}>{l.exchangeCount as number} exchanges</Badge>
            </CardContent></Card>
          ))}</div>
        )}
      </div>
    );
  }

  // Exchange History
  if (currentView === 'circular-history') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Exchange History</h2>
        <Card className="border-green-100 bg-green-50/50">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <h3 className="text-lg font-semibold">Sustainability Impact</h3>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[{ label: 'Items Exchanged', value: listings.reduce((s, l) => s + (l.exchangeCount as number), 0) }, { label: 'Waste Diverted', value: '245 kg' }, { label: 'Carbon Saved', value: '89 kg' }].map((s, i) => (
                <div key={i} className="p-3 rounded-xl bg-white"><div className="text-xl font-bold text-green-700">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
