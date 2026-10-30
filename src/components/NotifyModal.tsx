import React, { useState } from 'react';
import { X, Check, Copy, Sparkles, Layers, ShieldCheck, Mail } from 'lucide-react';
import { sound } from '../audio/sound.ts';

interface NotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotifyModal: React.FC<NotifyModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [passNumber] = useState(() => Math.floor(1000 + Math.random() * 9000));
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    sound.playChime(660, 0.5);
    setIsSubmitted(true);
  };

  const handleCopyPass = () => {
    navigator.clipboard.writeText(`SPATIAL-VIP-${passNumber}`);
    sound.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <div
        onClick={() => {
          sound.playClick();
          onClose();
        }}
        className="absolute inset-0 bg-black/75 transition-opacity duration-300"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-[#0e1017] border border-white/10 p-6 sm:p-8 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white mb-2">
              Commencing Operations Soon
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed mb-6">
              Be the first to access our zero-cost spatial engine. Convert any 2D portrait, landscape, or graphic into full interactive 3D space right inside your browser.
            </p>

            {/* Perks */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Free Tier guaranteed forever for early supporters</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Zero GPU or software install needed — purely in-browser</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98] cursor-pointer"
              >
                Claim Free Founder Pass
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">You're on the Priority List</h3>
            <p className="text-sm text-neutral-400 mb-6">
              We'll send your instant activation key to <span className="text-white font-medium">{email}</span> the moment operations begin.
            </p>

            {/* VIP Founder Pass Badge */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 mb-6 text-left relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300">
                  Founder Pass #0{passNumber}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  FREE LIFETIME TIER
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-base font-bold text-white">
                <span>SPATIAL-VIP-{passNumber}</span>
                <button
                  onClick={handleCopyPass}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 transition-colors cursor-pointer"
                  title="Copy pass"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Back to Experience
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
