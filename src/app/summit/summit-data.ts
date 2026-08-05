import type { LucideIcon } from "lucide-react";
import {
  Blocks,
  Compass,
  Handshake,
  Landmark,
  MessagesSquare,
  Network,
  Route,
  UsersRound,
} from "lucide-react";

export interface SummitGoal {
  description: string;
  icon: LucideIcon;
  title: string;
}

export interface AgendaItem {
  description: string;
  time: string;
  title: string;
}

export interface SummitDay {
  agenda: readonly AgendaItem[];
  audience: string;
  date: string;
  day: string;
  focus: string;
  label: string;
}

export interface FaqItem {
  answer: string;
  question: string;
}

export const summitGoals: readonly SummitGoal[] = [
  {
    title: "Establish our identity",
    description: "Bring every technical working group together in person for the first time.",
    icon: UsersRound,
  },
  {
    title: "Set direction",
    description: "Align working groups and subteams on priorities, active projects, and roadmaps.",
    icon: Compass,
  },
  {
    title: "Build trust",
    description: "Create the relationships that make thoughtful remote collaboration work.",
    icon: Handshake,
  },
  {
    title: "Formalize governance",
    description: "Resolve leadership, membership, and cross-cutting coordination questions.",
    icon: Landmark,
  },
];
export const summitDays: readonly SummitDay[] = [
  {
    day: "Day 01",
    date: "Tuesday, 10 November",
    label: "Plenary sessions",
    audience: "All summit participants",
    focus: "Foundation-wide context, strategy, and governance",
    agenda: [
      {
        time: "Morning",
        title: "Welcome & keynote",
        description: "Foundation leadership opens with the vision, mission, and outcomes for our time together.",
      },
      {
        time: "Morning",
        title: "State of React",
        description: "A shared view of React today, the ecosystem around it, and the industry challenges ahead.",
      },
      {
        time: "Late morning",
        title: "Working group updates",
        description: "Brief updates from each group: achievements, current state, and open challenges.",
      },
      {
        time: "Afternoon",
        title: "Strategic direction",
        description: "A facilitated discussion on next-year priorities and cross-cutting themes.",
      },
      {
        time: "Afternoon",
        title: "Governance & process",
        description: "Leadership representation, the RCP process, membership policies, and coordination.",
      },
      {
        time: "Late afternoon",
        title: "Lightning talks & open floor",
        description: "Short member-led talks, demos, proposals, and topics that deserve the room’s attention.",
      },
      {
        time: "Evening",
        title: "Social dinner",
        description: "An informal evening for conversation, connection, and team building.",
      },
    ],
  },
  {
    day: "Day 02",
    date: "Wednesday, 11 November",
    label: "Working group workshops",
    audience: "All summit participants",
    focus: "Deep dives, roadmap planning, and hands-on collaboration",
    agenda: [
      {
        time: "All day",
        title: "Parallel workshops",
        description: "Groups set focused agendas around roadmap planning, backlog triage, architecture, and working sessions.",
      },
      {
        time: "Throughout",
        title: "Cross-group sessions",
        description: "Groups can combine or split around shared topics; cross-cutting collaboration is encouraged.",
      },
      {
        time: "Scheduling note",
        title: "Multiple memberships",
        description: "The agenda will account for people who contribute to more than one group, including DevX and React Native.",
      },
    ],
  },
  {
    day: "Day 03",
    date: "Thursday, 12 November",
    label: "Board meeting",
    audience: "React Foundation Board only",
    focus: "The Foundation’s first in-person board meeting",
    agenda: [
      {
        time: "Board schedule",
        title: "In-person board meeting",
        description: "A dedicated day for React Foundation Board members. Days 1 and 2 conclude the general summit programme.",
      },
    ],
  },
];

export const workingGroups = [
  { name: "Core Runtime & Renderer", family: "React Native" },
  { name: "Platform Expertise", family: "React Native · iOS, Android & out-of-tree" },
  { name: "Stable API", family: "React Native" },
  { name: "Distribution", family: "React Native" },
  { name: "React Fiber", family: "Foundation working group" },
  { name: "DevX / Developer Tools", family: "Foundation working group" },
  { name: "Server", family: "Foundation working group" },
  { name: "Compiler", family: "Foundation working group" },
] as const;

export const participationPrinciples = [
  { icon: Route, title: "Plan for outcomes", text: "Arrive with the decisions, dependencies, and roadmap questions your group needs to move forward." },
  { icon: MessagesSquare, title: "Share the context", text: "Use plenaries to make challenges legible across groups, not only within your immediate team." },
  { icon: Network, title: "Cross the boundaries", text: "Seek out adjacent groups where APIs, tooling, platforms, or governance overlap." },
  { icon: Blocks, title: "Make together", text: "Reserve workshop time for real collaboration: triage, design, writing, prototyping, and decisions." },
] as const;

export const faqItems: readonly FaqItem[] = [
  {
    question: "When and where is the summit?",
    answer: "The summit takes place in London from Tuesday 10 to Thursday 12 November 2026. Days 1 and 2 are for all summit participants; Day 3 is reserved for the React Foundation Board. The exact London venue is still to be confirmed.",
  },
  {
    question: "Who is invited?",
    answer: "The event is being planned for approximately 75–100 React Foundation members across the technical working groups. Attendance is based on the summit participant roster. The board meeting on Thursday is limited to React Foundation Board members.",
  },
  {
    question: "Is this a public conference?",
    answer: "No. The current format is a working summit for Foundation members, not a public conference. Whether any session or related community event will be opened more broadly remains under consideration.",
  },
  {
    question: "What is the format?",
    answer: "Tuesday is a shared plenary day covering Foundation context, strategy, working group updates, and governance. Wednesday is a workshop day with parallel working group sessions. Thursday is the Foundation Board meeting.",
  },
  {
    question: "What if I belong to more than one working group?",
    answer: "You are not the only one. Overlapping memberships are a known scheduling constraint, especially across DevX and React Native. Working groups may combine or split sessions, and cross-cutting sessions are encouraged. The detailed workshop timetable will be coordinated around known overlaps.",
  },
  {
    question: "Which working groups will meet?",
    answer: "The current plan includes React Native subteams for Core Runtime & Renderer, Platform Expertise, Stable API, and Distribution, alongside React Fiber, DevX / Developer Tools, Server, and Compiler groups.",
  },
  {
    question: "What should my working group prepare?",
    answer: "Each group owns its workshop agenda. Useful preparation includes a short state-of-the-group update for Tuesday and a prioritized list of roadmap decisions, backlog items, architecture topics, and hands-on work for Wednesday.",
  },
  {
    question: "Are travel and accommodation arranged?",
    answer: "Travel coordination, accommodation guidance, and the reimbursement process have not yet been finalized. Participants should wait for the logistics update before making non-refundable bookings.",
  },
  {
    question: "Will meals be provided?",
    answer: "A social dinner is planned for Tuesday evening. Catering and dietary-request details for the full event will be shared when the venue and logistics plan are confirmed.",
  },
  {
    question: "Will there be a community meetup?",
    answer: "A pre- or post-event activity, potentially connected with the London React community, is being considered but is not yet part of the confirmed programme.",
  },
  {
    question: "When will the detailed agenda be available?",
    answer: "The programme on this page is the proposed shape of the summit. Exact session times, rooms, facilitators, and workshop schedules will be added after the venue and working group agendas are confirmed.",
  },
  {
    question: "Where will updates be published?",
    answer: "This page is the participant source of truth and will be updated as venue, logistics, travel, and detailed scheduling decisions are finalized. It was last updated on 22 July 2026.",
  },
];
