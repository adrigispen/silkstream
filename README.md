# SilkStream

A personal video storage and streaming application built with React, TypeScript, and AWS. Currently, it allows uploading and streaming videos and entering basic metadata about each video. You can search by title, description, tags, or category, and filter down by category or tags. Bulk actions are in progress - deleting videos, or updating the category or tags of multiple videos at once.

#### Next steps:

1. Improve security, give it at least an admin password to access
2. Allow multi-tenency - user accounts, with a separate video archive for each user
3. Add searchService with OpenSearch
4. Smaller features:
   - Add video thumbnails, ability to play videos in cards
   - Allow managing tags and categories
   - Pagination to improve performance
   - Give users option to star vids they'd like to practice
   - Allow sending links to individual videos

## Prerequisites

- Node.js (v16 or higher)
- AWS CLI installed and configured
- AWS account with appropriate permissions

## Setup

### AWS Configuration

1. Configure AWS CLI with your credentials:

```bash
aws configure --profile personal
```

2. Set up required AWS Parameters in Parameter Store:

- /silkstream/aws-access-key-id
- /silkstream/aws-secret-access-key
- /silkstream/bucket-name

### Backend Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

Server will run on http://localhost:3000

### Frontend Setup

1. Navigate to the client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

Frontend will run on http://localhost:5173

## Technologies Used

- Frontend: React, TypeScript, Vite, RTK Query
- Backend: Node.js, Express, TypeScript
- Cloud: AWS (S3, Parameter Store, DynamoDB, CloudFront, APIGateway, OpenSearch (coming))
