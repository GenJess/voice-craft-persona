
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { base64Data, mimeType } = await req.json();

    if (!base64Data || !mimeType) {
      return new Response(JSON.stringify({ error: 'Missing base64Data or mimeType' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in Supabase secrets.');
    }

    // Make request to Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `You are an expert document analysis AI. Your task is to extract all text content from the provided document.
              Preserve the original formatting as much as possible, including:
              - Paragraphs and line breaks
              - Headings (if discernible, represent them clearly)
              - Lists (bulleted or numbered, preserve markers)
              - Tables (represent as formatted text)
              
              Output only the extracted text. Do not add any commentary.
              If the document appears to be empty or unreadable, respond with "[[EMPTY_OR_UNREADABLE_DOCUMENT]]".`
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const extractedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!extractedText) {
      throw new Error('No text extracted from document');
    }

    if (extractedText.trim() === "[[EMPTY_OR_UNREADABLE_DOCUMENT]]") {
      return new Response(JSON.stringify({ text: "The document appears to be empty or could not be read by the AI." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ text: extractedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
