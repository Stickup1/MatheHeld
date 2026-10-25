import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Compass,
  Download,
  Flame,
  Home,
  Lightbulb,
  LockKeyhole,
  Plus,
  Printer,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Upload,
  Users,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import './App.css'

type TopicId = 'numbers' | 'fractions' | 'measures' | 'geometry'
type Page = 'home' | 'topics' | 'badges' | 'mission'

interface Topic {
  id: TopicId
  name: string
  place: string
  description: string
  color: string
  icon: LucideIcon
}

interface MathTask {
  id: string
  topicId: TopicId
  prompt: string
  answer: number | string
  hint: string
  explanation: string
}

interface Activity {
  date: string
  topicId: TopicId
  correct: number
  total: number
}

interface Profile {
  id: string
  name: string
  createdAt: string
  xp: number
  completedMissions: number
  correctAnswers: number
  totalAnswers: number
  topicProgress: Record<TopicId, number>
  earnedBadges: string[]
  activity: Activity[]
}

interface Mission {
  profileId: string
  topicId: TopicId
  tasks: MathTask[]
}

interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: LucideIcon
}

const DB_NAME = 'matheheld-local'
const DB_VERSION = 1
const PROFILE_STORE = 'profiles'
const META_STORE = 'meta'
const INDEXED_DB_AVAILABLE = typeof indexedDB !== 'undefined'
const STORAGE_UNAVAILABLE_MESSAGE = 'Dieser Browser unterstützt IndexedDB nicht. Fortschritt bleibt nur bis zum Schließen dieses Tabs erhalten.'

function currentTimestamp(): string {
  return new Date().toISOString()
}

const TOPICS: Topic[] = [
  {
    id: 'numbers',
    name: 'Zahlenstadt',
    place: 'Einsatzgebiet 01',
    description: 'Rechnen, schätzen und clevere Zahlen knacken.',
    color: 'orange',
    icon: Zap,
  },
  {
    id: 'fractions',
    name: 'Bruchgebirge',
    place: 'Einsatzgebiet 02',
    description: 'Teile entdecken und Brüche vergleichen.',
    color: 'yellow',
    icon: Compass,
  },
  {
    id: 'measures',
    name: 'Einheitenhafen',
    place: 'Einsatzgebiet 03',
    description: 'Zeit, Länge und Gewicht sicher umwandeln.',
    color: 'blue',
    icon: Target,
  },
  {
    id: 'geometry',
    name: 'Geometrie-Akademie',
    place: 'Einsatzgebiet 04',
    description: 'Formen untersuchen und Umfänge berechnen.',
    color: 'green',
    icon: Shield,
  },
]

const BADGES: BadgeDefinition[] = [
  {
    id: 'first-mission',
    name: 'Erster Einsatz',
    description: 'Schließe deine erste Mission ab.',
    icon: Shield,
  },
  {
    id: 'topic-three',
    name: 'Gebietskenner',
    description: 'Schließe drei Missionen in einem Gebiet ab.',
    icon: Compass,
  },
  {
    id: 'five-missions',
    name: 'Dranbleiber',
    description: 'Schließe fünf Missionen ab.',
    icon: Flame,
  },
  {
    id: 'perfect-mission',
    name: 'Sternenrunde',
    description: 'Löse alle Aufgaben einer Mission richtig.',
    icon: Star,
  },
]

const STARTER_TASKS: MathTask[] = [
  {
    id: 'starter-1',
    topicId: 'numbers',
    prompt: 'Berechne 248 + 176.',
    answer: 424,
    hint: 'Rechne erst die Hunderter und dann die Zehner und Einer.',
    explanation: '248 + 100 = 348. Danach 76 addieren: 348 + 76 = 424.',
  },
  {
    id: 'starter-2',
    topicId: 'numbers',
    prompt: 'Wie viel ist 700 − 284?',
    answer: 416,
    hint: 'Rechne in zwei Schritten: erst 700 − 200, dann den Rest.',
    explanation: '700 − 200 = 500 und 500 − 84 = 416.',
  },
  {
    id: 'starter-3',
    topicId: 'numbers',
    prompt: 'Ein Team sammelt 18 Punkte pro Runde. Wie viele Punkte sind das nach 7 Runden?',
    answer: 126,
    hint: 'Das ist eine Multiplikation: 18 · 7.',
    explanation: '18 · 7 = 10 · 7 + 8 · 7 = 70 + 56 = 126.',
  },
  {
    id: 'starter-4',
    topicId: 'numbers',
    prompt: '648 Energiemarken werden gleichmäßig auf 8 Kisten verteilt. Wie viele kommen in jede Kiste?',
    answer: 81,
    hint: 'Prüfe deine Division mit der Gegenrechnung 81 · 8.',
    explanation: '648 : 8 = 81, denn 80 · 8 = 640 und 1 · 8 = 8.',
  },
  {
    id: 'starter-5',
    topicId: 'numbers',
    prompt: 'In jeder von 6 Kisten liegen 24 Lichtsteine. Wie viele Lichtsteine gibt es insgesamt?',
    answer: 144,
    hint: 'Sechs gleiche Gruppen bedeuten: 6 · 24.',
    explanation: '6 · 24 = 6 · 20 + 6 · 4 = 120 + 24 = 144.',
  },
]

function randomInt(minimum: number, maximum: number): number {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum
}

function task(
  topicId: TopicId,
  prompt: string,
  answer: number | string,
  hint: string,
  explanation: string,
): MathTask {
  return {
    id: `${topicId}-${Math.random().toString(36).slice(2, 9)}`,
    topicId,
    prompt,
    answer,
    hint,
    explanation,
  }
}

type TaskTemplate = (difficulty: number) => MathTask

