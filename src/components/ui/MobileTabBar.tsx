/**
 * MobileTabBar — fixed bottom tab bar for mobile episode navigation.
 *
 * Three tabs: Parameters, Mission, Reference. Each tab shows an icon
 * and a label, with the active tab highlighted in the domain accent.
 */

import './MobileTabBar.css'

export type MobileTab = 'parameters' | 'mission' | 'reference'

export interface MobileTabBarProps {
  readonly activeTab: MobileTab | null
  readonly onTabSelect: (tab: MobileTab) => void
}

const TABS: Array<{ id: MobileTab; label: string; icon: string }> = [
  { id: 'parameters', label: 'Parameters', icon: '\u2699' }, // gear
  { id: 'mission', label: 'Mission', icon: '\u2691' }, // flag
  { id: 'reference', label: 'Reference', icon: '\u2139' }, // info
]

export function MobileTabBar({ activeTab, onTabSelect }: MobileTabBarProps) {
  return (
    <div className="mobile-tab-bar" role="tablist" aria-label="Episode panels">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`mobile-tab-bar__tab${activeTab === tab.id ? ' mobile-tab-bar__tab--active' : ''}`}
          onClick={() => onTabSelect(tab.id)}
        >
          <span className="mobile-tab-bar__icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span className="mobile-tab-bar__label">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
