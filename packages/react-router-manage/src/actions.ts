import type { RouteTypeI, MRouterStateI } from "./type";
import { cloneRoutes } from "./util";

/**
 * add routes operation
 * @param state MRouterStateI
 * @param payload RouteTypeI[]
 * @returns MRouterStateI
 */
export function addRoutesAction(
  state: MRouterStateI,
  payload: any
): MRouterStateI {
  let hasChange = false;
  const newRoutes = payload as RouteTypeI[];
  newRoutes.forEach(_route => {
    const { path, name, parentName } = _route;
    if (state.routesMap[path] || state.routesMap[name]) {
      throw new Error(`新增路由 ${name} ${path} 已经存在，请修改`);
    }
    if (parentName) {
      const parentRoute = state.routesMap[parentName];
      const _parentRoute = parentRoute?._route;
      if (_parentRoute) {
        const route = cloneRoutes({
          routes: [_route],
          parent: _parentRoute,
          _level: _parentRoute._level! + 1
        });
        _parentRoute.items = _parentRoute.items || [];
        _parentRoute.items.push(route[0]);
        hasChange = true;
      }
    } else {
      // 根路径插入
      const route = cloneRoutes({
        routes: [_route],
        _level: 0
      });
      state.inputRoutes.push(route[0]);
      hasChange = true;
    }
  });
  if (hasChange) {
    return {
      ...state,
      inputRoutes: [...state.inputRoutes]
    };
  }
  return state;
}
/**
 * update routes operation
 * @param state MRouterStateI
 * @param payload RouteTypeI[]
 * @returns MRouterStateI
 */
export function updateRoutesAction(
  state: MRouterStateI,
  payload: any
): MRouterStateI {
  let hasChange = false;
  // const { basename } = state;
  const newRoutesPayload = payload as {
    routeName: string;
    routeData: Partial<RouteTypeI>;
  }[];
  newRoutesPayload.forEach(({ routeName, routeData }) => {
    const route = state.routesMap[routeName]?._route;
    if (route) {
      // 如果parent存在，则不是根节点
      const parent = route.parent;

      const _newRouteData = {
        ...route,
        ...routeData
      };

      const newRouteData = cloneRoutes({
        routes: [_newRouteData],
        parent,
        _level: (parent?._level || 0) + 1,
        basename: state.basename
      });

      if (!parent) {
        Object.assign(route, newRouteData[0]);
        hasChange = true;
      }
      if (parent && parent.items) {
        parent.items.splice(parent.items.indexOf(route), 1, newRouteData[0]);
        hasChange = true;
      } else if (parent && parent.children) {
        parent.children.splice(
          parent.children.indexOf(route),
          1,
          newRouteData[0]
        );
        hasChange = true;
      }
    }
  });
 
  if (hasChange) {
    return {
      ...state,
      inputRoutes: [...state.inputRoutes]
    };
  }
  return state;
}
/**
 * remove routes operation
 * @param state MRouterStateI
 * @param payload RouteTypeI[]
 * @returns MRouterStateI
 */
export function removeRoutesAction(
  state: MRouterStateI,
  payload: any
): MRouterStateI {
  let hasChange = false;
  const routeNames = payload as string[];
  routeNames.forEach(routeName => {
    const route = state.routesMap[routeName];
    const _route = route?._route;
    if (_route) {
      // 如果parent存在，则不是根节点
      const parent = _route.parent;
      if (!parent) {
        const index = state.inputRoutes.indexOf(_route);
        if (index > -1) {
          state.inputRoutes.splice(state.inputRoutes.indexOf(_route), 1);
          hasChange = true;
        }
      }
      if (parent && parent.items) {
        const index = parent.items.indexOf(_route);
        if (index > -1) {
          parent.items.splice(parent.items.indexOf(_route), 1);
          hasChange = true;
        }
      }
    }
  });
  if (hasChange) {
    return {
      ...state,
      inputRoutes: [...state.inputRoutes]
    };
  } else {
    return state;
  }
}
