"use client";

import { motion } from "framer-motion";
import { fields } from "../lib/constants"
import { cardVariants } from "../lib/animation-variants";

interface FieldSelectionProps {
  onFieldSelect: (field: string) => void;
}

export const FieldSelection = ({ onFieldSelect }: FieldSelectionProps) => {
  return (
    <>
      {Object.entries(fields).map(([field, { icon: Icon, color }]) => (
        <motion.button
          key={field}
          variants={cardVariants}
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onFieldSelect(field)}
          className={`relative group p-8 rounded-2xl bg-gray-800/30 backdrop-blur-lg 
                    border border-gray-700 hover:border-gray-500 transition-all duration-300
                    overflow-hidden`}
        >
          <div className="relative z-10">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${color} 
                          p-3 mb-6 shadow-lg transform group-hover:scale-110 transition-transform`}>
              <Icon className="w-full h-full text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{field}</h3>
            <p className="text-gray-400 text-sm">
              {fields[field as keyof typeof fields].subFields.length} specializations
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.button>
      ))}
    </>
  );
};