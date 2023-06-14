import mapboxgl from 'mapbox-gl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import {v4} from "uuid"

mapboxgl.accessToken = 'pk.eyJ1Ijoic3RhbGluaHVhbGx1bGxvIiwiYSI6ImNsZzJxNzg3czA1MDUzZmx0ZnJ1aWNndTAifQ.DGLA2uSrwZ4sXR8pelknDA';

export const useMapBox = (puntoInicial) => {
    const mapDiv = useRef();
    const setRef = useCallback((node) => {
        mapDiv.current = node
    }, [])

    // Referencia los marcadores
    const marcadores = useRef({});

    // Observables de Rxjs
    const movimientoMarcador = useRef( new Subject() );
    const nuevoMarcador = useRef( new Subject() );
    
    // Mapa y coords
    const mapa = useRef()
    const [coords, setCoords] = useState(puntoInicial)

    // Funcion para agregar marcadores
    const agregarMarcador = useCallback((ev, id) => {
        const {lng, lat} = ev.lngLat || ev
        const marker = new mapboxgl.Marker();
        marker.id = id ?? v4(); // TODO: si el marcador ya tiene ID
        marker
            .setLngLat([lng, lat])
            .addTo(mapa.current)
            .setDraggable( true );
        
        marcadores.current[marker.id] = marker
        if( !id ){
            nuevoMarcador.current.next({
                id: marker.id,
                lng,
                lat
            })
        }

        // escuchar movimiento del marcador
        marker.on("drag", ({ target }) => {
            const { id } = target;
            const { lng, lat } = target.getLngLat();
            movimientoMarcador.current.next({ id, lng, lat });
        })
      }, [])


    const actualizarPosicion = useCallback(({ id, lng, lat }) => {
        marcadores.current[id].setLngLat([lng, lat])
    }, [])
    

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapDiv.current, // container ID
            style: 'mapbox://styles/mapbox/navigation-night-v1', // style URL
            center: [puntoInicial.lng, puntoInicial.lat], // starting position [lng, lat]
            zoom: puntoInicial.zoom // starting zoom
        });

        mapa.current = map
    }, [puntoInicial]) 

    useEffect(() => {
        mapa.current?.on("move", () => {
            const { lng, lat } = mapa.current.getCenter();
            setCoords({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: mapa.current.getZoom().toFixed(2)
            })
        })
    }, [])


    useEffect(() => {
        mapa.current?.on("click", (ev) => agregarMarcador(ev))
    }, [agregarMarcador])

    return {
        coords,
        marcadores,
        setRef,

        // methods
        agregarMarcador,
        actualizarPosicion,

        // subscribe
        nuevoMarcador$: nuevoMarcador.current,
        movimientoMarcador$: movimientoMarcador.current
    }
}
