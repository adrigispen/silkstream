# SilkStream

A personal video storage and streaming application built with React, TypeScript, and AWS. Currently, it allows uploading and streaming videos and entering basic metadata about each video.

#### Next steps:

- Allow filtering and searching for videos
- Add validation for saving metadata
- Rethink UX

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

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, TypeScript, Jest
- Cloud: AWS (S3, Parameter Store, DynamoDB)
