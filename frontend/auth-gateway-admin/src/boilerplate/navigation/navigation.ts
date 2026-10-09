import type {
  AppNavigationGroup,
  AppNavigationItem,
} from '@/boilerplate/config/app-config'

function itemMatchesQuery(item: AppNavigationItem, query: string): boolean {
  if (!item.visible) {
    return false
  }
  if (query.length === 0) {
    return true
  }
  return item.label.toLowerCase().includes(query)
}

function itemMatchesPath(item: AppNavigationItem, pathname: string): boolean {
  if (item.to === undefined) {
    return false
  }
  if (item.to === '/') {
    return pathname === '/'
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

function sortItems(items: readonly AppNavigationItem[]): AppNavigationItem[] {
  return [...items].sort((left, right) => left.order - right.order)
}

function includeItem(
  item: AppNavigationItem,
  query: string,
): AppNavigationItem | undefined {
  if (!item.visible) {
    return undefined
  }
  const matchingChildren = item.children
    ? filterItems(item.children, query)
    : undefined
  if (query.length === 0 || itemMatchesQuery(item, query)) {
    return {
      ...item,
      children: item.children
        ? sortItems(item.children.filter((child) => child.visible))
        : undefined,
    }
  }
  if (matchingChildren !== undefined && matchingChildren.length > 0) {
    return { ...item, children: matchingChildren }
  }
  return undefined
}

function filterItems(
  items: readonly AppNavigationItem[],
  query: string,
): AppNavigationItem[] {
  return sortItems(items)
    .map((item) => includeItem(item, query))
    .filter((item): item is AppNavigationItem => item !== undefined)
}

export function filterNavigationGroups(
  groups: readonly AppNavigationGroup[],
  rawQuery: string,
): AppNavigationGroup[] {
  const query = rawQuery.trim().toLowerCase()
  return [...groups]
    .sort((left, right) => left.order - right.order)
    .map((group) => ({
      ...group,
      items: filterItems(group.items, query),
    }))
    .filter((group) => group.items.length > 0)
}

function flattenItems(
  items: readonly AppNavigationItem[],
): AppNavigationItem[] {
  return items.flatMap((item) => {
    const nested = item.children ? flattenItems(item.children) : []
    return [item, ...nested]
  })
}

export function findNavigationItem(
  groups: readonly AppNavigationGroup[],
  pathname: string,
): AppNavigationItem | undefined {
  const visibleItems = flattenItems(
    groups.flatMap((group) => group.items),
  ).filter((item) => item.visible && item.to !== undefined)
  const exactMatch = visibleItems.find(
    (item) => item.exact === true && item.to === pathname,
  )
  if (exactMatch) {
    return exactMatch
  }
  return [...visibleItems]
    .filter((item) => item.exact !== true && itemMatchesPath(item, pathname))
    .sort((left, right) => (right.to?.length ?? 0) - (left.to?.length ?? 0))[0]
}

export function itemOrChildIsActive(
  item: AppNavigationItem,
  pathname: string,
): boolean {
  if (itemMatchesPath(item, pathname)) {
    return true
  }
  return (
    item.children?.some((child) => itemOrChildIsActive(child, pathname)) ===
    true
  )
}
