import { NextRequest, NextResponse } from 'next/server';

// AI endpoints dispatcher
// GET /api/ai/recommendations?userId=&type=
// GET /api/ai/freshness?productId=
// GET /api/ai/demand-prediction?category=
// GET /api/ai/pricing?productId=

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'AI API endpoints available:',
    endpoints: {
      recommendations: 'GET /api/ai/recommendations?userId=&type=nearest|cheapest|freshest|highest_rated',
      freshness: 'GET /api/ai/freshness?productId=',
      'demand-prediction': 'GET /api/ai/demand-prediction?category=',
      pricing: 'GET /api/ai/pricing?productId=',
    },
  });
}
