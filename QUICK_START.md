# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Configure Environment Variables

Make sure your `.env` file has these values set:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_actual_google_maps_key"
AWS_ACCESS_KEY_ID="your_aws_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
```

### 2. Start the Development Server

The server should already be running at http://localhost:3000

If not, run:
```bash
npm run dev
```

### 3. Test the Application

1. **Home Page** (http://localhost:3000)
   - Click "Add New Location" button

2. **Add Location Page** (http://localhost:3000/add-location)
   - Click anywhere on the map to select a location
   - Fill in the form:
     - Name (required)
     - Category (required) - select from dropdown
     - Is Sponsored (optional checkbox)
     - Images (optional) - upload one or more images
   - Click "Save Location"

3. **View Locations** (http://localhost:3000/locations)
   - See all saved locations
   - Click "View on Google Maps" to open in Google Maps

## 📋 What Was Built

### Pages
- **/** - Landing page with navigation
- **/add-location** - Interactive map with form to add locations
- **/locations** - Grid view of all saved locations

### API Routes
- **POST /api/locations** - Save location to database
- **GET /api/locations** - Fetch all locations
- **POST /api/upload-url** - Get presigned S3 URL for image upload

### Database
- SQLite database with Location model
- Stores: name, lat/lng, category, sponsored status, image URLs

### Features Implemented
✅ Google Maps integration with click-to-select
✅ Form with name, category dropdown, and sponsored checkbox
✅ Multiple image upload to AWS S3
✅ Data persistence in SQLite database
✅ Responsive UI with Tailwind CSS
✅ Success/error messaging
✅ Location viewing page

## 🔧 Testing Without Full Setup

If you don't have Google Maps API or AWS credentials yet:

1. **Without Google Maps API**: The map won't load, but you can still manually enter coordinates in the form (you'll need to modify the form to add lat/lng inputs)

2. **Without AWS S3**: Simply don't upload images. The form will still save locations without images.

## 📝 Next Steps

- Add your actual Google Maps API key to see the interactive map
- Configure AWS S3 to enable image uploads
- Customize categories in `/types/location.ts`
- Add authentication if needed
- Deploy to production (Vercel, AWS, etc.)

## 🐛 Common Issues

**Map not showing?**
- Check `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env`
- Ensure Maps JavaScript API is enabled in Google Cloud Console

**Images not uploading?**
- Verify AWS credentials
- Check S3 bucket CORS configuration
- Ensure bucket exists and IAM user has permissions

**Database errors?**
- Run `npx prisma generate`
- Run `npx prisma migrate dev`
