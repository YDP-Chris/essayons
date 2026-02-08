import './DomainOrbit.css'
import { Icon } from './icons'

const domains = [
  { name: 'Physics', ring: 1, color: '#00d4aa', angle: 0 },
  { name: 'Civics', ring: 1, color: '#e63946', angle: 180 },
  { name: 'Economics', ring: 2, color: '#2a9d8f', angle: 60 },
  { name: 'History', ring: 2, color: '#e9c46a', angle: 240 },
  { name: 'Biology', ring: 3, color: '#8ac926', angle: 90 },
  { name: 'Engineering', ring: 3, color: '#ff6b35', angle: 270 },
] as const

interface DomainNodeProps {
  name: string
  color: string
  angle: number
  radius: number
  ringSpeed: number
}

function DomainNode({ name, color, angle, radius, ringSpeed }: DomainNodeProps) {
  const iconName = name.toLowerCase()
  const style = {
    '--node-angle': `${angle}deg`,
    '--node-radius': `${radius}px`,
    '--node-color': color,
    '--node-animation-duration': `${ringSpeed}s`,
  } as React.CSSProperties

  return (
    <div className="domain-orbit__node" style={style}>
      <Icon name={iconName} size={20} color="white" />
    </div>
  )
}

export function DomainOrbit() {
  return (
    <div className="domain-orbit" aria-hidden="true">
      {/* Center logo */}
      <div className="domain-orbit__center">
        <span className="domain-orbit__logo">E</span>
      </div>

      {/* Ring 1 (inner, 30s clockwise) */}
      <div className="domain-orbit__ring domain-orbit__ring--1">
        {domains
          .filter((d) => d.ring === 1)
          .map((domain) => (
            <DomainNode
              key={domain.name}
              name={domain.name}
              color={domain.color}
              angle={domain.angle}
              radius={100}
              ringSpeed={30}
            />
          ))}
      </div>

      {/* Ring 2 (middle, 45s counter-clockwise) */}
      <div className="domain-orbit__ring domain-orbit__ring--2">
        {domains
          .filter((d) => d.ring === 2)
          .map((domain) => (
            <DomainNode
              key={domain.name}
              name={domain.name}
              color={domain.color}
              angle={domain.angle}
              radius={150}
              ringSpeed={45}
            />
          ))}
      </div>

      {/* Ring 3 (outer, 60s clockwise) */}
      <div className="domain-orbit__ring domain-orbit__ring--3">
        {domains
          .filter((d) => d.ring === 3)
          .map((domain) => (
            <DomainNode
              key={domain.name}
              name={domain.name}
              color={domain.color}
              angle={domain.angle}
              radius={200}
              ringSpeed={60}
            />
          ))}
      </div>
    </div>
  )
}
