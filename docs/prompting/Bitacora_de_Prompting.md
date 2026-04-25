# 📓 Bitácora de Prompting — Uso Responsable de IA Generativa

> Registro de prompts utilizados durante el desarrollo del sistema **QUANTIFY**, documentando objetivos, resultados y validaciones realizadas para garantizar un uso responsable de la inteligencia artificial generativa.

---

## Índice

1. [Validaciones Backend con express-validator](#1-validaciones-backend-con-express-validator)
2. [Sistema de Autenticación con JWT y Bcrypt](#2-sistema-de-autenticación-con-jwt-y-bcrypt)
3. [Dashboard de Seguimiento de Hábitos](#3-dashboard-de-seguimiento-de-hábitos)
4. [Formulario de Registro de Hábitos con Formik y Yup](#4-formulario-de-registro-de-hábitos-con-formik-y-yup)

---

## 1. Validaciones Backend con express-validator

### 🧩 Prompt utilizado

```
Validaciones Backend: Un middleware usando express-validator para una ruta de ejemplo
(ej. creación de un registro). Debe validar que los campos requeridos no estén vacíos,
que los correos tengan formato válido y sanitizar las entradas para evitar inyecciones.
```

### 🎯 Objetivo

Implementar validaciones seguras en el backend para controlar la información enviada por los usuarios y evitar errores, datos incompletos o posibles vulnerabilidades de seguridad.

### ✅ Resultado obtenido

Se obtuvo un middleware funcional utilizando `express-validator` que permitió:

- Validar campos obligatorios
- Verificar formatos correctos de correo electrónico
- Sanitizar entradas antes de ser procesadas por el servidor

### 🔍 Validación realizada

El código generado fue **revisado manualmente**, probado dentro del entorno de desarrollo y adaptado a las necesidades específicas del backend del sistema.

---

## 2. Sistema de Autenticación con JWT y Bcrypt

### 🧩 Prompt utilizado

```
Actúa como un desarrollador backend senior experto en Node.js, Express y seguridad web.

Necesito implementar un sistema de autenticación seguro para mi aplicación web.
Genera un flujo completo de registro e inicio de sesión utilizando JWT y Bcrypt.js.
Debe incluir hash de contraseñas, generación de token, protección de rutas privadas
mediante middleware y buenas prácticas de seguridad para evitar accesos no autorizados.
```

### 🎯 Objetivo

Desarrollar un sistema de autenticación seguro que permitiera proteger la información de los usuarios y controlar el acceso a las distintas funcionalidades privadas dentro del sistema QUANTIFY.

### ✅ Resultado obtenido

Se obtuvo una base funcional para el registro e inicio de sesión de usuarios, incluyendo:

- Cifrado de contraseñas con `Bcrypt.js`
- Generación de tokens `JWT`
- Protección de rutas privadas mediante middleware de autenticación
  Esto permitió mejorar significativamente la seguridad general del sistema y garantizar una gestión adecuada de sesiones de usuario.

### 🔍 Validación realizada

El código generado fue **revisado, probado y ajustado manualmente** para adaptarlo a la estructura real del backend y al modelo de usuarios implementado en el proyecto.

---

## 3. Dashboard de Seguimiento de Hábitos

### 🧩 Prompt utilizado

```
Actúa como un desarrollador Frontend Senior experto en React, Tailwind CSS y Recharts.

Necesito crear un dashboard moderno para una aplicación de seguimiento de hábitos
personales. Genera una interfaz visual que muestre estadísticas semanales, porcentaje
de cumplimiento, hábitos completados, rachas de constancia y progreso mensual
utilizando gráficas profesionales y diseño responsivo.
```

### 🎯 Objetivo

Diseñar una interfaz visual atractiva que permitiera a los usuarios analizar su progreso personal mediante estadísticas claras, facilitando el seguimiento de hábitos y el mantenimiento de la motivación.

### ✅ Resultado obtenido

Se generó una estructura visual para el dashboard principal del sistema, incluyendo:

- Gráficas de barras con `Recharts`
- Porcentajes de cumplimiento
- Tarjetas de resumen con información relevante sobre el progreso del usuario
  Esto mejoró considerablemente la experiencia visual y la interpretación de datos dentro de la plataforma.

### 🔍 Validación realizada

Se ajustaron manualmente **colores, diseño, lógica de datos y distribución visual** para mantener consistencia con la identidad gráfica y funcional de QUANTIFY.

---

## 4. Formulario de Registro de Hábitos con Formik y Yup

### 🧩 Prompt utilizado

```
Actúa como un desarrollador experto en React, Formik y Yup.

Necesito crear un formulario para registrar hábitos personales dentro de mi aplicación.
Genera un formulario completo con validaciones para nombre del hábito, categoría,
frecuencia, meta semanal, recordatorios automáticos y mensajes de error claros para
mejorar la experiencia del usuario.
```

### 🎯 Objetivo

Implementar formularios robustos y funcionales que permitieran al usuario registrar hábitos de forma sencilla, evitando errores de captura y mejorando la experiencia de uso.

### ✅ Resultado obtenido

Se obtuvo un formulario dinámico con validaciones automáticas que permitió:

- Controlar errores en tiempo real
- Verificar campos obligatorios
- Mejorar la interacción del usuario con el sistema
  Esto ayudó a reducir errores de registro y fortaleció la calidad de los datos almacenados.

### 🔍 Validación realizada

Las reglas de validación fueron **revisadas y personalizadas manualmente** para ajustarse a los requerimientos funcionales reales del sistema QUANTIFY.

---

## 📌 Consideraciones sobre Uso Responsable

| Principio                 | Aplicación en este proyecto                                                             |
| ------------------------- | --------------------------------------------------------------------------------------- |
| **Supervisión humana**    | Todo el código generado fue revisado y validado manualmente antes de integrarse         |
| **Adaptación contextual** | Los resultados se ajustaron a la arquitectura real del sistema, no se usaron "tal cual" |
| **Transparencia**         | Se documenta el prompt exacto utilizado en cada caso                                    |
| **Propósito claro**       | Cada prompt tiene un objetivo definido y un resultado esperado concreto                 |

---

_Bitácora desarrollada como parte del proyecto académico QUANTIFY — Sistema de Seguimiento de Hábitos Personales._