const TASK_TEMPLATES: Record<TopicId, TaskTemplate[]> = {
  numbers: [
    () => {
      const first = randomInt(135, 680)
      const second = randomInt(122, 418)
      return task('numbers', `Berechne ${first} + ${second}.`, first + second, 'Addiere zuerst die Hunderter, dann Zehner und Einer.', `${first} + ${second} = ${first + second}.`)
    },
    () => {
      const first = randomInt(650, 1200)
      const second = randomInt(125, first - 1)
      return task('numbers', `Wie viel ist ${first} − ${second}?`, first - second, 'Ziehe den zweiten Wert schrittweise ab.', `${first} − ${second} = ${first - second}.`)
    },
    (difficulty) => {
      const first = randomInt(14 + difficulty * 3, 32 + difficulty * 5)
      const second = randomInt(3, 9)
      const tens = Math.floor(first / 10) * 10
      const ones = first % 10
      return task('numbers', `Berechne ${first} · ${second}.`, first * second, 'Zerlege die größere Zahl in Zehner und Einer.', `${first} · ${second} = ${tens} · ${second} + ${ones} · ${second} = ${first * second}.`)
    },
    (difficulty) => {
      const divisor = randomInt(3, 9)
      const quotient = randomInt(18 + difficulty * 4, 70 + difficulty * 8)
      const dividend = divisor * quotient
      return task('numbers', `Berechne ${dividend} : ${divisor}.`, quotient, 'Nutze die Umkehraufgabe: Welche Zahl mal dem Teiler ergibt die Zahl?', `${dividend} : ${divisor} = ${quotient}, denn ${quotient} · ${divisor} = ${dividend}.`)
    },
    () => {
      const boxes = randomInt(4, 12)
      const count = randomInt(18, 36)
      return task('numbers', `In ${boxes} Kisten liegen jeweils ${count} Energiesteine. Wie viele sind es zusammen?`, boxes * count, 'Gleiche Gruppen rechnest du mit einer Multiplikation.', `${boxes} · ${count} = ${boxes * count} Energiesteine.`)
    },
  ],
  fractions: [
    () => {
      const denominator = [4, 5, 8, 10][randomInt(0, 3)]
      const numerator = randomInt(1, denominator - 1)
      const total = denominator * randomInt(4, 12)
      return task('fractions', `Wie viel sind ${numerator}/${denominator} von ${total}?`, (total / denominator) * numerator, 'Teile zuerst durch den Nenner. Multipliziere danach mit dem Zähler.', `${total} : ${denominator} = ${total / denominator}. Dann ${total / denominator} · ${numerator} = ${(total / denominator) * numerator}.`)
    },
    () => task('fractions', 'Welcher Bruch ist größer: 3/4 oder 2/3?', '3/4', 'Vergleiche beide Brüche mit dem gemeinsamen Nenner 12.', '3/4 = 9/12 und 2/3 = 8/12. Deshalb ist 3/4 größer.'),
    () => {
      const denominator = [3, 4, 5][randomInt(0, 2)]
      const numerator = randomInt(1, denominator - 1)
      const factor = randomInt(3, 5)
      return task('fractions', `Ergänze den gleichwertigen Bruch: ${numerator}/${denominator} = ?/${denominator * factor}`, numerator * factor, 'Zähler und Nenner werden mit derselben Zahl multipliziert.', `Der Nenner wurde mit ${factor} multipliziert. Also gilt auch ${numerator} · ${factor} = ${numerator * factor}.`)
    },
    () => {
      const denominator = [6, 8, 10][randomInt(0, 2)]
      const first = randomInt(1, Math.floor(denominator / 2))
      const second = randomInt(1, denominator - first - 1)
      return task('fractions', `Berechne ${first}/${denominator} + ${second}/${denominator}.`, `${first + second}/${denominator}`, 'Bei gleichem Nenner addierst du die Zähler.', `Der Nenner bleibt ${denominator}. ${first} + ${second} = ${first + second}, also ${first + second}/${denominator}.`)
    },
    () => {
      const numerator = randomInt(1, 3)
      const denominator = numerator + randomInt(1, 3)
      const factor = randomInt(2, 4)
      return task('fractions', `Kürze den Bruch ${numerator * factor}/${denominator * factor}.`, `${numerator}/${denominator}`, 'Teile Zähler und Nenner durch denselben gemeinsamen Teiler.', `Zähler und Nenner lassen sich durch ${factor} teilen: ${numerator * factor}/${denominator * factor} = ${numerator}/${denominator}.`)
    },
  ],
  measures: [
    () => {
      const meters = randomInt(2, 8)
      const centimeters = randomInt(10, 95)
      return task('measures', `Wie viele Zentimeter sind ${meters} m ${centimeters} cm?`, meters * 100 + centimeters, 'Ein Meter sind 100 Zentimeter.', `${meters} m = ${meters * 100} cm. Zusammen sind es ${meters * 100 + centimeters} cm.`)
    },
    () => {
      const hours = randomInt(1, 4)
      const minutes = [15, 20, 30, 40, 45][randomInt(0, 4)]
      return task('measures', `Wie viele Minuten sind ${hours} h ${minutes} min?`, hours * 60 + minutes, 'Eine Stunde hat 60 Minuten.', `${hours} · 60 + ${minutes} = ${hours * 60 + minutes} Minuten.`)
    },
    () => {
      const kilograms = randomInt(1, 5)
      const grams = randomInt(1, 9) * 100
      return task('measures', `Wie viele Gramm sind ${kilograms} kg ${grams} g?`, kilograms * 1000 + grams, 'Ein Kilogramm sind 1.000 Gramm.', `${kilograms} kg = ${kilograms * 1000} g. Zusammen sind es ${kilograms * 1000 + grams} g.`)
    },
    () => {
      const bottles = randomInt(3, 9)
      return task('measures', `Eine Flasche enthält 250 ml. Wie viele Milliliter sind in ${bottles} Flaschen?`, bottles * 250, 'Multipliziere die Menge einer Flasche mit der Anzahl der Flaschen.', `${bottles} · 250 ml = ${bottles * 250} ml.`)
    },
    () => {
      const days = randomInt(2, 5)
      const hours = randomInt(1, 20)
      return task('measures', `Wie viele Stunden sind ${days} Tage und ${hours} Stunden?`, days * 24 + hours, 'Ein Tag hat 24 Stunden.', `${days} · 24 + ${hours} = ${days * 24 + hours} Stunden.`)
    },
  ],
  geometry: [
    () => {
      const side = randomInt(4, 16)
      return task('geometry', `Ein Quadrat hat eine Seitenlänge von ${side} cm. Wie groß ist sein Umfang?`, side * 4, 'Ein Quadrat hat vier gleich lange Seiten.', `Der Umfang ist 4 · ${side} cm = ${side * 4} cm.`)
    },
    () => {
      const first = randomInt(5, 18)
      const second = randomInt(3, 12)
      return task('geometry', `Ein Rechteck ist ${first} cm lang und ${second} cm breit. Berechne den Umfang.`, 2 * (first + second), 'Addiere Länge und Breite und verdopple die Summe.', `2 · (${first} + ${second}) cm = ${2 * (first + second)} cm.`)
    },
    () => {
      const length = randomInt(7, 18)
      const width = randomInt(4, 11)
      const perimeter = 2 * (length + width)
      return task('geometry', `Ein Rechteck hat einen Umfang von ${perimeter} cm und ist ${length} cm lang. Wie breit ist es?`, width, 'Halbiere zuerst den Umfang. Ziehe dann die bekannte Länge ab.', `${perimeter} : 2 = ${length + width}. Dann ${length + width} − ${length} = ${width} cm.`)
    },
    () => {
      const first = randomInt(5, 12)
      const second = randomInt(5, 12)
      const third = randomInt(Math.max(3, Math.abs(first - second) + 1), first + second - 1)
      return task('geometry', `Ein Dreieck hat Seiten von ${first} cm, ${second} cm und ${third} cm. Wie groß ist sein Umfang?`, first + second + third, 'Addiere die Längen aller drei Seiten.', `${first} + ${second} + ${third} = ${first + second + third} cm.`)
    },
    () => {
      const side = randomInt(6, 20)
      const perimeter = side * 4
      return task('geometry', `Ein quadratischer Platz hat einen Umfang von ${perimeter} m. Wie lang ist eine Seite?`, side, 'Teile den Umfang durch die vier gleich langen Seiten.', `${perimeter} : 4 = ${side} m.`)
    },
  ],
}

