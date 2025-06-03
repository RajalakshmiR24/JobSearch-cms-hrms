import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const categories = [
  { title: 'Graphics & Design', icon: '🎨' },
  { title: 'Code & Programming', icon: '</>' },
  { title: 'Digital Marketing', icon: '📣' },
  { title: 'Video & Animation', icon: '🎥' },
  { title: 'Music & Audio', icon: '🎵' },
  { title: 'Account & Finance', icon: '📊' },
  { title: 'Health & Care', icon: '🩺' },
  { title: 'Data & Science', icon: '🗄️' },
];

const Category = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const { categoryCount } = useSelector((state) => state.jobs); // dynamic count from API

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : categories.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % categories.length);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Popular Categories</h2>
        <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded text-sm hover:bg-blue-50 transition">
          View All →
        </button>
      </div>

      {/* Mobile view: swipeable single item */}
      <div className="block md:hidden relative">
        <div className="flex items-center justify-between">
          <button onClick={handlePrev} className="p-2">
            <ChevronLeft className="w-6 h-6 text-blue-600" />
          </button>

          <div className="flex-1 px-4">
            {categories.slice(activeIndex, activeIndex + 1).map((cat, idx) => {
              const isActive = selected === idx;
              const count = categoryCount?.[cat.title] || 0;

              return (
                <div
                  key={cat.title}
                  onClick={() => setSelected(idx)}
                  className={`flex items-center p-4 rounded-lg transition duration-300 cursor-pointer ${
                    isActive ? 'bg-blue-600 shadow-lg' : 'bg-[#f0f8ff]'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 text-2xl rounded-lg mr-4 ${
                      isActive ? 'bg-blue-800 text-white' : 'bg-[#e6f2ff] text-blue-600'
                    }`}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className={`font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {cat.title}
                    </h3>
                    <p className={`text-sm ${isActive ? 'text-[#ddeafd]' : 'text-gray-600'}`}>
                      {count} Open position
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={handleNext} className="p-2">
            <ChevronRight className="w-6 h-6 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Tablet & Desktop view: grid layout */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((cat, idx) => {
          const isActive = selected === idx;
          const count = categoryCount?.[cat.title] || 0;

          return (
            <button
              key={cat.title}
              onClick={() => setSelected(idx)}
              className={`flex items-center p-4 rounded-lg transition duration-300 ${
                isActive ? 'bg-blue-600 shadow-lg' : 'bg-[#f0f8ff]'
              }`}
            >
              <div
                className={`flex items-center justify-center w-12 h-12 text-2xl rounded-lg mr-4 ${
                  isActive ? 'bg-blue-800 text-white' : 'bg-[#e6f2ff] text-blue-600'
                }`}
              >
                {cat.icon}
              </div>
              <div>
                <h3 className={`font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                  {cat.title}
                </h3>
                <p className={`text-sm ${isActive ? 'text-[#ddeafd]' : 'text-gray-600'}`}>
                  {count} Open position
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default Category;
