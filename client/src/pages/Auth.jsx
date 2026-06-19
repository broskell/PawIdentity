import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'signup' : 'login';
  
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('owner');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        // Sign up expects email, password, and sync role
        await signup(email, password, role);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle(role);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Google Auth failed.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-12 font-body select-none">
      <div className="w-full max-w-[400px] flex flex-col gap-8 bg-surface border border-border rounded-[24px] p-8">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="font-heading font-black text-2xl tracking-tighter">
            PAWIDENTITY
          </h2>
          <p className="text-secondary text-sm">
            {mode === 'login' ? 'Welcome back. Access your pet keys.' : 'Create your digital identity account.'}
          </p>
        </div>

        {error && (
          <div className="text-xs font-mono border border-neutral-800 bg-[#070707] text-neutral-400 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
          {mode === 'signup' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black border border-border rounded-lg h-11 px-4 text-white focus:outline-none focus:border-neutral-500 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Phone</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="bg-black border border-border rounded-lg h-11 px-4 text-white focus:outline-none focus:border-neutral-500 font-medium font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-black border border-border rounded-lg h-11 px-3 text-white focus:outline-none focus:border-neutral-500 font-medium"
                >
                  <option value="owner">Pet Owner</option>
                  <option value="vet">Veterinarian</option>
                  <option value="shelter">Animal Shelter</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black border border-border rounded-lg h-11 px-4 text-white focus:outline-none focus:border-neutral-500 font-medium"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-secondary text-xs uppercase tracking-wider font-semibold">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black border border-border rounded-lg h-11 px-4 text-white focus:outline-none focus:border-neutral-500 font-medium"
            />
          </div>

          <button 
            type="submit"
            disabled={submitting}
            className="w-full bg-white text-black font-semibold h-11 rounded-lg mt-2 hover:bg-neutral-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Authenticating...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-neutral-600 text-xs font-mono uppercase font-bold">OR</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-transparent border border-border text-white font-medium h-11 rounded-lg hover:bg-black transition-colors duration-200 flex items-center justify-center gap-2"
        >
          Continue with Google
        </button>

        <div className="text-center text-xs text-secondary mt-2">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button 
                onClick={() => setMode('signup')}
                className="text-white font-bold underline underline-offset-4"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button 
                onClick={() => setMode('login')}
                className="text-white font-bold underline underline-offset-4"
              >
                Log in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
