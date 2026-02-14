<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="TailwindCSS" />
</p>

<h1 align="center">✨ Taskify</h1>

<p align="center">
  <strong>A Modern Task Management Platform for High-Performance Teams</strong>
</p>

<p align="center">
  <em>Built with Next.js 16, React 19, and the latest web technologies</em>
</p>

---

## 🎯 What is Taskify?

**Taskify** is a full-stack task management application designed for teams and professionals who demand both power and elegance. It combines intuitive project organization with real-time collaboration features, wrapped in a stunning, professional UI inspired by Linear, Vercel, and Raycast.

### Key Differentiators

- 🚀 **Next.js 16** — Leveraging the latest features including `proxy.ts` for authentication
- ⚡ **React 19** — Cutting-edge React with enhanced performance
- 🎨 **Cosmos Theme** — A premium, high-end design system with dark mode support
- 💬 **Real-Time Messaging** — Built-in team communication
- 👥 **Team Collaboration** — Follow colleagues, manage project members
- 📊 **Analytics Dashboard** — Activity charts and productivity insights

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Dashboard  │  │    Tasks    │  │  Projects   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Messages  │  │    Team     │  │  Settings   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                         API LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  /api/auth      /api/tasks      /api/projects            │   │
│  │  /api/users     /api/conversations    /api/register      │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                       DATA LAYER                                 │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐             │
│  │   Prisma   │───▶│ PostgreSQL │    │   Resend   │             │
│  │   ORM      │    │  Database  │    │   Emails   │             │
│  └────────────┘    └────────────┘    └────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 📋 Task Management

- Create, edit, and delete tasks
- Status workflow: `TODO` → `IN_PROGRESS` → `IN_REVIEW` → `DONE`
- Priority levels: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- Due dates and assignees
- Comment threads on tasks

### 📁 Project Organization

- Create projects with custom colors
- Member management with roles (Owner, Admin, Member)
- Project-level task aggregation
- Team collaboration within projects

### 👥 Team Features

- User directory with profiles
- Follow/unfollow colleagues
- View teammate's tasks and projects
- Team member search

### 💬 Real-Time Messaging

- Direct messaging between team members
- Conversation history
- Real-time polling updates
- Start new conversations easily

### 🔐 Authentication & Security

- Secure login/registration with NextAuth.js
- Password reset via email (Resend)
- JWT session management
- Protected routes via proxy.ts

### 🎨 Premium Design

- **Cosmos Theme**: Professional dark/light mode
- Responsive design (mobile-first)
- Smooth animations and transitions
- Accessibility-focused UI components

### 📊 Dashboard Analytics

- Task statistics and trends
- Activity charts (Recharts)
- Running tasks overview
- Upcoming deadlines

---

## 🗄️ Database Schema

```prisma
User ◄───────► ProjectMember ◄───────► Project
  │                                        │
  │ (creates/assigned)                     │
  ▼                                        ▼
Task ◄─────────────────────────────────────┘
  │
  ▼
Comment

User ◄───────► Follow ◄───────► User
  │
  ▼
ConversationParticipant ◄───► Conversation ◄───► Message
```

### Models

| Model                | Description                                    |
| -------------------- | ---------------------------------------------- |
| `User`               | Team members with roles (ADMIN, MEMBER)        |
| `Project`            | Containers for tasks with custom colors        |
| `ProjectMember`      | Many-to-many with roles (OWNER, ADMIN, MEMBER) |
| `Task`               | Work items with status, priority, due dates    |
| `Comment`            | Discussion threads on tasks                    |
| `Follow`             | Social connections between users               |
| `Conversation`       | Direct message threads                         |
| `Message`            | Individual chat messages                       |
| `PasswordResetToken` | Secure password recovery                       |

---

## 🛠️ Tech Stack

### Frontend

| Technology      | Version | Purpose                         |
| --------------- | ------- | ------------------------------- |
| Next.js         | 16.1.1  | React framework with App Router |
| React           | 19.2.3  | UI library                      |
| TypeScript      | 5.x     | Type safety                     |
| TailwindCSS     | 4.x     | Styling                         |
| SWR             | 2.3.8   | Data fetching with caching      |
| React Hook Form | 7.70.0  | Form management                 |
| Zod             | 4.3.5   | Schema validation               |
| Recharts        | 3.6.0   | Charts and analytics            |
| Lucide React    | 0.562.0 | Icons                           |
| Sonner          | 2.0.7   | Toast notifications             |

### Backend

