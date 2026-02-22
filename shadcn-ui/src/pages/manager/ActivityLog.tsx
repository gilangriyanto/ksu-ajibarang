import React, { useState, useEffect, useCallback } from "react";
import { ManagerLayout } from "@/components/layout/ManagerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Activity, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Server, 
  Clock, 
  Loader2,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import activityLogService, { ActivityLog as ActivityLogType, ActivityLogStats, PaginatedResponse } from "@/lib/api/activityLog.service";
import memberService from "@/lib/api/member.service";
import { toast } from "sonner";

export default function ActivityLog() {
  // State for data
  const [logs, setLogs] = useState<ActivityLogType[]>([]);
  const [stats, setStats] = useState<ActivityLogStats | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });
  
  // State for UI
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [filterActivity, setFilterActivity] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // State for Detail Modal
  const [selectedLog, setSelectedLog] = useState<ActivityLogType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchLogs = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params: any = {
        page,
        per_page: 15,
      };

      if (searchTerm) params.search = searchTerm;
      if (filterModule !== "all") params.module = filterModule;
      if (filterActivity !== "all") params.activity = filterActivity;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await activityLogService.getAll(params);
      
      // Handle paginated response
      if (response && 'meta' in response) {
        const meta = (response as any).meta;
        setLogs(response.data as ActivityLogType[]);
        setPagination({
          current_page: meta.current_page,
          last_page: meta.last_page,
          per_page: meta.per_page,
          total: meta.total
        });
      } else if (response && 'current_page' in response) {
         // Fallback for simple pagination
        setLogs((response as any).data as ActivityLogType[]);
        setPagination({
          current_page: +(response as any).current_page,
          last_page: +(response as any).last_page,
          per_page: +(response as any).per_page,
          total: +(response as any).total
        });
      } else {
        // Fallback if the response is an array
        const dataArr = response as unknown as ActivityLogType[];
        setLogs(dataArr);
        setPagination({
          current_page: 1,
          last_page: 1,
          per_page: dataArr.length,
          total: dataArr.length
        });
      }
    } catch (err: any) {
      console.error("Error fetching logs:", err);
      setError(err.message || "Gagal memuat log aktivitas");
      toast.error("Gagal memuat log aktivitas");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterModule, filterActivity, startDate, endDate]);

  const fetchStats = async () => {
    try {
      setIsStatsLoading(true);
      const data = await activityLogService.getStatistics();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
    fetchStats();
  }, [fetchLogs]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      fetchLogs(newPage);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterModule("all");
    setFilterActivity("all");
    setStartDate("");
    setEndDate("");
  };

  const viewDetails = async (id: number) => {
    try {
        const log = await activityLogService.getById(id);
        setSelectedLog(log);
        setIsDetailModalOpen(true);
    } catch (error) {
        toast.error("Gagal memuat detail log");
    }
  };

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case 'create': return 'bg-green-100 text-green-800 border-green-200';
      case 'update': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delete': return 'bg-red-100 text-red-800 border-red-200';
      case 'login': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Log Aktivitas</h1>
            <p className="text-gray-600 mt-1">Pemantauan aktivitas sistem dan pengguna</p>
          </div>
          <Button onClick={() => { fetchLogs(1); fetchStats(); }} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>

        {/* Stats Grid */}
        {!isStatsLoading && stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Aktivitas</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_activities}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Aktivitas Hari Ini</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.today}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg text-green-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pembuatan Data</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.by_activity.create || 0}</p>
                  </div>
                  <div className="p-3 bg-teal-100 rounded-lg text-teal-600">
                    <Server className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Penghapusan Data</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.by_activity.delete || 0}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg text-red-600">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>)}
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Pencarian</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    placeholder="Cari deskripsi / nama pengguna..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-48 space-y-2">
                <label className="text-sm font-medium">Modul</label>
                <Select value={filterModule} onValueChange={setFilterModule}>
                  <SelectTrigger><SelectValue placeholder="Semua Modul" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Modul</SelectItem>
                    <SelectItem value="savings">Simpanan</SelectItem>
                    <SelectItem value="loans">Pinjaman</SelectItem>
                    <SelectItem value="users">Pengguna</SelectItem>
                    <SelectItem value="auth">Autentikasi</SelectItem>
                    <SelectItem value="accounting">Akuntansi</SelectItem>
                    <SelectItem value="cash">Kas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48 space-y-2">
                <label className="text-sm font-medium">Aktivitas</label>
                <Select value={filterActivity} onValueChange={setFilterActivity}>
                  <SelectTrigger><SelectValue placeholder="Semua Aktivitas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Aktivitas</SelectItem>
                    <SelectItem value="create">Tambah Data</SelectItem>
                    <SelectItem value="update">Ubah Data</SelectItem>
                    <SelectItem value="delete">Hapus Data</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-36 space-y-2">
                <label className="text-sm font-medium">Dari Tanggal</label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="w-full md:w-36 space-y-2">
                <label className="text-sm font-medium">Sampai Tanggal</label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <Button onClick={handleResetFilters} variant="secondary" className="whitespace-nowrap">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-700">Waktu</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Pengguna</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Modul</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Tipe Aktivitas</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Deskripsi</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="h-32 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Memuat data log...</p>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-32 text-center text-gray-500">
                      Tidak ada log yang ditemukan. Coba ubah filter pencarian.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{log.user?.full_name || 'System'}</div>
                        {log.user?.employee_id && (
                          <div className="text-xs text-gray-500">ID: {log.user.employee_id}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-gray-700">{log.module_name || log.module}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`capitalize border shadow-none ${getActivityColor(log.activity)}`}>
                          {log.activity_name || log.activity}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-700 max-w-md truncate">
                        {log.description}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => viewDetails(log.id)}
                          className="hover:bg-blue-50 text-blue-600"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!isLoading && pagination.last_page > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-600">
                Menampilkan {(pagination.current_page - 1) * pagination.per_page + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} log
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={pagination.current_page === 1}
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                  // Show pages around current page
                  let pageNum = i + 1;
                  if (pagination.last_page > 5 && pagination.current_page > 3) {
                    pageNum = pagination.current_page - 2 + i;
                    if (pageNum > pagination.last_page) return null;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.current_page === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-9"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Log Aktivitas</DialogTitle>
            <DialogDescription>
              Rincian perubahan data dan informasi operasional
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Waktu Aktivitas</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedLog.created_at)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Pelaku (Pengguna)</p>
                  <p className="font-medium text-gray-900">{selectedLog.user?.full_name || 'System'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Modul / Jenis</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedLog.module_name || selectedLog.module}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Aktivitas</p>
                  <Badge className={`capitalize shadow-none border ${getActivityColor(selectedLog.activity)}`}>
                    {selectedLog.activity_name || selectedLog.activity}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">IP Address</p>
                  <p className="font-medium font-mono text-gray-900 text-sm">{selectedLog.ip_address || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Perangkat / Browser</p>
                  <p className="text-sm text-gray-900 line-clamp-2" title={selectedLog.user_agent}>{selectedLog.user_agent || "N/A"}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Keterangan / Deskripsi</p>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-800 text-sm">
                  {selectedLog.description}
                </div>
              </div>

              {/* Data Changes Display */}
              {(selectedLog.old_data || selectedLog.new_data) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-sm font-bold text-red-600 mb-2">Data Sebelumnya (Old)</p>
                    <div className="bg-red-50 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-red-100">
                      <pre>{selectedLog.old_data ? JSON.stringify(selectedLog.old_data, null, 2) : "Tidak ada data sebelumnya"}</pre>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-600 mb-2">Data Baru (New)</p>
                    <div className="bg-green-50 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-green-100">
                      <pre>{selectedLog.new_data ? JSON.stringify(selectedLog.new_data, null, 2) : "Tidak ada data baru"}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ManagerLayout>
  );
}
