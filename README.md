# Genio Atrapado — Demo

Un prototipo interactivo del "Genio Atrapado" basado en las especificaciones de `agent.md`. Esta aplicación web demuestra la lógica de locks, leds y telemetría en un entorno React moderno.

## Características

- Interfaz de usuario intuitiva con Tailwind CSS
- Persistencia de estado en localStorage
- Animaciones y accesibilidad mejoradas
- Integración con datos locales via JSON

## Tecnologías Utilizadas

- **React 18**: Para la construcción de la interfaz
- **Vite**: Herramienta de desarrollo rápida
- **Tailwind CSS**: Framework de estilos utilitarios
- **PostCSS**: Procesador de CSS

## Requisitos

- Node.js 16 o superior
- npm

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/AdrianWheels/AiExperimentPortfolio.git
   cd AiExperimentPortfolio
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

La aplicación estará disponible en `http://localhost:5173`.

## Uso

- Abre la aplicación en tu navegador.
- Interactúa con los elementos de la interfaz.
- El estado se guarda automáticamente en localStorage.

## Estructura del Proyecto

```
src/
  App.jsx          # Componente principal
  main.jsx         # Punto de entrada
  components.css   # Estilos adicionales
  styles.css       # Estilos globales
data/
  assistant.json   # Datos del assistant
public/
  base.css        # Estilos base
  tailwind.css    # Configuración Tailwind
  VisorGreen.png  # Imágenes
  VisorRed.png
```

## Construcción para Producción

```bash
npm run build
npm run preview
```

## Próximos Pasos

- Añadir tests unitarios
- Mejorar animaciones y accesibilidad
- Integrar telemetría
- Integrar webGPU y webLLM para un modelo pequeño que responda preguntas sencillas sobre mí, almacenadas en un JSON

## Contribuciones

¡Las contribuciones son bienvenidas! Por favor, abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.
