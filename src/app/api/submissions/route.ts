import { NextResponse } from 'next/server';
import { createSubmission, getSubmissionByReferenceId } from '@/lib/actions/submissions';

// Menggunakan server action yang sudah dibuat untuk Supabase
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Gunakan server action yang sudah ada
    const result = await createSubmission(formData);
    
    if (result.success) {
      return NextResponse.json({ success: true, referenceId: result.referenceId }, { status: 201 });
    } else {
      return NextResponse.json({ success: false, message: result.error }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    } else {
      return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
    }
  }
}

// GET handler untuk mendapatkan submission berdasarkan query parameter referenceId
export async function GET(request: Request) {
  try {
    // Ambil referenceId dari URL query parameters
    const { searchParams } = new URL(request.url);
    const referenceId = searchParams.get('referenceId');
    
    if (!referenceId) {
      return NextResponse.json({ message: 'Reference ID is required' }, { status: 400 });
    }
    
    // Gunakan server action yang sudah ada
    const result = await getSubmissionByReferenceId(referenceId);
    
    if (result.success) {
      return NextResponse.json({ success: true, submission: result.submission });
    } else {
      return NextResponse.json({ success: false, message: result.error }, { status: 404 });
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    } else {
      return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
