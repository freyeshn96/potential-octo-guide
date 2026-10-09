import { describe, expect, it } from 'vitest'
import { Activity, Fingerprint, Home } from 'lucide-react'
import {
  filterNavigationGroups,
  findNavigationItem,
  itemOrChildIsActive,
} from '@/boilerplate/navigation/navigation'
import type { AppNavigationGroup } from '@/boilerplate/config/app-config'

const resolveLabel = (labelKey: string): string => {
  const labels: Record<string, string> = {
    'groups.main': 'Main',
    'groups.home': 'Home',
    'items.hidden': 'Hidden',
    'items.runtime': 'Runtime',
    'items.providers': 'Providers',
    'items.catalog': 'Catalog',
    'items.sso': 'SSO Config',
    'items.overview': 'Overview',
  }
  return labels[labelKey] ?? labelKey
}

const groups: readonly AppNavigationGroup[] = [
  {
    id: 'main',
    labelKey: 'groups.main',
    order: 1,
    items: [
      {
        to: '/hidden',
        labelKey: 'items.hidden',
        icon: Home,
        order: 0,
        visible: false,
      },
      {
        to: '/runtime',
        labelKey: 'items.runtime',
        icon: Activity,
        order: 1,
        visible: true,
      },
      {
        labelKey: 'items.providers',
        icon: Fingerprint,
        order: 2,
        visible: true,
        children: [
          {
            to: '/providers',
            labelKey: 'items.catalog',
            icon: Fingerprint,
            order: 0,
            visible: true,
          },
          {
            to: '/sso',
            labelKey: 'items.sso',
            icon: Fingerprint,
            order: 1,
            visible: true,
          },
        ],
      },
    ],
  },
  {
    id: 'home',
    labelKey: 'groups.home',
    order: 0,
    items: [
      {
        to: '/',
        labelKey: 'items.overview',
        icon: Home,
        order: 0,
        visible: true,
        exact: true,
      },
    ],
  },
]

describe('filterNavigationGroups', () => {
  it('hides invisible items and empty groups, then sorts by order', () => {
    const result = filterNavigationGroups(groups, '', resolveLabel)
    expect(result.map((group) => group.id)).toEqual(['home', 'main'])
    expect(result[1]?.items.map((item) => item.labelKey)).toEqual([
      'items.runtime',
      'items.providers',
    ])
  })

  it('filters items by label without treating the root path as a prefix', () => {
    const result = filterNavigationGroups(groups, 'over', resolveLabel)
    expect(result).toHaveLength(1)
    expect(result[0]?.items[0]?.labelKey).toBe('items.overview')
  })

  it('keeps a parent group when a nested child matches the query', () => {
    const result = filterNavigationGroups(groups, 'sso', resolveLabel)
    expect(result).toHaveLength(1)
    expect(result[0]?.items[0]?.labelKey).toBe('items.providers')
    expect(result[0]?.items[0]?.children?.map((item) => item.labelKey)).toEqual(
      ['items.sso'],
    )
  })
})

describe('findNavigationItem', () => {
  it('matches the exact root item and longer paths independently', () => {
    expect(findNavigationItem(groups, '/')?.labelKey).toBe('items.overview')
    expect(findNavigationItem(groups, '/runtime')?.labelKey).toBe(
      'items.runtime',
    )
    expect(findNavigationItem(groups, '/sso')?.labelKey).toBe('items.sso')
    expect(findNavigationItem(groups, '/users')).toBeUndefined()
  })
})

describe('itemOrChildIsActive', () => {
  it('treats a parent as active when a nested child matches the path', () => {
    const providers = groups[0]?.items[2]
    expect(providers).toBeDefined()
    if (providers === undefined) {
      return
    }
    expect(itemOrChildIsActive(providers, '/sso')).toBe(true)
    expect(itemOrChildIsActive(providers, '/runtime')).toBe(false)
  })
})
