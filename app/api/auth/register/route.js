import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword, createToken } from '@/lib/auth';
import { getCurrencyByCountry } from '@/lib/i18n';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const { email, password, country } = await request.json();
    
    if (!email || !password || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const db = await getDatabase();
    const users = db.collection('users');
    
    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }
    
    // Create new user
    const hashedPassword = await hashPassword(password);
    const currency = getCurrencyByCountry(country);
    const userId = uuidv4();
    
    const newUser = {
      user_id: userId,
      email,
      password: hashedPassword,
      country,
      currency,
      plan: 'free',
      evaluations_used: 0,
      evaluations_limit: 3,
      created_at: new Date(),
    };
    
    await users.insertOne(newUser);
    
    // Create token
    const token = await createToken({ userId, email });
    
    return NextResponse.json({
      token,
      user: {
        user_id: userId,
        email,
        country,
        currency,
        plan: 'free',
        evaluations_used: 0,
        evaluations_limit: 3,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}