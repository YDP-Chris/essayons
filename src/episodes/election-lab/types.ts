/**
 * Election Lab — Type definitions for election simulation state.
 */

export type VotingSystem = 'plurality' | 'ranked-choice' | 'approval' | 'proportional'

export interface Candidate {
  id: number
  name: string
  color: string
  position: { x: number; y: number } // Position in 2D political space
  votes: number
  seats: number // For proportional representation
  eliminated: boolean // For ranked choice voting
}

export interface Voter {
  id: number
  preferences: number[] // Ranked list of candidate IDs (most preferred first)
  approvals: boolean[] // For approval voting (indexed by candidate ID)
  position: { x: number; y: number } // Position in 2D political space
  district: number
  votedFor: number | null // Current vote in plurality/approval systems
}

export interface District {
  id: number
  name: string
  voters: number[] // Voter IDs in this district
  winner: number | null // Winning candidate ID
  boundaries: { x: number; y: number }[] // Polygon vertices for rendering
  center: { x: number; y: number }
}

export interface ElectionResult {
  winners: number[] // Winning candidate IDs (can be multiple for proportional)
  totalVotes: number
  candidateVotes: number[] // Votes per candidate (indexed by candidate ID)
  candidateSeats: number[] // Seats per candidate for proportional systems
  spoilerPresent: boolean // Whether a spoiler effect occurred
  condorcetWinner: number | null // Candidate who beats all others pairwise
  majorityWinner: boolean // Whether winner got >50% of votes
  districtResults: Array<{ district: number; winner: number; margin: number }>
}

export interface ElectionState {
  step: number
  votingSystem: VotingSystem
  candidates: Candidate[]
  voters: Voter[]
  districts: District[]
  results: ElectionResult | null

  // Historical data for mission tracking
  previousResults: ElectionResult[]
  initialWinner: number | null
  winnerChangedBySystem: boolean
  winnerChangedByGerrymandering: boolean
  condorcetParadoxExists: boolean

  // Gerrymandering state
  gerrymanderingEnabled: boolean
  originalDistricts: District[] | null

  // Animation state
  ballotsCast: boolean
  countingComplete: boolean
  showResults: boolean
}

export interface ElectionParams {
  'num-voters': number
  'num-candidates': number
  'voting-system': VotingSystem
  'num-districts': number
  'preference-polarization': number
  'enable-gerrymandering': boolean
}
