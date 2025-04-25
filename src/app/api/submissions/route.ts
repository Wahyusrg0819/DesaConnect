import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Submission from '@/models/Submission';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const formData = await request.formData();

    const name = formData.get('name') as string | null;
    const contactInfo = formData.get('contactInfo') as string | null;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    // Note: File handling is not implemented in this basic version
    const file = formData.get('file') as File | null;

    if (!category || !description) {
        return NextResponse.json({ message: 'Category and description are required' }, { status: 400 });
    }

    const submission = await Submission.create({
      name: name,
      contactInfo: contactInfo,
      category: category,
      description: description,
      // file: file // You would handle file storage separately
    });

    // Return the created submission, including the generated referenceId
    return NextResponse.json({ success: true, referenceId: submission.referenceId }, { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    } else {
      return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
