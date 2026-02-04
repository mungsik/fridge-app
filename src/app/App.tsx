import { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { FridgeItemForm } from '@/app/components/FridgeItemForm';
import { FridgeItemCard } from '@/app/components/FridgeItemCard';
import { NotificationBanner } from '@/app/components/NotificationBanner';
import { AuthForm } from '@/app/components/AuthForm';
import { useAuth } from '@/app/contexts/AuthContext';
import { FridgeItem } from '@/app/types/fridge';
import { Plus, Search, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';
import { useFridgeItems } from '@/app/hooks/useFridgeItems';
import { FridgeView } from '@/app/components/fridge-view/FridgeView';
import { TelegramLinkDialog } from '@/app/components/TelegramLinkDialog';

/* ── Terminal style helpers ── */
const mono: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", "Courier New", monospace',
};

const termColor = {
  bg: '#161616',
  surface: '#1e1e1e',
  border: '#30363d',
  text: '#c9d1d9',
  textDim: '#6e7681',
  green: '#3fb950',
  greenDim: '#238636',
  cyan: '#58a6ff',
  coral: '#f0a090',
  coralDim: '#e8846b',
  red: '#f85149',
  yellow: '#d29922',
  prompt: '#79c0ff',
};

export default function App() {
  const { user, isLoading: authLoading, signOut, isAdmin, username } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: termColor.bg }}>
        <div style={mono}>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" style={{ color: termColor.green }} />
          <p style={{ color: termColor.green, fontSize: 13 }}>
            <span style={{ color: termColor.textDim }}>$</span> connecting...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster />
        <AuthForm />
      </>
    );
  }

  return <MainApp username={username ?? '게스트'} signOut={signOut} isAdmin={isAdmin} />;
}

