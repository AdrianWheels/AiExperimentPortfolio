import React, { useState } from 'react'

// Todas las imágenes disponibles
const KIRA_IMAGES = [
  'KIRA_ANGRY',
  'KIRA_BLINK', 
  'KIRA_FOCUS',
  'KIRA_FREE',
  'KIRA_IRONIC',
  'KIRA_LOVE',
  'KIRA_NEUTRAL',
  'KIRA_REFLEX',
  'KIRA_SUSPECT',
  'KIRA_TALK',
  'KIRA_TIRED'
]

export default function ImageTester() {
  const [currentImage, setCurrentImage] = useState('KIRA_NEUTRAL')
  const [imageStatus, setImageStatus] = useState({})

  const handleImageLoad = (imageName) => {
    setImageStatus(prev => ({ ...prev, [imageName]: 'loaded' }))
  }

  const handleImageError = (imageName) => {
    setImageStatus(prev => ({ ...prev, [imageName]: 'error' }))
  }

  return (
    <div className="bg-panel p-6 rounded-lg border border-border">
      <h3 className="text-xl font-bold mb-4 text-center">Probador de Imágenes KIRA</h3>
      
      {/* Vista previa de la imagen actual */}
      <div className="flex justify-center mb-6">
        <div className="w-40 h-40 bg-zinc-900 rounded-full flex items-center justify-center border-2 border-zinc-600 overflow-hidden">
          <div className="w-32 h-32 relative">
            <img 
              src={`/kira_images/${currentImage}.png`} 
              alt={`KIRA - ${currentImage}`}
              className="w-full h-full object-cover scale-150"
              onLoad={() => handleImageLoad(currentImage)}
              onError={() => handleImageError(currentImage)}
            />
          </div>
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-lg font-semibold">{currentImage}</p>
        <p className="text-sm text-gray-400">
          Estado: {imageStatus[currentImage] === 'loaded' ? '✅ Cargada' : 
                   imageStatus[currentImage] === 'error' ? '❌ Error' : '⏳ Cargando...'}
        </p>
      </div>

      {/* Botonera */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {KIRA_IMAGES.map((imageName) => (
          <button
            key={imageName}
            onClick={() => setCurrentImage(imageName)}
            className={`px-3 py-2 text-xs rounded transition-colors ${
              currentImage === imageName 
                ? 'bg-emerald-600 text-white' 
                : 'bg-zinc-700 hover:bg-zinc-600 text-gray-300'
            }`}
          >
            {imageName.replace('KIRA_', '')}
          </button>
        ))}
      </div>

      {/* Prueba de me.jpg */}
      <div className="border-t border-border pt-4">
        <h4 className="text-lg font-semibold mb-3">Imagen de Portfolio (me.jpg)</h4>
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-lg overflow-hidden border border-zinc-600">
            <img 
              src="/me.jpg" 
              alt="Foto de perfil"
              className="w-full h-full object-cover"
              onLoad={() => handleImageLoad('me.jpg')}
              onError={() => handleImageError('me.jpg')}
            />
          </div>
        </div>
        <p className="text-center text-sm text-gray-400 mt-2">
          Estado: {imageStatus['me.jpg'] === 'loaded' ? '✅ Cargada' : 
                   imageStatus['me.jpg'] === 'error' ? '❌ Error' : '⏳ Cargando...'}
        </p>
      </div>

      {/* Resumen de estados */}
      <div className="border-t border-border pt-4 mt-4">
        <h4 className="text-sm font-semibold mb-2">Resumen de imágenes:</h4>
        <div className="text-xs space-y-1">
          {KIRA_IMAGES.concat(['me.jpg']).map((imageName) => (
            <div key={imageName} className="flex justify-between">
              <span>{imageName}</span>
              <span>
                {imageStatus[imageName] === 'loaded' ? '✅' : 
                 imageStatus[imageName] === 'error' ? '❌' : '⏳'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}