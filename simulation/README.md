# Motores de Simulación y Pruebas Volumétricas (Eng & QA)

Para diseñar software capaz de soportar cargas críticas y predecir algoritmos, la escasez de datos orgánicos crudos fue un estorbo que la simulación soluciona (A cargo de Alejandro Artiaga). Aquí reside la ingeniería de "Mocking a escala corporativa".

## 1. El Núcleo de inyección (`generate_dataset.py`)
No es simple data aleatoria u ofuscada en librerías `Faker`. El simulador fue matemáticamente calibrado a base de sesgos lógicos y estadísticos reales utilizando distribuciones complejas probabilísticas.
**Mecánicas y Reglas de la Simulación Oculta:**
- **Regla del Falso Esfuerzo**: El simulador crea un 30% de usuarios "fantasma", programados con intencionalidad probabilistica a fracasar rotundamente después de 7 días.
- **Rachas y Dependencias**: El código implementa funciones Markovianas. Si un usuario no duerme lo necesario matemáticamente (columna Sleep_Time interpolada por Gauss), su tasa métrica de abandono sube linealmente.

## 2. Inmutabilidad Matemática frente al Software
De estas variables salen las métricas para inyectar simultáneamente un set conteniendo `300,000 logs` al clúster de Base de datos, operando como prueba de Estrés Volumétrica. Asegurando que ningún engrane de MongoDB ni ningún Worker procesador de React falle al compreso de cálculo de gamificación.

## 3. Justificación Epistemológica
Sin esta carpeta estructural, resultaría metodológicamente imposible validar los modelos predictivos de Machine Learning de la etapa posterior, proveyendo un "Sandbox" donde la ciencia de datos posee la tela inquebrantable que valida las conclusiones biológicas que busca QUANTIFY.
