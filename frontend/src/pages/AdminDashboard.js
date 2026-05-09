import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

// ── Colour tokens ──────────────────────────────────────────────
const C = {
  bg: '#0f1117', sidebar: '#161b27', card: '#1c2333',
  border: '#2a3147', accent: '#ff6b35', accentSoft: '#ff6b3520',
  text: '#e2e8f0', muted: '#64748b', green: '#22c55e',
  greenSoft: '#22c55e20', blue: '#3b82f6', blueSoft: '#3b82f620',
  yellow: '#f59e0b', yellowSoft: '#f59e0b20',
  red: '#ef4444', redSoft: '#ef444420',
  purple: '#a855f7', purpleSoft: '#a855f720',
};

const STATUS_META = {
  pending:   { color: C.yellow,  bg: C.yellowSoft,  label: 'Pending'   },
  confirmed: { color: C.blue,    bg: C.blueSoft,    label: 'Confirmed' },
  preparing: { color: C.purple,  bg: C.purpleSoft,  label: 'Preparing' },
  delivered: { color: C.green,   bg: C.greenSoft,   label: 'Delivered' },
  cancelled: { color: C.red,     bg: C.redSoft,     label: 'Cancelled' },
};

const CATEGORIES = ['burger', 'pizza', 'drinks', 'dessert', 'sides'];
const EMPTY_FOOD  = { name: '', description: '', price: '', category: 'burger', image: '', isAvailable: true };

// ── Reusable stat card ─────────────────────────────────────────
const StatCard = ({ label, value, icon, color, soft }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
    padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: soft,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: 13, color: C.muted }}>{label}</p>
      <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color }}>{value}</p>
    </div>
  </div>
);

// ── Badge ──────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const m = STATUS_META[status] || { color: C.muted, bg: '#ffffff10', label: status };
  return (
    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12,
      fontWeight: 600, background: m.bg, color: m.color }}>
      {m.label}
    </span>
  );
};

