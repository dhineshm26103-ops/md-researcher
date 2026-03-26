import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Zap, NotebookPen, User, Mail } from 'lucide-react';

interface LoginPageProps {
  onLogin: (name: string, password: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [phase, setPhase] = useState<'idle'|'touch'>('idle');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const switchMode = (m: 'login'|'signup') => {
    setMode(m); setError(''); setSuccess('');
    setTouched(false); setPhase('idle');
    setName(''); setEmail(''); setPassword(''); setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!name.trim()) { setError('Name is required'); return; }
      if (!email.trim()) { setError('Email is required'); return; }
      if (password.length < 6) { setError('Min 6 characters'); return; }
      setIsLoading(true); setTouched(true); setPhase('touch');
      await new Promise(r => setTimeout(r, 1200));
      localStorage.setItem('mdr_user', JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }));
      const savedName = name.trim();
      setIsLoading(false); setTouched(false); setPhase('idle');
      setMode('login'); setEmail(''); setPassword(''); setShowPassword(false);
      setName(savedName);
      setSuccess('Account created! Login with your name & password.');
      return;
    }

    // Login: name + password only
    if (!name.trim() || !password.trim()) return;
    const stored = localStorage.getItem('mdr_user');
    if (!stored) { setError('No account found. Please sign up.'); return; }
    const user = JSON.parse(stored);
    if (user.name.toLowerCase() !== name.trim().toLowerCase()) { setError('Name not found'); return; }
    if (user.password !== password) { setError('Incorrect password'); return; }
    setIsLoading(true); setTouched(true); setPhase('touch');
    await new Promise(r => setTimeout(r, 1200));
    onLogin(user.name, password);
  };

  const fs = (c: string) => ({ background:`rgba(${c},0.05)`, border:`1px solid rgba(${c},0.18)`, borderRadius:'8px', color:'#e2e8f0' });

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden" style={{background:'#04060f'}}>
      {/* HANDS */}
      <div className="absolute inset-0">
        {[['inset(0 50% 0 0)', touched?'translateX(0)':'translateX(-35px)'],['inset(0 0 0 50%)', touched?'translateX(0)':'translateX(35px)']].map(([clip,tx],i)=>(
          <div key={i} className="absolute inset-0 overflow-hidden" style={{clipPath:clip,transform:tx,transition:'transform 0.9s cubic-bezier(0.34,1.2,0.64,1)'}}>
            <img src="/hands.jpg" alt="" className="w-full h-full object-cover" style={{opacity:0.88,filter:'brightness(0.65) saturate(1.3)',animation:'handsZoom 8s ease-in-out infinite alternate'}}/>
          </div>
        ))}
        <div className="absolute inset-0" style={{background:'radial-gradient(ellipse 90% 90% at 50% 45%,rgba(4,6,15,0.1) 0%,rgba(4,6,15,0.55) 60%,rgba(4,6,15,0.96) 100%)'}}/>
        <div className="absolute pointer-events-none" style={{top:'44%',left:'50%',transform:'translate(-50%,-50%)',width:'180px',height:'180px',background:'radial-gradient(circle,rgba(56,189,248,0.35) 0%,transparent 70%)',filter:'blur(10px)',animation:'glowPulse 2.5s ease-in-out infinite'}}/>
      </div>
      {/* BG */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{position:'absolute',left:0,right:0,height:'2px',background:'linear-gradient(90deg,transparent,rgba(14,165,233,0.4),rgba(56,189,248,0.6),rgba(14,165,233,0.4),transparent)',filter:'blur(1px)',animation:'scanLine 6s linear infinite'}}/>
        {[...Array(8)].map((_,i)=>(
          <div key={i} className="absolute rounded-full" style={{width:i%3===0?'4px':'2px',height:i%3===0?'4px':'2px',background:i%2===0?'rgba(56,189,248,0.7)':'rgba(249,115,22,0.6)',top:`${8+i*11}%`,left:`${4+i*12}%`,boxShadow:i%2===0?'0 0 6px rgba(56,189,248,0.8)':'0 0 6px rgba(249,115,22,0.8)',animation:`particle ${3+(i%4)}s ease-in-out infinite alternate`,animationDelay:`${i*0.3}s`}}/>
        ))}
      </div>
      {phase==='touch' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{zIndex:20}}>
          <div style={{width:'350px',height:'350px',background:'radial-gradient(circle,rgba(56,189,248,0.35) 0%,rgba(14,165,233,0.1) 50%,transparent 70%)',filter:'blur(20px)',animation:'softGlow 1.2s ease-out forwards'}}/>
        </div>
      )}

      {/* CARD */}
      <div className="absolute z-10" style={{width:'300px',top:'44%',left:'50%',transform:'translate(-50%,-50%)'}}>
        <div className="h-px" style={{background:'linear-gradient(90deg,transparent,rgba(14,165,233,0.9),rgba(139,92,246,0.7),transparent)'}}/>
        <div className="px-6 py-5 relative" style={{background:'rgba(4,6,15,0.88)',border:'1px solid rgba(14,165,233,0.25)',borderTop:'none',backdropFilter:'blur(30px)',boxShadow:touched?'0 0 60px rgba(14,165,233,0.5)':'0 0 30px rgba(14,165,233,0.12)',transition:'box-shadow 0.6s ease'}}>
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{borderColor:'rgba(14,165,233,0.7)'}}/>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{borderColor:'rgba(14,165,233,0.7)'}}/>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{borderColor:'rgba(139,92,246,0.7)'}}/>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{borderColor:'rgba(139,92,246,0.7)'}}/>

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#0ea5e9,#8b5cf6)',boxShadow:'0 0 16px rgba(14,165,233,0.4)'}}>
              <NotebookPen size={15} className="text-white"/>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-widest uppercase leading-none" style={{background:'linear-gradient(135deg,#38bdf8,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>MD Researcher</h1>
              <div className="flex items-center gap-1 mt-0.5"><Zap size={7} className="text-sky-400"/><span className="text-[8px] font-bold tracking-widest uppercase text-sky-400">Powered by Gemini</span></div>
            </div>
          </div>

          {/* Toggle */}
          <div className="flex p-1 rounded-xl mb-4 gap-1" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.06)'}}>
            {(['login','signup'] as const).map(m=>(
              <button key={m} type="button" onClick={()=>switchMode(m)}
                className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                style={mode===m?{background:'linear-gradient(135deg,rgba(14,165,233,0.25),rgba(139,92,246,0.2))',color:m==='login'?'#38bdf8':'#a78bfa',border:`1px solid ${m==='login'?'rgba(14,165,233,0.3)':'rgba(139,92,246,0.3)'}`}:{color:'rgba(148,163,184,0.35)'}}>
                {m==='login'?'Login':'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5" autoComplete="off">
            {/* Name - always shown */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{color:'rgba(148,163,184,0.5)'}}>Name</label>
              <div className="relative">
                <User size={11} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'rgba(14,165,233,0.5)'}}/>
                <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"
                  className="w-full pl-8 pr-3 py-2 text-xs font-medium outline-none transition-all"
                  style={fs('14,165,233')} autoComplete="off" name="mdr-name"
                  onFocus={e=>e.target.style.borderColor='rgba(14,165,233,0.6)'}
                  onBlur={e=>e.target.style.borderColor='rgba(14,165,233,0.18)'}/>
              </div>
            </div>

            {/* Email - signup only */}
            {mode==='signup' && (
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{color:'rgba(148,163,184,0.5)'}}>Email</label>
                <div className="relative">
                  <Mail size={11} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'rgba(14,165,233,0.5)'}}/>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="researcher@domain.com"
                    className="w-full pl-8 pr-3 py-2 text-xs font-medium outline-none transition-all"
                    style={fs('14,165,233')} autoComplete="email"
                    onFocus={e=>e.target.style.borderColor='rgba(14,165,233,0.6)'}
                    onBlur={e=>e.target.style.borderColor='rgba(14,165,233,0.18)'}/>
                </div>
              </div>
            )}

            {/* Password - always shown */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{color:'rgba(148,163,184,0.5)'}}>Password</label>
              <div className="relative">
                <Lock size={11} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:'rgba(139,92,246,0.5)'}}/>
                <input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full pl-8 pr-8 py-2 text-xs font-medium outline-none transition-all"
                  style={fs('139,92,246')} autoComplete={mode==='login'?'current-password':'new-password'}
                  onFocus={e=>e.target.style.borderColor='rgba(139,92,246,0.6)'}
                  onBlur={e=>e.target.style.borderColor='rgba(139,92,246,0.18)'}/>
                <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{color:'rgba(148,163,184,0.3)'}}>
                  {showPassword?<EyeOff size={11}/>:<Eye size={11}/>}
                </button>
              </div>
            </div>

            {error && <p className="text-[10px] font-semibold text-red-400 text-center">{error}</p>}
            {success && <p className="text-[10px] font-semibold text-emerald-400 text-center">{success}</p>}

            <button type="submit" disabled={!name.trim()||!password.trim()||isLoading}
              className="w-full py-2.5 font-black text-xs uppercase tracking-widest text-white transition-all disabled:opacity-40 active:scale-[0.98]"
              style={{borderRadius:'8px',background:'linear-gradient(135deg,#0ea5e9,#8b5cf6)',boxShadow:touched?'0 0 30px rgba(14,165,233,0.5)':'0 0 15px rgba(14,165,233,0.2)',transition:'all 0.4s'}}>
              {isLoading?(
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  {mode==='login'?'Connecting...':'Creating...'}
                </span>
              ):(
                <span className="flex items-center justify-center gap-2">
                  <Zap size={12} fill="currentColor"/>
                  {mode==='login'?'Access Platform':'Create Account'}
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-[9px] mt-3" style={{color:'rgba(148,163,184,0.3)'}}>
            {mode==='login'?"Don't have an account? ":"Already have an account? "}
            <button type="button" onClick={()=>switchMode(mode==='login'?'signup':'login')} className="font-bold" style={{color:'rgba(56,189,248,0.7)'}}>
              {mode==='login'?'Sign Up':'Login'}
            </button>
          </p>
        </div>
        <div className="h-px" style={{background:'linear-gradient(90deg,transparent,rgba(139,92,246,0.8),rgba(14,165,233,0.7),transparent)'}}/>
      </div>

      <style>{`
        @keyframes handsZoom{0%{transform:scale(1);filter:brightness(0.65) saturate(1.3)}100%{transform:scale(1.06);filter:brightness(0.72) saturate(1.5)}}
        @keyframes glowPulse{0%,100%{opacity:0.4;transform:translate(-50%,-50%) scale(0.8)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.4)}}
        @keyframes scanLine{0%{top:-2px}100%{top:100%}}
        @keyframes particle{0%{transform:translateY(0) scale(1);opacity:0.6}100%{transform:translateY(-18px) scale(1.3);opacity:1}}
        @keyframes softGlow{0%{opacity:0;transform:scale(0.4)}40%{opacity:1;transform:scale(1.1)}100%{opacity:0;transform:scale(1.5)}}
      `}</style>
    </div>
  );
};
