import {
  LuLayoutGrid,
  LuArrowLeftRight,
  LuBrain,
  LuSettings,
  LuHandCoins,
  LuCreditCard,
} from "react-icons/lu";

export const SIDE_MENU_DATA = [
  {
    id: "01",
    label: "Dashboard",
    icon: LuLayoutGrid,
    path: "/dashboard",
  },
  {
    id: "02",
    label: "Transactions",
    icon: LuArrowLeftRight,
    path: "/transactions",
  },
  {
    id: "03",
    label: "Udhaar",
    icon: LuHandCoins,
    path: "/udhaar",
  },
  {
    id: "04",
    label: "AI Insights",
    icon: LuBrain,
    path: "/ai-insights",
  },
  {
    id: "05",
    label: "Subscription",
    icon: LuCreditCard,
    path: "/subscription",
  },
  {
    id: "06",
    label: "Settings",
    icon: LuSettings,
    path: "/settings",
  },
];
