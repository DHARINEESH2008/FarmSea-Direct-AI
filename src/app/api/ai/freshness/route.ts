import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/ai/freshness?productId=
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
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Mock AI freshness calculation
    const now = new Date();
    const harvestCatchTime = product.harvestDate || product.catchDate || new Date(now.getTime() - 12 * 60 * 60 * 1000);
    const hoursSinceHarvest = (now.getTime() - harvestCatchTime.getTime()) / (1000 * 60 * 60);

    // Simulate storage temp (mock)
    const storageTemp = product.storageTemp || (product.category.includes('FISH') ? 2.5 : 25);

    // Simulate distance
    const distanceKm = 15 + Math.random() * 45; // 15-60km

    // Mock degradation calculation
    const baseDegradationPerHour = product.category.includes('FISH') ? 1.8 : 0.8;
    const tempFactor = storageTemp > 10 ? 1.5 : 0.7;
    const degradationRate = baseDegradationPerHour * tempFactor;
    const currentFreshness = Math.max(0, Math.min(100, 100 - degradationRate * hoursSinceHarvest));

    // Freshness grade
    let grade: string;
    let gradeColor: string;
    if (currentFreshness >= 90) { grade = 'A+'; gradeColor = '#22c55e'; }
    else if (currentFreshness >= 80) { grade = 'A'; gradeColor = '#4ade80'; }
    else if (currentFreshness >= 70) { grade = 'B+'; gradeColor = '#a3e635'; }
    else if (currentFreshness >= 60) { grade = 'B'; gradeColor = '#facc15'; }
    else if (currentFreshness >= 45) { grade = 'C'; gradeColor = '#f97316'; }
    else { grade = 'D'; gradeColor = '#ef4444'; }

    // Time remaining
    const timeToGradeC = currentFreshness > 60 ? (currentFreshness - 60) / degradationRate : 0;
    const timeToExpiry = currentFreshness / degradationRate;

    // Recommendation
    let recommendation: string;
    if (currentFreshness >= 85) {
      recommendation = 'Excellent freshness! Perfect for immediate consumption or delivery.';
    } else if (currentFreshness >= 70) {
      recommendation = 'Good freshness. Should be consumed within 12 hours for best quality.';
    } else if (currentFreshness >= 55) {
      recommendation = 'Moderate freshness. Recommend fast delivery and immediate use. Consider discounting.';
    } else {
      recommendation = 'Low freshness. Not recommended for delivery. Consider circular economy listing.';
    }

    // Log the freshness calculation
    await db.aiFreshnessLog.create({
      data: {
        productId,
        harvestCatchTime,
        storageTemp,
        storageDurationHours: Math.round(hoursSinceHarvest * 10) / 10,
        distanceKm: Math.round(distanceKm * 10) / 10,
        freshnessScore: Math.round(currentFreshness * 10) / 10,
        degradationRate: Math.round(degradationRate * 100) / 100,
        recommendation,
      },
    });

    return NextResponse.json({
      success: true,
      productId,
      productName: product.name,
      category: product.category,
      freshnessAnalysis: {
        score: Math.round(currentFreshness * 10) / 10,
        grade,
        gradeColor,
        hoursSinceHarvest: Math.round(hoursSinceHarvest * 10) / 10,
        storageTemp,
        distanceKm: Math.round(distanceKm * 10) / 10,
        degradationRate: Math.round(degradationRate * 100) / 100,
        estimatedHoursToGradeC: Math.round(timeToGradeC),
        estimatedHoursToExpiry: Math.round(timeToExpiry),
        recommendation,
      },
      calculatedAt: new Date().toISOString(),
      model: 'FarmSea-AI-Freshness-Mock-v1',
    });
  } catch (error) {
    console.error('[AI/FRESHNESS] Error:', error);
    return NextResponse.json({ error: 'Failed to analyze freshness' }, { status: 500 });
  }
}
