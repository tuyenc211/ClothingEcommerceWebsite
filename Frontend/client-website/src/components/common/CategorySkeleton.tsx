import React from "react";

const CategorySkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-2">
            <div className="h-4 bg-gray-300 rounded w-16"></div>
            <div className="h-4 bg-gray-300 rounded w-4"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-96"></div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Skeleton */}
          <div className="w-64 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              {/* Search Skeleton */}
              <div className="mb-6">
                <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                <div className="h-10 bg-gray-300 rounded w-full"></div>
              </div>

              {/* Categories Skeleton */}
              <div className="mb-6">
                <div className="h-5 bg-gray-300 rounded w-20 mb-3"></div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-8 bg-gray-300 rounded w-full"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Price Range Skeleton */}
              <div className="mb-6">
                <div className="h-5 bg-gray-300 rounded w-24 mb-3"></div>
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-8 bg-gray-300 rounded w-full"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Colors Skeleton */}
              <div className="mb-6">
                <div className="h-5 bg-gray-300 rounded w-16 mb-3"></div>
                <div className="grid grid-cols-6 gap-2">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-gray-300 rounded-full"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Clear Button Skeleton */}
              <div className="h-10 bg-gray-300 rounded w-full"></div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1">
            {/* Toolbar Skeleton */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
              <div className="h-4 bg-gray-300 rounded w-32"></div>
              <div className="h-10 bg-gray-300 rounded w-40"></div>
            </div>

            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div className="h-64 bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySkeleton;
