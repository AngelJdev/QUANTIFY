import Habit from '../models/habit.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createHabit = async (req, res, next) => {
    try {
        const habitData = { ...req.body, usuario_id: req.user.id };
        const habit = await Habit.create(habitData);
        return sendSuccess(res, 201, 'Hábito creado', habit);
    } catch (error) {
        next(error);
    }
};

export const getAllHabits = async (req, res, next) => {
    try {
        const habits = await Habit.findAll({
            where: { usuario_id: req.user.id },
            order: [['fecha_creacion', 'DESC']]
        });
        return sendSuccess(res, 200, 'Hábitos recuperados', habits);
    } catch (error) {
        next(error);
    }
};

export const getHabitById = async (req, res, next) => {
    try {
        const habit = await Habit.findOne({
            where: { id: req.params.id, usuario_id: req.user.id }
        });
        
        if (!habit) {
            return sendError(res, 404, 'Hábito no encontrado o no pertenece al usuario');
        }
        
        return sendSuccess(res, 200, 'Hábito encontrado', habit);
    } catch (error) {
        next(error);
    }
};

export const updateHabit = async (req, res, next) => {
    try {
        const habit = await Habit.findOne({
            where: { id: req.params.id, usuario_id: req.user.id }
        });

        if (!habit) {
            return sendError(res, 404, 'Hábito no encontrado');
        }

        const updatedHabit = await habit.update(req.body);
        return sendSuccess(res, 200, 'Hábito actualizado', updatedHabit);
    } catch (error) {
        next(error);
    }
};

export const deleteHabit = async (req, res, next) => {
    try {
        const habit = await Habit.findOne({
            where: { id: req.params.id, usuario_id: req.user.id }
        });

        if (!habit) {
            return sendError(res, 404, 'Hábito no encontrado');
        }

        await habit.destroy();
        return sendSuccess(res, 200, 'Hábito eliminado correctamente');
    } catch (error) {
        next(error);
    }
};
