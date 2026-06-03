import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ShieldCheck, Zap, ArrowRight, Layers, Terminal, Cloud, Database, GitBranch } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#040812] text-slate-100 selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-8">
        <div className="text-xl font-bold tracking-tighter flex items-center gap-2">
          <Cloud className="text-blue-500" />
          INSTANT<span className="text-blue-500">STACK</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="text-sm text-slate-400 hover:text-white transition-colors">
            התחברות
          </button>
          <button onClick={() => navigate('/register')} className="text-sm bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-500 transition-all font-bold">
            הרשמה
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto mt-16 px-6 text-center">
        <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tight leading-[1.1]">
          Provision Enterprise Environments <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">At The Speed of Thought.</span>
        </h1>
        
        <p className="text-slate-400 text-xl max-w-3xl mx-auto mb-12 font-light leading-relaxed">
          InstantStack הוא מנוע תשתית מתקדם המאפשר לצוותי הנדסה להקים סביבות עבודה מורכבות, מאובטחות ומבודדות בענן. 
          אנחנו מחליפים תהליכי DevOps ידניים וממושכים באוטומציה חכמה שמתחברת ישירות לקוד שלכם.
        </p>

        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/register')} className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-3 hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            התחל עבודה <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Deep Dive Features */}
      <section className="max-w-6xl mx-auto mt-32 px-6 pb-24">
        <h2 className="text-3xl font-bold mb-16 text-center">למה InstantStack?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Rocket, title: 'Zero-Touch Provisioning', desc: 'אוטומציה מלאה של שרתים, בסיסי נתונים ורשתות. מקימים תשתית מוכנה לעבודה בתוך פחות מ-60 שניות.' },
            { icon: ShieldCheck, title: 'Security First', desc: 'כל סביבה מבודדת באופן הרמטי. המערכת כוללת ניהול הרשאות דקדקני (RBAC) המבטיח שכל עובד ניגש רק למה שמותר לו.' },
            { icon: GitBranch, title: 'Pipeline Integration', desc: 'חיבור ישיר למאגרי ה-Git שלכם. כל עדכון בקוד מסנכרן אוטומטית את סביבת הפיתוח.' },
            { icon: Database, title: 'Centralized Control', desc: 'לוח בקרה אחד (Matrix) המאפשר למנהלים לראות את כל המשאבים, המשתמשים והפרויקטים בזמן אמת.' },
            { icon: Layers, title: 'Scalable Infrastructure', desc: 'יכולת גדילה אופקית: הקימו 10 או 1,000 סביבות פיתוח בלחיצת כפתור מבלי לשנות קונפיגורציות.' },
            { icon: Zap, title: 'Cost Optimization', desc: 'מנגנוני כיבוי אוטומטי של משאבים לא פעילים, מה שחוסך לארגון עשרות אחוזים בעלויות הענן החודשיות.' }
          ].map((item, i) => (
            <div key={i} className="p-8 bg-[#0a0f1a] border border-blue-900/30 rounded-2xl hover:border-blue-500/50 transition-all shadow-lg">
              <item.icon className="w-8 h-8 text-blue-500 mb-6" />
              <h3 className="text-lg font-bold mb-3">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 border-t border-slate-900/50 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
        © 2026 InstantStack Infrastructure Operations. All rights reserved.
      </footer>
    </div>
  );
}