# Genio Atrapado — Demo (React + Vite + Tailwind)

Este repo contiene un prototipo del "Genio Atrapado" según `agent.md`.

Requisitos:
- Node 16+ y npm

Instalación y arranque (PowerShell):

```powershell
cd "c:\CURSO RN\Dashboard\test"
npm install
npm run dev
```

Notas rápidas:
- La app usa Vite. Abre la URL que muestre el terminal (normalmente http://localhost:5173).
- `data/assistant.json` contiene el cajón local para el assistant.
- Estado (locks, ledsMapping, twistShown, telemetryOptIn) se persiste en `localStorage` bajo la clave `genio_state`.

Siguientes pasos recomendados:
- Añadir tests unitarios para la lógica de locks.
- Pulir animaciones CSS y accesibilidad (focus trap en modal).
- Integrar telemetría (exportar logs) si se desea.
