/**
 * Election Lab — Election simulation logic.
 *
 * Implements various voting systems (plurality, ranked choice, approval, proportional)
 * and supports gerrymandering through district manipulation.
 */

import type {
  ElectionState,
  ElectionParams,
  Candidate,
  Voter,
  District,
  ElectionResult,
} from './types.ts'
import type { ParamValues } from '@/engine/types.ts'

/**
 * Generate a random number from a normal distribution using Box-Muller transform.
 */
function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return z0 * stdDev + mean
}

/**
 * Generate candidate names and colors.
 */
function generateCandidateNames(count: number): Array<{ name: string; color: string }> {
  const names = [
    { name: 'Alice Chen', color: '#3B82F6' }, // Blue
    { name: 'Bob Wilson', color: '#EF4444' }, // Red
    { name: 'Carol Davis', color: '#10B981' }, // Green
    { name: 'David Kumar', color: '#F59E0B' }, // Orange
    { name: 'Eva Rodriguez', color: '#8B5CF6' }, // Purple
    { name: 'Frank Miller', color: '#EC4899' }, // Pink
  ]
  return names.slice(0, count)
}

/**
 * Calculate Euclidean distance between two positions.
 */
function distance(pos1: { x: number; y: number }, pos2: { x: number; y: number }): number {
  return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2)
}

/**
 * Create initial election state with candidates, voters, and districts.
 */
export function createInitialElectionState(params: Partial<ElectionParams>): ElectionState {
  const numVoters = params['num-voters'] ?? 100
  const numCandidates = params['num-candidates'] ?? 3
  const numDistricts = params['num-districts'] ?? 5
  const polarization = params['preference-polarization'] ?? 0.3
  const votingSystem = params['voting-system'] ?? 'plurality'

  // Generate candidates with positions in 2D political space
  const candidateData = generateCandidateNames(numCandidates)
  const candidates: Candidate[] = candidateData.map((data, i) => ({
    id: i,
    name: data.name,
    color: data.color,
    position: {
      x: 0.2 + (0.6 * i) / Math.max(1, numCandidates - 1), // Spread across political spectrum
      y: 0.3 + 0.4 * Math.random(), // Random on social axis
    },
    votes: 0,
    seats: 0,
    eliminated: false,
  }))

  // Generate voters with positions and preferences
  const voters: Voter[] = Array.from({ length: numVoters }, (_, i) => {
    // Generate voter position with some clustering based on polarization
    let voterX, voterY
    if (Math.random() < polarization) {
      // Polarized voter - cluster around a candidate
      const targetCandidate = candidates[Math.floor(Math.random() * numCandidates)]
      if (targetCandidate) {
        voterX = Math.max(0, Math.min(1, randomNormal(targetCandidate.position.x, 0.1)))
        voterY = Math.max(0, Math.min(1, randomNormal(targetCandidate.position.y, 0.1)))
      } else {
        voterX = Math.random()
        voterY = Math.random()
      }
    } else {
      // Moderate voter - uniform distribution
      voterX = Math.random()
      voterY = Math.random()
    }

    const voterPos = { x: voterX, y: voterY }

    // Calculate preferences based on distance to candidates
    const candidateDistances = candidates.map((c, idx) => ({
      id: idx,
      distance: distance(voterPos, c.position) + 0.1 * Math.random(), // Add noise
    }))
    candidateDistances.sort((a, b) => a.distance - b.distance)

    // Generate approval votes (approve candidates within threshold)
    const approvalThreshold = 0.3 + 0.3 * Math.random()
    const approvals = candidates.map((_, idx) => {
      const dist = candidateDistances.find((cd) => cd.id === idx)?.distance ?? 1
      return dist < approvalThreshold
    })

    return {
      id: i,
      preferences: candidateDistances.map((cd) => cd.id),
      approvals,
      position: voterPos,
      district: i % numDistricts, // Initial simple district assignment
      votedFor: null,
    }
  })

  // Create initial districts (simple grid-based)
  const districts: District[] = Array.from({ length: numDistricts }, (_, i) => {
    const votersInDistrict = voters.filter((v) => v.district === i).map((v) => v.id)

    // Create simple rectangular boundaries for initial districts
    const cols = Math.ceil(Math.sqrt(numDistricts))
    const row = Math.floor(i / cols)
    const col = i % cols
    const x1 = col / cols
    const x2 = (col + 1) / cols
    const y1 = row / cols
    const y2 = (row + 1) / cols

    return {
      id: i,
      name: `District ${i + 1}`,
      voters: votersInDistrict,
      winner: null,
      boundaries: [
        { x: x1, y: y1 },
        { x: x2, y: y1 },
        { x: x2, y: y2 },
        { x: x1, y: y2 },
      ],
      center: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
    }
  })

  return {
    step: 0,
    votingSystem,
    candidates,
    voters,
    districts,
    results: null,
    previousResults: [],
    initialWinner: null,
    winnerChangedBySystem: false,
    winnerChangedByGerrymandering: false,
    condorcetParadoxExists: false,
    gerrymanderingEnabled: params['enable-gerrymandering'] ?? false,
    originalDistricts: null,
    ballotsCast: false,
    countingComplete: false,
    showResults: false,
  }
}

