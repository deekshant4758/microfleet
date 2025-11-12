const prisma = require('../prismaClient');

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: { assignedVehicle: true, trips: { take: 2 } }
    });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createDriver = async (req, res) => {
  const { name, license, phone } = req.body;
  try {
    const driver = await prisma.driver.create({
      data: { name, license, phone }
    });
    res.status(201).json(driver);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getDriverById = async (req, res) => {
  const { id } = req.params;
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: parseInt(id, 10) },
      include: { assignedVehicle: true, trips: true }
    });
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDriver = async (req, res) => {
  const { id } = req.params;
  const { name, license, phone, status } = req.body;
  try {
    const driver = await prisma.driver.update({
      where: { id: parseInt(id, 10) },
      data: { name, license, phone, status }
    });
    res.json(driver);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.assignVehicle = async (req, res) => {
  const { id } = req.params;
  const { vehicleId } = req.body;
  try {
    const dId = parseInt(id, 10);
    const vId = vehicleId ? parseInt(vehicleId, 10) : null;
    if (!Number.isInteger(dId) || !Number.isInteger(vId)) {
      return res.status(400).json({ error: 'Invalid driverId or vehicleId' });
    }
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vId } });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    if (vehicle.driverId) return res.status(400).json({ error: 'Vehicle already assigned' });

    const driver = await prisma.driver.update({
      where: { id: dId },
      data: { assignedVehicle: { connect: { id: vId } } },
      include: { assignedVehicle: true }
    });
    res.json(driver);
  } catch (err) {
    console.error('assignVehicle error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.unassignVehicle = async (req, res) => {
  const { id } = req.params;
  try {
    const dId = parseInt(id, 10);
    if (!Number.isInteger(dId)) {
      return res.status(400).json({ error: 'Invalid driver ID format' });
    }
    const driver = await prisma.driver.update({
      where: { id: dId },
      data: { assignedVehicle: { disconnect: true } },
      include: { assignedVehicle: true }
    });
    res.json(driver);
  } catch (err) {
    console.error('unassignVehicle error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.deleteDriver = async (req, res) => {
  const { id } = req.params;
  try {
    const dId = parseInt(id, 10);
    if (!Number.isInteger(dId)) {
      return res.status(400).json({ error: 'Invalid driver ID format' });
    }
    await prisma.driver.delete({ where: { id: dId } });
    res.status(204).send();
  } catch (err) {
    console.error('deleteDriver error:', err);
    res.status(400).json({ error: 'Cannot delete: driver may have active trips' });
  }
};