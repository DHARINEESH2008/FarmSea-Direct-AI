'use client';

import { useFarmSeaStore, type ViewType, type UserRole } from '@/store/useFarmSeaStore';
import LoginScreen from '@/components/farmsea/LoginScreen';
import CustomerDashboard from '@/components/farmsea/CustomerDashboard';
import FarmerDashboard from '@/components/farmsea/FarmerDashboard';
import FisherDashboard from '@/components/farmsea/FisherDashboard';
import DeliveryDashboard from '@/components/farmsea/DeliveryDashboard';
import AdminDashboard from '@/components/farmsea/AdminDashboard';
import CircularEconomy from '@/components/farmsea/CircularEconomy';
import AIFeatures from '@/components/farmsea/AIFeatures';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Leaf, Fish, Truck, Shield, ShoppingCart, Bell, LogOut,
  Menu, Package, FileText, Sparkles, Brain, Target,
  ThermometerSun, DollarSign, TrendingUp, BarChart3,
  Recycle, Award, Anchor, Clock, MapPin, AlertTriangle,
  ChevronRight, X,
} from 'lucide-react';

interface NavItem {
  view: ViewType;
  label: string;
  icon: React.ReactNode;
  section?: string;
}

const customerNav: NavItem[] = [
  { view: 'customer-browse', label: 'Browse Products', icon: <Package className="w-5 h-5" />, section: 'Shopping' },
  { view: 'customer-orders', label: 'My Orders', icon: <FileText className="w-5 h-5" />, section: 'Shopping' },
  { view: 'customer-bookings', label: 'Pre-bookings', icon: <Clock className="w-5 h-5" />, section: 'Shopping' },
  { view: 'customer-ai', label: 'AI Recommendations', icon: <Sparkles className="w-5 h-5" />, section: 'AI & Insights' },
  { view: 'customer-circular', label: 'Circular Economy', icon: <Recycle className="w-5 h-5" />, section: 'AI & Insights' },
];

const farmerNav: NavItem[] = [
  { view: 'farmer-products', label: 'My Products', icon: <Package className="w-5 h-5" />, section: 'Business' },
  { view: 'farmer-orders', label: 'Orders Received', icon: <FileText className="w-5 h-5" />, section: 'Business' },
  { view: 'farmer-bookings', label: 'Bookings', icon: <Clock className="w-5 h-5" />, section: 'Business' },
  { view: 'farmer-ai', label: 'AI Copilot', icon: <Brain className="w-5 h-5" />, section: 'AI & Insights' },
  { view: 'farmer-passport', label: 'Farm Passport', icon: <Award className="w-5 h-5" />, section: 'Profile' },
];

const fisherNav: NavItem[] = [
  { view: 'fisher-products', label: 'My Products', icon: <Package className="w-5 h-5" />, section: 'Business' },
  { view: 'fisher-orders', label: 'Orders Received', icon: <FileText className="w-5 h-5" />, section: 'Business' },
  { view: 'fisher-bookings', label: 'Bookings', icon: <Clock className="w-5 h-5" />, section: 'Business' },
  { view: 'fisher-ai', label: 'AI Copilot', icon: <Brain className="w-5 h-5" />, section: 'AI & Insights' },
  { view: 'fisher-passport', label: 'Sea Passport', icon: <Anchor className="w-5 h-5" />, section: 'Profile' },
];

const deliveryNav: NavItem[] = [
  { view: 'delivery-assignments', label: 'My Deliveries', icon: <Truck className="w-5 h-5" />, section: 'Work' },
  { view: 'delivery-performance', label: 'Performance', icon: <BarChart3 className="w-5 h-5" />, section: 'Work' },
  { view: 'delivery-salary', label: 'Salary', icon: <DollarSign className="w-5 h-5" />, section: 'Work' },
];

const adminNav: NavItem[] = [
  { view: 'admin-analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, section: 'Overview' },
  { view: 'admin-users', label: 'User Management', icon: <Shield className="w-5 h-5" />, section: 'Management' },
  { view: 'admin-warnings', label: 'Fisher Warnings', icon: <AlertTriangle className="w-5 h-5" />, section: 'Management' },
  { view: 'admin-moderation', label: 'Moderation Log', icon: <FileText className="w-5 h-5" />, section: 'Management' },
];

const aiNav: NavItem[] = [
  { view: 'ai-matching', label: 'Smart Matching', icon: <Target className="w-5 h-5" />, section: 'AI Engine' },
  { view: 'ai-freshness', label: 'Freshness Meter', icon: <ThermometerSun className="w-5 h-5" />, section: 'AI Engine' },
  { view: 'ai-pricing', label: 'Dynamic Pricing', icon: <DollarSign className="w-5 h-5" />, section: 'AI Engine' },
  { view: 'ai-demand', label: 'Demand Prediction', icon: <TrendingUp className="w-5 h-5" />, section: 'AI Engine' },
  { view: 'ai-copilot', label: 'AI Copilot Chat', icon: <Brain className="w-5 h-5" />, section: 'AI Engine' },
];

const circularNav: NavItem[] = [
  { view: 'circular-marketplace', label: 'Marketplace', icon: <Recycle className="w-5 h-5" />, section: 'Circular' },
  { view: 'circular-my-listings', label: 'My Listings', icon: <Package className="w-5 h-5" />, section: 'Circular' },
  { view: 'circular-history', label: 'History & Impact', icon: <BarChart3 className="w-5 h-5" />, section: 'Circular' },
];

const navMap: Record<UserRole, NavItem[]> = {
  CUSTOMER: customerNav,
  FARMER: farmerNav,
  FISHER: fisherNav,
  DELIVERY: deliveryNav,
  ADMIN: adminNav,
};

const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  CUSTOMER: { label: 'Customer', icon: <Leaf className="w-4 h-4" />, color: 'text-green-700', bg: 'bg-green-100' },
  FARMER: { label: 'Farmer', icon: <Leaf className="w-4 h-4" />, color: 'text-green-700', bg: 'bg-green-100' },
  FISHER: { label: 'Fisher', icon: <Fish className="w-4 h-4" />, color: 'text-blue-700', bg: 'bg-blue-100' },
  DELIVERY: { label: 'Delivery', icon: <Truck className="w-4 h-4" />, color: 'text-orange-700', bg: 'bg-orange-100' },
  ADMIN: { label: 'Admin', icon: <Shield className="w-4 h-4" />, color: 'text-purple-700', bg: 'bg-purple-100' },
};

