# Guía de Estilos CSS y Tailwind

## Estructura de Archivos

### 📁 Organización Actual

```
src/
├── styles.css          # Archivo principal - importa todo
├── components.css      # Componentes CSS personalizados
└── main.jsx           # Punto de entrada

public/
├── base.css           # Estilos legacy (en migración)
└── tailwind.css       # CSS generado por Tailwind (auto-generado)

tailwind.config.cjs    # Configuración de Tailwind
```

## 📋 Qué Contiene Cada Archivo

### `src/styles.css` - **ARCHIVO PRINCIPAL**
- ✅ Importa Tailwind CSS (@tailwind base, components, utilities)
- ✅ Importa componentes personalizados
- ✅ Solo estilos muy específicos que no se pueden hacer con Tailwind

### `src/components.css` - **COMPONENTES PERSONALIZADOS**
- ✅ Efectos metálicos (.avatar-metal, .header-metal)
- ✅ Componentes con gradientes complejos
- ✅ Animaciones especiales
- ✅ Todo bien documentado y organizado

### `public/base.css` - **ESTILOS LEGACY** ⚠️
- ⚠️ Estilos antiguos que aún se usan
- ⚠️ Marcados para migración gradual a Tailwind
- ⚠️ Variables CSS que se están moviendo a Tailwind config

### `tailwind.config.cjs` - **CONFIGURACIÓN**
- ✅ Colores del tema consolidados
- ✅ Fuentes personalizadas
- ✅ Animaciones definidas
- ✅ Extensiones de Tailwind

## 🎨 Uso de Colores

### En JSX (Recomendado)
```jsx
// Usa las clases de Tailwind
<div className="bg-panel text-text border-border">
<div className="text-success"> // Verde
<div className="text-error">   // Rojo
```

### Colores Disponibles en Tailwind
- `bg-bgStart` / `bg-bgEnd` - Gradientes de fondo
- `bg-panel` / `bg-panel2` - Paneles
- `border-border` - Bordes
- `text-text` / `text-muted` - Textos
- `text-success` / `text-error` / `text-warning` - Estados
- `bg-gunmetal-1` / `bg-gunmetal-2` - Efectos metálicos

## 🧩 Componentes Especiales

### Efectos Metálicos (CSS Puro)
```jsx
// Usa estas clases para efectos que no se pueden hacer con Tailwind
<div className="avatar-metal">   // Avatar con efecto metálico
<div className="header-metal">   // Header con textura metálica
<div className="groovy-name">    // Texto estilizado especial
```

### Animaciones
```jsx
<div className="led-blink">      // Parpadeo de LED
<div className="avatar-pulse">   // Pulso del avatar
```

## 📱 Responsive Design

### Usar Tailwind (Recomendado)
```jsx
<div className="grid grid-cols-1 md:grid-cols-3">
<div className="text-sm md:text-base">
<div className="p-2 md:p-4">
```

### Breakpoints Disponibles
- `sm:` - >= 640px
- `md:` - >= 768px
- `lg:` - >= 1024px
- `xl:` - >= 1280px

## 🔄 Plan de Migración

### ✅ Completado
- [x] Reorganización de archivos
- [x] Documentación de componentes
- [x] Configuración de Tailwind consolidada
- [x] Separación de estilos personalizados

### 🚧 En Progreso
- [ ] Migrar estilos de `base.css` a Tailwind
- [ ] Reemplazar variables CSS con clases de Tailwind
- [ ] Optimizar componentes responsive

### 📋 Próximos Pasos
1. **Migrar gradualmente** estilos de `base.css`
2. **Reemplazar** clases legacy con Tailwind
3. **Eliminar** `base.css` cuando ya no sea necesario

## 💡 Mejores Prácticas

### ✅ Hacer
- Usar clases de Tailwind para layout, colores, spacing
- Usar CSS personalizado solo para efectos complejos
- Documentar estilos personalizados
- Usar nombres de clase descriptivos

### ❌ Evitar
- Mezclar estilos inline con CSS personalizado
- Duplicar estilos entre archivos
- Usar `!important` innecesariamente
- Estilos globales sin documentar

## 🛠️ Comandos Útiles

```bash
# Regenerar CSS de Tailwind (si es necesario)
npx tailwindcss -i ./src/styles.css -o ./public/tailwind.css --watch

# Ver qué clases de Tailwind se están usando
npx tailwindcss -i ./src/styles.css -o ./dist/output.css --content "./src/**/*.{html,js,jsx}"
```

## 📞 Problemas Comunes

### "No veo mis estilos"
1. Verifica que `styles.css` esté importado en `main.jsx`
2. Asegúrate de que las clases de Tailwind estén en `content` del config
3. Revisa que no haya conflictos entre CSS personalizado y Tailwind

### "Los efectos metálicos no funcionan"
1. Verifica que `components.css` esté siendo importado
2. Asegúrate de usar las clases exactas: `.avatar-metal`, `.header-metal`
3. Revisa que no haya CSS que sobrescriba estos estilos

### "Los colores no coinciden"
1. Usa las clases de Tailwind definidas en `tailwind.config.cjs`
2. Para colores especiales, usa las variables CSS en `components.css`
3. Evita mezclar sistemas de colores diferentes
