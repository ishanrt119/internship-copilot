# 🤖 AI-Powered Internship Copilot

Internship Copilot is a production-ready, full-stack platform designed to automate and streamline the internship hunt for students. Leveraging OpenAI's GPT-4o, background workers, and smart matching engines, it transforms the often overwhelming manual search into a highly efficient, automated pipeline.

## 🚀 Key Features

- **🤖 AI Chatbot Onboarding**: A conversational agent that gathers your skills, experience, and preferences to build a dynamic profile.
- **📄 Smart Resume Parsing**: Instantly extract text and structured data from your PDF resumes using AI-guided parsing.
- **🎯 Intelligent Job Matching**: Matches your profile against thousands of aggregated internships with a "Match Score" and detailed explanation.
- **⚖️ Skill Gap Analysis**: Identifies exactly which skills you're missing for a specific role and provides a strategy to acquire them.
- **📧 Automated AI Outreach**: Generates personalized cold emails and handles follow-ups via SendGrid, powered by company data enrichment.
- **🧩 Chrome Extension**: A companion tool to save job listings directly from LinkedIn or other sites into your copilot dashboard.
- **🛠️ Demo Mode**: Project works out-of-the-box for UI testing even without API keys (uses mocked AI responses if keys are missing from `.env`).

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org) (App Router)
- **AI Models**: OpenAI GPT-4o & GPT-4o-mini
- **Database**: PostgreSQL with [Prisma ORM](https://prisma.io)
- **Queues & Background Workers**: [BullMQ](https://bullmq.io) & [Redis](https://redis.io)
- **Authentication**: [NextAuth.js](https://next-auth.js.org)
- **Scraping**: Playwright (for Internshala, Indeed, etc.)
- **Styling**: Tailwind CSS, Shadcn UI, Framer Motion

## ⚙️ Getting Started

### Prerequisites

- **Node.js**: v18+
- **PostgreSQL**: Local or hosted instance.
- **Redis**: Local or hosted instance (for background workers).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ishanrt119/internship-copilot
   cd internship-copilot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file from the provided boilerplate and fill in your API keys:
   ```env
   DATABASE_URL="postgresql://..."
   REDIS_URL="redis://..."
   OPENAI_API_KEY="sk-..."
   SENDGRID_API_KEY="SG...."
   NEXTAUTH_SECRET="..."
   ```

4. **Database Migration**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Run Background Workers** (in separate terminals):
   ```bash
   # For job aggregation/scraping
   npm run workers:scrape

   # For email outreach
   npm run workers:outreach
   ```

## 🏗️ Architecture

The platform uses a decoupled architecture for high reliability:
- **API Layer**: Handles chat, resume parsing, and dashboard data.
- **Worker Layer**: Background workers handle the heavy lifting (web scraping, email generation, enrichment) without blocking the main thread.
- **Queue System**: BullMQ ensures that job requests are processed even during high traffic or third-party API rate limits.

## 📄 License

This project is licensed under the MIT License.

