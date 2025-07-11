"use client";

import React, { useEffect, useRef } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import { FileText, CheckCircle, AlertCircle, Megaphone, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface HowItWorksProps {
  className?: string;
}

interface StepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: number;
  isActive?: boolean;
  isCompleted?: boolean;
}

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const iconVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
    },
  },
};

const lineVariants: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.6,
      delay: 0.3,
    },
  },
};

// Step component
const Step = ({ icon, title, description, step, isActive = false, isCompleted = false }: StepProps) => {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "flex flex-col items-center text-center space-y-4 p-6",
        isActive && "text-primary",
        isCompleted && "text-muted-foreground"
      )}
    >
      <motion.div
        variants={iconVariants}
        className={cn(
          "relative mb-2 flex h-16 w-16 items-center justify-center rounded-full border-2 bg-white shadow-md",
          isActive ? "border-[#2E7D32] bg-[#2E7D32]/5" : "border-gray-300"
        )}
      >
        {icon}
        {/* Step number */}
        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#2E7D32] text-xs font-bold text-white">
          {step}
        </div>
      </motion.div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="max-w-xs text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

// Connector line between steps
const StepConnector = ({ isActive = false }: { isActive?: boolean }) => {
  return (
    <div className="relative hidden h-1 flex-1 mx-4 md:flex items-center">
      <motion.div
        variants={lineVariants}
        className={cn(
          "absolute h-full w-full rounded-full", 
          isActive ? "bg-[#2E7D32]" : "bg-gray-300"
        )}
      />
    </div>
  );
};

// Main component
const HowItWorks = ({ className }: HowItWorksProps) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          controls.start("visible");
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [controls]);

  const steps = [
    {
      icon: <Megaphone className="h-8 w-8 text-[#2E7D32]" />,
      title: "Buat Laporan",
      description: "Laporkan masalah atau usulan untuk desa Anda melalui aplikasi dengan mudah dan cepat.",
      step: 1,
      isActive: true,
      isCompleted: false,
    },
    {
      icon: <Activity className="h-8 w-8 text-[#2E7D32]" />,
      title: "Tindak Lanjut",
      description: "Perangkat desa akan menerima dan memproses laporan Anda untuk ditindaklanjuti.",
      step: 2,
      isActive: false,
      isCompleted: false,
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-[#2E7D32]" />,
      title: "Penyelesaian",
      description: "Dapatkan update status penyelesaian masalah dan lihat hasilnya secara transparan.",
      step: 3,
      isActive: false,
      isCompleted: false,
    },
  ];

  return (
    <section className={cn("py-20 md:py-28 bg-gray-50", className)}>
      <div className="container px-4 md:px-6">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="space-y-16"
        >
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Cara Kerja Desa Pangkalan Baru
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Tiga langkah sederhana untuk menghubungkan masyarakat dengan pemerintah desa
            </p>
          </motion.div>

          <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:items-center md:gap-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.step}>
                <Step {...step} />
                {index < steps.length - 1 && <StepConnector isActive={true} />}
              </React.Fragment>
            ))}
          </div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center gap-4 pt-8 md:flex-row md:gap-6"
          >
            <motion.a
              href="/submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-6 py-3 bg-[#2E7D32] text-white font-medium rounded-lg shadow-sm hover:bg-[#1B5E20] transition-colors"
            >
              <Megaphone className="w-4 h-4 mr-2" />
              Mulai Sekarang
            </motion.a>
            <motion.a
              href="/track"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-6 py-3 border border-[#2E7D32] text-[#2E7D32] font-medium rounded-lg hover:bg-[#2E7D32] hover:text-white transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Lacak Laporan
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export { HowItWorks };