import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: '📊'
  },
  {
    label: 'Products',
    href: '/products',
    icon: '💎',
    subItems: [
      { label: 'Add Gem Stone', href: '/products/add', icon: '➕' },
      { label: 'Collections', href: '/products/collections', icon: '📁' }
    ]
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: '📦'
  },
  {
    label: 'Sales',
    href: '/sales',
    icon: '🔨'
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: '👥'
  },
  {
    label: 'Media',
    href: '/media',
    icon: '🖼️'
  },
  {
    label: 'Settings',
    href: '/settings/users',
    icon: '⚙️',
    // subItems: [
    //   { label: 'General', href: '/settings/general', icon: '🔧' },
    //   { label: 'Security', href: '/settings/security', icon: '🔒' },
    //   { label: 'Users', href: '/settings/users', icon: '👥' },
    //   { label: 'Shipping', href: '/settings/shipping', icon: '🚚' },
    //   { label: 'NFT & Blockchain', href: '/settings/nft', icon: '🔗' },
    //   { label: 'API & Web3', href: '/settings/api', icon: '🌐' },
    //   { label: 'Domains', href: '/settings/domains', icon: '🌍' },
    //   { label: 'Notifications', href: '/settings/notifications', icon: '🔔' },
    //   { label: 'Policies', href: '/settings/policies', icon: '📜' }
    // ]
  }
];

const Sidebar: FC = () => {
  const router = useRouter();

  const isActive = (href: string) => router.pathname === href;
  const isParentActive = (item: NavItem) => {
    if (router.pathname === item.href) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => router.pathname === subItem.href);
    }
    return false;
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">💎</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">Sapphire Swap</h1>
            <p className="text-sm text-gray-500">Gem Bidder</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-400 mb-2">MAIN</p>
          <nav>
            {navItems.map((item, index) => (
              <div key={index}>
                <Link 
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-1 ${
                    isParentActive(item) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
                {item.subItems && (
                  <div className="ml-8">
                    {item.subItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-sm ${
                          isActive(subItem.href) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          <div>
            <p className="font-medium">Riz Moh</p>
            <p className="text-sm text-gray-500">riz@sapphireswap.lk</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 