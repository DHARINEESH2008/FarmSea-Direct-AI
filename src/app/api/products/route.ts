import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sellerType = searchParams.get('sellerType');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy');

    const where: Prisma.ProductWhereInput = { isActive: true };

    if (category) {
      where.category = category as never;
    }

    if (sellerType) {
      where.sellerType = sellerType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {} as Prisma.FloatNullableFilter;
      if (minPrice) {
        (where.price as Prisma.FloatNullableFilter).gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        (where.price as Prisma.FloatNullableFilter).lte = parseFloat(maxPrice);
      }
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

    if (sortBy) {
      switch (sortBy) {
        case 'price_asc':
          orderBy = { price: 'asc' };
          break;
        case 'price_desc':
          orderBy = { price: 'desc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'popular':
          orderBy = { soldCount: 'desc' };
          break;
        case 'rating':
          // Sort by freshness score as a proxy for rating
          orderBy = { freshnessScore: 'desc' };
          break;
        case 'freshness':
          orderBy = { freshnessScore: 'desc' };
          break;
      }
    }

    // Get seller IDs first to resolve names
    const products = await db.product.findMany({
      where,
      orderBy,
      include: {
        reviews: {
          select: { rating: true },
        },
      },
    });

    // Get unique seller IDs
    const sellerIds = [...new Set(products.map((p) => p.sellerId))];
    const sellers = await db.user.findMany({
      where: { id: { in: sellerIds } },
      select: { id: true, name: true, role: true },
    });
    const sellerMap = new Map(sellers.map((s) => [s.id, s]));

    const productsWithSeller = products.map((p) => {
      const seller = sellerMap.get(p.sellerId);
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : null;
      const { reviews, ...productData } = p;
      return {
        ...productData,
        sellerName: seller?.name || 'Unknown Seller',
        sellerRole: seller?.role || null,
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        reviewCount: p.reviews.length,
        images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
        tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags,
      };
    });

    // Summary stats
    const summary = {
      total: productsWithSeller.length,
      categories: [...new Set(productsWithSeller.map((p) => p.category))],
      priceRange: {
        min: productsWithSeller.length > 0 ? Math.min(...productsWithSeller.map((p) => p.price)) : 0,
        max: productsWithSeller.length > 0 ? Math.max(...productsWithSeller.map((p) => p.price)) : 0,
      },
    };

    return NextResponse.json({
      success: true,
      products: productsWithSeller,
      summary,
    });
  } catch (error) {
    console.error('[PRODUCTS] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
