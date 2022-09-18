import * as React from "react";
import { useMemo } from "react";
import { unstable_batchedUpdates } from "react-dom";
import type { BrowserRouterProps, Location } from "react-router-dom";
import { Router } from "react-router-dom";
import type { BrowserHistory } from "@remix-run/router";
import { createBrowserHistory } from "@remix-run/router";
import type { RouteCbI, RouteHistoryObject } from "./type";
import MRouterHistoryContext from "./Context/MRouterHistoryContext";

/**
 * A `<Router>` for use in web browsers. Provides the cleanest URLs.
 */
export default function BrowserRouter({
  basename,
  children,
  syncUpdateCurrentRoute
}: BrowserRouterProps & {
  syncUpdateCurrentRoute: (location: Location) => void;
}) {
  const historyRef = React.useRef<BrowserHistory>(null!);
  const routeHooksRef = React.useRef<RouteCbI[]>(null!);
  if (historyRef.current == null) {
    historyRef.current = createBrowserHistory({ window, v5Compat: true });
    routeHooksRef.current = [];
  }

  const historyContext = useMemo(() => {
    return {
      history: historyRef.current as BrowserHistory,
      routeHooks: routeHooksRef.current as RouteCbI[],
      routeHooksRef,
      historyMethods: {
        push: historyRef.current.push,
        replace: historyRef.current.replace,
        go: historyRef.current.go
      }
    } as RouteHistoryObject;
  }, []);

  const history = historyRef.current;

  const [state, setState] = React.useState({
    action: history.action,
    location: history.location
  });

  React.useLayoutEffect(() => {
    let mounted = true;
    const removeListenFn = history.listen(routeData => {
      const { location } = routeData;
      if (!mounted) {
        return;
      }
      unstable_batchedUpdates(() => {
        setState(routeData);
        syncUpdateCurrentRoute(location);
      });
    });
    return () => {
      mounted = false;
      removeListenFn();
    };
  }, [history, syncUpdateCurrentRoute]);
  return (
    <MRouterHistoryContext.Provider value={historyContext}>
      <Router
        basename={basename}
        location={state.location}
        navigationType={state.action}
        navigator={history}
      >
        {children}
      </Router>
    </MRouterHistoryContext.Provider>
  );
}
