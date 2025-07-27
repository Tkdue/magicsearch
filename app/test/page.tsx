export const dynamic = 'force-dynamic'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-green-600 mb-4">✅ Test Page</h1>
      <p className="text-lg text-gray-700">If you see this, the deployment is working!</p>
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          Magic Search deployment test - {new Date().toISOString()}
        </p>
      </div>
    </div>
  );
}