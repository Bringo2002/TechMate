import React, { createContext, useContext } from "react";

interface DashboardSearchContextValue {
    searchQuery: string;
}

const DashboardSearchContext = createContext<DashboardSearchContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useDashboardSearch = (): DashboardSearchContextValue => {

    const ctx = useContext(DashboardSearchContext);
    if (!ctx) {
        throw new Error("useDashboardSearch must be used within a DashboardSearchProvider");
    }
    return ctx;
};

export const DashboardSearchProvider = ({
    searchQuery,
    children,
}: {
    searchQuery: string;
    children: React.ReactNode;
}) => {
    return (
        <DashboardSearchContext.Provider value={{ searchQuery }}>
            {children}
        </DashboardSearchContext.Provider>
    );
};

