import React, { useContext, useEffect } from 'react'
import { useMapBox } from '../hooks/useMapBox';
import { SocketContext } from '../context/SocketContext';


const puntoInicial = {
    lng: -77.0760,
    lat: -12.0694,
    zoom: 13.5
}

export const MapaPage = () => {
    const { socket, online } = useContext( SocketContext );
    const {coords, setRef, nuevoMarcador$, movimientoMarcador$, agregarMarcador, actualizarPosicion} = useMapBox(puntoInicial)

    useEffect(() => {
        socket.on("marcadores-activos", (marcadores) => {
            for (const key of Object.keys(marcadores)) {
                agregarMarcador(marcadores[key], key)
            }
        })
    }, [socket, agregarMarcador])
    

    // funcion para agregar nuevo marcador
    useEffect(() => {
        nuevoMarcador$.subscribe((marcador) => {
            socket.emit("marcador-nuevo", marcador)
        })
    
    }, [nuevoMarcador$, socket])

    useEffect(() => {
        socket.on("marcador-nuevo", (marcador)=>{
            agregarMarcador(marcador, marcador.id)
        })
    }, [socket])

    // funcion para actualizar marcador
    useEffect(() => {
        movimientoMarcador$.subscribe((marcador) => {
            socket.emit("marcador-actualizado", marcador)
        })
    }, [movimientoMarcador$, socket])

    useEffect(() => {
        socket.on("marcador-actualizado", (marcador)=>{
            actualizarPosicion(marcador)
        })
    }, [socket])
    
    

    return (
        <>
            <div className='info'>lng: {coords.lng} | lat: {coords.lat} | zoom: {coords.zoom}</div>
            <div 
                ref={ setRef }
                className="mapContainer"
            />

        </>
    )
}
