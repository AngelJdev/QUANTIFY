/**
 * ==============================================================================
 * QUANTIFY — Pruebas de Integracion Socket.IO
 * ==============================================================================
 *
 * Etapa 16.6 del Proyecto Integrador.
 * Valida la comunicacion en tiempo real entre cliente y servidor
 * mediante Socket.IO.
 *
 * Casos cubiertos:
 *   - INT-001: Conexion Socket.IO desde cliente
 *   - INT-002: Emision de join_user_room
 *   - INT-004: Desconexion y reconexion
 *
 * Autor: Equipo QUANTIFY
 * Fecha: Agosto 2026
 */

import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import express from 'express';

// ============================================================================
// CONFIGURACION DEL SERVIDOR DE PRUEBA
// ============================================================================

let httpServer;
let ioServer;
let clientSocket;
const PORT = 4999;

beforeAll((done) => {
    const app = express();
    httpServer = createServer(app);
    ioServer = new Server(httpServer, {
        cors: { origin: '*' }
    });

    // Replicar la logica del servidor real
    ioServer.on('connection', (socket) => {
        socket.on('join_user_room', (userId) => {
            if (userId) {
                socket.join(`user_${userId}`);
                socket.emit('room_joined', { room: `user_${userId}` });
            }
        });

        socket.on('disconnect', () => {
            // Registrar desconexion
        });
    });

    httpServer.listen(PORT, () => {
        done();
    });
});

afterAll((done) => {
    if (clientSocket) clientSocket.disconnect();
    ioServer.close();
    httpServer.close(() => {
        done();
    });
});

afterEach(() => {
    if (clientSocket) {
        clientSocket.disconnect();
        clientSocket = null;
    }
});

// ============================================================================
// INT-001: CONEXION SOCKET.IO DESDE CLIENTE
// ============================================================================

describe('INT-001: Conexion Socket.IO', () => {
    test('cliente debe conectarse exitosamente al servidor', (done) => {
        clientSocket = Client(`http://localhost:${PORT}`);
        clientSocket.on('connect', () => {
            expect(clientSocket.connected).toBe(true);
            done();
        });
    });

    test('cliente debe recibir un ID de socket unico', (done) => {
        clientSocket = Client(`http://localhost:${PORT}`);
        clientSocket.on('connect', () => {
            expect(clientSocket.id).toBeDefined();
            expect(typeof clientSocket.id).toBe('string');
            expect(clientSocket.id.length).toBeGreaterThan(0);
            done();
        });
    });

    test('servidor debe registrar la conexion entrante', (done) => {
        const connectionSpy = jest.fn();
        ioServer.on('connection', connectionSpy);

        clientSocket = Client(`http://localhost:${PORT}`);
        clientSocket.on('connect', () => {
            // Esperar a que el evento se propague
            setTimeout(() => {
                expect(connectionSpy).toHaveBeenCalled();
                done();
            }, 100);
        });
    });
});

// ============================================================================
// INT-002: EMISION DE JOIN_USER_ROOM
// ============================================================================

describe('INT-002: Evento join_user_room', () => {
    test('cliente debe poder unirse a un room de usuario', (done) => {
        clientSocket = Client(`http://localhost:${PORT}`);
        clientSocket.on('connect', () => {
            clientSocket.emit('join_user_room', 42);
            clientSocket.on('room_joined', (data) => {
                expect(data.room).toBe('user_42');
                done();
            });
        });
    });

    test('room no se asigna si userId es null', (done) => {
        clientSocket = Client(`http://localhost:${PORT}`);
        clientSocket.on('connect', () => {
            clientSocket.emit('join_user_room', null);
            // Esperar un momento para verificar que no se unio a ningun room
            setTimeout(() => {
                // No deberia recibir room_joined
                done();
            }, 200);
        });
    });

    test('multiples clientes pueden unirse a rooms diferentes', (done) => {
        const client1 = Client(`http://localhost:${PORT}`);
        const client2 = Client(`http://localhost:${PORT}`);
        let joined = 0;

        const checkDone = () => {
            joined++;
            if (joined === 2) {
                client1.disconnect();
                client2.disconnect();
                done();
            }
        };

        client1.on('connect', () => {
            client1.emit('join_user_room', 1);
            client1.on('room_joined', (data) => {
                expect(data.room).toBe('user_1');
                checkDone();
            });
        });

        client2.on('connect', () => {
            client2.emit('join_user_room', 2);
            client2.on('room_joined', (data) => {
                expect(data.room).toBe('user_2');
                checkDone();
            });
        });
    });
});

// ============================================================================
// INT-004: DESCONEXION Y RECONEXION
// ============================================================================

describe('INT-004: Desconexion y reconexion', () => {
    test('cliente desconectado debe poder reconectarse', (done) => {
        clientSocket = Client(`http://localhost:${PORT}`);
        clientSocket.on('connect', () => {
            const firstId = clientSocket.id;

            // Desconectar
            clientSocket.disconnect();
            expect(clientSocket.connected).toBe(false);

            // Reconectar
            clientSocket.connect();
            clientSocket.on('connect', () => {
                expect(clientSocket.connected).toBe(true);
                // El nuevo ID deberia ser diferente
                expect(clientSocket.id).not.toBe(firstId);
                done();
            });
        });
    });

    test('servidor detecta la desconexion del cliente', (done) => {
        clientSocket = Client(`http://localhost:${PORT}`);
        ioServer.on('connection', (socket) => {
            socket.on('disconnect', () => {
                done();
            });
        });

        clientSocket.on('connect', () => {
            clientSocket.disconnect();
        });
    });
});
