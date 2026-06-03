import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Button } from './ui/button';
import { 
  LogOut, ShieldCheck, Users, FolderGit2, UserPlus, 
  RefreshCw, Terminal, Mail, Lock, UserCheck, Trash2, Edit2, Settings
} from 'lucide-react';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Employee' });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersData, projectsData] = await Promise.all([api.getUsers(), api.getProjects()]);
      setUsers(usersData || []);
      setProjects(projectsData || []);
    } catch (err) {
      setError('Failed to sync system core.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.addUser(newUser);
      setFormSuccess(`User [${newUser.name}] registered successfully.`);
      setNewUser({ name: '', email: '', password: '', role: 'Employee' });
      await loadAdminData();
    } catch (err) {
      setError(`Registration failed: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#040812] flex items-center justify-center text-blue-400">
      <div className="animate-pulse font-mono">Initializing Admin Console...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#040812] text-slate-100 flex">
      {/* Sidebar - Blue Theme */}
      <aside className="w-64 bg-[#0a0f1a] border-r border-blue-900/30 flex flex-col p-5 shrink-0">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider">INSTANTSTACK</h1>
            <span className="text-[10px] text-blue-500 font-mono">ADMIN PANEL</span>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl ${activeTab === 'users' ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'text-slate-400 hover:text-white'}`}>
            <Users className="w-4 h-4" /> Global Users ({users.length})
          </button>
          <button onClick={() => setActiveTab('projects')} className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl ${activeTab === 'projects' ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'text-slate-400 hover:text-white'}`}>
            <FolderGit2 className="w-4 h-4" /> System Projects ({projects.length})
          </button>
          <button onClick={() => setActiveTab('create-user')} className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl ${activeTab === 'create-user' ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'text-slate-400 hover:text-white'}`}>
            <UserPlus className="w-4 h-4" /> Register Account
          </button>
        </nav>

        <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2.5 text-xs text-red-400 hover:bg-red-900/20 rounded-xl transition-all">
          <LogOut className="w-4 h-4" /> Terminate Session
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">System Management</h2>
          <Button onClick={loadAdminData} className="bg-blue-600 hover:bg-blue-500 text-xs">
            <RefreshCw className="w-3 h-3 mr-2" /> Sync Database
          </Button>
        </div>

        {/* User Table with Actions */}
        {activeTab === 'users' && (
          <div className="bg-[#0a0f1a] border border-blue-900/30 rounded-2xl p-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-xs border-b border-blue-900/30">
                  <th className="p-4">ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-blue-900/10 hover:bg-blue-950/10">
                    <td className="p-4 text-blue-400">#{u.id}</td>
                    <td className="p-4">{u.name}</td>
                    <td className="p-4 text-slate-400">{u.email}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-blue-900/20 text-blue-300 rounded text-[10px]">{u.role}</span></td>
                    <td className="p-4 flex justify-center gap-3">
                      <button className="text-blue-400 hover:text-blue-200"><Edit2 className="w-4 h-4" /></button>
                      <button className="text-red-400 hover:text-red-200"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Projects Table with Actions */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="bg-[#0a0f1a] border border-blue-900/30 p-6 rounded-2xl flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{p.name}</h3>
                  <p className="text-xs text-slate-400">ID: {p.id}</p>
                </div>
                <div className="flex gap-3">
                  <button className="text-blue-400 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                  <button className="text-red-400 hover:text-white"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create User Form */}
        {activeTab === 'create-user' && (
          <form onSubmit={handleCreateUser} className="bg-[#0a0f1a] border border-blue-900/30 p-8 rounded-2xl max-w-lg space-y-4">
            <h3 className="font-bold mb-4">Register New Identity</h3>
            <input className="w-full bg-[#040812] border border-blue-900/50 p-3 rounded-xl text-sm" placeholder="Full Name" onChange={(e) => setNewUser({...newUser, name: e.target.value})} />
            <input className="w-full bg-[#040812] border border-blue-900/50 p-3 rounded-xl text-sm" placeholder="Email" onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
            <select className="w-full bg-[#040812] border border-blue-900/50 p-3 rounded-xl text-sm" onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">Create Account</Button>
          </form>
        )}
      </main>
    </div>
  );
}












/////////////2////////////////////
//מחיקה ועדכון פרויקט עובדים ,עיצוב מכוער//
// import React, { useState, useEffect } from 'react';
// import { api } from '../services/api';
// import { Button } from './ui/button';
// import { LogOut, Users, FolderGit2, Trash2, Edit2, RefreshCw, Settings } from 'lucide-react';

// export default function AdminDashboard({ onLogout }) {
//   const [activeTab, setActiveTab] = useState('users');
//   const [data, setData] = useState({ users: [], projects: [] });
//   const [editingItem, setEditingItem] = useState(null);

//   useEffect(() => { loadData(); }, []);

//   const loadData = async () => {
//     try {
//       const [users, projects] = await Promise.all([api.getUsers(), api.getProjects()]);
//       setData({ users, projects });
//     } catch (err) { console.error(err); }
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     try {
//       // כאן ה-API מקבל את ה-editingItem המלא עם כל השדות שהמשתמש שינה
//       if (editingItem.type === 'user') await api.updateUser(editingItem);
//       else await api.updateProject(editingItem);
//       setEditingItem(null);
//       loadData();
//     } catch (err) { alert("Update Error: " + err.message); }
//   };

//   const handleDelete = async (id, type) => {
//     if (!window.confirm("Are you sure?")) return;
//     try {
//       if (type === 'user') await api.deleteUser(id);
//       else await api.deleteProject(id);
//       loadData();
//     } catch (err) { alert("Delete failed"); }
//   };

//   return (
//     <div className="min-h-screen bg-[#040812] text-slate-100 flex">
//       <aside className="w-64 bg-[#0a0f1a] border-r border-blue-900/30 p-5 flex flex-col">
//         <div className="flex items-center gap-3 px-2 mb-10 text-blue-500">
//           <Settings size={20} /> <span className="font-bold tracking-widest">INSTANTSTACK</span>
//         </div>
//         <nav className="space-y-2 flex-1">
//           <button onClick={() => setActiveTab('users')} className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white"><Users size={16}/> Users</button>
//           <button onClick={() => setActiveTab('projects')} className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white"><FolderGit2 size={16}/> Projects</button>
//         </nav>
//         <button onClick={onLogout} className="text-red-400 p-3 text-sm flex items-center gap-2"><LogOut size={16}/> Logout</button>
//       </aside>

//       <main className="flex-1 p-8">
//         <div className="flex justify-between mb-8">
//           <h2 className="text-2xl font-bold">{activeTab.toUpperCase()}</h2>
//           <Button onClick={loadData}><RefreshCw size={16}/></Button>
//         </div>

//         {activeTab === 'users' ? (
//           <table className="w-full bg-[#0a0f1a] rounded-xl border border-blue-900/30">
//             {data.users.map(u => (
//               <tr key={u.id} className="border-b border-white/5">
//                 <td className="p-4">{u.name}</td>
//                 <td className="p-4 text-slate-400">{u.email}</td>
//                 <td className="p-4 flex gap-4">
//                   <button onClick={() => setEditingItem({...u, type: 'user'})} className="text-blue-400"><Edit2 size={16}/></button>
//                   <button onClick={() => handleDelete(u.id, 'user')} className="text-red-400"><Trash2 size={16}/></button>
//                 </td>
//               </tr>
//             ))}
//           </table>
//         ) : (
//           <div className="grid grid-cols-2 gap-4">
//             {data.projects.map(p => (
//               <div key={p.id} className="bg-[#0a0f1a] p-6 rounded-xl border border-blue-900/30">
//                 <h3 className="font-bold">{p.name}</h3>
//                 <p className="text-xs text-slate-400">URL: {p.gitUrl}</p>
//                 <div className="mt-4 flex gap-4">
//                   <button onClick={() => setEditingItem({...p, type: 'project'})} className="text-blue-400"><Edit2 size={16}/></button>
//                   <button onClick={() => handleDelete(p.id, 'project')} className="text-red-400"><Trash2 size={16}/></button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </main>

//       {editingItem && (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
//           <form onSubmit={handleUpdate} className="bg-[#0a0f1a] p-8 rounded-2xl w-96 border border-blue-500">
//             <h3 className="mb-4 font-bold">Edit Details</h3>
//             {/* כאן הוספתי את כל שדות העריכה לכל הפרטים */}
//             <input className="w-full bg-black p-3 mb-2 rounded" placeholder="Name" defaultValue={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} />
//             <input className="w-full bg-black p-3 mb-2 rounded" placeholder="Email/URL" defaultValue={editingItem.email || editingItem.gitUrl} onChange={e => setEditingItem({...editingItem, [editingItem.type === 'user' ? 'email' : 'gitUrl']: e.target.value})} />
            
//             {editingItem.type === 'user' && (
//               <select className="w-full bg-black p-3 mb-2 rounded" onChange={e => setEditingItem({...editingItem, role: e.target.value})} defaultValue={editingItem.role}>
//                 <option value="Employee">Employee</option><option value="Manager">Manager</option><option value="Admin">Admin</option>
//               </select>
//             )}
            
//             <div className="flex gap-2 mt-4">
//               <Button type="submit" className="flex-1">Save Changes</Button>
//               <Button type="button" onClick={() => setEditingItem(null)} className="flex-1 bg-slate-700">Cancel</Button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }