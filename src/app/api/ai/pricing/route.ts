import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/ai/pricing?productId=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'productId query param is required' },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        reviews: { select: { rating: true } },
        aiPriceHistory: {
          orderBy: { calculatedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get market data: same category products
    const marketProducts = await db.product.findMany({
      where: {
        category: product.category,
        id: { not: productId },
        isActive: true,
      },
      select: { price: true, soldCount: true, freshnessScore: true },
    });

    // Calculate market stats
    const marketPrices = marketProducts.map((p) => p.price);
    const avgMarketPrice = marketPrices.length > 0
      ? marketPrices.reduce((s, p) => s + p, 0) / marketPrices.length
      : product.price;
    const minMarketPrice = marketPrices.length > 0 ? Math.min(...marketPrices) : product.price;
    const maxMarketPrice = marketPrices.length > 0 ? Math.max(...marketPrices) : product.price;
    const medianPrice = [...marketPrices].sort((a, b) => a - b)[
      Math.floor(marketPrices.length / 2)
    ] || product.price;

    // Average rating
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
        : 0;

    // Freshness premium
    const freshnessPremium = product.freshnessScore
      ? (product.freshnessScore - 50) / 500 // ±10% premium/discount
      : 0;

    // Rating premium (higher rated = higher price tolerance)
    const ratingPremium = avgRating > 0 ? (avgRating - 3) * 0.03 : 0; // ±6%

    // Organic premium
    const organicPremium = product.isOrganic ? 0.15 : 0;

    // Demand factor based on sold count
    const totalMarketSold = marketProducts.reduce((s, p) => s + p.soldCount, 0) + product.soldCount;
    const demandRatio = totalMarketSold > 0 ? product.soldCount / totalMarketSold : 0.5;
    const demandPremium = demandRatio > 0.3 ? 0.05 : 0;

    // Seasonal factor
    const month = new Date().getMonth();
    const isFestivalSeason = [9, 10, 0].includes(month);
    const seasonalFactor = isFestivalSeason ? 0.08 : 0;

    // Calculate AI suggested price
    const basePrice = avgMarketPrice;
    const totalAdjustment = 1 + freshnessPremium + ratingPremium + organicPremium + demandPremium + seasonalFactor;
    const suggestedPrice = Math.round(basePrice * totalAdjustment * 100) / 100;

    // Price range recommendation
    const priceFloor = Math.round(suggestedPrice * 0.85 * 100) / 100;
    const priceCeiling = Math.round(suggestedPrice * 1.2 * 100) / 100;

    // Comparison with current price
    const priceDifference = Math.round((product.price - suggestedPrice) * 100) / 100;
    const priceDifferencePercent = suggestedPrice > 0
      ? Math.round((priceDifference / suggestedPrice) * 1000) / 10
      : 0;

    // Pricing advice
    let advice: string;
    if (priceDifferencePercent > 15) {
      advice = 'Your price is significantly above AI suggestion. Consider lowering to increase sales volume.';
    } else if (priceDifferencePercent > 5) {
      advice = 'Your price is slightly above market. Your quality metrics may justify it.';
    } else if (priceDifferencePercent < -10) {
      advice = 'You are underpricing! Consider increasing to capture more margin while staying competitive.';
    } else if (priceDifferencePercent < -5) {
      advice = 'Your price is slightly below market. Good for volume, but consider a small increase.';
    } else {
      advice = 'Your pricing is well-aligned with market conditions and product quality.';
    }

    // Log the pricing analysis
    await db.aiPriceHistory.create({
      data: {
        productId,
        price: product.price,
        suggestedPrice,
        season: ['WINTER', 'SPRING', 'SUMMER', 'MONSOON', 'POST_MONSOON'][Math.floor(month / 3)] || 'OTHER',
        demandLevel: demandRatio > 0.3 ? 'HIGH' : demandRatio > 0.15 ? 'MEDIUM' : 'LOW',
        weatherCondition: month >= 3 && month <= 5 ? 'HOT' : month >= 6 && month <= 8 ? 'RAINY' : 'PLEASANT',
        festivalFactor: isFestivalSeason ? 'HIGH' : 'NORMAL',
      },
    });

    return NextResponse.json({
      success: true,
      productId,
      productName: product.name,
      category: product.category,
      currentPrice: product.price,
      suggestedPrice,
      priceAnalysis: {
        priceFloor,
        priceCeiling,
        priceDifference,
        priceDifferencePercent,
        advice,
        marketPosition: product.price > medianPrice ? 'ABOVE_MEDIAN' : 'BELOW_MEDIAN',
      },
      marketData: {
        avgMarketPrice: Math.round(avgMarketPrice * 100) / 100,
        minMarketPrice,
        maxMarketPrice,
        medianPrice,
        comparableProducts: marketPrices.length,
        yourMarketShare: Math.round(demandRatio * 1000) / 10,
      },
      factors: {
        freshnessPremium: Math.round(freshnessPremium * 1000) / 10,
        ratingPremium: Math.round(ratingPremium * 1000) / 10,
        organicPremium: Math.round(organicPremium * 1000) / 10,
        demandPremium: Math.round(demandPremium * 1000) / 10,
        seasonalFactor: Math.round(seasonalFactor * 1000) / 10,
        productRating: Math.round(avgRating * 10) / 10,
        freshnessScore: product.freshnessScore,
        isOrganic: product.isOrganic,
      },
      priceHistory: product.aiPriceHistory,
      calculatedAt: new Date().toISOString(),
      model: 'FarmSea-AI-Pricing-Mock-v1',
    });
  } catch (error) {
    console.error('[AI/PRICING] Error:', error);
    return NextResponse.json({ error: 'Failed to generate pricing analysis' }, { status: 500 });
  }
}
