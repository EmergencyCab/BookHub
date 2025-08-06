# Web Development Final Project - *BookClub Hub*

Submitted by: **Prashant Panta**

This web app: **A comprehensive book community platform where users can write reviews, start discussions, create reading lists, and discover books using Google Books API integration. Features include password-protected posts, real-time search, rating system, and full CRUD operations for community-driven book sharing.**

Time spent: **25** hours spent in total

Gif: https://imgur.com/a/kW7QnMP ; liceCap and imgur

## Required Features

The following **required** functionality is completed:

- [x] **Web app includes a create form that allows the user to create posts**
  - Form requires users to add a post title
  - Forms should have the *option* for users to add: 
    - additional textual content (review/discussion content)
    - an image added as an external image URL (book covers from Google Books API)
- [x] **Web app includes a home feed displaying previously created posts**
  - Web app includes home feed displaying previously created posts
  - By default, each post on the posts feed shows:
    - creation time ("2 hours ago", "1 week ago" format)
    - title (review/discussion titles)
    - upvotes count (with thumbs up icon)
  - Clicking on a post directs users to a new page for the selected post
- [x] **Users can view posts in different ways**
  - Users can sort posts by:
    - creation time (Most Recent)
    - upvotes count (Most Popular)
  - Users can search for posts by title (with real-time search)
- [x] **Users can interact with each post in different ways**
  - The app includes a separate post page for each created post showing:
    - content (full review/discussion text)
    - image (book covers with detailed book information)
    - comments (full comment system with author names)
  - Users can leave comments underneath a post on the post page
  - Each post includes an upvote button on the post page
    - Each click increases the post's upvotes count by one
    - Users can upvote any post any number of times
- [x] **A post that a user previously created can be edited or deleted from its post pages**
  - After a user creates a new post, they can go back and edit the post
  - A previously created post can be deleted from its post page

## Optional Features Implemented

- [x] **Web app implements pseudo-authentication**
  - Users can only edit and delete posts or delete comments by entering the secret key, which is set by the user during post creation
  - Password protection modal system for secure editing/deletion
  - Only the original author with the correct password can update or delete posts
- [x] **Users can add more characteristics to their posts**
  - Users can set post types: "Book Review" or "General Discussion"
  - Users can filter posts by type on the home feed
  - Star rating system (1-5 stars) for book reviews
  - Book genre classification and filtering
- [x] **Enhanced book discovery and management**
  - Google Books API integration for real book data
  - Automatic book cover images and metadata
  - Manual book addition for books not in Google Books
  - Reading lists creation and management
  - Book categorization by genre, author, publication date

## Additional Features Implemented

* [x] **Google Books API Integration** - Search millions of real books with cover images, descriptions, and metadata
* [x] **Reading Lists System** - Users can create custom reading lists and organize books
* [x] **Advanced Book Management** - Full CRUD operations for books with ISBN, publisher, page count data
* [x] **Responsive Design** - Full mobile and desktop compatibility with modern UI
* [x] **Real-time Search** - Debounced search with live results
* [x] **Book Rating System** - 5-star rating system with visual star display
* [x] **Post Type Classification** - Separate handling for reviews vs discussions
* [x] **Enhanced Security** - Password protection for all user-generated content
* [x] **Database Integration** - Full Supabase PostgreSQL backend with relationships
* [x] **Professional Deployment** - Live on Vercel with environment variables and CI/CD
* [x] **Date Handling** - Smart date formatting from various Google Books API formats
* [x] **Error Handling** - Comprehensive error states and loading indicators
* [x] **Book Statistics** - View system with review counts and rating averages

## Technology Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **External APIs**: Google Books API
- **Routing**: React Router DOM
- **Styling**: Custom CSS with responsive design
- **Version Control**: Git + GitHub

## Database Schema

- **books** - Book information from Google Books API
- **posts** - User reviews and discussions with security
- **comments** - User comments with password protection
- **reading_lists** - Custom user reading lists
- **reading_list_items** - Books within reading lists

## Video Walkthrough

Here's a walkthrough of implemented user stories:

<img src='http://i.imgur.com/link/to/your/gif/file.gif' title='Video Walkthrough' width='' alt='Video Walkthrough' />

<!-- Replace this with whatever GIF tool you used! -->
GIF created with OBS Studio and converted with CloudConvert

## Live Demo

**[Visit BookClub Hub Live](https://book-nfai76wne-prashant-pantas-projects.vercel.app/)**

## Features Showcase

### Security Features
- Password-protected posts and comments
- Modal-based authentication system
- Only creators can edit/delete their content

### Book Discovery
- Google Books API integration
- Real-time book search
- Automatic metadata population
- Manual book addition fallback

### Content Management
- Rich text reviews and discussions
- Star rating system for reviews
- Comment system with threading
- Upvoting mechanism

### User Experience
- Responsive design for all devices
- Real-time search and filtering
- Sort by popularity or recency
- Clean, modern interface

## Notes

### Challenges Encountered

1. **Google Books API Date Formatting** - Had to handle various date formats (year-only, year-month, full dates) from the API
2. **Supabase Security** - Implemented password-based security without traditional user accounts
3. **React Router on Vercel** - Required `vercel.json` configuration for SPA routing
4. **Environment Variables** - Securing API keys and database credentials in deployment
5. **Real-time Search** - Implementing debounced search to avoid excessive API calls
6. **Database Relationships** - Designing efficient foreign key relationships between books, posts, and comments

### Key Learning Outcomes

- Full-stack development with modern React and PostgreSQL
- External API integration and data transformation
- Deployment and DevOps with Vercel and Supabase
- Security implementation in web applications
- Responsive web design principles
- Git workflow and version control best practices

## Installation & Setup

```bash
# Clone the repository
git clone https://github.com/EmergencyCab/BookHub.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase URL and API key

# Run development server
npm run dev

# Build for production
npm run build
```

## License

    Copyright 2025 Prashant Panta

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
