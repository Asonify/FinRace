import React, { useContext } from 'react';
import { SIDE_MENU_DATA } from '../../utils/data';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import CharAvatar from '../Cards/CharAvatar';
import Modal from './Modal';
import LogoutConfirm from './LogoutConfirm';
import { HiOutlineDownload } from 'react-icons/hi';

const SideMenu = ({ activeMenu }) => {
    const { user, clearUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [openLogoutModal, setOpenLogoutModal] = React.useState(false);
    const [deferredPrompt, setDeferredPrompt] = React.useState(null);
    const [isStandalone, setIsStandalone] = React.useState(false);

    React.useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
            setIsStandalone(true);
        }

        const handlePrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handlePrompt);
        return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    const handleClick = (route) => {
        const normalized = String(route || '').toLowerCase();

        if (normalized === "logout" || normalized === "/logout") {
            setOpenLogoutModal(true);
            return;
        }

        navigate(route);
    };

    return (
        <div className="w-full h-full bg-[var(--color-card)] border-r border-[var(--color-border)] p-6 flex flex-col overflow-y-auto transition-colors duration-300">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <img src="https://lh3.googleusercontent.com/d/1sh3I52WFTUbvX-19WI1u400uuiZ9vgS8" alt="FinRace Logo" className="w-8 h-8" referrerPolicy="no-referrer" />
                <h1 className="text-xl font-bold text-[var(--color-text)] tracking-tight">FINRACE</h1>
            </div>

            {/* User Profile Section */}
            <div className="flex flex-col items-center gap-3 mb-8">
                {user?.profileImageUrl ? (
                    <img
                        src={user?.profileImageUrl || ""}
                        alt="Profile Image"
                        className='w-16 h-16 bg-slate-400 rounded-full object-cover'
                    />
                ) : (
                    <CharAvatar
                        fullName={user?.fullName}
                        width="w-16"
                        height="h-16"
                        style="text-lg"
                    />
                )}
                <h5 className="text-[var(--color-text)] font-bold text-lg text-center">
                    {user?.fullName || "Mike William"}
                </h5>
            </div>

            {/* Navigation Menu */}
            <div className="flex flex-col gap-2 flex-1">
                {SIDE_MENU_DATA.map((item, index) => (
                    <button
                        key={`menu_${index}`}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${activeMenu === item.label
                            ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                            : "text-[var(--color-text)] hover:bg-[var(--color-input)] hover:text-purple-600 dark:hover:text-purple-400 opacity-80 hover:opacity-100"
                            }`}
                        onClick={() => handleClick(item.path)}
                    >
                        <item.icon className="text-xl" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Download App Section (Always at Bottom) */}
            {!isStandalone && (
                <div className="mt-auto pt-6 border-t border-white/5">
                    <button
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 border border-dashed ${deferredPrompt
                            ? "border-purple-500/30 text-purple-400 hover:bg-purple-500/5 hover:border-purple-500/50"
                            : "border-white/10 text-white/30 cursor-default"
                            }`}
                        onClick={handleInstallClick}
                        disabled={!deferredPrompt}
                    >
                        <HiOutlineDownload className="text-xl" />
                        <span>{deferredPrompt ? "Download FinRace App" : "App Ready"}</span>
                    </button>
                </div>
            )}

            <Modal isOpen={openLogoutModal} onClose={() => setOpenLogoutModal(false)} title="Logout">
                <LogoutConfirm
                    onCancel={() => setOpenLogoutModal(false)}
                    onLogout={() => {
                        clearUser();
                        setOpenLogoutModal(false);
                        navigate('/');
                    }}
                />
            </Modal>
        </div>
    );
};

export default SideMenu