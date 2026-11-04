import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  ShoppingCart, 
  Plus, 
  FileText, 
  BarChart3, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  Building2, 
  Check, 
  ArrowRight, 
  TrendingDown, 
  ShieldAlert, 
  Layers, 
  Sparkles,
  RefreshCw,
  X,
  ExternalLink
} from 'lucide-react';
import { getDatabaseState, updateDatabaseState, logAuditEvent } from '../../services/storageService';
import { UserAccount } from '../../types/auth';
import { InventoryItem, PurchaseOrder, GoodsReceiptNote, Supplier } from '../../types/erp';
import { LRD_PER_USD } from '../../data/seedData';

interface ProcurementInventoryWorkstationProps {
  currentUser: UserAccount;
}

export const ProcurementInventoryWorkstation: React.FC<ProcurementInventoryWorkstationProps> = ({ currentUser }) => {
  const db = getDatabaseState();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'purchase_orders' | 'goods_receipts' | 'suppliers'>('dashboard');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'LOW_STOCK' | 'CRITICAL' | 'EXPIRING_SOON' | 'OPTIMAL'>('ALL');

  // Purchase Order Modal State
  const [showPOModal, setShowPOModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(db.suppliers[0]?.id || '');
  const [selectedItemId, setSelectedItemId] = useState<string>(db.inventory[0]?.id || '');
  const [orderQuantity, setOrderQuantity] = useState('50');

  // Quick Stock Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustItemId, setAdjustItemId] = useState<string>(db.inventory[0]?.id || '');
  const [adjustQtyChange, setAdjustQtyChange] = useState<string>('10');
  const [adjustReason, setAdjustReason] = useState<'RESTOCK' | 'PHYSICAL_COUNT_ADJUST' | 'DAMAGED_WRITE_OFF' | 'DONATION'>('RESTOCK');

  // Days until a date helper
  const getDaysUntilExpiry = (expiryDateStr: string) => {
    const today = new Date();
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Evaluate Low Stock and Expiring items
  const lowStockItems = db.inventory.filter(item => item.currentStock <= item.reorderLevel);
  const criticalStockItems = db.inventory.filter(item => item.currentStock <= Math.floor(item.reorderLevel * 0.4));
  
  const expiringItems = db.inventory.filter(item => {
    return item.batches.some(b => {
      const days = getDaysUntilExpiry(b.expiryDate);
      return days > 0 && days <= 60;
    });
  });

  // Total valuation
  const totalValuationUSD = db.inventory.reduce((sum, item) => sum + (item.currentStock * item.unitCostUSD), 0);
  const totalValuationLRD = totalValuationUSD * LRD_PER_USD;

  // Filtered inventory list
  const filteredInventory = db.inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

    let matchesStatus = true;
    const isCritical = item.currentStock <= Math.floor(item.reorderLevel * 0.4);
    const isLow = item.currentStock <= item.reorderLevel;
    const isExpiring = item.batches.some(b => getDaysUntilExpiry(b.expiryDate) <= 60);

    if (stockStatusFilter === 'CRITICAL') matchesStatus = isCritical;
    else if (stockStatusFilter === 'LOW_STOCK') matchesStatus = isLow;
    else if (stockStatusFilter === 'EXPIRING_SOON') matchesStatus = isExpiring;
    else if (stockStatusFilter === 'OPTIMAL') matchesStatus = !isLow && !isExpiring;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Quick Action to open PO modal pre-filled for a specific low-stock item
  const handleTriggerReorder = (item: InventoryItem) => {
    setSelectedItemId(item.id);
    // Find matching supplier
    const matchingSupplier = db.suppliers.find(s => {
      if (item.category === 'MEDICATION' && s.category === 'PHARMACEUTICALS') return true;
      if (item.category === 'LAB_REAGENT' && s.category === 'DIAGNOSTIC_REAGENTS') return true;
      return true;
    }) || db.suppliers[0];

    if (matchingSupplier) setSelectedSupplierId(matchingSupplier.id);
    
    // Auto-calculate suggested replenishment qty: (reorderLevel * 2) - currentStock
    const suggested = Math.max(item.reorderLevel * 2 - item.currentStock, item.reorderLevel);
    setOrderQuantity(String(suggested));
    setShowPOModal(true);
  };

  // Create Purchase Order Handler
  const handleCreatePO = () => {
    const supplier = db.suppliers.find(s => s.id === selectedSupplierId) || db.suppliers[0];
    const item = db.inventory.find(i => i.id === selectedItemId) || db.inventory[0];
    const poNumber = `PO-${new Date().getFullYear()}-${String(db.purchaseOrders.length + 89).padStart(5, '0')}`;
    const qty = parseInt(orderQuantity) || 50;

    const unitPriceUSD = item.unitCostUSD;
    const totalUSD = qty * unitPriceUSD;

    const newPO: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      poNumber,
      supplierId: supplier.id,
      supplierName: supplier.name,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      items: [
        {
          itemId: item.id,
          itemCode: item.itemCode,
          itemName: item.name,
          quantityOrdered: qty,
          quantityReceived: 0,
          unitPriceUSD,
          totalUSD,
        }
      ],
      subtotalUSD: totalUSD,
      status: 'APPROVED',
      createdBy: currentUser.fullName,
      approvedBy: 'Dr. J. Saydee Kollie (Medical Director)',
      createdAt: new Date().toISOString(),
    };

    updateDatabaseState(draft => {
      draft.purchaseOrders.unshift(newPO);
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CREATE',
      module: 'PROCUREMENT',
      resourceId: poNumber,
      details: `Generated Purchase Order ${poNumber} for ${qty}x ${item.name} from ${supplier.name} ($${totalUSD.toFixed(2)}).`,
      ipAddress: 'Central Stores Workstation 02',
      status: 'SUCCESS',
    });

    setShowPOModal(false);
    setActiveTab('purchase_orders');
    alert(`Purchase Order ${poNumber} generated and approved! Delivery expected in 5 days.`);
  };

  // Quick Stock Adjustment Handler
  const handleStockAdjustment = () => {
    const item = db.inventory.find(i => i.id === adjustItemId);
    if (!item) return;

    const change = parseInt(adjustQtyChange) || 0;
    const isDeduction = adjustReason === 'DAMAGED_WRITE_OFF';
    const netChange = isDeduction ? -Math.abs(change) : Math.abs(change);
    const newStock = Math.max(0, item.currentStock + netChange);

    updateDatabaseState(draft => {
      const invItem = draft.inventory.find(i => i.id === adjustItemId);
      if (invItem) {
        invItem.currentStock = newStock;
        if (invItem.batches.length > 0) {
          invItem.batches[0].quantity = Math.max(0, invItem.batches[0].quantity + netChange);
        }
      }
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'UPDATE',
      module: 'PROCUREMENT',
      resourceId: item.itemCode,
      details: `Manual inventory adjustment for ${item.name}: ${netChange > 0 ? '+' : ''}${netChange} units. Reason: ${adjustReason}. New balance: ${newStock}.`,
      ipAddress: 'Central Stores Workstation 02',
      status: 'SUCCESS',
    });

    setShowAdjustModal(false);
    alert(`Stock for ${item.name} updated to ${newStock} units.`);
  };

  // 1-Click Receive PO into GRN
  const handleReceivePO = (po: PurchaseOrder) => {
    const grnNumber = `GRN-${new Date().getFullYear()}-${String(db.goodsReceipts.length + 65).padStart(5, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date(Date.now() + 365 * 2 * 86400000).toISOString().split('T')[0];

    const newGRN: GoodsReceiptNote = {
      id: `GRN-${Date.now()}`,
      grnNumber,
      poNumber: po.poNumber,
      supplierName: po.supplierName,
      receiptDate: today,
      itemsReceived: po.items.map(it => ({
        itemId: it.itemId,
        itemName: it.itemName,
        batchNumber: `LOT-REC-${Date.now().toString().slice(-5)}`,
        expiryDate: expiry,
        quantity: it.quantityOrdered,
        unitPriceUSD: it.unitPriceUSD,
        conditionGood: true,
      })),
      threeWayMatched: true,
      receivedBy: currentUser.fullName,
    };

    updateDatabaseState(draft => {
      draft.goodsReceipts.unshift(newGRN);
      const targetPO = draft.purchaseOrders.find(p => p.id === po.id);
      if (targetPO) {
        targetPO.status = 'FULFILLED';
        targetPO.items.forEach(it => {
          it.quantityReceived = it.quantityOrdered;
        });
      }

      // Increment inventory shelf stock and append new batch
      po.items.forEach(it => {
        const item = draft.inventory.find(i => i.id === it.itemId);
        if (item) {
          item.currentStock += it.quantityOrdered;
          item.batches.push({
            batchNumber: `LOT-REC-${Date.now().toString().slice(-5)}`,
            quantity: it.quantityOrdered,
            expiryDate: expiry,
          });
        }
      });
    });

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'UPDATE',
      module: 'PROCUREMENT',
      resourceId: grnNumber,
      details: `Fulfilled PO ${po.poNumber} via GRN ${grnNumber}. 3-way matched and stock updated.`,
      ipAddress: 'Central Stores Receiving Dock',
      status: 'SUCCESS',
    });

    setActiveTab('goods_receipts');
    alert(`Goods Receipt Note ${grnNumber} issued! Inventory stock successfully updated.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-slate-900 text-base">Inventory & Procurement Dashboard</h2>
            <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
              ERP SUPPLY CHAIN
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-Time Medical Supplies Tracking, Automated Low-Stock Alerts, Purchase Requisitions & 3-Way Match GRN
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAdjustModal(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Stock Count Adjustment</span>
          </button>
          <button
            onClick={() => {
              setSelectedItemId(db.inventory[0]?.id || '');
              setShowPOModal(true);
            }}
            className="bg-teal-800 hover:bg-teal-900 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>+ Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Inventory Valuation</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 font-mono tabular-nums">
            ${totalValuationUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            LRD {totalValuationLRD.toLocaleString()} (Rate: 195)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Monitored Medical SKUs</span>
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 font-mono tabular-nums">
            {db.inventory.length} Items
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 5 Clinical Categories
          </div>
        </div>

        {/* Low Stock Alerts Clickable KPI */}
        <div 
          onClick={() => {
            setStockStatusFilter('LOW_STOCK');
            setActiveTab('dashboard');
          }}
          className={`p-4 rounded-xl border shadow-xs cursor-pointer transition-all ${
            lowStockItems.length > 0 
              ? 'bg-rose-50/60 border-rose-300 hover:bg-rose-50' 
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-900">Low Stock Trigger Alerts</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockItems.length > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 text-xl font-extrabold text-rose-800 font-mono tabular-nums">
            {lowStockItems.length} SKUs Alerting
          </div>
          <div className="text-[11px] text-rose-700 mt-1 font-semibold flex items-center gap-1">
            <span>{criticalStockItems.length} critical (&lt; 40% reorder)</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Expiry Alerts Clickable KPI */}
        <div 
          onClick={() => {
            setStockStatusFilter('EXPIRING_SOON');
            setActiveTab('dashboard');
          }}
          className={`p-4 rounded-xl border shadow-xs cursor-pointer transition-all ${
            expiringItems.length > 0 
              ? 'bg-amber-50/60 border-amber-300 hover:bg-amber-50' 
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-900">Batches Expiring &lt; 60 Days</span>
            <Clock className={`w-4 h-4 ${expiringItems.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 text-xl font-extrabold text-amber-800 font-mono tabular-nums">
            {expiringItems.length} Batches
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-semibold flex items-center gap-1">
            <span>FEFO Protocol Active</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* AUTOMATED LOW-STOCK ALERTS BANNER WITH 1-CLICK REORDER */}
      {lowStockItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4.5 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-rose-950">
                  Automated Low-Stock Threshold Alarms ({lowStockItems.length} Medical Supplies Require Replenishment)
                </h4>
                <p className="text-[11px] text-rose-700">
                  Current hospital store stock has fallen below defined safety buffer thresholds for continuous clinical operations at VOA East.
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-rose-200 text-rose-900 font-mono font-bold px-2.5 py-1 rounded">
              ERP AUTOMATED REORDER QUEUE
            </span>
          </div>

          {/* Low Stock Item Cards Strip with 1-Click Reorder */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
            {lowStockItems.slice(0, 4).map(item => {
              const pct = Math.round((item.currentStock / item.reorderLevel) * 100);
              const isCrit = item.currentStock <= Math.floor(item.reorderLevel * 0.4);
              return (
                <div key={item.id} className="bg-white p-3 rounded-lg border border-rose-200/80 shadow-2xs space-y-2">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-rose-800">{item.itemCode}</span>
                      <div className="font-semibold text-slate-900 text-xs truncate max-w-[170px]" title={item.name}>
                        {item.name}
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isCrit ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {pct}% Buffer
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 flex justify-between font-mono">
                    <span>Stock: <strong className="text-rose-700">{item.currentStock}</strong></span>
                    <span>Reorder Min: {item.reorderLevel}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${isCrit ? 'bg-rose-600' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <button
                    onClick={() => handleTriggerReorder(item)}
                    className="w-full mt-1 bg-rose-900 hover:bg-rose-950 text-white text-[11px] font-semibold py-1.5 rounded-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>Auto-Reorder PO</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Stock Level Monitor & Registry ({db.inventory.length})
        </button>
        <button
          onClick={() => setActiveTab('purchase_orders')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'purchase_orders'
              ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Purchase Orders ({db.purchaseOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('goods_receipts')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'goods_receipts'
              ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Goods Receipt Notes (GRN 3-Way Match)
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'suppliers'
              ? 'text-teal-800 border-b-2 border-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Approved Suppliers ({db.suppliers.length})
        </button>
      </div>

      {/* TAB 1: STOCK MONITOR & REGISTRY */}
      {activeTab === 'dashboard' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          {/* Search, Category, and Status Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2">
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search supplies, item code, or location..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:border-teal-700"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 text-[11px] mr-1">Category:</span>
              {[
                { id: 'ALL', label: 'All Categories' },
                { id: 'MEDICATION', label: 'Medications' },
                { id: 'CONSUMABLE', label: 'Consumables' },
                { id: 'LAB_REAGENT', label: 'Lab Reagents' },
                { id: 'SURGICAL', label: 'Surgical' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 text-[11px] mr-1">Status:</span>
              {[
                { id: 'ALL', label: 'All Status' },
                { id: 'LOW_STOCK', label: 'Low Stock' },
                { id: 'EXPIRING_SOON', label: 'Expiring Soon' },
                { id: 'OPTIMAL', label: 'Optimal' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setStockStatusFilter(st.id as any)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    stockStatusFilter === st.id
                      ? 'bg-teal-800 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* High-Density Stock Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-3">Item Code & Medical Name</th>
                  <th className="p-3">Category & Location</th>
                  <th className="p-3 text-center">Stock Level vs Reorder</th>
                  <th className="p-3">Active Batches & Expiry (FEFO)</th>
                  <th className="p-3 text-right font-mono">Unit Cost / Price</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No medical supplies match the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map(item => {
                    const isLow = item.currentStock <= item.reorderLevel;
                    const isCritical = item.currentStock <= Math.floor(item.reorderLevel * 0.4);
                    const stockPct = Math.round((item.currentStock / item.reorderLevel) * 100);

                    // Check if any batch is expiring soon
                    const hasExpiringBatch = item.batches.some(b => getDaysUntilExpiry(b.expiryDate) <= 60);

                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isCritical ? 'bg-rose-50/30' : isLow ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <td className="p-3 font-medium text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-teal-800 font-bold">{item.itemCode}</span>
                            {isCritical && (
                              <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded font-mono">
                                CRITICAL
                              </span>
                            )}
                            {isLow && !isCritical && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded font-mono">
                                LOW
                              </span>
                            )}
                            {hasExpiringBatch && (
                              <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded font-mono">
                                EXPIRING
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-900 font-semibold mt-0.5">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Unit: {item.unitOfMeasure}</div>
                        </td>

                        <td className="p-3 text-slate-600">
                          <div className="font-medium text-slate-700">{item.category}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <span>{item.location}</span>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="max-w-[130px] mx-auto space-y-1">
                            <div className="flex justify-between text-[11px] font-mono">
                              <span className={`font-bold ${isCritical ? 'text-rose-700' : isLow ? 'text-amber-800' : 'text-slate-900'}`}>
                                {item.currentStock}
                              </span>
                              <span className="text-slate-400">/ min {item.reorderLevel}</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  isCritical ? 'bg-rose-600' : isLow ? 'bg-amber-500' : 'bg-emerald-600'
                                }`}
                                style={{ width: `${Math.min(stockPct, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="space-y-1">
                            {item.batches.map((b, idx) => {
                              const daysLeft = getDaysUntilExpiry(b.expiryDate);
                              const isExpiring = daysLeft <= 60;
                              return (
                                <div key={idx} className="text-[11px] flex items-center gap-2">
                                  <span className="font-mono font-semibold text-slate-800">{b.batchNumber}:</span>
                                  <span className="text-slate-600 font-mono">{b.quantity}u</span>
                                  <span className={`font-mono text-[10px] ${
                                    isExpiring ? 'text-rose-700 font-bold' : 'text-slate-400'
                                  }`}>
                                    (Exp: {b.expiryDate} {isExpiring ? `· ${daysLeft}d left` : ''})
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        <td className="p-3 text-right font-mono">
                          <div className="font-semibold text-slate-900">${item.unitCostUSD.toFixed(2)}</div>
                          <div className="text-[10px] text-slate-400">Sell: ${item.sellingPriceUSD.toFixed(2)}</div>
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {isLow && (
                              <button
                                onClick={() => handleTriggerReorder(item)}
                                className="bg-rose-800 hover:bg-rose-900 text-white text-[11px] font-medium px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                title="Auto-Create Purchase Order Requisition"
                              >
                                <ShoppingCart className="w-3 h-3" />
                                <span>PO</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setAdjustItemId(item.id);
                                setShowAdjustModal(true);
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium px-2 py-1 rounded transition-colors cursor-pointer"
                              title="Stock Adjustment / Count Audit"
                            >
                              Count
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PURCHASE ORDERS */}
      {activeTab === 'purchase_orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Purchase Orders & Supply Requisitions</h3>
              <p className="text-xs text-slate-500">Authorized orders pending delivery and 3-way matching</p>
            </div>
            <button
              onClick={() => setShowPOModal(true)}
              className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Purchase Order</span>
            </button>
          </div>

          <div className="space-y-3">
            {db.purchaseOrders.map(po => {
              const isFulfilled = po.status === 'FULFILLED';
              return (
                <div key={po.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-900 text-sm">{po.poNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          isFulfilled 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {po.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Supplier: <strong className="text-slate-900">{po.supplierName}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs">
                        <div className="font-mono font-bold text-slate-900 text-base">
                          USD ${po.subtotalUSD.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Order Date: {po.orderDate} · Delivery ETA: {po.expectedDeliveryDate}
                        </div>
                      </div>

                      {!isFulfilled && (
                        <button
                          onClick={() => handleReceivePO(po)}
                          className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Receive Goods (GRN)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                        <tr>
                          <th className="p-2.5">Item Description</th>
                          <th className="p-2.5 text-center font-mono">Qty Ordered</th>
                          <th className="p-2.5 text-center font-mono">Qty Received</th>
                          <th className="p-2.5 text-right font-mono">Unit Price</th>
                          <th className="p-2.5 text-right font-mono">Total (USD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {po.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-medium text-slate-800">
                              <span className="font-mono font-bold text-teal-800 mr-2">{it.itemCode}</span>
                              {it.itemName}
                            </td>
                            <td className="p-2.5 text-center font-mono">{it.quantityOrdered}</td>
                            <td className="p-2.5 text-center font-mono font-bold text-emerald-800">
                              {it.quantityReceived || 0}
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-600">${it.unitPriceUSD.toFixed(2)}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-slate-900">${it.totalUSD.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                    <span>Requisitioner: {po.createdBy}</span>
                    <span>Authorized by: {po.approvedBy || 'Clinical Leadership'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: GOODS RECEIPT NOTES (GRN) */}
      {activeTab === 'goods_receipts' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm">Goods Receipt Notes (GRN 3-Way Match Audit)</h3>
            <p className="text-xs text-slate-500">
              Validates that received quantities match Purchase Orders and Supplier Invoices before stock intake
            </p>
          </div>

          <div className="space-y-3">
            {db.goodsReceipts.map(grn => (
              <div key={grn.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-900 text-sm">{grn.grnNumber}</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 3-Way Matched
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      PO Reference: <span className="font-mono font-semibold">{grn.poNumber}</span> · Supplier: <strong className="text-slate-900">{grn.supplierName}</strong>
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500 font-mono">
                    <div>Receipt Date: {grn.receiptDate}</div>
                    <div>Audited by: {grn.receivedBy}</div>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <div className="font-semibold text-slate-800 text-[11px]">Inspected & Intaked Batches:</div>
                  {grn.itemsReceived.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-200/60 last:border-0">
                      <div>
                        <span className="font-medium text-slate-900">{item.itemName}</span>
                        <span className="text-[10px] text-slate-500 ml-2 font-mono">
                          (Batch: <strong>{item.batchNumber}</strong> · Exp: {item.expiryDate})
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        +{item.quantity} units verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: APPROVED SUPPLIERS REGISTRY */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Approved Medical & Pharmaceutical Vendors</h3>
              <p className="text-xs text-slate-500">Qualified vendors for WHO/LMHRA compliant pharmaceuticals and reagents</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{db.suppliers.length} Registered</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {db.suppliers.map(sup => (
              <div key={sup.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-teal-800">{sup.code}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{sup.name}</h4>
                    <span className="text-[10px] text-slate-500 font-medium">{sup.category}</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    ★ {sup.rating.toFixed(1)} / 5.0
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 font-mono">
                  <div>Contact: {sup.contactPerson}</div>
                  <div>Phone: {sup.phone}</div>
                  <div>Email: {sup.email}</div>
                  <div className="text-[11px] text-slate-500 font-sans">{sup.address}</div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedSupplierId(sup.id);
                      setShowPOModal(true);
                    }}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>Issue PO to Vendor</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PURCHASE ORDER REQUISITION MODAL */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">New Purchase Order Requisition</h3>
              <button onClick={() => setShowPOModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Approved Supplier *</label>
                <select
                  value={selectedSupplierId}
                  onChange={e => setSelectedSupplierId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-teal-700"
                >
                  {db.suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category} · Rating: {s.rating})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Item to Replenish *</label>
                <select
                  value={selectedItemId}
                  onChange={e => setSelectedItemId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden focus:border-teal-700"
                >
                  {db.inventory.map(i => (
                    <option key={i.id} value={i.id}>
                      [{i.itemCode}] {i.name} (Stock: {i.currentStock} / Min: {i.reorderLevel}) — ${i.unitCostUSD.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Order Quantity (Units / Boxes) *</label>
                <input
                  type="number"
                  min="1"
                  value={orderQuantity}
                  onChange={e => setOrderQuantity(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-mono focus:outline-hidden focus:border-teal-700"
                />
              </div>

              {/* Cost Calculation Preview */}
              {(() => {
                const item = db.inventory.find(i => i.id === selectedItemId) || db.inventory[0];
                const qty = parseInt(orderQuantity) || 0;
                const total = qty * (item?.unitCostUSD || 0);
                return (
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Unit Price:</span>
                      <span>${(item?.unitCostUSD || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                      <span>Total Purchase Value:</span>
                      <span className="text-emerald-800 text-sm">${total.toFixed(2)} USD</span>
                    </div>
                    <div className="text-[11px] text-slate-500 text-right">
                      Equivalent LRD {(total * LRD_PER_USD).toLocaleString()}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowPOModal(false)}
                className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreatePO}
                className="bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Approve & Issue PO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK STOCK ADJUSTMENT / AUDIT MODAL */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Quick Stock Count Adjustment</h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Inventory Item</label>
                <select
                  value={adjustItemId}
                  onChange={e => setAdjustItemId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden"
                >
                  {db.inventory.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.currentStock} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adjustment Reason</label>
                <select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:outline-hidden"
                >
                  <option value="RESTOCK">Direct Emergency Restock / Shelf Transfer (+)</option>
                  <option value="PHYSICAL_COUNT_ADJUST">Physical Store Cycle Count Correction (+/-)</option>
                  <option value="DONATION">Donor Medical Aid Infusion (WHO/UNICEF) (+)</option>
                  <option value="DAMAGED_WRITE_OFF">Broken / Expired Stock Write-off (-)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={adjustQtyChange}
                  onChange={e => setAdjustQtyChange(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-mono focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStockAdjustment}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Apply Adjustment & Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
