import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aninovuz-backend.xudoyqulovabdulaziz08.workers.dev';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = searchParams.get('limit') || '40';

  // Kamida 1 ta harf bo'lishi shart, bo'lmasa bo'sh qaytaramiz
  if (!q.trim()) {
    return NextResponse.json({ success: true, data: [], meta: { total: 0 } });
  }

  const backendUrl = `${BACKEND_URL}/api/anime/search?q=${encodeURIComponent(q.trim())}&limit=${limit}`;

  try {
    const res = await fetch(backendUrl, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 }, // 60 soniya kesh
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, data: [], message: 'Backend xatosi' },
        { status: res.status }
      );
    }

    const json = await res.json();
    // Backend response: { success, meta, query, count, data: [...] }
    return NextResponse.json({
      success: true,
      data: json.data || [],
      meta: json.meta || {},
      count: json.count || 0,
      query: json.query || q,
    });
  } catch (err) {
    console.error('[Search Proxy] Error:', err);
    return NextResponse.json(
      { success: false, data: [], message: 'Tarmoq xatosi' },
      { status: 500 }
    );
  }
}

