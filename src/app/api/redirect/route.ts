import { NextRequest, NextResponse } from 'next/server';
import { processUserLink } from '@/lib/linkEngine';
import { RoutingMode } from '@/config/storeConfig';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const utmContent = searchParams.get('utm_content');
  const rawUrlParam = searchParams.get('url');
  const userId = searchParams.get('uid') || 'usr_anonymous';
  const mode = (searchParams.get('mode') as RoutingMode) || undefined;

  let originalUrl = '';
  if (utmContent) {
    try {
      originalUrl = Buffer.from(utmContent, 'base64').toString('utf-8');
    } catch {
      originalUrl = utmContent;
    }
  } else if (rawUrlParam) {
    originalUrl = rawUrlParam;
  }

  if (!originalUrl) {
    return NextResponse.json({ error: 'Missing destination URL parameter' }, { status: 400 });
  }

  const result = processUserLink(originalUrl, userId, 2499, mode);

  if (!result) {
    // If not a recognized store, redirect to original URL directly
    return NextResponse.redirect(originalUrl, { status: 307 });
  }

  // In a production database (Supabase/PostgreSQL), we would execute:
  // await db.clicks.insert({ userId, store: result.storeKey, url: result.finalAffiliateUrl, timestamp: new Date() });
  console.log(`[⚡ GetBachat Redirect Log] User: ${userId} -> Store: ${result.storeName} (${result.routingModeUsed} Mode)`);
  console.log(`[🎯 Cloaked Destination]: ${result.finalAffiliateUrl}`);

  // Perform Server-Side HTTP 307 Redirect to bypass ad-blockers!
  return NextResponse.redirect(result.finalAffiliateUrl, { status: 307 });
}
