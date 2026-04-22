/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Camera, 
  Settings, 
  History, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  UserPlus, 
  X, 
  Play, 
  Square,
  ArrowRight,
  Download,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import { cn } from './lib/utils';

// --- TYPES ---
interface LogEntry {
  id: string;
  timestamp: string;
  status: 'Owner' | 'Threat';
  confidence: number;
  imageUrl?: string;
}

interface Owner {
  id: string;
  name: string;
  image: string;
}

// --- MOCK LOGIC ---
const simulateDetection = () => {
  const isUnknown = Math.random() > 0.6;
  const confidence = 0.85 + Math.random() * 0.14;
  return {
    status: isUnknown ? 'Threat' as const : 'Owner' as const,
    confidence
  };
};

export default function App() {
  const [mode, setMode] = useState<'setup' | 'monitoring' | 'analytics'>('setup');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentDetection, setCurrentDetection] = useState<{status: 'Owner' | 'Threat', confidence: number} | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- ACTIONS ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setIsCapturing(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setOwners(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            image: reader.result as string
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const startMonitoring = () => {
    if (owners.length === 0) {
      alert("Please upload at least one owner image first!");
      return;
    }
    setIsMonitoring(true);
    startCamera();
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setCurrentDetection(null);
    stopCamera();
  };

  // Detection loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMonitoring) {
      interval = setInterval(() => {
        const result = simulateDetection();
        setCurrentDetection(result);
        
        const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          status: result.status,
          confidence: result.confidence
        };
        setLogs(prev => [newLog, ...prev]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring]);

  // --- STATS ---
  const stats = {
    total: logs.length,
    owners: logs.filter(l => l.status === 'Owner').length,
    threats: logs.filter(l => l.status === 'Threat').length,
  };

  const chartData = [
    { name: 'Owners', value: stats.owners, color: '#22c55e' },
    { name: 'Threats', value: stats.threats, color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e4e4e7] font-sans selection:bg-primary/30">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#111113] border-r border-[#1f1f23] p-6 hidden md:flex flex-col gap-8 z-50">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">FaceGuard AI</span>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setMode('setup')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              mode === 'setup' ? "bg-white/5 text-white shadow-sm" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            )}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Setup Mode</span>
          </button>
          <button 
            onClick={() => setMode('monitoring')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              mode === 'monitoring' ? "bg-white/5 text-white shadow-sm" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            )}
          >
            <Camera className="w-5 h-5" />
            <span className="font-medium">Monitoring</span>
          </button>
          <button 
            onClick={() => setMode('analytics')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              mode === 'analytics' ? "bg-white/5 text-white shadow-sm" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            )}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-[#1f1f23]">
          <div className="bg-[#18181b] rounded-2xl p-4 border border-[#1f1f23]">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest font-semibold">Security Status</p>
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", isMonitoring ? "bg-green-500 animate-pulse" : "bg-gray-600")} />
              <span className="text-sm font-medium">{isMonitoring ? "Active Monitoring" : "System Idle"}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 p-6 md:p-10 min-h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {mode === 'setup' && "Owner Database Setup"}
              {mode === 'monitoring' && "Real-time AI Surveillance"}
              {mode === 'analytics' && "Detection Intelligence"}
            </h1>
            <p className="text-gray-500">
              {mode === 'setup' && "Register authorized personnel and generate biometrics encodings."}
              {mode === 'monitoring' && "Detecting and identifying unauthorized subjects in live feed."}
              {mode === 'analytics' && "Detailed breakdown of security events and performance metrics."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#111113] border border-[#1f1f23] rounded-button p-1 flex gap-1">
               <button 
                 onClick={() => setMode('setup')}
                 className={cn("px-4 py-1.5 rounded-button text-sm font-medium transition-all", mode === 'setup' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300")}
               >Setup</button>
               <button 
                 onClick={() => setMode('monitoring')}
                 className={cn("px-4 py-1.5 rounded-button text-sm font-medium transition-all", mode === 'monitoring' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300")}
               >Live</button>
               <button 
                 onClick={() => setMode('analytics')}
                 className={cn("px-4 py-1.5 rounded-button text-sm font-medium transition-all", mode === 'analytics' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300")}
               >Stats</button>
            </div>
          </div>
        </header>

        {/* Content Panes */}
        <div className="relative">
          {/* Setup Mode */}
          {mode === 'setup' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-8">
                <section className="bg-[#111113] border border-[#1f1f23] rounded-3xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <UserPlus className="w-32 h-32 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-500" />
                    Register Owners
                  </h3>
                  <div className="border-2 border-dashed border-[#1f1f23] rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 transition-colors bg-[#0d0d0f]">
                    <div className="p-4 bg-blue-500/10 rounded-full">
                      <Camera className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-lg text-white">Upload Portrait Images</p>
                      <p className="text-sm text-gray-500 mt-1">Drag and drop multiple images or click to browse</p>
                    </div>
                    <label className="mt-4 bg-white text-black px-6 py-2.5 rounded-full font-semibold cursor-pointer hover:bg-gray-200 transition-colors active:scale-95 inline-block">
                      Select Files
                      <input type="file" multiple className="hidden" onChange={handleFileUpload} accept="image/*" />
                    </label>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <History className="w-5 h-5 text-gray-400" />
                      Pending Encodings ({owners.length})
                    </h3>
                    <button 
                      onClick={() => setOwners([])}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 uppercase tracking-widest font-bold"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <AnimatePresence>
                      {owners.map((owner) => (
                        <motion.div 
                          key={owner.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="relative aspect-square rounded-2xl overflow-hidden group border border-[#1f1f23]"
                        >
                          <img src={owner.image} alt={owner.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                          <button 
                            onClick={() => setOwners(prev => prev.filter(p => p.id !== owner.id))}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-3 left-3 right-3 truncate text-xs font-medium text-white">
                            {owner.name}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {owners.length === 0 && (
                    <div className="text-center py-20 bg-[#111113] border border-[#1f1f23] rounded-3xl">
                       <p className="text-gray-500">No images uploaded yet</p>
                    </div>
                  )}
                </section>
              </div>

              <div className="space-y-6">
                <div className="bg-[#111113] border border-[#1f1f23] rounded-3xl p-6">
                  <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-400">System Ready Check</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Owner Database</span>
                      {owners.length > 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Biometric Encodings</span>
                      <span className="text-xs bg-[#1f1f23] px-2 py-1 rounded-full text-gray-500">{owners.length > 0 ? "Ready" : "Waiting"}</span>
                    </div>
                  </div>
                  
                  <button 
                    disabled={owners.length === 0}
                    onClick={() => {
                      alert("Owners saved successfully!");
                      setMode('monitoring');
                    }}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group"
                  >
                    Save Owners & Proceed
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Monitoring Mode */}
          {mode === 'monitoring' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-8 space-y-6">
                <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-[#1f1f23] shadow-2xl group">
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!isCapturing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0b]/80 backdrop-blur-sm">
                      <div className="p-6 bg-white/5 rounded-full mb-4 border border-white/10">
                        <Camera className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Camera Feed Inactive</h3>
                      <p className="text-gray-500 mb-6">Start monitoring to activate real-time detection</p>
                      <button 
                        onClick={startMonitoring}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all active:scale-95"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        Start Monitoring
                      </button>
                    </div>
                  )}

                  {isCapturing && (
                     <>
                        <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-black/60 rounded-full border border-white/10 backdrop-blur-md">
                           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                           <span className="text-xs font-bold uppercase tracking-widest">Live Feed</span>
                        </div>
                        
                        <div className="absolute inset-0 pointer-events-none">
                           <div className="absolute top-1/4 left-1/4 w-32 h-32 border-t-2 border-l-2 border-white/20 rounded-tl-3xl" />
                           <div className="absolute top-1/4 right-1/4 w-32 h-32 border-t-2 border-r-2 border-white/20 rounded-tr-3xl" />
                           <div className="absolute bottom-1/4 left-1/4 w-32 h-32 border-b-2 border-l-2 border-white/20 rounded-bl-3xl" />
                           <div className="absolute bottom-1/4 right-1/4 w-32 h-32 border-b-2 border-r-2 border-white/20 rounded-br-3xl" />
                        </div>
                     </>
                  )}

                  {/* Alert Overlays */}
                  <AnimatePresence>
                    {currentDetection && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-x-6 top-6 z-10"
                      >
                        <div className={cn(
                          "p-6 rounded-2xl flex items-center justify-between border-2 shadow-2xl backdrop-blur-xl",
                          currentDetection.status === 'Owner' 
                            ? "bg-green-500/20 border-green-500 text-green-100" 
                            : "bg-red-500/20 border-red-500 text-red-100 animate-pulse"
                        )}>
                          <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-xl", currentDetection.status === 'Owner' ? "bg-green-500" : "bg-red-500")}>
                               {currentDetection.status === 'Owner' ? <CheckCircle2 className="w-6 h-6 text-white" /> : <AlertTriangle className="w-6 h-6 text-white" />}
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-70">Detection Result</p>
                              <h4 className="text-2xl font-black">
                                {currentDetection.status === 'Owner' ? "OWNER (SAFE ACCESS)" : "UNKNOWN (THREAT DETECTED)"}
                              </h4>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xs uppercase tracking-widest font-bold opacity-70">Confidence</p>
                             <p className="text-3xl font-mono font-black">{(currentDetection.confidence * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-4">
                   {isMonitoring && (
                     <button 
                       onClick={stopMonitoring}
                       className="bg-[#1f1f23] hover:bg-[#2e2e36] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95"
                     >
                       <Square className="w-5 h-5 fill-current" />
                       Stop Monitoring
                     </button>
                   )}
                   <div className="flex-1" />
                   <p className="text-xs text-gray-500 italic">Scanning database for matching patterns...</p>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-6">
                <section className="bg-[#111113] border border-[#1f1f23] rounded-3xl p-6 flex-1 flex flex-col max-h-[600px]">
                  <h3 className="font-bold flex items-center justify-between mb-4">
                    <span className="flex items-center gap-2">
                       <History className="w-5 h-5 text-gray-400" />
                       Detection Log
                    </span>
                    <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500">
                      <Download className="w-4 h-4" />
                    </button>
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                    <AnimatePresence initial={false}>
                      {logs.map((log) => (
                        <motion.div 
                          key={log.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "p-4 rounded-2xl border flex items-center justify-between",
                            log.status === 'Owner' ? "bg-green-500/5 border-green-500/10" : "bg-red-500/5 border-red-500/10"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", log.status === 'Owner' ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500")}>
                              {log.status === 'Owner' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            </div>
                            <div>
                               <p className="font-bold text-sm">{log.status === 'Owner' ? "OWNER" : "UNKNOWN"}</p>
                               <p className="text-[10px] text-gray-500 font-mono uppercase">{log.timestamp}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-mono text-gray-400">{(log.confidence * 100).toFixed(1)}%</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {logs.length === 0 && (
                      <div className="text-center py-10 opacity-30">
                        <History className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-xs uppercase tracking-widest font-bold">No Activity</p>
                      </div>
                    )}
                  </div>
                  <button 
                    disabled={logs.length === 0}
                    onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8," 
                          + "Timestamp,Status,Confidence\n"
                          + logs.map(l => `${l.timestamp},${l.status},${l.confidence.toFixed(4)}`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "faceguard_logs.csv");
                        document.body.appendChild(link);
                        link.click();
                    }}
                    className="w-full mt-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                  >
                    Export Log History (CSV)
                  </button>
                </section>
              </div>
            </motion.div>
          )}

          {/* Analytics Mode */}
          {mode === 'analytics' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#111113] border border-[#1f1f23] rounded-3xl p-6 relative overflow-hidden group">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 font-bold">System Load</p>
                  <p className="text-4xl font-black text-white">{stats.total}</p>
                  <p className="text-sm text-gray-500 mt-2">Captured Events</p>
                  <div className="absolute right-0 bottom-0 p-4 opacity-5 group-hover:opacity-10">
                     <History className="w-16 h-16" />
                  </div>
                </div>
                <div className="bg-[#111113] border border-[#1f1f23] rounded-3xl p-6 relative overflow-hidden group">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 font-bold text-green-500/70">Safe Access</p>
                  <p className="text-4xl font-black text-white">{stats.owners}</p>
                  <p className="text-sm text-gray-500 mt-2">Verified Members</p>
                  <div className="absolute right-0 bottom-0 p-4 opacity-5 group-hover:opacity-10 text-green-500">
                     <CheckCircle2 className="w-16 h-16" />
                  </div>
                </div>
                <div className="bg-[#111113] border border-[#1f1f23] rounded-3xl p-6 relative overflow-hidden group">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 font-bold text-red-500/70">Potential Threats</p>
                  <p className="text-4xl font-black text-white">{stats.threats}</p>
                  <p className="text-sm text-gray-500 mt-2">Unauthorized Detections</p>
                   <div className="absolute right-0 bottom-0 p-4 opacity-5 group-hover:opacity-10 text-red-500">
                     <AlertTriangle className="w-16 h-16" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[400px]">
                <section className="bg-[#111113] border border-[#1f1f23] rounded-3xl p-8 flex flex-col">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-400" />
                    Access Distribution
                  </h3>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#111113', border: '1px solid #1f1f23', borderRadius: '12px' }}
                           itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="bg-[#111113] border border-[#1f1f23] rounded-3xl p-8 flex flex-col">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                    Security Breakdown
                  </h3>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                           cursor={{fill: 'rgba(255,255,255,0.05)'}}
                           contentStyle={{ backgroundColor: '#111113', border: '1px solid #1f1f23', borderRadius: '12px' }}
                           itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                           {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.2} stroke={entry.color} strokeWidth={2} />
                           ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>

              {logs.length === 0 && (
                <div className="text-center py-20 bg-[#111113] border border-[#1f1f23] rounded-3xl">
                   <p className="text-gray-500">Run monitoring to generate analytics reports</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
