# Magic Search API Setup Guide

## Quick Start

1. **Copy your API keys to `.env.local`** (this file has been created for you)

2. **Required API Keys:**

### Google Custom Search (Free tier available)
```bash
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_google_search_engine_id_here
```
- Get your API key: https://developers.google.com/custom-search/v1/introduction
- Create a Custom Search Engine: https://cse.google.com/cse/

### Unsplash (Free)
```bash
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```
- Register at: https://unsplash.com/developers
- Create a new application to get your access key

### Pixabay (Free)
```bash
PIXABAY_API_KEY=your_pixabay_api_key_here
```
- Register at: https://pixabay.com/api/docs/
- Get your API key from your account

### Pexels (Free)
```bash
PEXELS_API_KEY=your_pexels_api_key_here
```
- Register at: https://www.pexels.com/api/
- Get your API key from your account

### Freepik (Premium)
```bash
FREEPIK_API_KEY=your_freepik_api_key_here
```
- Register at: https://www.freepik.com/api
- Requires subscription for API access

### Envato (Premium)
```bash
ENVATO_API_KEY=your_envato_api_key_here
```
- Register at: https://build.envato.com/api/
- Requires Elements subscription

## Quick Test

After adding your API keys:

1. Restart the dev server: `npm run dev`
2. Search for "mountains" or "ocean"
3. Check browser console for any remaining API errors

## CORS Issues Fixed ✅

All API calls now go through Next.js API routes (`/api/search/*`) which eliminates CORS issues.

## Missing API Keys

The app will gracefully handle missing API keys - those services just won't return results. 