import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole, VerificationStatus } from '@prisma/client';

// POST /api/auth — login or register based on body.action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'login') {
      return handleLogin(body);
    } else if (action === 'register') {
      return handleRegister(body);
    }

    return NextResponse.json({ error: 'Invalid action. Use "login" or "register".' }, { status: 400 });
  } catch (error) {
    console.error('[AUTH] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleLogin(body: Record<string, unknown>) {
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: email as string },
    include: {
      customerProfile: true,
      farmerProfile: true,
      fisherProfile: true,
      deliveryProfile: true,
      adminProfile: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // Demo: compare password to 'hashed_demo_password'
  if (password !== 'hashed_demo_password') {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // Update online status
  await db.user.update({
    where: { id: user.id },
    data: { isOnline: true, lastSeen: new Date() },
  });

  const profile = getProfile(user);

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      language: user.language,
      isOnline: true,
      lastSeen: new Date().toISOString(),
      createdAt: user.createdAt,
      profile,
    },
  });
}

async function handleRegister(body: Record<string, unknown>) {
  const { email, phone, password, name, role } = body;

  if (!email || !phone || !password || !name || !role) {
    return NextResponse.json(
      { error: 'email, phone, password, name, and role are required' },
      { status: 400 }
    );
  }

  const validRoles: string[] = ['CUSTOMER', 'FARMER', 'FISHER', 'DELIVERY'];
  if (!validRoles.includes(role as string)) {
    return NextResponse.json(
      { error: `Role must be one of: ${validRoles.join(', ')}` },
      { status: 400 }
    );
  }

  const existing = await db.user.findFirst({
    where: {
      OR: [{ email: email as string }, { phone: phone as string }],
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: 'A user with this email or phone already exists' },
      { status: 409 }
    );
  }

  const userRole = role as UserRole;

  const userData: Record<string, unknown> = {
    email: email as string,
    phone: phone as string,
    passwordHash: 'hashed_demo_password',
    name: name as string,
    role: userRole,
  };

  let profileData: Record<string, unknown> | null = null;

  if (userRole === 'CUSTOMER') {
    profileData = {
      customerProfile: {
        create: {
          addressLine1: (body.addressLine1 as string) || 'Not provided',
          city: (body.city as string) || 'Chennai',
          state: (body.state as string) || 'Tamil Nadu',
          pincode: (body.pincode as string) || '600001',
        },
      },
    };
  } else if (userRole === 'FARMER') {
    profileData = {
      farmerProfile: {
        create: {
          verificationStatus: VerificationStatus.PENDING,
          farmName: (body.farmName as string) || `${name}'s Farm`,
          farmAddress: (body.farmAddress as string) || 'Not provided',
          farmCity: (body.farmCity as string) || 'Chennai',
          farmState: (body.farmState as string) || 'Tamil Nadu',
          farmPincode: (body.farmPincode as string) || '600001',
        },
      },
    };
  } else if (userRole === 'FISHER') {
    profileData = {
      fisherProfile: {
        create: {
          verificationStatus: VerificationStatus.PENDING,
          boatName: (body.boatName as string) || null,
          boatNumber: (body.boatNumber as string) || null,
          boatType: (body.boatType as string) || null,
          fishingArea: (body.fishingArea as string) || null,
          harborAddress: (body.harborAddress as string) || 'Not provided',
          harborCity: (body.harborCity as string) || 'Chennai',
          harborState: (body.harborState as string) || 'Tamil Nadu',
          harborPincode: (body.harborPincode as string) || '600001',
        },
      },
    };
  } else if (userRole === 'DELIVERY') {
    profileData = {
      deliveryProfile: {
        create: {
          vehicleType: (body.vehicleType as string) || 'Bicycle',
          vehicleNumber: (body.vehicleNumber as string) || 'TMP-001',
          licenseNumber: (body.licenseNumber as string) || 'DL-000000',
          baseCity: (body.baseCity as string) || 'Chennai',
        },
      },
    };
  }

  const user = await db.user.create({
    data: {
      ...userData,
      ...profileData,
    } as never,
    include: {
      customerProfile: true,
      farmerProfile: true,
      fisherProfile: true,
      deliveryProfile: true,
      adminProfile: true,
    },
  });

  const profile = getProfile(user);

  return NextResponse.json(
    {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        language: user.language,
        isOnline: true,
        lastSeen: new Date().toISOString(),
        createdAt: user.createdAt,
        profile,
      },
    },
    { status: 201 }
  );
}

function getProfile(user: {
  role: string;
  customerProfile: { id: string; [key: string]: unknown } | null;
  farmerProfile: { id: string; [key: string]: unknown } | null;
  fisherProfile: { id: string; [key: string]: unknown } | null;
  deliveryProfile: { id: string; [key: string]: unknown } | null;
  adminProfile: { id: string; [key: string]: unknown } | null;
}) {
  switch (user.role) {
    case 'CUSTOMER':
      return user.customerProfile;
    case 'FARMER':
      return user.farmerProfile;
    case 'FISHER':
      return user.fisherProfile;
    case 'DELIVERY':
      return user.deliveryProfile;
    case 'ADMIN':
      return user.adminProfile;
    default:
      return null;
  }
}
