'use client';

import { usePathname } from 'next/navigation';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProfile = pathname.startsWith('/profile');
  const isCreate = pathname.startsWith('/create');
  const isExplore = pathname.startsWith('/explore');
  const isSettings = pathname.startsWith('/settings');
  const isArticle = pathname.startsWith('/article');

  const isNotifications = pathname === '/notifications';
  const isMessages = pathname === '/messages';
  const isHome = pathname === '/';

  const showCondensedLayout = isProfile || isCreate || isExplore || isSettings || isArticle;
  const hasMobileHeader = isNotifications || isMessages || isHome;

  return (
    <main 
      className={`main-content ${showCondensedLayout ? 'no-top-padding' : ''} ${hasMobileHeader ? 'has-mobile-header' : ''}`} 
      id="main-content"
    >
      <div className="animate-page-enter page-wrapper" key={pathname}>
        {children}
      </div>
    </main>
  );
}