function SidebarContent() {
  const { user, currentView, setCurrentView, cart, setCartOpen, unreadCount } = useFarmSeaStore();
  if (!user) return null;

  const role = user.role as UserRole;
  const navItems = navMap[role] || [];

  // Add AI nav for FARMER and FISHER
  const allNavItems: NavItem[] = [...navItems];
  if (role === 'FARMER' || role === 'FISHER' || role === 'CUSTOMER') {
    allNavItems.push(...aiNav);
    allNavItems.push(...circularNav);
  }
  if (role === 'ADMIN') {
    allNavItems.push(...aiNav);
    allNavItems.push(...circularNav);
  }

  // Group by section
  const sections: { name: string; items: NavItem[] }[] = [];
  let currentSection = '';
  for (const item of allNavItems) {
    if (item.section && item.section !== currentSection) {
      currentSection = item.section;
      sections.push({ name: item.section, items: [] });
    }
    if (sections.length > 0) {
      sections[sections.length - 1].items.push(item);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Cart button for customers */}
      {role === 'CUSTOMER' && (
        <div className="p-3">
          <Button className="w-full h-11 bg-green-600 hover:bg-green-700 text-white justify-start gap-2 font-semibold"
            onClick={() => setCartOpen(true)}>
            <ShoppingCart className="w-5 h-5" />
            Cart
            {cart.length > 0 && (
              <span className="ml-auto bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">{cart.length}</span>
            )}
          </Button>
        </div>
      )}
      <Separator />
      <ScrollArea className="flex-1 px-3 py-2">
        {sections.map((section, si) => (
          <div key={si} className="mb-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1.5">{section.name}</div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => setCurrentView(item.view)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-green-100 text-green-800'
                        : 'text-muted-foreground hover:bg-gray-100 hover:text-foreground'
                    }`}
                  >
                    <span className={isActive ? 'text-green-600' : ''}>{item.icon}</span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 text-green-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}

export default function Home() {
  const { isLoggedIn, currentRole, currentView, user, logout, sidebarOpen, setSidebarOpen, toggleSidebar, unreadCount, markNotificationRead, notifications, clearNotifications } = useFarmSeaStore();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged out', description: 'See you next time!' });
  };

  // Not logged in
  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  const role = currentRole as UserRole;
  const config = roleConfig[role];

  // Determine which content to render
  const renderContent = () => {
    // Customer views
    if (['customer-browse', 'customer-orders', 'customer-bookings'].includes(currentView)) {
      return <CustomerDashboard />;
    }
    // Farmer views
    if (['farmer-products', 'farmer-orders', 'farmer-bookings', 'farmer-ai', 'farmer-passport'].includes(currentView)) {
      return <FarmerDashboard />;
    }
    // Fisher views
    if (['fisher-products', 'fisher-orders', 'fisher-bookings', 'fisher-ai', 'fisher-passport'].includes(currentView)) {
      return <FisherDashboard />;
    }
    // Delivery views
    if (['delivery-assignments', 'delivery-performance', 'delivery-salary'].includes(currentView)) {
      return <DeliveryDashboard />;
    }
    // Admin views
    if (['admin-analytics', 'admin-users', 'admin-warnings', 'admin-moderation'].includes(currentView)) {
      return <AdminDashboard />;
    }
    // Circular Economy views
    if (['circular-marketplace', 'circular-my-listings', 'circular-history', 'customer-circular'].includes(currentView)) {
      return <CircularEconomy />;
    }
    // AI views
    if (['ai-matching', 'ai-freshness', 'ai-pricing', 'ai-demand', 'ai-copilot', 'customer-ai'].includes(currentView)) {
      return <AIFeatures />;
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-green-100 shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-3">
            <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-green-800 leading-tight">FarmSea Direct AI</h1>
                <p className="text-[10px] text-orange-600 font-medium -mt-0.5 leading-tight">Farmer &amp; Fisher Marketplace</p>
              </div>
            </div>
          </div>

          {/* Right: Role Badge + Notifications + Logout */}
          <div className="flex items-center gap-2">
            <Badge className={`${config.bg} ${config.color} border-0 gap-1 px-3 py-1 text-xs font-semibold`}>
              {config.icon} {config.label}
            </Badge>
            <button
              onClick={() => toast({ title: 'Notifications', description: `${unreadCount()} unread notifications` })}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{unreadCount()}</span>
              )}
            </button>
            <div className="hidden sm:flex items-center gap-2 ml-1 pl-2 border-l">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xs font-bold text-green-700">{user?.name?.charAt(0)}</span>
              </div>
              <span className="text-sm font-medium max-w-[120px] truncate">{user?.name}</span>
            </div>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 px-2"
              onClick={handleLogout}>
              <LogOut className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline text-xs">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Body: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-green-100 bg-green-50/30 overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="p-4 pb-2 border-b">
              <SheetTitle className="flex items-center gap-2 text-green-800">
                <Leaf className="w-5 h-5" /> FarmSea Direct AI
              </SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
