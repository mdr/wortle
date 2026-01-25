import { Feature } from "geojson"
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps"

import { Coordinates } from "@/lib/Puzzle"
import { ClassNameList } from "@/utils/brandedTypes"
import { cn } from "@/utils/utils"

// Using Natural Earth 50m resolution - more detailed for country-level view
const WORLD_GEO = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"

// rsmKey is added by react-simple-maps for use as React key
type GeoFeature = Feature & { rsmKey: string }

interface UkLocationMapProps {
  coordinates: Coordinates
  className?: ClassNameList
}

export const UkLocationMap = ({ coordinates, className }: UkLocationMapProps) => (
  <div
    className={cn(className, "[&_*]:outline-none [&_svg]:focus:outline-none")}
    style={{ pointerEvents: "none" }}
    tabIndex={-1}
    aria-hidden="true"
    inert={true}
  >
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{
        scale: 150,
      }}
      width={120}
      height={160}
      style={{ width: "100%", height: "100%" }}
    >
      <ZoomableGroup center={[-4.5, 54.75]} zoom={3.5} minZoom={3.5} maxZoom={3.5}>
        <Geographies geography={WORLD_GEO}>
          {({ geographies }: { geographies: GeoFeature[] }) =>
            geographies
              .filter((geo) => ["United Kingdom", "Ireland", "Isle of Man"].includes(geo.properties?.name as string))
              .map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo as object}
                  fill="#e5e5e5"
                  stroke="#d4d4d4"
                  strokeWidth={0.3}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
          }
        </Geographies>
        <Marker coordinates={[coordinates.longitude, coordinates.latitude]}>
          <circle r={1} fill="#16a34a" stroke="#fff" strokeWidth={0.3} />
        </Marker>
      </ZoomableGroup>
    </ComposableMap>
  </div>
)
