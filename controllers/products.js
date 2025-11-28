// controllers/products.js
const mongodb = require('../data/database');
const { ObjectId } = require('mongodb');

const collectionName = 'products';

function isValidId(id) {
  return ObjectId.isValid(id);
}

const getAll = async (req, res) => {
  try {
    const cursor = mongodb.getDatabase().db().collection(collectionName).find();
    const products = await cursor.toArray();
    return res.status(200).json(products);
  } catch (err) {
    console.error('getAll error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getSingle = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidId(id)) return res.status(400).json({ error: 'ID inválido' });

    const product = await mongodb.getDatabase().db().collection(collectionName).findOne({ _id: new ObjectId(id) });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    return res.status(200).json(product);
  } catch (err) {
    console.error('getSingle error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const createProduct = async (req, res) => {
  try {
    // Validar campos obligatorios (al menos 7 campos)
    const { name, description, price, category, stock, manufacturer, releaseDate } = req.body;
    
    if (!name || !description || !price || !category) {
      return res.status(400).json({ 
        error: 'name, description, price y category son obligatorios' 
      });
    }

    // Validar que price sea un número positivo
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'price debe ser un número positivo' });
    }

    const product = { 
      name, 
      description, 
      price, 
      category, 
      stock: stock || 0, 
      manufacturer: manufacturer || '', 
      releaseDate: releaseDate || new Date().toISOString()
    };
    
    const response = await mongodb.getDatabase().db().collection(collectionName).insertOne(product);

    if (response.acknowledged) {
      return res.status(201).json({ id: response.insertedId });
    }
    return res.status(500).json({ error: 'No se pudo crear el producto' });
  } catch (err) {
    console.error('createProduct error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidId(id)) return res.status(400).json({ error: 'ID inválido' });

    const allowed = ['name', 'description', 'price', 'category', 'stock', 'manufacturer', 'releaseDate'];
    const updateDoc = {};
    
    allowed.forEach(k => { 
      if (req.body[k] !== undefined) {
        updateDoc[k] = req.body[k]; 
      }
    });

    // Validar price si está presente
    if (updateDoc.price !== undefined && (typeof updateDoc.price !== 'number' || updateDoc.price < 0)) {
      return res.status(400).json({ error: 'price debe ser un número positivo' });
    }

    if (Object.keys(updateDoc).length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const response = await mongodb.getDatabase().db().collection(collectionName)
      .updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });

    if (response.matchedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    return res.status(200).json({ 
      matchedCount: response.matchedCount, 
      modifiedCount: response.modifiedCount 
    });
  } catch (err) {
    console.error('updateProduct error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidId(id)) return res.status(400).json({ error: 'ID inválido' });

    const response = await mongodb.getDatabase().db().collection(collectionName)
      .deleteOne({ _id: new ObjectId(id) });

    if (response.deletedCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    return res.status(204).end();
  } catch (err) {
    console.error('deleteProduct error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAll, getSingle, createProduct, updateProduct, deleteProduct };