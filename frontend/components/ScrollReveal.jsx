"use client";
import Box from "@mui/material/Box";
import useInView from "@/hooks/useInView";

// Wraps a section/card so it settles into place as it scrolls into the
// viewport — exactly the "upar se niche visible hote jaana" behaviour.
export default function ScrollReveal({ children, delay = 0, y = 24, sx = {} }) {
  const [ref, inView] = useInView();

  return (
    <Box
      ref={ref}
      sx={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: "opacity, transform",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
