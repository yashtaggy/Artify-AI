# 🎨 Artify AI — CraftGenie

> **AI-Powered Marketplace Assistant for Local Artisans**

CraftGenie is an **AI-driven platform** designed to empower **local artisans** to market their craft, tell their stories, and expand their reach to digital audiences. The platform combines **Google Gemini 2.5 (Flash & Pro)**, **Cohere Command-R**, and **Hugging Face BERT** models to generate creative stories, identify trends, optimize craft pricing, and produce engaging ad creatives.

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-success)

## 📋 Table of Contents
- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Team](#-team)
- [License](#-license)

## 🧩 Problem Statement

**Many talented artisans struggle with:**
- 📱 Digital marketing and online presence
- 📖 Compelling storytelling about their craft
- 💰 Optimal pricing strategies
- 🔍 Market trend identification
- 🎬 Creating engaging ad content

**CraftGenie Solution:**
Bridges this gap by providing **AI-powered storytelling, trend analysis, pricing optimization, and creative assistance** in one simple, user-friendly platform.

## 🚀 Features

### 🧵 Story Generator
- **AI-Powered Storytelling**: Generate captivating narratives using Gemini 2.5 Flash/Pro
- **Provenance Cards**: Automatic creation with product details, origin, and artisan story
- **Multimodal Input**: Support for text + image inputs
- **Export Options**: Download or save stories to personal library

### 📈 Trends Finder
- **Market Analysis**: Identify emerging craft styles using Cohere embeddings
- **Keyword Suggestions**: Popular tags, colors, and materials
- **Regional Insights**: Location-based trend discovery
- **Competitive Intelligence**: Stay ahead of market demands

### 💰 Craft Score & Pricing
- **Smart Pricing**: Optimized pricing based on multiple factors:
  - Product image analysis
  - Material costs
  - Time investment
  - Energy consumption
- **Sustainability Scoring**: Eco-friendliness evaluation using Hugging Face BERT
- **Profit Optimization**: AI suggestions for margin improvement

### 🎥 Ad Creatives Generator
- **Multi-Platform Support**: Content for YouTube Shorts, Instagram Reels, Facebook Ads
- **Storyboard Creation**: Scene-by-scene visual planning
- **Copy Generation**: Headlines, captions, and CTAs using Gemini Pro
- **Brand Consistency**: Maintain cohesive brand identity across platforms

### 📚 My Library
- **Centralized Storage**: Save and manage all generated content
- **Performance Tracking**: Monitor engagement and effectiveness
- **Easy Sharing**: Download and share assets directly
- **Organization**: Categorize by project type and date

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Animations**: Framer Motion
- **Icons**: Lucide Icons

### Backend & AI
- **Runtime**: Node.js
- **AI Models**: 
  - Google Gemini 2.5 (Flash & Pro)
  - Cohere Command-R
  - Hugging Face BERT
- **APIs**: Next.js API Routes

### Database & Infrastructure
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Serverless**: Firebase Cloud Functions
- **Deployment**: Firebase Hosting

## 📥 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account
- AI API keys (Gemini, Cohere, Hugging Face)

### Step-by-Step Setup

1. **Clone the repository**
```bash
git clone https://github.com/tanmaykhedekar/craftgenie.git
cd craftgenie
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

4. **Configure Firebase**
```bash
npm install -g firebase-tools
firebase login
firebase init
```

5. **Run development server**
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## ⚙️ Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI API Keys
GEMINI_API_KEY=your_gemini_api_key
COHERE_API_KEY=your_cohere_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### Firebase Setup
1. Create a new Firebase project
2. Enable Authentication (Email/Password)
3. Set up Firestore Database
4. Configure Storage Bucket
5. Enable Cloud Functions (if needed)

## 🎯 Usage

### For Artisans
1. **Sign Up**: Create an artisan account
2. **Profile Setup**: Complete your profile and craft details
3. **Generate Content**: Use AI tools for stories, pricing, and ads
4. **Manage Library**: Save and organize your generated assets
5. **Export & Share**: Download content for your platforms

### For Developers
```typescript
// Example: Generating a product story
import { generateProductStory } from '@/src/ai/flows/generate-product-story';

const story = await generateProductStory({
  productName: "Handwoven Silk Scarf",
  materials: ["silk", "natural dyes"],
  artisanBio: "Third generation weaver...",
  productImage: imageFile
});
```

## 🔌 API Documentation

### Story Generation Endpoint
```http
POST /api/generate-story
Content-Type: application/json

{
  "productName": "string",
  "description": "string",
  "materials": ["string"],
  "artisanStory": "string",
  "imageUrl": "string"
}
```

### Pricing Analysis Endpoint
```http
POST /api/analyze-pricing
Content-Type: application/json

{
  "productData": {
    "materials": ["string"],
    "timeRequired": number,
    "energyConsumed": number,
    "complexity": "low|medium|high"
  }
}
```

## 🚀 Deployment

### Firebase Hosting
```bash
# Build the application
npm run build

# Deploy to Firebase
firebase deploy
```

### Environment Setup for Production
1. Set environment variables in Firebase Console
2. Configure custom domain (optional)
3. Set up monitoring and analytics
4. Configure security rules for Firestore and Storage

## 🏗 Project Structure

```
craftgenie/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   └── features/       # Feature-specific components
│   ├── ai/                 # AI integration flows
│   │   └── flows/          # Individual AI workflows
│   └── lib/               # Utilities and configurations
├── functions/             # Firebase Cloud Functions
├── public/               # Static assets
└── docs/                 # Documentation
```

## 🤝 Contributing

We welcome contributions from developers, designers, and AI enthusiasts!

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```
3. **Make your changes**
4. **Commit your changes**
```bash
git commit -m 'Add amazing feature'
```
5. **Push to the branch**
```bash
git push origin feature/amazing-feature
```
6. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Add tests for new features
- Update documentation accordingly
- Follow the existing code style

## 👥 Team

### Core Development Team

#### **Yash Tagunde** - Team Lead
- 🎓 Final-year B.Tech — Computer Science & Engineering
- 📍 Pune, India
- 💡 Full Stack Developer | Project Management
- 🔗 [LinkedIn](https://linkedin.com/in/yashtagunde) • [GitHub](https://github.com/yashtagunde)

#### **Tanmay Khedekar** - Lead Developer
- 🎓 Final-year B.Tech — Computer Science & Engineering
- 📍 Pune, India
- 💡 AI & ML Enthusiast | Full Stack Developer
- 🔗 [LinkedIn](https://linkedin.com/in/tanmaykhedekar) • [GitHub](https://github.com/tanmaykhedekar)

### Contributors
We welcome contributions from the open-source community! Special thanks to all our contributors.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: contact.craftgenie@gmail.com
- 🐛 [Issue Tracker](https://github.com/tanmaykhedekar/craftgenie/issues)
- 📖 [Documentation Wiki](https://github.com/tanmaykhedekar/craftgenie/wiki)

## 🗺 Roadmap

### Version 2.1 (Upcoming)
- [ ] Multi-language support (Hindi, Marathi)
- [ ] Voice narration for stories
- [ ] Advanced analytics dashboard
- [ ] Marketplace integration

### Version 2.2 (Planned)
- [ ] Mobile app development
- [ ] Social media auto-posting
- [ ] E-commerce integration
- [ ] Community features

---

<div align="center">

**✨ Empowering artisans to tell their stories, connect with audiences, and grow through the power of AI.**

[Get Started](#installation) • [View Demo](https://craftgenie-demo.vercel.app) • [Report Bug](https://github.com/tanmaykhedekar/craftgenie/issues)

*Built with ❤️ by Yash Tagunde, Tanmay Khedekar and the CraftGenie team*

</div>
