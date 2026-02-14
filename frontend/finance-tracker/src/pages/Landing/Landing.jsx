import { useNavigate } from 'react-router-dom'
import { useRef, useContext, useEffect } from 'react'
import { FaDollarSign, FaWallet, FaChartLine, FaPiggyBank } from 'react-icons/fa'
import { UserContext } from '../../context/UserContext'
import toast from 'react-hot-toast'
import '../../index.css'

/**
 * Landing Page Component:
 * Public-facing entry point of FinRace.
 * Features immersive animations, product information, and a contact form.
 */
const Landing = () => {
    const navigate = useNavigate();
    const contactRef = useRef(null);
    const { isAuthenticated } = useContext(UserContext);

    /**
     * Contact Form Handler:
     * Submits user inquiries to Web3Forms API.
     * Uses React Hot Toast for state-aware UI feedback.
     */
    const handleContactSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const name = formData.get('name') || '';
        const loadingToast = toast.loading('Sending message...');

        try {
            const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
            const data = await response.json();

            if (data.success) {
                toast.success(`Thanks ${name}! We'll get back to you soon.`, { id: loadingToast });
                form.reset();
            } else {
                toast.error('Failed to send. Please try again.', { id: loadingToast });
            }
        } catch (error) {
            toast.error('Something went wrong.', { id: loadingToast });
        }
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
            {/* Global Navigation Bar */}
            <nav className="flex items-center justify-between px-6 md:px-12 py-6 w-full">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <img
                        src="https://lh3.googleusercontent.com/d/1sh3I52WFTUbvX-19WI1u400uuiZ9vgS8"
                        alt="FinRace"
                        className="w-10 h-10 transition-transform group-hover:scale-110"
                        loading="eager"
                        fetchPriority="high"
                        referrerPolicy="no-referrer"
                    />
                    <span className="text-xl font-semibold">FinRace</span>
                </div>
                <div className="flex items-center gap-4 md:gap-6">
                    <button onClick={() => navigate('/login')} className="text-sm md:text-base text-[var(--color-text)] opacity-70 hover:opacity-100 transition-opacity">Login</button>
                    <button onClick={() => navigate('/signUp')} className="text-sm md:text-base px-4 md:px-5 py-2 bg-[var(--color-text)] text-[var(--color-bg)] rounded-lg hover:opacity-90 transition-opacity">Sign Up</button>
                </div>
            </nav>

            {/* Hero Section: Features GPU-accelerated Aura animations */}
            <main className="min-h-[90vh] flex flex-col items-center justify-center w-full px-6 md:px-12 py-12 relative overflow-hidden">
                {/* Immersive Background: Floating orbs and icons using 'will-change: transform' for performance */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] bg-[#a277ff]/[0.1] blur-[160px] rounded-full animate-float-orb"></div>
                    <div className="absolute -bottom-[10%] -right-[10%] w-[1000px] h-[1000px] bg-[#61ffca]/[0.05] blur-[200px] rounded-full animate-float-orb-delayed"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f694ff]/[0.05] blur-[180px] rounded-full animate-float-orb-slow"></div>

                    <div className="absolute top-[10%] left-[5%] animate-float-icon text-[#a277ff]/15"><FaDollarSign size={100} /></div>
                    <div className="absolute top-[40%] right-[8%] animate-float-icon-slow text-[#61ffca]/10"><FaChartLine size={120} /></div>
                    <div className="absolute bottom-[15%] left-[15%] animate-float-icon text-[#f694ff]/15"><FaWallet size={80} /></div>
                    <div className="absolute top-[65%] right-[5%] animate-float-icon-slow text-[#61ffca]/10"><FaPiggyBank size={110} /></div>
                    <div className="absolute top-[20%] right-[20%] animate-float-icon text-[#a277ff]/15"><FaDollarSign size={60} /></div>
                    <div className="absolute bottom-[5%] right-[30%] animate-float-icon text-[#61ffca]/10"><FaWallet size={40} /></div>
                    <div className="absolute top-[50%] left-[30%] animate-float-icon-slow text-[#a277ff]/15"><FaDollarSign size={70} /></div>
                </div>

                <div className="max-w-3xl mx-auto text-center animate-fade-in relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/5 border border-purple-500/10 mb-10">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400">Next Gen Finance Tracking</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[1.1] tracking-tight">
                        Your money, <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#a277ff] to-[#61ffca]">finally organized.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-[var(--color-text)] opacity-40 mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
                        FinRace is the simplest way to track your expenses, hit your goals, and build wealth—all in one beautiful app.
                    </p>

                    <button onClick={() => navigate('/signUp')} className="w-full sm:w-auto px-10 py-4 bg-[#a277ff] text-[#15141b] rounded-2xl hover:bg-[#a277ff]/90 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg font-bold shadow-xl shadow-[#a277ff]/10">
                        Start Tracking Free
                    </button>

                    <p className="mt-8 text-xs text-[var(--color-text)] opacity-20 font-bold tracking-widest uppercase">No credit card • Free forever</p>
                </div>

                {/* Ambient dynamic glows for deep dark aura effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-purple-600/[0.03] blur-[120px] pointer-events-none rounded-full"></div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20 hidden md:block">
                    <div className="w-[1px] h-8 bg-gradient-to-b from-white/40 to-transparent rounded-full"></div>
                </div>
            </main>

            {/* Product Value Propositions */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
                <h2 className="text-3xl md:text-4xl font-bold mb-12 md:mb-16">What makes FinRace different</h2>
                <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                    <div>
                        <div className="text-4xl mb-4">📊</div>
                        <h3 className="text-xl md:text-2xl font-semibold mb-3">See where it goes</h3>
                        <p className="text-[var(--color-text)] opacity-70 leading-relaxed">
                            Beautiful charts that actually make sense. No confusing graphs or complicated reports—just clear insights into your spending.
                        </p>
                    </div>
                    <div>
                        <div className="text-4xl mb-4">🤖</div>
                        <h3 className="text-xl md:text-2xl font-semibold mb-3">AI does the work</h3>
                        <p className="text-[var(--color-text)] opacity-70 leading-relaxed">
                            Stop manually categorizing transactions. Our AI learns your patterns and does it automatically, so you don't have to.
                        </p>
                    </div>
                    <div>
                        <div className="text-4xl mb-4">🔒</div>
                        <h3 className="text-xl md:text-2xl font-semibold mb-3">Your data is yours</h3>
                        <p className="text-[var(--color-text)] opacity-70 leading-relaxed">
                            Bank-level encryption and security. We never sell your data, and you can export or delete it anytime.
                        </p>
                    </div>
                </div>
            </section>

            {/* Workflow Guide */}
            <section className="bg-[var(--color-input)] py-20 md:py-32 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 md:mb-16">How it works</h2>
                    <div className="space-y-12 md:space-y-16">
                        <div className="flex gap-6 md:gap-8 items-start">
                            <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-[var(--color-text)] text-[var(--color-bg)] rounded-full flex items-center justify-center text-lg md:text-xl font-bold">1</div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-semibold mb-2">Add your transactions</h3>
                                <p className="text-[var(--color-text)] opacity-70 text-base md:text-lg">Manually add expenses or upload your bank statements. Takes less than a minute.</p>
                            </div>
                        </div>
                        <div className="flex gap-6 md:gap-8 items-start">
                            <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-[var(--color-text)] text-[var(--color-bg)] rounded-full flex items-center justify-center text-lg md:text-xl font-bold">2</div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-semibold mb-2">AI categorizes everything</h3>
                                <p className="text-[var(--color-text)] opacity-70 text-base md:text-lg">Our AI automatically sorts your spending into categories. You can adjust if needed.</p>
                            </div>
                        </div>
                        <div className="flex gap-6 md:gap-8 items-start">
                            <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-[var(--color-text)] text-[var(--color-bg)] rounded-full flex items-center justify-center text-lg md:text-xl font-bold">3</div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-semibold mb-2">Get insights that matter</h3>
                                <p className="text-[var(--color-text)] opacity-70 text-base md:text-lg">See trends, set budgets, and get alerts when you're overspending. Simple as that.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Support and Inquiries Section */}
            <section ref={contactRef} className="max-w-3xl mx-auto px-6 md:px-12 py-20 md:py-32">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Questions? Let's talk</h2>
                <p className="text-lg md:text-xl text-[var(--color-text)] opacity-70 mb-8 md:mb-12">We're here to help. Drop us a message and we'll get back to you.</p>

                <form onSubmit={handleContactSubmit} className="space-y-6">
                    <input type="hidden" name="access_key" value="b527ab92-6d1d-483d-b973-ec67ff5b67bf" />
                    <input type="hidden" name="redirect" value="false" />

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Name</label>
                            <input name="name" placeholder="Your name" className="w-full px-4 py-3 bg-transparent border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-text)]" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input name="email" type="email" placeholder="you@example.com" className="w-full px-4 py-3 bg-transparent border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-text)]" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Message</label>
                        <textarea name="message" placeholder="Tell us what's on your mind..." className="w-full px-4 py-3 bg-transparent border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-text)] h-32 resize-none" required />
                    </div>

                    <button type="submit" className="w-full px-6 py-4 bg-[var(--color-text)] text-[var(--color-bg)] rounded-lg hover:opacity-90 font-semibold text-base md:text-lg transition-opacity">
                        Send message
                    </button>
                </form>
            </section>

            <footer className="border-t border-[var(--color-border)] py-8 md:py-12">
                <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img
                            src="https://lh3.googleusercontent.com/d/1sh3I52WFTUbvX-19WI1u400uuiZ9vgS8"
                            alt="FinRace"
                            className="w-8 h-8 transition-transform group-hover:scale-110"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                        />
                        <span className="font-semibold">FinRace</span>
                    </div>
                    <p className="text-sm text-[var(--color-text)] opacity-50">© 2025 FinRace. Made with care.</p>
                </div>
            </footer>
        </div>
    )
}

export default Landing;
