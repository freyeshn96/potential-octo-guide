import { describe, expect, it } from 'vitest'
import { Activity, Home } from 'lucide-react'
import {
  filterNavigationGroups,
  findNavigationItem,
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
    expect(result[1]?.items.map((item) => item.label)).toEqual(['Runtime'])
  })

  it('filters items by label without treating the root path as a prefix', () => {
    const result = filterNavigationGroups(groups, 'over')
    expect(result).toHaveLength(1)
    expect(result[0]?.items[0]?.label).toBe('Overview')
  })
})

describe('findNavigationItem', () => {
  it('matches the exact root item and longer paths independently', () => {
    expect(findNavigationItem(groups, '/')?.label).toBe('Overview')
    expect(findNavigationItem(groups, '/runtime')?.label).toBe('Runtime')
    expect(findNavigationItem(groups, '/users')).toBeUndefined()
  })
})
