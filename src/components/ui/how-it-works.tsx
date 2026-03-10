"use client";

import * as React from "react";
import { FileText, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HowItWorksProps {
  className?: string;
}

export function HowItWorks({ className }: HowItWorksProps) {
  const steps = [
    {
      icon: FileText,
      title: "Buat Laporan",
      description: "Laporkan masalah, aspirasi, atau usulan untuk kemajuan desa secara langsung.",
    },
    {
      icon: Clock,
      title: "Proses Tindak Lanjut",
      description: "Perangkat desa akan segera menindaklanjuti dan melakukan verifikasi laporan Anda.",
    },
    {
      icon: CheckCircle,
      title: "Selesai & Transparan",
      description: "Dapatkan pembaruan status dan buktinya ketika masalah berhasil diselesaikan.",
    },
  ];

  return (
    <section className={`py-16 bg-background border-b border-border ${className || ''}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-2xl font-semibold mb-2">Cara Kerja Sistem</h2>
          <p className="text-muted-foreground text-center">Sampaikan aspirasi Anda dengan langkah mudah</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col p-6 rounded-md border border-border bg-card shadow-none">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary mb-4">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{index + 1}. {step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-10">
          <Button asChild>
            <Link href="/submit">Buat Laporan</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/track">Cek Status Laporan</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
