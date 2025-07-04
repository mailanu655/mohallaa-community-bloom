import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  verificationUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, verificationUrl }: WelcomeEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Mohallaa <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Mohallaa - Your Indian Community Awaits!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #ff6b6b, #ffd93d); width: 60px; height: 60px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; margin-bottom: 20px;">
              म
            </div>
            <h1 style="color: #333; margin: 0;">Welcome to Mohallaa!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-top: 0;">Namaste ${firstName}!</h2>
            <p style="color: #666; line-height: 1.6;">
              We're thrilled to have you join the Mohallaa community! Connect with fellow Indians across America, share your stories, and build meaningful relationships.
            </p>
          </div>
          
          ${verificationUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #ff6b6b, #ffd93d); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Verify Your Email
              </a>
              <p style="color: #666; font-size: 14px; margin-top: 15px;">
                Please verify your email address to complete your registration
              </p>
            </div>
          ` : ''}
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <h3 style="color: #333;">What's next?</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Complete your profile to connect with your community</li>
              <li>Join discussions and share your experiences</li>
              <li>Discover local events and meetups</li>
              <li>Find mentorship opportunities</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              Welcome to your new community!<br>
              The Mohallaa Team
            </p>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);