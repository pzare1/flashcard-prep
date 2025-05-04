import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import QuestionGroup from '../../../../models/questionGroup';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Get all question groups for the user
    const questionGroups = await QuestionGroup.find({ 
      userId: userId,
      completed: false // Only get incomplete groups
    }).sort({ lastAccessedAt: -1 });
    
    return NextResponse.json(questionGroups);
  } catch (error) {
    console.error('Error fetching question groups:', error);
    return NextResponse.json({ error: 'Failed to fetch question groups' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { name, field, subField, questions } = await req.json();
    
    if (!name || !field || !subField || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    const newQuestionGroup = new QuestionGroup({
      userId: userId,
      name,
      field,
      subField,
      questions,
      currentIndex: 0,
      scores: [],
      completed: false
    });
    
    await newQuestionGroup.save();
    
    return NextResponse.json(newQuestionGroup);
  } catch (error) {
    console.error('Error creating question group:', error);
    return NextResponse.json({ error: 'Failed to create question group' }, { status: 500 });
  }
} 