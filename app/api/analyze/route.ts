import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const maxDuration = 300; // 5 minutes

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prompt = searchParams.get('prompt');
    const apiKey = req.headers.get('x-api-key')?.trim();

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 400 });
    }

    const arrayBuffer = await req.arrayBuffer();
    const body = Buffer.from(arrayBuffer);
    const isTest = prompt === 'test_connection';

    const targetUrl = "https://api.i4uai.com/resume/analisar_curriculo";
    
    // Using axios for more robust body handling in Node
    const response = await axios.post(targetUrl, body, {
      params: { prompt },
      headers: {
        "x-api-key": apiKey,
        "Accept": "application/json",
        "Content-Type": "application/pdf",
      },
      // Important: validateStatus allows us to handle 400/401 gracefully
      validateStatus: () => true, 
      timeout: 240000, // 4 minutes
    });

    console.log(`[Proxy] I4U API Response Status: ${response.status}`);

    // If it's a test and we get 400, the key is valid but the body (0 bytes) was rejected
    if (isTest && response.status === 400) {
      return NextResponse.json({ message: 'Key validated' }, { status: 200 });
    }

    if (response.status >= 400) {
      return NextResponse.json(
        { 
          error: response.data?.error || response.data?.message || `API returned ${response.status}`,
          status: response.status 
        },
        { status: response.status === 401 || response.status === 403 ? response.status : 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('[Proxy Fatal Error]:', error.message);
    return NextResponse.json(
      { 
        error: error.code === 'ECONNABORTED' ? 'A API da I4U demorou muito para responder.' : error.message,
      },
      { status: error.code === 'ECONNABORTED' ? 504 : 500 }
    );
  }
}
