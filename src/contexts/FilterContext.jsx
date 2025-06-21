import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAvailableWeddingFilters, applyWeddingFilter, removeWeddingFilter } from '../services/eighthWall';
import filtersConfig from '../config/filters.config.json';

const FilterContext = createContext();

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [availableFilters, setAvailableFilters] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterStats, setFilterStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load available filters on mount
  useEffect(() => {
    loadAvailableFilters();
  }, []);

  const loadAvailableFilters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get 8th Wall wedding filters
      const weddingFilters = getAvailableWeddingFilters();
      
      // Merge with config filters for additional metadata
      const enhancedFilters = weddingFilters.map(filter => {
        const configFilter = filtersConfig.filters.find(f => f.id === filter.id);
        return {
          ...filter,
          ...configFilter, // Merge config data (descriptions, thumbnails, etc.)
          enabled: configFilter?.enabled !== false, // Default to enabled
          premium: configFilter?.premium || false,
          stats: filterStats[filter.id] || { uses: 0, rating: 0 }
        };
      });

      setAvailableFilters(enhancedFilters);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load filters:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const applyFilter = async (filterId) => {
    try {
      if (!filterId) {
        removeFilter();
        return;
      }

      const filter = availableFilters.find(f => f.id === filterId);
      if (!filter) {
        throw new Error(`Filter ${filterId} not found`);
      }

      // Apply the 8th Wall filter
      const success = await applyWeddingFilter(filter);
      
      if (success) {
        setActiveFilter(filter);
        
        // Update filter usage stats
        updateFilterStats(filterId, { 
          uses: (filterStats[filterId]?.uses || 0) + 1,
          lastUsed: new Date().toISOString()
        });
        
        console.log(`Applied filter: ${filter.name}`);
      } else {
        throw new Error('Failed to apply filter');
      }
    } catch (err) {
      console.error('Filter application error:', err);
      setError(err.message);
      throw err;
    }
  };

  const removeFilter = async () => {
    try {
      if (activeFilter) {
        await removeWeddingFilter();
        setActiveFilter(null);
        console.log('Filter removed');
      }
    } catch (err) {
      console.error('Filter removal error:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateFilterStats = (filterId, newStats) => {
    setFilterStats(prev => ({
      ...prev,
      [filterId]: {
        ...prev[filterId],
        ...newStats
      }
    }));
  };

  const getFiltersByCategory = (category) => {
    return availableFilters.filter(filter => 
      filter.category === category && filter.enabled
    );
  };

  const getPopularFilters = (limit = 5) => {
    return availableFilters
      .filter(filter => filter.enabled)
      .sort((a, b) => (filterStats[b.id]?.uses || 0) - (filterStats[a.id]?.uses || 0))
      .slice(0, limit);
  };

  const searchFilters = (query) => {
    const lowercaseQuery = query.toLowerCase();
    return availableFilters.filter(filter =>
      filter.enabled && (
        filter.name.toLowerCase().includes(lowercaseQuery) ||
        filter.description?.toLowerCase().includes(lowercaseQuery) ||
        filter.category.toLowerCase().includes(lowercaseQuery)
      )
    );
  };

  const value = {
    // State
    availableFilters,
    activeFilter,
    filterStats,
    isLoading,
    error,
    
    // Actions
    applyFilter,
    removeFilter,
    updateFilterStats,
    loadAvailableFilters,
    
    // Utilities
    getFiltersByCategory,
    getPopularFilters,
    searchFilters,
    
    // Categories
    weddingFilters: getFiltersByCategory('wedding'),
    romanticFilters: getFiltersByCategory('romantic'),
    frameFilters: getFiltersByCategory('frame'),
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};