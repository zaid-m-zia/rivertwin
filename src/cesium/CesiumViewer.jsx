import React, { useEffect, useRef } from 'react'

export default function CesiumViewer({ rainfall, riskScore, showTerrain, showFloodZones }) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const cesiumRef = useRef(null)
  const floodLayerRef = useRef(null)

  // Initialize Cesium viewer once
  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const Cesium = await import('cesium')
        cesiumRef.current = Cesium

        // Set Ion token before any Ion requests (terrain/imagery)
        Cesium.Ion.defaultAccessToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3MjY2ODBmYS0zY2Y4LTQ0MjgtOGNmOC0yMDJlNmUxYzBlOWEiLCJpZCI6Mzg5NTc1LCJpYXQiOjE3NzA4MTAwNjF9.THpURCh7P6D2eWVGvJhngBr4KJpbOFusavxhyGgaD2s'

        // Determine initial terrain provider based on prop
        const initialTerrain = showTerrain
          ? await Cesium.createWorldTerrainAsync()
          : new Cesium.EllipsoidTerrainProvider()

        if (!mounted || !containerRef.current) return

        const viewer = new Cesium.Viewer(containerRef.current, {
          terrainProvider: initialTerrain,
          timeline: false,
          animation: false
        })

        viewer.scene.globe.depthTestAgainstTerrain = true
        viewerRef.current = viewer

        // Camera initial position
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(77.1025, 28.7041, 25000),
          duration: 2.5
        })

        // Load flood layer placeholder if enabled
        if (showFloodZones) {
          const rect = viewer.entities.add({
            id: 'placeholder-flood-rect',
            rectangle: {
              coordinates: Cesium.Rectangle.fromDegrees(77.01, 28.60, 77.19, 28.80),
              material: Cesium.Color.fromCssColorString('#ff0000').withAlpha(0.25),
              height: 0
            }
          })
          floodLayerRef.current = rect
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Cesium init error', e)
      }
    }

    init()

    return () => {
      mounted = false
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
      cesiumRef.current = null
      floodLayerRef.current = null
    }
  }, [])

  // Switch terrain provider when showTerrain changes
  useEffect(() => {
    const Cesium = cesiumRef.current
    const viewer = viewerRef.current
    if (!Cesium || !viewer) return

    let cancelled = false

    async function switchTerrain() {
      if (!showTerrain) {
        // Switch to ellipsoid (flat) terrain when disabled
        viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider()
        return
      }

      // Restore world terrain
      const tp = await Cesium.createWorldTerrainAsync()
      if (cancelled) return
      viewer.terrainProvider = tp
    }

    switchTerrain()

    return () => {
      cancelled = true
    }
  }, [showTerrain])

  // Manage placeholder flood layer when toggled
  useEffect(() => {
    const Cesium = cesiumRef.current
    const viewer = viewerRef.current
    if (!Cesium || !viewer) return

    if (showFloodZones) {
      if (!floodLayerRef.current) {
        const rect = viewer.entities.add({
          id: 'placeholder-flood-rect',
          rectangle: {
            coordinates: Cesium.Rectangle.fromDegrees(77.01, 28.60, 77.19, 28.80),
            material: Cesium.Color.fromCssColorString('#ff0000').withAlpha(0.25),
            height: 0
          }
        })
        floodLayerRef.current = rect
      }
    } else {
      if (floodLayerRef.current) {
        viewer.entities.remove(floodLayerRef.current)
        floodLayerRef.current = null
      }
    }
  }, [showFloodZones])

  // Hook for future dynamic updates driven by rainfall or riskScore
  useEffect(() => {
    // Example: when risk changes, update styling of flood layer in future
    // TODO: Replace placeholder flood layer with ArcGIS exported GeoJSON
  }, [rainfall, riskScore])

  return (
    <div ref={containerRef} className="cesium-container">
      <div className="floating-legend" aria-hidden>
        <div style={{fontSize:12,fontWeight:600,marginBottom:6,color:'var(--text)'}}>Risk Legend</div>
        <div className="legend-item"><span className="legend-swatch" style={{background:'var(--low)'}} /> <span style={{color:'var(--text-muted)',fontSize:13}}>Low</span></div>
        <div className="legend-item"><span className="legend-swatch" style={{background:'var(--med)'}} /> <span style={{color:'var(--text-muted)',fontSize:13}}>Medium</span></div>
        <div className="legend-item"><span className="legend-swatch" style={{background:'var(--high)'}} /> <span style={{color:'var(--text-muted)',fontSize:13}}>High</span></div>
      </div>
    </div>
  )
}

