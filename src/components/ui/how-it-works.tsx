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
        "flex flex-col items-center text-center md:items-start md:text-left",
        isActive && "text-primary",
        isCompleted && "text-muted-foreground"
      )}
    >
      <motion.div
        variants={iconVariants}
        className={cn(
          "mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2",
          isActive ? "border-[#2E7D32] bg-[#2E7D32]/10" : "border-muted bg-muted/30"
        )}
      >
        {icon}
      </motion.div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="max-w-xs text-muted-foreground">{description}</p>
    </motion.div>
  );
};

// Connector line between steps
const StepConnector = ({ isActive = false }: { isActive?: boolean }) => {
  return (
    <div className="relative hidden h-0.5 flex-1 md:flex">
      <motion.div
        variants={lineVariants}
        className={cn("absolute h-full w-full", isActive ? "bg-[#2E7D32]" : "bg-muted")}
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
      icon: <Activity className="h-8 w-8 text-[#0D47A1]" />,
      title: "Tindak Lanjut",
      description: "Perangkat desa akan menerima dan memproses laporan Anda untuk ditindaklanjuti.",
      step: 2,
      isActive: false,
      isCompleted: false,
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      title: "Penyelesaian",
      description: "Dapatkan update status penyelesaian masalah dan lihat hasilnya secara transparan.",
      step: 3,
      isActive: false,
      isCompleted: false,
    },
  ];

  return (
    <section className={cn("py-16 md:py-24", className)}>
      <div className="container px-4 md:px-6">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="space-y-12"
        >
          <motion.div variants={itemVariants} className="text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Cara Kerja DesaConnect</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Tiga langkah sederhana untuk menghubungkan masyarakat dengan pemerintah desa
            </p>
          </motion.div>

          <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:items-start md:gap-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.step}>
                <Step {...step} />
                {index < steps.length - 1 && <StepConnector isActive={index === 0} />}
              </React.Fragment>
            ))}
          </div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center gap-4 pt-8 md:flex-row"
          >
            <motion.a
              href="/submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg bg-[#2E7D32] px-6 py-3 text-white shadow-lg transition-all hover:shadow-xl"
            >
              Mulai Sekarang
            </motion.a>
            <motion.a
              href="/track"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg border border-input bg-[#0D47A1] px-6 py-3 text-white shadow-sm transition-all hover:bg-[#0A3880]"
            >
              Lacak Laporan
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export { HowItWorks };