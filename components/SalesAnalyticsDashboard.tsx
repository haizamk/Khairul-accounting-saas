'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Package,
  Boxes,
  Users,
  AlertTriangle,
  Bell,
  Smartphone,
  Calendar,
  Store,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  BarChart3,
  PieChart,
  RefreshCw,
  Eye,
  X,
  Send,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Language, TRANSLATIONS } from '@/lib/translations';

export interface ProductItem {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  categoryId: number;
  categoryName: string;
  unitId: number;
  unitCode: string;
  costPrice: number;
  price: number;
  stock: number;
  minStock: number;
  status: string;
}

export interface TransactionItem {
  id: number;
  invoiceNo: string;
  customerName: string;
  diningOption: string;
  itemsCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  cogs: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  cashier: string;
  timestamp: string;
  items: Array<{
    productName: string;
    unitSnapshot: string;
    unitPrice: number;
    costPrice: number;
    quantity: number;
    subtotal: number;
    notes?: string;
  }>;
}

interface SalesAnalyticsDashboardProps {
  products: ProductItem[];
  transactions: TransactionItem[];
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  onOpenStockModal: (product: ProductItem) => void;
  companyName: string;
  branches: Array<{ id: string; name: string; address: string }>;
  lang?: Language;
}

export default function SalesAnalyticsDashboard({
  products,
  transactions,
  selectedBranch,
  setSelectedBranch,
  onOpenStockModal,
  companyName,
  branches,
  lang = 'ms'
}: SalesAnalyticsDashboardProps) {
  const t = TRANSLATIONS[lang || 'ms'];

  // Filters & State
  const [datePreset, setDatePreset] = useState<'today' | 'yesterday' | 'week' | 'month' | 'last_month'>('today');
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'trend' | 'items' | 'categories' | 'employees' | 'stock' | 'alerts'>('summary');
  const [itemPerformanceFilter, setItemPerformanceFilter] = useState<'all' | 'top' | 'average' | 'underperforming'>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [isMobileCompanionOpen, setIsMobileCompanionOpen] = useState(false);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  // Time preset labels & multipliers for realistic demo analytics
  const presetConfig = useMemo(() => {
    const isEn = lang === 'en';
    switch (datePreset) {
      case 'today':
        return {
          label: isEn ? 'Today' : 'Hari Ini',
          compareLabel: isEn ? 'compared with yesterday' : 'berbanding semalam',
          mult: 1.0,
          growthRev: +18.4,
          growthAov: +4.2
        };
      case 'yesterday':
        return {
          label: isEn ? 'Yesterday' : 'Semalam',
          compareLabel: isEn ? 'compared with previous day' : 'berbanding hari sebelumnya',
          mult: 0.88,
          growthRev: -5.1,
          growthAov: -1.2
        };
      case 'week':
        return {
          label: isEn ? 'Last 7 Days' : '7 Hari Lepas',
          compareLabel: isEn ? 'compared with last week' : 'berbanding minggu lepas',
          mult: 6.2,
          growthRev: +12.6,
          growthAov: +6.8
        };
      case 'month':
        return {
          label: isEn ? 'This Month' : 'Bulan Ini',
          compareLabel: isEn ? 'compared with last month' : 'berbanding bulan lepas',
          mult: 24.5,
          growthRev: +22.0,
          growthAov: +8.5
        };
      case 'last_month':
        return {
          label: isEn ? 'Last Month' : 'Bulan Lepas',
          compareLabel: isEn ? 'compared with 2 months ago' : 'berbanding 2 bulan lepas',
          mult: 21.0,
          growthRev: +9.4,
          growthAov: +3.1
        };
      default:
        return {
          label: isEn ? 'Today' : 'Hari Ini',
          compareLabel: isEn ? 'compared with yesterday' : 'berbanding semalam',
          mult: 1.0,
          growthRev: +18.4,
          growthAov: +4.2
        };
    }
  }, [datePreset, lang]);

  // Aggregate Base Metrics
  const baseRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const baseCogs = transactions.reduce((sum, t) => sum + (t.cogs || 0), 0);
  const baseDiscounts = transactions.reduce((sum, t) => sum + (t.discount || 0), 0);
  const baseReceipts = transactions.length;

  // Scaled calculations based on period
  const totalRevenue = (baseRevenue || 71.57) * presetConfig.mult;
  const totalCogs = (baseCogs || 51.80) * presetConfig.mult;
  const grossProfit = totalRevenue - totalCogs;
  const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const totalReceipts = Math.max(1, Math.round((baseReceipts || 2) * presetConfig.mult));
  const averageSale = totalRevenue / totalReceipts;
  const totalDiscounts = (baseDiscounts || 2.93) * presetConfig.mult;
  const netSales = totalRevenue;

  // Stock Analytics
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.minStock);
  const outOfStockItems = products.filter(p => p.stock <= 0);
  const inStockItems = products.filter(p => p.stock > p.minStock);

  const totalStockCostValue = products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0);
  const totalStockRetailValue = products.reduce((acc, p) => acc + (p.stock * p.price), 0);
  const unrealizedProfit = totalStockRetailValue - totalStockCostValue;

  // Item Performance Analysis
  const itemAnalytics = useMemo(() => {
    return products.map((prod, idx) => {
      // Simulate realistic sales volume across items
      const seed = ((prod.id * 17) % 25) + 3;
      const qtySold = Math.round(seed * presetConfig.mult * 0.8);
      const revenue = qtySold * prod.price;
      const cogs = qtySold * prod.costPrice;
      const profit = revenue - cogs;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      let status: 'top' | 'average' | 'underperforming' = 'average';
      if (margin >= 40 && qtySold >= 15 * presetConfig.mult * 0.5) {
        status = 'top';
      } else if (qtySold < 5 * presetConfig.mult * 0.5 || margin < 20) {
        status = 'underperforming';
      }

      return {
        ...prod,
        qtySold,
        revenue,
        cogs,
        profit,
        margin,
        performanceStatus: status
      };
    });
  }, [products, presetConfig.mult]);

  // Category Breakdown
  const categoryAnalytics = useMemo(() => {
    const map = new Map<string, { name: string; count: number; revenue: number; cogs: number }>();

    itemAnalytics.forEach(item => {
      const cat = item.categoryName || 'General';
      const prev = map.get(cat) || { name: cat, count: 0, revenue: 0, cogs: 0 };
      map.set(cat, {
        name: cat,
        count: prev.count + 1,
        revenue: prev.revenue + item.revenue,
        cogs: prev.cogs + item.cogs
      });
    });

    const list = Array.from(map.values());
    const sumRev = list.reduce((acc, c) => acc + c.revenue, 0) || 1;
    return list.map(c => ({
      ...c,
      sharePct: (c.revenue / sumRev) * 100
    }));
  }, [itemAnalytics]);

  // Employees Analytics
  const employeeAnalytics = useMemo(() => {
    const isEn = lang === 'en';
    return [
      {
        id: 'emp1',
        name: 'Ali (Head Cashier)',
        role: isEn ? 'Head Cashier / HQ' : 'Ketua Kasir / HQ',
        shift: isEn ? 'Morning & Afternoon (08:00 - 16:00)' : 'Pagi & Petang (08:00 - 16:00)',
        sales: totalRevenue * 0.58,
        receipts: Math.round(totalReceipts * 0.56),
        avgTicket: totalRevenue * 0.58 / Math.max(1, Math.round(totalReceipts * 0.56)),
        discounts: totalDiscounts * 0.65,
        refunds: 0,
        cashDrawerStatus: isEn ? 'Balanced (Accurate)' : 'Seimbang (Tepat)'
      },
      {
        id: 'emp2',
        name: 'Siti Nurhaliza',
        role: isEn ? 'Cafe & KDS Cashier' : 'Juruwang Kafe & KDS',
        shift: isEn ? 'Afternoon & Night (16:00 - 23:00)' : 'Petang & Malam (16:00 - 23:00)',
        sales: totalRevenue * 0.30,
        receipts: Math.round(totalReceipts * 0.32),
        avgTicket: totalRevenue * 0.30 / Math.max(1, Math.round(totalReceipts * 0.32)),
        discounts: totalDiscounts * 0.25,
        refunds: 1,
        cashDrawerStatus: isEn ? 'Balanced (Accurate)' : 'Seimbang (Tepat)'
      },
      {
        id: 'emp3',
        name: 'Faizul Hafiz',
        role: isEn ? 'Food Truck & Mobile Crew' : 'Krew Food Truck & Mobile POS',
        shift: isEn ? 'Flexible Field Shift' : 'Sif Fleksibel / Lapangan',
        sales: totalRevenue * 0.12,
        receipts: Math.round(totalReceipts * 0.12),
        avgTicket: totalRevenue * 0.12 / Math.max(1, Math.round(totalReceipts * 0.12)),
        discounts: totalDiscounts * 0.10,
        refunds: 0,
        cashDrawerStatus: isEn ? 'Balanced (Accurate)' : 'Seimbang (Tepat)'
      }
    ];
  }, [totalRevenue, totalReceipts, totalDiscounts, lang]);

  // Hourly / Day Trend simulation data
  const trendData = useMemo(() => {
    const isEn = lang === 'en';
    if (datePreset === 'today' || datePreset === 'yesterday') {
      return [
        { time: '08:00', current: 120 * presetConfig.mult, prev: 95, orders: 4 },
        { time: '10:00', current: 280 * presetConfig.mult, prev: 210, orders: 9 },
        { time: '12:00', current: 540 * presetConfig.mult, prev: 420, orders: 18, isPeak: true },
        { time: '14:00', current: 410 * presetConfig.mult, prev: 380, orders: 13 },
        { time: '16:00', current: 320 * presetConfig.mult, prev: 290, orders: 10 },
        { time: '18:00', current: 680 * presetConfig.mult, prev: 510, orders: 24, isPeak: true },
        { time: '20:00', current: 590 * presetConfig.mult, prev: 490, orders: 19 },
        { time: '22:00', current: 220 * presetConfig.mult, prev: 180, orders: 7 },
      ];
    } else {
      return [
        { time: isEn ? 'Mon' : 'Isnin', current: 450 * (presetConfig.mult / 6), prev: 410, orders: 15 },
        { time: isEn ? 'Tue' : 'Selasa', current: 520 * (presetConfig.mult / 6), prev: 480, orders: 18 },
        { time: isEn ? 'Wed' : 'Rabu', current: 610 * (presetConfig.mult / 6), prev: 530, orders: 21 },
        { time: isEn ? 'Thu' : 'Khamis', current: 580 * (presetConfig.mult / 6), prev: 550, orders: 19 },
        { time: isEn ? 'Fri' : 'Jumaat', current: 890 * (presetConfig.mult / 6), prev: 720, orders: 32, isPeak: true },
        { time: isEn ? 'Sat' : 'Sabtu', current: 1150 * (presetConfig.mult / 6), prev: 940, orders: 41, isPeak: true },
        { time: isEn ? 'Sun' : 'Ahad', current: 980 * (presetConfig.mult / 6), prev: 880, orders: 35 },
      ];
    }
  }, [datePreset, presetConfig.mult, lang]);

  const maxTrendVal = Math.max(...trendData.map(d => Math.max(d.current, d.prev)), 100);

  // Real-time Push Notifications List
  const stockAlerts = useMemo(() => {
    const isEn = lang === 'en';
    const alerts: Array<{
      id: string;
      title: string;
      message: string;
      severity: 'critical' | 'warning' | 'info';
      time: string;
      actionText: string;
      product?: ProductItem;
    }> = [];

    outOfStockItems.forEach(item => {
      alerts.push({
        id: `out-${item.id}`,
        title: `${t.outOfStockAlertTitle} ${item.name}`,
        message: isEn
          ? `Stock balance is 0 ${item.unitCode}. Customers cannot purchase this item right now.`
          : `Baki stok ialah 0 ${item.unitCode}. Pelanggan tidak boleh membuat pembelian sekarang.`,
        severity: 'critical',
        time: isEn ? 'Just now' : 'Baru sahaja',
        actionText: t.actionRestock,
        product: item
      });
    });

    lowStockItems.forEach(item => {
      alerts.push({
        id: `low-${item.id}`,
        title: `${t.lowStockAlertTitle} ${item.name}`,
        message: isEn
          ? `Current stock is ${item.stock} ${item.unitCode} (below minimum threshold of ${item.minStock} ${item.unitCode}).`
          : `Baki stok semasa ${item.stock} ${item.unitCode} (di bawah paras ambang minima ${item.minStock} ${item.unitCode}).`,
        severity: 'warning',
        time: isEn ? '5 min ago' : '5 minit lalu',
        actionText: t.actionReorder,
        product: item
      });
    });

    alerts.push({
      id: 'milestone-1',
      title: t.targetReachedTitle,
      message: isEn
        ? `Branch sales crossed daily milestone with average order value of RM ${averageSale.toFixed(2)}.`
        : `Jualan cawangan telah melepasi sasaran harian dengan purata pesanan RM ${averageSale.toFixed(2)}.`,
      severity: 'info',
      time: isEn ? '1 hr ago' : '1 jam lalu',
      actionText: t.actionViewTrend
    });

    return alerts;
  }, [lowStockItems, outOfStockItems, averageSale, t, lang]);

  const handleCopyWhatsAppReport = () => {
    const isEn = lang === 'en';
    const reportText = isEn
      ? `📊 *SALES & STOCK REPORT - ${companyName.toUpperCase()}*\n` +
        `📅 Period: *${presetConfig.label}*\n` +
        `🏢 Branch: *${branches.find(b => b.id === selectedBranch)?.name || 'All Branches'}*\n\n` +
        `💵 *Gross Revenue*: RM ${totalRevenue.toFixed(2)}\n` +
        `📦 *Cost of Goods Sold (COGS)*: RM ${totalCogs.toFixed(2)}\n` +
        `📈 *Gross Profit*: RM ${grossProfit.toFixed(2)} (${grossMarginPct.toFixed(1)}%)\n` +
        `🧾 *Total Receipts*: ${totalReceipts} Orders\n` +
        `💳 *Average Sale (AOV)*: RM ${averageSale.toFixed(2)}\n\n` +
        `🚨 *Inventory Status*:\n` +
        `• Out of Stock: ${outOfStockItems.length} items\n` +
        `• Low Stock: ${lowStockItems.length} items\n` +
        `• Total Stock Cost Value: RM ${totalStockCostValue.toFixed(2)}\n\n` +
        `_Sent via ePOS & Sales Analytics Dashboard_`
      : `📊 *RINGKASAN JUALAN & STATUS STOK - ${companyName.toUpperCase()}*\n` +
        `📅 Tempoh: *${presetConfig.label}*\n` +
        `🏢 Cawangan: *${branches.find(b => b.id === selectedBranch)?.name || 'Semua Cawangan'}*\n\n` +
        `💵 *Jualan Kasar (Gross Sales)*: RM ${totalRevenue.toFixed(2)}\n` +
        `📦 *Kos Barangan (COGS)*: RM ${totalCogs.toFixed(2)}\n` +
        `📈 *Keuntungan Kasar (Gross Profit)*: RM ${grossProfit.toFixed(2)} (${grossMarginPct.toFixed(1)}%)\n` +
        `🧾 *Bilangan Resit*: ${totalReceipts} Transaksi\n` +
        `💳 *Purata Nilai Jualan (AOV)*: RM ${averageSale.toFixed(2)}\n\n` +
        `🚨 *Status Inventori Semasa*:\n` +
        `• Habis Stok: ${outOfStockItems.length} item\n` +
        `• Stok Rendah: ${lowStockItems.length} item\n` +
        `• Nilai Kos Stok Di Kedai: RM ${totalStockCostValue.toFixed(2)}\n\n` +
        `_Dihantar melalui Sistem ePOS & Dashboard Analitik Jualan_`;

    navigator.clipboard.writeText(reportText);
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* TOP HEADER & CONTROLS */}
      <div className="bg-slate-800 border border-slate-700 p-4 md:p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl text-white shadow-md">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {t.dashTitle}
                  </h2>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    <span>{t.liveCloudSync}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {t.dashSubtitle}
                </p>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS & NOTIFICATION BELL */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Store Branch Selector */}
            <div className="relative">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none pr-8 cursor-pointer shadow-inner"
              >
                <option value="all">🏢 {t.allBranches}</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    📍 {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Notifications Center Toggle */}
            <button
              onClick={() => setIsAlertsDrawerOpen(true)}
              className="relative bg-slate-900 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow"
              title={t.stockAlertsBtn}
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{t.stockAlertsBtn}</span>
              {(lowStockItems.length + outOfStockItems.length) > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                  {lowStockItems.length + outOfStockItems.length}
                </span>
              )}
            </button>

            {/* Mobile Companion Simulator Button */}
            <button
              onClick={() => setIsMobileCompanionOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
            >
              <Smartphone className="w-4 h-4" />
              <span>{t.smartphoneCompanionBtn}</span>
            </button>

            {/* Share WhatsApp Report */}
            <button
              onClick={handleCopyWhatsAppReport}
              className="bg-slate-700 hover:bg-slate-600 text-slate-100 px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition border border-slate-600"
              title={t.whatsAppReportBtn}
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">{t.whatsAppReportBtn}</span>
            </button>
          </div>
        </div>

        {/* TIME PERIOD SELECTOR BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/70">
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs text-slate-400 font-medium mr-2 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.periodLabel}</span>
            </span>
            {[
              { key: 'today', label: t.periodToday },
              { key: 'yesterday', label: t.periodYesterday },
              { key: 'week', label: t.periodWeek },
              { key: 'month', label: t.periodMonth },
              { key: 'last_month', label: t.periodLastMonth }
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setDatePreset(p.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  datePreset === p.key
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-900/90 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{t.calcUpdatedNotice}</span>
            </span>
          </div>
        </div>
      </div>

      {/* DASHBOARD SECTION NAVIGATION PILLS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs border-b border-slate-800">
        {[
          { id: 'summary', label: t.dashSubSummary, icon: DollarSign },
          { id: 'trend', label: t.dashSubTrend, icon: TrendingUp },
          { id: 'items', label: t.dashSubItems, icon: Package },
          { id: 'categories', label: t.dashSubCategories, icon: PieChart },
          { id: 'employees', label: t.dashSubEmployees, icon: Users },
          { id: 'stock', label: t.dashSubStock, icon: Boxes },
          { id: 'alerts', label: t.dashSubAlerts, icon: Bell }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl font-bold whitespace-nowrap transition border ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 border-emerald-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-transparent hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.id === 'alerts' && (lowStockItems.length + outOfStockItems.length) > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {lowStockItems.length + outOfStockItems.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. SALES SUMMARY VIEW */}
      {activeSubTab === 'summary' && (
        <div className="space-y-6">
          {/* TOP 4 EXECUTIVE METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Gross Sales */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t.grossRevenueCard}
                  </span>
                  <div className="text-2xl font-black text-white tracking-tight">
                    RM {totalRevenue.toFixed(2)}
                  </div>
                </div>
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center space-x-1.5 text-xs">
                <span className="flex items-center text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  +{presetConfig.growthRev}%
                </span>
                <span className="text-slate-400 text-[11px]">{presetConfig.compareLabel}</span>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Card 2: Average Sale */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t.avgSaleCard}
                  </span>
                  <div className="text-2xl font-black text-amber-300 tracking-tight">
                    RM {averageSale.toFixed(2)}
                  </div>
                </div>
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center space-x-1.5 text-xs">
                <span className="flex items-center text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  +{presetConfig.growthAov}%
                </span>
                <span className="text-slate-400 text-[11px]">{t.avgSaleCard}</span>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Card 3: Gross Profit & Margin */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t.grossProfitCard}
                  </span>
                  <div className="text-2xl font-black text-teal-300 tracking-tight">
                    RM {grossProfit.toFixed(2)}
                  </div>
                </div>
                <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center space-x-2 text-xs">
                <span className="text-slate-300 font-bold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-500/30">
                  {t.grossMarginLabel} {grossMarginPct.toFixed(1)}%
                </span>
                <span className="text-slate-400 text-[11px]">COGS: RM {totalCogs.toFixed(2)}</span>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Card 4: Total Receipts / Orders */}
            <div className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t.totalReceiptsLabel}
                  </span>
                  <div className="text-2xl font-black text-indigo-300 tracking-tight">
                    {totalReceipts} <span className="text-xs font-normal text-slate-400">{t.itemsCount}</span>
                  </div>
                </div>
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center space-x-2 text-xs text-slate-400">
                <span className="text-emerald-400 font-bold">100% {lang === 'en' ? 'Success' : 'Berjaya'}</span>
                <span>• {t.totalDiscountsLabel} RM {totalDiscounts.toFixed(2)}</span>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* 2. TREND & GROWTH VIEW */}
      {activeSubTab === 'trend' && (
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>{t.trendTitle}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {t.trendSubtitle}
                </p>
              </div>

              <div className="flex items-center space-x-4 text-xs font-semibold">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-slate-200">{t.currentPeriodLine}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-600 inline-block" />
                  <span className="text-slate-400">{t.previousPeriodLine}</span>
                </div>
              </div>
            </div>

            {/* Custom Bar Graph Chart */}
            <div className="grid grid-cols-8 gap-2 pt-6 items-end h-64 border-b border-slate-700 pb-2">
              {trendData.map((d, idx) => {
                const curHeight = Math.round((d.current / maxTrendVal) * 100);
                const prevHeight = Math.round((d.prev / maxTrendVal) * 100);

                return (
                  <div key={idx} className="flex flex-col items-center justify-end h-full group relative">
                    {/* Tooltip Hover */}
                    <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-slate-900 border border-slate-700 p-2 rounded-lg text-[10px] text-white shadow-xl z-20 whitespace-nowrap">
                      <div className="font-bold text-emerald-400">RM {d.current.toFixed(2)} ({d.orders} {t.itemsCount})</div>
                      <div className="text-slate-400">{t.previousPeriodLine}: RM {d.prev.toFixed(2)}</div>
                    </div>

                    {d.isPeak && (
                      <span className="text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded mb-1 animate-pulse">
                        {t.peakHourBadge}
                      </span>
                    )}

                    <div className="flex items-end space-x-1 w-full justify-center">
                      <div
                        style={{ height: `${prevHeight}%` }}
                        className="w-2.5 sm:w-3.5 bg-slate-700 rounded-t-sm"
                      />
                      <div
                        style={{ height: `${curHeight}%` }}
                        className={`w-3 sm:w-5 rounded-t-md transition-all ${
                          d.isPeak ? 'bg-gradient-to-t from-emerald-600 to-amber-400' : 'bg-gradient-to-t from-emerald-600 to-teal-400'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-2 font-mono">{d.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. ITEM PERFORMANCE VIEW */}
      {activeSubTab === 'items' && (
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Package className="w-5 h-5 text-emerald-400" />
                  <span>{t.itemAnalyticsTitle}</span>
                </h3>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setItemPerformanceFilter('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    itemPerformanceFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.itemFilterAll}
                </button>
                <button
                  onClick={() => setItemPerformanceFilter('top')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    itemPerformanceFilter === 'top' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.itemFilterTop}
                </button>
                <button
                  onClick={() => setItemPerformanceFilter('underperforming')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    itemPerformanceFilter === 'underperforming' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.itemFilterUnder}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase border-b border-slate-700">
                  <tr>
                    <th className="p-3">{t.colItemName}</th>
                    <th className="p-3">{t.colQtySold}</th>
                    <th className="p-3">{t.colTotalSales}</th>
                    <th className="p-3">{t.colProfitContribution}</th>
                    <th className="p-3">{t.colMargin}</th>
                    <th className="p-3 text-right">{t.colPerformance}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {itemAnalytics
                    .filter((item) => {
                      if (itemPerformanceFilter === 'top') return item.performanceStatus === 'top';
                      if (itemPerformanceFilter === 'underperforming') return item.performanceStatus === 'underperforming';
                      return true;
                    })
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-750/70 transition">
                        <td className="p-3 font-semibold text-white">
                          <div>{item.name}</div>
                          <span className="text-[10px] text-slate-400">{item.categoryName} • /{item.unitCode}</span>
                        </td>
                        <td className="p-3 font-mono">{item.qtySold} {item.unitCode}</td>
                        <td className="p-3 font-mono font-bold text-white">RM {item.revenue.toFixed(2)}</td>
                        <td className="p-3 font-mono text-emerald-400">RM {item.profit.toFixed(2)}</td>
                        <td className="p-3">
                          <span className="bg-teal-500/10 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                            {item.margin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.performanceStatus === 'top'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : item.performanceStatus === 'underperforming'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-slate-700 text-slate-300'
                          }`}>
                            {item.performanceStatus === 'top' ? 'Top' : item.performanceStatus === 'underperforming' ? 'Low' : 'Avg'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. SALES BY CATEGORY */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-slate-700 pb-3">
              <PieChart className="w-5 h-5 text-emerald-400" />
              <span>{t.catBreakdownTitle}</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              {/* Category Share List */}
              <div className="space-y-3">
                {categoryAnalytics.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-200">{cat.name} ({cat.count} {t.itemsCount})</span>
                      <span className="text-emerald-400 font-mono">RM {cat.revenue.toFixed(2)} ({cat.sharePct.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2.5 rounded-full"
                        style={{ width: `${cat.sharePct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Category Summary Table */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="text-slate-400 uppercase border-b border-slate-800 pb-2">
                    <tr>
                      <th className="pb-2">{t.colCatName}</th>
                      <th className="pb-2 text-right">{t.colCatRevenue}</th>
                      <th className="pb-2 text-right">{t.colCatShare}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {categoryAnalytics.map((c, i) => (
                      <tr key={i}>
                        <td className="py-2 text-white font-medium">{c.name}</td>
                        <td className="py-2 text-right font-mono text-emerald-400">RM {c.revenue.toFixed(2)}</td>
                        <td className="py-2 text-right font-bold font-mono">{c.sharePct.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SALES BY EMPLOYEE */}
      {activeSubTab === 'employees' && (
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-slate-700 pb-3">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>{t.employeeTitle}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {employeeAnalytics.map((emp) => (
                <div key={emp.id} className="bg-slate-900 border border-slate-700/80 p-4 rounded-xl space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{emp.name}</h4>
                      <p className="text-[11px] text-slate-400">{emp.role}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs border-t border-slate-800 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t.colEmpSales}</span>
                      <span className="font-bold text-emerald-400 font-mono">RM {emp.sales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t.colEmpReceipts}</span>
                      <span className="font-mono text-slate-200">{emp.receipts} {t.itemsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t.colEmpAvgTicket}</span>
                      <span className="font-mono text-amber-300">RM {emp.avgTicket.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t.colEmpDrawer}</span>
                      <span className="text-emerald-400 font-semibold">{emp.cashDrawerStatus}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. ITEM STOCK & VALUATION */}
      {activeSubTab === 'stock' && (
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Boxes className="w-5 h-5 text-emerald-400" />
                  <span>{t.stockViewTitle}</span>
                </h3>
              </div>

              {/* Stock Filter */}
              <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setStockStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    stockStatusFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {t.stockFilterAll}
                </button>
                <button
                  onClick={() => setStockStatusFilter('in_stock')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    stockStatusFilter === 'in_stock' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {t.stockFilterInStock}
                </button>
                <button
                  onClick={() => setStockStatusFilter('low_stock')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    stockStatusFilter === 'low_stock' ? 'bg-amber-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {t.stockFilterLow}
                </button>
                <button
                  onClick={() => setStockStatusFilter('out_of_stock')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    stockStatusFilter === 'out_of_stock' ? 'bg-rose-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {t.stockFilterOut}
                </button>
              </div>
            </div>

            {/* Stock Valuation Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 text-xs">
              <div>
                <span className="text-slate-400 block">{t.totalCostVal}</span>
                <span className="text-base font-bold text-white font-mono">RM {totalStockCostValue.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t.totalRetailVal}</span>
                <span className="text-base font-bold text-emerald-400 font-mono">RM {totalStockRetailValue.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t.unrealizedProfitVal}</span>
                <span className="text-base font-bold text-teal-300 font-mono">RM {unrealizedProfit.toFixed(2)}</span>
              </div>
            </div>

            {/* Stock List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase border-b border-slate-700">
                  <tr>
                    <th className="p-3">{t.colSkuBarcode}</th>
                    <th className="p-3">{t.colCategory}</th>
                    <th className="p-3">{t.colUnit}</th>
                    <th className="p-3">{t.colCostPrice}</th>
                    <th className="p-3">{t.colSellingPrice}</th>
                    <th className="p-3">{t.colStockBalance}</th>
                    <th className="p-3 text-right">{t.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {products
                    .filter((p) => {
                      if (stockStatusFilter === 'in_stock') return p.stock > p.minStock;
                      if (stockStatusFilter === 'low_stock') return p.stock > 0 && p.stock <= p.minStock;
                      if (stockStatusFilter === 'out_of_stock') return p.stock <= 0;
                      return true;
                    })
                    .map((prod) => {
                      const isLow = prod.stock <= prod.minStock;
                      const isOut = prod.stock <= 0;
                      return (
                        <tr key={prod.id} className="hover:bg-slate-750/70 transition">
                          <td className="p-3">
                            <span className="font-bold text-white text-sm block">{prod.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku} | Barcode: {prod.barcode}</span>
                          </td>
                          <td className="p-3">{prod.categoryName}</td>
                          <td className="p-3">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-bold">
                              {prod.unitCode}
                            </span>
                          </td>
                          <td className="p-3 font-mono">RM {prod.costPrice.toFixed(2)}</td>
                          <td className="p-3 font-mono font-bold text-white">RM {prod.price.toFixed(2)}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono inline-block ${
                              isOut
                                ? 'bg-rose-600 text-white animate-pulse'
                                : isLow
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {prod.stock} {prod.unitCode}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => onOpenStockModal(prod)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition"
                            >
                              {t.adjustStockBtn}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. NOTIFICATIONS & REAL-TIME PUSH ALERTS */}
      {activeSubTab === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <span>{t.pushAlertsTitle}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {t.pushAlertsSubtitle}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                    pushEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${pushEnabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                  <span>{pushEnabled ? t.pushActive : t.pushDisabled}</span>
                </button>
              </div>
            </div>

            {/* Alerts Feed */}
            <div className="space-y-3">
              {stockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    alert.severity === 'critical'
                      ? 'bg-rose-950/40 border-rose-500/40'
                      : alert.severity === 'warning'
                      ? 'bg-amber-950/40 border-amber-500/40'
                      : 'bg-emerald-950/40 border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-xl bg-slate-900/80 flex-shrink-0 mt-0.5">
                      {alert.severity === 'critical' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
                      {alert.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                      {alert.severity === 'info' && <Sparkles className="w-5 h-5 text-emerald-400" />}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-white text-sm">{alert.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">• {alert.time}</span>
                      </div>
                      <p className="text-xs text-slate-300">{alert.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {alert.product && (
                      <button
                        onClick={() => onOpenStockModal(alert.product!)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition"
                      >
                        {alert.actionText}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SMARTPHONE SALES DASHBOARD COMPANION SIMULATOR */}
      {isMobileCompanionOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative bg-slate-950 border-4 border-slate-700 rounded-[40px] w-full max-w-[380px] h-[720px] shadow-2xl flex flex-col overflow-hidden ring-1 ring-slate-600">
            {/* Phone Notch & Status Bar */}
            <div className="bg-slate-900 px-6 pt-3 pb-2 flex justify-between items-center border-b border-slate-800 text-[11px] text-slate-400">
              <span className="font-bold text-white">09:41</span>
              <div className="w-20 h-4 bg-slate-950 rounded-full mx-auto" />
              <div className="flex items-center space-x-1">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Mobile App Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex justify-between items-center shadow-md">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">
                  {t.phoneAppHeader}
                </span>
                <h3 className="font-extrabold text-sm">{companyName}</h3>
              </div>
              <button
                onClick={() => setIsMobileCompanionOpen(false)}
                className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile App Content Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-950 text-slate-200">
              {/* Preset Selector */}
              <div className="flex space-x-1.5 overflow-x-auto pb-1 text-[11px]">
                {[t.periodToday, t.periodYesterday, t.periodWeek, t.periodMonth].map((txt, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap ${
                      i === 0 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {txt}
                  </span>
                ))}
              </div>

              {/* Mobile Card: Gross Revenue */}
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  {t.phoneGrossSales}
                </span>
                <div className="text-xl font-black text-white">RM {totalRevenue.toFixed(2)}</div>
                <div className="text-[10px] text-emerald-400 font-bold flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  +{presetConfig.growthRev}% vs {datePreset === 'today' ? (lang === 'en' ? 'Yesterday' : 'Semalam') : (lang === 'en' ? 'Previous' : 'Lalu')}
                </div>
              </div>

              {/* Mobile Grid: Average Sale & Profit */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">{t.phoneAvgReceipt}</span>
                  <span className="text-sm font-bold text-amber-300 font-mono">RM {averageSale.toFixed(2)}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">{t.phoneGrossProfit}</span>
                  <span className="text-sm font-bold text-teal-300 font-mono">RM {grossProfit.toFixed(2)}</span>
                </div>
              </div>

              {/* Mobile Stock Alerts Mini-List */}
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white flex items-center space-x-1">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.phoneStockAlerts} ({lowStockItems.length + outOfStockItems.length})</span>
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  {lowStockItems.slice(0, 2).map((item) => (
                    <div key={item.id} className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 flex justify-between items-center">
                      <span className="font-medium text-slate-200 truncate">{item.name}</span>
                      <span className="font-bold text-amber-400 font-mono">{item.stock} {item.unitCode}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
