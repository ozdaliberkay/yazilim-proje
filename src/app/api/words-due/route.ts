import { NextResponse } from 'next/server';
import { getWordsDueForTesting } from '@/lib/actions';

export async function GET() {
  try {
    const words = await getWordsDueForTesting();
    return NextResponse.json(words);
  } catch (error) {
    console.error('Error fetching words due for testing:', error);
    return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
  }
}
