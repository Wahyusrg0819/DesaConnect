import { NextResponse } from 'next/server';
import { getSubmissionByReferenceId } from '@/lib/actions/submissions';

export async function GET(
  request: Request,
  { params }: { params: { referenceId: string } }
) {
  const { referenceId } = params;

  try {
    // Gunakan server action Supabase
    const result = await getSubmissionByReferenceId(referenceId);

    if (!result.success || !result.submission) {
      return NextResponse.json(
        { message: result.error || 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, submission: result.submission });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { message: 'An unknown error occurred' },
        { status: 500 }
      );
    }
  }
}
