import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useThemeStore } from '../store/useThemeStore'

export default function CustomCursor() {
  const { customCursor } = useThemeStore()
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  // Smooth spring physics for cartoon-like lag
  const springConfig = { damping: 25, stiffness: 220, mass: 0.6 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    if (!customCursor) {
      document.body.classList.remove('custom-cursor-active')
      return;
    }

    const moveCursor = (e: PointerEvent) => {
      // Only make visible when pointer actually moves
      setIsVisible(true);
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.classList.contains('cursor-pointer') ||
        target.style.cursor === 'pointer';

      setIsHovered(!!isInteractive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('pointermove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);

    document.body.classList.add('custom-cursor-active');

    return () => {
      window.removeEventListener('pointermove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.body.classList.remove('custom-cursor-active');
    };
  }, [customCursor, cursorX, cursorY]);

  if (!customCursor || !isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border-3 border-slate-800 dark:border-slate-200 bg-brand-primary/40 pointer-events-none z-[9999] hidden md:block"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        scale: isHovered ? 1.6 : 1,
      }}
      animate={{
        scale: isHovered ? 1.6 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30
      }}
    />
  )
}
