
// import React, { useState, useEffect } from 'react';
// import { api } from '../services/api';
// import { Button } from './ui/button';
// import { Skeleton } from './ui/skeleton';
// import { LogOut, Rocket, Send, CheckCircle2, Loader2, Layers } from 'lucide-react';

// export default function Dashboard({ onLogout }) {
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [currentEnv, setCurrentEnv] = useState(null);
//   const [isProvisioning, setIsProvisioning] = useState(false); // למניעת לחיצות כפולות

//   useEffect(() => {
//     loadProjects();
//   }, []);

//   const loadProjects = async () => {
//     try {
//       const data = await api.getProjects();
//       setProjects(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendToManager = async () => {
//     if (!currentEnv) return;
//     try {
//       const updateData = { ...currentEnv, status: 'RUNNING' };
//       await api.updateEnvironment(currentEnv.id, updateData);
      
//       alert("הסביבה נשלחה למנהל בהצלחה!");
//       setCurrentEnv(null);
//       loadProjects();
//     } catch (err) {
//       alert(`שגיאה בשליחה למנהל: ${err.message}`);
//     }
//   };

//   const handleCreateEnvironment = async (projectId) => {
//     try {
//       setIsProvisioning(true);
//       // alert שמרנו מהקוד המקורי שלך לבדיקה
//       console.log(`Starting environment creation for project ${projectId}...`);
      
//       const newEnv = await api.createEnvironment(projectId, 1);
//       setCurrentEnv(newEnv);
      
//       alert(`Success! Environment running on port: ${newEnv.port}`);
//       loadProjects(); 
//     } catch (err) {
//       alert(`Failed to create environment: ${err.message}`);
//     } finally {
//       setIsProvisioning(false);
//     }
//   };

//   if (loading) return (
//     <div className="min-h-screen bg-slate-950 p-12 text-white">
//        <h3 className="animate-pulse">Loading projects from Spring Boot...</h3>
//     </div>
//   );

//   if (error) return (
//     <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400">
//       <div className="text-center">
//         <p className="mb-4">Error: {error}</p>
//         <Button onClick={onLogout}>Logout</Button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
//       <div className="max-w-6xl mx-auto">
        
//         {/* Header */}
//         <div className="flex items-center justify-between mb-10">
//           <div className="flex items-center gap-3">
//             <Layers className="text-blue-500 w-8 h-8" />
//             <h1 className="text-2xl font-bold">InstantStack</h1>
//           </div>
//           <Button onClick={onLogout} variant="outline" className="border-slate-700 text-slate-300">
//             <LogOut className="w-4 h-4 mr-2" /> Logout
//           </Button>
//         </div>

//         {/* Status Box */}
//         {currentEnv && (
//           <div className="mb-8 bg-blue-500/10 border border-blue-500/20 p-6 rounded-xl backdrop-blur-md">
//             <p className="text-blue-400 font-bold mb-2">
//               הסביבה מוכנה בפורט: {currentEnv.port}!
//             </p>
//             <p className="text-slate-300 mb-4 text-sm">העבודה שלך מוכנה? שלח אותה למנהל:</p>
//             <Button onClick={handleSendToManager} className="bg-green-600 hover:bg-green-500 text-white">
//               ✉️ שלח למנהל
//             </Button>
//           </div>
//         )}

//         {/* Projects List */}
//         <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
//           <h2 className="text-xl font-semibold mb-6">My Projects</h2>
//           <div className="space-y-4">
//             {projects.map((project) => (
//               <div key={project.id} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
//                 <div>
//                   <h3 className="font-medium">{project.name}</h3>
//                   <p className="text-slate-500 text-xs">ID: {project.id}</p>
//                 </div>
//                 <Button 
//                   onClick={() => handleCreateEnvironment(project.id)}
//                   disabled={isProvisioning || !!currentEnv}
//                   className="bg-blue-600 hover:bg-blue-500"
//                 >
//                   {isProvisioning ? <Loader2 className="animate-spin w-4 h-4" /> : <Rocket className="w-4 h-4 mr-2" />}
//                   Launch Environment
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Button } from './ui/button';
import { 
  LogOut, 
  Rocket, 
  Send, 
  Terminal, 
  Layers, 
  Server, 
  Cpu, 
  Clock, 
  Activity,
  Globe,
  CheckCircle2,
  X
} from 'lucide-react';

