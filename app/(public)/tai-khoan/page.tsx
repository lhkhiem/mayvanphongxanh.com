'use client';

import { useState } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { User, Package, Heart, Settings, LogOut } from 'lucide-react';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Account</h1>

        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-48 flex-shrink-0">
            <nav className="bg-card border border-border rounded-lg overflow-hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-6 py-4 text-left font-semibold transition-colors border-b border-border last:border-b-0 ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
              <button className="w-full flex items-center gap-3 px-6 py-4 text-left font-semibold text-red-500 hover:bg-muted transition-colors border-t border-border">
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-card border border-border rounded-lg p-8">
                <h2 className="text-2xl font-bold text-foreground mb-8">Profile Information</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">First Name</label>
                      <input
                        type="text"
                        defaultValue="John"
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Last Name</label>
                      <input
                        type="text"
                        defaultValue="Doe"
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
                    <input
                      type="email"
                      defaultValue="john@example.com"
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                      Save Changes
                    </button>
                    <button className="px-6 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-card border border-border rounded-lg p-8">
                <h2 className="text-2xl font-bold text-foreground mb-8">Order History</h2>
                
                <div className="space-y-4">
                  {[
                    { id: '#ORD-2024-001', date: 'Dec 15, 2024', status: 'Delivered', total: '$649.99', items: 2 },
                    { id: '#ORD-2024-002', date: 'Dec 10, 2024', status: 'Processing', total: '$149.99', items: 1 },
                    { id: '#ORD-2024-003', date: 'Nov 28, 2024', status: 'Delivered', total: '$299.99', items: 3 },
                  ].map((order) => (
                    <div key={order.id} className="border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-foreground">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{order.total}</p>
                          <span className={`text-sm font-semibold ${order.status === 'Delivered' ? 'text-green-600' : 'text-blue-600'}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.items} item(s)</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="bg-card border border-border rounded-lg p-8">
                <h2 className="text-2xl font-bold text-foreground mb-8">My Wishlist</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Advanced Color Printer', price: '$1,299.99', stock: true },
                    { name: 'Wireless Printer Network Kit', price: '$199.99', stock: true },
                    { name: 'Professional Scanner', price: '$799.99', stock: false },
                  ].map((item) => (
                    <div key={item.name} className="border border-border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-primary font-bold">{item.price}</p>
                        <p className={`text-xs font-semibold mt-1 ${item.stock ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {item.stock ? 'In Stock' : 'Out of Stock'}
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-card border border-border rounded-lg p-8">
                <h2 className="text-2xl font-bold text-foreground mb-8">Account Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-foreground mb-4">Password</h3>
                    <p className="text-sm text-muted-foreground mb-4">Change your password regularly to keep your account secure</p>
                    <button className="px-6 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors">
                      Change Password
                    </button>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-bold text-foreground mb-4">Email Preferences</h3>
                    <div className="space-y-3">
                      {['Order Updates', 'Promotional Emails', 'Newsletter', 'New Products'].map((pref) => (
                        <label key={pref} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-foreground">{pref}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-bold text-foreground mb-4">Danger Zone</h3>
                    <button className="px-6 py-3 border border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
