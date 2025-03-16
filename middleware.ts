// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware will run before any API route is executed
export function middleware(request: NextRequest) {
  // Log API request for debugging
  console.log(`${request.method} ${request.nextUrl.pathname}`);
  
  // Check if this is an API route
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Verify essential environment variables for API calls
    if (!process.env.GROQ_API_KEY && request.nextUrl.pathname === '/api/transcribe') {
      console.error('Missing GROQ_API_KEY environment variable');
      
      // For security, we don't expose which key is missing in the response
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
  }

  return NextResponse.next();
}

// Only run middleware on API routes
export const config = {
  matcher: '/api/:path*',
};