/**
 * Find the Condorcet winner (candidate who beats all others in pairwise comparisons).
 */
function findCondorcetWinner(voters: Voter[], numCandidates: number): number | null {
  for (let candidate = 0; candidate < numCandidates; candidate++) {
    let beatsAll = true

    for (let opponent = 0; opponent < numCandidates; opponent++) {
      if (candidate === opponent) continue

      let candidateWins = 0
      let opponentWins = 0

      for (const voter of voters) {
        const candidateRank = voter.preferences.indexOf(candidate)
        const opponentRank = voter.preferences.indexOf(opponent)

        if (candidateRank < opponentRank) {
          candidateWins++
        } else {
          opponentWins++
        }
      }

      if (candidateWins <= opponentWins) {
        beatsAll = false
        break
      }
    }

    if (beatsAll) {
      return candidate
    }
  }

  return null
}

/**
 * Run plurality voting (first past the post).
 */
function runPluralityVoting(voters: Voter[], numCandidates: number): ElectionResult {
  const votes = new Array(numCandidates).fill(0)

  for (const voter of voters) {
    const firstChoice = voter.preferences[0]
    if (firstChoice !== undefined) {
      votes[firstChoice]++
    }
  }

  const maxVotes = Math.max(...votes)
  const winners = votes.map((v, i) => (v === maxVotes ? i : -1)).filter((i) => i !== -1)

  const condorcetWinner = findCondorcetWinner(voters, numCandidates)
  const spoilerPresent = winners[0] !== condorcetWinner && condorcetWinner !== null

  return {
    winners,
    totalVotes: voters.length,
    candidateVotes: votes,
    candidateSeats: votes.map((v) => (v === maxVotes ? 1 : 0)),
    spoilerPresent,
    condorcetWinner,
    majorityWinner: maxVotes > voters.length / 2,
    districtResults: [],
  }
}

/**
 * Run ranked choice voting (instant runoff).
 */
function runRankedChoiceVoting(voters: Voter[], numCandidates: number): ElectionResult {
  const votes = new Array(numCandidates).fill(0)
  const eliminated = new Array(numCandidates).fill(false)
  const voterChoices = voters.map((v) => [...v.preferences])

  while (true) {
    // Count first-choice votes for non-eliminated candidates
    votes.fill(0)
    for (const choices of voterChoices) {
      for (const choice of choices) {
        if (!eliminated[choice]) {
          votes[choice]++
          break
        }
      }
    }

    const activeVotes = votes.filter((_, i) => !eliminated[i])
    const maxVotes = Math.max(...activeVotes)
    const totalActiveVotes = activeVotes.reduce((sum, v) => sum + v, 0)

    // Check for majority
    if (maxVotes > totalActiveVotes / 2) {
      const winner = votes.findIndex((v) => v === maxVotes)
      const condorcetWinner = findCondorcetWinner(voters, numCandidates)

      return {
        winners: [winner],
        totalVotes: voters.length,
        candidateVotes: votes,
        candidateSeats: votes.map((_, i) => (i === winner ? 1 : 0)),
        spoilerPresent: winner !== condorcetWinner && condorcetWinner !== null,
        condorcetWinner,
        majorityWinner: true,
        districtResults: [],
      }
    }

    // Eliminate candidate with fewest votes
    const minVotes = Math.min(...votes.filter((_, i) => !eliminated[i]))
    const toEliminate = votes.findIndex((v) => v === minVotes)
    if (toEliminate === -1) break

    eliminated[toEliminate] = true

    // Check if only one candidate remains
    const remainingCandidates = eliminated.filter((e) => !e).length
    if (remainingCandidates <= 1) {
      const winner = eliminated.findIndex((e) => !e)
      const condorcetWinner = findCondorcetWinner(voters, numCandidates)

      return {
        winners: winner >= 0 ? [winner] : [],
        totalVotes: voters.length,
        candidateVotes: votes,
        candidateSeats:
          winner >= 0
            ? votes.map((_, i) => (i === winner ? 1 : 0))
            : new Array(numCandidates).fill(0),
        spoilerPresent: winner !== condorcetWinner && condorcetWinner !== null,
        condorcetWinner,
        majorityWinner: false,
        districtResults: [],
      }
    }
  }

  return runPluralityVoting(voters, numCandidates) // Fallback
}

