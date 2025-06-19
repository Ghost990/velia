import React, { createContext, useContext, useState, useEffect } from 'react';

const ConfigContext = createContext();

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      // Load all configuration files
      const [wedding, optimization, filters] = await Promise.all([
        import('../config/wedding.config.json'),
        import('../config/optimization.config.json'),
        import('../config/filters.config.json')
      ]);

      setConfig({
        wedding: wedding.default,
        optimization: optimization.default,
        filters: filters.default
      });
    } catch (error) {
      console.error('Failed to load configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (section, newConfig) => {
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], ...newConfig }
    }));
  };

  const value = {
    config,
    loading,
    updateConfig,
    reloadConfig: loadConfigs
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};