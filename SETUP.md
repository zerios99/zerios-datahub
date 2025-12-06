# Map Location Manager - Setup Guide

This application allows you to add and manage locations with Google Maps integration, store data in a database, and upload images to AWS S3.

## Prerequisites

- Node.js 20.16+ installed
- Google Maps API Key
- AWS Account with S3 bucket configured
- Database (SQLite is configured by default)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key_here"

# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your_aws_access_key_id"
AWS_SECRET_ACCESS_KEY="your_aws_secret_access_key"
AWS_REGION="your_aws_region"  # e.g., us-east-1
AWS_S3_BUCKET="your_bucket_name"
```

## Getting Your API Keys

### Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
4. Go to "Credentials" and create an API key
5. (Optional) Restrict the API key to your domain for security

### AWS S3 Setup

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Create an S3 bucket:
   - Go to S3 service
   - Click "Create bucket"
   - Choose a unique name and region
   - Configure bucket settings (public access settings based on your needs)
3. Create IAM user with S3 access:
   - Go to IAM service
   - Create a new user
   - Attach policy: `AmazonS3FullAccess` (or create a custom policy with limited permissions)
   - Save the Access Key ID and Secret Access Key

### S3 Bucket CORS Configuration

Add this CORS configuration to your S3 bucket to allow uploads:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Generate Prisma client and create database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- **Interactive Map**: Click anywhere on the Google Map to select a location
- **Location Form**: Add name, category, and mark as sponsored
- **Image Upload**: Upload multiple images to AWS S3 (optional)
- **Database Storage**: All location data is saved to SQLite database
- **View Locations**: Browse all saved locations with their details

## Project Structure

```
map-locator/
├── app/
│   ├── add-location/       # Page to add new locations
│   ├── locations/          # Page to view all locations
│   ├── api/
│   │   ├── locations/      # API routes for location CRUD
│   │   └── upload-url/     # API route for S3 presigned URLs
│   └── page.tsx            # Home page
├── lib/
│   ├── prisma.ts           # Prisma client instance
│   └── s3.ts               # S3 upload utilities
├── prisma/
│   └── schema.prisma       # Database schema
└── types/
    └── location.ts         # TypeScript types
```

## Database Schema

```prisma
model Location {
  id          String   @id @default(cuid())
  name        String
  latitude    Float
  longitude   Float
  category    String
  isSponsored Boolean  @default(false)
  images      String   @default("[]") // JSON array of S3 URLs
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Categories

The following categories are available:
- Restaurant
- Cafe
- Park
- Museum
- Shopping
- Entertainment
- Hotel
- Landmark
- Other

## Troubleshooting

### Google Maps not loading
- Check that your API key is correct in `.env`
- Ensure the Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for any error messages

### Image upload failing
- Verify AWS credentials are correct
- Check S3 bucket CORS configuration
- Ensure the bucket exists and is in the correct region
- Verify IAM user has proper S3 permissions

### Database errors
- Run `npx prisma generate` to regenerate the Prisma client
- Run `npx prisma migrate dev` to apply migrations
- Check that DATABASE_URL is correctly set in `.env`

## Production Deployment

For production deployment:

1. Use a production database (PostgreSQL, MySQL, etc.)
2. Update `prisma/schema.prisma` datasource to match your database
3. Set all environment variables in your hosting platform
4. Run `npx prisma migrate deploy` to apply migrations
5. Build the application: `npm run build`
6. Start the production server: `npm start`

## Security Notes

- Never commit `.env` file to version control
- Restrict Google Maps API key to your domain
- Use IAM policies to limit S3 access
- Consider implementing authentication for production use
- Validate and sanitize all user inputs
