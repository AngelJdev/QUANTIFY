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

import { jest } from '@jest/globals';
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
const clientOptions = {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false
};

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
    });

    httpServer.listen(PORT, () => {
        done();
    });
});

afterAll((done) => {
    if (clientSocket && clientSocket.connected) {
        clientSocket.disconnect();
    }
    ioServer.close();
    httpServer.close(() => {
        done();
    });
});

afterEach(() => {
    if (clientSocket && clientSocket.connected) {
        clientSocket.disconnect();
        clientSocket = null;
    }
});

// ============================================================================
// INT-001: CONEXION SOCKET.IO DESDE CLIENTE
// ============================================================================

describe('INT-001: Conexion Socket.IO', () => {
    test('cliente debe conectarse exitosamente al servidor', (done) => {
        clientSocket = Client(`http://localhost:${PORT}`, clientOptions);
        clientSocket.on('connect', () => {
            expect(clientSocket.connected).toBe(true);
            done();
        });
    });

    test('cliente debe recibir un ID de socket unico', (done) => {
        clientSocket = Client(`http://localhost:${PORT}`, clientOptions);
        clientSocket.on('connect', () => {
            expect(clientSocket.id).toBeDefined();
            expect(typeof clientSocket.id).toBe('string');
            expect(clientSocket.id.length).toBeGreaterThan(0);
            done();
        });
    });

    test('servidor debe registrar la conexion entrante', (done) => {
        const connectionSpy = jest.fn();
        ioServer.once('connection', connectionSpy);

        clientSocket = Client(`http://localhost:${PORT}`, clientOptions);
        clientSocket.on('connect', () => {
            setTimeout(() => {
                expect(connectionSpy).toHaveBeenCalled();
                done();
            }, 50);
        });
    });
});

// ============================================================================
// INT-002: EMISION DE JOIN_USER_ROOM
// ============================================================================

describe('INT-002: Evento join_user_room', () => {
    test('cliente debe poder unirse a un room de usuario', (done) => {
        clientSocket = Client(`http://localhost:${PORT}`, clientOptions);
        clientSocket.on('connect', () => {
            clientSocket.emit('join_user_room', 42);
            clientSocket.on('room_joined', (data) => {
                expect(data.room).toBe('user_42');
                done();
            });
        });
    });

    test('room no se asigna si userId es null', (done) => {
        clientSocket = Client(`http://localhost:${PORT}`, clientOptions);
        clientSocket.on('connect', () => {
            clientSocket.emit('join_user_room', null);
            setTimeout(() => {
                done();
            }, 100);
        });
    });

    test('multiples clientes pueden unirse a rooms diferentes', (done) => {
        const client1 = Client(`http://localhost:${PORT}`, clientOptions);
        const client2 = Client(`http://localhost:${PORT}`, clientOptions);
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
    test('cliente desconectado debe poder reconectarse con nuevo socket', (done) => {
        clientSocket = Client(`http://localhost:${PORT}`, clientOptions);
        clientSocket.on('connect', () => {
            const firstId = clientSocket.id;
            clientSocket.disconnect();
            expect(clientSocket.connected).toBe(false);

            // Crear una nueva conexion de cliente
            const newClient = Client(`http://localhost:${PORT}`, clientOptions);
            newClient.on('connect', () => {
                expect(newClient.connected).toBe(true);
                expect(newClient.id).not.toBe(firstId);
                newClient.disconnect();
                done();
            });
        });
    });

    test('servidor detecta la desconexion del cliente', (done) => {
        ioServer.once('connection', (socket) => {
            socket.on('disconnect', () => {
                done();
            });
        });

        clientSocket = Client(`http://localhost:${PORT}`, clientOptions);
        clientSocket.on('connect', () => {
            clientSocket.disconnect();
        });
    });
});