// ── Input helper ───────────────────────────────────────────────
const Field = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: 'block', fontSize: 12, color: C.muted,
      marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</label>}
    {props.as === 'select'
      ? <select {...props} style={{ width: '100%', padding: '10px 12px', background: C.bg,
          border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14 }}>
          {props.children}
        </select>
      : props.as === 'textarea'
        ? <textarea {...props} rows={3} style={{ width: '100%', padding: '10px 12px',
            background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
            color: C.text, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
        : <input {...props} style={{ width: '100%', padding: '10px 12px', background: C.bg,
            border: `1px solid ${C.border}`, borderRadius: 8, color: C.text,
            fontSize: 14, boxSizing: 'border-box' }} />
    }
  </div>
);

// ══════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  // ── data state ──
  const [stats,   setStats]   = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [foods,   setFoods]   = useState([]);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState('');

  // ── food form state ──
  const [showForm,   setShowForm]   = useState(false);
  const [editFood,   setEditFood]   = useState(null);
  const [foodForm,   setFoodForm]   = useState(EMPTY_FOOD);
  const [saving,     setSaving]     = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');

  // ── redirect non-admins ──
  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/menu');
  }, [user]);

  // ── initial fetch ──
  useEffect(() => { if (user?.role === 'admin') fetchAll(); }, [user]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ordRes, foodRes] = await Promise.all([
        API.get('/orders'),
        API.get('/foods'),
      ]);
      const allOrders = ordRes.data.orders || [];
      const allFoods  = foodRes.data;
      setOrders(allOrders);
      setFoods(allFoods);

      // derive stats
      const revenue  = allOrders.filter(o => o.status !== 'cancelled')
                                .reduce((s, o) => s + o.totalAmount, 0);
      const pending  = allOrders.filter(o => o.status === 'pending').length;
      const delivered = allOrders.filter(o => o.status === 'delivered').length;
      setStats({ total: allOrders.length, revenue, pending, delivered, menuItems: allFoods.length });
    } catch (e) { showToast('Failed to load data'); }
    finally { setLoading(false); }
  };

  // ── update order status ──
  const updateStatus = async (orderId, status) => {
    try {
      await API.put('/orders/' + orderId + '/status', { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      showToast('Order status updated ✅');
    } catch { showToast('Failed to update status'); }
  };

  // ── delete food ──
  const deleteFood = async (id) => {
    if (!window.confirm('Delete this food item?')) return;
    try {
      await API.delete('/foods/' + id);
      setFoods(prev => prev.filter(f => f._id !== id));
      showToast('Food item deleted ✅');
    } catch { showToast('Failed to delete'); }
  };

  // ── save food (create or update) ──
  const saveFood = async () => {
    if (!foodForm.name || !foodForm.price || !foodForm.description) {
      return showToast('Please fill all required fields');
    }
    setSaving(true);
    try {
      if (editFood) {
        const res = await API.put('/foods/' + editFood._id, foodForm);
        setFoods(prev => prev.map(f => f._id === editFood._id ? res.data.food : f));
        showToast('Food updated ✅');
      } else {
        const res = await API.post('/foods', foodForm);
        setFoods(prev => [...prev, res.data.food]);
        showToast('Food added ✅');
      }
      setShowForm(false); setEditFood(null); setFoodForm(EMPTY_FOOD);
    } catch (e) { showToast(e.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const openEdit = (food) => {
    setEditFood(food);
    setFoodForm({ name: food.name, description: food.description, price: food.price,
      category: food.category, image: food.image, isAvailable: food.isAvailable });
    setShowForm(true);
  };

  const filteredOrders = orderFilter === 'all'
    ? orders : orders.filter(o => o.status === orderFilter);

  // ── sidebar tabs ──
  const TABS = [
    { id: 'overview', icon: '📊', label: 'Overview'   },
    { id: 'orders',   icon: '📦', label: 'Orders'     },
    { id: 'menu',     icon: '🍔', label: 'Menu Items' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '80vh', background: C.bg, color: C.text, fontSize: 18 }}>
      Loading dashboard... ⏳
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 57px)',
      background: C.bg, fontFamily: 'system-ui, sans-serif', position: 'relative' }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: 'fixed', top: 80, right: 24, background: C.card,
          border: `1px solid ${C.border}`, color: C.text, padding: '12px 20px',
          borderRadius: 10, zIndex: 999, fontSize: 14, boxShadow: '0 4px 20px #0008' }}>
          {toast}
        </div>
      )}

      {/* ── Sidebar ── */}
      <div style={{ width: 220, background: C.sidebar, borderRight: `1px solid ${C.border}`,
        padding: '28px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 20px 24px', borderBottom: `1px solid ${C.border}` }}>
          <p style={{ margin: 0, fontSize: 11, color: C.muted, letterSpacing: 2,
            textTransform: 'uppercase' }}>Admin Panel</p>
          <p style={{ margin: '4px 0 0', fontSize: 15, color: C.text, fontWeight: 600 }}>
            {user?.name}
          </p>
        </div>
        <div style={{ paddingTop: 12 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '12px 20px', background: 'none',
              borderLeft: tab === t.id ? `3px solid ${C.accent}` : '3px solid transparent',
              border: 'none', borderLeftWidth: 3,
              borderLeftStyle: 'solid',
              borderLeftColor: tab === t.id ? C.accent : 'transparent',
              color: tab === t.id ? C.text : C.muted,
              fontSize: 14, cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s',
              backgroundColor: tab === t.id ? C.accentSoft : 'transparent',
            }}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto', color: C.text }}>

        {/* ════ OVERVIEW ════ */}
        {tab === 'overview' && stats && (
          <div>
            <h2 style={{ margin: '0 0 24px', fontWeight: 700, fontSize: 22 }}>Overview</h2>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
              <StatCard label="Total Orders"   value={stats.total}      icon="📦" color={C.blue}   soft={C.blueSoft}   />
              <StatCard label="Revenue (₹)"    value={stats.revenue.toFixed(0)} icon="💰" color={C.green} soft={C.greenSoft} />
              <StatCard label="Pending"         value={stats.pending}    icon="⏳" color={C.yellow} soft={C.yellowSoft} />
              <StatCard label="Delivered"       value={stats.delivered}  icon="✅" color={C.green}  soft={C.greenSoft}  />
              <StatCard label="Menu Items"      value={stats.menuItems}  icon="🍔" color={C.accent} soft={C.accentSoft} />
            </div>

            {/* Recent orders */}
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>Recent Orders</h3>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#ffffff08' }}>
                    {['Order ID', 'Customer', 'Items', 'Amount', 'Status'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left',
                        color: C.muted, fontWeight: 600, fontSize: 12,
                        borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 8).map((o, i) => (
                    <tr key={o._id} style={{ borderBottom: i < 7 ? `1px solid ${C.border}` : 'none' }}>
                      <td style={{ padding: '12px 16px', color: C.muted, fontFamily: 'monospace', fontSize: 12 }}>
                        #{o._id.slice(-8).toUpperCase()}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {o.user?.name || 'Unknown'}
                        <div style={{ fontSize: 11, color: C.muted }}>{o.user?.email}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: C.muted }}>
                        {o.items.length} item{o.items.length !== 1 ? 's' : ''}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>₹{o.totalAmount.toFixed(2)}</td>
                      <td style={{ padding: '12px 16px' }}><Badge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ ORDERS ════ */}
        {tab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: 22 }}>All Orders ({orders.length})</h2>
              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: 8 }}>
                {['all', 'pending', 'confirmed', 'preparing', 'delivered', 'cancelled'].map(f => (
                  <button key={f} onClick={() => setOrderFilter(f)} style={{
                    padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    background: orderFilter === f ? C.accent : C.card,
                    color: orderFilter === f ? '#fff' : C.muted,
                  }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filteredOrders.length === 0
                ? <p style={{ color: C.muted, textAlign: 'center', padding: 40 }}>No orders found</p>
                : filteredOrders.map(order => (
                <div key={order._id} style={{ background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 12, overflow: 'hidden' }}>
                  {/* Order header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, color: C.muted }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <Badge status={order.status} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, color: C.muted }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {/* Status selector */}
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order._id, e.target.value)}
                        style={{ padding: '6px 10px', background: C.bg, border: `1px solid ${C.border}`,
                          borderRadius: 8, color: C.text, fontSize: 13, cursor: 'pointer' }}>
                        {['pending','confirmed','preparing','delivered','cancelled'].map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Order body */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '16px 20px', gap: 16 }}>
                    {/* Customer */}
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Customer</p>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{order.user?.name || 'Unknown'}</p>
                      <p style={{ margin: 0, fontSize: 12, color: C.muted }}>{order.user?.email}</p>
                    </div>
                    {/* Items */}
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Items</p>
                      {order.items.map((item, i) => (
                        <p key={i} style={{ margin: '0 0 2px', fontSize: 13 }}>
                          {item.name} × {item.quantity}
                          <span style={{ color: C.muted }}> — ₹{(item.price * item.quantity).toFixed(2)}</span>
                        </p>
                      ))}
                    </div>
                    {/* Delivery */}
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Delivery</p>
                      <p style={{ margin: '0 0 2px', fontSize: 13 }}>
                        {order.deliveryAddress.street}, {order.deliveryAddress.city}
                      </p>
                      <p style={{ margin: '0 0 4px', fontSize: 12, color: C.muted }}>ZIP: {order.deliveryAddress.zip}</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.accent }}>
                        Total: ₹{order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ MENU ITEMS ════ */}
        {tab === 'menu' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: 22 }}>Menu Items ({foods.length})</h2>
              <button onClick={() => { setEditFood(null); setFoodForm(EMPTY_FOOD); setShowForm(true); }} style={{
                padding: '10px 20px', background: C.accent, color: '#fff', border: 'none',
                borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                + Add Food Item
              </button>
            </div>

            {/* Food grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {foods.map(food => (
                <div key={food._id} style={{ background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 12, overflow: 'hidden' }}>
                  <img src={food.image || 'https://via.placeholder.com/300x140?text=🍔+Food'}
                    alt={food.name}
                    style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <h4 style={{ margin: 0, fontSize: 16 }}>{food.name}</h4>
                      <span style={{ fontSize: 11, background: C.accentSoft, color: C.accent,
                        padding: '3px 8px', borderRadius: 20, textTransform: 'capitalize' }}>
                        {food.category}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 12px', fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
                      {food.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: C.accent }}>₹{food.price}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 20,
                          background: food.isAvailable ? C.greenSoft : C.redSoft,
                          color: food.isAvailable ? C.green : C.red }}>
                          {food.isAvailable ? 'Available' : 'Hidden'}
                        </span>
                        <button onClick={() => openEdit(food)} style={{
                          padding: '5px 12px', background: C.blueSoft, color: C.blue,
                          border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                          Edit
                        </button>
                        <button onClick={() => deleteFood(food._id)} style={{
                          padding: '5px 12px', background: C.redSoft, color: C.red,
                          border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Food Form Modal ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: '#000a', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
            padding: 32, width: '100%', maxWidth: 480, color: C.text }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>
              {editFood ? 'Edit Food Item' : 'Add New Food Item'}
            </h3>

            <Field label="Name *" type="text" placeholder="e.g. Margherita Pizza"
              value={foodForm.name} onChange={e => setFoodForm({ ...foodForm, name: e.target.value })} />
            <Field label="Description *" as="textarea" placeholder="Short description..."
              value={foodForm.description} onChange={e => setFoodForm({ ...foodForm, description: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Price (₹) *" type="number" placeholder="0"
                value={foodForm.price} onChange={e => setFoodForm({ ...foodForm, price: e.target.value })} />
              <Field label="Category *" as="select"
                value={foodForm.category} onChange={e => setFoodForm({ ...foodForm, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </Field>
            </div>
            <Field label="Image URL" type="text" placeholder="https://..."
              value={foodForm.image} onChange={e => setFoodForm({ ...foodForm, image: e.target.value })} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              fontSize: 14, marginBottom: 20, color: C.text }}>
              <input type="checkbox" checked={foodForm.isAvailable}
                onChange={e => setFoodForm({ ...foodForm, isAvailable: e.target.checked })} />
              Show on menu (Available)
            </label>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={saveFood} disabled={saving} style={{
                flex: 1, padding: '12px', background: C.accent, color: '#fff',
                border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
                {saving ? 'Saving...' : editFood ? 'Update Item' : 'Add Item'}
              </button>
              <button onClick={() => { setShowForm(false); setEditFood(null); setFoodForm(EMPTY_FOOD); }} style={{
                padding: '12px 20px', background: C.bg, color: C.muted,
                border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 15 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
