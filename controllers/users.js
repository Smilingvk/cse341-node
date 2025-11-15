// controllers/usersController.js
const mongodb = require('../data/database');
const { ObjectId } = require('mongodb');

const collectionName = 'users';

function isValidId(id) {
  return ObjectId.isValid(id);
}

const getAll = async (req, res) => {
  try {
    const cursor = mongodb.getDatabase().db().collection(collectionName).find();
    const users = await cursor.toArray();
    return res.status(200).json(users);
  } catch (err) {
    console.error('getAll error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getSingle = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidId(id)) return res.status(400).json({ error: 'ID inválido' });

    const user = await mongodb.getDatabase().db().collection(collectionName).findOne({ _id: new ObjectId(id) });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.status(200).json(user);
  } catch (err) {
    console.error('getSingle error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const createUser = async (req, res) => {
  try {
    // validar campos mínimos
    const { firstName, lastName, email, favoriteColor, birthday } = req.body;
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'firstName, lastName y email son obligatorios' });
    }

    const user = { firstName, lastName, email, favoriteColor, birthday };
    const response = await mongodb.getDatabase().db().collection(collectionName).insertOne(user);

    if (response.acknowledged) {
      return res.status(201).json({ id: response.insertedId });
    }
    return res.status(500).json({ error: 'No se pudo crear el usuario' });
  } catch (err) {
    console.error('createUser error:', err);
    if (err.code === 11000) return res.status(409).json({ error: 'Email duplicado' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidId(id)) return res.status(400).json({ error: 'ID inválido' });

    const allowed = ['firstName','lastName','email','favoriteColor','birthday'];
    const updateDoc = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updateDoc[k] = req.body[k]; });

    if (Object.keys(updateDoc).length === 0) return res.status(400).json({ error: 'No hay campos para actualizar' });

    const response = await mongodb.getDatabase().db().collection(collectionName)
      .updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });

    if (response.matchedCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.status(200).json({ matchedCount: response.matchedCount, modifiedCount: response.modifiedCount });
  } catch (err) {
    console.error('updateUser error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidId(id)) return res.status(400).json({ error: 'ID inválido' });

    const response = await mongodb.getDatabase().db().collection(collectionName)
      .deleteOne({ _id: new ObjectId(id) });

    if (response.deletedCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.status(204).end();
  } catch (err) {
    console.error('deleteUser error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAll, getSingle, createUser, updateUser, deleteUser };