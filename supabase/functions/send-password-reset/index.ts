import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetEmailRequest {
  email: string;
  resetUrl: string;
  firstName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetUrl, firstName }: PasswordResetEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Mohallaa <security@resend.dev>",
      to: [email],
      subject: "Reset Your Mohallaa Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #ff6b6b, #ffd93d); width: 60px; height: 60px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; margin-bottom: 20px;">
              म
            </div>
            <h1 style="color: #333; margin: 0;">Password Reset Request</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-top: 0;">
              ${firstName ? `Hello ${firstName}!` : 'Hello!'}
            </h2>
            <p style="color: #666; line-height: 1.6;">
              We received a request to reset your password for your Mohallaa account. If you didn't make this request, you can safely ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #ff6b6b, #ffd93d); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Your Password
            </a>
            <p style="color: #666; font-size: 14px; margin-top: 15px;">
              This link will expire in 1 hour for security reasons
            </p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Security Tip:</strong> Never share your password with anyone. Mohallaa will never ask for your password via email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              Stay safe!<br>
              The Mohallaa Security Team
            </p>
          </div>
        </div>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
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