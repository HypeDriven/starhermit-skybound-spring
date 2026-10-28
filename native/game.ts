// The browser build's pure game modules, imported unchanged (allowJs) and typed
// here with the shapes this client reads: the deterministic rules
// (src/rules.js: the 120 Hz bounce-and-steer simulation, the seeded platform
// generator, chains, glow motes, thorns, goals and terminal reasons), the run
// session (src/session.js RunSession: validated steer commands, periodic
// hashes, the replay envelope and the Practice undo to the last landing), the
// versioned content (src/content.js: five themes, the colour-vision palettes,
// 40 Journey stages, two Challenges, four lessons, the Daily from a UTC date,
// achievements) and the progress model this client stores (src/progress.js).
import * as RulesJs from "../src/rules.js";
import * as SessionJs from "../src/session.js";
import * as ContentJs from "../src/content.js";
import * as ProgressJs from "../src/progress.js";

export type PadType = "bud" | "drift" | "crumb" | "spring" | "wisp" | "thorn";
export interface Platform { id: number; x: number; y: number; w: number; type: PadType; vx: number; alive: boolean; home?: number }
export interface Token { id: number; x: number; y: number; taken: boolean }
export interface Tier {
  key: string; label: string; gravity: number; bounceV: number; steerAccel: number; maxVx: number;
  gapMin: number; gapMax: number; width: number; ratios: Record<string, number>; tokenRate: number;
}
export type Reason = "fell" | "goal-reached" | "move-limit" | "time-out" | "hazard";
export interface Goal { type: "none" | "altitude" | "tokens"; target: number; timeLimitTicks?: number }
export interface Score { altitude: number; chainBonus: number; tokens: number }
export interface State {
  tick: number; dir: number; tier: Tier; tierKey: string;
  player: { x: number; y: number; vx: number; vy: number };
  camY: number; maxY: number; chain: number; lastLandId: number; landings: number;
  score: Score; platforms: Platform[]; tokens: Token[];
  terminal: { reason: Reason; tick: number } | null;
  goal: Goal; moveLimitTicks: number; steerTicksUsed: number; mechanics: PadType[];
}
export type SimEvent =
  | { type: "land" | "spring"; id: number; ptype: PadType; chain: number; y: number }
  | { type: "token"; id: number }
  | { type: "thorn"; id: number }
  | { type: "terminal"; reason: Reason };
export interface RunConfig {
  seed: number; difficulty: string | Tier; goal: Goal; mechanics?: PadType[]; moveLimitTicks?: number; assists?: string[];
}
export interface Command { id: string; tick: number; type: "steer"; dir: number }
export interface Envelope { commands: Command[]; checksum: string; scoreComponents: Score & { total: number } }
export interface RunSession {
  state: State; cfg: RunConfig; ranked: boolean; allowUndo: boolean; finished: boolean; commands: Command[];
  undoStack: string[]; tutorialEvents: (SimEvent & { tick: number; dir: number })[];
  readonly terminal: State["terminal"];
  steer(dir: number): boolean;
  tick(): void;
  undo(): boolean;
  buildEnvelope(): Envelope;
}
export interface Theme {
  key: string; name: string; skyTop: number; skyBottom: number; fog: number; fogNear: number; fogFar: number;
  keyLight: number; hemiSky: number; hemiGround: number; pad: number; padAlt: number; accent: number; cloud: number;
}
export interface Stage {
  id: string; index: number; name: string; seed: number; difficulty: string; goal: Goal; parTicks: number; parSeconds: number;
  mastery: boolean; mechanics: PadType[]; theme: string; tutorial: string | null;
}
export interface Challenge {
  id: string; name: string; type: string; description: string; difficulty: string; goal: Goal; moveLimitTicks?: number; seed: number; theme: string;
}
export interface Daily { id: string; date: string; seed: number; difficulty: string; goal: Goal; theme: string; mechanics: PadType[] }
export interface LessonStep { text: string; check: { event?: string; count?: number; steerDir?: number; ticks?: number } }
export interface Lesson { id: string; name: string; theme: string; difficulty: string; mechanics: PadType[]; seed: number; goal: Goal; steps: LessonStep[] }
export interface Progress {
  stagesCompleted: Record<string, number>; bests: Record<string, number>; achievements: Record<string, number>;
  daysPlayed: string[]; tutorialsDone: string[];
}
export type Palette = "default" | "deuteranopia" | "tritanopia";
export interface GameOptions { leftHanded: boolean; toggleSteer: boolean; cvdPalette: Palette; timingAssist: boolean; captions: boolean }

interface RulesApi {
  TICK_RATE: number; WORLD_WIDTH: number; PLAYER_RADIUS: number; TOKEN_SCORE: number;
  DIFFICULTY: Record<string, Tier>;
  totalScore(s: State): number;
  applyCommand(s: State, cmd: Command): { invalidReason?: string };
  stateHash(s: State): string;
  makeRng(seed: number): { s: number };
  rngNext(r: { s: number }): number;
}
interface SessionApi {
  RunSession: new (cfg: RunConfig, opts: { mode?: string; ranked?: boolean; allowUndo?: boolean; onEvents?: (e: SimEvent[], s: State) => void }) => RunSession;
}
interface ContentApi {
  THEMES: Theme[]; CVD_PALETTES: Record<Palette, Record<PadType | "token", number>>;
  JOURNEY_STAGE_COUNT: number; CHALLENGES: Challenge[]; TUTORIALS: Lesson[];
  ACHIEVEMENTS: { key: string; name: string; description: string }[];
  stageConfig(i: number): Stage;
  allStages(): Stage[];
  dailyConfig(date: string): Daily;
  masteryTrack(p: Progress): { stageId: string; name: string; completed: boolean }[];
}
interface ProgressApi {
  OPTION_KEYS: (keyof GameOptions)[];
  DEFAULT_OPTIONS: GameOptions;
  blank(): Progress;
  normalize(raw: unknown): Progress;
  merge(a: unknown, b: unknown): Progress;
  same(a: unknown, b: unknown): boolean;
  recordResult(p: Progress, mode: string, id: string, score: number, terminal: State["terminal"], today: string): { completed: boolean; isBest: boolean; prevBest: number; best: number };
  evaluateAchievements(p: Progress, run: { completed: boolean; altitude: number; springs: number; maxChain: number; difficulty: string | Tier }, nowMs: number): string[];
  pickOptions(raw: unknown): Partial<GameOptions>;
  readForeign(text: string | null | undefined): Progress | null;
  isLegacyKey(key: string): boolean;
}

export const Rules = RulesJs as unknown as RulesApi;
export const Session = SessionJs as unknown as SessionApi;
export const Content = ContentJs as unknown as ContentApi;
export const Progress = ProgressJs as unknown as ProgressApi;
