export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">Digital Assets Marketplace</h1>
        <p className="text-xl text-gray-600 mb-8">
          Buy and sell digital assets like 3D models, code snippets, and Notion templates
        </p>
        
        <div className="flex justify-center gap-4">
          <a 
            href="/marketplace" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Browse Assets
          </a>
          <a 
            href="/seller" 
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Start Selling
          </a>
        </div>
      </div>
      
      <div className="mt-16 grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">Secure Downloads</h3>
          <p className="text-gray-600">
            Files are protected and only accessible after purchase with temporary download links
          </p>
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">Easy Payments</h3>
          <p className="text-gray-600">
            Secure payments powered by Stripe with instant access to your purchases
          </p>
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">Creator Friendly</h3>
          <p className="text-gray-600">
            Upload your digital assets and start earning with our seller dashboard
          </p>
        </div>
      </div>
    </div>
  );
}