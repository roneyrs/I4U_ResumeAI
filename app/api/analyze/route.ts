import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const maxDuration = 300; // Increase timeout to 5 minutes

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get('prompt');
  const apiKey = req.headers.get('x-api-key')?.trim();

  console.log(`[Proxy] Received request. Prompt: ${prompt?.substring(0, 50)}...`);

  if (!apiKey) {
    console.error('[Proxy] Missing API Key');
    return NextResponse.json({ error: 'API Key is required' }, { status: 400 });
  }

  try {
    const body = await req.arrayBuffer();
    console.log(`[Proxy] Body size: ${body.byteLength} bytes`);
    
    if (body.byteLength === 0 && !prompt?.includes('test_connection')) {
      console.warn('[Proxy] Warning: Empty body received');
    }

    const targetUrl = new URL("https://api.i4uai.com/resume/analisar_curriculo");
    if (prompt) targetUrl.searchParams.append('prompt', prompt);

    console.log(`[Proxy] Forwarding to: ${targetUrl.toString()}`);

    let response;
    let retries = 2;
    
    while (retries >= 0) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout per attempt

        response = await fetch(targetUrl.toString(), {
          method: 'POST',
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/pdf",
          },
          body: Buffer.from(body),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        break; // Success, exit loop
      } catch (e: any) {
        if (retries === 0) throw e;
        console.warn(`[Proxy] Fetch failed, retrying... (${retries} left). Error: ${e.message}`);
        retries--;
        await new Promise(r => setTimeout(r, 2000)); // Wait 2s before retry
      }
    }

    if (!response) throw new Error("Failed to get response from I4U API");

    console.log(`[Proxy] I4U API Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Proxy] I4U API Error: ${errorText}`);
      return NextResponse.json(
        { error: errorText || `API returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Proxy] Success');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Proxy] Fatal Error:', error.message);
    return NextResponse.json(
      { 
        error: error.name === 'TimeoutError' ? 'A API da I4U demorou muito para responder.' : error.message,
        details: error.stack
      },
      { status: error.name === 'TimeoutError' ? 504 : 500 }
    );
  }
}
