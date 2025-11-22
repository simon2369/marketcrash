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
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;
    const status = searchParams.get('status'); // Filter by status
    const type = searchParams.get('type'); // Filter by type

    // Build query with filters
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (type) {
      whereClause += ` AND type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }

    // Get newsletters
    const result = await db.query(
      `SELECT id, title, type, status, scheduled_for, sent_at, 
              created_by, created_at, updated_at
       FROM newsletters
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) as count FROM newsletters ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].count, 10);

    return NextResponse.json({
      newsletters: result.rows,
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
    console.error('Admin newsletters error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletters' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);

    const body = await req.json();
    const { title, content, type, status, scheduled_for, created_by } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const result = await db.query(
      `INSERT INTO newsletters (title, content, type, status, scheduled_for, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, type, status, scheduled_for, created_at, updated_at`,
      [title, content, type || null, status || 'draft', scheduled_for || null, created_by || null]
    );

    return NextResponse.json({
      message: 'Newsletter created successfully',
      newsletter: result.rows[0],
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin create newsletter error:', error);
    return NextResponse.json(
      { error: 'Failed to create newsletter' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    requireAdmin(req);

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Newsletter ID is required' },
        { status: 400 }
      );
    }

    // Build update query dynamically
    const allowedFields = ['title', 'content', 'type', 'status', 'scheduled_for'];

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
      `UPDATE newsletters 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, title, type, status, scheduled_for, sent_at, 
                 created_at, updated_at`,
      updateValues
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Newsletter updated successfully',
      newsletter: result.rows[0],
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin update newsletter error:', error);
    return NextResponse.json(
      { error: 'Failed to update newsletter' },
      { status: 500 }
    );
  }
}

