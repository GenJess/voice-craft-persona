
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import pdf from "https://esm.sh/pdf-parse@1.1.1";
import mammoth from "https://esm.sh/mammoth@1.7.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { resume_path, first_name, last_name, elevenlabs_api_key } = await req.json();

    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // 1. Download resume from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from("resumes")
      .download(resume_path);

    if (downloadError) throw downloadError;

    // 2. Extract text from resume file
    let resumeText = "";
    const fileBuffer = await fileData.arrayBuffer();

    if (resume_path.endsWith(".pdf")) {
      const pdfData = await pdf(new Uint8Array(fileBuffer));
      resumeText = pdfData.text;
    } else if (resume_path.endsWith(".docx")) {
      const { value } = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
      resumeText = value;
    } else if (resume_path.endsWith(".txt")) {
      resumeText = await fileData.text();
    } else {
      throw new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
    }
    
    if (!resumeText.trim()) {
      throw new Error("Could not extract text from the resume. Please ensure it's not an image-based file.");
    }

    // 3. Create ElevenLabs agent
    const agentName = `${first_name} ${last_name}'s Persona`;
    const agentPrompt = `You are a professional AI persona for ${first_name} ${last_name}. Your background, skills, and experience are based on the following resume:\n\n${resumeText}\n\nYou must answer questions as if you are ${first_name}, drawing upon the information provided in the resume. Be professional, engaging, and embody the persona of the individual from the resume.`;
    
    const createAgentResponse = await fetch("https://api.elevenlabs.io/v1/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json", "xi-api-key": elevenlabs_api_key },
        body: JSON.stringify({
            agent_name: agentName,
            agent_description: `An AI-powered professional persona for ${first_name} ${last_name}.`,
            prompt: agentPrompt,
            initial_message: `Hello, this is the AI persona for ${first_name} ${last_name}. How can I assist you today?`,
            voice_id: "pFZP5JQG7iQjIQuC4Bku", // Using "Lily" as a default voice
        }),
    });

    if (!createAgentResponse.ok) {
        const errorBody = await createAgentResponse.text();
        console.error("ElevenLabs Agent Creation Error:", errorBody);
        throw new Error(`Failed to create ElevenLabs agent. Status: ${createAgentResponse.status}`);
    }
    
    const agentData = await createAgentResponse.json();
    const agent_id = agentData.agent_id;

    // 4. Get the conversation signed URL
    const getSignedUrlResponse = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agent_id}`, {
        headers: { "xi-api-key": elevenlabs_api_key },
    });

    if (!getSignedUrlResponse.ok) {
        const errorBody = await getSignedUrlResponse.text();
        console.error("ElevenLabs Signed URL Error:", errorBody);
        throw new Error(`Failed to get agent conversation link. Status: ${getSignedUrlResponse.status}`);
    }

    const signedUrlData = await getSignedUrlResponse.json();
    const conversation_link = signedUrlData.signed_url;

    return new Response(JSON.stringify({ agent_id, conversation_link }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in create-agent function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
