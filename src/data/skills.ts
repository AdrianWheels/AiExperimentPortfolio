export const skills = {
  core: [
    {
      name: "Desarrollo",
      items: [
        { label: "React", level: "avanzado" },
        { label: "Next.js", level: "avanzado" },
        { label: "TypeScript", level: "avanzado" },
        { label: "Node.js", level: "avanzado" },
        { label: "Python", level: "avanzado" },
        { label: "Tailwind", level: "avanzado" },
        { label: "Supabase", level: "avanzado" },
        { label: "Godot 4", level: "intermedio" },
        { label: "C#", level: "avanzado" },
        { label: "Unity", level: "avanzado" },
        { label: "Ignition Automation", level: "avanzado" },
        { label: "MATLAB", level: "avanzado" },
      ],
    },
    {
      name: "IA & Herramientas",
      items: [
        { label: "VS Copilot", level: "avanzado" },
        { label: "Claude", level: "avanzado" },
        { label: "Gemini AI", level: "avanzado" },
        { label: "ComfyUI", level: "intermedio" },
        { label: "GitHub", level: "avanzado" },
      ],
    },
    {
      name: "Diseño",
      items: [
        { label: "Canva", level: "avanzado" },
        { label: "Adobe Photoshop", level: "avanzado" },
        { label: "Adobe Illustrator", level: "intermedio" },
      ],
    },
  ],
  toolbelt: [
    { title: "Stack Web Moderno", tools: ["Next.js", "Supabase", "Prisma", "Vercel"] },
    { title: "Stack VR & Gaming", tools: ["Godot 4", "Unity", "C#", "GDScript", "Blender"] },
    { title: "Stack Infraestructura", tools: ["AWS", "EC2", "S3", "Linux", "Apache"] },
    { title: "Stack Creativo", tools: ["Photoshop", "Illustrator", "XD", "Premiere"] },
  ],
  soft: [
    "Autonomía y autogestión",
    "Resolución creativa de problemas",
    "Comunicación técnica clara",
    "Adaptabilidad tecnológica",
    "Pensamiento analítico (formación en psicología)",
  ],
} as const