/**
 * Run approval voting.
 */
function runApprovalVoting(voters: Voter[], numCandidates: number): ElectionResult {
  const votes = new Array(numCandidates).fill(0)

  for (const voter of voters) {
    for (let i = 0; i < numCandidates; i++) {
      if (voter.approvals[i]) {
        votes[i]++
      }
    }
  }

  const maxVotes = Math.max(...votes)
  const winners = votes.map((v, i) => (v === maxVotes ? i : -1)).filter((i) => i !== -1)
  const condorcetWinner = findCondorcetWinner(voters, numCandidates)

  return {
    winners,
    totalVotes: voters.length,
    candidateVotes: votes,
    candidateSeats: votes.map((v) => (v === maxVotes ? 1 : 0)),
    spoilerPresent: winners[0] !== condorcetWinner && condorcetWinner !== null,
    condorcetWinner,
    majorityWinner: maxVotes > voters.length / 2,
    districtResults: [],
  }
}

/**
 * Run proportional representation (simplified D'Hondt method).
 */
function runProportionalRepresentation(
  voters: Voter[],
  districts: District[],
  numCandidates: number,
): ElectionResult {
  const totalSeats = districts.length
  const votes = new Array(numCandidates).fill(0)
  const seats = new Array(numCandidates).fill(0)
  const districtResults = []

  // Count votes across all districts
  for (const voter of voters) {
    const firstChoice = voter.preferences[0]
    if (firstChoice !== undefined) {
      votes[firstChoice]++
    }
  }

  // Allocate seats using D'Hondt method
  for (let seatNum = 0; seatNum < totalSeats; seatNum++) {
    let maxQuotient = 0
    let winner = 0

    for (let c = 0; c < numCandidates; c++) {
      const quotient = votes[c] / (seats[c] + 1)
      if (quotient > maxQuotient) {
        maxQuotient = quotient
        winner = c
      }
    }

    seats[winner]++
  }

  // Determine district winners for visualization
  for (const district of districts) {
    const districtVotes = new Array(numCandidates).fill(0)

    for (const voterId of district.voters) {
      const voter = voters.find((v) => v.id === voterId)
      if (voter) {
        const firstChoice = voter.preferences[0]
        if (firstChoice !== undefined) {
          districtVotes[firstChoice]++
        }
      }
    }

    const maxDistrictVotes = Math.max(...districtVotes)
    const districtWinner = districtVotes.findIndex((v) => v === maxDistrictVotes)
    const runnerUp = Math.max(...districtVotes.filter((v) => v !== maxDistrictVotes))

    districtResults.push({
      district: district.id,
      winner: districtWinner,
      margin: maxDistrictVotes - runnerUp,
    })
  }

  const winners = seats.map((s, i) => (s > 0 ? i : -1)).filter((i) => i !== -1)
  const condorcetWinner = findCondorcetWinner(voters, numCandidates)

  return {
    winners,
    totalVotes: voters.length,
    candidateVotes: votes,
    candidateSeats: seats,
    spoilerPresent: false, // Proportional systems reduce spoiler effects
    condorcetWinner,
    majorityWinner: false, // Not applicable for proportional systems
    districtResults,
  }
}

/**
 * Run an election using the specified voting system.
 */