export default function Dashboard({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentEnv, setCurrentEnv] = useState(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  
  // סטייט חדש לניהול נוטיפיקציות מעוצבות (במקום alert)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadProjects();
  }, []);

  // פונקציית עזר להצגת טוסט יוקרתי שנעלם אוטומטית
  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 5000);
  };

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToManager = async () => {
    if (!currentEnv) return;
    try {
      const updateData = { ...currentEnv, status: 'RUNNING' };
      await api.updateEnvironment(currentEnv.id, updateData);
      
      showNotification("הסביבה נשלחה למנהל בהצלחה!", 'success');
      setCurrentEnv(null);
      loadProjects();
    } catch (err) {
      showNotification(`שגיאה בשליחה למנהל: ${err.message}`, 'error');
    }
  };

  const handleCreateEnvironment = async (projectId) => {
    try {
      setIsProvisioning(true);
      console.log(`Starting environment creation for project ${projectId}...`);
      
      const newEnv = await api.createEnvironment(projectId, 1);
      setCurrentEnv(newEnv);
      
      // שדרוג: הודעת הצלחה עיצובית במקום אלרט מעיק
      showNotification(`Success! Environment deployed running on port: ${newEnv.port}`, 'success');
      loadProjects(); 
    } catch (err) {
      showNotification(`Failed to create environment: ${err.message}`, 'error');
    } finally {
      setIsProvisioning(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <div className="relative w-20 h-20 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-pulse"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
      </div>
      <h3 className="text-slate-400 font-medium tracking-wide">Fetching Cluster Projects from Spring Boot...</h3>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="bg-red-950/20 border border-red-900/50 max-w-md w-full p-6 rounded-2xl text-center backdrop-blur-md">
        <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="w-6 h-6" />
        </div>
        <p className="text-red-200 font-medium mb-6">Connection Error: {error}</p>
        <Button onClick={onLogout} className="bg-red-600 hover:bg-red-500 text-white w-full">Logout System</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07070e] text-slate-100 flex font-sans antialiased relative">
      
      {/* 🔔 מערכת טוסטים משודרגת (התחליף לאלרט הבנאלי) */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-xl ${
            toast.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200' 
              : 'bg-red-950/80 border-red-500/30 text-red-200'
          }`}>
            <CheckCircle2 className={`w-5 h-5 ${toast.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`} />
            <div className="text-sm font-medium pr-4">{toast.message}</div>
            <button 
              onClick={() => setToast({ ...toast, show: false })}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 🐋 SIDEBAR */}
      <aside className="w-80 bg-[#0c0d19] border-r border-slate-800/60 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand & Fixed Docker Logo */}
          <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">InstantStack</h1>
                <span className="text-[10px] text-blue-400 font-mono tracking-widest uppercase">v2026.Platform</span>
              </div>
            </div>
            
            {/* לוגו דוקר מתוקן לחלוטין - ללא עיוותים ובגודל מדויק */}
            <div className="text-[#2496ed] p-1 bg-[#141729] rounded-lg border border-slate-800 shrink-0 flex items-center justify-center w-9 h-9">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.983 11.078h2.119c.102 0 .186-.083.186-.185V8.774a.186.186 0 0 0-.186-.186h-2.119a.186.186 0 0 0-.186.186v2.119c0 .102.084.185.186.185m-2.954 0h2.117c.103 0 .186-.083.186-.185V8.774a.186.186 0 0 0-.186-.186h-2.117a.185.185 0 0 0-.186.186v2.119c0 .102.083.185.186.185m-2.956 0h2.117c.102 0 .185-.083.185-.185V8.774a.185.185 0 0 0-.185-.186H8.073a.185.185 0 0 0-.185.186v2.119c0 .102.083.185.185.185m-2.955 0h2.119c.102 0 .185-.083.185-.185V8.774a.185.185 0 0 0-.185-.186H5.118a.186.186 0 0 0-.186.186v2.119c0 .102.084.185.186.185m2.955-2.954h2.117c.102 0 .185-.083.185-.185V5.82a.185.185 0 0 0-.185-.186H8.073a.185.185 0 0 0-.185.186v2.119c0 .102.083.185.185.185m2.956 0h2.117c.103 0 .186-.083.186-.185V5.82a.186.186 0 0 0-.186-.186h-2.117a.185.185 0 0 0-.186.186v2.119c0 .102.083.185.186.185m2.954 0h2.119c.102 0 .186-.083.186-.185V5.82a.186.186 0 0 0-.186-.186h-2.119a.186.186 0 0 0-.186.186v2.119c0 .102.084.185.186.185M8.073 5.18h2.117c.102 0 .185-.083.185-.186V2.876a.185.185 0 0 0-.185-.186H8.073a.185.185 0 0 0-.185.186v2.119c0 .102.083.185.185.185M23.99 12.508c-.134-.343-.46-.569-.824-.569h-2.433l-.014-.002c-.22-.323-.55-.572-.94-.687l-.42-.124c-.38-.112-.793-.035-1.11.206l-.428.324-.486-.33c-.372-.25-.838-.306-1.252-.152l-.46.173v-4.14c0-.18-.108-.344-.274-.413l-.53-.22a.455.455 0 0 0-.549.167l-.41.53c-.15.195-.194.453-.117.685l.235.707h-9.94l-.16-.367a.455.455 0 0 0-.555-.252l-.548.173a.451.451 0 0 0-.312.432v4.254l-.454-.153a1.442 1.442 0 0 0-1.246.136L.65 13.3c-.334.225-.53.597-.53.994C.12 18.9 4.3 22.186 9.49 22.186c4.61 0 8.44-2.615 9.27-6.28l.19.006c.38-.008.73-.186.96-.49l.3-.4c.32-.424.364-.99.117-1.458l-.19-.36 1.157-.014c.306-.003.585-.157.753-.41l.732-1.114c.217-.33.242-.746.066-1.1M9.49 21.03c-4.46 0-8.08-2.67-8.21-6.726l5.053-.016c.143.493.593.851 1.127.851h3.3c.516 0 .954-.336 1.113-.807l4.835-.04c.16 3.655-3.024 6.738-7.218 6.738z"/>
              </svg>
            </div>
          </div>

          {/* Project Sidebar Navigation */}
          <div className="p-4">
            <p className="text-[11px] font-mono tracking-wider text-slate-500 uppercase px-3 mb-3">Docker Multi-Projects</p>
            {projects.length === 0 ? (
              <p className="text-slate-500 text-xs px-3">No active contexts found.</p>
            ) : (
              <div className="space-y-1">
                {projects.map((project) => {
                  const isSelected = selectedProject?.id === project.id;
                  return (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all group ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 font-medium' 
                          : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Server className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                        <span className="truncate text-sm">{project.name}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-blue-700 text-blue-200' : 'bg-slate-900 text-slate-600'}`}>
                        #{project.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* User / Session Footer */}
        <div className="p-4 border-t border-slate-800/60 bg-[#0a0a14]">
          <Button 
            onClick={onLogout} 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
          >
            <LogOut className="w-4 h-4 mr-2 text-slate-500 group-hover:text-red-400" />
            Terminate Session
          </Button>
        </div>
      </aside>

      {/* 🖥️ MAIN WORKSPACE */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          
          {/* Active Environment Top Banner */}
          {currentEnv && (
            <div className="mb-8 relative overflow-hidden bg-gradient-to-r from-emerald-950/40 to-slate-900/40 border border-emerald-500/30 p-6 rounded-2xl backdrop-blur-xl shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <Globe className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                      <h4 className="text-emerald-400 font-bold text-base">Container Successfully Provisioned!</h4>
                    </div>
                    <p className="text-slate-300 text-sm mb-3">
                      Your proxy router routing live isolated traffic on port: <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-emerald-400 font-bold text-base">{currentEnv.port}</span>
                    </p>
                    <p className="text-slate-400 text-xs">Ready for review? Commit changes and dispatch to supervisor node.</p>
                  </div>
                </div>
                <Button 
                  onClick={handleSendToManager} 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-5 shadow-lg shadow-emerald-600/20 rounded-xl flex items-center gap-2 border border-emerald-500/30 group transition-all"
                >
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Dispatch to Supervisor
                </Button>
              </div>
            </div>
          )}

          {/* Project Details Panel */}
          {selectedProject ? (
            <div className="bg-[#0c0d19] border border-slate-800/80 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0"></div>
              
              {/* Workspace Header */}
              <div className="flex items-start justify-between mb-8 border-b border-slate-800/60 pb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-blue-400 uppercase tracking-wider bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">Active Context</span>
                    <span className="text-xs font-mono text-slate-500">ID: {selectedProject.id}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{selectedProject.name}</h2>
                </div>

                <Button
                  onClick={() => handleCreateEnvironment(selectedProject.id)}
                  disabled={isProvisioning || !!currentEnv}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-6 shadow-xl shadow-blue-600/10 rounded-xl flex items-center gap-2 disabled:bg-slate-800 disabled:text-slate-500 transition-all border border-blue-500/20"
                >
                  {isProvisioning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                      Spawning Infrastructure...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 text-blue-200" />
                      Spin-up Isolated Stack
                    </>
                  )}
                </Button>
              </div>

              {/* Progress UI */}
              {isProvisioning && (
                <div className="mb-8 p-5 bg-slate-950/60 rounded-xl border border-slate-800 animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-blue-400 font-mono flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5" /> docker run -d -p 8000:8000 ...
                    </span>
                    <span className="text-xs font-mono text-slate-500">84%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full w-[84%] rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* Node Specifications Meta Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/5 text-indigo-400 border border-indigo-500/10">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Resources allocated</p>
                    <p className="text-sm font-medium text-slate-300">Shared Micro-Core</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-sky-500/5 text-sky-400 border border-sky-500/10">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Auto-Teardown</p>
                    <p className="text-sm font-medium text-slate-300">2 Hours Idle Cap</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/5 text-amber-400 border border-amber-500/10">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Hypervisor Engine</p>
                    <p className="text-sm font-medium text-slate-300">Docker Node Agent</p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center p-12 bg-[#0c0d19] border border-slate-800 rounded-2xl text-slate-500">
              Select or generate a container context from the left navigator cluster.
            </div>
          )}

        </div>
      </main>

    </div>
  );
}