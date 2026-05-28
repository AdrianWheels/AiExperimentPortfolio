import React from 'react'

const ProjectCardCompact = ({ project, onSelect }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(project)}
      className="
        w-full text-left rounded-xl px-3 py-2.5
        bg-white/[0.025] hover:bg-white/[0.06]
        border border-white/5 hover:border-purple-500/30
        transition-colors duration-200
        group
      "
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <h4 className="text-sm font-semibold text-gray-200 group-hover:text-white truncate">
          {project.name}
        </h4>
        <span className="text-[10px] font-mono text-gray-500 shrink-0">
          {project.year}
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {project.tags.slice(0, 2).map(tag => (
          <span
            key={tag}
            className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5"
          >
            {tag}
          </span>
        ))}
        <span className="ml-auto text-[10px] text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
          →
        </span>
      </div>
    </button>
  )
}

export default ProjectCardCompact
