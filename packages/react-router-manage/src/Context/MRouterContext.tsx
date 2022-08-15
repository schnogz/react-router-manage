import React from 'react';
import { addRoutesAction, removeRoutesAction, updateRoutesAction } from '../actions';
import type {
  Action,
  AddRoutesI,
  RoutesMapInterface,
  UpdateRoutesI,
  MRouterContextObject,
  YSRouterStateI
} from '../type';
import {
  RouterActionEnum
} from '../type';

const MRouterContext = React.createContext<MRouterContextObject>({
  state: {
    inputRoutes: [],
    authInputRoutes: [],
    permissionList: [],
    routesMap: {} as RoutesMapInterface,
    flattenRoutes: [],
  },
  methods: {},
} as unknown as MRouterContextObject);
MRouterContext.displayName = 'MRouterContext';

export function MRouterReducer (state: YSRouterStateI, action: Action): YSRouterStateI {
  const { type, payload } = action;
  switch (type) {
    case RouterActionEnum.ADD_ROUTES: {
      return addRoutesAction(state, payload);
    }
    case RouterActionEnum.REMOVE_ROUTES: {
      return removeRoutesAction(state, payload);
    }
    case RouterActionEnum.UPDATE_ROUTES: {
      return updateRoutesAction(state, payload);
    }
    case RouterActionEnum.UPDATE_INPUT_ROUTES: {
      return {
        ...state,
        inputRoutes: payload,
      };
    }
    case RouterActionEnum.UPDATE_CURRENT_ROUTE: {
      return {
        ...state,
        currentRoute: payload,
      };
    }
    case RouterActionEnum.UPDATE_STATE: {
      return {
        ...state,
        ...payload,
      };
    }
    default: {
      return { ...state };
    }
  }
}

export function useRouterState (): YSRouterStateI {
  return React.useContext(MRouterContext).state;
}

/** 动态添加路由方法 */
export function useAddRoutes (): AddRoutesI {
  return React.useContext(MRouterContext).methods.addRoutes;
}

export function useRemoveRoutes (): (routeNames: string[]) => void {
  return React.useContext(MRouterContext).methods.removeRoutes;
}

export function useUpdateRoutes (): UpdateRoutesI {
  return React.useContext(MRouterContext).methods.updateRoutes;
}

export default MRouterContext;