function createMission(topicId: TopicId, missionsCompleted: number, recentActivity: Activity[] = []): MathTask[] {
  if (topicId === 'numbers' && missionsCompleted === 0) return STARTER_TASKS
  const recentTopicActivity = recentActivity.filter((activity) => activity.topicId === topicId).slice(-3)
  const recentAnswers = recentTopicActivity.reduce((sum, activity) => sum + activity.total, 0)
  const recentCorrect = recentTopicActivity.reduce((sum, activity) => sum + activity.correct, 0)
  const performanceAdjustment = recentAnswers === 0 ? 0 : recentCorrect / recentAnswers >= 0.85 ? 1 : recentCorrect / recentAnswers < 0.5 ? -1 : 0
  const difficulty = Math.max(0, Math.min(3, Math.floor(missionsCompleted / 2) + performanceAdjustment))
  return TASK_TEMPLATES[topicId].map((template) => template(difficulty))
}

function makeProfile(name: string): Profile {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `profile-${Date.now()}-${Math.random()}`,
    name: name.trim(),
    createdAt: new Date().toISOString(),
    xp: 0,
    completedMissions: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    topicProgress: { numbers: 0, fractions: 0, measures: 0, geometry: 0 },
    earnedBadges: [],
    activity: [],
  }
}

function readDatabase(db: IDBDatabase): Promise<{ profiles: Profile[]; activeId: string | null }> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROFILE_STORE, META_STORE], 'readonly')
    const profilesRequest = transaction.objectStore(PROFILE_STORE).getAll()
    const activeRequest = transaction.objectStore(META_STORE).get('activeId')
    let profiles: Profile[] = []
    let activeId: string | null = null
    profilesRequest.onsuccess = () => { profiles = profilesRequest.result as Profile[] }
    activeRequest.onsuccess = () => { activeId = (activeRequest.result as string | undefined) ?? null }
    transaction.oncomplete = () => resolve({ profiles, activeId })
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

function writeDatabase(db: IDBDatabase, profiles: Profile[], activeId: string | null): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROFILE_STORE, META_STORE], 'readwrite')
    const profileStore = transaction.objectStore(PROFILE_STORE)
    profileStore.clear()
    profiles.forEach((profile) => profileStore.put(profile))
    transaction.objectStore(META_STORE).put(activeId, 'activeId')
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

function isCorrectAnswer(expected: number | string, entered: string): boolean {
  const cleaned = entered.trim().toLocaleLowerCase('de-DE').replace(/\s/g, '')
  if (typeof expected === 'number') return Number(cleaned.replace(',', '.')) === expected
  return cleaned === expected.toLocaleLowerCase('de-DE').replace(/\s/g, '')
}

