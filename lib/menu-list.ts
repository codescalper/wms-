import {
  Tag,
  BarChart,
  ArrowLeftRight,
  ClipboardMinus,
  SquarePen,
  Printer,
  Shield,
  LayoutGrid,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
  value: string;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
  value: string;
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: pathname.includes("/dashboard"),
          icon: LayoutGrid,
          submenus: [],
          value: "1",
        },
      ],
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "",
          label: "Master",
          active: pathname.includes("/heloj"),
          icon: SquarePen,
          value: "2",
          submenus: [
            {
              href: "/company-master",
              label: "Company Master",
              active: pathname === "/company-master",
              value: "2_1",
            },
            {
              href: "/plant-master",
              label: "Plant Master",
              active: pathname === "/plant-master",
              value: "2_2",
            },
            {
              href: "/uom-master",
              label: "UOM Master",
              active: pathname === "/uom-master",
              value: "2_8",
            },
            {
              href: "/warehouse-category-master",
              label: "WH Category Master",
              active: pathname === "/warehouse-category-master",
              value: "2_3",
            },
            {
              href: "/warehouse-master",
              label: "Warehouse Master",
              active: pathname === "/warehouse-master",
              value: "2_4",
            },
            {
              href: "/warehouse-location-master",
              label: "WH Location Master",
              active: pathname === "/warehouse-location-master",
              value: "2_5",
            },
            {
              href: "/material-master",
              label: "Material Master",
              active: pathname === "/material-master",
              value: "2_6",
            },
            {
              href: "/line-master",
              label: "Line Master",
              active: pathname === "/line-master",
              value: "2_7",
            },
            {
              href: "/pallet-master",
              label: "Pallet Master",
              active: pathname === "/pallet-master",
              value: "2_8",
            },
            {
              href: "/printer-master",
              label: "Printer Master",
              active: pathname === "/printer-master",
              value: "2_9",
            },
          
          ],
        },
        {
          href: "",
          label: "Transaction",
          active: pathname.includes("/heloj"),
          icon: ArrowLeftRight,
          value: "3",
          submenus: [{
            href: "/gate-entry-inward",
            label: "Gate Entry Inward",
            active: pathname === "/gate-entry-inward",
            value: "3_1",
          },],
        },
      
        {
          href: "",
          label: "Re-Print",
          active: pathname.includes("/heloj"),
          icon: Printer,
          value: "4",
          submenus: [],
        },
        {
          href: "/categories",
          label: "Reports",
          active: pathname.includes("/categories"),
          icon: ClipboardMinus,
          value: "5",
          submenus: [],
        },
        {
          href: "/tags",
          label: "Administrator",
          active: pathname.includes("/tags"),
          icon: Shield,
          value: "6",
          submenus: [
            {
              href: "/user-master",
              label: "User Master",
              active: pathname === "/user-master",
              value: "6_1",
            },
            {
              href: "/user-role-master",
              label: "User Role Master",
              active: pathname === "/user-role-master",
              value: "6_2",
            },
            {
              href: "/change-password",
              label: "Change Password",
              active: pathname === "/change-password",
              value: "6_3",
            },
            {
              href: "/android-access",
              label: "Android access",
              active: pathname === "/android-access",
              value: "6_4",
            },
          ],
        },
      ],
    },
  ];
}
