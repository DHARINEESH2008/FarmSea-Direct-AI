import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/ai/demand-prediction?category=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json(
        { error: 'category query param is required' },
        { status: 400 }
      );
    }

    // Fetch real product data for this category
    const products = await db.product.findMany({
      where: { category: category as never },
      select: { price: true, soldCount: true, quantityAvailable: true },
    });

    const avgPrice = products.length > 0
      ? products.reduce((s, p) => s + p.price, 0) / products.length
      : 0;
    const totalSold = products.reduce((s, p) => s + p.soldCount, 0);
    const totalAvailable = products.reduce((s, p) => s + p.quantityAvailable, 0);

    // Fetch real order data
    const recentOrders = await db.orderItem.findMany({
      where: {
        product: { category: category as never },
      },
      include: {
        order: { select: { createdAt: true, totalAmount: true } },
      },
      orderBy: { order: { createdAt: 'desc' } },
      take: 100,
    });

    // Mock seasonal factors based on current month
    const month = new Date().getMonth();
    const seasonalFactors: Record<number, { factor: string; name: string }> = {
      0: { factor: 'HIGH', name: 'Pongal/Harvest Festival Season' },
      1: { factor: 'MEDIUM', name: 'Post-Harvest Season' },
      2: { factor: 'MEDIUM', name: 'Pre-Summer Season' },
      3: { factor: 'HIGH', name: 'Summer Season Start' },
      4: { factor: 'HIGH', name: 'Peak Summer' },
      5: { factor: 'MEDIUM', name: 'Monsoon Onset' },
      6: { factor: 'LOW', name: 'Monsoon Peak' },
      7: { factor: 'LOW', name: 'Monsoon Season' },
      8: { factor: 'MEDIUM', name: 'Post-Monsoon' },
      9: { factor: 'HIGH', name: 'Festival Season (Navaratri)' },
      10: { factor: 'HIGH', name: 'Diwali Season' },
      11: { factor: 'MEDIUM', name: 'Winter Season' },
    };

    const seasonInfo = seasonalFactors[month] || { factor: 'MEDIUM', name: 'Normal' };

    // Mock demand calculation
    const baseDemand = totalSold > 0 ? totalSold * 1.2 : 50;
    const seasonalMultiplier = seasonInfo.factor === 'HIGH' ? 1.5 : seasonInfo.factor === 'LOW' ? 0.6 : 1.0;
    const predictedDemand = Math.round(baseDemand * seasonalMultiplier * (0.9 + Math.random() * 0.2));

    // Confidence score (mock)
    const confidence = Math.round((70 + Math.random() * 25) * 10) / 10;

    // Generate prediction for next 7 days
    const dailyPredictions = Array.from({ length: 7 }, (_, i) => {
      const dayVariance = 0.8 + Math.random() * 0.4;
      const dayDemand = Math.round((predictedDemand / 7) * dayVariance);
      const dayConfidence = Math.round((confidence - 5 + Math.random() * 10) * 10) / 10;
      return {
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        predictedDemand: dayDemand,
        confidence: Math.min(99, Math.max(50, dayConfidence)),
      };
    });

    // Supply-demand gap analysis
    const supplyDemandRatio = totalAvailable > 0 && predictedDemand > 0
      ? Math.round((totalAvailable / predictedDemand) * 100) / 100
      : 0;

    let marketAdvice: string;
    if (supplyDemandRatio > 1.5) {
      marketAdvice = 'Oversupplied market. Consider lowering prices or moving excess to circular economy.';
    } else if (supplyDemandRatio > 1.0) {
      marketAdvice = 'Balanced market. Current supply meets demand.';
    } else if (supplyDemandRatio > 0.5) {
      marketAdvice = 'Slight shortage expected. Good time for sellers to list more products.';
    } else {
      marketAdvice = 'High demand, low supply. Sellers can expect premium pricing.';
    }

    return NextResponse.json({
      success: true,
      category,
      prediction: {
        predictedDemand,
        currentSupply: totalAvailable,
        supplyDemandRatio,
        avgPrice: Math.round(avgPrice * 100) / 100,
        confidence,
        season: seasonInfo.name,
        seasonalFactor: seasonInfo.factor,
        marketAdvice,
        dailyPredictions,
      },
      realData: {
        totalProducts: products.length,
        totalHistoricalSales: totalSold,
        recentOrderCount: recentOrders.length,
      },
      calculatedAt: new Date().toISOString(),
      model: 'FarmSea-AI-Demand-Mock-v1',
    });
  } catch (error) {
    console.error('[AI/DEMAND-PREDICTION] Error:', error);
    return NextResponse.json({ error: 'Failed to generate demand prediction' }, { status: 500 });
  }
}
