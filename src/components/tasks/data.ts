import {
    Circle,
    CircleDashed,
    CheckCircle2,
    XCircle,
    Clock,
    Timer,
    CircleDot,
    CircleHelp,
    ArrowDown,
    ArrowRight,
    ArrowUp,
    CheckCircle,
    LucideIcon
  } from "lucide-react"
  
  export const statuses = [
    {
      value: "To-Do",
      label: "To-Do",
      icon: CircleDashed,
    },
    {
      value: "In Progress",
      label: "In Progress",
      icon: Timer,
    },
    {
      value: "In Review",
      label: "In Review",
      icon: CircleHelp,
    },
    {
      value: "Done",
      label: "Done",
      icon: CheckCircle,
    },
  ]
  
  export const priorities = [
    {
      label: "Low",
      value: "Low",
      icon: ArrowDown,
    },
    {
      label: "Medium",
      value: "Medium",
      icon: ArrowRight,
    },
    {
      label: "High",
      value: "High",
      icon: ArrowUp,
    },
    {
      label: "Urgent",
      value: "Urgent",
      icon: ArrowUp,
    },
  ]
  