| Technology  | Version | Purpose              |
| ----------- | ------- | -------------------- |
| NextAuth.js | 4.24.13 | Authentication       |
| Prisma      | 7.x     | ORM                  |
| PostgreSQL  | -       | Database             |
| Resend      | 6.9.1   | Transactional emails |
| bcryptjs    | 3.0.3   | Password hashing     |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/taskify.git
cd taskify

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Configure your .env file
DATABASE_URL="postgresql://user:password@localhost:5432/taskify"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_your_api_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Push database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed the database (optional)
pnpm db:seed

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see the app.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/              # Auth pages (login, register, forgot-password)
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── page.tsx         # Dashboard home
│   │   ├── tasks/           # Task management
│   │   ├── projects/        # Project management
│   │   ├── mentors/         # Team directory
│   │   ├── messages/        # Messaging
│   │   ├── settings/        # User settings
│   │   └── users/           # User profiles
│   └── api/                 # API routes
│       ├── auth/            # Authentication endpoints
│       ├── tasks/           # Task CRUD
│       ├── projects/        # Project CRUD
│       ├── users/           # User endpoints
│       └── conversations/   # Messaging endpoints
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── auth-provider.tsx    # NextAuth provider
│   └── theme-provider.tsx   # Dark mode provider
├── hooks/                   # Custom React hooks (SWR)
├── lib/                     # Utilities and helpers
│   ├── prisma.ts           # Prisma client
│   ├── api-utils.ts        # API helpers
│   ├── email.ts            # Email service (Resend)
│   └── validations.ts      # Zod schemas
└── proxy.ts                # Next.js 16 authentication proxy
```

---

## 🎨 Design System

Taskify uses the **Cosmos Theme**, a custom design system inspired by:

- **Linear** — Clean, minimal interfaces
- **Vercel** — Sharp typography and precision
- **Raycast** — Dark mode excellence

### Color Palette

| Token      | Light Mode | Dark Mode |
| ---------- | ---------- | --------- |
| Background | `#fafafa`  | `#09090b` |
| Surface    | `#ffffff`  | `#18181b` |
| Border     | `#e4e4e7`  | `#27272a` |
| Text       | `#18181b`  | `#fafafa` |
| Brand      | `#6366f1`  | `#6366f1` |

---

## 📄 API Reference

### Authentication

| Method | Endpoint                    | Description               |
| ------ | --------------------------- | ------------------------- |
| POST   | `/api/auth/[...nextauth]`   | NextAuth handlers         |
| POST   | `/api/register`             | User registration         |
| POST   | `/api/auth/forgot-password` | Request password reset    |
| POST   | `/api/auth/reset-password`  | Reset password with token |

### Tasks

| Method | Endpoint                   | Description      |
| ------ | -------------------------- | ---------------- |
| GET    | `/api/tasks`               | List all tasks   |
| POST   | `/api/tasks`               | Create task      |
| GET    | `/api/tasks/[id]`          | Get task details |
| PUT    | `/api/tasks/[id]`          | Update task      |
| DELETE | `/api/tasks/[id]`          | Delete task      |
| POST   | `/api/tasks/[id]/comments` | Add comment      |

### Projects

| Method | Endpoint                     | Description         |
| ------ | ---------------------------- | ------------------- |
| GET    | `/api/projects`              | List all projects   |
| POST   | `/api/projects`              | Create project      |
| GET    | `/api/projects/[id]`         | Get project details |
| PUT    | `/api/projects/[id]`         | Update project      |
| DELETE | `/api/projects/[id]`         | Delete project      |
| POST   | `/api/projects/[id]/members` | Add member          |
| DELETE | `/api/projects/[id]/members` | Remove member       |

### Users & Social

| Method | Endpoint                 | Description      |
| ------ | ------------------------ | ---------------- |
| GET    | `/api/users`             | List all users   |
| GET    | `/api/users/[id]`        | Get user profile |
| POST   | `/api/users/[id]/follow` | Toggle follow    |
| GET    | `/api/users/me`          | Get current user |

### Messaging

| Method | Endpoint                           | Description         |
| ------ | ---------------------------------- | ------------------- |
| GET    | `/api/conversations`               | List conversations  |
| POST   | `/api/conversations`               | Create conversation |
| GET    | `/api/conversations/[id]/messages` | Get messages        |
| POST   | `/api/conversations/[id]/messages` | Send message        |

---

## 🧪 Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Database commands
npx prisma studio    # Open database GUI
npx prisma db push   # Push schema changes
npx prisma generate  # Regenerate client
pnpm db:seed         # Seed database
```

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Design inspiration from [Linear](https://linear.app), [Vercel](https://vercel.com), and [Raycast](https://raycast.com)
- Icons by [Lucide](https://lucide.dev)
- Charts by [Recharts](https://recharts.org)

---

<p align="center">
  Built with ❤️ using Next.js 16 and React 19
</p>
