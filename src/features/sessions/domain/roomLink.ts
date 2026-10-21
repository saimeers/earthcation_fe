// Enlace del juego con la sala: al abrirlo, el juego guarda el código y lo deja puesto en la ventana
// de niveles (ver earthcation_sg: RoomLink + plantilla WebGL).
export const roomLink = (playUrl: string, code: string): string => `${playUrl}/?sala=${encodeURIComponent(code)}`
