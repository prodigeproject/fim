import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ViewCountRequest {
  article_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get IP address for rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               req.headers.get("x-real-ip") ||
               req.headers.get("cf-connecting-ip") ||
               "unknown";

    const { article_id }: ViewCountRequest = await req.json();

    if (!article_id) {
      return new Response(
        JSON.stringify({ error: "article_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`View count request for article: ${article_id} from IP: ${ip}`);

    // Check if this IP has viewed this article recently (within 1 hour)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { data: existingView } = await supabase
      .from("article_view_tracking")
      .select("id, last_viewed")
      .eq("article_id", article_id)
      .eq("ip_address", ip)
      .maybeSingle();

    if (existingView) {
      const lastViewed = new Date(existingView.last_viewed);
      const now = new Date();
      const hoursSinceLastView = (now.getTime() - lastViewed.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastView < 1) {
        // Already viewed within the last hour, don't increment
        console.log(`View already counted for article ${article_id} from IP ${ip} within the last hour`);
        return new Response(
          JSON.stringify({ success: true, message: "View already counted recently" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Update the last viewed timestamp
      await supabase
        .from("article_view_tracking")
        .update({ last_viewed: now.toISOString() })
        .eq("id", existingView.id);
    } else {
      // Insert new tracking record
      await supabase
        .from("article_view_tracking")
        .insert({
          article_id,
          ip_address: ip,
          last_viewed: new Date().toISOString(),
        });
    }

    // Increment the view count
    const { error: updateError } = await supabase
      .from("articles")
      .update({ view_count: supabase.rpc("increment_view_count", { article_id }) })
      .eq("id", article_id);

    // Use RPC to increment (it's already created)
    const { error: rpcError } = await supabase.rpc("increment_view_count", { article_id });

    if (rpcError) {
      console.error("Error incrementing view count:", rpcError);
      // Don't fail the request, just log the error
    }

    console.log(`View count incremented for article: ${article_id}`);

    return new Response(
      JSON.stringify({ success: true, message: "View count incremented" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("View count error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Terjadi kesalahan" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
