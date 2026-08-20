# Sistema Wearable / Dispositivo de Muñeca (Wear OS)

Arquitectura perimetral (Frontend Móvil Nativo) estructurada íntegramente hacia hardware restringido, priorizando rendimiento de memoria y gestión de energía.

## 1. Fundamentos de Arquitectura Android Nivel Watch
Dado el ecosistema Wear OS limitado, el software abandona dependencias pesadas de hilos web, utilizando un flujo asíncrono gestionado a través de Background Services (Threads / Coroutines). Utilizando XML compacto para las Vistas (Layouts esféricos) y directivas Jetpack específicas para mantener al máximo las animaciones por segundo (FPS).

## 2. Sincronización Remota Segura (Secure OTP Bridge)
Debido a la impracticabilidad extrema de ingresar correos electrónicos y contraseñas numéricas extendidas en pantallas limitadas de < 2", se desarrolló una arquitectura de tokenización One Time Password (OTP).
**Flujo de Enrolamiento:**
1. Al incio (`/smartwatch_01_init`), el software realiza petición anónima al servidor.
2. El servidor responde con Tag temporal de 6 caracteres renderizado localmente e inyectado al caché del sistema del dispositivo de pulsera.
3. El frontend de React remoto confirma; y vía WebSocket la autenticación pasa al reloj.
*Genuinamente erradicando el uso del teclado.*

## 3. WorkManagers y Ciclos Persistentes
En la validación `smartwatch_04_settings`, entra otro núcleo técnico. El envío de variables fisiológicas e histórico del pulso de hábitos se desacopla utilizando servicios programados que se encolan automáticamente dependiendo del nivel actual agresivo de "Doze Mode" (Ahorro energético) del ecosistema Wear OS. El temporizador (`_05_timer`) corre fluidamente como Foreground Service.
