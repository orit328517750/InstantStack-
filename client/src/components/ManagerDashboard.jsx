


import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Button } from './ui/button';
import { 
  LogOut, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Users,
  LayoutDashboard,
  RefreshCw,
  UserPlus,
  BarChart3,
  Terminal,
  Edit, 
  X,
  Server,
  Activity
} from 'lucide-react';

export default function ManagerDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('infrastructure');
  const [projects, setProjects] = useState([]);
  const [projectWorkers, setProjectWorkers] = useState([]); // כאן נשמור את רשימת העובדים הישירה
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [availableEmployees, setAvailableEmployees] = useState([]); 
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [newGitUrl, setNewGitUrl] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const [environmentsByProject, setEnvironmentsByProject] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. טעינת הפרויקטים
      const projectsData = await api.getProjects();
      setProjects(projectsData || []);
      setEnvironmentsByProject({});

      // 2. טעינת העובדים של המנהל ישירות מהשרת (הפונקציה החדשה שיצרנו)
      try {
        const workers = await api.getMyWorkers(); 
        setProjectWorkers(workers || []);
      } catch (e) {
        console.error("Could not fetch project workers", e);
      }
      
      // 3. טעינת עובדים פנויים לבחירה (ה-Pool הכללי)
      try {
        const empData = await api.getAvailableEmployees();
        setAvailableEmployees(empData || []);
      } catch (e) {
        console.error("Could not fetch global employee pool", e);
      }

      // 4. רענון סביבות לפרויקטים שמורחבים כרגע
      const expandedIds = Object.entries(expandedProjects)
        .filter(([_, expanded]) => expanded)
        .map(([projectId]) => Number(projectId));
      await Promise.all(expandedIds.map((projectId) => loadEnvironments(projectId)));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEnvironments = async (projectId) => {
    try {
      const envs = await api.getProjectEnvironments(projectId);
      setEnvironmentsByProject((prev) => ({ ...prev, [projectId]: envs || [] }));
    } catch (err) {
      setEnvironmentsByProject((prev) => ({ ...prev, [projectId]: [] }));
      alert(`Error loading environments: ${err.message}`);
    }
  };

  const refreshExpandedEnvironments = async () => {
    const expandedIds = Object.entries(expandedProjects)
      .filter(([_, expanded]) => expanded)
      .map(([projectId]) => Number(projectId));

    await Promise.all(expandedIds.map((projectId) => loadEnvironments(projectId)));
  };

  useEffect(() => {
    if (activeTab !== 'infrastructure') return;
    const interval = setInterval(() => {
      refreshExpandedEnvironments();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab, expandedProjects]);

  const toggleProject = async (projectId) => {
    const isExpanded = expandedProjects[projectId];
    if (!isExpanded) {
      await loadEnvironments(projectId);
    }
    setExpandedProjects((prev) => ({ ...prev, [projectId]: !isExpanded }));
  };

  const handleOpenApp = (port) => {
    if (!port) return;
    const host = window.location.hostname || 'localhost';
    const url = `${window.location.protocol}//${host}:${port}`;
    window.open(url, '_blank');
  };

  const handleDeleteEnvironment = async (projectId, envId) => {
    if (!window.confirm(`Are you sure you want to terminate container #${envId}?`)) return;
    try {
      await api.deleteEnvironment(projectId, envId);
      setEnvironmentsByProject((prev) => ({
        ...prev,
        [projectId]: prev[projectId].filter((e) => e.id !== envId),
      }));
    } catch (err) {
      alert(`Termination failed: ${err.message}`);
    }
  };

  const openEditModal = (project) => {
    setProjectToEdit(project);
    setNewGitUrl(project.gitUrl || '');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setProjectToEdit(null);
    setNewGitUrl('');
  };

  const handleUpdateProjectUrl = async (e) => {
    e.preventDefault();
    if (!projectToEdit) return;
    
    setEditLoading(true);
    try {
      const updatedProjectData = {
        ...projectToEdit,
        gitUrl: newGitUrl
      };
      
      await api.updateProject(updatedProjectData);
      closeEditModal();
      alert('Project Git URL updated successfully.');
      await loadDashboardData();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleAssignWorker = async (e) => {
    e.preventDefault();
    if (!selectedProject || !selectedWorker) {
      alert('Please select both a project and an employee.');
      return;
    }
    setAssignLoading(true);
    setAssignSuccess('');
    try {
      const projectId = Number(selectedProject);
      const workerId = Number(selectedWorker);
      await api.assignWorkerToProject(projectId, workerId);
      setAssignSuccess('Worker node successfully mounted to project cluster.');
      setSelectedProject('');
      setSelectedWorker('');
      setTimeout(() => setAssignSuccess(''), 3000);
      await loadDashboardData();
    } catch (err) {
      console.error('Assignment failed', err);
      alert(`Assignment failed: ${err.message || err}`);
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <h3 className="text-slate-400 font-mono text-sm">Synchronizing Manager Workspace...</h3>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#040408] text-slate-100 flex">
      
      {/* ─── SIDEBAR ─── */}
      <aside className="w-64 bg-[#090a14] border-r border-slate-900 flex flex-col justify-between p-5 shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider uppercase">InstantStack</h1>
              <span className="text-[10px] text-indigo-400 font-mono block">root@supervisor</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <p className="text-[10px] font-mono uppercase text-slate-500 px-2 mb-2 tracking-widest">Core Operations</p>
            <button onClick={() => setActiveTab('infrastructure')} className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${activeTab === 'infrastructure' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10 font-semibold' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}><LayoutDashboard className="w-4 h-4" />Infrastructure Blocks</button>
            <button onClick={() => setActiveTab('team')} className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${activeTab === 'team' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10 font-semibold' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}><Users className="w-4 h-4" />Project Workers ({projectWorkers.length})</button>
            <p className="text-[10px] font-mono uppercase text-slate-500 px-2 pt-4 mb-2 tracking-widest">Management</p>
            <button onClick={() => setActiveTab('assign')} className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${activeTab === 'assign' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10 font-semibold' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}><UserPlus className="w-4 h-4" />Assign Workers</button>
            <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10 font-semibold' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}><BarChart3 className="w-4 h-4" />Cluster Telemetry</button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-900">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-all"><LogOut className="w-4 h-4" />Revoke Access</button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 min-w-0 overflow-y-auto p-8 bg-gradient-to-b from-[#090a12]/30 to-[#040408]">
        
        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl text-xs font-mono">
            ⚠️ Error: {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-8 bg-[#0e101f]/40 border border-slate-900 p-4 rounded-xl backdrop-blur-md">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Node Secure Status: Operational Gate active</div>
          <Button onClick={loadDashboardData} variant="outline" className="h-8 border-slate-800 text-xs gap-1.5 hover:bg-slate-900"><RefreshCw className="w-3 h-3" /> Sync Cluster</Button>
        </div>

        {/* ─── TAB 1: INFRASTRUCTURE ─── */}
        {activeTab === 'infrastructure' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold tracking-tight">Active Infrastructure Node Blocks</h2>
              <p className="text-xs text-slate-400 font-mono">Real-time status of micro-core pipeline environments managed by your supervisor layer.</p>
            </div>

            {projects.length === 0 ? (
              <div className="bg-[#0c0d19] border border-slate-900 rounded-xl p-8 text-center text-slate-500 font-mono text-xs">
                No active projects connected to this authorization token.
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => {
                  const isExpanded = expandedProjects[project.id];
                  const envs = environmentsByProject[project.id] || [];
                  const visibleEnvs = envs.filter((e) => e);
                  
                  return (
                    <div key={project.id} className="border border-slate-900 bg-[#0c0d19]/60 rounded-xl overflow-hidden transition-all">
                      <div className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          <div>
                            <h3 className="font-semibold text-white text-sm">{project.name}</h3>
                            <p className="text-[10px] font-mono text-slate-500">Project Key: #{project.id}</p>
                            {project.gitUrl && (
                              <p className="text-[10px] font-mono text-indigo-400 max-w-xs truncate mt-0.5">🔗 {project.gitUrl}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={() => openEditModal(project)}
                            variant="secondary"
                            className="bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg h-8 w-8 p-0"
                            title="Edit Git URL"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>

                          <Button 
                            onClick={() => toggleProject(project.id)}
                            variant="secondary"
                            className="bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-lg text-xs h-8"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : `Inspect Core (${visibleEnvs.length})`}
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 border-t border-slate-900 bg-slate-950/40">
                          {visibleEnvs.length === 0 ? (
                            <div className="text-xs font-mono text-slate-500 p-2 flex items-center gap-2">
                              <Terminal className="w-3.5 h-3.5 text-slate-600" /> No environment context found for this stack.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {visibleEnvs.map((env) => {
                                const isRunning = String(env.status || '').toUpperCase() === 'RUNNING';
                                return (
                                  <div key={env.id} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl">
                                    <div>
                                      <div className="text-xs font-mono text-emerald-400 font-bold mb-1">PORT INTERFACE: {env.port || 'N/A'}</div>
                                      <div className="text-[11px] text-slate-400 font-mono">Assigned Worker ID: {env.workerId || 'None'}</div>
                                      <div className="text-[11px] mt-1 font-mono">
                                        Status: <span className={isRunning ? 'text-emerald-400' : 'text-slate-400'}>{env.status || 'UNKNOWN'}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Button
                                        onClick={() => handleOpenApp(env.port)}
                                        className={`rounded-lg h-7 px-2.5 text-xs ${isRunning ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                                        disabled={!isRunning || !env.port}
                                      >
                                        Navigate
                                      </Button>
                                      <Button onClick={() => handleDeleteEnvironment(project.id, env.id)} className="bg-red-950/20 text-red-400 border border-red-900/30 hover:bg-red-600 hover:text-white rounded-lg h-7 w-7 p-0 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: PROJECT WORKERS ─── */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold tracking-tight">Assigned Team Nodes</h2>
              <p className="text-xs text-slate-400 font-mono">Developers currently holding execution contexts within your infrastructure matrix.</p>
            </div>

            {projectWorkers.length === 0 ? (
              <div className="bg-[#0c0d19] border border-slate-900 rounded-xl p-8 text-center text-slate-500 font-mono text-xs">
                No active workers linked to your cluster. Go to "Assign Workers" to add some.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectWorkers.map((worker) => (
                  <div key={worker.id} className="bg-[#0c0d19]/80 border border-slate-900 p-4 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-slate-950 border border-slate-850 rounded-lg text-indigo-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono">{worker.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{worker.email}</p>
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-950/40 border border-indigo-900/30 text-[10px] font-mono text-indigo-400">
                        <Server className="w-3 h-3" /> Active Member
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: ASSIGN WORKERS ─── */}
        {activeTab === 'assign' && (
          <div className="space-y-6 max-w-xl">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold tracking-tight">Mount Worker Node to Infrastructure Pipeline</h2>
              <p className="text-xs text-slate-400 font-mono">Grant a specific developer node the authority to launch active instances within a chosen project frame.</p>
            </div>

            <form onSubmit={handleAssignWorker} className="bg-[#0c0d19] border border-slate-900 p-6 rounded-xl space-y-4">
              {assignSuccess && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 font-mono text-xs rounded-lg">
                  ✓ {assignSuccess}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Select Pipeline Matrix (Project)</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="">-- Choose Target Project --</option>
                  {projects?.map(p => <option key={p.id} value={p.id}>{p.name} (#{p.id})</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 block">Select Target Employee Node</label>
                <select
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="">-- Choose Developer Node --</option>
                  {availableEmployees?.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>)}
                </select>
              </div>

              <Button 
                type="submit" 
                disabled={assignLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold h-10 shadow-lg shadow-indigo-600/20"
              >
                {assignLoading ? 'Processing Request Pipeline...' : 'Authorize Allocation & Link Stack'}
              </Button>
            </form>
          </div>
        )}

        {/* ─── TAB 4: TELEMETRY (ANALYTICS) ─── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold tracking-tight">Cluster Telemetry Matrix</h2>
              <p className="text-xs text-slate-400 font-mono">Live health overview of supervisors, developer distributions, and container states.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0c0d19] border border-slate-900 p-4 rounded-xl">
                <div className="text-slate-500 font-mono text-[10px] uppercase">Connected Projects</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">{projects.length}</div>
              </div>
              <div className="bg-[#0c0d19] border border-slate-900 p-4 rounded-xl">
                <div className="text-slate-500 font-mono text-[10px] uppercase">Active Engineers</div>
                <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">{projectWorkers.length}</div>
              </div>
              <div className="bg-[#0c0d19] border border-slate-900 p-4 rounded-xl">
                <div className="text-slate-500 font-mono text-[10px] uppercase">Available Pool Resources</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{availableEmployees.length} Nodes</div>
              </div>
            </div>

            <div className="border border-slate-900 bg-slate-950/40 rounded-xl p-4 font-mono text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold mb-2"><Activity className="w-4 h-4 text-indigo-500" /> Virtual Gateway Logging:</div>
              <div>&gt; Status code 200: Core API channels verified.</div>
              <div>&gt; Access token verified for manager layer authority.</div>
              <div>&gt; All systems green. Ready for instruction blocks.</div>
            </div>
          </div>
        )}
      </main>

      {/* ─── EDIT PROJECT URL MODAL ─── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e101f] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl"></div>
            
            <div className="p-6 relative space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">Edit Pipeline URL</h3>
                </div>
                <button onClick={closeEditModal} className="text-slate-500 hover:text-slate-200 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                Project Matrix: <span className="text-white font-semibold">{projectToEdit?.name}</span> <br/>
                Identifier: <span className="text-indigo-400">#{projectToEdit?.id}</span>
              </p>

              <form onSubmit={handleUpdateProjectUrl} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="gitUrl" className="text-xs font-mono text-slate-400 block">Repository Git URL (Source)</label>
                  <input
                    id="gitUrl"
                    type="url"
                    value={newGitUrl}
                    onChange={(e) => setNewGitUrl(e.target.value)}
                    placeholder="https://github.com/organization/repository.git"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button 
                    type="button" 
                    onClick={closeEditModal} 
                    variant="secondary"
                    className="flex-1 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl h-10 text-xs font-medium"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={editLoading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-10 text-xs font-semibold shadow-lg shadow-indigo-600/20"
                  >
                    {editLoading ? 'Synchronizing...' : 'Update Matrix Source'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}