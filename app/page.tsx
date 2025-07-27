export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-6">🎯 Magic Search</h1>
        <p className="text-xl text-gray-700 mb-8">
          AI-powered intelligent image search with 6 integrated APIs
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">✅ Deployment Successful!</h2>
          <p className="text-gray-600 mb-4">
            The Magic Search application is now live on Vercel.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <strong>Next.js:</strong> 14.2.30
            </div>
            <div>
              <strong>APIs:</strong> Google, Unsplash, Pixabay, Pexels, Freepik, Envato
            </div>
            <div>
              <strong>AI:</strong> GPT-4o, Gemini 1.5 Pro, Claude 3.5 Sonnet
            </div>
            <div>
              <strong>Deploy Time:</strong> {new Date().toISOString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 