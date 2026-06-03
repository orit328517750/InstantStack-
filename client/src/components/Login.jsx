

// import React, { useState } from 'react';
// import { api } from '../services/api';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { Label } from './ui/label';
// import { AlertCircle, Lock, Mail, Layers } from 'lucide-react';

// export default function Login({ onLoginSuccess }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);
// try {
//       const token = await api.login(email, password);
//       localStorage.setItem('token', token);
      
//       // 🌟 התיקון: מוחקים את ה-email ומחזירים לקריאה נקייה בלי פרמטרים
//       onLoginSuccess(); 
      
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
//       <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

//       <div className="relative w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center gap-2 mb-4">
//             <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
//               <Layers className="w-8 h-8 text-white" />
//             </div>
//           </div>
//           <h1 className="text-3xl font-bold text-white mb-2">InstantStack</h1>
//           <p className="text-slate-400 text-sm">Dynamic Docker Environments Platform</p>
//         </div>

//         <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
//           <div className="mb-6">
//             <h2 className="text-2xl font-semibold text-white mb-1">Welcome back</h2>
//             <p className="text-slate-400 text-sm">Sign in to your account to continue</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div className="space-y-2">
//               <Label htmlFor="email" className="text-slate-200 text-sm font-medium">
//                 Email address
//               </Label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="you@company.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   className="pl-10 bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-11"
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password" className="text-slate-200 text-sm font-medium">
//                 Password
//               </Label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   className="pl-10 bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-11"
//                 />
//               </div>
//             </div>

//             {error && (
//               <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
//                 <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
//                 <p className="text-sm text-red-400">{error}</p>
//               </div>
//             )}

//             <Button
//               type="submit"
//               disabled={isLoading}
//               className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium transition-all duration-200 shadow-lg shadow-blue-500/20"
//             >
//               {isLoading ? 'Signing in...' : 'Sign in'}
//             </Button>
//           </form>
//         </div>

//         <p className="text-center text-slate-500 text-xs mt-6">
//           Secure authentication • Enterprise-grade encryption
//         </p>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { api } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertCircle, Lock, Mail, Layers } from 'lucide-react';

export default function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const token = await api.login(email, password);
      localStorage.setItem('token', token);
      onLoginSuccess(); 
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <Layers className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">InstantStack</h1>
          <p className="text-slate-400 text-sm">Dynamic Docker Environments Platform</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-1">Welcome back</h2>
            <p className="text-slate-400 text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200 text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200 text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-11"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium transition-all duration-200 shadow-lg shadow-blue-500/20"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* 🔗 הניווט החדש לעבר דף ההרשמה */}
          <div className="mt-6 text-center text-sm">
            <span className="text-slate-400">Don't have an account? </span>
            <button
              onClick={onNavigateToRegister}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors focus:outline-none"
            >
              Create account
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Secure authentication • Enterprise-grade encryption
        </p>
      </div>
    </div>
  );
}