function downloadFile(filename: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function safeName(value: string): string {
  return value.toLocaleLowerCase('de-DE').replace(/[^a-z0-9]+/g, '-')
}

function Dialog({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode
  onClose: () => void
  title: string
}) {
  return (
    <div className="dialog-backdrop">
      <section className="dialog" role="dialog" aria-modal="true" aria-label={title}>
        <button className="icon-button dialog-close" type="button" aria-label="Schließen" onClick={onClose}>
          <X size={18} />
        </button>
        {children}
      </section>
    </div>
  )
}

function App() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)
  const [storageReady, setStorageReady] = useState(!INDEXED_DB_AVAILABLE)
  const [storageWarning, setStorageWarning] = useState(INDEXED_DB_AVAILABLE ? '' : STORAGE_UNAVAILABLE_MESSAGE)
  const [page, setPage] = useState<Page>('home')
  const [mission, setMission] = useState<Mission | null>(null)
  const [taskIndex, setTaskIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [correctInMission, setCorrectInMission] = useState(0)
  const [completionMessage, setCompletionMessage] = useState('')
  const [nameDialogOpen, setNameDialogOpen] = useState(false)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importError, setImportError] = useState('')
  const [importCandidate, setImportCandidate] = useState<Profile | null>(null)
  const [worksheetOpen, setWorksheetOpen] = useState(false)
  const [worksheetTopic, setWorksheetTopic] = useState<TopicId>('numbers')
  const [worksheetTasks, setWorksheetTasks] = useState<MathTask[]>([])
  const [printAnswers, setPrintAnswers] = useState(false)
  const dbRef = useRef<IDBDatabase | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) ?? null
  const currentTask = mission?.tasks[taskIndex] ?? null
  const level = activeProfile ? Math.floor(activeProfile.xp / 100) + 1 : 1
  const levelProgress = activeProfile ? activeProfile.xp % 100 : 0

  useEffect(() => {
    let cancelled = false
    if (!INDEXED_DB_AVAILABLE) return () => { cancelled = true }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(PROFILE_STORE)) db.createObjectStore(PROFILE_STORE, { keyPath: 'id' })
      if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE)
    }
    request.onsuccess = () => {
      const db = request.result
      if (cancelled) {
        db.close()
        return
      }
      dbRef.current = db
      readDatabase(db)
        .then((saved) => {
          if (cancelled) return
          setProfiles(saved.profiles)
          setActiveProfileId(saved.profiles.some((profile) => profile.id === saved.activeId) ? saved.activeId : saved.profiles[0]?.id ?? null)
          setStorageReady(true)
        })
        .catch(() => {
          if (cancelled) return
          db.close()
          dbRef.current = null
          setStorageWarning('Der lokale Speicher konnte nicht gelesen werden. Änderungen bleiben möglicherweise nur in diesem Tab.')
          setStorageReady(true)
        })
    }
    request.onerror = () => {
      if (cancelled) return
      setStorageWarning('Der lokale Speicher ist nicht verfügbar. Änderungen bleiben nur in diesem Tab.')
      setStorageReady(true)
    }
    return () => {
      cancelled = true
      dbRef.current?.close()
      dbRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!storageReady || !dbRef.current) return
    writeDatabase(dbRef.current, profiles, activeProfileId).catch(() => {
      setStorageWarning('Speichern im Browser ist fehlgeschlagen. Exportiere deinen Lernstand als Sicherung.')
    })
  }, [profiles, activeProfileId, storageReady])

  function addProfile(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const name = profileName.trim()
    if (!name) return
    const profile = makeProfile(name)
    setProfiles((current) => [...current, profile])
    setActiveProfileId(profile.id)
    setProfileName('')
    setNameDialogOpen(false)
    setProfileDialogOpen(false)
    setMission(null)
    setPage('home')
  }

  function switchProfile(id: string): void {
    setActiveProfileId(id)
    setMission(null)
    setPage('home')
    setCompletionMessage('')
  }

  function removeProfile(id: string): void {
    const selected = profiles.find((profile) => profile.id === id)
    if (!selected || !window.confirm(`Profil „${selected.name}“ und alle zugehörigen Lernstände löschen?`)) return
    const remaining = profiles.filter((profile) => profile.id !== id)
    setProfiles(remaining)
    if (activeProfileId === id) setActiveProfileId(remaining[0]?.id ?? null)
    setMission(null)
    if (remaining.length === 0) setProfileDialogOpen(false)
  }

  function startMission(topicId: TopicId): void {
    if (!activeProfile) return
    const tasks = createMission(topicId, activeProfile.topicProgress[topicId] ?? 0, activeProfile.activity)
    setMission({ profileId: activeProfile.id, topicId, tasks })
    setTaskIndex(0)
    setAnswer('')
    setFeedback(null)
    setShowHint(false)
    setCorrectInMission(0)
    setCompletionMessage('')
    setPage('mission')
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!mission || !currentTask || !activeProfile || feedback !== null || !answer.trim()) return
    const correct = isCorrectAnswer(currentTask.answer, answer)
    setFeedback(correct)
    if (correct) setCorrectInMission((current) => current + 1)
    setProfiles((current) => current.map((profile) => profile.id !== mission.profileId ? profile : {
      ...profile,
      xp: profile.xp + (correct ? 4 : 0),
      correctAnswers: profile.correctAnswers + (correct ? 1 : 0),
      totalAnswers: profile.totalAnswers + 1,
    }))
  }

  function finishMission(): void {
    if (!mission || !activeProfile) return
    const nextCompleted = activeProfile.completedMissions + 1
    const nextTopicCount = (activeProfile.topicProgress[mission.topicId] ?? 0) + 1
    const unlocked: string[] = []
    if (nextCompleted === 1) unlocked.push('first-mission')
    if (nextCompleted === 5) unlocked.push('five-missions')
    if (nextTopicCount === 3) unlocked.push('topic-three')
    if (correctInMission === mission.tasks.length) unlocked.push('perfect-mission')
    const newBadges = unlocked.filter((id) => !activeProfile.earnedBadges.includes(id))
    const completedActivity: Activity = {
      date: currentTimestamp(),
      topicId: mission.topicId,
      correct: correctInMission,
      total: mission.tasks.length,
    }
    setProfiles((current) => current.map((profile) => profile.id !== mission.profileId ? profile : {
      ...profile,
      xp: profile.xp + 25,
      completedMissions: nextCompleted,
      topicProgress: { ...profile.topicProgress, [mission.topicId]: nextTopicCount },
      earnedBadges: [...profile.earnedBadges, ...newBadges],
      activity: [...profile.activity, completedActivity].slice(-20),
    }))
    const badgeNames = newBadges.map((id) => BADGES.find((badge) => badge.id === id)?.name).filter(Boolean)
    setCompletionMessage(badgeNames.length ? `Mission geschafft! Neues Abzeichen: ${badgeNames.join(', ')}.` : 'Mission geschafft! Deine Übung bringt dich weiter.')
    setMission(null)
    setPage('home')
    setFeedback(null)
  }

  function nextTask(): void {
    if (!mission) return
    if (taskIndex === mission.tasks.length - 1) {
      finishMission()
      return
    }
    setTaskIndex((current) => current + 1)
    setAnswer('')
    setFeedback(null)
    setShowHint(false)
  }

  function exportProgress(): void {
    if (!activeProfile) return
    downloadFile(
      `matheheld-${safeName(activeProfile.name)}-lernstand.json`,
      JSON.stringify({ formatVersion: 1, exportedAt: currentTimestamp(), profile: activeProfile }, null, 2),
      'application/json',
    )
  }

  function exportTasks(topicId: TopicId): void {
    if (!activeProfile) return
    const tasks = mission?.topicId === topicId ? mission.tasks : createMission(topicId, activeProfile.topicProgress[topicId] ?? 0, activeProfile.activity)
    const topic = TOPICS.find((item) => item.id === topicId)!
    downloadFile(
      `matheheld-${safeName(topic.name)}-aufgaben.json`,
      JSON.stringify({
        formatVersion: 1,
        exportedAt: currentTimestamp(),
        topic: { id: topic.id, name: topic.name },
        tasks: tasks.map(({ id, prompt, answer: solution, hint, explanation }) => ({ id, prompt, solution, hint, explanation })),
      }, null, 2),
      'application/json',
    )
  }

  function openWorksheet(topicId: TopicId): void {
    const tasks = mission?.topicId === topicId ? mission.tasks : createMission(topicId, activeProfile?.topicProgress[topicId] ?? 0, activeProfile?.activity ?? [])
    setWorksheetTopic(topicId)
    setWorksheetTasks(tasks)
    setWorksheetOpen(true)
  }

  function printWorksheet(): void {
    setWorksheetOpen(false)
    window.setTimeout(() => window.print(), 120)
  }

  function handleImportFile(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    file.text().then((text) => {
      const data = JSON.parse(text) as { formatVersion?: number; profile?: Partial<Profile> }
      const candidate = data.profile
      if (data.formatVersion !== 1 || !candidate || typeof candidate.name !== 'string' || typeof candidate.xp !== 'number' || typeof candidate.id !== 'string') {
        throw new Error('Die Datei hat nicht das erwartete MatheHeld-Format.')
      }
      const progress = candidate.topicProgress
      const normalized: Profile = {
        ...makeProfile(candidate.name),
        ...candidate,
        id: `import-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
        topicProgress: {
          numbers: Math.max(0, Number(progress?.numbers) || 0),
          fractions: Math.max(0, Number(progress?.fractions) || 0),
          measures: Math.max(0, Number(progress?.measures) || 0),
          geometry: Math.max(0, Number(progress?.geometry) || 0),
        },
        earnedBadges: Array.isArray(candidate.earnedBadges) ? candidate.earnedBadges.filter((id): id is string => typeof id === 'string' && BADGES.some((badge) => badge.id === id)) : [],
        activity: Array.isArray(candidate.activity) ? candidate.activity.slice(-20) as Activity[] : [],
      }
      setImportCandidate(normalized)
      setImportError('')
      setImportDialogOpen(true)
    }).catch((error: unknown) => {
      setImportCandidate(null)
      setImportError(error instanceof Error ? error.message : 'Die Datei konnte nicht gelesen werden.')
      setImportDialogOpen(true)
    })
  }

  function confirmImport(): void {
    if (!importCandidate) return
    const imported = { ...importCandidate, name: `${importCandidate.name.slice(0, 18)} (Import)` }
    setProfiles((current) => [...current, imported])
    setActiveProfileId(imported.id)
    setImportCandidate(null)
    setImportDialogOpen(false)
    setPage('home')
  }

  const navItems: { id: Page; label: string; icon: LucideIcon }[] = [
    { id: 'home', label: 'Übersicht', icon: Home },
    { id: 'topics', label: 'Einsatzgebiete', icon: Compass },
    { id: 'badges', label: 'Abzeichen', icon: Award },
  ]

  if (!storageReady) {
    return <div className="loading-screen"><Shield size={30} /><span>Heldenzentrale wird vorbereitet ...</span></div>
  }

  if (!activeProfile) {
    return (
      <div className="welcome-screen">
        <div className="welcome-art" aria-hidden="true">
          <div className="welcome-sun"><Sparkles size={24} /></div>
          <div className="welcome-tower tower-one" />
          <div className="welcome-tower tower-two" />
          <div className="welcome-tower tower-three" />
          <div className="welcome-shield"><Shield size={56} strokeWidth={1.5} /></div>
        </div>
        <div className="welcome-copy">
          <div className="brand-lockup"><span className="brand-mark"><Shield size={21} /></span><span>MatheHeld</span></div>
          <span className="eyebrow">DEIN ABENTEUER BEGINNT</span>
          <h1>Wer wird heute zum MatheHeld?</h1>
          <p>Lege ein Profil an. Dein Lernstand bleibt auf diesem Gerät und ist nur in diesem Browser verfügbar.</p>
          {storageWarning && <p className="storage-warning">{storageWarning}</p>}
          <form className="profile-form" onSubmit={addProfile}>
            <label htmlFor="first-profile-name">Name des Heldenprofils</label>
            <input id="first-profile-name" autoFocus maxLength={22} value={profileName} onChange={(event) => setProfileName(event.target.value)} placeholder="Zum Beispiel Alex" required />
            <button className="button button-primary" type="submit">Profil anlegen <ArrowRight size={17} /></button>
          </form>
          <span className="privacy-note"><LockKeyhole size={14} /> Kein Konto. Keine Datenübertragung.</span>
        </div>
      </div>
    )
  }

  const selectedWorksheetTopic = TOPICS.find((topic) => topic.id === worksheetTopic)!
  const accuracy = activeProfile.totalAnswers ? Math.round((activeProfile.correctAnswers / activeProfile.totalAnswers) * 100) : 0

  return (
    <>
      <div className="app-shell">
        <aside className="sidebar">
          <a className="brand-lockup" href="#start" onClick={(event) => { event.preventDefault(); setPage('home') }}>
            <span className="brand-mark"><Shield size={21} /></span><span>MatheHeld</span>
          </a>
          <div className="sidebar-label">DEINE ZENTRALE</div>
          <nav className="side-nav" aria-label="Hauptnavigation">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} type="button" onClick={() => setPage(id)}>
                <Icon size={18} strokeWidth={2} /><span>{label}</span>
                {id === 'badges' && <span className="nav-count">{activeProfile.earnedBadges.length}</span>}
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="side-level-card">
              <div className="side-level-top"><span>HELDENLEVEL</span><span>LVL {level}</span></div>
              <div className="side-progress"><span style={{ width: `${levelProgress}%` }} /></div>
              <small>{levelProgress} / 100 EP bis zum nächsten Level</small>
            </div>
            <div className="side-footnote"><LockKeyhole size={13} /><span>Deine Daten bleiben auf diesem Gerät.</span></div>
          </div>
        </aside>

        <div className="main-column">
          <header className="topbar">
            <div className="topbar-context"><span>MATHEHELD</span><ChevronDown size={14} /><span>{page === 'mission' ? 'MISSION' : page === 'topics' ? 'EINSATZGEBIETE' : page === 'badges' ? 'SAMMLUNG' : 'HELDENZENTRALE'}</span></div>
            <div className="topbar-actions">
              <div className="storage-pill" title={storageWarning || 'Fortschritt wird lokal im Browser gespeichert.'}>
                <span className={`storage-dot ${storageWarning ? 'warning' : ''}`} />
                <span>{storageWarning ? 'Nur in diesem Tab' : 'Lokal gespeichert'}</span>
              </div>
              <label className="profile-picker">
                <span className="profile-avatar">{activeProfile.name.slice(0, 1).toLocaleUpperCase('de-DE')}</span>
                <select aria-label="Aktives Profil" value={activeProfile.id} onChange={(event) => switchProfile(event.target.value)}>
                  {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
                </select>
                <ChevronDown size={14} />
              </label>
              <button className="icon-button profile-manage" type="button" title="Profile verwalten" aria-label="Profile verwalten" onClick={() => setProfileDialogOpen(true)}><Users size={18} /></button>
            </div>
          </header>

          <main className="content-area">
            {storageWarning && <div className="warning-banner"><LockKeyhole size={17} /><span>{storageWarning}</span></div>}
            {completionMessage && page === 'home' && <div className="completion-banner"><CheckCircle2 size={18} /><span>{completionMessage}</span><button className="icon-button" type="button" aria-label="Meldung schließen" onClick={() => setCompletionMessage('')}><X size={16} /></button></div>}

            {page === 'home' && (
              <>
                <div className="page-heading"><div><span className="eyebrow">SONDERMISSION BEREIT</span><h1>Hallo, {activeProfile.name}!</h1><p>Dein nächster Einsatz wartet schon.</p></div><div className="heading-level"><span className="level-medal"><Shield size={18} /></span><div><strong>Level {level}</strong><small>Matheheld in Ausbildung</small></div></div></div>
                <section className="mission-banner">
                  <div className="mission-banner-copy">
                    <div className="banner-kicker"><span className="live-dot" /> {mission ? 'MISSION PAUSIERT' : 'EMPFOHLENER EINSATZ'}</div>
                    <h2>{mission ? `Weiter in ${TOPICS.find((topic) => topic.id === mission.topicId)?.name}` : 'Der Code der Zahlenstadt'}</h2>
                    <p>{mission ? 'Dein Einsatz ist bereit, wenn du es bist.' : 'Knacke den Zahlencode und bring die Lichter der Stadt wieder zum Leuchten.'}</p>
                    <div className="banner-meta"><span><BookOpen size={15} /> {mission ? `${mission.tasks.length - taskIndex} Aufgaben übrig` : '5 kurze Aufgaben'}</span><span><Zap size={15} /> +25 EP</span></div>
                    <button className="button button-yellow" type="button" onClick={() => mission ? setPage('mission') : startMission('numbers')}>
                      {mission ? 'Mission fortsetzen' : 'Mission starten'} <ArrowRight size={17} />
                    </button>
                  </div>
                  <div className="city-art" aria-hidden="true">
                    <div className="art-sun"><Sparkles size={20} /></div>
                    <div className="city-star star-a">✦</div><div className="city-star star-b">✦</div>
                    <div className="city-building building-a"><i /><i /><i /><i /></div>
                    <div className="city-building building-b"><i /><i /><i /><i /><i /><i /></div>
                    <div className="city-building building-c"><i /><i /><i /><i /></div>
                    <div className="city-building building-d"><i /><i /><i /></div>
                    <div className="art-hero"><Shield size={47} strokeWidth={1.7} /><span>✦</span></div>
                    <div className="art-ground" />
                  </div>
                </section>

                <section className="stats-row" aria-label="Dein Lernfortschritt">
                  <div className="stat-block"><span className="stat-icon stat-yellow"><Zap size={17} /></span><div><strong>{activeProfile.xp}</strong><span>Erfahrungspunkte</span></div><small>EP</small></div>
                  <div className="stat-block"><span className="stat-icon stat-coral"><Trophy size={17} /></span><div><strong>{activeProfile.completedMissions}</strong><span>Missionen geschafft</span></div></div>
                  <div className="stat-block"><span className="stat-icon stat-blue"><Target size={17} /></span><div><strong>{accuracy}%</strong><span>Aufgaben richtig</span></div></div>
                </section>

                <section className="section-block">
                  <div className="section-heading"><div><span className="eyebrow">WÄHLE DEIN ABENTEUER</span><h2>Deine Einsatzgebiete</h2></div><button className="text-link" type="button" onClick={() => setPage('topics')}>Alle Gebiete <ArrowRight size={16} /></button></div>
                  <div className="topic-list">
                    {TOPICS.map((topic) => {
                      const Icon = topic.icon
                      return (
                        <article className="topic-row" key={topic.id}>
                          <span className={`topic-icon tone-${topic.color}`}><Icon size={20} /></span>
                          <div className="topic-row-copy"><span className="eyebrow">{topic.place}</span><h3>{topic.name}</h3><p>{topic.description}</p></div>
                          <span className="topic-completion">{activeProfile.topicProgress[topic.id]} <small>Missionen</small></span>
                          <button className="icon-button row-print" type="button" title={`Aufgaben aus ${topic.name} drucken`} aria-label={`Aufgaben aus ${topic.name} drucken`} onClick={() => openWorksheet(topic.id)}><Printer size={17} /></button>
                          <button className="button button-outline row-start" type="button" onClick={() => startMission(topic.id)}>Starten <ArrowRight size={15} /></button>
                        </article>
                      )
                    })}
                  </div>
                </section>
              </>
            )}

            {page === 'topics' && (
              <>
                <div className="page-heading"><div><span className="eyebrow">DIE WELT BRAUCHT DEINE HILFE</span><h1>Einsatzgebiete</h1><p>Such dir ein Thema aus. Jede Mission hat fünf Aufgaben.</p></div><span className="heading-emblem"><Compass size={28} /></span></div>
                <div className="topic-grid">
                  {TOPICS.map((topic, index) => {
                    const Icon = topic.icon
                    return (
                      <article className={`topic-card topic-card-${topic.color}`} key={topic.id}>
                        <div className="topic-card-top"><span className="topic-card-icon"><Icon size={23} /></span><span className="eyebrow">{topic.place}</span><span className="topic-number">0{index + 1}</span></div>
                        <h2>{topic.name}</h2><p>{topic.description}</p>
                        <div className="topic-card-progress"><span><strong>{activeProfile.topicProgress[topic.id]}</strong> Missionen abgeschlossen</span><span>{Math.min(100, activeProfile.topicProgress[topic.id] * 25)}%</span></div>
                        <div className="topic-progress-track"><span style={{ width: `${Math.min(100, activeProfile.topicProgress[topic.id] * 25)}%` }} /></div>
                        <div className="topic-card-actions"><button className="button button-dark" type="button" onClick={() => startMission(topic.id)}>Mission starten <ArrowRight size={16} /></button><button className="icon-button" type="button" title="Aufgaben drucken" aria-label={`Aufgaben aus ${topic.name} drucken`} onClick={() => openWorksheet(topic.id)}><Printer size={17} /></button><button className="icon-button" type="button" title="Aufgaben als JSON exportieren" aria-label={`Aufgaben aus ${topic.name} als JSON exportieren`} onClick={() => exportTasks(topic.id)}><Download size={17} /></button></div>
                      </article>
                    )
                  })}
                </div>
                <div className="generator-note"><Sparkles size={18} /><p><strong>Jede Mission ist neu.</strong> Die Aufgaben entstehen direkt in deinem Browser aus geprüften Rechenvorlagen und passen sich an deinen Lernfortschritt an.</p></div>
              </>
            )}

            {page === 'badges' && (
              <>
                <div className="page-heading"><div><span className="eyebrow">DEINE HELDENTATEN</span><h1>Abzeichensammlung</h1><p>Jedes Abzeichen erinnert an etwas, das du gelernt hast.</p></div><span className="heading-emblem"><Award size={28} /></span></div>
                <div className="badge-summary"><span className="badge-summary-icon"><Award size={21} /></span><div><strong>{activeProfile.earnedBadges.length} von {BADGES.length} Abzeichen</strong><span>Du sammelst sie Schritt für Schritt.</span></div><div className="badge-summary-track"><span style={{ width: `${(activeProfile.earnedBadges.length / BADGES.length) * 100}%` }} /></div></div>
                <div className="badge-grid">
                  {BADGES.map((badge) => {
                    const Icon = badge.icon
                    const earned = activeProfile.earnedBadges.includes(badge.id)
                    return <article className={`badge-card ${earned ? 'earned' : 'locked'}`} key={badge.id}><span className="badge-medallion">{earned ? <Icon size={27} /> : <LockKeyhole size={23} />}</span><div><span className="eyebrow">{earned ? 'ABZEICHEN ERHALTEN' : 'NOCH ZU ENTDECKEN'}</span><h2>{badge.name}</h2><p>{badge.description}</p></div>{earned && <CheckCircle2 className="badge-check" size={20} />}</article>
                  })}
                </div>
              </>
            )}

            {page === 'mission' && mission && currentTask && (
              <section className="mission-view">
                <div className="mission-toolbar"><button className="back-link" type="button" onClick={() => setPage('home')}><ArrowLeft size={17} /> Mission pausieren</button><span className="mission-topic-tag"><Sparkles size={14} /> {TOPICS.find((topic) => topic.id === mission.topicId)?.name}</span></div>
                <div className="mission-progress-label"><span>AUFGABE {taskIndex + 1} <span className="muted-label">VON {mission.tasks.length}</span></span><span>{correctInMission} richtig</span></div>
                <div className="mission-progress-track">{mission.tasks.map((item, index) => <span key={item.id} className={index < taskIndex ? 'done' : index === taskIndex ? 'current' : ''} />)}</div>
                <article className="question-panel">
                  <div className="question-kicker"><span className="question-number">{String(taskIndex + 1).padStart(2, '0')}</span><span>ZEIG, WAS DU KANNST</span></div>
                  <h1>{currentTask.prompt}</h1>
                  {!feedback && (
                    <form className="answer-form" onSubmit={submitAnswer}>
                      <label htmlFor="answer-input">Deine Antwort</label>
                      <div className="answer-input-wrap"><input id="answer-input" autoFocus inputMode="text" autoComplete="off" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Antwort eingeben" /><span>{currentTask.answer.toString().includes('/') ? 'Bruch' : 'Ergebnis'}</span></div>
                      <div className="answer-actions"><button className="button button-primary" type="submit" disabled={!answer.trim()}>Antwort prüfen <ArrowRight size={17} /></button><button className={`hint-button ${showHint ? 'is-open' : ''}`} type="button" onClick={() => setShowHint((current) => !current)}><Lightbulb size={17} /> {showHint ? 'Tipp ausblenden' : 'Heldentipp'}</button></div>
                    </form>
                  )}
                  {showHint && !feedback && <div className="hint-panel"><Lightbulb size={17} /><p>{currentTask.hint}</p></div>}
                  {feedback !== null && <div className={`answer-feedback ${feedback ? 'is-correct' : 'is-incorrect'}`}><div className="feedback-title">{feedback ? <><CheckCircle2 size={20} /> Genau richtig!</> : <><BookOpen size={20} /> Guter Versuch. So geht der Rechenweg:</>}</div><p>{currentTask.explanation}</p>{!feedback && <span className="correct-answer">Lösung: <strong>{currentTask.answer}</strong></span>}<button className="button button-primary" type="button" onClick={nextTask}>{taskIndex === mission.tasks.length - 1 ? 'Mission abschließen' : 'Weiter'} <ArrowRight size={17} /></button></div>}
                </article>
                <div className="mission-footer"><span><LockKeyhole size={14} /> Fehler gehören zum Lernen. Du verlierst keine Punkte.</span><span>{activeProfile.name} · Level {level}</span></div>
              </section>
            )}
          </main>

          <footer className="app-footer"><span>MATHEHELD <span className="footer-dot">·</span> Üben macht stark.</span><button className="footer-action" type="button" onClick={exportProgress}><Download size={15} /> Lernstand sichern</button></footer>
        </div>
      </div>

      <div className="mobile-nav" aria-label="Hauptnavigation">
        {navItems.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={page === id ? 'active' : ''} onClick={() => setPage(id)}><Icon size={19} /><span>{label}</span></button>)}
      </div>

      <input ref={importInputRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={handleImportFile} />

      {profileDialogOpen && <Dialog title="Profile verwalten" onClose={() => setProfileDialogOpen(false)}><span className="eyebrow">AUF DIESEM GERÄT</span><h2>Heldenprofile</h2><p className="dialog-intro">Jedes Profil hat einen eigenen Lernstand.</p><div className="profile-list">{profiles.map((profile) => <div className="profile-list-row" key={profile.id}><span className="profile-avatar">{profile.name.slice(0, 1).toLocaleUpperCase('de-DE')}</span><div><strong>{profile.name}</strong><small>Level {Math.floor(profile.xp / 100) + 1} · {profile.completedMissions} Missionen</small></div>{profile.id === activeProfile.id ? <span className="current-profile-label">Aktiv</span> : <button className="button button-outline" type="button" onClick={() => { switchProfile(profile.id); setProfileDialogOpen(false) }}>Wechseln</button>}<button className="icon-button danger-icon" type="button" aria-label={`${profile.name} löschen`} title={`${profile.name} löschen`} onClick={() => removeProfile(profile.id)}><X size={17} /></button></div>)}</div><button className="button button-primary dialog-primary" type="button" onClick={() => { setProfileDialogOpen(false); setNameDialogOpen(true) }}><Plus size={17} /> Profil hinzufügen</button></Dialog>}

      {nameDialogOpen && <Dialog title="Neues Profil anlegen" onClose={() => setNameDialogOpen(false)}><span className="eyebrow">NEUER HELD, NEUES ABENTEUER</span><h2>Wer spielt?</h2><p className="dialog-intro">Der Lernstand wird getrennt und nur in diesem Browser gespeichert.</p><form className="profile-form" onSubmit={addProfile}><label htmlFor="new-profile-name">Name des Heldenprofils</label><input id="new-profile-name" autoFocus maxLength={22} value={profileName} onChange={(event) => setProfileName(event.target.value)} placeholder="Zum Beispiel Alex" required /><button className="button button-primary" type="submit">Profil anlegen <ArrowRight size={17} /></button></form></Dialog>}

      {importDialogOpen && <Dialog title="Lernstand importieren" onClose={() => { setImportDialogOpen(false); setImportError(''); setImportCandidate(null) }}><span className="eyebrow">SICHERUNG WIEDERHERSTELLEN</span><h2>{importError ? 'Import nicht möglich' : 'Profil überprüfen'}</h2>{importError ? <p className="import-error">{importError}</p> : importCandidate && <><p className="dialog-intro">Der Lernstand wird als neues Profil hinzugefügt. Bestehende Profile bleiben unverändert.</p><div className="import-preview"><span className="profile-avatar">{importCandidate.name.slice(0, 1).toLocaleUpperCase('de-DE')}</span><div><strong>{importCandidate.name}</strong><small>Level {Math.floor(importCandidate.xp / 100) + 1} · {importCandidate.completedMissions} Missionen · {importCandidate.earnedBadges.length} Abzeichen</small></div></div><div className="dialog-actions"><button className="button button-outline" type="button" onClick={() => setImportDialogOpen(false)}>Abbrechen</button><button className="button button-primary" type="button" onClick={confirmImport}><Upload size={16} /> Als neues Profil importieren</button></div></>}</Dialog>}

      {worksheetOpen && <Dialog title="Arbeitsblatt erstellen" onClose={() => setWorksheetOpen(false)}><span className="eyebrow">AUFGABEN MITNEHMEN</span><h2>Arbeitsblatt</h2><p className="dialog-intro">{selectedWorksheetTopic.name} · {worksheetTasks.length} Aufgaben</p><label className="checkbox-row"><input type="checkbox" checked={printAnswers} onChange={(event) => setPrintAnswers(event.target.checked)} /><span>Lösungsblatt auf eigener Seite ergänzen</span></label><div className="dialog-actions"><button className="button button-outline" type="button" onClick={() => exportTasks(worksheetTopic)}><Download size={16} /> Aufgaben als JSON</button><button className="button button-primary" type="button" onClick={printWorksheet}><Printer size={16} /> Drucken / PDF</button></div></Dialog>}

      <section className="print-sheet" aria-hidden="true">
        <div className="print-brand"><Shield size={23} /><span>MatheHeld</span></div><p className="eyebrow">ARBEITSBLATT · {selectedWorksheetTopic.name.toLocaleUpperCase('de-DE')}</p><h1>{selectedWorksheetTopic.name}: Dein Einsatz</h1><p>Name: ________________________________ <span>Datum: __________________</span></p>
        <ol className="print-task-list">{worksheetTasks.map((item) => <li key={item.id}><p>{item.prompt}</p><div className="print-answer-line" /></li>)}</ol>
        {printAnswers && <div className="print-solutions"><h2>Lösungsblatt</h2><ol>{worksheetTasks.map((item) => <li key={item.id}><strong>{item.answer}</strong><span>{item.explanation}</span></li>)}</ol></div>}
      </section>
    </>
  )
}

export default App
