# Product Requirements Document (PRD)

## 1) Project Title

**CineFind** — Personalized Movie Search & Tagging Web App

## 2) Summary

Build a **Next.js** web app that lets users search a catalog of movies by title and filter results by a set of **admin-curated tags and categories**. Each authenticated user has their own account where they can:

- Assign tags (from the admin-defined list) to movies.  
- Assign categories (from the admin-defined list) to movies.  
- Add a short personal note (up to **400 characters**) per movie.  
- Manage their user profile (display name, avatar, bio).  

All user tags, categories, notes, and profiles are private to the user. Authentication and data are managed by **Supabase**.  

## 3) Goals & Non-Goals

**Goals**  
- Fast movie title search and filtering by admin-defined categories/tags.  
- Admin-managed taxonomy of tags and categories.  
- Each user can personalize movies with tags, categories, and a short note.  
- Each user has a user profile for display name, avatar, and bio.  
- Scalable to 50–100k movies.  

**Non-Goals**  
- No user-created tags or categories (must come from admin).  
- No public sharing of personal notes or labels.  
- No ratings or media streaming.  

## 4) Personas & Roles

- **Visitor (Unauthenticated):** Browse/search/filter movies.  
- **Signed-in User:** Assign tags, categories, personal notes, and manage profile.  
- **Admin:** CRUD on movies, tags, and categories. Bulk import, publish/unpublish.  

## 5) User Stories (v1)

1. As a visitor, I can search by movie title and filter by categories/tags.  
2. As a signed-in user, I can select tags for a movie (from the admin list).  
3. As a signed-in user, I can select a category for a movie (from the admin list).  
4. As a signed-in user, I can add a personal note (up to 400 chars) for each movie.  
5. As a signed-in user, I can view my tags, categories, and notes when revisiting a movie.  
6. As a signed-in user, I can update my profile (display name, avatar, bio).  
7. As an admin, I can create, edit, archive, and delete categories and tags.  
8. As an admin, I can manage movies and assign categories.  
9. As an admin, I can bulk import movies.  

## 6) Functional Requirements

**Search & Filter**  
- Full-text search on `movies.title`.  
- Filter by categories and tags.  
- Sorting and pagination.  

**User Personalization**  
- Each user can select zero or more tags per movie (from admin-curated tags).  
- Each user can select one category per movie (from admin-curated categories).  
- Each user can attach one personal note (<= 400 characters) per movie.  
- User tags, categories, and notes are private to the user.  

**User Profile**  
- User has a profile linked to `auth.users`.  
- Profile includes `display_name`, `avatar_url`, and `bio`.  
- Users can update only their own profile.  

**Admin**  
- CRUD for tags and categories.  
- Movie CRUD and bulk import.  

**Auth & Security**  
- Supabase Auth.  
- User-generated data tied to `auth.uid()`.  
- RLS ensures users can only manage their own tags, categories, notes, and profile.  

## 7) Database Schema

(… schema content …)

## 8) API Endpoints

(… endpoints …)

## 9) UI Requirements

(… UI …)

## 10) Implementation Guide

(… phases …)

## 11) Acceptance Criteria

(… criteria …)

## 12) Entity Relationship Diagram (ERD)

![CineFind ERD](cinefind_erd.png)
