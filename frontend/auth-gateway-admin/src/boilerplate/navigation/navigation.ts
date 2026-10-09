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
  if (item.to === '/') {
    return pathname === '/'
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
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
      items: [...group.items]
        .filter((item) => itemMatchesQuery(item, query))
        .sort((left, right) => left.order - right.order),
    }))
    .filter((group) => group.items.length > 0)
}

export function findNavigationItem(
  groups: readonly AppNavigationGroup[],
  pathname: string,
): AppNavigationItem | undefined {
  const visibleItems = groups.flatMap((group) =>
    group.items.filter((item) => item.visible),
  )
  const exactMatch = visibleItems.find(
    (item) => item.exact === true && item.to === pathname,
  )
  if (exactMatch) {
    return exactMatch
  }
  return [...visibleItems]
    .filter((item) => item.exact !== true && itemMatchesPath(item, pathname))
    .sort((left, right) => right.to.length - left.to.length)[0]
}
