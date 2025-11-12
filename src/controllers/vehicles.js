const prisma = require('../prismaClient');

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: { driver: true, trips: { take: 2 } }
    });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createVehicle = async (req, res) => {
  const { model, regNumber, capacity } = req.body;
  try {
    const vehicle = await prisma.vehicle.create({
      data: { model, regNumber, capacity: parseInt(capacity, 10) }
    });
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getVehicleById = async (req, res) => {
  const { id } = req.params;
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(id, 10) },
      include: { driver: true, trips: true }
    });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { model, status, capacity } = req.body;
  try {
    const data = { model, status };
    if (capacity !== undefined) {
      data.capacity = parseInt(capacity, 10);
    }

    const vehicle = await prisma.vehicle.update({
      where: { id: parseInt(id, 10) },
      data
    });
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.vehicle.delete({ where: { id: parseInt(id, 10) } });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Cannot delete: vehicle may be in use or have associated trips.' });
  }
};