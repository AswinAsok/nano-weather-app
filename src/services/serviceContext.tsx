import { createContext, useContext, type ReactNode } from "react";
import type { ServiceContainer } from "./contracts";
import { defaultServices } from "./index";

const ServiceContext = createContext<ServiceContainer>(defaultServices);

export function ServiceProvider({
    services = defaultServices,
    children,
}: {
    services?: ServiceContainer;
    children: ReactNode;
}) {
    return <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>;
}

export function useServices(): ServiceContainer {
    return useContext(ServiceContext);
}
