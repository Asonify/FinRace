import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LuCrown, LuSparkles, LuCheck } from 'react-icons/lu';
import Modal from './Modal';

const UpgradeSubscriptionModal = ({ isOpen, onClose, limitType = 'insights', message }) => {
    const navigate = useNavigate();

    const handleUpgradeClick = () => {
        onClose();
        navigate('/subscription');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Limit Reached">
            <div className="text-center py-4 flex flex-col items-center">
                {/* Glowing Crown Icon */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold)] blur-xl opacity-30 animate-pulse"></div>
                    <div className="relative w-16 h-16 bg-[var(--color-input)] border border-[var(--color-border)] rounded-full flex items-center justify-center text-[var(--color-gold)]">
                        <LuCrown className="w-8 h-8 animate-bounce" />
                    </div>
                </div>

                <h3 className="text-2xl font-extrabold text-[var(--color-text)] mb-3 tracking-tight">
                    Upgrade to Premium
                </h3>

                <p className="text-base text-[var(--color-text)] opacity-70 mb-6 max-w-md">
                    {message || (limitType === 'insights' 
                        ? "You have reached your monthly limit for AI insights on your current plan." 
                        : "You have reached your monthly limit for bill scanning on your current plan.")}
                </p>

                {/* Features Unlock list */}
                <div className="w-full max-w-md bg-[var(--color-input)] rounded-xl p-5 border border-[var(--color-border)] mb-6 text-left">
                    <p className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <LuSparkles className="w-3.5 h-3.5" /> Unlock Premium Features
                    </p>
                    <ul className="space-y-2.5">
                        <li className="flex items-start gap-2.5 text-sm text-[var(--color-text)] opacity-95">
                            <span className="p-0.5 rounded-full bg-green-500/10 text-[var(--color-income)] mt-0.5 flex-shrink-0">
                                <LuCheck className="w-3.5 h-3.5" />
                            </span>
                            <span>Up to 35 AI Insights / month</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-[var(--color-text)] opacity-95">
                            <span className="p-0.5 rounded-full bg-green-500/10 text-[var(--color-income)] mt-0.5 flex-shrink-0">
                                <LuCheck className="w-3.5 h-3.5" />
                            </span>
                            <span>Up to 40 Bill Scans / month</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-[var(--color-text)] opacity-95">
                            <span className="p-0.5 rounded-full bg-green-500/10 text-[var(--color-income)] mt-0.5 flex-shrink-0">
                                <LuCheck className="w-3.5 h-3.5" />
                            </span>
                            <span>Premium Glassmorphic Dashboard access</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-sm text-[var(--color-text)] opacity-95">
                            <span className="p-0.5 rounded-full bg-green-500/10 text-[var(--color-income)] mt-0.5 flex-shrink-0">
                                <LuCheck className="w-3.5 h-3.5" />
                            </span>
                            <span>Instant usage & quota tracking updates</span>
                        </li>
                    </ul>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center mt-2">
                    <button
                        onClick={onClose}
                        className="px-5 py-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-input)] text-[var(--color-text)] font-semibold transition-all flex-1 cursor-pointer"
                    >
                        Maybe Later
                    </button>
                    <button
                        onClick={handleUpgradeClick}
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-purple-600 hover:from-[var(--color-primary)]/90 hover:to-purple-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex-1 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span>Upgrade Now</span>
                        <LuCrown className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default UpgradeSubscriptionModal;
