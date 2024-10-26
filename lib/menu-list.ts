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
          ],
        },
        {
          href: "",
          label: "RM Transaction",
          active: pathname.includes("/heloj"),
          icon: ArrowLeftRight,
          value: "3",
          submenus: [
            {
              href: "/gate-entry-inward",
              label: "Gate Entry Inward",
              active: pathname === "/gate-entry-inward",
              value: "3_1",
            },
            {
              href: "/gate-entry-reversal",
              label: "Gate Entry Reversal",
              active: pathname === "/gate-entry-reversal",
              value: "3_2",
            },
            {
              href: "/create-grn",
              label: "Create GRN",
              active: pathname === "/create-grn",
              value: "3_3",
            },
            {
              href: "/rm-label-printing",
              label: "RM Label Printing",
              active: pathname === "/rm-label-printing",
              value: "3_4",
            },
            {
              href: "/prod-data-upload",
              label: "Production Data Upload",
              active: pathname === "/prod-data-upload",
              value: "3_9",
            },
            {
              href: "/gate-entry-outward",
              label: "Gate Entry Outward",
              active: pathname === "/gate-entry-outward",
              value: "3_5",
            },
            {
              href: "/material-req-assign",
              label: "Material Request & Assign",
              active: pathname === "/material-req-assign",
              value: "3_6",
            },
            {
              href: "/location-label-print",
              label: "Location Label Print",
              active: pathname === "/location-label-print",
              value: "3_7",
            },
            {
              href: "/pallet-label-print",
              label: "Pallet Label Print",
              active: pathname === "/pallet-label-print",
              value: "3_8",
            },
            {
              href: "/fg-track-back",
              label: "FG Track Back",
              active: pathname === "/fg-track-back",
              value: "3_10",
            },
          ],
        },
        {
          href: "",
          label: "FG Transaction",
          active: pathname.includes("/heloj"),
          icon: ArrowLeftRight,
          value: "7",
          submenus: [
            {
              href: "/fg-label-print",
              label: "FG Label Printting Manual",
              active: pathname === "/fg-label-print",
              value: "7_1",
            },
            {
              href: "/fg-mat-req-assign",
              label: "FG Material Req and Assign",
              active: pathname === "/fg-mat-req-assign",
              value: "7_2",
            },
            
          ],
        },
        {
          href: "",
          label: "Re-Print",
          active: pathname.includes("/heloj"),
          icon: Printer,
          value: "4",
          submenus: [
            {
              href: "/re-print-gate-entry-no",
              label: "RePrint Gate Entry No",
              active: pathname === "/re-print-gate-entry-no",
              value: "4_1",
            },
            {
              href: "/re-print-rm-label-printing",
              label: "RePrint-RM Label Printing",
              active: pathname === "/re-print-rm-label-printing",
              value: "4_2",
            },
            {
              href: "/re-print-pallet-barcode",
              label: "Reprint RM Pallet Barcode",
              active: pathname === "/re-print-pallet-barcode",
              value: "4_3",
            },
            {
              href: "/re-print-fg-label-printing",
              label: "Reprint-FG Label Printing",
              active: pathname === "/re-print-fg-label-printing",
              value: "4_4",
            },
          ],
        },
        {
          href: "/categories",
          label: "FG Report",
          active: pathname.includes("/categories"),
          icon: ClipboardMinus,
          value: "8",
          submenus: [
            {
              href: "/rep-fg-label-print",
              label: "FG Label Print Details",
              active: pathname === "/rep-fg-label-print",
              value: "8_1",
            },
            {
              href: "/rep-fg-label-reprint",
              label: "FG Reprint Label Details",
              active: pathname === "/rep-fg-label-reprint",
              value: "8_2",
            },
            {
              href: "/rep-fg-qc-details",
              label: "FG QC Details",
              active: pathname === "/rep-fg-qc-details",
              value: "8_3",
            },
            {
              href: "/rep-fg-inward-details",
              label: "FG Inward Details",
              active: pathname === "/rep-fg-inward-details",
              value: "8_4",
            },
            {
              href: "/rep-fg-put-details",
              label: "FG Put Away",
              active: pathname === "/rep-fg-put-details",
              value: "8_5",
            },
            {
              href: "/rep-fg-int-trans-details",
              label: "FG Internal Transfer",
              active: pathname === "/rep-fg-int-trans-details",
              value: "8_6",
            },
          ],
        },
        {
          href: "/categories",
          label: "RM Report",
          active: pathname.includes("/categories"),
          icon: ClipboardMinus,
          value: "5",
          submenus: [
            {
              href: "/gate-inward-details",
              label: "Gate Inward Details",
              active: pathname === "/gate-inward-details",
              value: "5_1",
            },
            {
              href: "/rep-gate-entry-reversal",
              label: "Gate Inward Reversal",
              active: pathname === "/rep-gate-entry-reversal",
              value: "5_2",
            },
            {
              href: "/rep-create-grn",
              label: "Create GRN Data",
              active: pathname === "/rep-create-grn",
              value: "5_3",
            },
            {
              href: "/rep-create-grn-details",
              label: "Create GRN Details",
              active: pathname === "/rep-create-grn-details",
              value: "5_8",
            },
            {
              href: "/rep-rm-printing",
              label: "RM Label Print Data",
              active: pathname === "/rep-rm-printing",
              value: "5_4",
            },
            {
              href: "/rep-qc-details",
              label: "QC Detials",
              active: pathname === "/rep-qc-details",
              value: "5_9",
            },
            {
              href: "/rep-pallet-details",
              label: "Pallet Details",
              active: pathname === "/rep-pallet-details",
              value: "5_10",
            },
            {
              href: "/rm-inward-details",
              label: "RM Inward Details",
              active: pathname === "/rm-inward-details",
              value: "5_11",
            },
            {
              href: "/rep-rm-put-away",
              label: "RM Put Away",
              active: pathname === "/rep-rm-put-away",
              value: "5_12",
            },
            {
              href: "/rep-internal-movement",
              label: "RM Internal Movement Details",
              active: pathname === "/rep-internal-movement",
              value: "5_13",
            },
            {
              href: "/rep-material-picking",
              label: "RM Picking Details",
              active: pathname === "/rep-material-picking",
              value: "5_14",
            },
            {
              href: "/rep-receipt-details",
              label: "RM Receipt Details",
              active: pathname === "/rep-receipt-details",
              value: "5_15",
            },
            {
              href: "/rep-rm-location-wise-stock",
              label: "RM Location Wise Stock",
              active: pathname === "/rep-rm-location-wise-stock",
              value: "5_16",
            },
            {
              href: "/rep-rm-stock-take",
              label: "RM Stock Take",
              active: pathname === "/rep-rm-stock-take",
              value: "5_17",
            },
            {
              href: "/rep-rm-stock-adjustment",
              label: "RM Stock Adjustment",
              active: pathname === "/rep-rm-stock-adjustment",
              value: "5_18",
            },
            {
              href: "/rep-rm-material-req-assign",
              label: "RM Mat Req & Assign Details",
              active: pathname === "/rep-rm-material-req-assign",
              value: "5_19",
            },
            {
              href: "/gate-outward-details",
              label: "Gate Outward Details",
              active: pathname === "/gate-outward-details",
              value: "5_5",
            },
            {
              href: "/sql-exception",
              label: "Sql Exception",
              active: pathname === "/sql-exception",
              value: "5_6",
            },
            {
              href: "/audit-trail",
              label: "Audit Trail",
              active: pathname === "/audit-trail",
              value: "5_7",
            },
          ],
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
