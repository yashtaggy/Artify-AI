import * as functions from "firebase-functions/v1"; // Explicitly using V1
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

// Initialize Firebase Admin SDK
admin.initializeApp();

// --- Configuration ---
// Note: This uses the deprecated functions.config() API. Plan to migrate this
// to process.env secrets manager by March 2026.
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

// Create a mail transport object using Nodemailer
const mailTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: gmailEmail,
        pass: gmailPassword,
    },
});

// --- Cloud Function Trigger ---
/**
 * Cloud Function triggered when a new user is created in Firebase Auth.
 * This sends a personalized welcome email using Nodemailer.
 */
// TypeScript will infer the 'user' type correctly from functions.auth.user().onCreate
export const sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
    const email = user.email;
    const displayName = user.displayName || user.email?.split("@")[0] || "there";

    if (!email) {
        console.log("Skipping welcome email: User has no email address.");
        return null;
    }

    const mailOptions = {
        from: `Artify AI <${gmailEmail}>`,
        to: email,
        subject: "🎨 Welcome to Artify AI — Your Creative Partner Awaits!",
        html: `
            <div style="font-family: 'Inter', 'Segoe UI', sans-serif; padding: 20px; background-color: #f8f9fa; border-radius: 10px; max-width: 600px; margin: auto; border: 1px solid #e9ecef;">
                
                <!-- Header/Logo Section -->
                <div style="text-align: center; padding-bottom: 20px;">
                    <img src="https://raw.githubusercontent.com/yashtaggy/Artify-AI/main/public/logo.png" alt="Artify AI Logo" style="width: 80px; height: 80px; margin-bottom: 10px; border-radius: 50%; object-fit: cover;">
                    <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">Artify AI</h1>
                </div>

                <!-- Content Section -->
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
                    <h2 style="color: #343a40; font-size: 22px; margin-top: 0;">Hello ${displayName} 👋,</h2>
                    
                    <p style="color: #495057; line-height: 1.6;">
                        We're thrilled to have you join our community of passionate artisans. Artify AI helps you tell your story, find market trends, and grow your craft with the power of Artificial Intelligence.
                    </p>
                    
                    <p style="color: #495057; line-height: 1.6;">
                        Start by exploring features like 
                        <strong style="color: #6088FF;">Story Generator</strong>, 
                        <strong style="color: #6088FF;">Craft Score</strong>, and 
                        <strong style="color: #6088FF;">Ad Creatives</strong>.
                    </p>
                    
                    <!-- Call to Action Button -->
                    <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
                        <a href="https://artifyai-599463248805.asia-south1.run.app" style="display: inline-block; padding: 12px 25px; background-color: #FF2F92; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: background-color 0.2s;">
                            Explore Artify AI Now
                        </a>
                    </div>
                </div>

                <!-- Footer Section -->
                <div style="text-align: center; margin-top: 20px;">
                    <p style="font-size: 13px; color: #777;">
                        Thanks for joining us!
                        <br/>— The Artify AI Team
                    </p>
                </div>
            </div>
        `,
    };

    try {
        await mailTransport.sendMail(mailOptions);
        console.log("✅ Welcome email successfully sent to:", email);
    } catch (error) {
        console.error("❌ Error sending welcome email to", email, ":", error);
    }

    return null;
});
