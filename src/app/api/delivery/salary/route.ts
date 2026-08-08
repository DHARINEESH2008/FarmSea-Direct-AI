import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/delivery/salary?id=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id query param is required' },
        { status: 400 }
      );
    }

    const records = await db.deliverySalary.findMany({
      where: { deliveryPersonId: id },
      orderBy: { month: 'desc' },
    });

    const latestRecord = records[0] || null;

    const totalEarnings = records.reduce((s, r) => s + r.totalSalary, 0);
    const totalBaseSalary = records.reduce((s, r) => s + r.baseSalary, 0);
    const totalBonus = records.reduce((s, r) => s + r.performanceBonus + r.incentives, 0);
    const totalDeductions = records.reduce((s, r) => s + r.deductions, 0);

    return NextResponse.json({
      success: true,
      salaryRecords: records,
      latestRecord,
      summary: {
        totalMonths: records.length,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        totalBaseSalary: Math.round(totalBaseSalary * 100) / 100,
        totalBonus: Math.round(totalBonus * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        averageMonthlySalary: records.length > 0 ? Math.round((totalEarnings / records.length) * 100) / 100 : 0,
      },
    });
  } catch (error) {
    console.error('[DELIVERY/SALARY] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch salary data' }, { status: 500 });
  }
}
