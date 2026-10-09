import { describe, expect, it } from 'vitest'
import { Activity, Fingerprint, Home } from 'lucide-react'
import {
  filterNavigationGroups,
  findNavigationItem,
  itemOrChildIsActive,
} from '@/boilerplate/navigation/navigation'
import type { AppNavigationGroup } from '@/boilerplate/config/app-config'

const groups: readonly AppNavigationGroup[] = [
  {
    id: 'main',
    label: 'Main',
    order: 1,
    items: [
      {
        to: '/hidden',
        label: 'Hidden',
        icon: Home,
        order: 0,
        visible: false,
      },
      {
        to: '/runtime',
        label: 'Runtime',
        icon: Activity,
        order: 1,
        visible: true,
      },
      {
        label: 'Providers',
        icon: Fingerprint,
        order: 2,
        visible: true,
        children: [
          {
            to: '/providers',
            label: 'Catalog',
            icon: Fingerprint,
            order: 0,
            visible: true,
          },
          {
            to: '/sso',
            label: 'SSO Config',
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
    label: 'Home',
    order: 0,
    items: [
      {
        to: '/',
        label: 'Overview',
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
    const result = filterNavigationGroups(groups, '')
    expect(result.map((group) => group.id)).toEqual(['home', 'main'])
    expect(result[1]?.items.map((item) => item.label)).toEqual([
      'Runtime',
      'Providers',
    ])
  })

  it('filters items by label without treating the root path as a prefix', () => {
    const result = filterNavigationGroups(groups, 'over')
    expect(result).toHaveLength(1)
    expect(result[0]?.items[0]?.label).toBe('Overview')
  })

  it('keeps a parent group when a nested child matches the query', () => {
    const result = filterNavigationGroups(groups, 'sso')
    expect(result).toHaveLength(1)
    expect(result[0]?.items[0]?.label).toBe('Providers')
    expect(result[0]?.items[0]?.children?.map((item) => item.label)).toEqual([
      'SSO Config',
    ])
  })
})

describe('findNavigationItem', () => {
  it('matches the exact root item and longer paths independently', () => {
    expect(findNavigationItem(groups, '/')?.label).toBe('Overview')
    expect(findNavigationItem(groups, '/runtime')?.label).toBe('Runtime')
    expect(findNavigationItem(groups, '/sso')?.label).toBe('SSO Config')
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
