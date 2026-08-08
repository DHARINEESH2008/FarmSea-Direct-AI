import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/ai/recommendations?userId=&type=nearest|cheapest|freshest|highest_rated
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'nearest';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query param is required' },
        { status: 400 }
      );
    }

    const validTypes = ['nearest', 'cheapest', 'freshest', 'highest_rated'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Get user's location for distance calculations
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { customerProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userLat = user.customerProfile?.latitude || 13.0827;
    const userLng = user.customerProfile?.longitude || 80.2707;

    // Fetch all active products with seller info
    const products = await db.product.findMany({
      where: { isActive: true },
      include: {
        reviews: { select: { rating: true } },
      },
    });

    // Get all sellers with their location
    const sellerIds = [...new Set(products.map((p) => p.sellerId))];
    const sellers = await db.user.findMany({
      where: { id: { in: sellerIds } },
      select: { id: true, name: true },
      include: {
        farmerProfile: { select: { latitude: true, longitude: true, farmCity: true } },
        fisherProfile: { select: { latitude: true, longitude: true, harborCity: true } },
      },
    });
    const sellerMap = new Map(sellers.map((s) => [s.id, s]));

    // Calculate AI scores for each product based on type
    const scored = products.map((p) => {
      const seller = sellerMap.get(p.sellerId);
      const sellerLat =
        seller?.farmerProfile?.latitude ||
        seller?.fisherProfile?.latitude ||
        userLat + (Math.random() - 0.5) * 0.2;
      const sellerLng =
        seller?.farmerProfile?.longitude ||
        seller?.fisherProfile?.longitude ||
        userLng + (Math.random() - 0.5) * 0.2;

      // Haversine distance (simplified)
      const latDiff = (sellerLat - userLat) * 111; // km per degree
      const lngDiff = (sellerLng - userLng) * 111 * Math.cos(userLat * (Math.PI / 180));
      const distanceKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0;

      const freshnessScore = p.freshnessScore || 50;

      let aiScore = 0;
      let scoreFactors: Record<string, number> = {};

      switch (type) {
        case 'nearest':
          // Score inversely proportional to distance (0-100)
          aiScore = Math.max(0, 100 - distanceKm * 2);
          scoreFactors = { distanceKm: Math.round(distanceKm * 10) / 10, proximityScore: Math.round(aiScore * 10) / 10 };
          break;

        case 'cheapest':
          // Normalize price: lower price = higher score
          const minPrice = Math.min(...products.map((pp) => pp.price));
          const maxPrice = Math.max(...products.map((pp) => pp.price));
          const priceRange = maxPrice - minPrice || 1;
          aiScore = 100 - ((p.price - minPrice) / priceRange) * 100;
          scoreFactors = { price: p.price, priceScore: Math.round(aiScore * 10) / 10, percentile: Math.round((1 - (p.price - minPrice) / priceRange) * 100) };
          break;

        case 'freshest':
          // Based on freshness score and time since harvest
          aiScore = freshnessScore;
          const hoursSinceHarvest = p.harvestDate
            ? (Date.now() - p.harvestDate.getTime()) / (1000 * 60 * 60)
            : p.catchDate
              ? (Date.now() - p.catchDate.getTime()) / (1000 * 60 * 60)
              : 24;
          scoreFactors = { freshnessScore, hoursSinceHarvest: Math.round(hoursSinceHarvest * 10) / 10, freshnessGrade: freshnessScore >= 90 ? 'A+' : freshnessScore >= 80 ? 'A' : freshnessScore >= 70 ? 'B+' : freshnessScore >= 60 ? 'B' : 'C' };
          break;

        case 'highest_rated':
          // Based on avg rating and review count
          const ratingScore = avgRating * 20; // 5*20 = 100
          const reviewBonus = Math.min(p.reviews.length * 2, 20); // Bonus for more reviews
          aiScore = ratingScore + reviewBonus;
          scoreFactors = { avgRating: Math.round(avgRating * 10) / 10, reviewCount: p.reviews.length, ratingScore: Math.round(ratingScore * 10) / 10, reviewBonus };
          break;
      }

      return {
        product: {
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          unit: p.unit,
          images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
          isOrganic: p.isOrganic,
          freshnessScore: p.freshnessScore,
          originLocation: p.originLocation,
          sellerName: seller?.name || 'Unknown',
        },
        aiScore: Math.round(aiScore * 10) / 10,
        scoreFactors,
      };
    });

    // Sort by AI score descending
    scored.sort((a, b) => b.aiScore - a.aiScore);

    // Take top 10
    const recommendations = scored.slice(0, 10);

    return NextResponse.json({
      success: true,
      type,
      userId,
      recommendations,
      total: recommendations.length,
      generatedAt: new Date().toISOString(),
      model: 'FarmSea-AI-Mock-v1',
    });
  } catch (error) {
    console.error('[AI/RECOMMENDATIONS] Error:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}
