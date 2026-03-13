import { Outlet } from "react-router";
import { BottomTabBar } from "./BottomTabBar";

export function TabLayout() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <BottomTabBar />
    </div>
  );
}
