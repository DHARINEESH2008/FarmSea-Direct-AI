import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { VerificationStatus } from '@prisma/client';

// GET /api/admin?type=users|analytics|warnings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'users';

    switch (type) {
      case 'users':
        return handleGetUsers(searchParams);
      case 'analytics':
        return handleAnalytics();
      case 'warnings':
        return handleWarnings(searchParams);
      default:
        return NextResponse.json(
          { error: 'Invalid type. Use users, analytics, or warnings' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[ADMIN] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
}

async function handleGetUsers(searchParams: URLSearchParams) {
  const role = searchParams.get('role');
  const status = searchParams.get('status');

  const where: Record<string, unknown> = {};

  if (role) {
    where.role = role as never;
  }

  // Build user query
  const users = await db.user.findMany({
    where,
    include: {
      customerProfile: true,
      farmerProfile: true,
      fisherProfile: true,
      deliveryProfile: true,
      adminProfile: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Apply status filter on profile if provided
  let filtered = users;
  if (status) {
    filtered = users.filter((u) => {
      const profile =
        u.farmerProfile ||
        u.fisherProfile ||
        u.deliveryProfile ||
        u.customerProfile;
      if (!profile) return false;
      const vs = (profile as { verificationStatus?: string }).verificationStatus;
      return vs === status;
    });
  }

  // Format response
  const formattedUsers = filtered.map((u) => {
    const { passwordHash, ...userWithoutPassword } = u;
    const profile =
      u.role === 'CUSTOMER'
        ? u.customerProfile
        : u.role === 'FARMER'
          ? u.farmerProfile
          : u.role === 'FISHER'
            ? u.fisherProfile
            : u.role === 'DELIVERY'
              ? u.deliveryProfile
              : u.adminProfile;
    return { ...userWithoutPassword, profile };
  });

  return NextResponse.json({
    success: true,
    users: formattedUsers,
    total: formattedUsers.length,
  });
}

async function handleAnalytics() {
  const [totalUsers, totalOrders, totalProducts, totalBookings] = await Promise.all([
    db.user.count(),
    db.order.count(),
    db.product.count(),
    db.booking.count(),
  ]);

  // Revenue from completed orders
  const orderRevenue = await db.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: 'DELIVERED' },
  });

  // Users by role
  const usersByRole = await db.user.groupBy({
    by: ['role'],
    _count: true,
  });

  // Orders by status
  const ordersByStatus = await db.order.groupBy({
    by: ['status'],
    _count: true,
  });

  // Products by category (top 10)
  const productsByCategory = await db.product.groupBy({
    by: ['category'],
    _count: true,
    _sum: { soldCount: true },
    orderBy: { _count: { id: 'desc' } },
    take: 15,
  });

  // Recent orders (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentOrders = await db.order.count({
    where: { createdAt: { gte: sevenDaysAgo } },
  });

  const revenue = orderRevenue._sum.totalAmount || 0;

  return NextResponse.json({
    success: true,
    analytics: {
      totalUsers,
      totalOrders,
      totalRevenue: Math.round(revenue * 100) / 100,
      totalProducts,
      totalBookings,
      recentOrders, // last 7 days
      usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count })),
      ordersByStatus: ordersByStatus.map((r) => ({ status: r.status, count: r._count })),
      productsByCategory: productsByCategory.map((r) => ({
        category: r.category,
        count: r._count,
        totalSold: r._sum.soldCount || 0,
      })),
    },
  });
}

async function handleWarnings(searchParams: URLSearchParams) {
  const fisherId = searchParams.get('fisherId');

  const where: Record<string, string> = {};
  if (fisherId) where.fisherId = fisherId;

  const warnings = await db.fisherWarning.findMany({
    where,
    include: {
      fisher: {
        include: {
          user: { select: { id: true, name: true, phone: true, avatar: true } },
        },
      },
    },
    orderBy: { issuedAt: 'desc' },
  });

  // Also get active suspensions
  const suspensions = await db.fisherSuspension.findMany({
    where: {
      ...where,
      isActive: true,
    },
    include: {
      fisher: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { suspensionStart: 'desc' },
  });

  // Warning statistics
  const warningStats = {
    total: warnings.length,
    bySeverity: {
      LOW: warnings.filter((w) => w.severity === 'LOW').length,
      MEDIUM: warnings.filter((w) => w.severity === 'MEDIUM').length,
      HIGH: warnings.filter((w) => w.severity === 'HIGH').length,
      CRITICAL: warnings.filter((w) => w.severity === 'CRITICAL').length,
    },
    acknowledged: warnings.filter((w) => w.acknowledgedAt !== null).length,
    unacknowledged: warnings.filter((w) => w.acknowledgedAt === null).length,
    activeSuspensions: suspensions.length,
  };

  return NextResponse.json({
    success: true,
    warnings,
    activeSuspensions: suspensions,
    stats: warningStats,
  });
}

// PATCH /api/admin — verify/reject user
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId and action are required' },
        { status: 400 }
      );
    }

    const validActions = ['verify', 'reject', 'suspend', 'activate'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        farmerProfile: true,
        fisherProfile: true,
        deliveryProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let newStatus: VerificationStatus;
    switch (action) {
      case 'verify':
        newStatus = VerificationStatus.VERIFIED;
        break;
      case 'reject':
        newStatus = VerificationStatus.REJECTED;
        break;
      case 'suspend':
        newStatus = VerificationStatus.SUSPENDED;
        break;
      case 'activate':
        newStatus = VerificationStatus.VERIFIED;
        break;
    }

    let updatedUser;

    if (user.farmerProfile) {
      updatedUser = await db.farmerProfile.update({
        where: { userId },
        data: { verificationStatus: newStatus },
      });
    } else if (user.fisherProfile) {
      updatedUser = await db.fisherProfile.update({
        where: { userId },
        data: { verificationStatus: newStatus },
      });
    } else if (user.deliveryProfile) {
      updatedUser = await db.deliveryProfile.update({
        where: { userId },
        data: { isAvailable: action === 'suspend' ? false : true },
      });
    } else {
      return NextResponse.json(
        { error: 'User does not have a verifiable profile' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${action}d successfully`,
      updatedProfile: updatedUser,
    });
  } catch (error) {
    console.error('[ADMIN] PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
  }
}
