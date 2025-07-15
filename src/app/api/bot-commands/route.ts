
import { NextResponse } from 'next/server';

/**
 * Handles GET requests from the MT5 Expert Advisor.
 * The EA sends its API key as a query parameter.
 * 
 * In a real application, you would:
 * 1. Validate the API key against a user database.
 * 2. Look up pending commands for that user.
 * 3. Return the commands as a JSON response.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('key');

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is missing' }, { status: 401 });
  }

  // --- Mock Implementation ---
  // In a real app, you would fetch commands from your database based on the apiKey.
  // For now, we'll return an empty command list to show the connection works.
  console.log(`Received request from EA with key: ${apiKey}`);

  const mockCommands = [
    // Example command structure:
    // { action: 'UPDATE_SL', botId: 'bot1', value: 1500 },
    // { action: 'LAUNCH_BOT', pair: 'EURUSD', settings: { ... } }
  ];

  return NextResponse.json({ 
    status: 'ok',
    commands: mockCommands 
  });
}
