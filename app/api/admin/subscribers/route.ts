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
    const verified = searchParams.get('verified'); // Filter by verified status
    const search = searchParams.get('search'); // Search by email

    // Build query with filters
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (verified !== null && verified !== undefined) {
      whereClause += ` AND verified = $${paramIndex}`;
      queryParams.push(verified === 'true');
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND email ILIKE $${paramIndex}`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Get subscribers with pagination
    const result = await db.query(
      `SELECT id, email, status, alert_subscription, newsletter_weekly, 
              newsletter_monthly, verified, created_at, updated_at, last_email_sent
       FROM subscribers
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) as count FROM subscribers ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].count, 10);

    return NextResponse.json({
      subscribers: result.rows,
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
    console.error('Admin subscribers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

// Update subscriber
export async function PATCH(req: NextRequest) {
  try {
    requireAdmin(req);

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Subscriber ID is required' },
        { status: 400 }
      );
    }

    // Build update query dynamically
    const allowedFields = [
      'status',
      'alert_subscription',
      'newsletter_weekly',
      'newsletter_monthly',
      'verified',
    ];

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (field in updates) {
        updateFields.push(`${field} = $${paramIndex}`);
        updateValues.push(updates[field]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Always update updated_at
    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const result = await db.query(
      `UPDATE subscribers 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, email, status, alert_subscription, newsletter_weekly, 
                 newsletter_monthly, verified, created_at, updated_at`,
      updateValues
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Subscriber updated successfully',
      subscriber: result.rows[0],
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin update subscriber error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscriber' },
      { status: 500 }
    );
  }
}

// Delete subscriber
export async function DELETE(req: NextRequest) {
  try {
    requireAdmin(req);

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Subscriber ID is required' },
        { status: 400 }
      );
    }

    const result = await db.query(
      'DELETE FROM subscribers WHERE id = $1 RETURNING id, email',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Subscriber deleted successfully',
      deleted: result.rows[0],
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin delete subscriber error:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}

