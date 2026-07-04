import { NextRequest, NextResponse } from 'next/server';

/**
 * Cuelinks / Admitad Webhook Handler
 * When an affiliate sale is confirmed, Cuelinks triggers a POST request to this endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Cuelinks typical webhook structure contains subid, commission, status, transaction_id
    const { 
      subid = "usr_demo_101", 
      commission = 150.00, 
      status = "confirmed", 
      store = "Amazon India",
      transaction_id = `txn_${Date.now()}`
    } = payload;

    // Calculate user's reward share (e.g., 60% of commission goes to user wallet as Bachat Coins)
    const userCoinsEarned = Math.round(Number(commission) * 0.60);

    console.log("==========================================");
    console.log("🔔 [GETBACHAT WEBHOOK ALERT] Sale Received!");
    console.log(`👤 User ID (Sub-ID): ${subid}`);
    console.log(`🛒 Store: ${store}`);
    console.log(`💰 Platform Commission: ₹${commission}`);
    console.log(`⚡ Bachat Coins Credited to User: ${userCoinsEarned} Coins`);
    console.log(`📌 Transaction ID: ${transaction_id} (${status})`);
    console.log("==========================================");

    // In production:
    // await db.transactions.insert({ userId: subid, store, commission, coins: userCoinsEarned, status });
    // await db.wallets.increment(subid, { pendingCoins: userCoinsEarned });

    return NextResponse.json({ 
      success: true, 
      message: `Credited ${userCoinsEarned} Bachat Coins to ${subid}`,
      transaction_id 
    }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "active", 
    message: "GetBachat Cuelinks Webhook Endpoint is ready to receive transaction postbacks." 
  });
}
