import { ActiveFilter, FilterType, FilterValue } from '../../types/NamespaceFilter';
import { AppListItem } from '../../types/AppList';
import { removeDuplicatesArray } from '../../utils/Common';

export namespace AppListFilters {
  export interface SortField {
    id: string;
    title: string;
    isNumeric: boolean;
    param: string;
    compare: (a: AppListItem, b: AppListItem) => number;
  }

  export const sortFields: SortField[] = [
    {
      id: 'namespace',
      title: 'Namespace',
      isNumeric: false,
      param: 'ns',
      compare: (a: AppListItem, b: AppListItem) => {
        let sortValue = a.namespace.localeCompare(b.namespace);
        if (sortValue === 0) {
          sortValue = a.name.localeCompare(b.name);
        }
        return sortValue;
      }
    },
    {
      id: 'appname',
      title: 'App Name',
      isNumeric: false,
      param: 'wn',
      compare: (a: AppListItem, b: AppListItem) => a.name.localeCompare(b.name)
    },
    {
      id: 'istiosidecar',
      title: 'IstioSidecar',
      isNumeric: false,
      param: 'is',
      compare: (a: AppListItem, b: AppListItem) => {
        if (a.istioSidecar && !b.istioSidecar) {
          return -1;
        } else if (!a.istioSidecar && b.istioSidecar) {
          return 1;
        } else {
          return a.name.localeCompare(b.name);
        }
      }
    }
  ];

  const presenceValues: FilterValue[] = [
    {
      id: 'present',
      title: 'Present'
    },
    {
      id: 'notpresent',
      title: 'Not Present'
    }
  ];

  export const appNameFilter: FilterType = {
    id: 'appname',
    title: 'App Name',
    placeholder: 'Filter by App Name',
    filterType: 'text',
    filterValues: []
  };

  export const istioSidecarFilter: FilterType = {
    id: 'istiosidecar',
    title: 'Istio Sidecar',
    placeholder: 'Filter by IstioSidecar Validation',
    filterType: 'select',
    filterValues: presenceValues
  };

  /** Filter Method */

  const filterByName = (items: AppListItem[], names: string[]): AppListItem[] => {
    let result = items;
    result = result.filter(item => {
      let appNameFiltered = true;
      if (names.length > 0) {
        appNameFiltered = false;
        for (let i = 0; i < names.length; i++) {
          if (item.name.includes(names[i])) {
            appNameFiltered = true;
            break;
          }
        }
      }
      return appNameFiltered;
    });
    return result;
  };

  const filterByIstioSidecar = (items: AppListItem[], istioSidecar: boolean): AppListItem[] => {
    return items.filter(item => item.istioSidecar === istioSidecar);
  };

  export const filterBy = (items: AppListItem[], filters: ActiveFilter[]) => {
    let results = items;
    /** Get AppName filter */
    let appNamesSelected: string[] = filters
      .filter(activeFilter => activeFilter.category === 'App Name')
      .map(activeFilter => activeFilter.value);

    /** Remove duplicates  */
    appNamesSelected = removeDuplicatesArray(appNamesSelected);

    /** Get IstioSidecar filter */
    let istioSidecarValidationFilters: ActiveFilter[] = filters.filter(
      activeFilter => activeFilter.category === 'Istio Sidecar'
    );
    let istioSidecar: boolean | undefined = undefined;

    if (istioSidecarValidationFilters.length > 0) {
      istioSidecar = istioSidecarValidationFilters[0].value === 'Present';
      results = filterByIstioSidecar(results, istioSidecar);
    }

    if (appNamesSelected.length > 0) {
      results = filterByName(results, appNamesSelected);
    }
    return results;
  };

  /** Sort Method */

  export const sortAppsItems = (
    unsorted: AppListItem[],
    sortField: AppListFilters.SortField,
    isAscending: boolean
  ): AppListItem[] => {
    return unsorted.sort(isAscending ? sortField.compare : (a, b) => sortField.compare(b, a));
  };
}
