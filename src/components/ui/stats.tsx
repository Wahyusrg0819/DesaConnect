"use client";

import * as React from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { ArrowDown, ArrowUp, ClipboardList, CheckCircle2, Activity } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// Type definitions
interface StatItem {
  id: string;
  title: string;
  value: number;
  change?: number;
  trend?: "up" | "down";
  icon: React.ReactNode;
  color: string;
  href?: string;
}

interface StatCardProps {
  item: StatItem;
}

const StatCard: React.FC<StatCardProps> = ({ item }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: item.id === "total" ? 0 : item.id === "processing" ? 0.1 : 0.2 }}
    >
      <Card className="overflow-hidden shadow-lg border-0 hover:shadow-xl transition-all">
        <CardContent className="p-6">
          <div className="flex items-start justify-between space-x-2">
            <span className="truncate text-sm text-muted-foreground">
              {item.title}
            </span>
            {item.change && item.trend && (
              <div
                className={`flex items-center gap-1 text-sm font-medium rounded-full px-2 py-1 ${
                  item.trend === "up"
                    ? item.id === "total" 
                      ? "text-emerald-700 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30"
                      : "text-red-700 dark:text-red-500 bg-red-100 dark:bg-red-900/30"
                    : "text-emerald-700 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30"
                }`}
              >
                {item.trend === "up" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {Math.abs(item.change)}%
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className={`p-3 rounded-full ${item.color}`}>
              {item.icon}
            </div>
            <div className="mt-1 text-3xl font-semibold text-foreground">
              <CountUp
                start={0}
                end={item.value}
                duration={2}
                separator=","
              />
            </div>
          </div>
        </CardContent>
        {item.href && (
          <CardFooter className="flex justify-end border-t border-border p-0">
            <a
              href={item.href}
              className="px-6 py-3 text-sm font-medium text-primary hover:text-primary/90 transition-colors"
            >
              Lihat detail →
            </a>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

interface StatsProps {
  total: number;
  processing: number;
  completed: number;
  className?: string;
}

const Stats: React.FC<StatsProps> = ({ total, processing, completed, className }) => {
  const statsData: StatItem[] = [
    {
      id: "total",
      title: "Total Laporan",
      value: total,
      icon: <ClipboardList className="h-5 w-5 text-white" />,
      color: "bg-[#2E7D32]",
    },
    {
      id: "processing",
      title: "Sedang Diproses",
      value: processing,
      icon: <Activity className="h-5 w-5 text-white" />,
      color: "bg-[#E65100]",
    },
    {
      id: "completed",
      title: "Terselesaikan",
      value: completed,
      icon: <CheckCircle2 className="h-5 w-5 text-white" />,
      color: "bg-green-500",
    },
  ];

  return (
    <div className={`w-full py-12 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Statistik Laporan
          </h2>
          <p className="mt-2 text-gray-600">
            Pantau perkembangan laporan masyarakat secara real-time
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsData.map((item) => (
            <StatCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export { Stats };