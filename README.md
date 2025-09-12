# CineFind - Personalized Movie Search & Tagging

A Next.js web application that lets users search movies and personalize them with tags, categories, and notes. Built with Supabase for authentication and data management.

## Features

- 🔍 **Movie Search & Filtering** - Search movies by title and filter by categories/tags
- 🏷️ **Personal Tagging** - Add custom tags to movies (from admin-curated list)
- 📝 **Movie Notes** - Add personal notes up to 400 characters per movie
- 🎯 **Categories** - Organize movies with admin-defined categories
- 🔐 **Authentication** - Secure user accounts with Supabase Auth
- 📱 **Responsive Design** - Clean, Metacritic-inspired UI that works on all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, RLS)
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account and project

### 1. Clone and Install

```bash
git clone <repository-url>
cd movie-tags
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your project URL and anon key
3. Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Set up Database Schema

Run the SQL from `prd/cinefind_prd_updated.md` in your Supabase SQL editor to create the required tables and RLS policies.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
app/
├── login/          # Login page
├── signup/         # Sign up page  
├── globals.css     # Global styles
├── layout.tsx      # Root layout with AuthProvider
└── page.tsx        # Homepage with movie grid

contexts/
└── auth-context.tsx # Authentication context and hooks

lib/
├── supabase.ts     # Supabase client configuration
└── supabase-client.ts # Browser client helper

types/
└── database.ts     # TypeScript database schema types

prd/
└── cinefind_prd_updated.md # Product Requirements Document
```

## Authentication

The app uses Supabase Auth with email/password authentication:

- **Sign Up**: Creates new user account with email confirmation
- **Sign In**: Authenticates existing users
- **Session Management**: Automatic token refresh and persistence
- **Protected Routes**: User-specific data protected by Row Level Security

## Database Schema

Key tables:
- `movies` - Core movie catalog
- `tags` - Admin-curated tags
- `categories` - Admin-curated categories  
- `profiles` - Extended user profiles
- `user_movie_tags` - User's personal movie tags
- `user_movie_categories` - User's movie categorizations
- `user_movie_notes` - User's movie notes

All user data is protected by RLS policies ensuring privacy.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Components

- **AuthProvider** - Manages authentication state
- **Homepage** - Movie grid with search and filters
- **Login/Signup** - Authentication pages with form validation
- **Movie Cards** - Display movie information and ratings

## Next Steps

- [ ] Implement database schema
- [ ] Add movie search functionality
- [ ] Create movie detail pages
- [ ] Build admin interface
- [ ] Add sample data for testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
"# movie-tag" 
"# initialize"
"# push origin"