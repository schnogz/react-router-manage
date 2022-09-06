import React, { useLayoutEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import NameRedirect from './components/NameRedirect';
import type { BeforeEachMountI, BeforeEnterI, NextOptionsType, RouteTypeI } from './type';

import { useRouter } from './index';
import { isComponent, isString } from './util';
import { changeable } from './changeable';

function getComponent (options?: NextOptionsType, Component?: React.ComponentType) {
  let ReplaceComponent: React.ComponentType<any> | undefined;
  if (!options) {
    return ReplaceComponent;
  }
  // if a component is passed in
  if (isComponent(options)) {
    ReplaceComponent = options;
  } else if (isString(options.path)) { // if there is path, path is preferred
    ReplaceComponent = function Redirect () {
      return <Navigate to={options.path!} />;
    };
  } else if (isString(options.name)) { // ff there is no path, use name
    ReplaceComponent = function Redirect () {
      return <NameRedirect name={options.name!} component={Component} />;
    };
  }
  return ReplaceComponent;
}

export const GeneratorHookCom: React.FC<{
  beforeEnter?: BeforeEnterI
  beforeEachMount?: BeforeEachMountI
  Component: any
  _route: RouteTypeI
}> = ({ beforeEnter, Component, beforeEachMount }) => {
  /**
     * since setCurrentComponent(Component) Component may be a function
     * react by default, if the preState is a function, the function will be executed and an error will occur
     * So here we put Component into an object
     */
  const [CurrentComponent, setCurrentComponent] = useState<{ Component: any }>({
    Component: undefined,
  });
  const { currentRoute } = useRouter();
  useLayoutEffect(() => {
    // 是否激活状态(未卸载)
    let isActive = true;
    // 全局的
    if (beforeEachMount) {
      beforeEachMount(currentRoute, options => {
        if (!isActive) {
          return;
        }

        // global
        const EachReplaceComponent = getComponent(options, Component);
        if (beforeEnter) {
          // local
          beforeEnter(currentRoute, enterOptions => {
            if (!isActive) {
              return;
            }
            const EnterReplaceComponent = getComponent(enterOptions, EachReplaceComponent || Component);
            // if the Component is passed in next in beforeEnter, the beforeEnter shall prevail

            // Otherwise, beforeEachBeforeMount shall prevail
            setCurrentComponent({ Component: EnterReplaceComponent || EachReplaceComponent || Component });
          });
        } else {
          setCurrentComponent({ Component: EachReplaceComponent || Component });
        }
      });
    } else {
      // local
      if (beforeEnter) {
        beforeEnter(currentRoute, enterOptions => {
          if (!isActive) {
            return;
          }
          const EnterReplaceComponent = getComponent(enterOptions, Component);
          setCurrentComponent({
            Component: EnterReplaceComponent || Component,
          });
        });
      }
    }
    return () => {
      isActive = false;
    };
  }, [Component, currentRoute, beforeEnter, beforeEachMount]);
  const LoadingCmp = changeable.LoadingComponent;
  return CurrentComponent.Component ? <CurrentComponent.Component /> : <LoadingCmp/>;
};

export default GeneratorHookCom;
