// supabase/functions/ai-insights/index.ts
// Deploy with: npx supabase functions deploy ai-insights
// Set secret with: npx supabase secrets set GEMINI_API_KEY=your-key-here

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { system, messages, max_tokens = 1500 } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response(
                JSON.stringify({ error: 'messages array is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const apiKey = Deno.env.get('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        // Convert chat messages to Gemini format
        const geminiContents = messages.map((msg: { role: string; content: string }) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        // Build the Gemini request
        const geminiPayload: Record<string, unknown> = {
            contents: geminiContents,
            generationConfig: {
                maxOutputTokens: max_tokens,
                temperature: 0.7,
            },
        };

        // Add system instruction if provided
        if (system) {
            geminiPayload.systemInstruction = {
                parts: [{ text: system }],
            };
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiPayload),
        });

        if (!geminiRes.ok) {
            const errBody = await geminiRes.text();
            throw new Error(`Gemini API ${geminiRes.status}: ${errBody}`);
        }

        const geminiData = await geminiRes.json();

        // Extract the text from Gemini's response
        const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

        // Return in the same shape the frontend expects: { content: [{ text }] }
        return new Response(JSON.stringify({ content: [{ text }] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return new Response(
            JSON.stringify({ error: message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
