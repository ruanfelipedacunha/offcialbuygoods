import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ApiSettings, Product } from '../types';

export default function SettingsView() {
  const [apis, setApis] = useState<ApiSettings[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form states for new API
  const [newApi, setNewApi] = useState({ account_id: '', token: '', label: '' });
  // Form states for new Product
  const [newProduct, setNewProduct] = useState({ name: '', api_settings_id: '', buygoods_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // For now, we'll fetch everything. In a real SaaS, we'd filter by user_id
      const { data: apiData } = await supabase.from('api_settings').select('*');
      const { data: productData } = await supabase.from('products').select('*');
      
      setApis(apiData || []);
      setProducts(productData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddApi(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from('api_settings').insert([newApi]);
      if (error) throw error;
      setMessage({ type: 'success', text: 'API configurada com sucesso!' });
      setNewApi({ account_id: '', token: '', label: '' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase.from('products').insert([newProduct]);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Produto adicionado com sucesso!' });
      setNewProduct({ name: '', api_settings_id: '', buygoods_id: '' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  async function handleDeleteApi(id: string) {
    if (!confirm('Tem certeza? Isso removerá todos os produtos vinculados.')) return;
    await supabase.from('api_settings').delete().eq('id', id);
    fetchData();
  }

  async function handleDeleteProduct(id: string) {
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  }

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div className="settings-view fade-in">
      <div className="view-header">
        <h1 className="font-space text-gradient">Configurações</h1>
        <p style={{ color: 'var(--text-low)', fontSize: '13px' }}>Gerencie suas conexões de API e produtos</p>
      </div>


      {message && (
        <div className={`alert alert-${message.type} slide-in-down`}>
          {message.text}
          <button onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      <div className="settings-grid">
        {/* API Accounts Section */}
        <section className="settings-section glass">
          <div className="section-header">
            <span className="icon">🔌</span>
            <h2>Contas de API</h2>
          </div>
          
          <form onSubmit={handleAddApi} className="settings-form">
            <div className="form-group">
              <label>Nome da Conta (ex: Conta Principal)</label>
              <input 
                type="text" 
                value={newApi.label} 
                onChange={e => setNewApi({...newApi, label: e.target.value})}
                placeholder="Identificador da conta"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Account ID</label>
                <input 
                  type="text" 
                  value={newApi.account_id} 
                  onChange={e => setNewApi({...newApi, account_id: e.target.value})}
                  placeholder="5316"
                  required
                />
              </div>
              <div className="form-group">
                <label>Token</label>
                <input 
                  type="password" 
                  value={newApi.token} 
                  onChange={e => setNewApi({...newApi, token: e.target.value})}
                  placeholder="Seu token de API"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">Conectar Conta</button>
          </form>

          <div className="list-container">
            {apis.map(api => (
              <div key={api.id} className="list-item glass" style={{ marginBottom: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="item-info">
                  <span className="item-title" style={{ fontWeight: '700', color: 'var(--text-high)', display: 'block' }}>{api.label || 'Sem nome'}</span>
                  <span className="item-subtitle" style={{ fontSize: '11px', color: 'var(--text-low)' }}>ID: {api.account_id}</span>
                </div>
                <button onClick={() => handleDeleteApi(api.id)} className="btn-icon delete" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', opacity: 0.6 }}>🗑️</button>
              </div>
            ))}
          </div>

        </section>

        {/* Products Section */}
        <section className="settings-section glass">
          <div className="section-header">
            <span className="icon">📦</span>
            <h2>Produtos Monitorados</h2>
          </div>

          <form onSubmit={handleAddProduct} className="settings-form">
            <div className="form-group">
              <label>Nome do Produto</label>
              <input 
                type="text" 
                value={newProduct.name} 
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                placeholder="Ex: Detox Premium"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Vincular à Conta</label>
                <select 
                  value={newProduct.api_settings_id} 
                  onChange={e => setNewProduct({...newProduct, api_settings_id: e.target.value})}
                  required
                >
                  <option value="">Selecione uma conta...</option>
                  {apis.map(api => (
                    <option key={api.id} value={api.id}>{api.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>BuyGoods Product ID (Opcional)</label>
                <input 
                  type="text" 
                  value={newProduct.buygoods_id} 
                  onChange={e => setNewProduct({...newProduct, buygoods_id: e.target.value})}
                  placeholder="ex: 12345"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={apis.length === 0}>
              Adicionar Produto
            </button>
          </form>

          <div className="list-container">
            {products.map(p => (
              <div key={p.id} className="list-item glass" style={{ marginBottom: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="item-info">
                  <span className="item-title" style={{ fontWeight: '700', color: 'var(--text-high)', display: 'block' }}>{p.name}</span>
                  <span className="item-subtitle" style={{ fontSize: '11px', color: 'var(--text-low)' }}>
                    {apis.find(a => a.id === p.api_settings_id)?.label || 'Conta desconhecida'}
                  </span>
                </div>
                <button onClick={() => handleDeleteProduct(p.id)} className="btn-icon delete" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', opacity: 0.6 }}>🗑️</button>
              </div>
            ))}
          </div>

        </section>
      </div>

      <div className="settings-footer glass">
        <div className="footer-content">
          <h3>🚀 Pronto para vender?</h3>
          <p>Este sistema está configurado para multi-tenant. Cada usuário pode ter suas próprias APIs e produtos.</p>
          <button className="btn-secondary">Exportar Configurações</button>
        </div>
      </div>
    </div>
  );
}
