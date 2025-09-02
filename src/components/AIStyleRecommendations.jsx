import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Info, Palette, ShoppingBag } from 'lucide-react';

const AIStyleRecommendations = ({ recommendations }) => {
  const [expandedItems, setExpandedItems] = useState({});
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  // More robust parsing function
  const parseRecommendations = (text) => {
    if (!text) return { analysis: '', items: [] };
    
    // Convert to string if needed
    const content = typeof text === 'string' ? text : JSON.stringify(text);
    
    // Split by "Specific Fashion Recommendations" or numbered items
    const parts = content.split(/\*\*Specific Fashion Recommendations.*?\*\*/i);
    
    // Extract analysis
    const analysis = parts[0]
      ?.replace(/\*\*Analysis:\*\*/gi, '')
      ?.replace(/\*/g, '')
      ?.trim() || '';
    
    // Extract items - look for numbered patterns
    const itemsText = parts[1] || content;
    const items = [];
    
    // Match pattern: 1. **Item: Name** followed by content
    const itemMatches = itemsText.matchAll(/(\d+)\.\s*\*\*Item:\s*(.*?)\*\*([^]*?)(?=\d+\.\s*\*\*Item:|$)/gi);
    
    for (const match of itemMatches) {
      const [fullMatch, number, itemName, itemContent] = match;
      
      // Extract sections from item content
      const whyItWorksMatch = itemContent.match(/\*\*Why [Ii]t [Ww]orks?:?\*\*\s*([^*]+(?:\*(?!\*)[^*]*)*)/);
      const colorsMatch = itemContent.match(/\*\*Colors?:?\*\*\s*([^*]+(?:\*(?!\*)[^*]*)*)/);
      const detailsMatch = itemContent.match(/\*\*(?:Details for Try-On|Virtual Try-On Focus):?\*\*\s*([^*]+(?:\*(?!\*)[^*]*)*)/);
      const styleMatch = itemContent.match(/\*\*Style:?\*\*\s*([^*]+(?:\*(?!\*)[^*]*)*)/);
      
      items.push({
        number: number,
        name: itemName.replace(/\*/g, '').trim(),
        whyItWorks: whyItWorksMatch?.[1]?.replace(/\*/g, '').trim() || '',
        colors: colorsMatch?.[1]?.replace(/\*/g, '').trim() || '',
        details: detailsMatch?.[1]?.replace(/\*/g, '').trim() || '',
        style: styleMatch?.[1]?.replace(/\*/g, '').trim() || '',
        // Store full content as fallback
        fullContent: itemContent.replace(/\*+/g, '').trim()
      });
    }
    
    // If no items found with the above pattern, try alternative parsing
    if (items.length === 0) {
      // Try to split by numbered items (1. 2. 3. etc)
      const altMatches = itemsText.matchAll(/(\d+)\.\s*\*\*(.+?)\*\*([^]*?)(?=\d+\.\s*\*\*|$)/gi);
      
      for (const match of altMatches) {
        const [, number, title, content] = match;
        items.push({
          number: number,
          name: title.replace(/^Item:\s*/i, '').trim(),
          fullContent: content.replace(/\*+/g, '').trim(),
          whyItWorks: '',
          colors: '',
          details: ''
        });
      }
    }
    
    return { analysis, items };
  };

  const { analysis, items } = parseRecommendations(recommendations);

  const toggleItem = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // If no items parsed, show the raw content in a formatted way
  if (items.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <h2 className="text-2xl font-bold">AI Style Recommendations</h2>
          </div>
        </div>
        <div className="bg-white border-x border-b rounded-b-xl p-6">
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: recommendations.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <h2 className="text-2xl font-bold">AI Style Recommendations</h2>
        </div>
        <p className="text-white/90 text-sm">
          {items.length} personalized fashion recommendations for your virtual try-on
        </p>
      </div>

      {/* Analysis Section - Only show if we have analysis text */}
      {analysis && (
        <div className="bg-purple-50/50 p-4 border-x">
          <button
            onClick={() => setShowFullAnalysis(!showFullAnalysis)}
            className="w-full flex items-center justify-between text-left hover:bg-purple-100/50 rounded-lg p-2 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-gray-800">Style Analysis</h3>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-400 transform transition-transform ${showFullAnalysis ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showFullAnalysis && (
            <div className="mt-3 p-4 bg-white rounded-lg border border-purple-100">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {analysis}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recommendations Cards */}
      <div className="bg-white border-x border-b rounded-b-xl">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Outfit Recommendations
          </h3>
          
          <div className="space-y-3">
            {items.map((item, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200"
              >
                {/* Item Header - Always Visible */}
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full p-4 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-semibold">{item.number || index + 1}</span>
                      </div>
                      <div className="text-left flex-1">
                        <h4 className="font-semibold text-gray-800 text-base">
                          {item.name}
                        </h4>
                        {!expandedItems[index] && item.whyItWorks && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {item.whyItWorks.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transform transition-transform duration-200 ${expandedItems[index] ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded Content with Animation */}
                <div className={`transition-all duration-300 ${expandedItems[index] ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  <div className="p-4 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100 space-y-3">
                    
                    {/* Why It Works Section */}
                    {item.whyItWorks && (
                      <div className="bg-white p-4 rounded-lg border border-purple-100">
                        <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <span className="text-purple-500">✓</span> Why This Works
                        </h5>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.whyItWorks}
                        </p>
                      </div>
                    )}

                    {/* Colors Section */}
                    {item.colors && (
                      <div className="bg-white p-4 rounded-lg border border-pink-100">
                        <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <span className="text-pink-500">🎨</span> Color Options
                        </h5>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.colors}
                        </p>
                      </div>
                    )}

                    {/* Style Section */}
                    {item.style && (
                      <div className="bg-white p-4 rounded-lg border border-blue-100">
                        <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <span className="text-blue-500">👔</span> Style Details
                        </h5>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.style}
                        </p>
                      </div>
                    )}

                    {/* Try-On Details Section */}
                    {item.details && (
                      <div className="bg-white p-4 rounded-lg border border-green-100">
                        <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <span className="text-green-500">👗</span> Virtual Try-On Tips
                        </h5>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.details}
                        </p>
                      </div>
                    )}

                    {/* If only fullContent is available (fallback) */}
                    {!item.whyItWorks && !item.colors && !item.details && item.fullContent && (
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {item.fullContent}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow">
                        Try This Look
                      </button>
                      <button className="flex-1 py-2.5 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-medium text-gray-700">
                        Save for Later
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
          <p className="text-sm text-gray-600">
            AI Confidence: High Match Accuracy
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors">
              Regenerate
            </button>
            <button className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors">
              Apply All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStyleRecommendations;
