import React from 'react';
import { AnimatePresence } from 'framer-motion';

// Sayfa geçiş animasyonları
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96],
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
};

// Liste eleman animasyonları
export const listItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  }),
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.3,
    },
  },
};

// Kart animasyonları - Yükseltildi
export const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 40 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  }),
  hover: {
    scale: 1.05,
    y: -10,
    boxShadow: "0px 15px 35px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.98,
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.15,
      ease: "easeInOut",
    },
  },
};

// 3D Kart Efekti
export const card3DVariants = {
  initial: { 
    rotateX: 0, 
    rotateY: 0, 
    z: 0, 
    scale: 1,
  },
  hover: (direction) => {
    return {
      rotateX: direction.y * 10,
      rotateY: direction.x * -10,
      z: 100,
      boxShadow: `${direction.x * -15}px ${direction.y * -15}px 30px rgba(0, 0, 0, 0.15)`,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    };
  },
  exit: {
    rotateX: 0,
    rotateY: 0,
    z: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Fade animasyonları
export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  }),
};

export const fadeInLeftVariants = {
  hidden: { opacity: 0, x: -60 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  }),
};

export const fadeInRightVariants = {
  hidden: { opacity: 0, x: 60 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  }),
};

// Gelişmiş Fade animasyonları
export const fadeInScaleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

export const fadeInBlurVariants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: (i = 0) => ({
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

// Dialog/Modal animasyonları - Geliştirildi
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.3,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
};

// Backdrop animasyonları
export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      delay: 0.2,
      duration: 0.3,
      ease: "easeOut",
    }
  },
};

// Özel AnimatePresence bileşeni - JSX içeriyor, bu yüzden dosya uzantısı .jsx olmalı
export const MotionAnimatePresence = ({ children, ...props }) => {
  return (
    <AnimatePresence mode="wait" {...props}>
      {children}
    </AnimatePresence>
  );
};

// Animasyon easeInOut değerleri
export const easeInOut = [0.43, 0.13, 0.23, 0.96];

// Stagger değerleri - Geliştirildi
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
      ease: "easeOut",
    },
  },
};

// Staggered fading container
export const staggeredFadeContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
      ease: "easeOut",
      duration: 0.5,
    },
  },
};

// Logo animasyonu - Geliştirildi
export const logoVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    filter: "drop-shadow(0px 5px 10px rgba(0, 0, 0, 0.2))",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

// Button animasyonları - Geliştirildi
export const buttonVariants = {
  initial: {
    scale: 1,
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
  },
  hover: {
    scale: 1.05,
    y: -2,
    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.12)",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.95,
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.15,
      ease: "easeInOut",
    },
  },
};

// İçerik kaydırma animasyonu
export const scrollRevealVariants = {
  hidden: { opacity: 0, y: 75 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
};

// Kenarlık animasyonu (border)
export const borderAnimationVariants = {
  initial: { 
    pathLength: 0,
    pathOffset: 1,
  },
  animate: { 
    pathLength: 1,
    pathOffset: 0,
    transition: { 
      duration: 1.5, 
      ease: "easeInOut" 
    } 
  },
};

// Yükleme animasyonu - Geliştirildi
export const loadingContainerVariants = {
  start: {
    transition: {
      staggerChildren: 0.1,
    },
  },
  end: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const loadingCircleVariants = {
  start: {
    y: "0%",
  },
  end: {
    y: "100%",
  },
};

export const loadingCircleTransition = {
  duration: 0.4,
  yoyo: Infinity,
  ease: "easeInOut",
};

// Modern Bounce animasyonu
export const bounceVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1, 1.05, 1],
    transition: {
      duration: 1,
      times: [0, 0.25, 0.5, 0.75, 1],
      repeat: Infinity,
      repeatDelay: 1,
    },
  },
};

// Yazı efekti animasyonu
export const textRevealVariants = {
  hidden: {
    opacity: 0,
    y: 100,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
};

// Dönen elemean animasyonu
export const spinVariants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: { 
      duration: 2,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

// Dashboard kart animasyonu
export const dashboardCardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  }),
  hover: {
    y: -10,
    boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.15)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Dalgalı animasyon
export const waveVariants = {
  hidden: { pathLength: 0, pathOffset: 1 },
  visible: {
    pathLength: 1,
    pathOffset: 0,
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

// Veri görselleştirme animasyonları
export const barChartVariants = {
  hidden: { scaleY: 0, opacity: 0, originY: 1 },
  visible: (i) => ({
    scaleY: 1,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: "easeOut",
    },
  }),
};

// Yardımcı fonksiyonlar
export const getStaggerDelay = (index, baseDelay = 0.1) => index * baseDelay; 