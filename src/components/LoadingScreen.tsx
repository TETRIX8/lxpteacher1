
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Book, Users, TrendingUp } from 'lucide-react';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIcon, setCurrentIcon] = useState(0);

  const icons = [
    { icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-100' },
    { icon: Book, color: 'text-green-500', bg: 'bg-green-100' },
    { icon: Users, color: 'text-purple-500', bg: 'bg-purple-100' },
    { icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-100' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 3000);

    const iconTimer = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 600);

    return () => {
      clearTimeout(timer);
      clearInterval(iconTimer);
    };
  }, [onLoadingComplete, icons.length]);

  if (!isVisible) return null;

  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center space-y-8">
        {/* Логотип с анимацией */}
        <motion.div
          className="relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-edu-primary to-edu-secondary rounded-full flex items-center justify-center shadow-2xl">
            <motion.div
              key={currentIcon}
              initial={{ scale: 0.5, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              {React.createElement(icons[currentIcon].icon, {
                className: `w-12 h-12 text-white`,
              })}
            </motion.div>
          </div>
          
          {/* Пульсирующие круги */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-edu-primary/20"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-edu-secondary/20"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </motion.div>

        {/* Заголовок */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-edu-primary via-purple-600 to-edu-secondary bg-clip-text text-transparent mb-4">
            Кабинет преподавателя
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Загрузка системы...
          </p>
        </motion.div>

        {/* Прогресс бар */}
        <motion.div 
          className="w-80 max-w-full mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="relative">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-edu-primary to-edu-secondary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />
            </div>
            
            {/* Точки загрузки */}
            <motion.div
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-500 dark:text-gray-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Загрузка<span className="loading-dots"></span>
            </motion.div>
          </div>
        </motion.div>

        {/* Дополнительная информация */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-center space-y-2"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Система управления образовательным процессом
          </p>
          <div className="flex justify-center space-x-4 text-xs text-gray-400 dark:text-gray-500">
            <span>Безопасность</span>
            <span>•</span>
            <span>Производительность</span>
            <span>•</span>
            <span>Удобство</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
