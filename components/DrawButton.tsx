"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface DrawButtonProps {
  onClick: () => void;
  disabled: boolean;
  isDrawing: boolean;
}

export function DrawButton({ onClick, disabled, isDrawing }: DrawButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        onClick={onClick}
        disabled={disabled || isDrawing}
        size="lg"
        className="relative w-full max-w-md bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-bold shadow-lg"
      >
        {isDrawing ? (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Sparkles className="animate-spin" />
            <span>Kura Çekiliyor...</span>
          </motion.div>
        ) : (
          <>
            <motion.span
              initial={{ scale: 1 }}
              animate={isDrawing ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              Kura Çek
            </motion.span>
          </>
        )}
      </Button>
    </motion.div>
  );
}

