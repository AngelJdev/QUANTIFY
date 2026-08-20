# 🎯 Visión del Producto: Quantify

## 1. Declaración de Misión
**Quantify** es una aplicación de seguimiento de hábitos diseñada para transformar la disciplina personal en un proceso medible, visual y motivador. El objetivo es ayudar a los usuarios a construir una mejor versión de sí mismos a través de datos claros y una interfaz sin fricciones.

## 2. El Problema (The Pain Points)
Actualmente, los usuarios que intentan mejorar su vida se enfrentan a:
* **Falta de visualización:** Es difícil ver el progreso real a largo plazo.
* **Aplicaciones saturadas:** Muchas apps de hábitos son demasiado complejas o están llenas de anuncios.
* **Falta de contexto:** Los hábitos no se miden solo con "sí/no", a veces se necesita cuantificar el esfuerzo.

## 3. Propuesta de Valor (La Solución)
Quantify se diferencia por:
* **Minimalismo Funcional:** Una interfaz limpia que prioriza la acción sobre la configuración.
* **Enfoque en el Progreso:** Gráficos que realmente muestran la evolución del usuario (basado en tus conocimientos de desarrollo y gestión).
* **Adaptabilidad:** Diseñada para ser escalable, desde un seguimiento simple hasta métricas avanzadas.

## 4. Público Objetivo
* **Estudiantes y Profesionales:** Personas que buscan optimizar su tiempo y productividad.
* **Entusiastas del Fitness:** Usuarios que, como yo, buscan ver un progreso físico y mental constante.
* **Desarrolladores:** Personas que valoran las herramientas bien construidas y centradas en los datos.

## 5. Objetivos Estratégicos (MVP - Producto Mínimo Viable)
Para el lanzamiento de la primera fase, Quantify debe:
1. Permitir la creación, edición y eliminación de hábitos.
2. Registrar el cumplimiento diario con un solo toque.
3. Mostrar una racha (streak) visual para fomentar la consistencia.
4. Ser multiplataforma (o tener una base técnica que lo permita).

## 6. Diferenciadores clave
* **Propiedad de los datos:** El usuario tiene control total sobre su información.
* **Estética de ingeniería:** Un diseño que refleja orden, lógica y eficiencia.

## 7. Ciencia del Comportamiento y Métricas Analíticas

Quantify no se limita a registrar rachas binarias (Check-in). Su arquitectura de datos está diseñada para evaluar la consolidación de hábitos mediante métricas basadas en ciencia del comportamiento y fisiología del ejercicio.

### A. Tasa de Adherencia (Consistency Score)
Mide la constancia pura del usuario, independientemente del rendimiento. Es el indicador principal de que la fase de "adquisición del hábito" está funcionando.
* **Fórmula:** $Adherencia = \left( \frac{\text{Días Cumplidos}}{\text{Días Programados}} \right) \times 100$
* **Métrica de éxito:** Superar el 80% de adherencia durante 66 días (tiempo promedio científico para la automatización de un hábito).

### B. Tendencia de Crecimiento (Growth Trend)
Para hábitos cuantitativos, el éxito es la mejora continua. Quantify analiza la tendencia de los `valores_registrados` a lo largo del tiempo.
* **Métrica de éxito:** Una pendiente positiva en la gráfica temporal del hábito.
* **Caso de uso:** Pasar de estudiar 30 minutos a 1 hora diaria, o de ahorrar 20 a 50 pesos diarios (por poner de ejemplo la moneda mexicana) de forma consistente. El sistema no solo anota el evento, sino que demuestra gráficamente la expansión de la capacidad del usuario.

### C. Nivel de Fricción (Friction Score)
El sistema permitirá correlacionar el valor numérico registrado con notas cualitativas sobre qué tan difícil fue cumplir el hábito ese día.
* **Métrica de éxito:** Mantener el rendimiento (páginas, tiempo, ahorro) mientras la sensación de dificultad o esfuerzo mental disminuye con el paso de las semanas.

### D. Tasa de Retención a Largo Plazo (Cohort Analysis)
A nivel sistema, mediremos el porcentaje de usuarios que siguen registrando datos después de 30, 60 y 90 días usando análisis de cohortes para iterar sobre el UX/UI de la aplicación.