import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import QuestionGroup from '../../../../../models/questionGroup';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await connectToDatabase();
    
    const questionGroup = await QuestionGroup.findOne({ 
      _id: id,
      userId: userId
    });
    
    if (!questionGroup) {
      return NextResponse.json({ error: 'Question group not found' }, { status: 404 });
    }
    
    // Update the lastAccessedAt field
    questionGroup.lastAccessedAt = new Date();
    await questionGroup.save();
    
    return NextResponse.json(questionGroup);
  } catch (error) {
    console.error('Error fetching question group:', error);
    return NextResponse.json({ error: 'Failed to fetch question group' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { currentIndex, scores, completed } = await req.json();
    
    await connectToDatabase();
    
    const questionGroup = await QuestionGroup.findOne({ 
      _id: id,
      userId: userId
    });
    
    if (!questionGroup) {
      return NextResponse.json({ error: 'Question group not found' }, { status: 404 });
    }
    
    // Update fields if provided
    if (currentIndex !== undefined) questionGroup.currentIndex = currentIndex;
    if (scores !== undefined) questionGroup.scores = scores;
    if (completed !== undefined) questionGroup.completed = completed;
    
    // Always update lastAccessedAt
    questionGroup.lastAccessedAt = new Date();
    
    await questionGroup.save();
    
    return NextResponse.json(questionGroup);
  } catch (error) {
    console.error('Error updating question group:', error);
    return NextResponse.json({ error: 'Failed to update question group' }, { status: 500 });
  }
} 