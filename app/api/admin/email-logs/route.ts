import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Middleware for admin authentication
function requireAdmin(req: NextRequest): void {
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    throw new Error('Unauthorized');
  }
}

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;
    const status = searchParams.get('status'); // Filter by status
    const emailType = searchParams.get('email_type'); // Filter by email type
    const subscriberId = searchParams.get('subscriber_id'); // Filter by subscriber

    // Build query with filters
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (emailType) {
      whereClause += ` AND email_type = $${paramIndex}`;
      queryParams.push(emailType);
      paramIndex++;
    }

    if (subscriberId) {
      whereClause += ` AND subscriber_id = $${paramIndex}`;
      queryParams.push(subscriberId);
      paramIndex++;
    }

    // Get email logs with subscriber info
    const result = await db.query(
      `SELECT 
        el.id,
        el.subscriber_id,
        s.email,
        el.email_type,
        el.subject,
        el.status,
        el.mailgun_id,
        el.sent_at,
        el.opened_at,
        el.clicked_at,
        el.error_message
       FROM email_logs el
       LEFT JOIN subscribers s ON el.subscriber_id = s.id
       ${whereClause}
       ORDER BY el.sent_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) as count FROM email_logs ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].count, 10);

    return NextResponse.json({
      emailLogs: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin email logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email logs' },
      { status: 500 }
    );
  }
}

