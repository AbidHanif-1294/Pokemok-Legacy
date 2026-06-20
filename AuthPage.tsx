import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import monsters from '../data/monsters';
import MonsterSprite from '../components/MonsterSprite';

type Mode = 'signin' | 'signup';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const featured = monsters.filter(m => m.rarity === 'mythical' || m.rarity === 'legendary').slice(0, 8);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'signup' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    if (mode === 'signup') {
      const { error: err } = await signUp(email, password);
      if (err) {
        setError(err);
      } else {
        setSuccess('Account created! Signing you in…');
        const { error: signInErr } = await signIn(email, password);
        if (signInErr) setError(signInErr);
      }
    } else {
      const { error: err } = await signIn(email, password);
      if (err) setError(err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* floating monsters */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {featured.map((m, i) => (
          <motion.div
            key={m.id}
            className="absolute opacity-20"
            style={{ left: `${(i / featured.length) * 90 + 5}%`, top: `${(i % 3) * 30 + 10}%` }}
            animate={{ y: [0, -12, 0], rotate: [0, i % 2 === 0 ? 5 : -5, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          >
            <MonsterSprite row={m.spriteRow} col={m.spriteCol} size={56} />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">MONSTER</span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">CLASH</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Collect. Battle. Conquer.</p>
        </div>

        {/* card */}
        <div className="bg-slate-900/80 backdrop-blur border border-white/10 rounded-3xl p-6 shadow-2xl">
          {/* tabs */}
          <div className="flex rounded-xl bg-slate-800 p-1 mb-6">
            {(['signin', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-all ${
                  mode === m ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {m === 'signin' ? <LogIn size={14} /> : <UserPlus size={14} />}
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl text-white placeholder-slate-500 outline-none text-sm transition-colors"
              />
            </div>

            {/* password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-9 pr-10 py-3 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl text-white placeholder-slate-500 outline-none text-sm transition-colors"
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* confirm (signup only) */}
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      required={mode === 'signup'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl text-white placeholder-slate-500 outline-none text-sm transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-green-400 text-xs bg-green-950/40 border border-green-800/40 rounded-lg px-3 py-2"
                >
                  {success}
                </motion.p>
              )}
            </AnimatePresence>

            {/* submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black rounded-xl text-sm shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles size={16} />
                </motion.div>
              ) : (
                <>
                  {mode === 'signin' ? <LogIn size={16} /> : <UserPlus size={16} />}
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </motion.button>
          </form>

          <p className="text-slate-500 text-xs text-center mt-4">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }} className="text-blue-400 hover:text-blue-300 font-semibold">
              {mode === 'signin' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-slate-600 text-xs text-center mt-4">Your collection is saved to your account</p>
      </motion.div>
    </div>
  );
}
