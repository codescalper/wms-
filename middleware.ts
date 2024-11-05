import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { getMenuList } from '@/lib/menu-list';

export function getRouteValue(path: string): string | null {
  const menuList = getMenuList(path);
  for (const group of menuList) {
    for (const menu of group.menus) {
      if (menu.href === path) {
        return menu.value;
      }
      for (const submenu of menu.submenus) {
        if (submenu.href === path) {
          return submenu.value;
        }
      }
    }
  }
  return null;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const path = request.nextUrl.pathname;

  if (path === '/login' || path === '/register') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (path === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  try {
    const decodedToken: any = jwtDecode(token.value);
    const userPermissions = decodedToken.user.Web_MenuAccess.split(',');
    
    const routeValue = getRouteValue(path);

    if (routeValue && !userPermissions.includes(routeValue)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  } catch (error) {
    console.error('Error decoding token or checking permissions:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico|manifest.json).*)']
}
