# 🚀 MAGICSEARCH - Deployment Information

## 📋 Project Details

### GitHub Repository
- **URL**: https://github.com/Tkdue/magicsearch.git
- **Type**: Private repository
- **Branch**: main

### Vercel Deployment  
- **URL**: magicsearch-three.vercel.app
- **Auto-deploy**: Enabled from GitHub main branch

## 🔐 Environment Variables Required

### Core API Keys
```bash
# AI Models
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIzaSy...
ANTHROPIC_API_KEY=sk-ant-...

# Image Search APIs  
GOOGLE_API_KEY=AIzaSy...
GOOGLE_SEARCH_ENGINE_ID=...
UNSPLASH_ACCESS_KEY=...
PIXABAY_API_KEY=...
PEXELS_API_KEY=...
FREEPIK_API_KEY=...
ENVATO_API_TOKEN=...

# Google Drive Integration
GOOGLE_CREDENTIALS={"type":"service_account",...}
```

## 📁 Google Drive Configuration
- **Target Folder ID**: `14qaRq7oTpdo4i6wIci_HAiv8ZL0Xd6UO`
- **Service Account**: `geneimma@tk2022.iam.gserviceaccount.com`
- **Impersonate User**: `andrea.livio@tk2.it`

## 🔄 Deployment Flow
1. **Local Development** → Git push to main
2. **GitHub** → Auto-trigger Vercel deploy
3. **Vercel** → Build & deploy with environment variables
4. **Live Site** → magicsearch-three.vercel.app

## 📝 Notes
- Environment variables are configured in Vercel dashboard
- Sensitive credentials are NOT stored in git repository
- Auto-deployment enabled for seamless updates
- Google Drive uploads require Service Account setup