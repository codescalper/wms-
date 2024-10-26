"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from "jwt-decode"
import Cookies from 'js-cookie'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { getMenuList } from '@/lib/menu-list'
import { CircleDot, Dot } from 'lucide-react'

type DecodedToken = {
  user: {
    Web_MenuAccess: string;
  };
}

type MenuItem = {
  href: string;
  label: string;
  value: string;
  icon?: React.ElementType;
  submenus?: MenuItem[];
}

export default function CommandPalette(): JSX.Element {
  const [open, setOpen] = useState<boolean>(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    const token = Cookies.get('token'); 
    if (token) {
      const decodedToken = jwtDecode(token) as DecodedToken;
      const userPermissions = decodedToken.user.Web_MenuAccess.split(',');
      const allMenus = getMenuList(window.location.pathname);
  
      const filteredMenus = allMenus.flatMap((group: { menus: any[] }) =>
        group.menus.flatMap(menu =>
          [
            ...(userPermissions.includes(menu.value) ? [{ ...menu, href: menu.href || '#' }] : []),
            ...(menu.submenus?.filter((submenu: { value: string }) => userPermissions.includes(submenu.value)) || [])
          ]
        )
      );
  
      setMenuItems(filteredMenus);
    }
  }, [Cookies.get('token')]); 

  const handleSelect = (item: MenuItem) => {
    setOpen(false)
    router.push(item.href)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search for module..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Menu">
          {menuItems.map((item) => (
            <CommandItem key={item.value} onSelect={() => handleSelect(item)}>
              <Dot className="mr-2 h-4 w-4"  />
              {/* {item.icon && <item.icon />} */}
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}