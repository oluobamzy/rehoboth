'use client';

export default function AdminEventFilters({ filters, onFilterChange }) {
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value || null });
  };
  
  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // If needed, can handle specific search behavior here
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <form onSubmit={handleSearchSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search input */}
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
              Search Events
            </label>
            <input
              type="text"
              id="query"
              name="query"
              value={filters.query || ''}
              onChange={handleInputChange}
              placeholder="Search by title or description"
              className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            />
          </div>
          
          {/* Event type filter */}
          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              id="eventType"
              name="eventType"
              value={filters.eventType || ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="service">Service</option>
              <option value="study">Bible Study</option>
              <option value="social">Social</option>
              <option value="outreach">Outreach</option>
            </select>
          </div>
          
          {/* Category filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={filters.category || ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            >
              <option value="">All Categories</option>
              <option value="worship">Worship</option>
              <option value="youth">Youth</option>
              <option value="adult">Adult</option>
              <option value="family">Family</option>
              <option value="missions">Missions</option>
              <option value="community">Community</option>
            </select>
          </div>
          
          {/* Date range */}
          <div>
            <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              id="fromDate"
              name="fromDate"
              value={filters.fromDate || ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            />
          </div>
          
          <div>
            <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              id="toDate"
              name="toDate"
              value={filters.toDate || ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            />
          </div>
          
          {/* Sort options */}
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <div className="flex">
              <select
                id="sortBy"
                name="sortBy"
                value={filters.sortBy}
                onChange={handleInputChange}
                className="w-2/3 border border-gray-300 rounded-l-md shadow-sm px-3 py-2"
              >
                <option value="start_datetime">Date</option>
                <option value="title">Title</option>
                <option value="created_at">Created</option>
                <option value="updated_at">Updated</option>
              </select>
              <select
                id="sortOrder"
                name="sortOrder"
                value={filters.sortOrder}
                onChange={handleInputChange}
                className="w-1/3 border border-gray-300 rounded-r-md shadow-sm px-3 py-2 border-l-0"
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onFilterChange({
              query: '',
              eventType: null,
              category: null,
              fromDate: null,
              toDate: null,
              sortBy: 'start_datetime',
              sortOrder: 'asc'
            })}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
          >
            Clear Filters
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
}