function MainApp({ username, signOut, isAdmin }: { username: string | null; signOut: () => Promise<void>; isAdmin: boolean }) {
  const { telegramChatId } = useAuth();
  const {
    items,
    isLoading,
    error,
    refetch,
    createItem,
    updateItem,
    deleteItem
  } = useFridgeItems();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FridgeItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'fridge'>('fridge');
  const [isTelegramDialogOpen, setIsTelegramDialogOpen] = useState(false);

  const handleCreate = async (itemData: Omit<FridgeItem, 'id' | 'createdAt' | 'userId' | 'ownerName'>) => {
    try {
      setIsSubmitting(true);
      await createItem(itemData);
      toast.success('▶ ITEM SAVED — 인벤토리에 추가됨');
    } catch (err) {
      toast.error('✖ SAVE FAILED — 등록 실패');
      console.error('Create failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (itemData: Omit<FridgeItem, 'id' | 'createdAt' | 'userId' | 'ownerName'>) => {
    if (!editingItem) return;

    try {
      setIsSubmitting(true);
      await updateItem(editingItem.id, itemData);
      setEditingItem(null);
      toast.success('▶ ITEM UPDATED — 수정 완료');
    } catch (err) {
      toast.error('✖ UPDATE FAILED — 수정 실패');
      console.error('Update failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      toast.success('▶ ITEM DELETED — 삭제 완료');
    } catch (err) {
      toast.error('✖ DELETE FAILED — 삭제 실패');
      console.error('Delete failed:', err);
    }
  };

  const openEditForm = (item: FridgeItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleUpdateLocation = async (item: FridgeItem, newLocation: string) => {
    try {
      await updateItem(item.id, {
        name: item.name,
        quantity: item.quantity,
        expiryDate: item.expiryDate,
        category: item.category,
        location: newLocation,
      });
    } catch (err) {
      toast.error('✖ MOVE FAILED — 위치 변경 실패');
      console.error('Location update failed:', err);
    }
  };

  const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: termColor.bg }}>
        <div style={mono}>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" style={{ color: termColor.green }} />
          <p style={{ color: termColor.green, fontSize: 13 }}>
            <span style={{ color: termColor.textDim }}>$</span> loading data...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: termColor.bg }}>
        <div style={{ ...mono, maxWidth: 400, width: '100%' }}>
          <p style={{ color: termColor.red, fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: termColor.textDim }}>$</span> cat /var/log/error
          </p>
          <div style={{ border: `1px solid ${termColor.red}`, padding: 16 }}>
            <AlertCircle className="h-5 w-5 mb-2" style={{ color: termColor.red }} />
            <p style={{ color: termColor.red, fontSize: 13, marginBottom: 4 }}>ERROR: 데이터를 불러오는데 실패했습니다</p>
            <p style={{ color: termColor.textDim, fontSize: 12, marginBottom: 16 }}>{error}</p>
            <button
              onClick={refetch}
              style={{
                ...mono,
                background: 'transparent',
                border: `1px solid ${termColor.green}`,
                color: termColor.green,
                padding: '6px 16px',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <RefreshCw className="h-3 w-3 inline mr-2" />
              retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const expiredCount = items.filter(item => {
    const diff = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff < 0;
  }).length;

  const expiringCount = items.filter(item => {
    const diff = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 3;
  }).length;

  return (
    <div className="min-h-screen" style={{ background: termColor.bg, color: termColor.text, ...mono }}>
      <Toaster />

      {/* ===== TERMINAL HEADER ===== */}
      <header style={{ borderBottom: `1px solid ${termColor.border}`, padding: '16px 0' }}>
        <div className="container mx-auto px-4" style={{ fontSize: 13, lineHeight: 2 }}>
          {/* SSH line */}
          <div>
            <span style={{ color: termColor.textDim }}>$ </span>
            <span style={{ color: termColor.text }}>ssh fridge@naengboo.app</span>
          </div>
          <div>
            <span style={{ color: termColor.textDim }}>  연결 중... </span>
            <span style={{ color: termColor.coral }}>naengboo.app</span>
            <span style={{ color: termColor.textDim }}>...</span>
          </div>
          <div>
            <span style={{ color: termColor.green }}>  ✓ </span>
            <span style={{ color: termColor.green }}>연결 완료</span>
            <span style={{ color: termColor.textDim }}> (사용자: </span>
            <span style={{ color: termColor.cyan }}>{username}</span>
            {isAdmin && <span style={{ color: termColor.red }}> [ADMIN]</span>}
            <span style={{ color: termColor.textDim }}>)</span>
          </div>
          <div>
            <span style={{ color: termColor.textDim }}>  [system] </span>
            <span style={{ color: termColor.textDim }}>items: </span>
            <span style={{ color: termColor.cyan }}>{items.length}</span>
            <span style={{ color: termColor.textDim }}> | expired: </span>
            <span style={{ color: expiredCount > 0 ? termColor.red : termColor.textDim }}>{expiredCount}</span>
            <span style={{ color: termColor.textDim }}> | warning: </span>
            <span style={{ color: expiringCount > 0 ? termColor.yellow : termColor.textDim }}>{expiringCount}</span>
            <span style={{ color: termColor.textDim }}> | categories: </span>
            <span style={{ color: termColor.green }}>{categories.length}</span>
            {telegramChatId && (
              <>
                <span style={{ color: termColor.textDim }}> | telegram: </span>
                <span style={{ color: termColor.green }}>linked</span>
              </>
            )}
          </div>

          {/* Navigation */}
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ color: termColor.textDim }}>{'>'}</span>
            <button
              onClick={() => setViewMode('fridge')}
              style={{
                ...mono,
                background: 'transparent',
                border: 'none',
                color: viewMode === 'fridge' ? termColor.coral : termColor.textDim,
                fontSize: 13,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              [0] /fridge
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                ...mono,
                background: 'transparent',
                border: 'none',
                color: viewMode === 'grid' ? termColor.coral : termColor.textDim,
                fontSize: 13,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              [1] /grid
            </button>
            <button
              onClick={() => setIsTelegramDialogOpen(true)}
              style={{
                ...mono,
                background: 'transparent',
                border: 'none',
                color: termColor.textDim,
                fontSize: 13,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              [2] /telegram
            </button>
            <button
              onClick={signOut}
              style={{
                ...mono,
                background: 'transparent',
                border: 'none',
                color: termColor.textDim,
                fontSize: 13,
                cursor: 'pointer',
                padding: 0,
                marginLeft: 'auto',
              }}
            >
              [q] /logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* ===== TITLE (ASCII art style) ===== */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: termColor.prompt, fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: termColor.cyan }}>user@fridge</span>
            <span style={{ color: termColor.text }}>:</span>
            <span style={{ color: termColor.cyan }}>~</span>
            <span style={{ color: termColor.text }}>$ </span>
            <span style={{ color: termColor.text }}>cat home.md</span>
          </div>
          <div style={{
            border: `1px solid ${termColor.coral}`,
            borderRadius: 6,
            padding: '10px 20px',
            display: 'inline-block',
          }}>
            <span style={{ color: termColor.coral, fontSize: 14 }}>
              ✳ 냉장고를 부탁해 — fridge management system v1.0
            </span>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-4">
          <NotificationBanner items={items} isAdmin={isAdmin} />
        </div>

        {/* ===== COMMAND INPUT ===== */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: termColor.prompt, fontSize: 13, marginBottom: 10 }}>
            <span style={{ color: termColor.cyan }}>user@fridge</span>
            <span style={{ color: termColor.text }}>:</span>
            <span style={{ color: termColor.cyan }}>~</span>
            <span style={{ color: termColor.text }}>$ </span>
            <span style={{ color: termColor.textDim }}>{'>'}</span>
            <span style={{ color: termColor.textDim }}>명령어를 입력하세요...</span>
          </div>

          <div className="flex flex-col md:flex-row gap-3" style={{ paddingLeft: 16 }}>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: termColor.textDim }} />
              <Input
                placeholder="/search ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-none border border-[#30363d] bg-[#161616] text-[#c9d1d9] placeholder:text-[#6e7681] focus-visible:ring-[#58a6ff] focus-visible:ring-offset-0 focus-visible:border-[#58a6ff]"
                style={mono}
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[180px] rounded-none border border-[#30363d] bg-[#161616] text-[#c9d1d9]" style={mono}>
                <SelectValue placeholder="/filter category" />
              </SelectTrigger>
              <SelectContent className="rounded-none border border-[#30363d] bg-[#161b22]" style={mono}>
                <SelectItem value="all" className="text-[#c9d1d9] focus:bg-[#30363d] focus:text-[#f0a090]">전체</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="text-[#c9d1d9] focus:bg-[#30363d] focus:text-[#f0a090]">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={() => setIsFormOpen(true)}
              style={{
                ...mono,
                background: termColor.greenDim,
                border: `1px solid ${termColor.green}`,
                color: '#ffffff',
                padding: '6px 16px',
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
              }}
            >
              <Plus className="h-4 w-4" />
              /add
            </button>
          </div>
        </div>

        {/* ===== CONTENT ===== */}
        {viewMode === 'fridge' ? (
          <FridgeView
            items={filteredItems}
            onEdit={openEditForm}
            onDelete={handleDelete}
            onUpdateLocation={handleUpdateLocation}
            onAdd={() => setIsFormOpen(true)}
            isAdmin={isAdmin}
          />
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center' }}>
            <p style={{ color: termColor.textDim, fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: termColor.textDim }}>$</span> ls /fridge
            </p>
            <div style={{ border: `1px dashed ${termColor.border}`, padding: 24, display: 'inline-block' }}>
              <p style={{ color: termColor.textDim, fontSize: 13 }}>
                {items.length === 0 ? '(empty)' : 'no matching items found'}
              </p>
              {items.length === 0 && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  style={{
                    ...mono,
                    background: 'transparent',
                    border: `1px solid ${termColor.green}`,
                    color: termColor.green,
                    padding: '6px 16px',
                    fontSize: 13,
                    cursor: 'pointer',
                    marginTop: 12,
                  }}
                >
                  /add first item
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: termColor.textDim, fontSize: 12, marginBottom: 12 }}>
              <span style={{ color: termColor.textDim }}>$</span> ls /fridge <span style={{ color: termColor.textDim }}>— {filteredItems.length} items</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <FridgeItemCard
                  key={item.id}
                  item={item}
                  onEdit={openEditForm}
                  onDelete={handleDelete}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Form Dialog */}
      <FridgeItemForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingItem(null);
        }}
        onSubmit={editingItem ? handleEdit : handleCreate}
        initialData={editingItem || undefined}
        mode={editingItem ? 'edit' : 'create'}
        isSubmitting={isSubmitting}
      />

      {/* Telegram Link Dialog */}
      <TelegramLinkDialog
        open={isTelegramDialogOpen}
        onOpenChange={setIsTelegramDialogOpen}
      />
    </div>
  );
}
