'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFarmSeaStore } from '@/store/useFarmSeaStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles, Brain, ThermometerSun, TrendingUp, DollarSign,
  MessageSquare, Send, Zap, Target, BarChart3, Leaf, Clock, Award,
} from 'lucide-react';

function FreshnessMeter({ score, label }: { score: number; label: string }) {
  const r = 50;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 90 ? '#16a34a' : score >= 70 ? '#65a30d' : score >= 50 ? '#ca8a04' : '#dc2626';
  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : score >= 50 ? 'C+' : 'C';
  return (
    <div className="flex flex-col items-center">
      <svg width={130} height={130} className="-rotate-90">
        <circle cx={65} cy={65} r={r} fill="none" stroke="#e5e7eb" strokeWidth={8} />
        <circle cx={65} cy={65} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        <text x={65} y={60} textAnchor="middle" dominantBaseline="central"
          className="fill-foreground text-xl font-bold" transform={`rotate(90, 65, 65)`}>{score}%</text>
        <text x={65} y={80} textAnchor="middle" dominantBaseline="central"
          className={`fill-current font-bold`} style={{ fontSize: 14, color }} transform={`rotate(90, 65, 65)`}>Grade {grade}</text>
      </svg>
      <span className="text-sm text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

export default function AIFeatures() {
  const { user, currentView } = useFarmSeaStore();
  const { toast } = useToast();

  const [recommendations, setRecommendations] = useState<Record<string, unknown>[]>([]);
  const [recType, setRecType] = useState('nearest');
  const [recLoading, setRecLoading] = useState(true);
  const [pricingData, setPricingData] = useState<Record<string, unknown> | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([
    { role: 'ai', content: 'Hello! I\'m your FarmSea AI Copilot. Ask me about pricing, demand forecasts, crop guidance, or anything about the marketplace.' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const fetchRecommendations = useCallback(async () => {
    if (!user) return;
    setRecLoading(true);
    try {
      const res = await fetch(`/api/ai/recommendations?userId=${user.id}&type=${recType}`);
      const data = await res.json();
      if (data.success) setRecommendations(data.recommendations);
    } catch { /* empty */ } finally { setRecLoading(false); }
  }, [user, recType]);

  useEffect(() => { fetchRecommendations(); }, [fetchRecommendations]);

  const fetchPricing = async (productId: string) => {
    if (!productId) return;
    setPricingLoading(true);
    try {
      const res = await fetch(`/api/ai/pricing?productId=${productId}`);
      const data = await res.json();
      if (data.success) setPricingData(data);
      else toast({ title: 'Error', description: data.error, variant: 'destructive' });
    } catch { toast({ title: 'Error', variant: 'destructive' }); } finally { setPricingLoading(false); }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    // Simulated AI response
    setTimeout(() => {
      const responses = [
        'Based on current market trends, I recommend listing your products in the morning (6-8 AM) for maximum visibility.',
        'Tomato prices are expected to rise 8-12% next week due to monsoon supply disruptions. Hold if possible.',
        'Your freshness score of 92% is excellent! This puts you in the top 5% of sellers. Maintain cold chain.',
        'Consider diversifying into value-added products like pickles or dried fish for better margins.',
        'The circular economy program can help you sell fish waste as organic fertilizer — extra revenue stream!',
        'Customer demand for organic produce is growing 25% year-over-year. Certification is worth the investment.',
      ];
      const aiMsg = { role: 'ai', content: responses[Math.floor(Math.random() * responses.length)] };
      setChatMessages((prev) => [...prev, aiMsg]);
    }, 800);
  };

  // AI Matching
  if (currentView === 'ai-matching') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-green-600" /> AI Smart Matching</h2>
        <div className="flex gap-2 flex-wrap">
          {['nearest', 'freshest', 'cheapest', 'highest_rated'].map((t) => (
            <button key={t} onClick={() => setRecType(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                recType === t ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
              {t === 'nearest' ? 'Nearest' : t === 'freshest' ? 'Freshest' : t === 'cheapest' ? 'Best Value' : 'Top Rated'}
            </button>
          ))}
        </div>
        {recLoading ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div> :
        recommendations.map((rec: Record<string, unknown>, i: number) => {
          const prod = rec.product as Record<string, unknown>;
          const factors = rec.scoreFactors as Record<string, unknown>;
          return (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-green-700">#{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{prod.name as string}</div>
                  <div className="text-sm text-muted-foreground">{prod.sellerName as string} · {prod.category as string}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{Object.entries(factors).map(([k, v]) => `${k}: ${v}`).join(' · ')}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-green-700">₹{prod.price as number}</div>
                  <div className="text-sm text-orange-600 font-medium">Score: {rec.aiScore as number}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Freshness Meter
  if (currentView === 'ai-freshness') {
    const sampleProducts = [
      { name: 'Organic Tomatoes', score: 95, time: '2h ago' },
      { name: 'Fresh Pomfret', score: 88, time: '4h ago' },
      { name: 'Farm Eggs', score: 82, time: '6h ago' },
      { name: 'Green Chillies', score: 72, time: '12h ago' },
      { name: 'Dry Fish', score: 55, time: '3 days ago' },
    ];
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2"><ThermometerSun className="w-5 h-5 text-orange-500" /> AI Freshness Meter</h2>
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-white">
          <CardContent className="p-4 text-sm text-green-800">
            <strong>How it works:</strong> Our AI tracks harvest/catch time, storage temperature, transport duration, and handling conditions to calculate real-time freshness scores.
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleProducts.map((p, i) => (
            <Card key={i} className="flex flex-col items-center py-6">
              <FreshnessMeter score={p.score} label={p.name} />
              <div className="mt-2 text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {p.time}</div>
              <Badge className={`mt-2 ${p.score >= 90 ? 'bg-green-100 text-green-800' : p.score >= 70 ? 'bg-lime-100 text-lime-800' : p.score >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                {p.score >= 90 ? 'Excellent' : p.score >= 70 ? 'Good' : p.score >= 50 ? 'Fair' : 'Declining'}
              </Badge>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Dynamic Pricing
  if (currentView === 'ai-pricing') {
    const pa = pricingData?.priceAnalysis as Record<string, unknown> | null;
    const md = pricingData?.marketData as Record<string, unknown> | null;
    const f = pricingData?.factors as Record<string, unknown> | null;
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" /> AI Dynamic Pricing</h2>
        <div className="flex gap-2">
          <Input placeholder="Enter Product ID to analyze" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="flex-1 h-11" />
          <Button className="bg-green-600 hover:bg-green-700 text-white h-11" onClick={() => fetchPricing(selectedProductId)} disabled={!selectedProductId}><Sparkles className="w-4 h-4 mr-2" />Analyze</Button>
        </div>
        {pricingLoading ? <Skeleton className="h-64 rounded-xl" /> :
        pricingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-green-200">
              <CardHeader><CardTitle className="text-base">Price Analysis</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Current Price</span><span className="font-bold">₹{pricingData.currentPrice as number}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">AI Suggested</span><span className="font-bold text-green-600">₹{pricingData.suggestedPrice as number}</span></div>
                {pa && <><div className="flex justify-between"><span className="text-muted-foreground">Price Range</span><span>₹{pa.priceFloor as number} - ₹{pa.priceCeiling as number}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Difference</span><span className={pa.priceDifferencePercent as number > 0 ? 'text-red-600' : 'text-green-600'}>{pa.priceDifferencePercent as number > 0 ? '+' : ''}{pa.priceDifferencePercent as number}%</span></div>
                <div className="p-3 rounded-lg bg-orange-50 border border-orange-100 text-sm">{pa.advice as string}</div></>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Market Data &amp; Factors</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {md && <><div className="flex justify-between text-sm"><span className="text-muted-foreground">Market Average</span><span>₹{md.avgMarketPrice as number}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Comparable Products</span><span>{md.comparableProducts as number}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Your Market Share</span><span>{md.yourMarketShare as number}%</span></div></>}
                {f && <><div className="border-t pt-2 mt-2"><div className="text-xs font-medium mb-2">Pricing Factors</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span>Freshness: +{f.freshnessPremium as number}%</span>
                  <span>Rating: +{f.ratingPremium as number}%</span>
                  <span>Organic: +{f.organicPremium as number}%</span>
                  <span>Demand: +{f.demandPremium as number}%</span>
                </div></div></>}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-200"><CardContent className="p-8 text-center text-muted-foreground"><Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>Enter a product ID to get AI pricing analysis</p><p className="text-xs mt-1">Get suggestions based on market conditions, freshness, demand, and seasonal factors</p></CardContent></Card>
        )}
      </div>
    );
  }

  // Demand Prediction
  if (currentView === 'ai-demand') {
    const predictions = [
      { category: 'Vegetables', demand: 85, supply: 70, trend: '+23%', conf: 0.92 },
      { category: 'Fresh Fish', demand: 78, supply: 65, trend: '+18%', conf: 0.88 },
      { category: 'Fruits', demand: 72, supply: 80, trend: '-5%', conf: 0.85 },
      { category: 'Grains & Dal', demand: 60, supply: 90, trend: '-12%', conf: 0.90 },
      { category: 'Organic', demand: 90, supply: 40, trend: '+30%', conf: 0.87 },
    ];
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-600" /> Demand Prediction</h2>
        <div className="space-y-3">
          {predictions.map((p, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{p.category}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={p.trend.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{p.trend}</Badge>
                    <span className="text-xs text-muted-foreground">Confidence: {Math.round(p.conf * 100)}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Demand</span><span>Supply</span></div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-green-500 rounded-l-full" style={{ width: `${p.demand}%` }} />
                      <div className="h-full bg-blue-300" style={{ width: `${Math.max(p.supply - p.demand, 0)}%` }} />
                    </div>
                  </div>
                  <div className="text-sm w-20 text-right">
                    <div className="text-green-600 font-medium">D: {p.demand}%</div>
                    <div className="text-blue-500">S: {p.supply}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // AI Copilot Chat
  if (currentView === 'ai-copilot') {
    return (
      <div className="flex flex-col h-[calc(100vh-160px)]">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><Brain className="w-5 h-5 text-orange-500" /> AI Copilot</h2>
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user' ? 'bg-green-600 text-white rounded-br-md' : 'bg-gray-100 rounded-bl-md'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </CardContent>
          <div className="p-3 border-t flex gap-2">
            <Input
              placeholder="Ask about pricing, demand, crops..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              className="flex-1 h-11"
            />
            <Button className="bg-green-600 hover:bg-green-700 text-white h-11 w-11 p-0" onClick={handleSendChat}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
