import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ApiSettings, Product } from '../types';

export default function SettingsView() {
  const [apis, setApis] = useState<ApiSettings[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [newApi, setNewApi] = useState({ account_id: '', token: '', label: '' });
  const [newProduct, setNewProduct] = useState({ name: '', api_settings_id: '', buygoods_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
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
      setMessage({ type: 'success', text: 'Conta conectada com sucesso!' });
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
    if (!confirm('Excluir esta conta e todos os produtos vinculados?')) return;
    await supabase.from('api_settings').delete().eq('id', id);
    fetchData();
  }

  async function handleDeleteProduct(id: string) {
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  }

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {message && (
        <div className={`card`} style={{ 
          background: message.type === 'success' ? '#f0fdf4' : '#fef2f2', 
          borderColor: message.type === 'success' ? '#bbf7d0' : '#fecaca',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '800' }}>×</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        {/* API Settings */}
        <section className="card">
          <h2 style={{ marginBottom: '24px' }}>🔌 Conexões de API</h2>
          <form onSubmit={handleAddApi} className="settings-form">
            <div className="form-group">
              <label>Nome da Conta</label>
              <input 
                type="text" 
                value={newApi.label} 
                onChange={e => setNewApi({...newApi, label: e.target.value})}
                placeholder="Ex: Minha Conta Principal"
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Conectar</button>
          </form>

          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {apis.map(api => (
              <div key={api.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{api.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {api.account_id}</div>
                </div>
                <button onClick={() => handleDeleteApi(api.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
              </div>
            ))}
          </div>
        </section>

        {/* Product Settings */}
        <section className="card">
          <h2 style={{ marginBottom: '24px' }}>📦 Produtos Monitorados</h2>
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
            <div className="form-group">
              <label>Vincular à Conta</label>
              <select 
                value={newProduct.api_settings_id} 
                onChange={e => setNewProduct({...newProduct, api_settings_id: e.target.value})}
                required
              >
                <option value="">Selecione...</option>
                {apis.map(api => (
                  <option key={api.id} value={api.id}>{api.label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={apis.length === 0} style={{ marginTop: '8px' }}>Adicionar Produto</button>
          </form>

          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {products.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {apis.find(a => a.id === p.api_settings_id)?.label}
                  </div>
                </div>
                <button onClick={() => handleDeleteProduct(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
