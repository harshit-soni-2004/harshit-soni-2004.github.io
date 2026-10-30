import type { SpaceObjectEntry } from './types';

/**
 * Interactive objects in the 3D background. Add an entry to add an object; `type` picks the model
 * (station, saucer, ball, rocket, delorean, falcon, walle or milano), everything else is per-entry. Set `enabled: false` to hide one.
 */
export const spaceObjects: SpaceObjectEntry[] = [
  {
    id: 'endurance',
    label: 'Endurance-ish',
    type: 'station',
    color: 'cyan',
    size: 1.15,
    start: [-0.72, 0.5, 13],
    driftSpeed: 0.8,
    tooltipTitle: 'ring-station.sys',
    tooltipText:
      'A ring of twelve modules around a central hub, loosely inspired by the Endurance from Interstellar. Click it to spin it up.',
    enabled: true,
  },
  {
    id: 'cruiser',
    label: 'Portal cruiser',
    type: 'saucer',
    color: 'green',
    size: 1,
    start: [0.74, 0.42, 11],
    driftSpeed: 1,
    tooltipTitle: 'cruiser.exe',
    tooltipText:
      'Rick’s space cruiser from Rick and Morty: a cobbled-together saucer with an open two-seat cockpit under a glass bubble, swept tail fins, twin thrusters, headlights and a bent antenna. Click it for a barrel roll.',
    enabled: true,
  },
  {
    id: 'football',
    label: 'Pass it!',
    type: 'ball',
    color: 'magenta',
    size: 0.7,
    start: [0.62, -0.55, 9],
    driftSpeed: 1.2,
    tooltipTitle: 'off-screen.md',
    tooltipText:
      'When I’m not at a keyboard, I’m on a pitch. I play for the DJ Sanghvi college team and in the MFA second division, and grew up playing inter-school tournaments. Football taught me the same things good engineering teams run on: communication, positioning and covering for each other. Click the ball to take a shot.',
    enabled: true,
  },
  {
    id: 'mav',
    label: 'Ares MAV',
    type: 'rocket',
    color: 'amber',
    size: 0.95,
    start: [-0.86, -0.5, 12],
    driftSpeed: 0.7,
    tooltipTitle: 'ares-iv-mav.log',
    tooltipText:
      'The Mars Ascent Vehicle from The Martian: a tall faceted capsule on four splayed landing legs. Click it for a main-engine burn. "I\'m going to have to science the s**t out of this."',
    enabled: true,
  },
  {
    id: 'delorean',
    label: 'DeLorean',
    type: 'delorean',
    color: 'cyan',
    size: 0.95,
    start: [-0.3, 0.82, 14],
    driftSpeed: 0.9,
    tooltipTitle: 'flux-capacitor.cfg',
    tooltipText:
      'The DeLorean time machine from Back to the Future Part II, in flight mode: gull-wing doors open, wheels folded flat, Mr. Fusion on the back. Click it to hit 88 mph and leave two trails of fire.',
    enabled: true,
  },
  {
    id: 'falcon',
    label: 'Millennium Falcon',
    type: 'falcon',
    color: 'cyan',
    size: 1.1,
    start: [0.88, -0.08, 15],
    driftSpeed: 0.6,
    tooltipTitle: 'kessel-run.txt',
    tooltipText:
      'The Millennium Falcon from Star Wars: saucer hull with the cargo slot between its forward mandibles, radial hull plating, quad-laser turrets top and bottom, the cockpit off the starboard side and the sensor dish. Click it to punch it to lightspeed.',
    enabled: true,
  },
  {
    id: 'walle',
    label: 'WALL-E',
    type: 'walle',
    color: 'amber',
    size: 0.85,
    start: [-0.88, 0.02, 10],
    driftSpeed: 1.1,
    tooltipTitle: 'directive.txt',
    tooltipText:
      'WALL-E, the trash-compacting robot: box body, triangular treads and binocular eyes on a neck. Click him and he looks around.',
    enabled: true,
  },
  {
    id: 'milano',
    label: 'Milano',
    type: 'milano',
    color: 'magenta',
    size: 1,
    start: [0.32, -0.82, 13],
    driftSpeed: 0.9,
    tooltipTitle: 'awesome-mix-vol1.m3u',
    tooltipText:
      'The Milano from Guardians of the Galaxy: forward-swept wings and canards, bubble canopy and twin engines. Click it for a barrel roll.',
    enabled: true,
  },
];
