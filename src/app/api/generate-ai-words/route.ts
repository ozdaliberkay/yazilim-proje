import { NextResponse } from 'next/server';
import { generateAiWordsForUser } from '@/lib/actions';

export async function POST(request: Request) {

  const result = await generateAiWordsForUser();
  return NextResponse.json(result);
}
