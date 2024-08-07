// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from "https://esm.sh/@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    if (req.method === "POST") {
      const requestBody = await req.json();

      if (requestBody.hash) {
        const { error } = await supabaseClient.rpc("create_tables_for_user", {
          hash: `${requestBody.hash}`,
        });

        if (error) {
          throw error;
        }
      }

      return new Response(
        JSON.stringify({
          status: "success",
          code: 200,
          message: "",
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }
  } catch (error) {
    console.error(error);
    const errorCode = error.code ?? 500;
    const errorMessage = error.message;

    return new Response(
      JSON.stringify({
        status: "error",
        code: errorCode,
        message: errorMessage,
      }),
      {
        status: errorCode,
        headers: corsHeaders,
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-user-tables' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
