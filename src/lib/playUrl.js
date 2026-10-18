// Enlace del juego con la sala: al abrirlo, el juego guarda el código y lo deja puesto en la ventana
// de niveles (ver earthcation_sg: RoomLink + plantilla WebGL)
export const PLAY_URL = (import.meta.env.VITE_PLAY_URL || 'https://play.earthcation.saimers.dev').replace(/\/$/, '')
export const roomLink = (code) => `${PLAY_URL}/?sala=${encodeURIComponent(code)}`
