'use client';

import { useState } from 'react';
import { MenuItem, Menu } from '@/lib/menuData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronRight, Plus, Trash2, ArrowUp, ArrowDown, Edit2 } from 'lucide-react';

interface MenuBuilderProps {
  initialMenu: Menu;
  onSave: (menu: Menu) => void;
}

export function MenuBuilder({ initialMenu, onSave }: MenuBuilderProps) {
  const [menu, setMenu] = useState<Menu>(initialMenu);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Hàm đệ quy để render từng Node
  const renderTree = (items: MenuItem[], parentId: string | null = null, level = 0) => {
    return items.map((item, index) => (
      <div key={item.id} className="mb-2">
        <div 
          className="flex items-center justify-between p-3 bg-card border border-border rounded-md shadow-sm hover:border-primary/50 transition-colors"
          style={{ marginLeft: `${level * 24}px` }}
        >
          <div className="flex items-center gap-3">
            {item.children && item.children.length > 0 ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <div className="w-4 h-4" /> // placeholder
            )}
            <span className="font-medium text-sm">{item.label}</span>
            {item.url && <span className="text-xs text-muted-foreground">{item.url}</span>}
            {item.componentType === 'mega-products' && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Mega Menu</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 opacity-70 hover:opacity-100">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveItem(items, index, -1)} disabled={index === 0}>
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveItem(items, index, 1)} disabled={index === items.length - 1}>
              <ArrowDown className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => setEditingItem(item)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteItem(item.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {item.children && item.children.length > 0 && (
          <div className="mt-2">
            {renderTree(item.children, item.id, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const moveItem = (itemsArray: MenuItem[], index: number, direction: -1 | 1) => {
    // This is a simplified move that only works within the same array (siblings)
    const newMenu = { ...menu };
    
    // Hàm đệ quy để tìm mảng chứa phần tử và đổi chỗ
    const findAndSwap = (nodes: MenuItem[]): boolean => {
      if (nodes === itemsArray) {
        const temp = nodes[index];
        nodes[index] = nodes[index + direction];
        nodes[index + direction] = temp;
        return true;
      }
      for (let node of nodes) {
        if (node.children && findAndSwap(node.children)) return true;
      }
      return false;
    };

    findAndSwap(newMenu.items);
    setMenu(newMenu);
  };

  const deleteItem = (id: string) => {
    const newMenu = { ...menu };
    
    const findAndDelete = (nodes: MenuItem[]): boolean => {
      const idx = nodes.findIndex(n => n.id === id);
      if (idx > -1) {
        nodes.splice(idx, 1);
        return true;
      }
      for (let node of nodes) {
        if (node.children && findAndDelete(node.children)) return true;
      }
      return false;
    };

    findAndDelete(newMenu.items);
    setMenu(newMenu);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const newMenu = { ...menu };
    const findAndUpdate = (nodes: MenuItem[]): boolean => {
      const idx = nodes.findIndex(n => n.id === editingItem.id);
      if (idx > -1) {
        nodes[idx] = editingItem;
        return true;
      }
      for (let node of nodes) {
        if (node.children && findAndUpdate(node.children)) return true;
      }
      return false;
    };

    findAndUpdate(newMenu.items);
    setMenu(newMenu);
    setEditingItem(null);
  };

  const addNewItem = () => {
    const newItem: MenuItem = {
      id: `new-${Date.now()}`,
      label: 'Menu Mới',
      url: '/'
    };
    setMenu({
      ...menu,
      items: [...menu.items, newItem]
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tree view */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Cấu trúc Menu: {menu.name}</h2>
          <Button onClick={addNewItem} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Thêm Menu gốc
          </Button>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm min-h-[400px]">
          {renderTree(menu.items)}
          {menu.items.length === 0 && (
            <div className="text-center text-muted-foreground py-10">
              Menu trống. Hãy thêm mục mới.
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => onSave(menu)} size="lg" className="w-full sm:w-auto">
            Lưu thay đổi Menu
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">
            {editingItem ? 'Chỉnh sửa Menu' : 'Chọn Menu để sửa'}
          </h3>
          
          {editingItem ? (
            <form onSubmit={saveEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Tên hiển thị</Label>
                <Input 
                  id="label"
                  value={editingItem.label} 
                  onChange={e => setEditingItem({...editingItem, label: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Đường dẫn (URL)</Label>
                <Input 
                  id="url"
                  value={editingItem.url || ''} 
                  onChange={e => setEditingItem({...editingItem, url: e.target.value})}
                  placeholder="VD: /about hoặc https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Loại đặc biệt</Label>
                <select 
                  id="type"
                  className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingItem.componentType || 'default'}
                  onChange={e => setEditingItem({
                    ...editingItem, 
                    componentType: e.target.value === 'default' ? undefined : e.target.value as any
                  })}
                >
                  <option value="default">Mặc định (Link thường)</option>
                  <option value="mega-products">Mega Menu Sản Phẩm</option>
                </select>
              </div>
              <div className="pt-4 flex gap-2">
                <Button type="submit" className="flex-1">Cập nhật</Button>
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Hủy</Button>
              </div>
            </form>
          ) : (
            <div className="text-center text-muted-foreground py-10 text-sm">
              Bấm vào biểu tượng chỉnh sửa (bút chì) trên một phần tử để thay đổi thông tin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
