"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

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
        className="relative grow overflow-hidden rounded-full bg-neutral-800 data-horizontal:h-2 data-horizontal:w-full data-vertical:h-full data-vertical:w-2"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-indigo-500 select-none data-horizontal:h-full data-vertical:w-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="relative block size-5 shrink-0 rounded-full border-2 border-indigo-400 bg-white ring-offset-neutral-950 transition-all select-none hover:scale-110 hover:shadow-[0_0_15px_rgba(99,102,241,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-grab active:cursor-grabbing"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
