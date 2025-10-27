import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Welcome to ArtifyAI 🎨",
      html: `
        <div style="font-family: Arial, sans-serif; background-color:#f7f7f7; padding:30px;">
          <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:10px;">
            <img 
              src="https://raw.githubusercontent.com/yashtaggy/Artify-AI/main/public/logo.png" 
              alt="ArtifyAI Logo" 
              width="100" 
              style="display:block; margin:0 auto 20px;" 
            />
            <h2 style="text-align:center; color:#333;">Welcome to <span style="color:#6c63ff;">ArtifyAI</span>!</h2>
            <p>Hey ${name || "Creator"},</p>
            <p>We’re thrilled to have you onboard 🎉</p>
            <p>With <strong>ArtifyAI</strong>, you can:</p>
            <ul>
              <li>✨ Generate unique, AI-powered craft stories</li>
              <li>📸 Analyze your creations and get a Craft Score</li>
              <li>💡 Receive tips to improve creativity and sustainability</li>
              <li>📈 Track and showcase your artistic journey</li>
            </ul>
            <p>We can’t wait to see what you create!</p>
            <p>— The ArtifyAI Team</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error });
  }
}
