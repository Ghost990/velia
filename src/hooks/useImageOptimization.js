import { useState, useCallback } from 'react';
import ImageOptimizer from '../services/imageOptimizer';
import { useConfig } from '../contexts/ConfigContext';

export const useImageOptimization = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const { config } = useConfig();
  
  const optimizer = new ImageOptimizer(config.optimization || {});

  const optimizeImages = useCallback(async (files) => {
    setIsOptimizing(true);
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFile(file.name);
      setProgress(((i + 1) / files.length) * 100);
      
      try {
        const result = await optimizer.optimizeImage(file);
        results.push(result);
      } catch (error) {
        console.error(`Optimalizálási hiba: ${file.name}`, error);
        results.push({ error: error.message, file });
      }
    }
    
    setIsOptimizing(false);
    setProgress(100);
    return results;
  }, [optimizer]);

  const optimizeSingle = useCallback(async (file, options) => {
    setIsOptimizing(true);
    setCurrentFile(file.name);
    
    try {
      const result = await optimizer.optimizeImage(file, options);
      setIsOptimizing(false);
      return result;
    } catch (error) {
      setIsOptimizing(false);
      throw error;
    }
  }, [optimizer]);

  return {
    optimizeImages,
    optimizeSingle,
    isOptimizing,
    progress,
    currentFile
  };
};