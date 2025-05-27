# 🪄 Magic Search - Setup & Installation Guide

## 🚀 Quick Start

### 1. Installazione Dipendenze

```bash
npm install
```

### 2. Configurazione API Keys

1. Copia il file di esempio delle variabili d'ambiente:
```bash
cp env.example .env
```

2. Modifica il file `.env` inserendo le tue API keys:

```env
# AI APIs (per ricerca creativa)
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here

# Image Search APIs
GOOGLE_API_KEY=your-google-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id

UNSPLASH_ACCESS_KEY=your-unsplash-access-key
PIXABAY_API_KEY=your-pixabay-key
PEXELS_API_KEY=your-pexels-key

# Premium Creative Resources APIs
FREEPIK_API_KEY=your-freepik-api-key
ENVATO_API_TOKEN=your-envato-token
```

### 3. Avvio Applicazione

```bash
# Modalità sviluppo
npm run dev

# Build di produzione
npm run build
npm start
```

L'applicazione sarà disponibile su `http://localhost:3000`

---

## 🎯 **Caratteristiche Principali**

### **6 API Integrate:**
1. **Google Custom Search** - Ricerca universale
2. **Unsplash** - Foto professionali gratuite
3. **Pixabay** - Contenuti gratuiti vari
4. **Pexels** - Foto e video stock
5. **🌟 Freepik** - Vettoriali, PSD, icone (Premium)
6. **👑 Envato** - Contenuti premium professionali

### **Ricerca AI-Powered:**
- **Ricerca Specifica**: Query dirette e precise
- **Ricerca Creativa**: L'AI espande automaticamente la query in multiple ricerche correlate
- **Preset A31 Films**: Configurazioni ottimizzate per progetti specifici

### **Filtri Avanzati:**
- Dimensioni immagine (piccola → ultra)
- Tipo contenuto (foto, vettoriali, illustrazioni, icone)
- Colori dominanti
- Formato/aspect ratio
- Diritti d'uso (gratuito, commerciale, Creative Commons)

---

## 🔑 **Guida API Keys**

### **API Gratuite:**

#### **Google Custom Search**
```
1. Vai su https://console.developers.google.com
2. Crea progetto e abilita Custom Search API
3. Crea credenziali (API key)
4. Vai su https://cse.google.com per creare motore di ricerca
5. Ottieni Search Engine ID
```

#### **Unsplash**
```
1. Vai su https://unsplash.com/developers
2. Crea nuova applicazione
3. Ottieni Access Key
```

#### **Pixabay**
```
1. Registrati su https://pixabay.com/api/docs/
2. Ottieni API key dalle impostazioni account
```

#### **Pexels**
```
1. Vai su https://www.pexels.com/api/
2. Crea account gratuito
3. Genera API key
```

### **API Premium:**

#### **🌟 Freepik API**
```
1. Vai su https://www.freepik.com/api
2. Crea account e sottoscrivi piano API
3. Genera API key dalla dashboard
💰 Richiede abbonamento a pagamento
```

#### **👑 Envato API**
```
1. Vai su https://build.envato.com/api/
2. Crea account Envato
3. Genera Personal Token dalle impostazioni
💰 Accesso a contenuti premium richiede abbonamento
```

### **AI APIs (Opzionali per ricerca creativa):**

#### **OpenAI**
```
1. Vai su https://platform.openai.com/api-keys
2. Crea account e aggiungi metodo di pagamento
3. Genera nuova API key
```

#### **Anthropic**
```
1. Vai su https://console.anthropic.com
2. Crea account e aggiungi metodo di pagamento
3. Genera nuova API key
```

---

## 🎨 **Preset A31 Films**

### **Commercial Project**
- **Focus**: Prodotti, lifestyle, business
- **Fonti prioritarie**: Envato, Freepik, Unsplash
- **Filtri**: XLarge, uso commerciale, panoramico

### **Documentary Style**
- **Focus**: Fotografia sociale, reportage
- **Fonti prioritarie**: Unsplash, Pexels, Pixabay
- **Filtri**: Large, gratuito, bianco/nero

