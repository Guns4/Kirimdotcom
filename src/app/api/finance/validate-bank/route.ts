import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { bank_code, account_number } = await request.json();

  if (!bank_code || !account_number) {
    return NextResponse.json({ error: 'Missing bank_code or account_number' }, { status: 400 });
  }

  try {
    // MOCK VALIDATION LOGIC
    // In Prod: Call Xendit / Flip / Midtrans Disbursement API
    // e.g. await xendit.disbursement.getBankAccount({ bank_code, account_number });

    let mockName = '';

    // Simulate behavior
    if (Object.keys(MOCK_DB).includes(account_number)) {
      mockName = MOCK_DB[account_number];
    } else {
      // Random realistic name if not in mock db
      mockName = 'BUDI SANTOSO';
    }

    // Return the name for User Confirmation
    return NextResponse.json({
      status: 'success',
      account_name: mockName,
      bank_code,
      account_number,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

const MOCK_DB: Record<string, string> = {
  '1234567890': 'AHMAD DANI',
  '0987654321': 'SITI AMINAH',
  '1122334455': 'PT SINAR JAYA',
};
