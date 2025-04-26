"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, MessageSquarePlus, Calendar, UserCircle2, Phone, Tag, Activity, CheckCircle2, AlertTriangle } from "lucide-react";

interface Submission {
  id: string;
  name: string;
  contactInfo: string;
  category: string;
  description: string;
  status: "Pending" | "In Progress" | "Resolved";
  createdAt: string;
  referenceId: string;
  internalNotes?: string;
  priority: "Low" | "Medium" | "High";
}

interface AdminSubmissionDetailProps {
  submission: Submission;
  onStatusChange: (newStatus: "Pending" | "In Progress" | "Resolved") => void;
  onDelete: () => void;
  onUpdate?: (data: Partial<Submission>) => Promise<boolean>;
}

export default function AdminSubmissionDetail({ 
  submission, 
  onStatusChange,
  onDelete,
  onUpdate
}: AdminSubmissionDetailProps) {
  const [internalNotes, setInternalNotes] = useState(submission.internalNotes || "");
  const [isEditing, setIsEditing] = useState(false);
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">(submission.priority);
  const [status, setStatus] = useState<"Pending" | "In Progress" | "Resolved">(submission.status);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = async () => {
    if (!onUpdate) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    try {
      // Kumpulkan data yang diubah untuk dikirim ke backend
      const updatedData: Partial<Submission> = {};

      if (status !== submission.status) {
        updatedData.status = status;
      }

      if (priority !== submission.priority) {
        updatedData.priority = priority;
      }

      if (internalNotes !== submission.internalNotes) {
        updatedData.internalNotes = internalNotes;
      }

      // Jika ada perubahan, kirim ke backend
      if (Object.keys(updatedData).length > 0) {
        const success = await onUpdate(updatedData);
        
        if (success) {
          // Jika berhasil update, keluar dari mode edit
          setIsEditing(false);
        }
      } else {
        // Tidak ada perubahan, keluar dari mode edit
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Fungsi untuk mendapatkan kelas warna berdasarkan status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-gray-100 text-gray-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fungsi untuk mendapatkan kelas warna berdasarkan prioritas
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "bg-blue-100 text-blue-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquarePlus className="h-6 w-6 text-[#4CAF50]" />
            {submission.referenceId}
          </h2>
          <p className="text-gray-500">
            Dikirim pada {new Date(submission.createdAt).toLocaleDateString("id-ID", { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Batal
              </Button>
              <Button 
                className="bg-[#4CAF50] hover:bg-[#3e8e41] text-white" 
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="border-[#2196F3] text-[#2196F3]" 
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (window.confirm("Yakin ingin menghapus laporan ini?")) {
                    onDelete();
                  }
                }}
              >
                Hapus
              </Button>
            </>
          )}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                Deskripsi Laporan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{submission.description}</p>
            </CardContent>
          </Card>

          {/* Catatan Internal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquarePlus className="h-5 w-5 text-[#2196F3]" />
                Catatan Internal
              </CardTitle>
              <CardDescription>
                Catatan ini hanya terlihat oleh admin, tidak ditampilkan kepada publik
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Tambahkan catatan internal di sini..."
                  className="min-h-[150px]"
                  disabled={isSaving}
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-md min-h-[150px] whitespace-pre-line">
                  {internalNotes || "Tidak ada catatan internal."}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5 text-gray-500" />
                Informasi Laporan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
                {isEditing ? (
                  <Select value={status} onValueChange={(value: "Pending" | "In Progress" | "Resolved") => setStatus(value)} disabled={isSaving}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Menunggu</SelectItem>
                      <SelectItem value="In Progress">Sedang Diproses</SelectItem>
                      <SelectItem value="Resolved">Terselesaikan</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status === "Pending" && <Activity className="h-3 w-3 mr-1" />}
                    {status === "In Progress" && <Activity className="h-3 w-3 mr-1" />}
                    {status === "Resolved" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {status}
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Prioritas</div>
                {isEditing ? (
                  <Select value={priority} onValueChange={(value: "Low" | "Medium" | "High") => setPriority(value)} disabled={isSaving}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih prioritas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Rendah</SelectItem>
                      <SelectItem value="Medium">Sedang</SelectItem>
                      <SelectItem value="High">Tinggi</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                    {priority === "High" && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {priority}
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Kategori</div>
                <div className="text-base">{submission.category}</div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  <UserCircle2 className="h-4 w-4 inline mr-1" />
                  Pengirim
                </div>
                <div className="text-base">{submission.name || "Anonim"}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Kontak
                </div>
                <div className="text-base">{submission.contactInfo || "Tidak ada informasi kontak"}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Tanggal Dikirim
                </div>
                <div className="text-base">
                  {new Date(submission.createdAt).toLocaleDateString("id-ID", { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline"
              className={`border-yellow-500 text-yellow-600 ${status === "Pending" ? "bg-yellow-50" : ""}`}
              onClick={() => {
                setStatus("Pending");
                if (!isEditing && onStatusChange) onStatusChange("Pending");
              }}
              disabled={isSaving}
            >
              <Activity className="h-4 w-4 mr-1" />
              Menunggu
            </Button>
            <Button 
              variant="outline"
              className={`border-blue-500 text-blue-600 ${status === "In Progress" ? "bg-blue-50" : ""}`}
              onClick={() => {
                setStatus("In Progress");
                if (!isEditing && onStatusChange) onStatusChange("In Progress");
              }}
              disabled={isSaving}
            >
              <Activity className="h-4 w-4 mr-1" />
              Proses
            </Button>
            <Button 
              variant="outline"
              className={`border-green-500 text-green-600 ${status === "Resolved" ? "bg-green-50" : ""}`}
              onClick={() => {
                setStatus("Resolved");
                if (!isEditing && onStatusChange) onStatusChange("Resolved");
              }}
              disabled={isSaving}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Selesai
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 