import React, { useEffect, useRef } from 'react'

export default function CesiumViewer({
  rainfall,
  riskScore,
  showTerrain,
  showFloodZones,
  prediction,
  probability,
  selectedLocation,
  onLocationSelect
}) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const cesiumRef = useRef(null)
  const floodLayerRef = useRef(null)
  const predictionCircleRef = useRef(null)

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

        // ====================================================================
        // MAP CLICK HANDLER - Capture coordinates
        // ====================================================================
        viewer.screenSpaceEventHandler.setInputAction((click) => {
          const pickedObject = viewer.scene.pick(click.position)

          if (Cesium.defined(pickedObject)) {
            // User clicked on an entity; just log it
            console.log('[Cesium] Clicked entity:', pickedObject.id)
          }

          // Get coordinates at mouse position
          const cartesian = viewer.scene.pickPosition(click.position)
          if (Cesium.defined(cartesian)) {
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
            const latitude = Cesium.Math.toDegrees(cartographic.latitude)
            const longitude = Cesium.Math.toDegrees(cartographic.longitude)

            console.log('[Cesium] Map click - Lat:', latitude, 'Lon:', longitude)

            // Send coordinates to parent component
            if (onLocationSelect) {
              onLocationSelect({
                lat: latitude,
                lon: longitude
              })
            }
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
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
      predictionCircleRef.current = null
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

  // Update prediction overlay circle when prediction or location changes
  useEffect(() => {
    const Cesium = cesiumRef.current
    const viewer = viewerRef.current
    if (!Cesium || !viewer) return

    // Remove old prediction circle if exists
    if (predictionCircleRef.current) {
      viewer.entities.remove(predictionCircleRef.current)
      predictionCircleRef.current = null
    }

    // Add new prediction circle if we have a location and prediction
    if (selectedLocation && prediction !== null) {
      const circleColor =
        prediction === 1
          ? Cesium.Color.RED.withAlpha(0.5)
          : Cesium.Color.GREEN.withAlpha(0.5)

      const circle = viewer.entities.add({
        id: 'prediction-circle',
        position: Cesium.Cartesian3.fromDegrees(selectedLocation.lon, selectedLocation.lat),
        ellipse: {
          semiMinorAxis: 500,
          semiMajorAxis: 500,
          material: circleColor
        }
      })

      predictionCircleRef.current = circle
      console.log('[Cesium] Added prediction circle:', prediction === 1 ? 'HIGH RISK' : 'LOW RISK')
    }
  }, [selectedLocation, prediction])

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

