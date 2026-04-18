"use client";

import { createContext, useContext, useState } from "react";

interface ActionCountContextValue {
  actionCount: number;
  setActionCount: (n: number) => void;
}

const ActionCountContext = createContext<ActionCountContextValue>({
  actionCount: 0,
  setActionCount: () => {},
});

export function ActionCountProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [actionCount, setActionCount] = useState(0);
  return (
    <ActionCountContext.Provider value={{ actionCount, setActionCount }}>
      {children}
    </ActionCountContext.Provider>
  );
}

export const useActionCount = () => useContext(ActionCountContext);