### **Music Video**
- **Focus**: Performance, strumenti, crowd
- **Fonti prioritarie**: Envato, Freepik, Unsplash
- **Filtri**: XLarge, commerciale, panoramico

### **Corporate/Institutional**
- **Focus**: Professionalità, uffici, team
- **Fonti prioritarie**: Envato, Freepik, Unsplash
- **Filtri**: Large, commerciale, blu, panoramico

### **🆕 Graphic Design**
- **Focus**: Vettoriali, icone, template, PSD
- **Fonti prioritarie**: Freepik, Envato
- **Filtri**: XLarge, commerciale, tutti i formati

### **🆕 Social Media**
- **Focus**: Template, post, stories, banner
- **Fonti prioritarie**: Freepik, Envato, Unsplash
- **Filtri**: Medium, commerciale, quadrato

---

## ⚡ **Rate Limits**

| API | Limite Gratuito | Limite Premium |
|-----|----------------|----------------|
| Google Custom Search | 100 req/giorno | A pagamento |
| Unsplash | 50 req/ora | 5000 req/ora |
| Pixabay | 100 req/minuto | Stesso |
| Pexels | 200 req/ora | Stesso |
| Freepik | - | 100 req/ora |
| Envato | - | 1000 req/ora |
| OpenAI | - | 60 req/min |
| Anthropic | - | Varia per piano |

---

## 🔧 **Funzionalità Avanzate**

### **Ricerca Intelligente**
- **Distribuzione automatica** delle query tra le 6 API
- **Rimozione duplicati** intelligente
- **Ordinamento per qualità** (premium first)
- **Statistiche per fonte** in tempo reale

### **Download Avanzato**
- **Download singolo** con click
- **Selezione multipla** con checkbox
- **Download batch** di tutte le immagini selezionate
- **Nomi file intelligenti** con timestamp e fonte

### **Interfaccia Premium**
- **Badge premium** per contenuti Freepik/Envato
- **Icone distintive** (👑 Envato, ⭐ Freepik)
- **Statistiche live** per fonte
- **Info AI expansion** per ricerche creative

---

## 🚨 **Note Importanti**

### **Costi API**
- **Gratuite**: Google (limitato), Unsplash, Pixabay, Pexels
- **A pagamento**: Freepik, Envato, OpenAI, Anthropic
- **Monitoraggio**: Controlla sempre i tuoi usage limits

### **Licenze Contenuti**
- **Freepik**: Licenza Freepik (attribuzione richiesta per piano gratuito)
- **Envato**: Licenza Standard/Extended (uso commerciale)
- **Unsplash**: Licenza Unsplash (uso libero)
- **Pexels**: Licenza Pexels (uso libero)
- **Pixabay**: Licenza Pixabay (uso libero)

### **Qualità Contenuti**
1. **👑 Envato** - Massima qualità professionale
2. **🌟 Freepik** - Eccellente per design e vettoriali
3. **📸 Unsplash** - Foto professionali gratuite
4. **🎥 Pexels** - Buona qualità, foto e video
5. **🎨 Pixabay** - Varietà di contenuti gratuiti
6. **🔍 Google** - Ricerca universale

---

## 🛠️ **Troubleshooting**

### **Errori Comuni**
```bash
# Errore API key mancante
Soluzione: Verifica che tutte le API keys siano nel file .env

# Errore rate limit
Soluzione: Attendi o upgrading al piano premium

# Errore CORS
Soluzione: Configura correttamente i domini nelle console API
```

### **Performance**
- Le ricerche creative sono più lente (AI processing)
- Le API premium sono generalmente più veloci
- Usa filtri specifici per ridurre i tempi di risposta

---

## 📞 **Supporto**

Per supporto tecnico o domande:
- **Email**: support@a31films.com
- **Documentazione**: Consulta i file di configurazione
- **API Docs**: Link alle documentazioni ufficiali nel file env.example

---

**Magic Search by A31 Films** - La ricerca di immagini intelligente per creativi professionali! 🎬✨ 