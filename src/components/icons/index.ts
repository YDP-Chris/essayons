// Export base components
export { Icon } from './Icon'
export { registerIcon } from './icon-registry'
export type { IconProps } from './Icon'

// Export domain icons
export { PhysicsIcon } from './domains/PhysicsIcon'
export { CivicsIcon } from './domains/CivicsIcon'
export { EconomicsIcon } from './domains/EconomicsIcon'
export { HistoryIcon } from './domains/HistoryIcon'
export { BiologyIcon } from './domains/BiologyIcon'
export { EngineeringIcon } from './domains/EngineeringIcon'

// Export UI icons
export { PlayIcon } from './ui/PlayIcon'
export { PauseIcon } from './ui/PauseIcon'
export { ResetIcon } from './ui/ResetIcon'
export { ShareIcon } from './ui/ShareIcon'
export { CloseIcon } from './ui/CloseIcon'
export { ChevronIcon } from './ui/ChevronIcon'
export { CheckIcon } from './ui/CheckIcon'
export { HintIcon } from './ui/HintIcon'
export { RelaunchIcon } from './ui/RelaunchIcon'

// Auto-register all icons
import { registerIcon } from './icon-registry'
import { PhysicsIcon } from './domains/PhysicsIcon'
import { CivicsIcon } from './domains/CivicsIcon'
import { EconomicsIcon } from './domains/EconomicsIcon'
import { HistoryIcon } from './domains/HistoryIcon'
import { BiologyIcon } from './domains/BiologyIcon'
import { EngineeringIcon } from './domains/EngineeringIcon'
import { PlayIcon } from './ui/PlayIcon'
import { PauseIcon } from './ui/PauseIcon'
import { ResetIcon } from './ui/ResetIcon'
import { ShareIcon } from './ui/ShareIcon'
import { CloseIcon } from './ui/CloseIcon'
import { ChevronIcon } from './ui/ChevronIcon'
import { CheckIcon } from './ui/CheckIcon'
import { HintIcon } from './ui/HintIcon'
import { RelaunchIcon } from './ui/RelaunchIcon'

// Register domain icons
registerIcon('physics', PhysicsIcon)
registerIcon('civics', CivicsIcon)
registerIcon('economics', EconomicsIcon)
registerIcon('history', HistoryIcon)
registerIcon('biology', BiologyIcon)
registerIcon('engineering', EngineeringIcon)

// Register UI icons
registerIcon('play', PlayIcon)
registerIcon('pause', PauseIcon)
registerIcon('reset', ResetIcon)
registerIcon('share', ShareIcon)
registerIcon('close', CloseIcon)
registerIcon('chevron', ChevronIcon)
registerIcon('check', CheckIcon)
registerIcon('hint', HintIcon)
registerIcon('relaunch', RelaunchIcon)
