import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import {
  LuPlus,
  LuSearch,
  LuCalendar,
  LuTrendingUp,
  LuDatabase,
  LuFileSpreadsheet,
  LuInfo,
  LuUser,
  LuPhone,
  LuDollarSign,
  LuClock,
  LuChevronLeft,
  LuChevronRight,
  LuCheck,
  LuFileText,
  LuTrash2
} from 'react-icons/lu';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const UdhaarHome = () => {
  const navigate = useNavigate();

  // Core state
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, borrowers, calendar, analytics, backup

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, partially paid, paid, overdue
  const [sortField, setSortField] = useState('dueDate'); // dueDate, name, amount, recentlyAdded
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [dateRange, setDateRange] = useState('all'); // all, 30, 90, 365

  // Calendar state
  const [calendarView, setCalendarView] = useState('month'); // month, week
  const [currentDate, setCurrentDate] = useState(moment());

  // Backup file state
  const [backupFile, setBackupFile] = useState(null);

  // Fetch all loans & map to flat layout
  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.UDHAAR.GET_ALL);
      if (response.data) {
        // Flatten borrowers ledger with active/historical loans
        const flatLoans = [];
        response.data.forEach(b => {
          if (b.loans && b.loans.length > 0) {
            b.loans.forEach(l => {
              flatLoans.push({
                _id: b._id, // use borrower id so navigation works
                loanId: l._id,
                borrowerName: b.fullName,
                borrowerMobile: b.phone,
                borrowerEmail: b.email,
                borrowerAddress: b.address || '',
                borrowerPhoto: b.profilePhoto,
                borrowerNotes: b.notes || '',
                amount: l.amountGiven,
                amountPaid: l.amountPaid,
                remainingBalance: l.remainingBalance,
                purpose: l.purpose,
                interestRate: l.interestRate,
                dateGiven: l.dateGiven,
                dueDate: l.dueDate,
                paymentFrequency: l.paymentFrequency,
                status: l.status,
                documents: l.documents || [],
                repayments: b.payments.filter(p => p.loanId.toString() === l._id.toString()).map(p => ({
                  _id: p._id,
                  amount: p.amount,
                  date: p.paymentDate,
                  paymentMethod: p.paymentMethod,
                  remarks: p.remarks,
                  receiptNumber: p.receiptNumber
                })),
                createdAt: b.createdAt
              });
            });
          } else {
            // borrower with no loan
            flatLoans.push({
              _id: b._id,
              loanId: null,
              borrowerName: b.fullName,
              borrowerMobile: b.phone,
              borrowerEmail: b.email,
              borrowerAddress: b.address || '',
              borrowerPhoto: b.profilePhoto,
              borrowerNotes: b.notes || '',
              amount: 0,
              amountPaid: 0,
              remainingBalance: 0,
              purpose: '',
              interestRate: null,
              dateGiven: null,
              dueDate: null,
              paymentFrequency: 'One Time',
              status: 'Paid',
              documents: [],
              repayments: [],
              createdAt: b.createdAt
            });
          }
        });
        setLoans(flatLoans);
      }
    } catch (error) {
      console.error('Error fetching lending records:', error);
      toast.error('Failed to load lending records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  // Reset form / Clear filters
  const resetForm = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setSortField('dueDate');
    setMinAmount('');
    setMaxAmount('');
    setDateRange('all');
  };

  // Exports
  const handleExportExcel = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.UDHAAR.EXPORT_EXCEL, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'FinRace_Lending_Summary.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel file exported');
    } catch (error) {
      console.error(error);
      toast.error('Excel export failed');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.UDHAAR.EXPORT_CSV, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'FinRace_Lending_Summary.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV file exported');
    } catch (error) {
      console.error(error);
      toast.error('CSV export failed');
    }
  };

  // JSON Backup
  const handleBackup = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.UDHAAR.BACKUP);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response.data, null, 2));
      const link = document.createElement('a');
      link.setAttribute("href", dataStr);
      link.setAttribute("download", `FinRace_Udhaar_Backup_${moment().format('YYYYMMDD')}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Backup downloaded');
    } catch (error) {
      console.error(error);
      toast.error('Backup generation failed');
    }
  };

  // JSON Restore
  const handleRestore = async (e) => {
    e.preventDefault();
    if (!backupFile) {
      toast.error('Please upload a backup file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backupData = JSON.parse(event.target.result);
        const response = await axiosInstance.post(API_PATHS.UDHAAR.RESTORE, backupData);
        toast.success(response.data.message || 'Data restored successfully');
        setBackupFile(null);
        fetchLoans();
      } catch (error) {
        console.error(error);
        toast.error('Invalid backup file format or restoration failed');
      }
    };
    reader.readAsText(backupFile);
  };

  // Computations & Metrics
  const metrics = useMemo(() => {
    const today = moment().startOf('day');
    let totalGiven = 0;
    let totalRecovered = 0;
    let overdueAmt = 0;
    let activeBorrowers = new Set();
    let upcomingDues = [];
    let alerts = [];

    loans.forEach(loan => {
      const totalPaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
      const remaining = loan.amount - totalPaid;

      totalGiven += loan.amount;
      totalRecovered += totalPaid;

      const isPaid = loan.status === 'Paid' || remaining <= 0;
      const isOverdue = !isPaid && moment(loan.dueDate).isBefore(today);

      if (isOverdue) {
        overdueAmt += remaining;
        const overdueDays = today.diff(moment(loan.dueDate), 'days');
        alerts.push({
          id: loan._id,
          name: loan.borrowerName,
          type: 'overdue',
          message: `⚠️ Overdue Alert: ${loan.borrowerName}'s payment of ₹${remaining.toLocaleString()} is overdue by ${overdueDays} days.`,
          date: loan.dueDate
        });
      }

      if (!isPaid) {
        activeBorrowers.add(loan.borrowerMobile || loan.borrowerName);
        if (moment(loan.dueDate).isSameOrAfter(today)) {
          upcomingDues.push({
            id: loan._id,
            name: loan.borrowerName,
            amount: remaining,
            dueDate: loan.dueDate
          });

          const daysLeft = moment(loan.dueDate).diff(today, 'days');
          if (daysLeft === 0) {
            alerts.push({
              id: loan._id,
              name: loan.borrowerName,
              type: 'due_today',
              message: `📅 Due Today: ${loan.borrowerName}'s payment of ₹${remaining.toLocaleString()} is due today!`,
              date: loan.dueDate
            });
          } else if (daysLeft <= 3) {
            alerts.push({
              id: loan._id,
              name: loan.borrowerName,
              type: 'due_soon_3',
              message: `🔔 3-Day Alert: ${loan.borrowerName}'s payment of ₹${remaining.toLocaleString()} is due in ${daysLeft} days.`,
              date: loan.dueDate
            });
          } else if (daysLeft <= 7) {
            alerts.push({
              id: loan._id,
              name: loan.borrowerName,
              type: 'due_soon_7',
              message: `🔔 7-Day Alert: ${loan.borrowerName}'s payment of ₹${remaining.toLocaleString()} is due in ${daysLeft} days.`,
              date: loan.dueDate
            });
          }
        }
      }
    });

    upcomingDues.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    // Sort alerts: Overdue first, then by date ascending
    alerts.sort((a, b) => {
      if (a.type === 'overdue' && b.type !== 'overdue') return -1;
      if (a.type !== 'overdue' && b.type === 'overdue') return 1;
      return new Date(a.date) - new Date(b.date);
    });

    return {
      totalGiven,
      totalRecovered,
      pendingAmount: totalGiven - totalRecovered,
      overdueAmount: overdueAmt,
      activeBorrowerCount: activeBorrowers.size,
      upcomingDues: upcomingDues.slice(0, 5),
      alerts: alerts.slice(0, 5)
    };
  }, [loans]);

  // Filtering & Sorting
  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      // Search Query
      const query = searchQuery.toLowerCase();
      const matchQuery =
        loan.borrowerName.toLowerCase().includes(query) ||
        loan.borrowerMobile.includes(query) ||
        (loan.purpose && loan.purpose.toLowerCase().includes(query));

      // Status Filter
      const totalPaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
      const remaining = loan.amount - totalPaid;
      const isPaid = loan.status === 'Paid' || remaining <= 0;
      const isOverdue = !isPaid && moment(loan.dueDate).isBefore(moment().startOf('day'));

      let matchStatus = true;
      if (filterStatus === 'pending') {
        matchStatus = loan.status === 'Pending' && !isOverdue;
      } else if (filterStatus === 'partially paid') {
        matchStatus = loan.status === 'Partially Paid' && !isOverdue;
      } else if (filterStatus === 'paid') {
        matchStatus = isPaid;
      } else if (filterStatus === 'overdue') {
        matchStatus = isOverdue;
      }

      // Amount Filter
      let matchAmount = true;
      if (minAmount && loan.amount < Number(minAmount)) matchAmount = false;
      if (maxAmount && loan.amount > Number(maxAmount)) matchAmount = false;

      // Date Range Filter (given date)
      let matchDate = true;
      if (dateRange !== 'all') {
        const days = parseInt(dateRange);
        const cutoff = moment().subtract(days, 'days');
        matchDate = moment(loan.dateGiven).isSameOrAfter(cutoff);
      }

      return matchQuery && matchStatus && matchAmount && matchDate;
    }).sort((a, b) => {
      if (sortField === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortField === 'name') {
        return a.borrowerName.localeCompare(b.borrowerName);
      }
      if (sortField === 'amount') {
        return b.amount - a.amount;
      }
      if (sortField === 'recentlyAdded') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });
  }, [loans, searchQuery, filterStatus, sortField, minAmount, maxAmount, dateRange]);

  // Analytics Chart Data
  const chartData = useMemo(() => {
    // 1. Pending vs Recovered Pie Chart
    const pieData = [
      { name: 'Recovered', amount: metrics.totalRecovered },
      { name: 'Pending', amount: metrics.pendingAmount }
    ];

    // 2. Cash Flow: Grouping lent and repayments by month (last 6 months)
    const monthlyMap = {};
    for (let i = 5; i >= 0; i--) {
      const m = moment().subtract(i, 'months').format('MMM YYYY');
      monthlyMap[m] = { month: m, lent: 0, recovered: 0 };
    }

    loans.forEach(loan => {
      const monthLent = moment(loan.dateGiven).format('MMM YYYY');
      if (monthlyMap[monthLent]) {
        monthlyMap[monthLent].lent += loan.amount;
      }
      loan.repayments.forEach(r => {
        const monthPaid = moment(r.date).format('MMM YYYY');
        if (monthlyMap[monthPaid]) {
          monthlyMap[monthPaid].recovered += r.amount;
        }
      });
    });

    const cashFlowData = Object.values(monthlyMap);

    return {
      pieData,
      cashFlowData
    };
  }, [loans, metrics]);

  // Calendar Helper Grid Generation
  const calendarDays = useMemo(() => {
    const startOfMonth = moment(currentDate).startOf('month');
    const endOfMonth = moment(currentDate).endOf('month');
    const startWeek = moment(startOfMonth).startOf('week');
    const endWeek = moment(endOfMonth).endOf('week');

    const days = [];
    let day = moment(startWeek);

    while (day.isBefore(endWeek)) {
      days.push(moment(day));
      day.add(1, 'day');
    }

    return days;
  }, [currentDate]);

  const calendarWeeklyDays = useMemo(() => {
    const startOfWeek = moment(currentDate).startOf('week');
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(moment(startOfWeek).add(i, 'days'));
    }
    return days;
  }, [currentDate]);

  const getDuesForDate = (date) => {
    return loans.filter(loan => {
      const totalPaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
      const isPaid = loan.status === 'Paid' || totalPaid >= loan.amount;
      return !isPaid && moment(loan.dueDate).isSame(date, 'day');
    });
  };

  const getRepaymentsForDate = (date) => {
    const repayments = [];
    loans.forEach(loan => {
      loan.repayments.forEach(r => {
        if (moment(r.date).isSame(date, 'day')) {
          repayments.push({
            borrowerName: loan.borrowerName,
            amount: r.amount,
            receiptNumber: r.receiptNumber,
            id: loan._id
          });
        }
      });
    });
    return repayments;
  };

  return (
    <DashboardLayout activeMenu="Udhaar">
      <div className="transition-page transition-colors duration-300 relative pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-1">
              Udhaar Management
            </h1>
            <p className="text-[var(--color-text)] opacity-60 text-sm">
              Keep track of credit lent, borrower details, repayments, and smart reminders.
            </p>
          </div>
          <button
            onClick={() => navigate('/udhaar/add-borrower')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#B8962E] text-black font-bold rounded-xl shadow-lg transition-all transform active:scale-95 cursor-pointer shrink-0"
          >
            <LuPlus className="text-lg stroke-[3px]" />
            <span>Add New Udhaar</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--color-border)] mb-6 overflow-x-auto gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: LuInfo },
            { id: 'borrowers', label: 'Borrowers Ledger', icon: LuUser },
            { id: 'calendar', label: 'Calendar View', icon: LuCalendar },
            { id: 'analytics', label: 'Analytics', icon: LuTrendingUp },
            { id: 'backup', label: 'Backup & Restore', icon: LuDatabase }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[var(--color-text)] opacity-60 hover:opacity-100'
              }`}
            >
              <tab.icon className="text-base" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ==================== TAB CONTENT: OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  label: 'Total Udhaar Given',
                  value: `₹${metrics.totalGiven.toLocaleString()}`,
                  desc: 'Cumulative capital lent',
                  color: 'text-white border-white/10'
                },
                {
                  label: 'Total Recovered',
                  value: `₹${metrics.totalRecovered.toLocaleString()}`,
                  desc: `${((metrics.totalRecovered / (metrics.totalGiven || 1)) * 100).toFixed(1)}% recovery rate`,
                  color: 'text-[#22C55E] border-[#22C55E]/20 bg-[#22C55E]/5'
                },
                {
                  label: 'Pending Amount',
                  value: `₹${metrics.pendingAmount.toLocaleString()}`,
                  desc: 'Awaiting repayment',
                  color: 'text-[#D4AF37] border-[#D4AF37]/20 bg-[#D4AF37]/5'
                },
                {
                  label: 'Overdue Dues',
                  value: `₹${metrics.overdueAmount.toLocaleString()}`,
                  desc: 'Past final due dates',
                  color: 'text-[#EF4444] border-[#EF4444]/20 bg-[#EF4444]/5'
                }
              ].map((card, i) => (
                <div
                  key={i}
                  className={`card border flex flex-col justify-between p-5 rounded-2xl ${card.color}`}
                >
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--color-text)] opacity-50 font-bold mb-1">
                      {card.label}
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{card.value}</h3>
                  </div>
                  <p className="text-xs text-[var(--color-text)] opacity-60 mt-3 font-semibold">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Sub Overview Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Recovery Progress & Stats */}
              <div className="card lg:col-span-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Recovery Target</h3>
                  <p className="text-xs text-[var(--color-text)] opacity-60 mb-6">
                    A visual of capital recovery progress out of total lent principal.
                  </p>

                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2 font-bold">
                      <span className="text-[#22C55E]">Recovered (₹{metrics.totalRecovered.toLocaleString()})</span>
                      <span className="text-[#D4AF37]">Pending (₹{metrics.pendingAmount.toLocaleString()})</span>
                    </div>
                    <div className="w-full bg-[var(--color-input)] rounded-full h-4 p-0.5 border border-[var(--color-border)]">
                      <div
                        className="bg-gradient-to-r from-[#22C55E] to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(metrics.totalRecovered / (metrics.totalGiven || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-[var(--color-border)] pt-4 text-center mt-auto">
                  <div>
                    <h5 className="text-xl font-extrabold text-white">{metrics.activeBorrowerCount}</h5>
                    <p className="text-[10px] uppercase text-[var(--color-text)] opacity-50 font-bold mt-1">
                      Active Borrowers
                    </p>
                  </div>
                  <div>
                    <h5 className="text-xl font-extrabold text-[#EF4444]">
                      {loans.filter(l => {
                        const totalPaid = l.repayments.reduce((sum, r) => sum + r.amount, 0);
                        return (l.amount - totalPaid > 0) && moment(l.dueDate).isBefore(moment().startOf('day'));
                      }).length}
                    </h5>
                    <p className="text-[10px] uppercase text-[var(--color-text)] opacity-50 font-bold mt-1">
                      Overdue Accounts
                    </p>
                  </div>
                  <div>
                    <h5 className="text-xl font-extrabold text-[#22C55E]">
                      {loans.filter(l => {
                        const totalPaid = l.repayments.reduce((sum, r) => sum + r.amount, 0);
                        return totalPaid >= l.amount;
                      }).length}
                    </h5>
                    <p className="text-[10px] uppercase text-[var(--color-text)] opacity-50 font-bold mt-1">
                      Settled Loans
                    </p>
                  </div>
                </div>
              </div>

              {/* Upcoming Due Dates */}
              <div className="card lg:col-span-3 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-4">Upcoming Dues</h3>
                {metrics.upcomingDues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-center py-6">
                    <p className="text-xs text-[var(--color-text)] opacity-40">No upcoming dues found</p>
                  </div>
                ) : (
                  <div className="space-y-3.5 overflow-y-auto max-h-64 pr-1 flex-1">
                    {metrics.upcomingDues.map((due, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate(`/udhaar/${due.id}`)}
                        className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-input)] border border-[var(--color-border)] hover:border-[#D4AF37]/40 transition-all cursor-pointer text-xs font-semibold"
                      >
                        <div>
                          <p className="font-bold text-white">{due.name}</p>
                          <p className="text-[10px] text-[var(--color-text)] opacity-50 font-medium mt-0.5">
                            Due {moment(due.dueDate).format('DD MMM YYYY')}
                          </p>
                        </div>
                        <span className="font-extrabold text-[#D4AF37]">₹{due.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Smart Notifications & Alerts */}
              <div className="card lg:col-span-3 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-4">Smart Alerts</h3>
                {metrics.alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-center py-6">
                    <p className="text-xs text-[var(--color-text)] opacity-40">All reminders clear</p>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-64 pr-1 flex-1">
                    {metrics.alerts.map((alert, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate(`/udhaar/${alert.id}`)}
                        className={`p-3 rounded-xl border text-[11px] leading-relaxed cursor-pointer hover:opacity-90 transition-all font-semibold ${
                          alert.type === 'overdue'
                            ? 'bg-[#EF4444]/5 border-[#EF4444]/25 text-[#EF4444]'
                            : alert.type === 'due_today'
                            ? 'bg-amber-500/5 border-amber-500/25 text-amber-500'
                            : 'bg-white/5 border-white/10 text-white/80'
                        }`}
                      >
                        {alert.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB CONTENT: BORROWERS ==================== */}
        {activeTab === 'borrowers' && (
          <div className="space-y-6">
            {/* Search, Filter & Sort Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Search Bar */}
              <div className="lg:col-span-4 relative">
                <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                <input
                  type="text"
                  placeholder="Search by name, phone, purpose..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:border-[#D4AF37] transition"
                />
              </div>

              {/* Status Filter */}
              <div className="lg:col-span-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3.5 py-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="partially paid">Partially Paid</option>
                  <option value="paid">Fully Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              {/* Sort field */}
              <div className="lg:col-span-2">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="w-full px-3.5 py-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="dueDate">Sort by Due Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="amount">Sort by Amount</option>
                  <option value="recentlyAdded">Recently Added</option>
                </select>
              </div>

              {/* Date limit */}
              <div className="lg:col-span-2">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3.5 py-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="all">Lifetime</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="365">Last 365 Days</option>
                </select>
              </div>

              {/* Min/Max Amount */}
              <div className="lg:col-span-2 flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-1/2 px-2.5 py-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:border-[#D4AF37]"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-1/2 px-2.5 py-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Borrowers List Grid */}
            {filteredLoans.length === 0 ? (
              <div className="card text-center py-12 flex flex-col items-center">
                <p className="text-[var(--color-text)] opacity-40 mb-2">No matching borrower records found</p>
                <button
                  onClick={resetForm}
                  className="text-xs text-[#D4AF37] font-bold underline hover:text-[#B8962E] cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredLoans.map(loan => {
                  const totalPaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
                  const remaining = loan.amount - totalPaid;
                  const percentPaid = Math.min((totalPaid / loan.amount) * 100, 100);

                  const isPaid = loan.status === 'Paid' || remaining <= 0;
                  const isOverdue = !isPaid && moment(loan.dueDate).isBefore(moment().startOf('day'));

                  let statusBadge = (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-md">
                      Partially Paid
                    </span>
                  );

                  if (isPaid) {
                    statusBadge = (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 rounded-md">
                        Paid
                      </span>
                    );
                  } else if (isOverdue) {
                    statusBadge = (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 rounded-md">
                        Overdue
                      </span>
                    );
                  } else if (loan.status === 'Pending') {
                    statusBadge = (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-white/5 text-[var(--color-text)] opacity-60 border border-white/10 rounded-md">
                        Pending
                      </span>
                    );
                  }

                  return (
                    <div
                      key={loan._id}
                      onClick={() => navigate(`/udhaar/${loan._id}`)}
                      className={`card flex flex-col justify-between border cursor-pointer hover:translate-y-[-2px] transition-all duration-200 ${
                        isOverdue
                          ? 'border-[#EF4444]/35 bg-gradient-to-b from-[#EF4444]/5 to-transparent'
                          : isPaid
                          ? 'border-[#22C55E]/25 bg-gradient-to-b from-[#22C55E]/2 to-transparent'
                          : 'border-[var(--color-border)]'
                      }`}
                    >
                      {/* Borrower Card Header */}
                      <div className="flex items-center gap-3 mb-4">
                        {loan.borrowerPhoto ? (
                          <img
                            src={loan.borrowerPhoto}
                            alt={loan.borrowerName}
                            className="w-11 h-11 rounded-full object-cover bg-slate-800"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-[var(--color-input)] border border-[var(--color-border)] flex items-center justify-center text-sm font-bold text-[#D4AF37]">
                            {loan.borrowerName.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-white truncate">{loan.borrowerName}</h4>
                          <p className="text-xs text-[var(--color-text)] opacity-50 flex items-center gap-1.5 mt-0.5">
                            <LuPhone size={11} />
                            {loan.borrowerMobile}
                          </p>
                        </div>
                        <div>{statusBadge}</div>
                      </div>

                      {/* Amounts Info */}
                      <div className="grid grid-cols-2 gap-4 py-3 bg-[var(--color-input)]/50 border border-[var(--color-border)]/50 rounded-xl px-3 mb-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text)] opacity-40 font-bold mb-0.5">
                            Total Lent
                          </p>
                          <p className="text-sm font-bold text-white">₹{loan.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text)] opacity-40 font-bold mb-0.5">
                            Remaining
                          </p>
                          <p className={`text-sm font-extrabold ${remaining > 0 ? (isOverdue ? 'text-[#EF4444]' : 'text-[#D4AF37]') : 'text-[#22C55E]'}`}>
                            ₹{remaining.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between text-[10px] font-bold text-[var(--color-text)] opacity-50">
                          <span>Progress</span>
                          <span>{percentPaid.toFixed(0)}% Recovered</span>
                        </div>
                        <div className="w-full bg-[var(--color-input)] h-2 rounded-full overflow-hidden border border-[var(--color-border)]/20">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${isPaid ? 'bg-[#22C55E]' : isOverdue ? 'bg-[#EF4444]' : 'bg-[#D4AF37]'}`}
                            style={{ width: `${percentPaid}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="border-t border-[var(--color-border)]/50 pt-3 flex items-center justify-between text-xs text-[var(--color-text)] opacity-60 font-semibold">
                        <span className="flex items-center gap-1">
                          <LuClock size={12} />
                          {isPaid ? 'Settled' : isOverdue ? `Overdue by ${moment().diff(loan.dueDate, 'days')} days` : `Due in ${moment(loan.dueDate).diff(moment(), 'days')} days`}
                        </span>
                        <span>Due {moment(loan.dueDate).format('DD MMM YYYY')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB CONTENT: CALENDAR ==================== */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* Calendar Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[var(--color-card)] p-4 rounded-2xl border border-[var(--color-border)] shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentDate(prev => moment(prev).subtract(1, calendarView === 'month' ? 'month' : 'week'))}
                  className="p-2 bg-[var(--color-input)] border border-[var(--color-border)] hover:border-[#D4AF37]/30 text-white rounded-lg cursor-pointer"
                >
                  <LuChevronLeft size={16} />
                </button>
                <h3 className="text-base font-bold text-white min-w-[150px] text-center capitalize">
                  {currentDate.format(calendarView === 'month' ? 'MMMM YYYY' : '[Week of] DD MMM YYYY')}
                </h3>
                <button
                  onClick={() => setCurrentDate(prev => moment(prev).add(1, calendarView === 'month' ? 'month' : 'week'))}
                  className="p-2 bg-[var(--color-input)] border border-[var(--color-border)] hover:border-[#D4AF37]/30 text-white rounded-lg cursor-pointer"
                >
                  <LuChevronRight size={16} />
                </button>
              </div>

              <div className="flex gap-2 bg-[var(--color-input)] p-1 rounded-xl border border-[var(--color-border)]">
                <button
                  onClick={() => setCalendarView('month')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    calendarView === 'month' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Month View
                </button>
                <button
                  onClick={() => setCalendarView('week')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    calendarView === 'week' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Week View
                </button>
              </div>
            </div>

            {/* MONTHLY CALENDAR GRID */}
            {calendarView === 'month' && (
              <div className="card p-3 sm:p-5 rounded-2xl overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Days of week */}
                  <div className="grid grid-cols-7 gap-2 text-center py-2 mb-2 border-b border-[var(--color-border)]/50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <span key={day} className="text-xs font-bold text-[var(--color-text)] opacity-40 uppercase tracking-wider">
                        {day}
                      </span>
                    ))}
                  </div>

                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, idx) => {
                      const isCurrentMonth = day.isSame(currentDate, 'month');
                      const isToday = day.isSame(moment(), 'day');
                      const dues = getDuesForDate(day);
                      const repayments = getRepaymentsForDate(day);

                      return (
                        <div
                          key={idx}
                          className={`min-h-[90px] p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                            isToday
                              ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                              : isCurrentMonth
                              ? 'border-[var(--color-border)] bg-[var(--color-input)]/20'
                              : 'border-[var(--color-border)]/30 bg-[var(--color-input)]/5 opacity-30'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs font-bold ${isToday ? 'text-[#D4AF37]' : 'text-white/80'}`}>
                              {day.date()}
                            </span>
                          </div>

                          {/* List of events on this day */}
                          <div className="space-y-1 mt-1 flex-1 overflow-hidden flex flex-col justify-end">
                            {dues.map(due => (
                              <div
                                key={due._id}
                                onClick={() => navigate(`/udhaar/${due._id}`)}
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate border ${
                                  moment(due.dueDate).isBefore(moment().startOf('day'))
                                    ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
                                    : 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20'
                                } cursor-pointer hover:opacity-80`}
                                title={`Due: ${due.borrowerName} - ₹${due.amount}`}
                              >
                                ⌛ {due.borrowerName}
                              </div>
                            ))}
                            {repayments.map((rep, rIdx) => (
                              <div
                                key={rIdx}
                                onClick={() => navigate(`/udhaar/${rep.id}`)}
                                className="text-[9px] font-bold px-1.5 py-0.5 bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 rounded truncate cursor-pointer hover:opacity-80"
                                title={`Repayment: ${rep.borrowerName} - ₹${rep.amount}`}
                              >
                                ✅ {rep.borrowerName}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* WEEKLY CALENDAR VIEW */}
            {calendarView === 'week' && (
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {calendarWeeklyDays.map((day, idx) => {
                  const isToday = day.isSame(moment(), 'day');
                  const dues = getDuesForDate(day);
                  const repayments = getRepaymentsForDate(day);

                  return (
                    <div
                      key={idx}
                      className={`card p-4 flex flex-col min-h-[220px] ${
                        isToday ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-[var(--color-border)]'
                      }`}
                    >
                      <div className="border-b border-[var(--color-border)]/50 pb-2 mb-3">
                        <p className="text-[10px] uppercase text-[var(--color-text)] opacity-40 font-bold">
                          {day.format('dddd')}
                        </p>
                        <h4 className={`text-lg font-extrabold ${isToday ? 'text-[#D4AF37]' : 'text-white'}`}>
                          {day.format('DD MMM')}
                        </h4>
                      </div>

                      <div className="flex-1 space-y-2.5 overflow-y-auto">
                        {dues.length === 0 && repayments.length === 0 ? (
                          <p className="text-[10px] text-[var(--color-text)] opacity-30 italic py-4">No events</p>
                        ) : (
                          <>
                            {dues.map(due => (
                              <div
                                key={due._id}
                                onClick={() => navigate(`/udhaar/${due._id}`)}
                                className={`p-2.5 rounded-xl border flex flex-col gap-1 cursor-pointer hover:opacity-90 transition-all ${
                                  moment(due.dueDate).isBefore(moment().startOf('day'))
                                    ? 'bg-[#EF4444]/5 border-[#EF4444]/25 text-[#EF4444]'
                                    : 'bg-[#D4AF37]/5 border-[#D4AF37]/25 text-[#D4AF37]'
                                }`}
                              >
                                <span className="text-[10px] font-bold uppercase tracking-wider block">Due Loan</span>
                                <span className="text-xs font-bold text-white truncate">{due.borrowerName}</span>
                                <span className="text-[11px] font-extrabold">₹{due.amount.toLocaleString()}</span>
                              </div>
                            ))}
                            {repayments.map((rep, rIdx) => (
                              <div
                                key={rIdx}
                                onClick={() => navigate(`/udhaar/${rep.id}`)}
                                className="p-2.5 rounded-xl bg-[#22C55E]/5 border border-[#22C55E]/25 text-[#22C55E] flex flex-col gap-1 cursor-pointer hover:opacity-90 transition-all"
                              >
                                <span className="text-[10px] font-bold uppercase tracking-wider block">Repayment</span>
                                <span className="text-xs font-bold text-white truncate">{rep.borrowerName}</span>
                                <span className="text-[11px] font-extrabold">₹{rep.amount.toLocaleString()}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB CONTENT: ANALYTICS ==================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recovery Status Doughnut */}
              <div className="card">
                <h3 className="text-base font-bold text-white mb-6">Lending Recovery Ratio</h3>
                {metrics.totalGiven === 0 ? (
                  <div className="h-64 flex items-center justify-center text-xs text-[var(--color-text)] opacity-40">No analytical data</div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={chartData.pieData}
                          dataKey="amount"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={5}
                        >
                          <Cell fill="#22C55E" />
                          <Cell fill="#D4AF37" />
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#17171F',
                            borderRadius: '12px',
                            border: '1px solid rgba(212, 175, 55, 0.15)',
                            color: '#F8FAFC'
                          }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-3">
                      <p className="text-xs text-[var(--color-text)] opacity-50 font-bold uppercase tracking-wider mb-0.5">Recovery rate</p>
                      <h4 className="text-3xl font-extrabold text-[#22C55E]">
                        {((metrics.totalRecovered / (metrics.totalGiven || 1)) * 100).toFixed(1)}%
                      </h4>
                    </div>
                  </div>
                )}
              </div>

              {/* Cash Flow over time */}
              <div className="card flex flex-col justify-between">
                <h3 className="text-base font-bold text-white mb-6">Cashflow Analysis (Lent vs Repaid)</h3>
                {metrics.totalGiven === 0 ? (
                  <div className="h-64 flex items-center justify-center text-xs text-[var(--color-text)] opacity-40">No analytical data</div>
                ) : (
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={chartData.cashFlowData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.05)" />
                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#17171F',
                            borderRadius: '12px',
                            border: '1px solid rgba(212, 175, 55, 0.15)',
                            color: '#F8FAFC'
                          }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Bar dataKey="lent" fill="#D4AF37" name="Principal Lent" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="recovered" fill="#22C55E" name="Repayments Recd" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Overdue percentage indicator */}
            <div className="card grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-base font-bold text-white mb-2">Portfolio Overdue Statistics</h3>
                <p className="text-xs text-[var(--color-text)] opacity-60 leading-relaxed mb-4">
                  Maintaining a low overdue balance is critical for cashflow optimization. Overdue payments accrue age and lower the overall portfolio liquidity.
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-white/60">Overdue Ratio</span>
                      <span className="text-[#EF4444]">
                        {((metrics.overdueAmount / (metrics.pendingAmount || 1)) * 100).toFixed(1)}% of pending
                      </span>
                    </div>
                    <div className="w-full bg-[var(--color-input)] rounded-full h-2">
                      <div
                        className="bg-[#EF4444] h-full rounded-full"
                        style={{ width: `${(metrics.overdueAmount / (metrics.pendingAmount || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-[var(--color-input)] border border-[var(--color-border)] rounded-2xl">
                  <h4 className="text-2xl font-extrabold text-white">
                    ₹{loans.length > 0 ? Math.round(metrics.totalGiven / loans.length).toLocaleString() : 0}
                  </h4>
                  <p className="text-[10px] uppercase text-[var(--color-text)] opacity-50 font-bold mt-1">Average Ticket Size</p>
                </div>
                <div className="p-4 bg-[var(--color-input)] border border-[var(--color-border)] rounded-2xl">
                  <h4 className="text-2xl font-extrabold text-[#EF4444]">
                    ₹{metrics.overdueAmount.toLocaleString()}
                  </h4>
                  <p className="text-[10px] uppercase text-[var(--color-text)] opacity-50 font-bold mt-1">Total Overdue Capital</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB CONTENT: BACKUP & RESTORE ==================== */}
        {activeTab === 'backup' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backup Box */}
            <div className="card flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-2">Export Ledger Summary</h3>
                <p className="text-xs text-[var(--color-text)] opacity-60 leading-relaxed mb-6">
                  Download spreadsheet files of your active lending accounts, repayments summaries, interest schedules, and statuses. Available in Excel, CSV, and full JSON backup options.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-input)] hover:bg-[#D4AF37]/10 border border-[var(--color-border)] text-white hover:text-[#D4AF37] font-semibold rounded-xl transition cursor-pointer text-xs"
                  >
                    <LuFileSpreadsheet className="text-base" />
                    <span>Download Excel</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-input)] hover:bg-[#D4AF37]/10 border border-[var(--color-border)] text-white hover:text-[#D4AF37] font-semibold rounded-xl transition cursor-pointer text-xs"
                  >
                    <LuFileText className="text-base" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-[var(--color-border)]/50 pt-5 mt-6">
                <h4 className="text-sm font-bold text-white mb-1">Create Full Ledger Backup</h4>
                <p className="text-[11px] text-[var(--color-text)] opacity-50 mb-4">
                  Export all loan entries, documents, profiles, and audit log history in JSON format.
                </p>
                <button
                  onClick={handleBackup}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-[#D4AF37] hover:bg-[#B8962E] text-black font-bold rounded-xl transition cursor-pointer text-xs"
                >
                  <LuDatabase className="text-base" />
                  <span>Download Backup File (.json)</span>
                </button>
              </div>
            </div>

            {/* Restore Box */}
            <div className="card">
              <h3 className="text-base font-bold text-white mb-2">Restore Backup File</h3>
              <p className="text-xs text-[var(--color-text)] opacity-60 leading-relaxed mb-6">
                Restore your lending history from a previously exported `.json` backup file. This action will merge the contents with your existing database ledger securely.
              </p>

              <form onSubmit={handleRestore} className="space-y-5">
                <div className="border border-dashed border-[var(--color-border)] rounded-2xl p-6 text-center bg-[var(--color-input)]/20 hover:bg-[var(--color-input)]/40 transition">
                  <input
                    type="file"
                    accept=".json"
                    id="restoreFile"
                    onChange={(e) => setBackupFile(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="restoreFile" className="cursor-pointer block">
                    <LuDatabase className="text-3xl text-[#D4AF37] mx-auto mb-2 opacity-75" />
                    <span className="text-xs font-semibold text-white block">
                      {backupFile ? backupFile.name : 'Select or drop backup JSON file'}
                    </span>
                    <span className="text-[10px] text-[var(--color-text)] opacity-40 block mt-1">
                      Max file size: 10MB
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!backupFile}
                  className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 font-bold rounded-xl transition cursor-pointer text-xs ${
                    backupFile
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                  }`}
                >
                  <LuCheck size={16} />
                  <span>Restore Database Ledger</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UdhaarHome;