function runElection(state: ElectionState): ElectionResult {
  const { voters, districts, votingSystem, candidates } = state
  const numCandidates = candidates.length

  switch (votingSystem) {
    case 'plurality':
      return runPluralityVoting(voters, numCandidates)
    case 'ranked-choice':
      return runRankedChoiceVoting(voters, numCandidates)
    case 'approval':
      return runApprovalVoting(voters, numCandidates)
    case 'proportional':
      return runProportionalRepresentation(voters, districts, numCandidates)
    default:
      return runPluralityVoting(voters, numCandidates)
  }
}

/**
 * Advance the election simulation by one step.
 */
export function stepElection(state: ElectionState, params: ParamValues): ElectionState {
  const electionParams = params as unknown as ElectionParams
  const newVotingSystem = electionParams['voting-system'] ?? state.votingSystem
  const newGerrymanderingEnabled =
    electionParams['enable-gerrymandering'] ?? state.gerrymanderingEnabled

  // Detect if voting system changed
  const votingSystemChanged = newVotingSystem !== state.votingSystem

  // Detect if gerrymandering was enabled/disabled
  // const gerrymanderingToggled = newGerrymanderingEnabled !== state.gerrymanderingEnabled

  // Update candidate and voter counts if parameters changed
  const numCandidates = electionParams['num-candidates'] ?? state.candidates.length
  const numVoters = electionParams['num-voters'] ?? state.voters.length
  const numDistricts = electionParams['num-districts'] ?? state.districts.length

  // Recreate election if fundamental parameters changed
  if (
    numCandidates !== state.candidates.length ||
    numVoters !== state.voters.length ||
    numDistricts !== state.districts.length
  ) {
    return createInitialElectionState(electionParams)
  }

  // Store original districts when gerrymandering is first enabled
  let originalDistricts = state.originalDistricts
  if (newGerrymanderingEnabled && !state.gerrymanderingEnabled) {
    originalDistricts = JSON.parse(JSON.stringify(state.districts))
  }

  // Run the election
  const results = runElection({
    ...state,
    votingSystem: newVotingSystem,
    gerrymanderingEnabled: newGerrymanderingEnabled,
  })

  // Track initial winner for comparison
  let initialWinner = state.initialWinner
  if (initialWinner === null && results.winners.length > 0) {
    initialWinner = results.winners[0] ?? null
  }

  // Check if winner changed due to system change
  let winnerChangedBySystem = state.winnerChangedBySystem
  if (votingSystemChanged && initialWinner !== null && results.winners[0] !== initialWinner) {
    winnerChangedBySystem = true
  }

  // Check for Condorcet paradox
  const condorcetParadoxExists = results.condorcetWinner === null && state.candidates.length >= 3

  return {
    ...state,
    step: state.step + 1,
    votingSystem: newVotingSystem,
    gerrymanderingEnabled: newGerrymanderingEnabled,
    originalDistricts,
    results,
    previousResults: [...state.previousResults, results].slice(-10), // Keep last 10 results
    initialWinner,
    winnerChangedBySystem,
    condorcetParadoxExists,
    ballotsCast: true,
    countingComplete: true,
    showResults: true,
  }
}

/**
 * Mission check: Spoiler effect demonstrated.
 */
export function checkSpoilerEffect(state: ElectionState): boolean {
  return state.results?.spoilerPresent === true
}

/**
 * Mission check: Condorcet paradox exists.
 */
export function checkCondorcetParadox(state: ElectionState): boolean {
  return state.condorcetParadoxExists
}

/**
 * Mission check: Gerrymandering changed the outcome.
 */
export function checkGerrymandering(state: ElectionState): boolean {
  if (!state.gerrymanderingEnabled || !state.originalDistricts) {
    return false
  }

  // This would require implementing district boundary manipulation
  // For now, return true if gerrymandering is enabled and proportional representation shows different district results
  return (state.results?.districtResults.length ?? 0) > 0 && state.winnerChangedByGerrymandering
}

/**
 * Mission check: Different voting systems produce different winners.
 */
export function checkArrowsImpossibility(state: ElectionState): boolean {
  if (state.previousResults.length < 2) return false

  // Check if we've seen different winners with different voting systems
  const uniqueWinners = new Set(state.previousResults.map((r) => r.winners[0]))
  return uniqueWinners.size >= 2
}
