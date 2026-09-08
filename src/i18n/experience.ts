import type { Locale } from './utils'

const i18n = {
  es: {
    timeline: [
      { id: "exp-00", role: "Desarrollador Full Stack & SCADA", company: "GRS", period: "2023 — Presente", summary: "Desarrollo integral de soluciones industriales y web, especializándome en sistemas SCADA con Ignition, automatización con Python e interfaces modernas con React, Tailwind y TypeScript." },
      { id: "exp-01", role: "Técnico Informático", company: "Universidad de Almería - Dpto. Psicología", period: "2021 — 2023", summary: "Encargado de la parte tecnológica del departamento de Psicología en menores en infractores, con total independencia de trabajo." },
      { id: "exp-02", role: "Jefe de Tecnología", company: "StartUP CognitivART VR", period: "2020 — 2021", summary: "Encargado de la tecnología de la startup, administración de sistemas en la nube de Amazon (AWS) y desarrollo de software para clientes." },
      { id: "exp-03", role: "Técnico Informático", company: "Universidad de Almería - Dpto. Neurociencia", period: "2017 — 2018", summary: "Encargado de la parte tecnológica del departamento de Neurociencia, con total independencia de trabajo." },
      { id: "exp-04", role: "Técnico Informático", company: "Eurovia", period: "2013", summary: "Formación y aprendizaje en entorno empresarial, atención al cliente y administración de servidores de correo." },
    ],
    education: [
      { id: "edu-01", title: "C# Programming for Unity Game Development", institution: "University of Colorado", period: "2018" },
      { id: "edu-03", title: "Grado en Psicología", institution: "Universidad de Almería", period: "2013 — 2017" },
      { id: "edu-04", title: "Administración de Sistemas Informáticos en Red", institution: "I.E.S. Celia Viñas", period: "2011 — 2013" },
    ],
  },
  en: {
    timeline: [
      { id: "exp-00", role: "Full Stack Developer & SCADA", company: "GRS", period: "2023 — Present", summary: "End-to-end development of industrial and web solutions, specializing in SCADA systems with Ignition, Python automation, and modern interfaces with React, Tailwind, and TypeScript." },
      { id: "exp-01", role: "IT Specialist", company: "University of Almería - Psychology Dept.", period: "2021 — 2023", summary: "In charge of the technology side for the Psychology department's research on juvenile offenders, with full autonomy." },
      { id: "exp-02", role: "Chief Technology Officer", company: "StartUP CognitivART VR", period: "2020 — 2021", summary: "Led the startup's technology, managed AWS cloud infrastructure, and developed VR software for clients." },
      { id: "exp-03", role: "IT Specialist", company: "University of Almería - Neuroscience Dept.", period: "2017 — 2018", summary: "In charge of the technology side for the Neuroscience department, with full autonomy." },
      { id: "exp-04", role: "IT Technician", company: "Eurovia", period: "2013", summary: "Training in enterprise IT, customer support, and corporate mail server administration." },
    ],
    education: [
      { id: "edu-01", title: "C# Programming for Unity Game Development", institution: "University of Colorado", period: "2018" },
      { id: "edu-03", title: "Psychology Degree", institution: "University of Almería", period: "2013 — 2017" },
      { id: "edu-04", title: "Network Systems Administration", institution: "I.E.S. Celia Viñas", period: "2011 — 2013" },
    ],
  },
} as const

export function getTimeline(locale: Locale) { return i18n[locale].timeline }
export function getEducation(locale: Locale) { return i18n[locale].education }
