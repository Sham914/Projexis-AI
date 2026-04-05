"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full border border-indigo-500/20 bg-neutral-800/90 data-horizontal:h-3 data-horizontal:w-full data-vertical:h-full data-vertical:w-3"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute z-[1] select-none !bg-[#4f46e5] data-horizontal:h-full data-vertical:w-full shadow-[0_0_16px_rgba(79,70,229,0.65)]"
          style={{ backgroundColor: "#4f46e5" }}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="relative z-[2] block size-6 shrink-0 rounded-full border-2 border-indigo-200 bg-neutral-50 ring-2 ring-indigo-500/25 ring-offset-neutral-950 transition-all select-none hover:scale-110 hover:shadow-[0_0_18px_rgba(79,70,229,0.85)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/70 cursor-grab active:cursor-grabbing"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
