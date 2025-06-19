import React, { createContext, useContext, useState, useEffect } from 'react';
import { useConfig } from './ConfigContext';

const FilterContext = createContext();

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [activeFilter, setActiveFilter] = useState(null);
  const [availableFilters, setAvailableFilters] = useState([]);
  const [filterStats, setFilterStats] = useState({});
  const { config } = useConfig();

  useEffect(() => {
    if (config.filters) {
      setAvailableFilters(config.filters.filters || []);
    }
  }, [config]);

  const applyFilter = (filterId) => {
    const filter = availableFilters.find(f => f.id === filterId);
    if (filter && filter.enabled) {
      setActiveFilter(filter);
      updateFilterStats(filterId);
    }
  };

  const removeFilter = () => {
    setActiveFilter(null);
  };

  const updateFilterStats = (filterId) => {
    setFilterStats(prev => ({
      ...prev,
      [filterId]: (prev[filterId] || 0) + 1
    }));
  };

  const getPopularFilters = () => {
    return Object.entries(filterStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([id]) => availableFilters.find(f => f.id === id))
      .filter(Boolean);
  };

  const value = {
    activeFilter,
    availableFilters,
    filterStats,
    applyFilter,
    removeFilter,
    getPopularFilters
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};